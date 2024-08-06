import {Component, OnDestroy, OnInit} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
// RxJS
import { BehaviorSubject, Observable, of, Subscription } from 'rxjs';
// NGRX
import { Store, select } from '@ngrx/store';
import { Update } from '@ngrx/entity';
import { AppState } from '../../../../core/reducers';
// Layout
import { SubheaderService, LayoutConfigService } from '../../../../core/_base/layout';
import { LayoutUtilsService, MessageType, QueryParamsModel } from '../../../../core/_base/crud';
import {ParkingModel} from "../../../../core/parking/parking.model";
import {
	selectLastCreatedParkingId,
	selectParkingActionLoading,
	selectParkingById
} from "../../../../core/parking/parking.selector";
import {ParkingService} from '../../../../core/parking/parking.service';
import { CustomerService } from '../../../../core/customer/customer.service';
import { SelectionModel } from '@angular/cdk/collections';
import { QueryUnitModel } from '../../../../core/unit/queryunit.model';
import { UnitService } from '../../../../core/unit/unit.service';
import { VehicleTypeModel } from '../../../../core/vehicletype/vehicletype.model';
import { VehicleTypeService } from '../../../../core/vehicletype/vehicletype.service';
import { BlockService } from '../../../../core/block/block.service';
import { QueryBlockModel } from '../../../../core/block/queryblock.model';
import { QueryBuildingModel } from '../../../../core/building/querybuilding.model';
import { QueryFloorModel } from '../../../../core/floor/queryfloor.model';
import { FloorService } from '../../../../core/floor/floor.service';
import { BuildingService } from '../../../../core/building/building.service';
import { TitleCasePipe } from '@angular/common';

@Component({
  selector: 'kt-add-parking',
  templateUrl: './add-parking.component.html',
  styleUrls: ['./add-parking.component.scss']
})
export class AddParkingComponent implements OnInit, OnDestroy {
	// Public properties
	parking: ParkingModel;
	ParkingId$: Observable<string>;
	oldParking: ParkingModel;
	selectedTab = 0;
	loading$: Observable<boolean>;
	selection = new SelectionModel<ParkingModel>(true, []);
	parkingForm: FormGroup;
	hasFormErrors = false;
	unitResult: any[] = [];
	blockResult: any[] = [];
	buildingResult : any [] = [];
	floorResult: any[]=[];
	vResult:any[]=[];
	
	// Private properties
	private subscriptions: Subscription[] = [];
  	constructor(
		private activatedRoute: ActivatedRoute,
		private router: Router,
		private parkingFB: FormBuilder,
		private subheaderService: SubheaderService,
		private layoutUtilsService: LayoutUtilsService,
		private store: Store<AppState>,
		private service: ParkingService,
		private uservice: UnitService,
		private serviceBlk: BlockService,
		private serviceFloor: FloorService,
		private serviceBld: BuildingService,
		private serviceV:VehicleTypeService,
		private layoutConfigService: LayoutConfigService
	) { }

  	ngOnInit() {
		this.loading$ = this.store.pipe(select(selectParkingActionLoading));
		const routeSubscription =  this.activatedRoute.params.subscribe(params => {
			const id = params.id;
			if (id) {
				this.store.pipe(select(selectParkingById(id))).subscribe(res => {
					if (res) {
						this.parking = res;
						this.oldParking = Object.assign({}, this.parking);
						this.initParking();
						this.AvaliableSlot();
					}
				});
			} else {
				this.parking = new ParkingModel();
				this.parking.clear();
				this.initParking();
			}
		});
		this.subscriptions.push(routeSubscription);
  	}

	initParking() {
		this.createForm();
		this.loadBlockList();
		this.loadVehicleList();
		
	}
	createForm() {
		if (this.parking._id){
			//this.loadFloorList(this.parking.block._id);
			this.loadFloorList(this.parking.block._id);
			this.loadUnitList(this.parking.unit.flr);
			
			this.parkingForm = this.parkingFB.group({
			nmplot: [this.parking.nmplot],
			vehnum: [this.parking.vehnum],
			vehicle: [this.parking.vehicle._id],
			vehtype : [this.parking.vehicle.vhttype],
			vehrate:[this.parking.vehicle.vhtprate],
			block: [this.parking.block._id],
			floor: [this.parking.unit.flr],
			space: [this.parking.space],
			avaliablespace: [{value:this.parking.avaliablespace, disabled: true}],
			unit: [this.parking.unit._id],
		});
		}else{
			this.parkingForm = this.parkingFB.group({
				nmplot: [""],
				vehnum: [""],
				vehicle: [""],
				vehtype : [{value:"", disabled:true}],
				vehrate: [{value:"", disabled:true}],
				block: [""],
				floor:[""],
				space: [""],
				avaliablespace: [{value:"", disabled:true}],
				unit: [""],
			});
		}
	}

	loadVehicleList() {
		this.selection.clear();
		const queryParams = new QueryParamsModel(
			null,
			"asc",
			null,
			1,
			10
		);
		this.serviceV.getListVehicleType(queryParams).subscribe(
			res => {
				this.vResult = res.data;
			}
		);
	}

