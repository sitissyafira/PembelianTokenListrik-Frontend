import {Component, OnDestroy, OnInit} from '@angular/core';
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
import { LayoutUtilsService, MessageType, QueryParamsModel } from '../../../../../core/_base/crud';
import {RentalModel} from "../../../../../core/bm/rental/rental.model";
import {
	selectLastCreatedRentalId,
	selectRentalActionLoading,
	selectRentalById
} from "../../../../../core/bm/rental/rental.selector";
import {RentalService} from '../../../../../core/bm/rental/rental.service';
import { QueryUnitModel } from '../../../../../core/unit/queryunit.model';
import { SelectionModel } from '@angular/cdk/collections';
import { UnitService } from '../../../../../core/unit/unit.service';
import { CustomerService } from '../../../../../core/customer/customer.service';
import { QueryRevenueModel } from '../../../../../core/revenue/queryrevenue.model';
import { RevenueService } from '../../../../../core/revenue/revenue.service';
import { LeaseContractService } from '../../../../../core/contract/lease/lease.service';
import { QueryleaseModel } from '../../../../../core/contract/lease/querylease.model';

@Component({
  selector: 'kt-add-rental',
  templateUrl: './add-rental.component.html',
  styleUrls: ['./add-rental.component.scss']
})
export class AddRentalComponent implements OnInit, OnDestroy {
	// Public properties
	rental: RentalModel;
	RentalId$: Observable<string>;
	oldRental: RentalModel;
	selectedTab = 0;
	loading$: Observable<boolean>;
	rentalForm: FormGroup;
	hasFormErrors = false;
	unitResult: any[] = [];
	tenantResult: any[] = [];
	revenueResult: any[] = [];
	codenum : any;
	loading : boolean = false
	selection = new SelectionModel<RentalModel>(true, []);
	// Private properties
	private subscriptions: Subscription[] = [];
  	constructor(
		private activatedRoute: ActivatedRoute,
		private router: Router,
		private rentalFB: FormBuilder,
		private subheaderService: SubheaderService,
		private layoutUtilsService: LayoutUtilsService,
		private store: Store<AppState>,
		private service: RentalService,
		private serviceUnit : LeaseContractService,
		private serviceTenant : CustomerService,
		private serviceRevenue : RevenueService,
		private layoutConfigService: LayoutConfigService
	) { }

  	ngOnInit() {
		this.loading$ = this.store.pipe(select(selectRentalActionLoading));
		this.loadUnit();
		const routeSubscription =  this.activatedRoute.params.subscribe(params => {
			const id = params.id;
			if (id) {
				this.store.pipe(select(selectRentalById(id))).subscribe(res => {
					if (res) {
						this.rental = res;
						this.oldRental = Object.assign({}, this.rental);
						this.initRental();
						
					}
				});
			} else {
				this.rental = new RentalModel();
				this.rental.clear();
				this.initRental();
			}
		});
		this.subscriptions.push(routeSubscription);
  	}

	initRental() {
		this.createForm();
		this.loadUnit();
		this.loadRevenue();
	}

	createForm() {
		if (this.rental._id){
		this.rentalForm = this.rentalFB.group({
			revenueCode: [{value:this.rental.revenueCode.toUpperCase(), disabled:true}],
			lease: [this.rental.lease._id, Validators.required],
			tenant: [{value:this.rental.lease.contact_name, disabled:true}],
			rate: [this.rental.rate, Validators.required],
			unit : [this.rental.unit],
			admin : [{value:this.rental.revenueRental.administration, disabled:true}],
			service :[{value:this.rental.revenueRental.serviceFee, disabled:true}],
			revenueRental: [{value:this.rental.revenueRental._id, disabled:true}],
			total: [{value:this.rental.total, disabled:true}],
		});
		}else{
			this.getNumber();
			this.rentalForm = this.rentalFB.group({
				revenueCode: [{value:this.codenum, disabled:true }, Validators.required],
				lease: ["", Validators.required],
				unit: ["", Validators.required],
				tenant: ["", Validators.required],
				service : [{value:"", disabled:true}],
				admin : [{value:"", disabled:true}],
				rate: ["", Validators.required],
				total : [{value:this.rental.total, disabled:true}],
				revenueRental: ["", Validators.required],
			});
		}
	}

	getNumber() {
		this.service.generateCode().subscribe(
			res => {
				this.codenum = res.data
				const controls = this.rentalForm.controls;
				controls.revenueCode.setValue(this.codenum);
			}
		)
		console.log(this.codenum)
	}

	loadUnit(){
		this.selection.clear();
		const queryParams = new QueryleaseModel(
			null,
			"asc",
			null,
			1,
			1000
		);
		this.serviceUnit.getListLeaseContract(queryParams).subscribe(
			res => {
				this.unitResult = res.data;	
			}
		);
	}

