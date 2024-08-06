import {Component, OnDestroy, OnInit} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Observable, Subscription } from 'rxjs';
import { Store, select } from '@ngrx/store';
import { AppState } from '../../../../../core/reducers';
import { SubheaderService, LayoutConfigService } from '../../../../../core/_base/layout';
import { LayoutUtilsService, MessageType, QueryParamsModel } from '../../../../../core/_base/crud';
import {CheckpointModel} from "../../../../../core/masterData/checkpoint/checkpoint.model";
import {
	selectCheckpointActionLoading,
	selectCheckpointById
} from "../../../../../core/masterData/checkpoint/checkpoint.selector";
import {CheckpointService} from '../../../../../core/masterData/checkpoint/checkpoint.service';
import { BlockService } from '../../../../../core/block/block.service';
import { FloorService } from '../../../../../core/floor/floor.service';
@Component({
  selector: 'kt-add-checkpoint',
  templateUrl: './add-checkpoint.component.html',
  styleUrls: ['./add-checkpoint.component.scss']
})
export class AddCheckpointComponent implements OnInit, OnDestroy {
	datauser = localStorage.getItem("user");
	checkpoint: CheckpointModel;
	CheckpointId$: Observable<string>;
	oldCheckpoint: CheckpointModel;
	selectedTab = 0;
	loading$: Observable<boolean>;
	checkpointForm: FormGroup;
	hasFormErrors = false;
	loading : boolean = false;

	TowerResult: any[] = [];
	TowerResultFiltered: any[] = [];

	FloorResult: any[] = [];
	FloorResultFiltered: any[] = [];

	viewTowerControl = new FormControl()
	viewFloorControl = new FormControl()

	typeOptions = [
		"room",
		"equip",
		"vehicle"
	]

	private subscriptions: Subscription[] = [];
  	constructor(
		private activatedRoute: ActivatedRoute,
		private router: Router,
		private checkpointFB: FormBuilder,
		private subheaderService: SubheaderService,
		private layoutUtilsService: LayoutUtilsService,
		private store: Store<AppState>,
		private service: CheckpointService,
		private layoutConfigService: LayoutConfigService,
		private serviceBlk: BlockService,
		private serviceFlr: FloorService,
	) { }

  	ngOnInit() {
		this.loading$ = this.store.pipe(select(selectCheckpointActionLoading));
		const routeSubscription =  this.activatedRoute.params.subscribe(params => {
			const id = params.id;
			if (id) {
				this.store.pipe(select(selectCheckpointById(id))).subscribe(res => {
					if (res) {
						this.checkpoint = res;
						this.oldCheckpoint = Object.assign({}, this.checkpoint);
						this.initCheckpoint();
					}
				});
			} else {
				this.checkpoint = new CheckpointModel();
				this.checkpoint.clear();
				this.initCheckpoint();
			}
		});
		this.subscriptions.push(routeSubscription);
  	}

	initCheckpoint() {
		this.createForm();
		this.getListTower();

		if(this.checkpoint.twr){
			this.getListFloor(this.checkpoint.twr._id)
		}
	}

	createForm() {
		if (this.checkpoint._id){
			this.checkpointForm = this.checkpointFB.group({
				code: [this.checkpoint.code, Validators.required],
				name : [this.checkpoint.name, Validators.required],
				twr : [this.checkpoint.twr, Validators.required],
				flr: [this.checkpoint.flr, Validators.required],
				type: [this.checkpoint.type, Validators.required],
			});

			this.viewTowerControl.setValue(this.checkpoint.twr.nmblk.toUpperCase())
			this.viewFloorControl.setValue(this.checkpoint.flr.nmflr.toUpperCase())
		}else{
			this.checkpointForm = this.checkpointFB.group({
				code: ["", Validators.required],
				name: ["", Validators.required],
				twr: ["", Validators.required],
				flr: ["", Validators.required],
				type: ["", Validators.required],
			});
		}
	}

	getListTower() {
		const queryParams = new QueryParamsModel(
			null,
			"asc",
			null,
			1,
			1000
		);

		this.serviceBlk.getListBlock(queryParams).subscribe(
			res => {
				this.TowerResult = res.data;
				this.TowerResultFiltered = res.data;
				// console.log(this.blockGroupResult)
			}
		);
	}

	filterQueryFloor(towerId) {

		const temp = {
			blk: towerId
		}

		return temp
	}