	vehicleChange(id){
		const controls = this.parkingForm.controls;
		this.serviceV.getVehicleById(id).subscribe(data => {
			controls.vehrate.setValue(data.data.vhtprate);
			controls.vehtype.setValue(data.data.vhttype);
			this.AvaliableSlot();
		});
	}


	loadBlockList() {
		this.selection.clear();
		const queryParams = new QueryBlockModel(
			null,
			"asc",
			null,
			1,
			100
		);

		this.serviceBlk.getListBlock(queryParams).subscribe((res) => {
				this.blockResult = res.data;
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


	loadUnitList(flrid){
		this.selection.clear();
		const queryParams = new QueryUnitModel(
			null,
			"asc",
			null,
			1,
			10
		);
		this.uservice.findUnitByParent(flrid).subscribe(
			res => {
				this.unitResult = res.data;
			}
		);
	}

	blkChange(id){
		if(id){
		this.loadFloorList(id);
		// this.parkingForm.controls.flr.enable();
		this.serviceBlk.getBlockId(id).subscribe((res) => {
		this.parkingForm.controls.space.setValue(res.data.availspace);
		// this.parkingForm.controls.space.setValue(res.lastConsumtion.avaliablespace);

		 });
		}
	}	

	
	flrChange(item){
		if(item){
			this.loadUnitList(item);
			this.parkingForm.controls.unt.enable();
		}
	}

	AvaliableSlot(){
		const vehrate = this.parkingForm.controls.vehrate.value;
		const space = this.parkingForm.controls.space.value;
		if (space !== 0 && vehrate !== 0 ) {
			this.parkingForm.controls.avaliablespace.setValue(
				(space - vehrate)
			);
		}

	}

	
	goBackWithId() {
		const url = `/parking`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}

	refreshParking(isNew: boolean = false, id:string = "") {
		let url = this.router.url;
		if (!isNew) {
			this.router.navigate([url], { relativeTo: this.activatedRoute });
			return;
		}

		url = `/parking/edit/${id}`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}

	reset() {
		this.parking = Object.assign({}, this.oldParking);
		this.createForm();
		this.hasFormErrors = false;
		this.parkingForm.markAsPristine();
		this.parkingForm.markAsUntouched();
		this.parkingForm.updateValueAndValidity();
	}

	onSubmit(withBack: boolean = false) {
		this.hasFormErrors = false;
		const controls = this.parkingForm.controls;
		/** check form */
		if (this.parkingForm.invalid) {
			Object.keys(controls).forEach(controlName =>
				controls[controlName].markAsTouched()
			);

			this.hasFormErrors = true;
			this.selectedTab = 0;
			return;
		}

		const editedParking = this.prepareParking();

		if (editedParking._id) {
			this.updateParking(editedParking, withBack);
			return;
		}

		this.addParking(editedParking, withBack);
	}
	prepareParking(): ParkingModel {
		const controls = this.parkingForm.controls;
		const _parking = new ParkingModel();
		_parking.clear();
		_parking._id = this.parking._id;
		_parking.nmplot = controls.nmplot.value.toLowerCase();
		_parking.vehnum = controls.vehnum.value;
		_parking.vehicle = controls.vehicle.value;
		_parking.vehtype = controls.vehtype.value.toLowerCase();
		_parking.vehrate = controls.vehrate.value;
		_parking.block = controls.block.value.toLowerCase();
		_parking.space = controls.space.value;
		_parking.avaliablespace = controls.avaliablespace.value;
		_parking.unit = controls.unit.value.toLowerCase();
		return _parking;
	}

	addParking( _parking: ParkingModel, withBack: boolean = false) {
		const addSubscription = this.service.createParking(_parking).subscribe(
			res => {
				const message = `New Parking successfully has been added.`;
				this.layoutUtilsService.showActionNotification(message, MessageType.Create, 5000, true, true);
				const url = `/parking`;
				this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
			},
			err => {
				console.error(err);
				const message = 'Error while adding unit type | ' + err.statusText;
				this.layoutUtilsService.showActionNotification(message, MessageType.Create, 5000, true, false);
			}
		);
		this.subscriptions.push(addSubscription);
	}

	updateParking(_parking: ParkingModel, withBack: boolean = false) {
		// Update User
		// tslint:disable-next-line:prefer-const
		const addSubscription = this.service.updateParking(_parking).subscribe(
			res => {
				const message = `Unit type successfully has been saved.`;
				this.layoutUtilsService.showActionNotification(message, MessageType.Update, 5000, true, true);
				const url = `/parking`;
				this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
			},
			err => {
				console.error(err);
				const message = 'Error while adding unit type | ' + err.statusText;
				this.layoutUtilsService.showActionNotification(message, MessageType.Update, 5000, true, false);
			}
		);
		this.subscriptions.push(addSubscription);
	}

	getComponentTitle() {
		let result = 'Create Parking';
		if (!this.parking || !this.parking._id) {
			return result;
		}

		result = `Edit Parking`;
		return result;
	}

	onAlertClose($event) {
		this.hasFormErrors = false;
	}

  	ngOnDestroy() {
		this.subscriptions.forEach(sb => sb.unsubscribe());
	}
	
}
