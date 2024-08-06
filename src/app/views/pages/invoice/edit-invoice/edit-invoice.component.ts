import { Component, OnInit, OnDestroy } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { LayoutConfigService, SubheaderService } from '../../../../core/_base/layout';
import { LayoutUtilsService, MessageType, QueryParamsModel } from '../../../../core/_base/crud';
import { select, Store } from '@ngrx/store';
import { AppState } from '../../../../core/reducers';
import { SelectionModel } from '@angular/cdk/collections';
import { InvoiceDataSource } from '../../../../core/invoice/invoice.datasource';
import { InvoiceModel } from '../../../../core/invoice/invoice.model';
import { InvoiceService } from '../../../../core/invoice/invoice.service';
import { selectInvoiceActionLoading, selectInvoiceById } from '../../../../core/invoice/invoice.selector';
import * as _moment from 'moment';
const moment = _rollupMoment || _moment;
import { default as _rollupMoment, Moment } from 'moment';
import { OwnershipContractService } from '../../../../core/contract/ownership/ownership.service';
import { QueryOwnerTransactionModel } from '../../../../core/contract/ownership/queryowner.model';
import { LeaseContractService } from '../../../../core/contract/lease/lease.service';
import { UnitService } from '../../../../core/unit/unit.service';
import { QueryUnitModel } from '../../../../core/unit/queryunit.model';
import { RequestInvoiceService } from '../../../../core/requestInvoice/requestInvoice.service';
import { QueryRequestInvoiceModel } from '../../../../core/requestInvoice/queryrequestInvoice.model';

@Component({
	selector: 'kt-edit-invoice',
	templateUrl: './edit-invoice.component.html',
	styleUrls: ['./edit-invoice.component.scss']
})
export class EditInvoiceComponent implements OnInit, OnDestroy {
	dataSource: InvoiceDataSource;
	invoice: InvoiceModel;
	invoiceId$: Observable<string>;
	oldInvoice: InvoiceModel;
	selectedTab = 0;
	loading$: Observable<boolean>;
	loading: boolean = false;
	invoiceForm: FormGroup;
	hasFormErrors = false;
	selection = new SelectionModel<InvoiceModel>(true, []);
	blockResult: any[] = [];
	blockGroupResult: any[] = [];
	buildingResult: any[] = [];
	datedefault: string;
	date = new FormControl(moment());
	date1 = new FormControl(new Date());
	serializedDate = new FormControl((new Date()).toISOString());
	codenum: any;
	blockgroupNotSelected: boolean = false;
	ownResult: any[] = [];
	isAdmin: boolean = true
	isView: boolean = true
	loadingForm: boolean
	disable: boolean
	loadingRequest: boolean
	requestResult: any[] = []
	// Private properties
	private subscriptions: Subscription[] = [];
	constructor(
		private activatedRoute: ActivatedRoute,
		private router: Router,
		private invoiceFB: FormBuilder,
		private service: InvoiceService,
		private riService: RequestInvoiceService,
		private uService: UnitService,
		private oService: OwnershipContractService,
		private leaseService: LeaseContractService,
		private layoutUtilsService: LayoutUtilsService,
		private store: Store<AppState>,
		private layoutConfigService: LayoutConfigService
	) { }
	ngOnInit() {
		this.loading$ = this.store.pipe(select(selectInvoiceActionLoading));
		const routeSubscription = this.activatedRoute.params.subscribe(params => {
			const id = params.id;
			if (id) {
				this.store.pipe(select(selectInvoiceById(id))).subscribe(res => {
					if (res) {
						this.loadingForm = true
						this.invoice = res;
						this.oldInvoice = Object.assign({}, this.invoice);
						this.initInvoice();
					}
				});
			}
		});
		this.subscriptions.push(routeSubscription);
	}

	initInvoice() {
		this.createForm();
		this.loadUnit();
		this.loadRequestInvoice()
		this.getRequestInvoice(this.invoice.request._id)
	}

	createForm() {
		this.invoiceForm = this.invoiceFB.group({
			invoiceno: [{ value: this.invoice.invoiceno, disabled: true }],
			custname: [{ value: this.invoice.custname, disabled: true }],
			unit: [{ value: this.invoice.unit, disabled: true }],
			unit2: [{ value: this.invoice.unit2, disabled: true }],
			unittype: [{ value: this.invoice.unittype, disabled: true }],
			address: [this.invoice.address],
			request: [{ value: this.invoice.request, disabled: true }],
			contract: [{ value: this.invoice.contract, disabled: true }],
			desc: [{ value: this.invoice.desc, disabled: true }],
			invoicedte: [{ value: this.invoice.invoicedte, disabled: true }],
			invoicedteout: [{ value: this.invoice.invoicedteout, disabled: true }],
			total: [{ value: this.invoice.total, disabled: true }],
			admin: [{ value: this.invoice.admin, disabled: true }],
			amount: [{ value: this.invoice.amount, disabled: true }],
			deposittype: [{ value: this.invoice.deposittype, disabled: true }],
			typerate: [{ value: this.invoice.typerate, disabled: true }],
			crtdate: [{ value: this.invoice.crtdate, disabled: true }],
			upddate: [{ value: this.date1.value, "disabled": true }],
			isclosed: [{ value: this.invoice.isclosed, disabled: false }]
		});
	}

