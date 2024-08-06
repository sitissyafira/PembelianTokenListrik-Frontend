import {ChangeDetectorRef, Component, OnDestroy, OnInit} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
// RxJS
import { BehaviorSubject, Observable, of, Subscription } from 'rxjs';
// NGRX
import { Store, select } from '@ngrx/store';
import { Update } from '@ngrx/entity';
import { AppState } from '../../../../../core/reducers';
// Layout
import { SubheaderService, LayoutConfigService } from '../../../../../core/_base/layout';
import {LayoutUtilsService, MessageType, QueryParamsModel} from '../../../../../core/_base/crud';
import {
	selectLastCreatedWaterMeterId,
	selectWaterMeterActionLoading,
	selectWaterMeterById
} from "../../../../../core/water/meter/meter.selector";

import {WaterMeterModel} from "../../../../../core/water/meter/meter.model";
import {UnitService} from "../../../../../core/unit/unit.service";
import {FloorService} from "../../../../../core/floor/floor.service";
import {BlockGroupService} from "../../../../../core/blockgroup/blockgroup.service";
import {BlockService} from "../../../../../core/block/block.service";
import {BuildingService} from "../../../../../core/building/building.service";
import {QueryBlockModel} from "../../../../../core/block/queryblock.model";
import {QueryBuildingModel} from "../../../../../core/building/querybuilding.model";
import {QueryFloorModel} from "../../../../../core/floor/queryfloor.model";
import {SelectionModel} from "@angular/cdk/collections";
import {QueryUnitModel} from "../../../../../core/unit/queryunit.model";
import {WaterRateService} from "../../../../../core/water/rate/rate.service";
import {QueryWaterRateModel} from "../../../../../core/water/rate/queryrate.model";
import {WaterMeterService} from '../../../../../core/water/meter/meter.service';

@Component({
  selector: 'kt-edit-meter',
  templateUrl: './edit-meter.component.html',
  styleUrls: ['./edit-meter.component.scss']
})
export class EditMeterComponent implements OnInit, OnDestroy {
	waterMeter: WaterMeterModel;
	waterMeterId$: Observable<string>;
	oldWaterMeter: WaterMeterModel;
	selectedTab = 0;
	loading$: Observable<boolean>;
	waterMeterForm: FormGroup;
	hasFormErrors = false;
	unitResult: any[] = [];
	rateResult: any[] = [];
	floorResult: any[] = [];
	blockResult: any[] = [];
	blockGroupResult: any[] = [];
	buildingResult: any[] = [];
	loadingForm: boolean;
	loading : boolean = false;
	selection = new SelectionModel<WaterMeterModel>(true, []);
	// Private properties
	private subscriptions: Subscription[] = [];
	private loadingData = {
		block : false,
		floor : false,
		unit : false,	
	}
	constructor(
		private activatedRoute: ActivatedRoute,
		private router: Router,
		private waterMeterFB: FormBuilder,
		private subheaderService: SubheaderService,
		private layoutUtilsService: LayoutUtilsService,
		private store: Store<AppState>,
		private serviceRate: WaterRateService,
		private serviceUnit: UnitService,
		private serviceFloor: FloorService,
		private serviceBlkGrp: BlockGroupService,
		private serviceBlk: BlockService,
		private serviceBld: BuildingService,
		private cd: ChangeDetectorRef,
		private layoutConfigService: LayoutConfigService,
		private service: WaterMeterService
	) { }
	ngOnInit() {
		this.loading$ = this.store.pipe(select(selectWaterMeterActionLoading));
		const routeSubscription =  this.activatedRoute.params.subscribe(params => {
			const id = params.id;
			if (id) {
				this.store.pipe(select(selectWaterMeterById(id))).subscribe(res => {
					if (res) {
						this.loadingForm = true
						this.waterMeter = res;
						this.oldWaterMeter = Object.assign({}, this.waterMeter);
						this.initWaterMeter();
					}
				});
			}
		});
		this.subscriptions.push(routeSubscription);
	}

	initWaterMeter() {
		this.loadRateList();
		this.loadBlockList();
		this.loadFloorList(this.waterMeter.unt.flr.blk._id);
		this.loadUnitList(this.waterMeter.unt.flr._id);
		this.createForm();
	}
	
	createForm() {
		if(this.waterMeter._id){
			this.waterMeterForm = this.waterMeterFB.group({
				nmmtr: [this.waterMeter.nmmtr, Validators.required],
				unt: [{value: this.waterMeter.unt._id, disabled : true}],
				flr: [{ value : this.waterMeter.unt.flr._id, disabled : true}],
				blk: [{ value : this.waterMeter.unt.flr.blk._id, disabled : true}],
				rte: [this.waterMeter.rte._id, Validators.required],
				unit : [this.waterMeter.unit],
			});
		}
	}

