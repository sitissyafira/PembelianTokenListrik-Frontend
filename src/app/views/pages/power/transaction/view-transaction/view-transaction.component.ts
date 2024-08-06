// Angular
import { Component, OnInit, OnDestroy, ChangeDetectorRef } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import {
	FormBuilder,
	FormControl,
	FormGroup,
	Validators,
} from "@angular/forms";
import {
	MomentDateAdapter,
	MAT_MOMENT_DATE_ADAPTER_OPTIONS,
} from "@angular/material-moment-adapter";
// RxJS
import { BehaviorSubject, Observable, of, Subscription } from "rxjs";
// NGRX
import { Store, select } from "@ngrx/store";
import { Update } from "@ngrx/entity";
import { AppState } from "../../../../../core/reducers";
// Layout
import {
	SubheaderService,
	LayoutConfigService,
} from "../../../../../core/_base/layout";
import {
	LayoutUtilsService,
	MessageType,
	QueryParamsModel,
} from "../../../../../core/_base/crud";
import {
	selectLastCreatedPowerTransactionId,
	selectPowerTransactionActionLoading,
	selectPowerTransactionById,
} from "../../../../../core/power/transaction/transaction.selector";
import {
	PowerTransactionOnServerCreated,
	PowerTransactionUpdated,
} from "../../../../../core/power/transaction/transaction.action";
import { PowerTransactionModel } from "../../../../../core/power/transaction/transaction.model";
import { PowerMeterService } from "../../../../../core/power/meter/meter.service";
import { SelectionModel } from "@angular/cdk/collections";
import { QueryPowerMeterModel } from "../../../../../core/power/meter/querymeter.model";
import {
	DateAdapter,
	MAT_DATE_FORMATS,
	MAT_DATE_LOCALE,
	MatDatepicker,
} from "@angular/material";
import * as _moment from "moment";
import { default as _rollupMoment, Moment } from "moment";
const moment = _rollupMoment || _moment;
import { HttpClient } from '@angular/common/http';
import { environment } from "../../../../../../environments/environment";

@Component({
	selector: "kt-view-transaction",
	templateUrl: "./view-transaction.component.html",
	styleUrls: ["./view-transaction.component.scss"],
})
export class ViewTransactionComponent implements OnInit, OnDestroy {
	powerTransaction: PowerTransactionModel;
	powerTransactionId$: Observable<string>;
	oldPowerTransaction: PowerTransactionModel;
	selectedTab = 0;
	loading$: Observable<boolean>;
	powerTransactionForm: FormGroup;
	hasFormErrors = false;
	powerTransactionResult: any[] = [];
	powerMeter: any[] = [];
	date = new FormControl(moment());
	date1 = new FormControl(new Date());
	serializedDate = new FormControl((new Date()).toISOString());
	duedate = new FormControl();
	selection = new SelectionModel<PowerTransactionModel>(true, []);
	checker: boolean;
	buttonSave: boolean = true;
	loadingForm: boolean
	images: any;

	powerListResultFiltered = [];
	viewPowerMeterResult = new FormControl();

	imageSrc: string;
	isImage: string = "web"



	// Private properties
	private subscriptions: Subscription[] = [];
	constructor(
		private activatedRoute: ActivatedRoute,
		private router: Router,
		private powerTransactionFB: FormBuilder,
		private subheaderService: SubheaderService,
		private layoutUtilsService: LayoutUtilsService,
		private store: Store<AppState>,
		private http: HttpClient,
		private servicePowerMeter: PowerMeterService,
		private layoutConfigService: LayoutConfigService,
		private cd: ChangeDetectorRef,
	) { }

	ngOnInit() {
		this.loading$ = this.store.pipe(
			select(selectPowerTransactionActionLoading)
		);
		const routeSubscription = this.activatedRoute.params.subscribe(
			(params) => {
				const id = params.id;
				/* ============================ Old consumption Power (old)  ============================ */
				// if (id) { // This Old consumption (old)
				// 	this.store
				// 		.pipe(select(selectPowerTransactionById(id)))
				// 		.subscribe((res) => {
				// 			if (res) {
				// 				this.loadingForm = true;
				// 				this.powerTransaction = res;
				// 				this.checker = res.checker;
				// 				this.oldPowerTransaction = Object.assign(
				// 					{},
				// 					this.powerTransaction
				// 				);
				// 				this.viewPowerMeterResult.disable();
				// 				this.viewPowerMeterResult.setValue(`${res.pow.nmmtr} - ${res.pow.unit.toLocaleLowerCase()}`);
				// 				this._filterPowerList(`${res.pow.nmmtr} - ${res.pow.unit.toLocaleLowerCase()}`);
				// 				this.initPowerTransaction();
				// 			}
				// 		});
				// }

				/* ============================ New Layouting (new)  ============================ */
				if (id) {
					this.servicePowerMeter.getPowerMeter(id).subscribe((res) => {
						if (res) { //This New Layouting (new)
							this.loadingForm = true;
							this.powerTransaction = res.data;
							this.checker = res.data.checker;
							this.oldPowerTransaction = Object.assign(
								{},
								this.powerTransaction
							);
							this.viewPowerMeterResult.disable();
							this.viewPowerMeterResult.setValue(`${res.data.pow.nmmtr} - ${res.data.pow.unit.toLocaleLowerCase()}`);
							this._filterPowerList(`${res.data.pow.nmmtr} - ${res.data.pow.unit.toLocaleLowerCase()}`);
							this.initPowerTransaction();
						}
					});
				}
			}
		);
		this.subscriptions.push(routeSubscription);
	}
	initPowerTransaction() {
		this.createForm();
		this.getImage();
		this.checkConsumption()
	}


