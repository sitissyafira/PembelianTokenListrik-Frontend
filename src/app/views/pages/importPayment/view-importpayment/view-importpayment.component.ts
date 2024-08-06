
import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormControl, FormGroup, } from '@angular/forms';
import { Observable, Subscription } from 'rxjs';
import { Store, select } from '@ngrx/store';
import { AppState } from '../../../../core/reducers';
import { SubheaderService, LayoutConfigService } from '../../../../core/_base/layout';
import { LayoutUtilsService, MessageType, } from '../../../../core/_base/crud';
import {
	selectBillingActionLoading,
	selectBillingById
} from "../../../../core/billing/billing.selector";
import { BillingModel } from '../../../../core/billing/billing.model';
import { BillingService } from '../../../../core/billing/billing.service';
import { SelectionModel } from "@angular/cdk/collections";
import * as _moment from 'moment';
import { default as _rollupMoment, Moment } from 'moment';
import { CustomerService } from '../../../../core/customer/customer.service';
import { UnitService } from '../../../../core/unit/unit.service';
import { QueryUnitModel } from '../../../../core/unit/queryunit.model';
import { PowerTransactionService } from '../../../../core/power/transaction/transaction.service';
import { WaterTransactionService } from '../../../../core/water/transaction/transaction.service';
import { QueryAccountBankModel } from '../../../../core/masterData/bank/accountBank/queryaccountBank.model';
import { AccountGroupService } from '../../../.../../../core/accountGroup/accountGroup.service';
import { PowerMeterService } from '../../../../core/power';
import { WaterMeterService } from '../../../../core/water/meter/meter.service';
import { environment } from '../../../../../environments/environment'
import { HttpClient } from '@angular/common/http';
import { ServiceFormat } from '../../../../core/serviceFormat/format.service';
const moment = _rollupMoment || _moment;


@Component({
	selector: 'kt-view-importpayment',
	templateUrl: './view-importpayment.component.html',
	styleUrls: ['./view-importpayment.component.scss']
})
export class ViewBillingComponent implements OnInit, OnDestroy {
	billing: BillingModel;
	billingId$: Observable<string>;
	oldBilling: BillingModel;
	selectedTab = 0;
	loading$: Observable<boolean>;
	billingForm: FormGroup;
	hasFormErrors = false;
	unitResult: any[] = [];
	customerResult: any[] = [];
	powerResult: any[] = [];
	waterResult: any[] = [];
	bankResult: any[] = [];
	isToken: boolean = false
	idUnit: any = ""
	selection = new SelectionModel<BillingModel>(true, []);
	date = new FormControl(moment());
	date1 = new FormControl(new Date());
	serializedDate = new FormControl((new Date()).toISOString());
	duedate = new FormControl();
	nominalPPN = 0

	convertSubTotal: any = ""
	convertGrandTotal: any = ""
	billingIdDetail: string = ""
	vaWaterResult: string
	vaIPLResult: string

	isShowSTagihan: boolean = true
	isShowSPembayaran: boolean = true
	isShowTagihanBilling: boolean = true

	// variabel condition payment START
	isPayCond: boolean = true
	isBayarKurang: boolean = true
	isBayarLebih: boolean = true
	isCustom: boolean = true
	// variabel condition payment END
	paymentValue: string;

	// cekPembayaran token / abodemen
	isCekTagihBayarToken: number = 0
	isCekTagihBayarAbodemen: number = 0

	cekSelectPayment: boolean = true
	selectedPay: any[] = [];

	paymentSelect: any = ""

	// Variabel Custom Condition START
	isCustomIPL: boolean = true
	isCustomWater: boolean = true
	isCustomElectricity: boolean = true
	isCustomTagihan: boolean = true
	// Variabel Custom Condition END

	admBankPriceIPL: number = 3000
	// Private properties
	private subscriptions: Subscription[] = [];
	constructor(
		private activatedRoute: ActivatedRoute,
		private serviceFormat: ServiceFormat,
		private service: BillingService,
		private router: Router,
		private billingFB: FormBuilder,
		private store: Store<AppState>,
		private serviceUnit: UnitService,
		private bservice: AccountGroupService,
		private http: HttpClient,

	) { }

	displayUtilityAdmin: boolean = false


