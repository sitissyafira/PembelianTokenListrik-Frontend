import { Component, OnDestroy, OnInit } from '@angular/core';
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
import { AddparkModel } from "../../../../core/addpark/addpark.model";
import {
	selectLastCreatedAddparkId,
	selectAddparkActionLoading,
	selectAddparkById
} from "../../../../core/addpark/addpark.selector";
import { AddparkService } from '../../../../core/addpark/addpark.service';
import { CustomerService } from '../../../../core/customer/customer.service';
import { SelectionModel } from '@angular/cdk/collections';
import { QueryUnitModel } from '../../../../core/unit/queryunit.model';
import { UnitService } from '../../../../core/unit/unit.service';
import { VehicleTypeModel } from '../../../../core/vehicletype/vehicletype.model';
import { VehicleTypeService } from '../../../../core/vehicletype/vehicletype.service';
import { BlockService } from '../../../../core/block/block.service';
import { OwnershipContractService } from '../../../../core/contract/ownership/ownership.service';
import { LeaseContractService } from '../../../../core/contract/lease/lease.service';
import { QueryleaseModel } from '../../../../core/contract/lease/querylease.model';
import { QueryOwnerTransactionModel } from '../../../../core/contract/ownership/queryowner.model';

@Component({
	selector: 'kt-view-addpark',
	templateUrl: './view-addpark.component.html',
	styleUrls: ['./view-addpark.component.scss']
})
export class ViewAddParkComponent implements OnInit, OnDestroy {
	// Public properties
	addpark: AddparkModel;
	AddparkId$: Observable<string>;
	oldAddpark: AddparkModel;
	selectedTab = 0;
	loading$: Observable<boolean>;
	selection = new SelectionModel<AddparkModel>(true, []);
	addparkForm: FormGroup;
	hasFormErrors = false;
	unitResult: any[] = [];
	customerResult: any[] = [];
	vehicleResult: any[] = [];
	blockResult: any[] = [];

	loading: boolean = false;
	loadingForm: boolean;

	// Private properties
	private subscriptions: Subscription[] = [];
	constructor(
		private activatedRoute: ActivatedRoute,
		private router: Router,
		private addparkFB: FormBuilder,
		private subheaderService: SubheaderService,
		private layoutUtilsService: LayoutUtilsService,
		private store: Store<AppState>,
		private service: AddparkService,
		private cservice: CustomerService,
		private uservice: UnitService,
		private ownerService: OwnershipContractService,
		private leaseService: LeaseContractService,
		private vservice: VehicleTypeService,
		private bservice: BlockService,
		private layoutConfigService: LayoutConfigService
	) { }

	ngOnInit() {
		this.loading$ = this.store.pipe(select(selectAddparkActionLoading));
		const routeSubscription = this.activatedRoute.params.subscribe(params => {
			const id = params.id;
			if (id) {
				this.store.pipe(select(selectAddparkById(id))).subscribe(res => {
					if (res) {
						this.loadingForm = true;
						this.addpark = res;
						this.oldAddpark = Object.assign({}, this.addpark);
						this.initAddpark();
					}
				});
			}
		});
		this.subscriptions.push(routeSubscription);
	}

	initAddpark() {
		this.createForm();
		this.loadVehicleList();
		this.loadBlock();
		this.AvaliableSlot();
		this.loadUnit();
	}

	createForm() {
		if (this.addpark._id) {
			this.addparkForm = this.addparkFB.group({
				codeAddParkLot: [{ value: this.addpark.codeAddParkLot, disabled: true }],
				contract: [{ value: this.addpark.contract, disabled: true }],
				unit: [{ value: this.addpark.unit, disabled: true }],
				customer: [{ value: this.addpark.customer, disabled: true }],
				vehicle: [{ value: this.addpark.vehicle._id, disabled: true }],
				vehicleNum: [{ value: this.addpark.vehicleNum, disabled: true }],
				avaliable: [{ value: this.addpark.avaliable, disabled: true }],
				avaliablespace: [{ value: this.addpark.avaliablespace, disabled: true }],
				blockPark: [{ value: this.addpark.blockPark._id, disabled: true }],
				space: [{ value: this.addpark.space, disabled: true }],
				status: [{ value: this.addpark.status, disabled: true }],
				type: [{ value: this.addpark.type, disabled: true }],
				parkingRate: [{ value: this.addpark.parkingRate, disabled: true }],
			});
		}
	}

	async loadUnit() {
		this.selection.clear();
		const queryParams = new QueryUnitModel(
			null,
			"asc",
			null,
			1,
			1000
		);
		this.uservice.getListUnit(queryParams).subscribe(
			res => {
				this.unitResult = res.data;

				this.loadingForm = false
				document.body.style.height = "101%"
				window.scrollTo(0, 1);
				document.body.style.height = ""
			}
		);
	}

	unitChange(id) {
		const controls = this.addparkForm.controls;
		this.uservice.findUnitById(id).subscribe(
			data => {
				controls.customer.setValue(data.data.contact_name);
				controls.unit.setValue(data.data.unit.cdunt);
			}
		);
	}


	blkChange(id) {
		// this.parkingForm.controls.flr.enable();
		this.bservice.getBlockId(id).subscribe((res) => {
			this.addparkForm.controls.avaliable.setValue(res.data.availspace);
			// this.parkingForm.controls.space.setValue(res.lastConsumtion.avaliablespace);
			this.AvaliableSlot();
		});
	}

	loadVehicleList() {
		this.selection.clear();
		const queryParams = new QueryParamsModel(
			null,
			"asc",
			null,
			1,
			1000
		);
		this.vservice.getListVehicleType(queryParams).subscribe(
			res => {
				this.vehicleResult = res.data;
			}
		);
	}

	vehicleChange(id) {
		const controls = this.addparkForm.controls;
		this.vservice.getVehicleById(id).subscribe(data => {
			controls.space.setValue(data.data.vhtprate);
		});
	}

	AvaliableSlot() {
		const space = this.addparkForm.controls.space.value;
		const avaliable = this.addparkForm.controls.avaliable.value;
		if (avaliable !== 0 && space !== 0) {
			this.addparkForm.controls.avaliablespace.setValue(
				(avaliable - space)
			);
		}
	}

	loadBlock() {
		this.selection.clear();
		const queryParams = new QueryParamsModel(
			null,
			"asc",
			null,
			1,
			1000
		);
		this.bservice.getListBlock(queryParams).subscribe(
			res => {
				this.blockResult = res.data;
			}
		);
	}

	goBackWithId() {
		const url = `/apark`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}

	refreshAddpark(isNew: boolean = false, id: string = "") {
		let url = this.router.url;
		if (!isNew) {
			this.router.navigate([url], { relativeTo: this.activatedRoute });
			return;
		}

		url = `/apark/edit/${id}`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}


	getComponentTitle() {
		let result = `View Parking`;
		return result;
	}

	onAlertClose($event) {
		this.hasFormErrors = false;
	}

	ngOnDestroy() {
		this.subscriptions.forEach(sb => sb.unsubscribe());
	}

}
