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
  templateUrl: './edit-deposit.component.html',
  styleUrls: ['./edit-deposit.component.scss']
})
export class EditDepositComponent implements OnInit, OnDestroy {
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
		// this.getNumber();
		this.getTotal();
	}

	getTotal(){
		const dpstin = this.depositForm.controls.dpstin.value;
		if (dpstin !== 0){
			this.depositForm.controls.total.setValue(dpstin);
		}
	}

	createForm() {
			this.depositForm = this.depositFB.group({
				depositno: [{value:this.deposit.depositno.toUpperCase(), disabled:true}],
				invoice : [{value:this.deposit.invoice._id, disabled:true}],
				unit2 : [{value:this.deposit.unit2, disabled:true}],
				tenantName : [{value:this.deposit.invoice.custname, disabled:true}],
				type : [{value:this.deposit.type, disabled:true}],
				isactive : false,
				descin : [{value:this.deposit.descin, disabled:true}],
				depositInDate : [{value:this.deposit.depositInDate, disabled:true}],
				pymnttype : [{value:this.deposit.pymnttype, disabled:true}, Validators.required],
				dpstin : [{value:this.deposit.dpstin, disabled:true}],
				crtdate : [{value:this.deposit.crtdate, disabled: true}],
				admin : [{value:this.deposit.admin, disabled:true}],
				// depositnoout: [{value:this.codenum, disabled:true}],
				descout  : [""],
				depositOutDate: [{value:this.date1.value, disabled:true}],
				total :[{value:"", disabled:true}],
				dpstout : ["", Validators.required],
				upddate : [{value:this.date1.value, disabled:true}],
			});
	}

	// getNumber() {
	// 	this.service.generateDepoOut().subscribe(
	// 		res => {
	// 			this.codenum = res.data
	// 			const controls = this.depositForm.controls;
	// 			controls.depositnoout.setValue(this.codenum);
				
	// 		}
	// 	)
	// }

	loadInvoice() {
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
			}
		);
	}

	changeDeposit() {
		const dpstin = this.depositForm.controls.dpstin.value;
		const dpstout = this.depositForm.controls.dpstout.value;
		if (dpstin !== 0 && dpstout !== 0 ) {
				this.depositForm.controls.total.setValue(dpstin - dpstout);
		}
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

	reset() {
		this.deposit = Object.assign({}, this.oldDeposit);
		this.createForm();
		this.hasFormErrors = false;
		this.depositForm.markAsPristine();
		this.depositForm.markAsUntouched();
		this.depositForm.updateValueAndValidity();
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
		const preparedDeposit = this.prepareDepositGroup();
		this.updateDeposit(preparedDeposit, withBack);
	}
	prepareDepositGroup(): DepositModel {
		const controls = this.depositForm.controls;
		const _deposit = new DepositModel();
		_deposit.clear();
		_deposit._id = this.deposit._id;
		_deposit.depositno = controls.depositno.value.toLowerCase();
		_deposit.invoice = controls.invoice.value;
		_deposit.type = controls.type.value;
		_deposit.descin = controls.descin.value;
		_deposit.depositInDate = controls.depositInDate.value;
		_deposit.pymnttype = controls.pymnttype.value;
		_deposit.isactive = controls.isactive.value;
		_deposit.dpstin = controls.dpstin.value;
		_deposit.crtdate = controls.crtdate.value;
		_deposit.unit2 = controls.unit2.value.toLowerCase();
		_deposit.admin = controls.admin.value;

		// _deposit.depositnoout = controls.depositnoout.value.toLowerCase();
		_deposit.descout = controls.descout.value;
		_deposit.depositOutDate = controls.depositOutDate.value;
		_deposit.total = controls.total.value;
		_deposit.dpstout = controls.dpstout.value;
		_deposit.upddate = controls.upddate.value;
		return _deposit;
	}

	updateDeposit(_deposit: DepositModel, withBack: boolean = false) {
		const editSubscription = this.blksrv.updateDeposit(_deposit).subscribe(
			res => {
				const message = `Deposit successfully has been saved.`;
				this.layoutUtilsService.showActionNotification(message, MessageType.Update, 5000, true, true);
				if (withBack) {
					this.goBackWithId();
				} else {
					this.refreshDeposit(false);
					const url = `/deposit`;
					this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
				}
			},
			err => {
				console.error(err);
				const message = 'Error while editing deposit | ' + err.statusText;
				this.layoutUtilsService.showActionNotification(message, MessageType.Update, 5000, true, false);
			}
		);
		this.subscriptions.push(editSubscription);
	}
	
	ngOnDestroy(){
		this.subscriptions.forEach(sb => sb.unsubscribe());
	}

	getComponentTitle() {
		let result = 'Update Deposit';
		return result;
	}

	onAlertClose($event) {
		this.hasFormErrors = false;
	}
}
