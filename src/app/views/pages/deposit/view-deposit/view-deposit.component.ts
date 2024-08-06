import { Component, OnInit, OnDestroy } from '@angular/core';
import {BehaviorSubject, Observable, Subscription} from 'rxjs';
import {FormBuilder, FormGroup, Validators, FormControl} from '@angular/forms';
import {DepositModel} from '../../../../core/deposit/deposit.model';
import {ActivatedRoute, Router} from '@angular/router';
import {LayoutConfigService, } from '../../../../core/_base/layout';
import {LayoutUtilsService, MessageType } from '../../../../core/_base/crud';
import {select, Store} from '@ngrx/store';
import {AppState} from '../../../../core/reducers';
import {
	selectDepositActionLoading,
	selectDepositById,
} from '../../../../core/deposit/deposit.selector'
import {SelectionModel} from '@angular/cdk/collections';
import {DepositService} from '../../../../core/deposit/deposit.service';
import * as _moment from 'moment';
const moment = _rollupMoment || _moment;
import {default as _rollupMoment, Moment} from 'moment';

import { QueryInvoiceModel } from '../../../../core/invoice/queryinvoice.model';
import { InvoiceService } from '../../../../core/invoice/invoice.service';

@Component({
  selector: 'kt-edit-deposit',
  templateUrl: './view-deposit.component.html',
  styleUrls: ['./view-deposit.component.scss']
})
export class ViewDepositComponent implements OnInit, OnDestroy {
	deposit: DepositModel;
	depositId$: Observable<string>;
	oldDeposit: DepositModel;
	selectedTab = 0;
	loading$: Observable<boolean>;
	depositForm: FormGroup;
	selection = new SelectionModel<DepositModel>(true, []);
	hasFormErrors = false;
	invResult: any[] = [];
	datedefault: string;
	codenum: any;
	date = new FormControl(moment());
	date1 = new FormControl(new Date());
	serializedDate = new FormControl((new Date()).toISOString());
	loading : boolean = false;
	// Private properties
	buttonUpdate : boolean = true
	loadingForm: boolean
	private subscriptions: Subscription[] = [];
	constructor(private activatedRoute: ActivatedRoute,
				private router: Router,
				private depositFB: FormBuilder,
				private layoutUtilsService: LayoutUtilsService,
				private store: Store<AppState>,
				private invService : InvoiceService,
				private service: DepositService,
				private blksrv: DepositService,
				private layoutConfigService: LayoutConfigService) { }

	ngOnInit() {
		this.loadingForm = true
		this.loading$ = this.store.pipe(select(selectDepositActionLoading));
		const routeSubscription =  this.activatedRoute.params.subscribe(params => {
			const id = params.id;
			if(id){
				this.store.pipe(select(selectDepositById(id))).subscribe(res => {
					if (res) {
						this.deposit = res;
						this.oldDeposit = Object.assign({}, this.deposit);
						this.initDeposit();
					}
				});

			}
		});
		this.subscriptions.push(routeSubscription);
	}
	initDeposit() {
		this.createForm();
		this.loadInvoice();
	}

	createForm() {
			this.depositForm = this.depositFB.group({
				depositno: [{value:this.deposit.depositno.toUpperCase(), disabled:true}],
				invoice : [{value:this.deposit.invoice._id, disabled:true}],
				unit2 : [{value:this.deposit.unit2, disabled:true}],
				tenantName : [{value:this.deposit.invoice.custname, disabled:true}],
				type : [{value:this.deposit.type, disabled:true}],
				isactive : true,
				descin : [{value:this.deposit.descin, disabled:true}],
				depositInDate : [{value:this.deposit.depositInDate, disabled:true}],
				pymnttype : [{value:this.deposit.pymnttype, disabled:true}],
				dpstin : [{value:this.deposit.dpstin, disabled:true}],
				crtdate : [{value:this.deposit.crtdate, disabled: true}],

				depositnoout: [{value:this.deposit.depositnoout, disabled:true}],
				descout  : [{value:this.deposit.descout, disabled:true}],
				depositOutDate: [{value:this.deposit.depositOutDate, disabled:true}],
				total :[{value:this.deposit.total, disabled:true}],
				dpstout : [{value:this.deposit.dpstout, disabled:true}],
				upddate : [{value:this.date1.value, disabled:true}],
			});
	}

	async loadInvoice() {
		this.selection.clear();
		const queryParams = new QueryInvoiceModel(
			null,
			"asc",
			null,
			1,
			1000
		);
		this.invService.getListInvoice(queryParams).subscribe(
			res => {
				this.invResult = res.data;
				this.loadingForm = false
				document.body.style.height = "101%"
				window.scrollTo(0, 1);
				document.body.style.height = ""
			}
		);
	}

	goBackWithId() {
		const url = `/deposit`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}

	refreshDeposit(isNew: boolean = false, id:string = "") {
		let url = this.router.url;
		if (!isNew) {
			this.router.navigate([url], { relativeTo: this.activatedRoute });
			return;
		}

		url = `/deposit/edit/${id}`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}
	
	ngOnDestroy(){
		this.subscriptions.forEach(sb => sb.unsubscribe());
	}

	getComponentTitle() {
		let result = 'View Deposit';
		return result;
	}

	onAlertClose($event) {
		this.hasFormErrors = false;
	}
}