	goBackWithId() {
		const url = `/invoice`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}

	refreshInvoice(isNew: boolean = false, id: string = "") {
		let url = this.router.url;
		if (!isNew) {
			this.router.navigate([url], { relativeTo: this.activatedRoute });
			return;
		}

		url = `/invoice/edit/${id}`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}

	loadRequestInvoice() {
		this.loadingRequest = true;
		const queryParams = new QueryRequestInvoiceModel(
			null,
			1,
			1000
		);
		this.riService.getListRequestInvoice(queryParams).subscribe(
			res => {
				console.log(res)
				this.requestResult = res.data
				this.loadingRequest = false;
			}
		);
	}

	getRequestInvoice(id) {
		const controls = this.invoiceForm.controls
		const queryParams = new QueryRequestInvoiceModel(
			null,
			1,
			1000
		);
		this.riService.findRequestInvoiceById(id).subscribe(
			res => {
				console.log(res, "get data")
				controls.request.setValue(res.data._id)
			}
		);
	}


	prepareInvoice(): InvoiceModel {
		const controls = this.invoiceForm.controls;
		const _invoice = new InvoiceModel();
		_invoice.clear();
		_invoice._id = this.invoice._id;
		_invoice.invoiceno = controls.invoiceno.value === undefined ? controls.invoiceno.value : controls.invoiceno.value.toLowerCase();
		_invoice.custname = controls.custname.value.toLowerCase();
		_invoice.unit2 = controls.unit2.value.toLowerCase();
		_invoice.unit = controls.unit.value.toLowerCase();
		_invoice.unittype = controls.unittype.value;
		_invoice.address = controls.address.value;
		_invoice.contract = controls.contract.value;
		_invoice.desc = controls.desc.value;
		_invoice.invoicedte = controls.invoicedte.value;
		_invoice.invoicedteout = controls.invoicedteout.value;
		_invoice.total = controls.total.value;
		_invoice.admin = controls.admin.value;
		_invoice.amount = controls.amount.value;
		_invoice.deposittype = controls.deposittype.value;
		_invoice.typerate = controls.typerate.value;
		_invoice.crtdate = controls.crtdate.value;
		_invoice.upddate = controls.upddate.value;
		_invoice.isclosed = controls.isclosed.value;
		return _invoice;
	}

	reset() {
		this.invoice = Object.assign({}, this.oldInvoice);
		this.createForm();
		this.invoiceForm.markAsPristine();
		this.invoiceForm.markAsUntouched();
		this.invoiceForm.updateValueAndValidity();
	}

	async loadUnit() {
		this.selection.clear();
		const queryParams = new QueryUnitModel(null,
			"asc",
			null,
			1,
			1000);
		this.uService.getDataUnitForParking(queryParams).subscribe(
			res => {
				this.ownResult = res.data;
				this.loadingForm = false
				document.body.style.height = "101%"
				window.scrollTo(0, 1);
				document.body.style.height = ""
			}
		);
	}


	updateInvoice(_invoice: InvoiceModel, withBack: boolean = false) {
		// Update User
		// tslint:disable-next-line:prefer-const
		const message = `Invoice successfully has been saved.`;
		this.layoutUtilsService.showActionNotification(message, MessageType.Update, 5000, true, true);
		const url = `/invoice`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
		const addSubscription = this.service.updateInvoice(_invoice).subscribe(
			res => {
				const message = `Invoice successfully has been saved.`;
				this.layoutUtilsService.showActionNotification(message, MessageType.Update, 5000, true, true);
				const url = `/invoice`;
				this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
			},
			// err => {
			// 	console.error(err);
			// 	const message = 'Error while adding invoice | ' + err.statusText;
			// 	this.layoutUtilsService.showActionNotification(message, MessageType.Update, 5000, true, false);
			// }
		);
		this.subscriptions.push(addSubscription);
	}

	onSubmit(withBack: boolean = false) {
		this.hasFormErrors = false;
		const controls = this.invoiceForm.controls;
		/** check form */
		if (this.invoiceForm.invalid) {
			Object.keys(controls).forEach(controlName =>
				controls[controlName].markAsTouched()
			);

			this.hasFormErrors = true;
			this.selectedTab = 0;
			return;
		}

		this.loading = true;
		const preparedInvoice = this.prepareInvoice();
		this.updateInvoice(preparedInvoice, withBack);
	}


	getComponentTitle() {
		let result = 'Update Invoice';
		return result;
	}

	onAlertClose($event) {
		this.hasFormErrors = false;
	}
	ngOnDestroy() {
		this.subscriptions.forEach(sb => sb.unsubscribe());
	}

}