	ngOnInit() {
		this.loading$ = this.store.pipe(select(selectBillingActionLoading));
		const routeSubscription = this.activatedRoute.params.subscribe(params => {
			const id = params.id;
			if (id) {
				this.service.getBillingByID(id).subscribe(res => {
					if (res) {
						this.billing = res.data;
						this.oldBilling = Object.assign({}, this.billing);
						this.initBilling();

						const numb = res.data.subTotalBilling.toFixed(0);
						const format = numb.toString().split('').reverse().join('');
						const convert = format.match(/\d{1,3}/g);
						const rupiahSubTotal = convert.join('.').split('').reverse().join('')

						this.convertSubTotal = rupiahSubTotal

						const numbgrnd = res.data.totalBilling.toFixed(0);
						const formatgrnd = numbgrnd.toString().split('').reverse().join('');
						const convertgrnd = formatgrnd.match(/\d{1,3}/g);
						const rupiahGrandTotal = convertgrnd.join('.').split('').reverse().join('')

						/** ================== Perhitungan dengan PPN dan FEE ================== */
						if (res.data.ipl.allIplAfterTax || res.data.water.allWaterAmountAfterFeeAndTax || res.data.power.allPowerAmountAfterFeeAndTax) {
							const pureBillingToken = (res.data.ipl.allIplAfterTax + res.data.water.allWaterAmountAfterFeeAndTax)
							const pureBillingAbodemen = (res.data.ipl.allIplAfterTax + res.data.water.allWaterAmountAfterFeeAndTax + res.data.power.allPowerAmountAfterFeeAndTax)


							this.isCekTagihBayarToken = pureBillingToken
							this.isCekTagihBayarAbodemen = pureBillingAbodemen
						}
						/** ================== Perhitungan Tanpa PPN dan FEE ================== */
						else {
							const pureBillingTokenNotFeePPN = (res.data.ipl.allIpl + res.data.water.allWaterAmount)
							const pureBillingAbodemenNotFeePPN = (res.data.ipl.allIpl + res.data.water.allWaterAmount + res.data.power.allPowerAmount)

							this.isCekTagihBayarToken = pureBillingTokenNotFeePPN
							this.isCekTagihBayarAbodemen = pureBillingAbodemenNotFeePPN
						}


						let validateToken: any = res.data.totalBilling - this.isCekTagihBayarToken
						let validateAbodemen: any = res.data.totalBilling - this.isCekTagihBayarAbodemen

						let rsltValidateToken, rsltValidateAbodemen

						const regexValidate = /\-\d/g;
						rsltValidateToken = regexValidate.test(validateToken)
						rsltValidateAbodemen = regexValidate.test(validateAbodemen)

						if (rsltValidateToken || rsltValidateAbodemen) {
							this.isShowSPembayaran = false
						} else this.isShowSPembayaran = true

						if (res.data.payCond === "full-payment") {
							this.cekSelectPayment = false
						}
						if (res.data.paymentSelection === "full-payment") {
							this.cekSelectPayment = true
						}
						// if (res.data.totalBilling < this.isCekTagihBayarToken ||
						// 	res.data.totalBilling < this.isCekTagihBayarAbodemen) {
						// 	this.isShowSPembayaran = false
						// } else {
						// 	this.isShowSPembayaran = true
						// }

						if (res.data.paymentSelection == "bayar-kurang") {
							this.paymentValue = "Bayar Kurang"
							this.isShowSTagihan = false
							this.isPayCond = false
							this.isBayarKurang = false
						}
						if (res.data.paymentSelection == "bayar-lebih") {
							this.paymentValue = "Bayar Lebih"
							this.isShowSPembayaran = false
							this.isPayCond = false
							this.isBayarLebih = false
						}
						if (res.data.paymentSelection == "custom") {
							this.paymentValue = "Custom"
							this.isCustomTagihan = false
							this.isCustom = false
							res.data.billArray.forEach(data => this.selectedPay.push({ _id: data._id, payment: data.payment, value: data.value }))
							let cstmIPL = res.data.billArray.find(data => data.value === "isCustomIPL")
							let cstmWater = res.data.billArray.find(data => data.value === "isCustomWater")
							let cstmPower = res.data.billArray.find(data => data.value === "isCustomElectricity")

							if (cstmIPL !== undefined && cstmIPL.value === "isCustomIPL") this.isCustomIPL = false
							if (cstmWater !== undefined && cstmWater.value === "isCustomWater") this.isCustomWater = false
							if (cstmPower !== undefined && cstmPower.value === "isCustomElectricity") this.isCustomElectricity = false
						}
						if (res.data.paymentSelection == "full-payment") {
							this.paymentValue = "Full Payment"
							this.isShowSPembayaran = true
							this.isPayCond = false
							this.isBayarLebih = true
							this.isBayarKurang = false;
							console.log(this.paymentValue, "payment selection value")
						}
						if (res.data.totalBillLeft) this.isShowTagihanBilling = false
						this.oldBilling = Object.assign({}, this.billing);
						this.idUnit = res.data.unit
						this.billingIdDetail = res.data._id
						this.initBilling();

						this.convertGrandTotal = rupiahGrandTotal

						if (res.data.utilityAdmin !== undefined) {
							this.displayUtilityAdmin = true
						}
					}
				})

			}
		});

		this.subscriptions.push(routeSubscription);
	}
	initBilling() {
		this.createForm();
	}

