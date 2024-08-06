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
import {PowbillModel} from "../../../../core/powbill/powbill.model";
import {
	selectLastCreatedPowbillId,
	selectPowbillActionLoading,
	selectPowbillById
} from "../../../../core/powbill/powbill.selector";
import {PowbillService} from '../../../../core/powbill/powbill.service';
import { SelectionModel } from '@angular/cdk/collections';
import { QueryPowbillModel } from '../../../../core/powbill/querypowbill.model';
import { OwnershipContractService } from '../../../../core/contract/ownership/ownership.service';
import { QueryPowerRateModel } from '../../../../core/power/rate/queryrate.model';
import { PowerMeterService, PowerRateService } from '../../../../core/power';
import { QueryOwnerTransactionModel } from '../../../../core/contract/ownership/queryowner.model';
import { QueryAccountBankModel } from '../../../../core/masterData/bank/accountBank/queryaccountBank.model';
import { AccountBankService } from '../../../../core/masterData/bank/accountBank/accountBank.service';

@Component({
  selector: 'kt-edit-powbill',
  templateUrl: './edit-powbill.component.html',
  styleUrls: ['./edit-powbill.component.scss']
})
export class EditPowbillComponent implements OnInit, OnDestroy {
	// Public properties
	powbill: PowbillModel;
	PowbillId$: Observable<string>;
	oldPowbill: PowbillModel;
	selectedTab = 0;
	loading$: Observable<boolean>;
	powbillForm: FormGroup;
	hasFormErrors = false;
	selection = new SelectionModel<PowbillModel>(true, []);
	ownResult: any[] = [];
	rateResult: any[] = [];
	bankResult: any[] = [];
	date1 = new FormControl(new Date());
	codenum : any
	// Private properties
	private subscriptions: Subscription[] = [];
  	constructor(
		private activatedRoute: ActivatedRoute,
		private router: Router,
		private powbillFB: FormBuilder,
		private subheaderService: SubheaderService,
		private layoutUtilsService: LayoutUtilsService,
		private store: Store<AppState>,
		private service: PowbillService,
		private bservice : AccountBankService,
		private power : PowerRateService,
		private owner : OwnershipContractService,
		private powerMaster :  PowerMeterService,
		private layoutConfigService: LayoutConfigService
	) { }

  	ngOnInit() {
		this.loading$ = this.store.pipe(select(selectPowbillActionLoading));
		const routeSubscription =  this.activatedRoute.params.subscribe(params => {
			const id = params.id;
			if (id) {
				this.store.pipe(select(selectPowbillById(id))).subscribe(res => {
					if (res) {
						this.powbill = res;
						this.oldPowbill = Object.assign({}, this.powbill);
						this.initPowbill();
					}
				});
			}
		});
		this.subscriptions.push(routeSubscription);
  	}

	initPowbill() {
		this.createForm();
		this.loadRateList();
		this.loadOwnerList();
		this.loadAccountBank();
	}

