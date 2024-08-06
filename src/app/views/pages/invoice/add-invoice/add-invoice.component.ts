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
import { selectInvoiceActionLoading } from '../../../../core/invoice/invoice.selector';
import * as _moment from 'moment';
const moment = _rollupMoment || _moment;
import { default as _rollupMoment, Moment } from 'moment';
import { OwnershipContractService } from '../../../../core/contract/ownership/ownership.service';
import { LeaseContractService } from '../../../../core/contract/lease/lease.service';
import { UnitService } from '../../../../core/unit/unit.service';
import { QueryUnitModel } from '../../../../core/unit/queryunit.model';
import { RequestInvoiceService } from '../../../../core/requestInvoice/requestInvoice.service';
import { QueryRequestInvoiceModel } from '../../../../core/requestInvoice/queryrequestInvoice.model';

@Component({
	selector: 'kt-add-invoice',
	templateUrl: './add-invoice.component.html',
	styleUrls: ['./add-invoice.component.scss']
})
export class AddInvoiceComponent implements OnInit, OnDestroy {
	dataSource: InvoiceDataSource;
	invoice: InvoiceModel;
	type;
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
		private uService: UnitService,
		private oService: OwnershipContractService,
		private riService: RequestInvoiceService,
		private leaseService: LeaseContractService,
		private layoutUtilsService: LayoutUtilsService,
		private store: Store<AppState>,
		private layoutConfigService: LayoutConfigService
	) { }
	ngOnInit() {
		this.loading$ = this.store.pipe(select(selectInvoiceActionLoading));
		const routeSubscription = this.activatedRoute.params.subscribe(params => {
			{
				this.invoice = new InvoiceModel();
				this.invoice.clear();
				this.initInvoice();
			}
		});
		this.subscriptions.push(routeSubscription);
	}

	initInvoice() {
		this.createForm();
		this.loadUnit();
		this.getdps();
		this.loadRequestInvoice()
	}

	createForm() {
		this.getNumber();
		this.invoiceForm = this.invoiceFB.group({
			invoiceno: [{ value: this.codenum, disabled: true }],
			custname: [""],
			unit: [""],
			unit2: [""],
			unittype: [""],
			request: [undefined],
			address: [""],
			contract: [""],
			desc: [""],
			invoicedte: [{ value: this.date1.value, disabled: true }],
			invoicedteout: ["", Validators.required],
			total: [{ value: "", disabled: true }],
			admin: [""],
			amount: [""],
			deposittype: [""],
			typerate: [""],
			crtdate: [{ value: this.date1.value, "disabled": true }],
			upddate: [""],
			isclosed: false,
		});
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
		this.riService.getListRequestInvoiceOpen(queryParams).subscribe(
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
				controls.deposittype.setValue(res.data.type_deposit)
				controls.unit.setValue(res.data.unit)
				this.getdps()
				this.getSingleCustomer(res.data.unit)
			}
		);
	}

	getSingleCustomer(id) {
		const controls = this.invoiceForm.controls;
		this.uService.getUnitById(id).subscribe(
			data => {
				this.type = data.data.type;

				if (this.type == "owner" || this.type == "pp") {
					this.oService.findOwnershipContractByUnit(id).subscribe(
						dataowner => {
							console.log(dataowner);
							this.invoiceForm.controls.contract.setValue(dataowner.data[0]._id);
							this.invoiceForm.controls.custname.setValue(dataowner.data[0].contact_name);
							this.invoiceForm.controls.unit2.setValue(dataowner.data[0].unit2);
							this.invoiceForm.controls.address.setValue(dataowner.data[0].contact_address);
							this.invoiceForm.controls.unittype.setValue(dataowner.data[0].unit.unttp.unttp);
						}
					)
				} else {
					this.leaseService.findLeaseContractByUnit(id).subscribe(
						datalease => {
							console.log(datalease);
							this.invoiceForm.controls.contract.setValue(datalease.data[0]._id);
							this.invoiceForm.controls.custname.setValue(datalease.data[0].contact_name);
							this.invoiceForm.controls.unit2.setValue(datalease.data[0].unit2);
							this.invoiceForm.controls.address.setValue(datalease.data[0].contact_address);
							this.invoiceForm.controls.unittype.setValue(datalease.data[0].unit.unttp.unttp);
						}
					)
				}
			}
		);
	}
	changeValue() {
		const typerate = this.invoiceForm.controls.typerate.value;
		const amount = this.invoiceForm.controls.amount.value;
		const admin = this.invoiceForm.controls.admin.value;
		if (typerate === "pr") {
			const data1 = (amount / 100) * admin
			const data2 = (amount + data1)
			this.invoiceForm.controls.total.setValue(data2);
		} else {
			const data = (amount + admin)
			this.invoiceForm.controls.total.setValue(data);
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

	prepareInvoice(): InvoiceModel {
		const controls = this.invoiceForm.controls;
		const _invoice = new InvoiceModel();
		console.log(controls.invoiceno.value);

		_invoice.clear();
		_invoice._id = this.invoice._id;
		_invoice.invoiceno = controls.invoiceno.value === undefined ? controls.invoiceno.value : controls.invoiceno.value.toLowerCase();
		_invoice.custname = controls.custname.value.toLowerCase();
		_invoice.unit = controls.unit.value;
		_invoice.unit2 = controls.unit2.value.toLowerCase();
		_invoice.unittype = controls.unittype.value;
		_invoice.address = controls.address.value;
		_invoice.request = controls.request.value;
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
				// this.loadingForm = false
				// document.body.style.height = "101%"
				// window.scrollTo(0, 1);
				// document.body.style.height = ""
			}
		);
	}


	getdps() {
		const data = this.invoiceForm.controls.deposittype.value;
		if (data === "fitting out deposit") {
			this.isAdmin = false
		} else if (data == "pinjam pakai deposit") {
			this.isAdmin = false
		} else
			this.isAdmin = true
	}


	addInvoice(_invoice: InvoiceModel, withBack: boolean = false) {
		const message = `New invoice successfully has been added.`;
		this.layoutUtilsService.showActionNotification(message, MessageType.Create, 5000, true, true);
		const url = `/invoice`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
		const addSubscription = this.service.createInvoice(_invoice).subscribe(
			res => {
				const message = `New invoice successfully has been added.`;
				this.layoutUtilsService.showActionNotification(message, MessageType.Create, 5000, true, true);
				const url = `/invoice`;
				this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
			},
			err => {
				console.error(err);
				const message = 'Error while adding building | ' + err.statusText;
				this.layoutUtilsService.showActionNotification(message, MessageType.Create, 5000, true, false);
			}
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
		this.addInvoice(preparedInvoice, withBack);
	}

	getComponentTitle() {
		let result = 'Create Invoice';
		return result;
	}

	onAlertClose($event) {
		this.hasFormErrors = false;
	}
	ngOnDestroy() {
		this.subscriptions.forEach(sb => sb.unsubscribe());
	}

}
