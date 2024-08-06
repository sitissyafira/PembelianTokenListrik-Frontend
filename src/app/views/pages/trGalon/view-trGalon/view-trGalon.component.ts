
import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Observable, Subscription } from 'rxjs';
import { Store, select } from '@ngrx/store';
import { AppState } from '../../../../core/reducers';
import { SubheaderService, LayoutConfigService } from '../../../../core/_base/layout';
import { LayoutUtilsService, MessageType, } from '../../../../core/_base/crud';
import {
	selectTrGalonActionLoading,
	selectTrGalonById
} from "../../../../core/trGalon/trGalon.selector";
import { TrGalonModel } from '../../../../core/trGalon/trGalon.model';
import { TrGalonService } from '../../../../core/trGalon/trGalon.service';
import { SelectionModel } from "@angular/cdk/collections";
import * as _moment from 'moment';
import { default as _rollupMoment, Moment } from 'moment';
import { CustomerService } from '../../../../core/customer/customer.service';
import { UnitService } from '../../../../core/unit/unit.service';
import { QueryUnitModel } from '../../../../core/unit/queryunit.model';
import { PowerTransactionService } from '../../../../core/power/transaction/transaction.service';
import { WaterTransactionService } from '../../../../core/water/transaction/transaction.service';
import { QueryAccountBankModel } from '../../../../core/masterData/bank/accountBank/queryaccountBank.model';
import { AccountBankService } from '../../../../core/masterData/bank/accountBank/accountBank.service';
import { PowerMeterService } from '../../../../core/power';
import { QueryOwnerTransactionModel } from "../../../../core/contract/ownership/queryowner.model";
import { WaterMeterService } from '../../../../core/water/meter/meter.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';
import { ServiceFormat } from '../../../../core/serviceFormat/format.service';
const moment = _rollupMoment || _moment;


@Component({
	selector: 'kt-view-trGalon',
	templateUrl: './view-trGalon.component.html',
	styleUrls: ['./view-trGalon.component.scss']
})
export class ViewTrGalonComponent implements OnInit, OnDestroy {
	trGalon: TrGalonModel;
	trGalonId$: Observable<string>;
	oldTrGalon: TrGalonModel;
	selectedTab = 0;
	loading$: Observable<boolean>;
	trGalonForm: FormGroup;
	hasFormErrors = false;
	unitResult: any[] = [];
	customerResult: any[] = [];
	powerResult: any[] = [];
	waterResult: any[] = [];
	bankResult: any[] = [];
	isToken: boolean = false
	idUnit: any = ""
	selection = new SelectionModel<TrGalonModel>(true, []);
	date = new FormControl(moment());
	date1 = new FormControl(new Date());
	serializedDate = new FormControl((new Date()).toISOString());
	duedate = new FormControl();
	trGalonIdDetail: string = ""
	vaWaterResult: string
	vaIPLResult: string

	images: any[] = []
	imagesDelivery: any[] = []
	valImage: boolean = false

	loadingData = {
		unit: false,
	};


	UnitResultFiltered = [];
	TenantResultFiltered = [];
	BrandResultFiltered = [];

	rateBrand: any = ""
	tenantResult: any[] = [];
	brandResult: any[] = [];

	viewUnitResult = new FormControl();
	viewCstmrResult = new FormControl();
	viewBrandResult = new FormControl();

	isBrand: boolean = true
	checkedPaid: boolean = false

	valSelect: any

	// Private properties
	private subscriptions: Subscription[] = [];
	constructor(
		private activatedRoute: ActivatedRoute,
		private serviceFormat: ServiceFormat,
		private serviceTrGalon: TrGalonService,
		private router: Router,
		private trGalonFB: FormBuilder,
		private store: Store<AppState>,
		private serviceUnit: UnitService,
		private bservice: AccountBankService,
		private http: HttpClient,
		private cd: ChangeDetectorRef
	) { }

	ngOnInit() {
		this.loading$ = this.store.pipe(select(selectTrGalonActionLoading));
		const routeSubscription = this.activatedRoute.params.subscribe(params => {
			const id = params.id;
			if (id) {
				this.serviceTrGalon.getTrGalonByID(id).subscribe(res => {
					if (res) {
						// this.idUnit = res.unit._id
						this.idUnit = res.data.unit
						this.trGalon = res.data;
						this.valImage = this.trGalon.imageTrGalon === null ? false : true
						this.oldTrGalon = Object.assign({}, this.trGalon);

						this.valSelect = {
							unt: res.data.unit.cdunt,
							cstmr: res.data.cstmr.cstrmrnm,
							brnd: `${res.data.brand.brand} - ${this.serviceFormat.rupiahFormatImprovement(res.data.brand.rate)}`,
						}
						this.rateBrand = res.data.brand ? res.data.brand.rate : ""
						this.checkedPaid = res.data.isPaid
						if (res.data.brand) this.isBrand = false
						else this.isBrand = true
						this.initTrGalon();
					}
				})
			}
		});
		this.subscriptions.push(routeSubscription);
	}
	initTrGalon() {
		if (this.trGalon.imageTrGalon) this.images.push(this.trGalon.imageTrGalon)
		if (this.trGalon.imageDelivery) this.imagesDelivery.push(this.trGalon.imageDelivery)
		this.createForm();
		this.loadUnit();
		this.loadBrand()
		this.loadTenant()
		this.loadAccountBank()
	}