	convertNumber(number) {
		const numb = number.toFixed(0);
		const format = numb.toString().split('').reverse().join('');
		const convert = format.match(/\d{1,3}/g);
		const rupiahSubTotal = convert.join('.').split('').reverse().join('')
		return rupiahSubTotal
	}

	createForm() {
		this.billingForm = this.billingFB.group({
			contract: [this.billing.contract],
			billed_to: [{ value: this.billing.billed_to, disabled: true }],
			unit: [{ value: this.billing.unit._id, disabled: true }],
			unit2: [{ value: this.billing.unit2, disabled: true }],
			billing: this.billingFB.group({
				electricity: this.billingFB.group({
					electric_trans: [{ value: this.billing.billing.electricity.electric_trans._id, disabled: true }],
				}),
				water: this.billingFB.group({
					water_trans: [{ value: this.billing.billing.water.water_trans, disabled: true }]
				})
			}),
			power: this.billingFB.group({
				powerMeter: [{ value: this.billing.power.powerMeter, disabled: true }],
				powerRateName: [{ value: this.billing.power.powerRateName, disabled: true }],
				powerRate: [{ value: this.billing.power.powerRate, disabled: true }],
				startPower: [{ value: this.billing.power.startPower, disabled: true }],
				endPower: [{ value: this.billing.power.endPower, disabled: true }],
				usePower: [{ value: this.billing.power.usePower, disabled: true }],
				useAmount: [{ value: this.convertNumber(this.billing.power.useAmount), disabled: true }],
				sc: [{ value: this.billing.power.sc, disabled: true }],
				scAmount: [{ value: this.billing.power.scAmount, disabled: true }],
				ppju: [{ value: this.billing.power.ppju, disabled: true }],
				ppjuAmount: [{ value: this.convertNumber(this.billing.power.ppjuAmount), disabled: true }],
				loss: [{ value: this.billing.power.loss, disabled: true }],
				lossAmount: [{ value: this.convertNumber(this.billing.power.lossAmount), disabled: true }],
				allPowerAmount: [{ value: this.convertNumber(this.billing.power.allPowerAmount), disabled: true }]
			}),
			water: this.billingFB.group({
				waterMeter: [{ value: this.billing.water.waterMeter, disabled: true }],
				waterRate: [{ value: this.billing.water.waterRate, disabled: true }],
				startWater: [{ value: this.billing.water.startWater, disabled: true }],
				endWater: [{ value: this.billing.water.endWater, disabled: true }],
				useWater: [{ value: this.billing.water.useWater, disabled: true }],
				useWaterAmount: [{ value: this.convertNumber(this.billing.water.useWaterAmount), disabled: true }],
				maintenance: [{ value: this.billing.water.maintenance, disabled: true }],
				administration: [{ value: this.billing.water.administration, disabled: true }],
				dirtyWater: [{ value: this.billing.water.dirtyWater, disabled: true }],
				dirtyWaterAmount: [{ value: this.convertNumber(this.billing.water.dirtyWaterAmount), disabled: true }],
				allWaterAmount: [{ value: this.convertNumber(this.billing.water.allWaterAmount), disabled: true }]
			}),
			ipl: this.billingFB.group({
				unitSize: [{ value: this.billing.ipl.unitSize, disabled: true }],
				serviceCharge: [{ value: this.billing.ipl.serviceCharge, disabled: true }],
				sinkingFund: [{ value: this.billing.ipl.sinkingFund, disabled: true }],
				monthIpl: [{ value: this.billing.ipl.monthIpl, disabled: true }],
				ipl: [{ value: this.billing.ipl.ipl, disabled: true }],
				administration: [{ value: this.billing.ipl.administration, disabled: true }],
				// allIpl: [{ value: this.convertNumber(this.billing.ipl.allIpl), disabled: true }]
				allIpl: [{ value: this.billing.ipl.allIpl == undefined || this.billing.ipl.allIpl == null || this.billing.ipl.allIpl == 0 ? "" : this.billing.ipl.allIpl, disabled: true }],
			}),
			isFreeIpl: [{ value: this.billing.isFreeIpl, disabled: true }],
			isFreeAbodement: [{ value: this.billing.isFreeAbodement, disabled: true }],
			totalBilling: [{ value: this.billing.totalBilling, disabled: true }],
			// totalBilling: [{ value: this.billing.subTotalBilling, disabled: true }],
			// grandTotalBilling: [{ value: this.billing.totalBilling, disabled: true }],
			billing_number: [{ value: this.billing.billing_number, disabled: true }],
			created_date: [{ "value": this.billing.created_date, "disabled": true }],
			billing_date: [{ value: this.billing.billing_date, disabled: true }],
			due_date: [{ value: this.billing.due_date, disabled: true }],
			bank: [{ value: this.billing.bank, disabled: true }],
			customerBankNo: [{ value: this.billing.customerBankNo, disabled: true }],
			customerBank: [{ value: this.billing.customerBank, disabled: true }],
			desc: [{ value: this.billing.desc, disabled: true }],
			paidDate: [{ value: this.billing.paidDate, disabled: true }],
			isPaid: [true],
			paymentType: [{ value: this.billing.paymentType, disabled: true }],

			// Virtual Account
			// va_water: [{ value: this.billing.va_water ? this.billing.va_water : '', disabled: true }],
			// va_ipl: [{ value: this.billing.va_ipl ? this.billing.va_ipl : '', disabled: true }],

			// Update Bill START
			paymentSelection: [{ value: this.paymentValue, disabled: true }],
			totalNominal: [{ value: this.billing.totalNominal ? this.serviceFormat.rupiahFormatImprovement(this.billing.totalNominal) : "", disabled: true }],
			sisaTagihan: [{ value: this.billing.paymentSelection == "bayar-kurang" ? this.serviceFormat.rupiahFormatImprovement(this.billing.totalBillLeft ? this.billing.totalBillLeft : 0) : 0, disabled: true }],
			sisaPembayaran: [{ value: this.billing.paymentSelection == "bayar-lebih" ? this.serviceFormat.rupiahFormatImprovement(this.convertMinesToPlus(this.billing.totalBillLeft ? this.billing.totalBillLeft : 0)) : "", disabled: true }],
			billArray: [{ value: this.billing.billArray, disabled: false }],
			nominalIpl: [{ value: this.billing.nominalIpl ? this.serviceFormat.rupiahFormatImprovement(this.billing.nominalIpl) : "", disabled: true }],
			iplBillLeft: [{ value: this.billing.iplBillLeft ? this.serviceFormat.rupiahFormatImprovement(this.billing.iplBillLeft) : "", disabled: true }],
			nominalWater: [{ value: this.billing.nominalWater ? this.serviceFormat.rupiahFormatImprovement(this.billing.nominalWater) : "", disabled: true }],
			waterBillLeft: [{ value: this.billing.waterBillLeft ? this.serviceFormat.rupiahFormatImprovement(this.billing.waterBillLeft) : "", disabled: true }],
			nominalPower: [{ value: this.billing.nominalPower ? this.serviceFormat.rupiahFormatImprovement(this.billing.nominalPower) : "", disabled: true }],
			powerBillLeft: [{ value: this.billing.powerBillLeft ? this.serviceFormat.rupiahFormatImprovement(this.billing.powerBillLeft) : "", disabled: true }],
			sisaCustomTagihan: [{ value: this.billing.paymentSelection == "custom" ? this.serviceFormat.rupiahFormatImprovement(this.billing.totalBillLeft ? this.billing.totalBillLeft : 0) : 0, disabled: true }],
			bayarSisa: [{ value: this.billing.bayarSisa ? this.serviceFormat.rupiahFormatImprovement(this.billing.bayarSisa) : "", disabled: true }],
			// Update Bill END
		});
	}

