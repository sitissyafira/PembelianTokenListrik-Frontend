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
  selector: 'kt-view-powbill',
  templateUrl: './view-powbill.component.html',
  styleUrls: ['./view-powbill.component.scss']
})
export class ViewPowbillComponent implements OnInit, OnDestroy {
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
	bankResult : any[] = [];
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
		private bservice : AccountBankService,
		private service: PowbillService,
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
				fee : [{value:this.powbill.fee, disabled:true}],
				notes : [{value:this.powbill.notes, disabled:true}],
				createdDate : [{value:this.date1.value, disabled:true}],

				bank : [{value:this.powbill.bank, disabled:true}],
				isPaid: [{value:this.powbill.isPaid, disabled:true}],
				customerBank : [{value:this.powbill.customerBank, disabled:true}],
				customerBankNo : [{value:this.powbill.customerBankNo, disabled:true}],
				desc : [{value:this.powbill.desc, disabled:true}],
				paymentType : [{value:this.powbill.paymentType, disabled:true}],
				paidDate : [{value:this.powbill.paidDate, disabled:true}]
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


	getComponentTitle() {
		let result = 'View Power Billing';
		return result;
	}

	onAlertClose($event) {
		this.hasFormErrors = false;
	}

  	ngOnDestroy() {
		this.subscriptions.forEach(sb => sb.unsubscribe());
	}
	
}