	_getStatusPayCond(status: string) {
		if (status) return "chip chip--parsial-lebih";
		else return "chip chip--outstanding";
	}


	createForm() {
		this.trGalonForm = this.trGalonFB.group({
			_id: [{ value: this.trGalon._id, disabled: true }],
			unit: [{ value: this.trGalon.unit ? this.trGalon.unit._id : "", disabled: true }],
			cstmr: [{ value: this.trGalon.cstmr ? this.trGalon.cstmr : "", disabled: true }],
			trDate: [{ value: this.trGalon.trDate, disabled: true }],
			qty: [{ value: this.trGalon.qty, disabled: true }],
			brand: [{ value: this.trGalon.brand ? this.trGalon.brand._id : "", disabled: true }],
			totalTr: [{ value: this.serviceFormat.rupiahFormatImprovement(this.trGalon.totalTr ? this.trGalon.totalTr : 0), disabled: true }],
			isPaid: [{ value: this.trGalon.isPaid, disabled: true }],
		});
	}


	loadUnit() {
		this.selection.clear();
		const queryParams = new QueryUnitModel(
			null,
			"asc",
			"grpnm",
			1,
			10
		);
		this.serviceUnit.getDataUnitForGalon(queryParams).subscribe(
			res => {
				this.unitResult = res.data;
			}
		);
	}
	loadTenant() {
		this.loadingData.unit = true;
		this.selection.clear();
		const queryParams = new QueryOwnerTransactionModel(
			null,
			"asc",
			"grpnm",
			1,
			10000
		);
		this.serviceUnit.getDataCustomerForGalon(queryParams).subscribe((res) => {
			this.tenantResult = res.data
			this.TenantResultFiltered = this.tenantResult
			this.cd.markForCheck();
		});
	}


	loadBrand() {
		this.loadingData.unit = true;
		this.selection.clear();
		const queryParams = new QueryOwnerTransactionModel(
			null,
			"asc",
			"grpnm",
			1,
			10000
		);
		this.serviceUnit.getDataBrandForGalon(queryParams).subscribe((res) => {
			this.brandResult = res.data
			this.BrandResultFiltered = this.brandResult
			this.cd.markForCheck();
		});
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

	_filterCstmrList(text: string) {
		this.UnitResultFiltered = this.unitResult.filter((i) => {
			const filterText = `${i.cdunt.toLocaleLowerCase()}`;
			if (filterText.includes(text.toLocaleLowerCase())) return i;
		});
	}

	_filterCstmrTenantList(text: string) {
		this.TenantResultFiltered = this.tenantResult.filter((i) => {
			const filterText = `${i.cstrmrnm.toLocaleLowerCase()}`;
			if (filterText.includes(text.toLocaleLowerCase())) return i;
		});
	}

	_filterBrandList(text: string) {
		this.BrandResultFiltered = this.brandResult.filter((i) => {
			const filterText = `${i.brand.toLocaleLowerCase()}`;
			if (filterText.includes(text.toLocaleLowerCase())) return i;
		});
	}

	quantity(e) {
		const controls = this.trGalonForm.controls;
		let value = parseFloat(e.target.value)
		if (value > 0) {
			if (this.rateBrand) controls.totalTr.setValue(this.serviceFormat.rupiahFormatImprovement(parseFloat(this.rateBrand) * value))
			controls.qty.setValue(value)
			this.isBrand = false
		} else {
			this.isBrand = true
		}
	}

	_setBlockValue(value, mode) {
		const controls = this.trGalonForm.controls;
		if (mode === "unit") controls.unit.setValue(value._id)
		else if (mode === "cstmr") controls.cstmr.setValue(value._id)
		else if (mode === "brand") {
			let qtyValue = parseFloat(controls.qty.value)
			let result = (value.rate * qtyValue)
			this.rateBrand = value.rate
			controls.brand.setValue(value._id)
			controls.totalTr.setValue(this.serviceFormat.rupiahFormatImprovement(result))
		}
	}


	paider(e) {
		const controls = this.trGalonForm.controls;
		controls.isPaid.setValue(e.target.checked)


	}

	goBackWithId() {
		const url = `/trGalon`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}
	refreshTrGalon(isNew: boolean = false, id: string = "") {
		let url = this.router.url;
		if (!isNew) {
			this.router.navigate([url], { relativeTo: this.activatedRoute });
			return;
		}

		url = `/trGalon/edit/${id}`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}

	changeDeliveryStatus(value: string) {
		if (value === "open") return "Open"
		else if (value === "progress") return "On Progress"
		else if (value === "delivery") return "On Delivery"
		else if (value === "done") return "Done"
	}

	getComponentTitle() {
		let result = `View Transaction Galon`;
		return result;
	}

	onAlertClose($event) {
		this.hasFormErrors = false;
	}

	ngOnDestroy() {
		this.subscriptions.forEach(sb => sb.unsubscribe());
	}
}
