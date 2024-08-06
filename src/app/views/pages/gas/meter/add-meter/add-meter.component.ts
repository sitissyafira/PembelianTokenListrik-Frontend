// Angular
import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
// RxJS
import { Observable, Subscription } from 'rxjs';
// NGRX
import { Store, select } from '@ngrx/store';
import { AppState } from '../../../../../core/reducers';
// Layout
import { SubheaderService, LayoutConfigService } from '../../../../../core/_base/layout';
import {LayoutUtilsService, MessageType, QueryParamsModel} from '../../../../../core/_base/crud';
import {
	selectGasMeterActionLoading,
	selectGasMeterById
} from "../../../../../core/gas/meter/meter.selector";
import {GasMeterModel} from "../../../../../core/gas/meter/meter.model";
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
import {GasRateService} from "../../../../../core/gas/rate/rate.service";
import {QueryGasRateModel} from "../../../../../core/gas/rate/queryrate.model";
import { GasMeterService } from '../../../../../core/gas/meter/meter.service';


@Component({
  selector: 'kt-add-meter',
  templateUrl: './add-meter.component.html',
  styleUrls: ['./add-meter.component.scss']
})
export class AddMeterComponent implements OnInit, OnDestroy {
	// Public properties
	gasMeter: GasMeterModel;
	gasMeterId$: Observable<string>;
	oldGasMeter: GasMeterModel;
	selectedTab = 0;
	loading$: Observable<boolean>;
	gasMeterForm: FormGroup;
	hasFormErrors = false;
	unitResult: any[] = [];
	rateResult: any[] = [];
	floorResult: any[] = [];
	blockResult: any[] = [];
	blockGroupResult: any[] = [];
	buildingResult: any[] = [];
	loadingForm: boolean;
	selection = new SelectionModel<GasMeterModel>(true, []);
	// Private properties
	private subscriptions: Subscription[] = [];
	constructor(
		private activatedRoute: ActivatedRoute,
		private router: Router,
		private gasMeterFB: FormBuilder,
		private subheaderService: SubheaderService,
		private layoutUtilsService: LayoutUtilsService,
		private store: Store<AppState>,
		private serviceRate: GasRateService,
		private serviceUnit: UnitService,
		private serviceFloor: FloorService,
		private serviceBlkGrp: BlockGroupService,
		private serviceBlk: BlockService,
		private serviceBld: BuildingService,
		private layoutConfigService: LayoutConfigService,
		private service: GasMeterService
	) { }
	ngOnInit() {
		this.loading$ = this.store.pipe(select(selectGasMeterActionLoading));
		const routeSubscription =  this.activatedRoute.params.subscribe(params => {
			const id = params.id;
			if (id) {
				this.store.pipe(select(selectGasMeterById(id))).subscribe(res => {
					if (res) {
						this.loadingForm = true
						this.gasMeter = res;
						this.oldGasMeter = Object.assign({}, this.gasMeter);
						this.initGasMeter();
					}
				});
			} else {
				this.gasMeter = new GasMeterModel();
				this.gasMeter.clear();
				this.initGasMeter();
			}
		});
		this.subscriptions.push(routeSubscription);
	}
	initGasMeter() {
		this.loadRateList();
		this.loadBlockGroupList();
		this.createForm();
	}
	createForm() {
		if(this.gasMeter._id){
			this.loadBlockList(this.gasMeter.unt.flr.blk.grpid._id);
			this.loadFloorList(this.gasMeter.unt.flr.blk._id);
			this.loadUnitList(this.gasMeter.unt.flr._id);
			this.gasMeterForm = this.gasMeterFB.group({
				nmmtr: [this.gasMeter.nmmtr, Validators.required],
				unt: [{"value" : this.gasMeter.unt._id, "disabled" : false}, Validators.required],
				flr: [{ "value" : this.gasMeter.unt.flr._id, "disabled" : false}, Validators.required],
				blk: [{ "value" : this.gasMeter.unt.flr.blk._id, "disabled" : false}, Validators.required],
				grpblk: [{ "value" : this.gasMeter.unt.flr.blk.grpid._id, "disabled" : false}, Validators.required],
				rte: [this.gasMeter.rte._id, Validators.required],
			});
		}else{
			this.gasMeterForm = this.gasMeterFB.group({
				nmmtr: ["", Validators.required],
				unt: [{"value": ""}, Validators.required],
				flr: [{ "value" : "", "disabled" : true}, Validators.required],
				blk: [{ "value" : "", "disabled" : true}, Validators.required],
				grpblk: [{ "value" : "", "disabled" : false}, Validators.required],
				rte: ["", Validators.required],
			});
		}

	}
	goBackWithId() {
		const url = `/gas-management/gas/meter`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}
	refreshGasMeter(isNew: boolean = false, id:string = "") {
		let url = this.router.url;
		if (!isNew) {
			this.router.navigate([url], { relativeTo: this.activatedRoute });
			return;
		}

		url = `/gas-management/gas/meter/edit/${id}`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}
	onSubmit(withBack: boolean = false) {
		this.hasFormErrors = false;
		const controls = this.gasMeterForm.controls;
		/** check form */
		if (this.gasMeterForm.invalid) {
			Object.keys(controls).forEach(controlName =>
				controls[controlName].markAsTouched()
			);

			this.hasFormErrors = true;
			this.selectedTab = 0;
			return;
		}

		const editedGasMeter = this.prepareGasMeter();

		if (editedGasMeter._id) {
			this.updateGasMeter(editedGasMeter, withBack);
			return;
		}

		this.addGasMeter(editedGasMeter, withBack);
	}
	prepareGasMeter(): GasMeterModel {
		const controls = this.gasMeterForm.controls;
		const _gasMeter = new GasMeterModel();
		_gasMeter.clear();
		_gasMeter._id = this.gasMeter._id;
		_gasMeter.nmmtr = controls.nmmtr.value;
		_gasMeter.unt = controls.unt.value.toLowerCase();
		_gasMeter.rte = controls.rte.value;
		return _gasMeter;
	}
	addGasMeter( _gasMeter: GasMeterModel, withBack: boolean = false) {
		const addSubscription = this.service.createGasMeter(_gasMeter).subscribe(
			res => {
				const message = `New gas meter successfully has been added.`;
				this.layoutUtilsService.showActionNotification(message, MessageType.Create, 5000, true, true);
				const url = `/gas-management/gas/meter`;
				this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
			},
			err => {
				console.error(err);
				const message = 'Error while adding gas meter | ' + err.statusText;
				this.layoutUtilsService.showActionNotification(message, MessageType.Create, 5000, true, false);
			}
		);
		this.subscriptions.push(addSubscription);
	}
	updateGasMeter(_gasMeter: GasMeterModel, withBack: boolean = false){
		const addSubscription = this.service.updateGasMeter(_gasMeter).subscribe(
			res => {
				const message = `Electricity meter successfully has been saved.`;
				this.layoutUtilsService.showActionNotification(message, MessageType.Update, 5000, true, true);
				const url = `/gas-management/gas/meter`;
				this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
			},
			err => {
				console.error(err);
				const message = 'Error while saving gas meter | ' + err.statusText;
				this.layoutUtilsService.showActionNotification(message, MessageType.Create, 5000, true, false);
			}
		);
		this.subscriptions.push(addSubscription);
	}
	getComponentTitle() {
		let result = 'Create Gas Meter';
		if (!this.gasMeter || !this.gasMeter._id) {
			return result;
		}

		result = `Edit Gas Meter`;
		return result;
	}
	onAlertClose($event) {
		this.hasFormErrors = false;
	}
	reset() {
		this.gasMeter = Object.assign({}, this.oldGasMeter);
		this.createForm();
		this.hasFormErrors = false;
		this.gasMeterForm.markAsPristine();
		this.gasMeterForm.markAsUntouched();
		this.gasMeterForm.updateValueAndValidity();
	}
	loadBlockList(grpid) {
		this.selection.clear();
		const queryParams = new QueryBlockModel(
			null,
			"asc",
			null,
			1,
			10
		);
		this.serviceBlk.findBlockByParent(grpid).subscribe(
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
			null,
			1,
			10
		);
		this.serviceBlkGrp.getListBlockGroup(queryParams).subscribe(
			res => {
				this.blockGroupResult = res.data;
			}
		);
	}
	loadBuildingList(blkid){
		this.selection.clear();
		const queryParams = new QueryBuildingModel(
			null,
			"asc",
			null,
			1,
			10
		);
		this.serviceBld.findBuildingByParent(blkid).subscribe(
			res => {
				this.buildingResult = res.data;
			}
		);
	}
	loadFloorList(bldid){
		this.selection.clear();
		const queryParams = new QueryFloorModel(
			null,
			"asc",
			null,
			1,
			10
		);
		this.serviceFloor.findFloorByParent(bldid).subscribe(
			res => {
				this.floorResult = res.data;
			}
		);
	}