	createForm() {
		if (this.powbill._id){
			this.powbillForm = this.powbillFB.group({
				billingno: [{value:this.powbill.billingno, disabled:true}],
				owner: [{value:this.powbill.owner._id, disabled:true}],
				unit : [{value:this.powbill.unit, disabled:true}],
				rate : [{value:this.powbill.rate, disabled:true}],
				tenantName : [{value:this.powbill.owner.contact_name, disabled:true}],
				powerrate : [{value:this.powbill.powerrate._id, disabled:true}],
				powermeter : [{value:this.powbill.powermeter, disabled:true}],
				fee : [{value:this.powbill.fee, disabled:true}],
				notes : [{value:this.powbill.notes, disabled:true}],
				createdDate : [{value:this.powbill.createdDate, disabled:true}],
				billingDate : [{value:this.powbill.billingDate, disabled:true }],
				dueDate     : [{value:this.powbill.dueDate, disabled:true}],

				bank : ["", Validators.required],
				isPaid: true,
				customerBank : [""],
				customerBankNo : [""],
				desc : [""],
				paymentType : [""],
				paidDate : [{value:this.date1.value, disabled:false}]
			});
		}
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
		this.power.getListPowerRate(queryParams).subscribe(
			res => {
				this.rateResult = res.data;
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

	loadOwnerList(){
		this.selection.clear();
		const queryParams = new QueryOwnerTransactionModel(
			null,
			"asc",
			null,
			1,
			1000
		);
		this.owner.getListOwnershipContract(queryParams).subscribe(
			res => {
				this.ownResult = res.data;
			}
		);
	}



	getOwner(id){
		const controls = this.powbillForm.controls;
		this.owner.findOwneshipById(id).subscribe(
			data => {
				controls.tenantName.setValue(data.data.contact_name);
				controls.rate.setValue(data.data.unit.pwrmtr.rte.nmrtepow.toUpperCase());
				
			}
		);
	}

	
	
	goBackWithId() {
		const url = `/powbill`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}

	refreshPowbill(isNew: boolean = false, id:string = "") {
		let url = this.router.url;
		if (!isNew) {
			this.router.navigate([url], { relativeTo: this.activatedRoute });
			return;
		}

		url = `/powbill/edit/${id}`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}

	reset() {
		this.powbill = Object.assign({}, this.oldPowbill);
		this.createForm();
		this.hasFormErrors = false;
		this.powbillForm.markAsPristine();
		this.powbillForm.markAsUntouched();
		this.powbillForm.updateValueAndValidity();
	}

	onSubmit(withBack: boolean = false) {
		this.hasFormErrors = false;
		const controls = this.powbillForm.controls;
		/** check form */
		if (this.powbillForm.invalid) {
			Object.keys(controls).forEach(controlName =>
				controls[controlName].markAsTouched()
			);

			this.hasFormErrors = true;
			this.selectedTab = 0;
			return;
		}

		const editedPowbill = this.preparePowbill();
		this.updatePowbill(editedPowbill, withBack);
	}
	preparePowbill(): PowbillModel {
		const controls = this.powbillForm.controls;
		const _powbill = new PowbillModel();
		_powbill.clear();
		_powbill._id = this.powbill._id;
		_powbill.billingno = controls.billingno.value;
		_powbill.owner = controls.owner.value;
		_powbill.unit = controls.unit.value.toLowerCase();
		_powbill.rate = controls.rate.value;
		_powbill.fee = controls.fee.value;
		_powbill.notes = controls.notes.value;
		_powbill.powerrate = controls.powerrate.value;
		_powbill.powermeter = controls.powermeter.value;
		_powbill.createdDate = controls.createdDate.value;
		_powbill.billingDate = controls.billingDate.value;
		_powbill.dueDate = controls.dueDate.value;


		_powbill.bank = controls.bank.value;
		_powbill.isPaid = controls.isPaid.value;
		_powbill.customerBank = controls.customerBank.value;
		_powbill.customerBankNo = controls.customerBankNo.value;
		_powbill.desc = controls.desc.value;
		_powbill.paidDate = controls.paidDate.value;
		_powbill.paymentType = controls.paymentType.value;
		return _powbill;
	}


	updatePowbill(_powbill: PowbillModel, withBack: boolean = false) {
		// Update User
		// tslint:disable-next-line:prefer-const
		const addSubscription = this.service.updatePowbill(_powbill).subscribe(
			res => {
				const message = `Power billing successfully has been saved.`;
				this.layoutUtilsService.showActionNotification(message, MessageType.Update, 5000, true, true);
				const url = `/pwbill`;
				this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
			},
			err => {
				console.error(err);
				const message = 'Error while adding power billing | ' + err.statusText;
				this.layoutUtilsService.showActionNotification(message, MessageType.Update, 5000, true, false);
			}
		);
		this.subscriptions.push(addSubscription);
	}

	getComponentTitle() {
		let result = 'Update Power Billing';
		return result;
	}

	onAlertClose($event) {
		this.hasFormErrors = false;
	}

  	ngOnDestroy() {
		this.subscriptions.forEach(sb => sb.unsubscribe());
	}
	
}