	getListFloor(towerId) {
		const queryParams = new QueryParamsModel(
			null,
			"asc",
			null,
			1,
			1000
		);

		this.serviceFlr.getListFloor(queryParams).subscribe(
			res => {
				const filtered = res.data.filter(item => item.blk._id === towerId)
				this.FloorResult = filtered
				this.FloorResultFiltered = filtered
			}
		)
	}

	goBackWithId() {
		const url = `/checkpoint`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}
	refreshCheckpoint(isNew: boolean = false, id:string = "") {
		let url = this.router.url;
		if (!isNew) {
			this.router.navigate([url], { relativeTo: this.activatedRoute });
			return;
		}
		url = `/checkpoint/edit/${id}`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}
	onSubmit(withBack: boolean = false) {
		this.hasFormErrors = false;
		const controls = this.checkpointForm.controls;
		if (this.checkpointForm.invalid) {
			Object.keys(controls).forEach(controlName =>
				controls[controlName].markAsTouched()
			);

			this.hasFormErrors = true;
			this.selectedTab = 0;
			return;
		}

		this.loading = true;
		const editedCheckpoint = this.prepareCheckpoint();
		if (editedCheckpoint._id) {
			this.updateCheckpoint(editedCheckpoint, withBack);
			return;
		}
		this.addCheckpoint(editedCheckpoint, withBack);
	}

	prepareCheckpoint(): CheckpointModel {
		const controls = this.checkpointForm.controls;
		const _checkpoint = new CheckpointModel();
		_checkpoint.clear();
		_checkpoint._id = this.checkpoint._id;
		_checkpoint.code = controls.code.value;
		_checkpoint.name = controls.name.value.toLowerCase();
		_checkpoint.twr = controls.twr.value;
		_checkpoint.flr = controls.flr.value;
		_checkpoint.type = controls.type.value;
		return _checkpoint;
	}

	addCheckpoint( _checkpoint: CheckpointModel, withBack: boolean = false) {
		const addSubscription = this.service.createCheckpoint(_checkpoint).subscribe(
			res => {
				const message = `New checkpoint successfully has been added.`;
				this.layoutUtilsService.showActionNotification(message, MessageType.Create, 5000, true, true);
				const url = `/checkpoint`;
				this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
			},
			err => {
				console.error(err);
				const message = 'Error while adding checkpoint | ' + err.statusText;
				this.layoutUtilsService.showActionNotification(message, MessageType.Create, 5000, true, false);
			}
		);
		this.subscriptions.push(addSubscription);
	}

	updateCheckpoint(_checkpoint: CheckpointModel, withBack: boolean = false) {
		const addSubscription = this.service.updateCheckpoint(_checkpoint).subscribe(
			res => {
				const message = `Checkpoint successfully has been saved.`;
				this.layoutUtilsService.showActionNotification(message, MessageType.Update, 5000, true, true);
				const url = `/checkpoint`;
				this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
			},
			err => {
				console.error(err);
				const message = 'Error while adding checkpoint | ' + err.statusText;
				this.layoutUtilsService.showActionNotification(message, MessageType.Update, 5000, true, false);
			}
		);
		this.subscriptions.push(addSubscription);
	}

	getComponentTitle() {
		let result = 'Create Checkpoint';
		if (!this.checkpoint || !this.checkpoint._id) {
			return result;
		}

		result = `Edit Checkpoint`;
		return result;
	}

	onAlertClose($event) {
		this.hasFormErrors = false;
	}

  	ngOnDestroy() {
		this.subscriptions.forEach(sb => sb.unsubscribe());
	}

	_filterAuto(e, type) {
		if(type === 'tower'){
			this.TowerResultFiltered = this.TowerResult.filter(item => item.nmblk.toLowerCase().includes(e.target.value.toLowerCase()))
		}
		if(type === 'floor'){
			this.FloorResultFiltered = this.FloorResult.filter(item => item.nmflr.toLowerCase().includes(e.target.value.toLowerCase()))
		}
	}

	setItem(item, type) {
		const controls = this.checkpointForm.controls

		controls[type].setValue(item)

		if(type === 'twr'){
			this.viewTowerControl.setValue(item.nmblk.toUpperCase())
			this.getListFloor(item._id)
		}

		if(type === "flr"){
			this.viewFloorControl.setValue(item.nmflr.toUpperCase())
		}
	}
}