	loadRateList(){
		this.selection.clear();
		const queryParams = new QueryWaterRateModel(
			null,
			"asc",
			null,
			1,
			1000
		);
		this.serviceRate.getListWaterRate(queryParams).subscribe(
			res => {
				this.rateResult = res.data;
			}
		);
	}


	loadBlockList() {
		this.loadingData.block = true;
		this.selection.clear();
		const queryParams = new QueryBlockModel(
			null,
			"asc",
			null,
			1,
			1000
		);
		this.serviceBlk.getListBlock(queryParams).subscribe(
			res => {
				this.blockResult = res.data;
				this.loadingData.block = false;
				this.cd.markForCheck();
			}
		);
	}

	blkChange(id){
		if(id){
			this.loadFloorList(id);
			this.loadUnitList(id);
		}
	}

	loadFloorList(blkid){
		this.loadingData.floor = true;
		this.selection.clear();
		const queryParams = new QueryFloorModel(
			null,
			"asc",
			null,
			1,
			1000
		);
		this.serviceFloor.findFloorByParent(blkid).subscribe(
			res => {
				this.floorResult = res.data;
				this.loadingData.floor = false;
				this.cd.markForCheck();
			}
		);
	}

	flrChange(id){
		if(id){
			this.loadUnitList(id);
		}
	}
	

	loadUnitList(flrid){
		this.loadingData.unit = true;
		this.selection.clear();
		const queryParams = new QueryUnitModel(
			null,
			"asc",
			null,
			1,
			1000
		);
		this.serviceUnit.findUnitByParent(flrid).subscribe(
			res => {
				this.unitResult = res.data;
				this.loadingData.unit = false;
				this.loadingForm = false;
				this.cd.markForCheck();
			}
		);
	}

	unitChange(id){
		const controls = this.waterMeterForm.controls;
		this.serviceUnit.getUnitById(id).subscribe(
			res => {
				controls.unit.setValue(res.data.cdunt);
		});
	}

	goBackWithId() {
		const url = `/water-management/water/meter`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}

	refreshWaterMeter(isNew: boolean = false, id:string = "") {
		let url = this.router.url;
		if (!isNew) {
			this.router.navigate([url], { relativeTo: this.activatedRoute });
			return;
		}

		url = `/water-management/water/meter/edit/${id}`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}

	onSubmit(withBack: boolean = false) {
		this.hasFormErrors = false;
		const controls = this.waterMeterForm.controls;
		/** check form */
		if (this.waterMeterForm.invalid) {
			Object.keys(controls).forEach(controlName =>
				controls[controlName].markAsTouched()
			);

			this.hasFormErrors = true;
			this.selectedTab = 0;
			return;
		}

		this.loading = true;
		const editedWaterMeter = this.prepareWaterMeter();
		this.updateWaterMeter(editedWaterMeter, withBack);
	}

	prepareWaterMeter(): WaterMeterModel {
		const controls = this.waterMeterForm.controls;
		const _waterMeter = new WaterMeterModel();
		_waterMeter.clear();
		_waterMeter._id = this.waterMeter._id;
		_waterMeter.nmmtr = controls.nmmtr.value;
		_waterMeter.unt = controls.unt.value;
		_waterMeter.rte = controls.rte.value;
		_waterMeter.unit = controls.unit.value.toLowerCase();	
		return _waterMeter;
	}
	
	updateWaterMeter(_waterMeter: WaterMeterModel, withBack: boolean = false){
		const addSubscription = this.service.updateWaterMeter(_waterMeter).subscribe(
			res => {
				const message = `Water meter successfully has been saved.`;
				this.layoutUtilsService.showActionNotification(message, MessageType.Create, 5000, true, true);
				const url = `/water-management/water/meter`;
				this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
			},
			err => {
				console.error(err);
				const message = 'Error while saving water meter | ' + err.statusText;
				this.layoutUtilsService.showActionNotification(message, MessageType.Create, 5000, true, false);
			}
		);
		this.subscriptions.push(addSubscription);
	}
	getComponentTitle() {
		let result = `Edit Water Meter`;
		return result;
	}
	onAlertClose($event) {
		this.hasFormErrors = false;
	}
	

	
	ngOnDestroy() {
		this.subscriptions.forEach(sb => sb.unsubscribe());
	}

}