	leaseChange(id){
		const controls = this.rentalForm.controls;
		this.serviceUnit.findLeaseById(id).subscribe(data => {
			controls.tenant.setValue(data.data.contact_name);
			controls.unit.setValue(data.data.unit.cdunt);
		});
	}

	loadRevenue(){
		this.selection.clear();
		const queryParams = new QueryRevenueModel(
			null,
			"asc",
			null,
			1,
			1000
		);
		this.serviceRevenue.getListRevenue(queryParams).subscribe(
			res => {
				this.revenueResult = res.data;	
			}
		);
	}

	getRateData(id){
		const controls = this.rentalForm.controls;
		this.serviceRevenue.findRevenueById(id).subscribe(data => {
			controls.service.setValue(data.data.serviceFee);
			controls.admin.setValue(data.data.administration);
		});

	}
	

	getTotal(){
		const admin = this.rentalForm.controls.admin.value;
		const service = this.rentalForm.controls.service.value;
		const rate = this.rentalForm.controls.rate.value;
		if (admin !== 0 && service !== 0 && rate !== 0 ) {
				const persen  = (rate / 100) * service;
				this.rentalForm.controls.total.setValue(persen + admin);
			}
	}


	goBackWithId() {
		const url = `/rental`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}

	refreshRental(isNew: boolean = false, id:string = "") {
		let url = this.router.url;
		if (!isNew) {
			this.router.navigate([url], { relativeTo: this.activatedRoute });
			return;
		}

		url = `/rental/edit/${id}`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}

	reset() {
		this.rental = Object.assign({}, this.oldRental);
		this.createForm();
		this.hasFormErrors = false;
		this.rentalForm.markAsPristine();
		this.rentalForm.markAsUntouched();
		this.rentalForm.updateValueAndValidity();
	}

	onSubmit(withBack: boolean = false) {
		this.hasFormErrors = false;
		const controls = this.rentalForm.controls;
		/** check form */
		if (this.rentalForm.invalid) {
			Object.keys(controls).forEach(controlName =>
				controls[controlName].markAsTouched()
			);

			this.hasFormErrors = true;
			this.selectedTab = 0;
			return;
		}


		this.loading = true;
		const editedRental = this.prepareRental();

		if (editedRental._id) {
			this.updateRental(editedRental, withBack);
			return;
		}

		this.addRental(editedRental, withBack);
	}
	prepareRental(): RentalModel {
		const controls = this.rentalForm.controls;
		const _rental = new RentalModel();
		_rental.clear();
		_rental._id = this.rental._id;
		_rental.revenueCode = controls.revenueCode.value.toLowerCase();
		_rental.lease = controls.lease.value;
		_rental.unit = controls.unit.value.toLowerCase();
		_rental.rate = controls.rate.value;
		_rental.admin = controls.admin.value;
		_rental.service = controls.service.value;
		_rental.total = controls.total.value;
		_rental.revenueRental = controls.revenueRental.value;
		return _rental;
	}

	addRental( _rental: RentalModel, withBack: boolean = false) {
		const addSubscription = this.service.createRental(_rental).subscribe(
			res => {
				const message = `New Rental successfully has been added.`;
				this.layoutUtilsService.showActionNotification(message, MessageType.Create, 5000, true, true);
				const url = `/rental`;
				this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
			},
			err => {
				console.error(err);
				const message = 'Error while adding rental | ' + err.statusText;
				this.layoutUtilsService.showActionNotification(message, MessageType.Create, 5000, true, false);
			}
		);
		this.subscriptions.push(addSubscription);
	}

	updateRental(_rental: RentalModel, withBack: boolean = false) {
		// Update User
		// tslint:disable-next-line:prefer-const
		const addSubscription = this.service.updateRental(_rental).subscribe(
			res => {
				const message = `Rental successfully has been saved.`;
				this.layoutUtilsService.showActionNotification(message, MessageType.Update, 5000, true, true);
				const url = `/rental`;
				this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
			},
			err => {
				console.error(err);
				const message = 'Error while adding rental | ' + err.statusText;
				this.layoutUtilsService.showActionNotification(message, MessageType.Update, 5000, true, false);
			}
		);
		this.subscriptions.push(addSubscription);
	}

	getComponentTitle() {
		let result = 'Create Revenue';
		if (!this.rental || !this.rental._id) {
			return result;
		}

		result = `Edit Revenue`;
		return result;
	}

	onAlertClose($event) {
		this.hasFormErrors = false;
	}

  	ngOnDestroy() {
		this.subscriptions.forEach(sb => sb.unsubscribe());
	}
	
}
