import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import {BehaviorSubject, Observable, Subscription} from 'rxjs';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {BuildingModel} from '../../../../core/building/building.model';
import {ActivatedRoute, Router} from '@angular/router';
import {LayoutConfigService, SubheaderService} from '../../../../core/_base/layout';
import {BodyModel, LayoutUtilsService, MessageType, QueryParamsModel} from '../../../../core/_base/crud';
import {select, Store} from '@ngrx/store';
import {AppState} from '../../../../core/reducers';
import {
	selectFloorActionLoading,
	selectFloorById,
	selectLastCreatedFloorId
} from '../../../../core/floor/floor.selector'
import {BuildingOnServerCreated, BuildingUpdated} from '../../../../core/building/building.action';
import {Update} from '@ngrx/entity';
import {SelectionModel} from '@angular/cdk/collections';
import {QueryBlockModel} from '../../../../core/block/queryblock.model';
import {BlockService} from '../../../../core/block/block.service';
import {FloorModel} from '../../../../core/floor/floor.model';
import {BlockGroupService} from '../../../../core/blockgroup/blockgroup.service';
import {BuildingService} from '../../../../core/building/building.service';
import {FloorService} from '../../../../core/floor/floor.service';
import {QueryBuildingModel} from '../../../../core/building/querybuilding.model';
import {FloorUpdated} from '../../../../core/floor/floor.action';

@Component({
  selector: 'kt-edit-floor',
  templateUrl: './edit-floor.component.html',
  styleUrls: ['./edit-floor.component.scss']
})
export class EditFloorComponent implements OnInit,OnDestroy {
	floor: FloorModel;
	floorId$: Observable<string>;
	oldFloor: FloorModel;
	selectedTab = 0;
	loading$: Observable<boolean>;
	floorForm: FormGroup;
	selection = new SelectionModel<FloorModel>(true, []);
	hasFormErrors = false;
	blockGroupResult: any[] = [];
	blockResult: any[] = [];
	buildingResult: any[] =[];
	loadingForm: boolean;
	loading : boolean = false;

	// Autocomplete Filter and Options
	blockResultFiltered = [];
	viewBlockResult = new FormControl();
	
	// Private properties
	private subscriptions: Subscription[] = [];
	constructor(
		private activatedRoute: ActivatedRoute,
		private router: Router,
		private floorFB: FormBuilder,
		private subheaderService: SubheaderService,
		private layoutUtilsService: LayoutUtilsService,
		private store: Store<AppState>,
		private service: FloorService,
		private serviceBlk: BlockService,
		private serviceBlkGrp: BlockGroupService,
		private serviceBld: BuildingService,
		private layoutConfigService: LayoutConfigService,
		private cdr: ChangeDetectorRef
	) { }
	ngOnInit() {
		this.loadingForm = true;
		this.loading$ = this.store.pipe(select(selectFloorActionLoading));
		const routeSubscription =  this.activatedRoute.params.subscribe(params => {
			const id = params.id;
			if(id){
				this.store.pipe(select(selectFloorById(id))).subscribe(res => {
					if (res) {
						this.floor = res;

						// Set input value
						this.viewBlockResult.setValue(`${res.blk.cdblk.toLocaleUpperCase()} - ${this._titleCase(res.blk.nmblk)}`);
						this._filterBlockList(`${res.blk.cdblk.toLocaleLowerCase()} - ${res.blk.nmblk.toLocaleLowerCase()}`);
						
						this.oldFloor = Object.assign({}, this.floor);
						this.initFloor();
					}
				});
			}
		});
		this.subscriptions.push(routeSubscription);
	}
	
	initFloor(){
		this.createForm();
		this.loadBlockGroupList();
		this.loadBuildingList(this.floor.blk._id);
		this.loadBlockList(this.floor.blk.grpid._id);
		
	}
	createForm() {
		this.floorForm = this.floorFB.group({
			cdflr : [this.floor.cdflr, Validators.required],
			nmflr : [this.floor.nmflr, Validators.required],
			grpblk: [this.floor.blk.grpid._id, Validators.required],
			blk: [{ "value" : this.floor.blk._id, "disabled" : false}, Validators.required],
		});
	}
	
	async loadBlockGroupList() {
		this.selection.clear();
		const queryParams = new QueryParamsModel(
			null,
			"asc",
			null,
			1,
			1000
		);
		this.serviceBlkGrp.getListBlockGroup(queryParams).subscribe(
			res => {
				this.blockGroupResult = res.data;
			}
		);
	}

