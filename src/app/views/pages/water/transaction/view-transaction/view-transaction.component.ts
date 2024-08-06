// Angular
import { Component, OnInit, OnDestroy, ChangeDetectorRef } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import {
	FormBuilder,
	FormControl,
	FormGroup,
	Validators,
} from "@angular/forms";

import { Observable, Subscription } from "rxjs";
// NGRX
import { Store, select } from "@ngrx/store";
import { AppState } from "../../../../../core/reducers";
// Layout
import {
	SubheaderService,
	LayoutConfigService,
} from "../../../../../core/_base/layout";
import {
	LayoutUtilsService,
	MessageType,
} from "../../../../../core/_base/crud";
import {
	selectWaterTransactionActionLoading,
	selectWaterTransactionById,
} from "../../../../../core/water/transaction/transaction.selector";
import { WaterTransactionModel } from "../../../../../core/water/transaction/transaction.model";
import { WaterMeterService } from "../../../../../core/water/meter/meter.service";
import { SelectionModel } from "@angular/cdk/collections";
import { QueryWaterMeterModel } from "../../../../../core/water/meter/querymeter.model";
import { HttpClient } from '@angular/common/http';
import { environment } from "../../../../../../environments/environment";

import * as _moment from "moment";
import { default as _rollupMoment } from "moment";
import { WaterTransactionService } from "../../../../../core/water/transaction/transaction.service";
const moment = _rollupMoment || _moment;

@Component({
	selector: "kt-view-transaction",
	templateUrl: "./view-transaction.component.html",
	styleUrls: ["./view-transaction.component.scss"],
})
export class ViewTransactionComponent implements OnInit, OnDestroy {
	waterTransaction: WaterTransactionModel;
	waterTransactionId$: Observable<string>;
	oldWaterTransaction: WaterTransactionModel;
	selectedTab = 0;
	loading$: Observable<boolean>;
	waterTransactionForm: FormGroup;
	hasFormErrors = false;
	waterTransactionResult: any[] = [];
	waterMeter: any[] = [];
	selection = new SelectionModel<WaterTransactionModel>(true, []);
	date = new FormControl(moment());
	checker: boolean;
	buttonSave: boolean = true;
	loadingForm: boolean
	images: any;
	// Private properties

	waterListResultFiltered = [];
	viewWaterMeterResult = new FormControl();

	imageSrc: string;
	isImage: string = "web"



	private subscriptions: Subscription[] = [];
	constructor(
		private activatedRoute: ActivatedRoute,
		private router: Router,
		private http: HttpClient,
		private waterTransactionFB: FormBuilder,
		private subheaderService: SubheaderService,
		private layoutUtilsService: LayoutUtilsService,
		private store: Store<AppState>,
		private serviceWaterrMeter: WaterMeterService,
		private layoutConfigService: LayoutConfigService,
		private service: WaterTransactionService,
		private cd: ChangeDetectorRef,
	) { }

	ngOnInit() {
		this.loading$ = this.store.pipe(
			select(selectWaterTransactionActionLoading)
		);
		const routeSubscription = this.activatedRoute.params.subscribe(
			(params) => {
				const id = params.id;
				/** ====================== This Old Consumption (old) ====================== */
				// if (id) { // This OLD consumption (old)
				// 	this.store
				// 		.pipe(select(selectWaterTransactionById(id)))
				// 		.subscribe((res) => {
				// 			if (res) {
				// 				this.loadingForm = true
				// 				this.waterTransaction = res;
				// 				this.checker = res.checker;
				// 				this.oldWaterTransaction = Object.assign(
				// 					{},
				// 					this.waterTransaction
				// 				);
				// 				this.viewWaterMeterResult.setValue(`${res.wat.nmmtr} - ${res.wat.unit.toLocaleLowerCase()}`);
				// 				this._filterWaterList(`${res.wat.nmmtr} - ${res.wat.unit.toLocaleLowerCase()}`);

				// 				this.initWaterTransaction();
				// 			}
				// 		});
				// }
				/** ====================== This New Layout Consumption (new) ====================== */
				if (id) { // This new layout (new)
					this.serviceWaterrMeter.getWaterMeter(id).subscribe((res) => {
						if (res) {
							this.loadingForm = true
							this.waterTransaction = res.data;
							this.checker = res.data.checker;
							this.oldWaterTransaction = Object.assign(
								{},
								this.waterTransaction
							);
							this.viewWaterMeterResult.setValue(`${res.data.wat.nmmtr} - ${res.data.wat.unit.toLocaleLowerCase()}`);
							this._filterWaterList(`${res.data.wat.nmmtr} - ${res.data.wat.unit.toLocaleLowerCase()}`);

							this.initWaterTransaction();
						}
					});
				}
				else {
					this.waterTransaction = new WaterTransactionModel();
					this.waterTransaction.clear();
					this.initWaterTransaction();
				}
			}
		);
		this.subscriptions.push(routeSubscription);
	}
	initWaterTransaction() {
		this.createForm();
		this.loadMeterList();
		this.getImage();
		this.checkConsumption()
	}



