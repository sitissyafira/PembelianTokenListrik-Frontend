import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable, Subscription } from 'rxjs';
import { Store, select } from '@ngrx/store';
import { AppState } from '../../../../../core/reducers';
import { SubheaderService, LayoutConfigService } from '../../../../../core/_base/layout';
import {LayoutUtilsService, MessageType, QueryParamsModel} from '../../../../../core/_base/crud';
import {
	selectPowerMeterActionLoading,
	selectPowerMeterById
} from "../../../../../core/power/meter/meter.selector";
import {PowerMeterModel} from "../../../../../core/power/meter/meter.model";
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
import {PowerRateService} from "../../../../../core/power/rate/rate.service";
import {QueryPowerRateModel} from "../../../../../core/power/rate/queryrate.model";
import {PowerMeterService} from '../../../../../core/power';

@Component({
  selector: 'kt-add-meter',
  templateUrl: './add-meter.component.html',
  styleUrls: ['./add-meter.component.scss']
})
export class AddMeterComponent implements OnInit, OnDestroy {
	// Public properties
	powerMeter: PowerMeterModel;
	powerMeterId$: Observable<string>;
	oldPowerMeter: PowerMeterModel;
	selectedTab = 0;
	loading$: Observable<boolean>;
	powerMeterForm: FormGroup;
	hasFormErrors = false;
	mustNumber = false;
	unitResult: any[] = [];
	rateResult: any[] = [];
	floorResult: any[] = [];
	blockResult: any[] = [];
	blockGroupResult: any[] = [];
	buildingResult: any[] = [];
	selection = new SelectionModel<PowerMeterModel>(true, []);
	loadingForm : boolean
	loading  : boolean  = false
	// Private properties

	private loadingData = {
		block : false,
		floor : false,
		unit : false,	
	}
	private subscriptions: Subscription[] = [];
	constructor(
		private activatedRoute: ActivatedRoute,
		private router: Router,
		private powerMeterFB: FormBuilder,
		private subheaderService: SubheaderService,
		private layoutUtilsService: LayoutUtilsService,
		private store: Store<AppState>,
		private serviceRate: PowerRateService,
		private serviceUnit: UnitService,
		private serviceFloor: FloorService,
		private serviceBlkGrp: BlockGroupService,
		private serviceBlk: BlockService,
		private serviceBld: BuildingService,
		private layoutConfigService: LayoutConfigService,
		private cd: ChangeDetectorRef,
		private service: PowerMeterService
	) { }
	ngOnInit() {
		this.loading$ = this.store.pipe(select(selectPowerMeterActionLoading));
		const routeSubscription =  this.activatedRoute.params.subscribe(params => {
		this.powerMeter = new PowerMeterModel();
		this.powerMeter.clear();
		this.initPowerMeter();
		});
		this.subscriptions.push(routeSubscription);
	}
	initPowerMeter() {
		this.loadRateList();
		this.loadBlockList()
		this.createForm();
	}

	createForm() {
			this.powerMeterForm = this.powerMeterFB.group({
				nmmtr: ["", Validators.required],
				unt: ["", Validators.required],
				flr: ["", Validators.required],
				blk: ["", Validators.required],
				unit : [""],
				rte: ["", Validators.required],
			});
	}

	loadRateList(){
		this.selection.clear();
		const queryParams = new QueryPowerRateModel(
			null,
			"asc",
			null,
			1,
			1000
		);
		this.serviceRate.getListPowerRate(queryParams).subscribe(
			res => {
				this.rateResult = res.data;
			}
		);
	}

	goBackWithId() {
		const url = `/power-management/power/meter`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}
	refreshPowerMeter(isNew: boolean = false, id:string = "") {
		let url = this.router.url;
		if (!isNew) {
			this.router.navigate([url], { relativeTo: this.activatedRoute });
			return;
		}

		url = `/power-management/power/meter/edit/${id}`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}

	onSubmit(withBack: boolean = false) {
		this.hasFormErrors = false;
		this.mustNumber = false;
		const controls = this.powerMeterForm.controls;
		
		// console.log(controls.nmmtr.value != )
		/** check form */
		
		if (this.powerMeterForm.invalid) {
			Object.keys(controls).forEach(controlName =>
				controls[controlName].markAsTouched()
			);

			this.hasFormErrors = true;
			this.selectedTab = 0;
			return;
		}

		this.loading = true
		const editedPowerMeter = this.preparePowerMeter();
		this.addPowerMeter(editedPowerMeter, withBack);
	}
	preparePowerMeter(): PowerMeterModel {
		const controls = this.powerMeterForm.controls;
		const _powerMeter = new PowerMeterModel();
		_powerMeter.clear();
		_powerMeter._id = this.powerMeter._id;
		_powerMeter.nmmtr = controls.nmmtr.value;
		_powerMeter.unt = controls.unt.value;
		_powerMeter.rte = controls.rte.value;
		_powerMeter.unit = controls.unit.value.toLowerCase();
		return _powerMeter;
	}
	addPowerMeter( _powerMeter: PowerMeterModel, withBack: boolean = false) {
		const addSubscription = this.service.createPowerMeter(_powerMeter).subscribe(
			res => {
				const message = `New electricity meter successfully has been added.`;
				this.layoutUtilsService.showActionNotification(message, MessageType.Create, 5000, true, true);
				const url = `/power-management/power/meter`;
				this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
			},
			err => {
				console.error(err);
				const message = 'Error while adding electricity meter | ' + err.statusText;
				this.layoutUtilsService.showActionNotification(message, MessageType.Create, 5000, true, false);
			}
		);
		this.subscriptions.push(addSubscription);
	}


	getComponentTitle() {
		let result = 'Create Electricity Meter';
		return result;
	}
	onAlertClose($event) {
		this.hasFormErrors = false;
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
		this.serviceUnit.findUnitforPwr(flrid).subscribe(
			res => {
				this.unitResult = res.data;
				this.loadingData.unit = false;
				this.cd.markForCheck();
			}
		);
	}

	unitChange(id){
		this.loading = true;
		const controls = this.powerMeterForm.controls;
		this.serviceUnit.getUnitById(id).subscribe(
			res => {
				controls.unit.setValue(res.data.cdunt);
				this.loading = false;
		});
	}
	ngOnDestroy() {
		this.subscriptions.forEach(sb => sb.unsubscribe());
	}

}