	/**
	 * @param value
	 */
	_setBlockValue(value) {
		this.floorForm.patchValue({ blk: value._id });
	}

	// Remove selected value on keydown
	_onKeyup(e: any) {
		// Unset the form value
		this.floorForm.patchValue({ blk: undefined });

		this._filterBlockList(e.target.value);
	}

	_filterBlockList(text: string) {
		this.blockResultFiltered = this.blockResult.filter(i => {
			const filterText = `${i.cdblk.toLocaleLowerCase()} - ${i.nmblk.toLocaleLowerCase()}`;

			if(filterText.includes(text.toLocaleLowerCase())) return i;
		});
	}

	_titleCase(text: string) {
		const arrStr = text.split(' ');
		const complete = [];

		if(arrStr.length > 1) {
			arrStr.forEach(i => {
				const x = i.split('');
				x[0] = x[0].toLocaleUpperCase();
				complete.push(x.join(''));
			});

			
			return complete.join(' ');
		}

		const x = text.split('');
		x[0] = x[0].toLocaleUpperCase();

		return x.join('');
	}
	
	async loadBlockList(grpid) {
		this.selection.clear();
		const queryParams = new QueryBlockModel(
			null,
			"asc",
			null,
			1,
			1000
		);
		this.serviceBlk.findBlockByParent(grpid).subscribe(
			res => {
				this.loadingForm = false;
				this.blockResult = res.data;
				
				this.cdr.markForCheck();
			}
		);
	}

	async loadBuildingList(blkid){
		this.selection.clear();
		const queryParams = new QueryBuildingModel(
			null,
			"asc",
			null,
			1,
			1000
		);
		this.serviceBld.findBuildingByParent(blkid).subscribe(
			res => {
				// this.loadingForm = false;
				this.buildingResult = res.data;

				this.cdr.markForCheck();
			}
		);
	}
	goBackWithId() {
		const url = `/building`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}
	refreshFloor(isNew: boolean = false, id:string = "") {
		let url = this.router.url;
		if (!isNew) {
			this.router.navigate([url], { relativeTo: this.activatedRoute });
			return;
		}

		url = `/floor/edit/${id}`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}
	
	onSubmit(withBack: boolean = false) {
		this.hasFormErrors = false;
		const controls = this.floorForm.controls;
		/** check form */
		if (this.floorForm.invalid) {
			Object.keys(controls).forEach(controlName => {
					if(controlName === 'blk' && !controls[controlName].value) {
						this.viewBlockResult.setErrors({ 'incorrect': true });
					}
					else
						controls[controlName].markAsTouched();
				}
			);

			this.hasFormErrors = true;
			this.selectedTab = 0;
			return;
		}
		this.loading = true;
		const preparedFloor = this.prepareFloor();
		this.updateFloor(preparedFloor, withBack);
	}
	prepareFloor(): FloorModel {
		const controls = this.floorForm.controls;
		const _floor = new FloorModel();
		_floor.clear();
		_floor._id = this.floor._id;
		_floor.cdflr = controls.cdflr.value.toLowerCase();
		_floor.nmflr = controls.nmflr.value.toLowerCase();
		_floor.blk = controls.blk.value;
		return _floor;
	}
	updateFloor(_floor: FloorModel, withBack: boolean = false) {
		const editSubscription = this.service.updateFloor(_floor).subscribe(
			res => {
				const message = `Floor successfully has been saved.`;
				this.layoutUtilsService.showActionNotification(message, MessageType.Create, 5000, true, true);
				if (withBack) {
					this.goBackWithId();
				} else {
					this.refreshFloor(false);
					
				}
				const url = `/floor`;
				this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
			},
			err => {
				console.error(err);
				const message = 'Error while saving floor | ' + err.statusText;
				this.layoutUtilsService.showActionNotification(message, MessageType.Create, 5000, true, false);
			}
		);
		this.subscriptions.push(editSubscription);
	}
	getComponentTitle() {
		let result = 'Edit Floor';
		return result;
	}
	blkChange(item){
		if(item){
			this.loadBuildingList(item);
			this.floorForm.controls.bld.enable();
		}
	}
	onAlertClose($event) {
		this.hasFormErrors = false;
	}
	ngOnDestroy(){
		this.subscriptions.forEach(sb => sb.unsubscribe());
	}

}
