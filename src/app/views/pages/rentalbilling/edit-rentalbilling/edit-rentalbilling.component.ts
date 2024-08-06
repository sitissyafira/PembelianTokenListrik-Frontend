import {Component, OnDestroy, OnInit} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
// RxJS
import { BehaviorSubject, Observable, of, Subscription } from 'rxjs';
// NGRX
import { Store, select } from '@ngrx/store';
import { Update } from '@ngrx/entity';
import { AppState } from '../../../../core/reducers';
// Layout
import { SubheaderService, LayoutConfigService } from '../../../../core/_base/layout';
import { LayoutUtilsService, MessageType } from '../../../../core/_base/crud';
import {RentalbillingModel} from "../../../../core/rentalbilling/rentalbilling.model";
import {
	selectLastCreatedRentalbillingId,
	selectRentalbillingActionLoading,
	selectRentalbillingById
} from "../../../../core/rentalbilling/rentalbilling.selector";
import {RentalbillingService} from '../../../../core/rentalbilling/rentalbilling.service';
import { LeaseContractService } from '../../../../core/contract/lease/lease.service';
import { SelectionModel } from '@angular/cdk/collections';
import { QueryleaseModel } from '../../../../core/contract/lease/querylease.model';
import { QueryAccountBankModel } from '../../../../core/masterData/bank/accountBank/queryaccountBank.model';
import { AccountBankService } from '../../../../core/masterData/bank/accountBank/accountBank.service';

@Component({
  selector: 'kt-edit-rentalbilling',
  templateUrl: './edit-rentalbilling.component.html',
  styleUrls: ['./edit-rentalbilling.component.scss']
})
export class EditRentalBillingComponent implements OnInit, OnDestroy {
	// Public properties
	rentalbilling: RentalbillingModel;
	RentalbillingId$: Observable<string>;
	oldRentalbilling: RentalbillingModel;
	selectedTab = 0;
	loading$: Observable<boolean>;
	rentalbillingForm: FormGroup;
	hasFormErrors = false;
	selection = new SelectionModel<RentalbillingModel>(true, []);
	unitResult: any[]=[];
	bankResult: any[]=[];
	date1 = new FormControl(new Date());
	codenum : any;
	buttonSave: boolean = true;
	loading : boolean  = false;
	// Private properties
	private subscriptions: Subscription[] = [];
  	constructor(
		private activatedRoute: ActivatedRoute,
		private router: Router,
		private rentalbillingFB: FormBuilder,
		private subheaderService: SubheaderService,
		private layoutUtilsService: LayoutUtilsService,
		private store: Store<AppState>,
		private bservice : AccountBankService,
		private leaseService : LeaseContractService,
		private service: RentalbillingService,
		private layoutConfigService: LayoutConfigService
	) { }

  	ngOnInit() {
		this.loading$ = this.store.pipe(select(selectRentalbillingActionLoading));
		const routeSubscription =  this.activatedRoute.params.subscribe(params => {
			const id = params.id;
			if (id) {
				this.store.pipe(select(selectRentalbillingById(id))).subscribe(res => {
					if (res) {
						this.rentalbilling = res;
						this.oldRentalbilling = Object.assign({}, this.rentalbilling);
						this.initRentalbilling();
					}
				});
			}
		});
		this.subscriptions.push(routeSubscription);
  	}

	initRentalbilling() {
		this.createForm();
		this.loadUnit();
		this.loadAccountBank();
	}


	createForm() {
		this.rentalbillingForm = this.rentalbillingFB.group({
			billingNo : [{value:this.rentalbilling.billingNo, disabled:true}],
			billingDate : [{value:this.rentalbilling.billingDate, disabled:true}],
			createdDate : [{value:this.rentalbilling.createdDate, disabled:true}],
			dueDate: [{value:this.rentalbilling.dueDate, disabled:true}],
			notes: [{value:this.rentalbilling.notes, disabled:true}],
			lease : [{value:this.rentalbilling.lease._id, disabled:true}],
			tenantName: [{value:this.rentalbilling.lease.contact_name, disabled:true}],
			priceRent : [{value:this.rentalbilling.lease.rentalAmount, disabled:true}],
			unit : [{value:this.rentalbilling.unit, disabled:true}],


			paymentType : [""],
			bank : ["",Validators.required],
			isPaid: true,
			customerBank : [""],
			customerBankNo : [""],
			desc : [""],
			paidDate : [{value:this.date1.value, disabled:false}]
		});
	}


