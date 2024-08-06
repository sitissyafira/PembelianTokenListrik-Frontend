import { Component, OnInit, OnDestroy } from '@angular/core';
import {BehaviorSubject, Observable, Subscription} from 'rxjs';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {BuildingModel} from '../../../../core/building/building.model';
import {ActivatedRoute, Router} from '@angular/router';
import {LayoutConfigService, SubheaderService} from '../../../../core/_base/layout';
import {BodyModel, LayoutUtilsService, MessageType, QueryParamsModel} from '../../../../core/_base/crud';
import {select, Store} from '@ngrx/store';
import {AppState} from '../../../../core/reducers';
import {BuildingOnServerCreated} from '../../../../core/building/building.action';
import {SelectionModel} from '@angular/cdk/collections';
import {BuildingDataSource} from '../../../../core/building/building.datasource';
import { BlockService} from '../../../../core/block/block.service';
import {BlockGroupService} from '../../../../core/blockgroup/blockgroup.service';
import {selectBlockGroupActionLoading, selectLastCreatedBlockGroupId} from '../../../../core/blockgroup/blockgroup.selector';
import {BlockModel} from '../../../../core/block/block.model';
import {QueryBlockModel} from '../../../../core/block/queryblock.model';
import {BlockOnServerCreated} from '../../../../core/block/block.action';
import {selectLastCreatedBlockId} from '../../../../core/block/block.selector';

@Component({
  selector: 'kt-add-building',
  templateUrl: './add-building.component.html',
  styleUrls: ['./add-building.component.scss']
})
export class AddBuildingComponent implements OnInit, OnDestroy {
	dataSource: BuildingDataSource;
	building: BuildingModel;
	buildingId$: Observable<string>;
	oldBuilding: BuildingModel;
	selectedTab = 0;
	loading$: Observable<boolean>;
	buildingForm: FormGroup;
	hasFormErrors = false;
	selection = new SelectionModel<BuildingModel>(true, []);
	blockResult: any[] = [];
	blockGroupResult: any[] = [];
	blockgroupNotSelected: boolean = true;
	// Private properties
	private subscriptions: Subscription[] = [];

	constructor(
		private activatedRoute: ActivatedRoute,
		private router: Router,
		private buildingFB: FormBuilder,
		private subheaderService: SubheaderService,
		private service: BlockService,
		private serviceBlkGrp: BlockGroupService,
		private layoutUtilsService: LayoutUtilsService,
		private store: Store<AppState>,
		private layoutConfigService: LayoutConfigService
	) { }
	ngOnInit() {
		this.loading$ = this.store.pipe(select(selectBlockGroupActionLoading));
		const routeSubscription =  this.activatedRoute.params.subscribe(params => {
			this.building = new BuildingModel();
			this.building.clear();
			this.initBuilding();
		});
		this.subscriptions.push(routeSubscription);
	}
	ngOnDestroy() {
		this.subscriptions.forEach(sb => sb.unsubscribe());
	}
	initBuilding() {
		this.createForm();
		this.loadBlockGroupList();
		this.subheaderService.setTitle('Add building');
		this.subheaderService.setBreadcrumbs([
			{ title: 'Building', page: `building` },
			{ title: 'Add Buiding',  page: `building/add` },
		]);
	}
	createForm() {
		this.buildingForm = this.buildingFB.group({
			nmbld : ["", Validators.required],
			addrbld: ["", Validators.required],
			grpblk: ["", Validators.required],
			blk: [{ "value" : "", "disabled" : true}, Validators.required]
		});
	}
	goBackWithId() {
		const url = `/building`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}

	refreshBuilding(isNew: boolean = false, id:string = "") {
		let url = this.router.url;
		if (!isNew) {
			this.router.navigate([url], { relativeTo: this.activatedRoute });
			return;
		}

		url = `/building/edit/${id}`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}

	reset() {
		this.building = Object.assign({}, this.oldBuilding);
		this.createForm();
		this.hasFormErrors = false;
		this.buildingForm.controls.blk.disable();
		this.buildingForm.markAsPristine();
		this.buildingForm.markAsUntouched();
		this.buildingForm.updateValueAndValidity();
	}
	onSubmit(withBack: boolean = false) {
		this.hasFormErrors = false;
		const controls = this.buildingForm.controls;
		/** check form */
		if (this.buildingForm.invalid) {
			Object.keys(controls).forEach(controlName =>
				controls[controlName].markAsTouched()
			);

			this.hasFormErrors = true;
			this.selectedTab = 0;
			return;
		}
		const preparedBuilding = this.prepareBuilding();
		this.addBuilding(preparedBuilding, withBack);
	}
	loadBlockList(grpid) {
		this.selection.clear();
		const queryParams = new QueryBlockModel(
			null,
			"asc",
			"grpnm",
			1,
			10
		);
		const queryBody = new BodyModel(
			{grpid: grpid},
			1,
			10
		);
		this.service.findBlockByParent(grpid).subscribe(
			res => {
				this.blockResult = res.data;
			}
		);
	}
	loadBlockGroupList() {
		this.selection.clear();
		const queryParams = new QueryParamsModel(
			null,
			"asc",
			"grpnm",
			1,
			10
		);
		this.serviceBlkGrp.getListBlockGroup(queryParams).subscribe(
			res => {
				this.blockGroupResult = res.data;
			}
		);
	}
	blockgroupChange(item){
		if(item){
			this.loadBlockList(item);
			this.buildingForm.controls.blk.enable();
		}
	};
	prepareBuilding(): BuildingModel {
		const controls = this.buildingForm.controls;
		const _building = new BuildingModel();
		_building.clear();
		_building.nmbld = controls.nmbld.value;
		_building.addrbld = controls.addrbld.value;
		_building.blk = controls.blk.value;
		return _building;
	}
	addBuilding(_buiding: BuildingModel, withBack: boolean = false) {
		this.store.dispatch(new BuildingOnServerCreated({ building: _buiding }));
		const addSubscription = this.store.pipe(select(selectLastCreatedBlockId)).subscribe(newId => {
			console.log(newId);
			const message = `New building successfully has been added.`;
			this.layoutUtilsService.showActionNotification(message, MessageType.Create, 5000, true, true);
			if (newId) {
				if (withBack) {
					this.goBackWithId();
				} else {
					this.refreshBuilding(true, newId);
				}
			}
		});
		this.subscriptions.push(addSubscription);
	}
	getComponentTitle() {
		let result = 'Create building';

		return result;
	}
	onAlertClose($event) {
		this.hasFormErrors = false;
	}

}
