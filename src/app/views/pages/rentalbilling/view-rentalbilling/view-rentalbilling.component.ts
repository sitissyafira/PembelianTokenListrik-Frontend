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
  selector: 'kt-view-rentalbilling',
  templateUrl: './view-rentalbilling.component.html',
  styleUrls: ['./view-rentalbilling.component.scss']
})
export class ViewRentalBillingComponent implements OnInit, OnDestroy {
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
	loadingForm : boolean
	// Private properties
	private subscriptions: Subscription[] = [];
  	constructor(
		private activatedRoute: ActivatedRoute,
		private router: Router,
		private rentalbillingFB: FormBuilder,
		private subheaderService: SubheaderService,
		private layoutUtilsService: LayoutUtilsService,
		private store: Store<AppState>,
		private leaseService : LeaseContractService,
		private bservice : AccountBankService,
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
						this.loadingForm = true;
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
	if (this.rentalbilling._id){
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


			bank : [{value:this.rentalbilling.bank, disabled:true}],
			isPaid: [{value:this.rentalbilling.isPaid, disabled:true}],
			customerBank : [{value:this.rentalbilling.customerBank, disabled:true}],
			customerBankNo : [{value:this.rentalbilling.customerBankNo, disabled:true}],
			desc : [{value:this.rentalbilling.desc, disabled:true}],
			paidDate : [{value:this.rentalbilling.paidDate, disabled:true}],
			paymentType : [{value:this.rentalbilling.paymentType, disabled:true}]

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


	getComponentTitle() {
		let result = `View Rental Billing`;
		return result;
	}

	onAlertClose($event) {
		this.hasFormErrors = false;
	}

	
  	ngOnDestroy() {
		this.subscriptions.forEach(sb => sb.unsubscribe());
	}
	
}