	loadUnit() {
		this.selection.clear();
		const queryParams = new QueryleaseModel(
			null,
			"asc",
			null,
			1,
			1000
		);
		this.leaseService.getListLeaseContract(queryParams).subscribe(
			res => {
				this.unitResult = res.data;
			}
		);
	}

	loadAccountBank() {
		this.selection.clear();
		const queryParams = new QueryAccountBankModel(
			null,
			"asc",
			null,
			1,
			1000
		);
		this.bservice.getListAccountBank(queryParams).subscribe(
			res => {
				this.bankResult = res.data;
			}
		);
	}


	getUnitId(id) {
		const controls = this.rentalbillingForm.controls;
		this.leaseService.findLeaseById(id).subscribe(
			data => {
				controls.tenantName.setValue(data.data.contact_name);
				controls.priceRent.setValue(data.data.unit.rentalPrice);
				controls.unit.setValue(data.data.unit.cdunt);
			}
		);
	}

	goBackWithId() {
		const url = `/rentalbilling`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}

	refreshRentalbilling(isNew: boolean = false, id:string = "") {
		let url = this.router.url;
		if (!isNew) {
			this.router.navigate([url], { relativeTo: this.activatedRoute });
			return;
		}

		url = `/rentalbilling/edit/${id}`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}

	reset() {
		this.rentalbilling = Object.assign({}, this.oldRentalbilling);
		this.createForm();
		this.hasFormErrors = false;
		this.rentalbillingForm.markAsPristine();
		this.rentalbillingForm.markAsUntouched();
		this.rentalbillingForm.updateValueAndValidity();
	}

	onSubmit(withBack: boolean = false) {
		this.hasFormErrors = false;
		const controls = this.rentalbillingForm.controls;
		/** check form */
		if (this.rentalbillingForm.invalid) {
			Object.keys(controls).forEach(controlName =>
				controls[controlName].markAsTouched()
			);

			this.hasFormErrors = true;
			this.selectedTab = 0;
			return;
		}

		this.loading = true;
		const editedRentalbilling = this.prepareRentalbilling();
		this.updateRentalbilling(editedRentalbilling, withBack);
	}
	prepareRentalbilling(): RentalbillingModel {
		const controls = this.rentalbillingForm.controls;
		const _rentalbilling = new RentalbillingModel();
		_rentalbilling.clear();
		_rentalbilling._id = this.rentalbilling._id;
		_rentalbilling.billingNo = controls.billingNo.value;
		_rentalbilling.billingDate = controls.billingDate.value;
		_rentalbilling.dueDate = controls.dueDate.value;
		_rentalbilling.notes = controls.notes.value;
		_rentalbilling.lease = controls.lease.value;
		_rentalbilling.createdDate = controls.createdDate.value;
		_rentalbilling.unit = controls.unit.value.toLowerCase();


		_rentalbilling.bank = controls.bank.value;
		_rentalbilling.isPaid = controls.isPaid.value;
		_rentalbilling.customerBank = controls.customerBank.value;
		_rentalbilling.customerBankNo = controls.customerBankNo.value;
		_rentalbilling.desc = controls.desc.value;
		_rentalbilling.paidDate = controls.paidDate.value;
		_rentalbilling.paymentType = controls.paymentType.value;
		
		return _rentalbilling;
	}


	updateRentalbilling(_rentalbilling: RentalbillingModel, withBack: boolean = false) {
		// Update User
		// tslint:disable-next-line:prefer-const
		const addSubscription = this.service.updateRentalbilling(_rentalbilling).subscribe(
			res => {
				const message = `Rental billing successfully has been saved.`;
				this.layoutUtilsService.showActionNotification(message, MessageType.Update, 5000, true, true);
				const url = `/rntlbilling`;
				this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
			},
			err => {
				console.error(err);
				const message = 'Error while adding rental billing | ' + err.statusText;
				this.layoutUtilsService.showActionNotification(message, MessageType.Update, 5000, true, false);
			}
		);
		this.subscriptions.push(addSubscription);
	}

	getComponentTitle() {
		let result = `Update Rental Billing`;
		return result;
	}

	onAlertClose($event) {
		this.hasFormErrors = false;
	}

	
  	ngOnDestroy() {
		this.subscriptions.forEach(sb => sb.unsubscribe());
	}
	
}
