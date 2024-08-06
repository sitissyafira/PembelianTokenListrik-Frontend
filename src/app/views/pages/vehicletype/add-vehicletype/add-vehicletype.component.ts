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
import { LayoutUtilsService, MessageType } from '../../../../core/_base/crud';
import {VehicleTypeModel} from "../../../../core/vehicletype/vehicletype.model";
import {
	selectLastCreatedVehicleTypeId,
	selectVehicleTypeActionLoading,
	selectVehicleTypeById
} from "../../../../core/vehicletype/vehicletype.selector";
import {VehicleTypeOnServerCreated, VehicleTypeUpdated} from "../../../../core/vehicletype/vehicletype.action";
import {CustomerModel} from "../../../../core/customer/customer.model";
import {CustomerOnServerCreated, CustomerUpdated} from "../../../../core/customer/customer.action";
import {selectLastCreatedCustomerId} from "../../../../core/customer/customer.selector";
import {VehicleTypeService} from '../../../../core/vehicletype/vehicletype.service';

@Component({
  selector: 'kt-add-vehicletype',
  templateUrl: './add-vehicletype.component.html',
  styleUrls: ['./add-vehicletype.component.scss']
})
export class AddVehicletypeComponent implements OnInit, OnDestroy {
	// Public properties
	vehicleType: VehicleTypeModel;
	customerId$: Observable<string>;
	oldVehicleType: VehicleTypeModel;
	selectedTab = 0;
	loading$: Observable<boolean>;
	vehicleTypeForm: FormGroup;
	hasFormErrors = false;
	loading  : boolean = false;
	// Private properties
	private subscriptions: Subscription[] = [];

	constructor(
		private activatedRoute: ActivatedRoute,
		private router: Router,
		private vehicleTypeFB: FormBuilder,
		private subheaderService: SubheaderService,
		private layoutUtilsService: LayoutUtilsService,
		private store: Store<AppState>,
		private layoutConfigService: LayoutConfigService,
		private service: VehicleTypeService
	) { }
	ngOnInit() {
		this.loading$ = this.store.pipe(select(selectVehicleTypeActionLoading));
		const routeSubscription =  this.activatedRoute.params.subscribe(params => {
			const id = params.id;
			if (id) {
				this.store.pipe(select(selectVehicleTypeById(id))).subscribe(res => {
					if (res) {
						this.vehicleType = res;
						this.oldVehicleType = Object.assign({}, this.vehicleType);
						this.initVehicleType();
					}
				});
			} else {
				this.vehicleType = new VehicleTypeModel();
				this.vehicleType.clear();
				this.initVehicleType();
			}
		});
		this.subscriptions.push(routeSubscription);
	}
	initVehicleType(){
		this.createForm();
	}
	createForm() {
		this.vehicleTypeForm = this.vehicleTypeFB.group({
			nmvhtp: [this.vehicleType.nmvhtp, Validators.required],
			vhttype :[this.vehicleType.vhttype, Validators.required],
			vhtprate: [this.vehicleType.vhtprate, Validators.required],
		});
	}
	goBackWithId() {
		const url = `/vehicletype`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}
	refreshVehicleType(isNew: boolean = false, id:string = "") {
		let url = this.router.url;
		if (!isNew) {
			this.router.navigate([url], { relativeTo: this.activatedRoute });
			return;
		}

		url = `/vehicletype/edit/${id}`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}
	reset() {
		this.vehicleType = Object.assign({}, this.oldVehicleType);
		this.createForm();
		this.hasFormErrors = false;
		this.vehicleTypeForm.markAsPristine();
		this.vehicleTypeForm.markAsUntouched();
		this.vehicleTypeForm.updateValueAndValidity();
	}

	onSubmit(withBack: boolean = false) {
		this.hasFormErrors = false;
		const controls = this.vehicleTypeForm.controls;
		/** check form */
		if (this.vehicleTypeForm.invalid) {
			Object.keys(controls).forEach(controlName =>
				controls[controlName].markAsTouched()
			);

			this.hasFormErrors = true;
			this.selectedTab = 0;
			return;
		}

		this.loading = true
		const editedVehicleType = this.prepareVehicleType();
		if (editedVehicleType._id) {
			this.updateVehicleType(editedVehicleType, withBack);
			return;
		}
		this.addVehicleType(editedVehicleType, withBack);
	}
	prepareVehicleType(): VehicleTypeModel {
		const controls = this.vehicleTypeForm.controls;
		const _vehicletype = new VehicleTypeModel();
		_vehicletype.clear();
		_vehicletype._id = this.vehicleType._id;
		_vehicletype.nmvhtp = controls.nmvhtp.value.toLowerCase();
		_vehicletype.vhttype = controls.vhttype.value.toLowerCase();
		_vehicletype.vhtprate = controls.vhtprate.value;
		return _vehicletype;
	}
	addVehicleType( _vehicletype: VehicleTypeModel, withBack: boolean = false) {
		const addSubscription = this.service.createVehicleType(_vehicletype).subscribe(
			res => {
				const message = `New vehicle successfully has been added.`;
				this.layoutUtilsService.showActionNotification(message, MessageType.Create, 5000, true, true);
				const url = `/vehicletype`;
				this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
			},
			err => {
				console.error(err);
				const message = 'Error while adding vehicle | ' + err.statusText;
				this.layoutUtilsService.showActionNotification(message, MessageType.Create, 5000, true, false);
			}
		);
		this.subscriptions.push(addSubscription);
	}
	updateVehicleType(_vehicletype: VehicleTypeModel, withBack: boolean = false) {
		// Update User
		// tslint:disable-next-line:prefer-const
		const addSubscription = this.service.updateVehicleType(_vehicletype).subscribe(
			res => {
				const message = `New vehicle successfully has been saved.`;
				this.layoutUtilsService.showActionNotification(message, MessageType.Update, 5000, true, true);
				const url = `/vehicletype`;
				this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
			},
			err => {
				console.error(err);
				const message = 'Error while saving vehicle | ' + err.statusText;
				this.layoutUtilsService.showActionNotification(message, MessageType.Update, 5000, true, false);
			}
		);
		this.subscriptions.push(addSubscription);
	}
	getComponentTitle() {
		let result = 'Create Vehicle';
		if (!this.vehicleType || !this.vehicleType._id) {
			return result;
		}

		result = `Edit Vehicle`;
		return result;
	}
	onAlertClose($event) {
		this.hasFormErrors = false;
	}
	ngOnDestroy() {
		this.subscriptions.forEach(sb => sb.unsubscribe());
	}

}
