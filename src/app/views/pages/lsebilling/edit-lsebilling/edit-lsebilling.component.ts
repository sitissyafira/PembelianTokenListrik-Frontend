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
import {LsebillingModel} from "../../../../core/lsebilling/lsebilling.model";
import {
	selectLastCreatedLsebillingId,
	selectLsebillingActionLoading,
	selectLsebillingById
} from "../../../../core/lsebilling/lsebilling.selector";
import {LsebillingService} from '../../../../core/lsebilling/lsebilling.service';
import { LeaseContractService } from '../../../../core/contract/lease/lease.service';
import { OwnershipContractService } from '../../../../core/contract/ownership/ownership.service';
import { SelectionModel } from '@angular/cdk/collections';
import { QueryleaseModel } from '../../../../core/contract/lease/querylease.model';
import { QueryAccountBankModel } from '../../../../core/masterData/bank/accountBank/queryaccountBank.model';
import { AccountBankService } from '../../../../core/masterData/bank/accountBank/accountBank.service';

@Component({
  selector: 'kt-edit-lsebilling',
  templateUrl: './edit-lsebilling.component.html',
  styleUrls: ['./edit-lsebilling.component.scss']
})
export class EditLeaseBillingComponent implements OnInit, OnDestroy {
	// Public properties
	lsebilling: LsebillingModel;
	LsebillingId$: Observable<string>;
	oldLsebilling: LsebillingModel;
	selectedTab = 0;
	loading$: Observable<boolean>;
	lsebillingForm: FormGroup;
	hasFormErrors = false;
	selection = new SelectionModel<LsebillingModel>(true, []);
	unitResult: any[]=[];
	bankResult: any[]=[];
	date1 = new FormControl(new Date());
	codenum : any;
	buttonSave : boolean = true;
	loading : boolean;
	// Private properties
	private subscriptions: Subscription[] = [];
  	constructor(
		private activatedRoute: ActivatedRoute,
		private router: Router,
		private lsebillingFB: FormBuilder,
		private subheaderService: SubheaderService,
		private layoutUtilsService: LayoutUtilsService,
		private store: Store<AppState>,
		private bservice : AccountBankService,
		private ownService: OwnershipContractService,
		private leaseService : LeaseContractService,
		private service: LsebillingService,
		private layoutConfigService: LayoutConfigService
	) { }

  	ngOnInit() {
		this.loading$ = this.store.pipe(select(selectLsebillingActionLoading));
		const routeSubscription =  this.activatedRoute.params.subscribe(params => {
			const id = params.id;
			if (id) {
				this.store.pipe(select(selectLsebillingById(id))).subscribe(res => {
					if (res) {
						this.lsebilling = res;
						this.oldLsebilling = Object.assign({}, this.lsebilling);
						this.initLsebilling();
					}
				});
			}
		});
		this.subscriptions.push(routeSubscription);
		}
		

	initLsebilling() {
		this.createForm();
		this.loadUnit();
		this.loadAccountBank();
	}


	createForm() {
		this.lsebillingForm = this.lsebillingFB.group({
			billingNo : [{value:this.lsebilling.billingNo, disabled:true}],
			billingDate : [{value:this.lsebilling.billingDate, disabled:true}],
			createdDate : [{value:this.lsebilling.createdDate, disabled:true}],
			dueDate: [{value:this.lsebilling.dueDate, disabled:true}],
			notes: [{value:this.lsebilling.notes, disabled:true}],
			lease : [{value:this.lsebilling.lease._id, disabled:true}],
			tenantName: [{value:this.lsebilling.lease.contact_name, disabled:true}],
			price : [{value:this.lsebilling.price, disabled:true}],
			unit :[{value:this.lsebilling.unit, disabled:true}],

			bank : ["",Validators.required],
			isPaid: true,
			customerBank : [""],
			customerBankNo : [""],
			desc : [""],
			paymentType :[""],
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
		const controls = this.lsebillingForm.controls;
		this.leaseService.findLeaseById(id).subscribe(
			data => {
				controls.tenantName.setValue(data.data.contact_name);
				controls.price.setValue(data.data.rentalAmount);
				controls.unit.setValue(data.data.unit.cdunt);
			}
		);
	}

	goBackWithId() {
		const url = `/lsebilling`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}

	refreshLsebilling(isNew: boolean = false, id:string = "") {
		let url = this.router.url;
		if (!isNew) {
			this.router.navigate([url], { relativeTo: this.activatedRoute });
			return;
		}

		url = `/lsebilling/edit/${id}`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}

	reset() {
		this.lsebilling = Object.assign({}, this.oldLsebilling);
		this.createForm();
		this.hasFormErrors = false;
		this.lsebillingForm.markAsPristine();
		this.lsebillingForm.markAsUntouched();
		this.lsebillingForm.updateValueAndValidity();
	}

	onSubmit(withBack: boolean = false) {
		this.hasFormErrors = false;
		const controls = this.lsebillingForm.controls;
		/** check form */
		if (this.lsebillingForm.invalid) {
			Object.keys(controls).forEach(controlName =>
				controls[controlName].markAsTouched()
			);

			this.hasFormErrors = true;
			this.selectedTab = 0;
			return;
		}

		this.loading  = true;
		const editedLsebilling = this.prepareLsebilling();
		this.updateLsebilling(editedLsebilling, withBack);
	}
	prepareLsebilling(): LsebillingModel {
		const controls = this.lsebillingForm.controls;
		const _lsebilling = new LsebillingModel();
		_lsebilling.clear();
		_lsebilling._id = this.lsebilling._id;
		_lsebilling.billingNo = controls.billingNo.value;
		_lsebilling.billingDate = controls.billingDate.value;
		_lsebilling.price = controls.price.value;	
		_lsebilling.dueDate = controls.dueDate.value;
		_lsebilling.notes = controls.notes.value;
		_lsebilling.lease = controls.lease.value;
		_lsebilling.unit = controls.unit.value.toLowerCase();
		_lsebilling.createdDate = controls.createdDate.value;

		_lsebilling.bank = controls.bank.value;
		_lsebilling.isPaid = controls.isPaid.value;
		_lsebilling.customerBank = controls.customerBank.value;
		_lsebilling.customerBankNo = controls.customerBankNo.value;
		_lsebilling.desc = controls.desc.value;
		_lsebilling.paidDate = controls.paidDate.value;
		_lsebilling.paymentType = controls.paymentType.value;
		return _lsebilling;
	}

	updateLsebilling(_lsebilling: LsebillingModel, withBack: boolean = false) {
		// Update User
		// tslint:disable-next-line:prefer-const
		const addSubscription = this.service.updateLsebilling(_lsebilling).subscribe(
			res => {
				const message = `Lease successfully has been saved.`;
				this.layoutUtilsService.showActionNotification(message, MessageType.Update, 5000, true, true);
				const url = `/lsebilling`;
				this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
			},
			err => {
				console.error(err);
				const message = 'Error while adding lease | ' + err.statusText;
				this.layoutUtilsService.showActionNotification(message, MessageType.Update, 5000, true, false);
			}
		);
		this.subscriptions.push(addSubscription);
	}

	getComponentTitle() {
		let result = `Update Lease Billing`;
		return result;
	}

	onAlertClose($event) {
		this.hasFormErrors = false;
	}


  	ngOnDestroy() {
		this.subscriptions.forEach(sb => sb.unsubscribe());
	}
	
}