	convertMinesToPlus(val) {
		const value = val;
		const regex = /\-\d/g;
		const validate = regex.test(value)

		if (validate) {
			const number = val
			const str = number.toString()
			const result = str.replace("-", "")
			const resultNumber = parseFloat(result)
			return resultNumber
		} else return parseFloat(val)
	}

	sliceAdmBankIPL(val) {
		return val - this.admBankPriceIPL
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
		this.serviceUnit.getDataUnitForParking(queryParams).subscribe(
			res => {
				this.unitResult = res.data;
			}
		);
	}

	convertPaymentSelect() {
		if (this.billing.paymentSelection === "bayar-kurang") this.paymentSelect = "Pembayaran Kurang"
		else if (this.billing.paymentSelection === "bayar-lebih") this.paymentSelect = "Pembayaran Lebih"
		else if (this.billing.paymentSelection === "custom") this.paymentSelect = "Custom"
		else this.paymentSelect = ""
	}

	unitOnChange(e) {

	}
	addEvent(e) {

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

	goBackWithId() {
		const url = `/billing`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}
	refreshBilling(isNew: boolean = false, id: string = "") {
		let url = this.router.url;
		if (!isNew) {
			this.router.navigate([url], { relativeTo: this.activatedRoute });
			return;
		}

		url = `/billing/edit/${id}`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}

	getComponentTitle() {
		let result = `View Billing`;
		return result;
	}

	onAlertClose($event) {
		this.hasFormErrors = false;
	}

	ngOnDestroy() {
		this.subscriptions.forEach(sb => sb.unsubscribe());
	}
}
