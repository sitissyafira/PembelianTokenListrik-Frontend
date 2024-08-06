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
import { RequestInvoiceService } from '../../../../core/requestInvoice/requestInvoice.service';
import { QueryRequestInvoiceModel } from '../../../../core/requestInvoice/queryrequestInvoice.model';

@Component({
	selector: 'kt-add-invoice',
	templateUrl: './view-invoice.component.html',
	styleUrls: ['./view-invoice.component.scss']
})
export class ViewInvoiceComponent implements OnInit, OnDestroy {
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
	isView: boolean = true
	loadingForm: boolean
	loadingRequest: boolean
	requestResult: any[] = []
	// Private properties
	private subscriptions: Subscription[] = [];
	constructor(
		private activatedRoute: ActivatedRoute,
		private router: Router,
		private invoiceFB: FormBuilder,
		private service: InvoiceService,
		private uService: UnitService,
		private riService: RequestInvoiceService,
		private ownService: OwnershipContractService,
		private leaseService: LeaseContractService,
		private layoutUtilsService: LayoutUtilsService,
		private store: Store<AppState>,
		private layoutConfigService: LayoutConfigService
	) { }
	ngOnInit() {
		this.loadingForm = true
		this.loading$ = this.store.pipe(select(selectInvoiceActionLoading));
		const routeSubscription = this.activatedRoute.params.subscribe(params => {
			const id = params.id;
			if (id) {
				this.store.pipe(select(selectInvoiceById(id))).subscribe(res => {
					if (res) {
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

	}

	createForm() {
		if (this.invoice._id) {
			this.invoiceForm = this.invoiceFB.group({
				invoiceno: [{ value: this.invoice.invoiceno === undefined ? this.invoice.invoiceno : this.invoice.invoiceno.toUpperCase(), disabled: true }],
				custname: [{ value: this.invoice.custname, disabled: true }],
				unit: [{ value: this.invoice.unit, disabled: true }],
				unittype: [{ value: this.invoice.unittype, disabled: true }],
				address: [{ value: this.invoice.address }],
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
				upddate: [""],
				isclosed: [{ value: this.invoice.isclosed, disabled: false }]
			});
		}
	}

	getNumber() {
		this.service.generateInvoiceCode().subscribe(
			res => {
				this.codenum = res.data
				const controls = this.invoiceForm.controls;
				controls.invoiceno.setValue(this.codenum);
			}
		)
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
				console.log(res)
				controls.request.setValue(res.data._id)
			}
		);
	}

	changeValue() {
		const total = this.invoiceForm.controls.total.value;
		const type = this.invoiceForm.controls.type.value;
		const diskon = this.invoiceForm.controls.discount.value;
		if (type === "pr") {
			const data1 = (total / 100) * diskon
			this.invoiceForm.controls.amount.setValue(total - data1);
		} else {
			const data = total - diskon
			this.invoiceForm.controls.amount.setValue(data);
		}
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



	async loadUnit() {
		this.selection.clear();
		const queryParams = new QueryOwnerTransactionModel(null,
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

	getComponentTitle() {
		if (this.invoice._id) {
			let result = 'View Invoice';
			return result;
		}
	}

	onAlertClose($event) {
		this.hasFormErrors = false;
	}

	ngOnDestroy() {
		this.subscriptions.forEach(sb => sb.unsubscribe());
	}

}
