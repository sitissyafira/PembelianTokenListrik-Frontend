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
import { QueryOwnerTransactionModel } from '../../../../core/contract/ownership/queryowner.model';
import { LeaseContractService } from '../../../../core/contract/lease/lease.service';
import { OwnershipContractService } from '../../../../core/contract/ownership/ownership.service';
import { SelectionModel } from '@angular/cdk/collections';
import { QueryleaseModel } from '../../../../core/contract/lease/querylease.model';
import { QueryAccountBankModel } from '../../../../core/masterData/bank/accountBank/queryaccountBank.model';
import { AccountBankService } from '../../../../core/masterData/bank/accountBank/accountBank.service';

@Component({
  selector: 'kt-view-lsebilling',
  templateUrl: './view-lsebilling.component.html',
  styleUrls: ['./view-lsebilling.component.scss']
})
export class ViewLeaseBillingComponent implements OnInit, OnDestroy {
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
	loadingForm : boolean;
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
						this.loadingForm = true;
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
	if (this.lsebilling._id){
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
			

			bank : [{value:this.lsebilling.bank, disabled:true}],
				isPaid: [{value:this.lsebilling.isPaid, disabled:true}],
				customerBank : [{value:this.lsebilling.customerBank, disabled:true}],
				customerBankNo : [{value:this.lsebilling.customerBankNo, disabled:true}],
				
				desc : [{value:this.lsebilling.desc, disabled:true}],
				
				paidDate : [{value:this.lsebilling.paidDate, disabled:true}],
				paymentType : [{value:this.lsebilling.paymentType, disabled:true}]
			});
		}
	}

	async loadUnit() {
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

				this.loadingForm = false
				document.body.style.height = "101%"
				window.scrollTo(0, 1);
				document.body.style.height = ""
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


	getComponentTitle() {
		let result = 'View Lease Billing';
		return result;
	}

	onAlertClose($event) {
		this.hasFormErrors = false;
	}
	
  	ngOnDestroy() {
		this.subscriptions.forEach(sb => sb.unsubscribe());
	}
	
}