	createForm() {
		if (this.waterTransaction._id) {
			this.waterTransactionForm = this.waterTransactionFB.group({
				wat: [{ value: this.waterTransaction.wat._id, disabled: true }],
				rate: [
					{
						value: this.waterTransaction.wat.rte.rte,
						disabled: true,
					},
				],
				strtpos: [{ "value": this.waterTransaction.strtpos, "disabled": true }, Validators.required],
				endpos: [{ value: this.waterTransaction.endpos, disabled: true }],
				billmnt: [{ value: this.waterTransaction.billmnt, disabled: true }],
				air_kotor: [{ value: this.waterTransaction.air_kotor, disabled: true }],
				strtpos2: [{ value: this.waterTransaction.strtpos2 ? this.waterTransaction.strtpos2.toFixed(1) : this.convertStrtpos(this.waterTransaction.strtpos), disabled: true }],
				endpos2: [{ value: this.waterTransaction.endpos2 ? this.waterTransaction.endpos2.toFixed(1) : this.convertEndpos(this.waterTransaction.endpos), disabled: true }],
				checker: [{ value: this.waterTransaction.checker, disabled: true }],
				watname: [this.waterTransaction.watname],
				urlmeter: [{ value: this.waterTransaction.urlmeter, disabled: true }],
				cons: [""]
			});

			if (this.waterTransaction.urlmeter)
				this.imageSrc = this.waterTransaction.urlmeter;
		}
	}

	goBackWithId() {
		const url = `/water-management/water/transaction`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}
	refreshWaterTransaction(isNew: boolean = false, id: string = "") {
		let url = this.router.url;
		if (!isNew) {
			this.router.navigate([url], { relativeTo: this.activatedRoute });
			return;
		}

		url = `/water-management/water/transaction/edit/${id}`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}

	getComponentTitle() {
		let result = `View Water Consumption`;
		return result;
	}

	changeImage(stts) {
		if (stts === 'web') this.isImage = 'web';
		else if (stts === 'mobile') this.isImage = 'mobile';

		this.cd.markForCheck()
	}

	onAlertClose($event) {
		this.hasFormErrors = false;
	}

	/**
	* @param value
	*/
	_setWaterValue(value) {
		this.waterTransactionForm.patchValue({ wat: value._id });
	}

	_onKeyup(e: any) {
		this.waterTransactionForm.patchValue({ wat: undefined });
		this._filterWaterList(e.target.value);
	}

	_filterWaterList(text: string) {
		this.waterListResultFiltered = this.waterMeter.filter(i => {
			const filterText = `${i.nmmtr} - ${i.unit.toLocaleLowerCase()}`;
			if (filterText.includes(text.toLocaleLowerCase())) return i;

		});
	}

	loadMeterList() {
		this.selection.clear();
		const queryParams = new QueryWaterMeterModel(
			null,
			"asc",
			null,
			1,
			100000
		);
		this.serviceWaterrMeter.getListWaterMeterforTr(queryParams).subscribe(
			res => {
				this.waterMeter = res.data;
				this.waterListResultFiltered = this.waterMeter.slice();
				this.cd.markForCheck();
				this.viewWaterMeterResult.disable();
			});
	}


	ngOnDestroy() {
		this.subscriptions.forEach((sb) => sb.unsubscribe());
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
		const controls = this.waterTransactionForm.controls
		const start2 = controls.strtpos2.value
		const end2 = controls.endpos2.value

		if (start2 && end2) {
			const dataWater = (end2 - start2).toFixed(1)
			const result = parseFloat(dataWater)
			controls.cons.setValue(result)
			this.cd.markForCheck()
		}
	}


	async getImage() {
		const URL_IMAGE = `${environment.baseAPI}/api/water/transaksi`
		await this.http.get(`${URL_IMAGE}/${this.waterTransaction._id}/getimages`).subscribe((res: any) => {
			this.images = res.data;
			console.log(this.images)
		});

	}
}