	createForm() {
		if (this.powerTransaction._id) {
			this.powerTransactionForm = this.powerTransactionFB.group({
				pow: [{ "value": this.powerTransaction.pow._id, disabled: true }],
				loss: [{ "value": this.powerTransaction.loss, disabled: true }],
				rate: [
					{
						value: this.powerTransaction.pow.rte.rte,
						disabled: true,
					},
				],
				strtpos: [{ "value": this.powerTransaction.strtpos, "disabled": true }],
				endpos: [{ value: this.powerTransaction.endpos, disabled: true }],
				strtpos2: [{ value: this.powerTransaction.strtpos2 ? this.powerTransaction.strtpos2.toFixed(1) : this.convertStrtpos(this.powerTransaction.strtpos), disabled: true }],
				endpos2: [{ value: this.powerTransaction.endpos2 ? this.powerTransaction.endpos2.toFixed(1) : this.convertEndpos(this.powerTransaction.endpos), disabled: true }],
				billmnt: [{ value: this.powerTransaction.billmnt, disabled: true }],
				checker: [{ value: this.powerTransaction.checker, disabled: true }],
				powname: [{ value: this.powerTransaction.powname, disabled: true }],
				urlmeter: [{ value: this.powerTransaction.urlmeter, disabled: true }],
				cons: [{ value: '', disabled: true }],
			});

			if (this.powerTransaction.urlmeter)
				this.imageSrc = this.powerTransaction.urlmeter;
		}
	}

	goBackWithId() {
		const url = `/power-management/power/transaction`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}
	refreshPowerTransaction(isNew: boolean = false, id: string = "") {
		let url = this.router.url;
		if (!isNew) {
			this.router.navigate([url], { relativeTo: this.activatedRoute });
			return;
		}

		url = `/power-management/power/transaction/view/${id}`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}

	// #START, Consumption Start End POS # new Adjustment
	convertStrtpos(value) { // START POS
		const strtpos = value / 10;
		return strtpos.toFixed(1)
	}
	convertEndpos(value) { // END POS
		const endpos = value / 10;
		return endpos.toFixed(1)
	}
	// #END, Consumption Start End POS # new Adjustment

	checkConsumption() { // fungsi untuk menentukan nilai consumption (last meter dikurangi Start Meter)
		const controls = this.powerTransactionForm.controls
		const start2 = controls.strtpos2.value
		const end2 = controls.endpos2.value

		if (start2 && end2) {
			const dataKwh = (end2 - start2).toFixed(1)
			const kwh = parseFloat(dataKwh)
			controls.cons.setValue(kwh)
			this.cd.markForCheck()
		}
	}

	getComponentTitle() {
		let result = `View Electricity Consumption`;
		return result;
	}

	onAlertClose($event) {
		this.hasFormErrors = false;
	}



	/**
	* @param value
	*/
	_setPowerValue(value) {
		this.powerTransactionForm.patchValue({ pow: value._id });
	}

	_onKeyup(e: any) {
		this.powerTransactionForm.patchValue({ pow: undefined });
		this._filterPowerList(e.target.value);
	}

	_filterPowerList(text: string) {
		this.powerListResultFiltered = this.powerMeter.filter(i => {
			const filterText = `${i.nmmtr} - ${i.unit.toLocaleLowerCase()}`;
			if (filterText.includes(text.toLocaleLowerCase())) return i;

		});
	}


	ngOnDestroy() {
		this.subscriptions.forEach((sb) => sb.unsubscribe());
	}

	changeImage(stts) {
		if (stts === 'web') this.isImage = 'web';
		else if (stts === 'mobile') this.isImage = 'mobile';

		this.cd.markForCheck()
	}

	async getImage() {
		const URL_IMAGE = `${environment.baseAPI}/api/power/transaksi`
		await this.http.get(`${URL_IMAGE}/${this.powerTransaction._id}/getimages`).subscribe((res: any) => {
			this.images = res.data;
		});
	}
}

