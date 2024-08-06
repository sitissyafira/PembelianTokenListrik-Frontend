import { Component, OnInit, OnDestroy } from '@angular/core';
import { Observable, Subscription} from 'rxjs';
import {FormBuilder, FormGroup, Validators, FormControl} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {LayoutConfigService, SubheaderService} from '../../../../core/_base/layout';
import {LayoutUtilsService, MessageType, QueryParamsModel} from '../../../../core/_base/crud';
import {select, Store} from '@ngrx/store';
import {AppState} from '../../../../core/reducers';
import {SelectionModel} from '@angular/cdk/collections';
import {DepositDataSource} from '../../../../core/deposit/deposit.datasource';
import {DepositModel} from '../../../../core/deposit/deposit.model';
import {DepositService} from '../../../../core/deposit/deposit.service';
import {selectDepositActionLoading} from '../../../../core/deposit/deposit.selector';
import { UnitService } from '../../../../core/unit/unit.service';
import { QueryUnitModel } from '../../../../core/unit/queryunit.model';
import * as _moment from 'moment';
const moment = _rollupMoment || _moment;
import {default as _rollupMoment, Moment} from 'moment';

import { QueryInvoiceModel } from '../../../../core/invoice/queryinvoice.model';
import { InvoiceService } from '../../../../core/invoice/invoice.service';

@Component({
  selector: 'kt-add-deposit',
  templateUrl: './add-deposit.component.html',
  styleUrls: ['./add-deposit.component.scss']
})
export class AddDepositComponent implements OnInit, OnDestroy {
	dataSource: DepositDataSource;
	deposit: DepositModel;
	depositId$: Observable<string>;
	oldDeposit: DepositModel;
	selectedTab = 0;
	loading$: Observable<boolean>;
	loading : boolean = false;
	depositForm: FormGroup;
	hasFormErrors = false;
	selection = new SelectionModel<DepositModel>(true, []);
	invResult: any[] = [];
	datedefault: string;
	date = new FormControl(moment());
	date1 = new FormControl(new Date());
	serializedDate = new FormControl((new Date()).toISOString());
	codenum: any;
	blockgroupNotSelected: boolean = true;
	ownResult: any[] = [];
	// Private properties
	private subscriptions: Subscription[] = [];
	constructor(
		private activatedRoute: ActivatedRoute,
		private router: Router,
		private depositFB: FormBuilder,
		private service: DepositService,
		private invService : InvoiceService,
		private layoutUtilsService: LayoutUtilsService,
		private store: Store<AppState>,
		private layoutConfigService: LayoutConfigService
	) { }
	ngOnInit() {
		this.loading$ = this.store.pipe(select(selectDepositActionLoading));
		const routeSubscription =  this.activatedRoute.params.subscribe(params => {
			this.deposit = new DepositModel();
			this.deposit.clear();
			this.initDeposit();
		});
		this.subscriptions.push(routeSubscription);
	}
	initDeposit(){
		this.createForm();
		this.getNumber();
		this.loadInvoice()
	}

	createForm() {
		this.depositForm = this.depositFB.group({
			depositno: [{"value": this.codenum, "disabled":true}],
			invoice : [""],
			unit2 : [{value:"", disabled:true}],
			tenantName : [{value:"", disabled:true}],
			type : [{value:"", disabled:true}],
			isactive : true,
			admin : [""],
			descin : [""],
			depositInDate : [{value:this.date1.value, disabled:false}],
			pymnttype : ["", Validators.required],
			total : [""],
			dpstin : [{value:"", disabled:true}],
			crtdate : [{value:this.date1.value, disabled: false}],
		});
	}

	getNumber() {
		this.service.generateDepositCode().subscribe(
			res => {
				this.codenum = res.data
				const controls = this.depositForm.controls;
				controls.depositno.setValue(this.codenum);
				
			}
		)
	}

	loadInvoice() {
		this.selection.clear();
		const queryParams = new QueryInvoiceModel(
			null,
			"asc",
			null,
			1,
			1000
		);
		this.invService.getListFalseInvoice(queryParams).subscribe(
			res => {
				this.invResult = res.data;
			}
		);
	}

	getInvoice(id){
		const controls = this.depositForm.controls;
		 this.invService.findInvoiceById(id).subscribe(data =>{
			controls.tenantName.setValue(data.data.custname);
			controls.unit2.setValue(data.data.unit2.toUpperCase());
			controls.descin.setValue(data.data.desc);
			controls.type.setValue(data.data.deposittype);
			controls.dpstin.setValue(data.data.amount);
			controls.total.setValue(data.data.amount);
			controls.admin.setValue(data.data.admin);
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

	prepareDeposit(): DepositModel {
		const controls = this.depositForm.controls;
		const _deposit = new DepositModel();
		_deposit.clear();
		_deposit.depositno = controls.depositno.value.toLowerCase();
		_deposit.invoice = controls.invoice.value;
		_deposit.type = controls.type.value;
		_deposit.descin = controls.descin.value;
		_deposit.depositInDate = controls.depositInDate.value;
		_deposit.pymnttype = controls.pymnttype.value;
		_deposit.isactive = controls.isactive.value;
		_deposit.unit2 = controls.unit2.value.toLowerCase();
		_deposit.dpstin = controls.dpstin.value;
		_deposit.total = controls.total.value;
		_deposit.admin = controls.admin.value;
		_deposit.crtdate = controls.crtdate.value;
		return _deposit;
	}

	addDeposit(_deposit: DepositModel, withBack: boolean = false) {
		const addSubscription = this.service.createDeposit(_deposit).subscribe(
			res => {
				const message = `New deposit successfully has been added.`;
				this.layoutUtilsService.showActionNotification(message, MessageType.Create, 5000, true, true);
				const url = `/deposit`;
				this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
			},
			err => {
				console.error(err);
				const message = 'Error while adding deposit | ' + err.statusText;
				this.layoutUtilsService.showActionNotification(message, MessageType.Create, 5000, true, false);
			}
		);
		this.subscriptions.push(addSubscription);
	}
	onSubmit(withBack: boolean = false) {
		this.hasFormErrors = false;
		const controls = this.depositForm.controls;
		/** check form */
		if (this.depositForm.invalid) {
			Object.keys(controls).forEach(controlName =>
				controls[controlName].markAsTouched()
			);

			this.hasFormErrors = true;
			this.selectedTab = 0;
			return;
		}

		this.loading = true
		const preparedDeposit = this.prepareDeposit();
		this.addDeposit(preparedDeposit, withBack);
	}
	getComponentTitle() {
		let result = 'Create Deposit';

		return result;
	}
	onAlertClose($event) {
		this.hasFormErrors = false;
	}
	ngOnDestroy(){
		this.subscriptions.forEach(sb => sb.unsubscribe());
	}

}