	async loadUnitList(flrid){
		this.selection.clear();
		const queryParams = new QueryUnitModel(
			null,
			"asc",
			null,
			1,
			10
		);
		this.serviceUnit.findUnitByParent(flrid).subscribe(
			res => {
				this.loadingForm = false;
				this.unitResult = res.data;
				document.body.style.height = "101%"
				window.scrollTo(0, 1);
				document.body.style.height = ""

			}
		);
	}

	loadRateList(){
		this.selection.clear();
		const queryParams = new QueryGasRateModel(
			null,
			"asc",
			null,
			1,
			10
		);
		this.serviceRate.getListGasRate(queryParams).subscribe(
			res => {
				this.rateResult = res.data;
			}
		);
	}
	blockgroupChange(item){
		if(item){
			this.loadBlockList(item);
			this.gasMeterForm.controls.blk.enable();
		}
	};
	blkChange(item){
		if(item){
			this.loadFloorList(item);
			this.gasMeterForm.controls.flr.enable();
		}
	}
	bldChange(item){
		if(item){
			this.loadFloorList(item);
			this.gasMeterForm.controls.flr.enable();
		}
	}
	flrChange(item){
		if(item){
			this.loadUnitList(item);
			this.gasMeterForm.controls.unt.enable();
		}
	}

	ngOnDestroy() {
		this.subscriptions.forEach(sb => sb.unsubscribe());
	}

}
