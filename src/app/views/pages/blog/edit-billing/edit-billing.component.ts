// Angular
import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { BehaviorSubject, Observable, of, Subscription } from 'rxjs';
import { Store, select } from '@ngrx/store';
import { AppState } from '../../../../core/reducers';
import { LayoutUtilsService, MessageType, QueryParamsModel } from '../../../../core/_base/crud';
import {
	selectBillingActionLoading,
	selectBillingById
} from "../../../../core/billing/billing.selector";
import { BillingModel } from '../../../../core/billing/billing.model';
import { BillingService } from '../../../../core/billing/billing.service';
import { SelectionModel } from "@angular/cdk/collections";
import * as _moment from 'moment';
import { default as _rollupMoment, Moment } from 'moment';
import { UnitService } from '../../../../core/unit/unit.service';
import { QueryUnitModel } from '../../../../core/unit/queryunit.model';
import { QueryAccountBankModel } from '../../../../core/masterData/bank/accountBank/queryaccountBank.model';
import { AccountBankService } from '../../../../core/masterData/bank/accountBank/accountBank.service';
const moment = _rollupMoment || _moment;
import { environment } from '../../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { OwnershipContractService } from '../../../../core/contract/ownership/ownership.service';
import { ServiceFormat } from '../../../../core/serviceFormat/format.service';
import { AccountGroupService } from '../../../../core/accountGroup/accountGroup.service';
import { MatDialog } from '@angular/material';


@Component({
	selector: 'kt-add-billing',
	templateUrl: './edit-billing.component.html',
	styleUrls: ['./edit-billing.component.scss']
})
export class EditBillingComponent implements OnInit, OnDestroy {
	billing: BillingModel;
	images: any;
	billingId$: Observable<string>;
	oldBilling: BillingModel;
	selectedTab = 0;
	loading$: Observable<boolean>;
	billingForm: FormGroup;
	ownService: OwnershipContractService
	idUnit: any = ""
	hasFormErrors = false;
	unitResult: any[] = [];
	customerResult: any[] = [];
	powerResult: any[] = [];
	waterResult: any[] = [];
	bankResult: any[] = [];
	BankResultFiltered: any[] = [];
	isToken: boolean = false

	selection = new SelectionModel<BillingModel>(true, []);
	date = new FormControl(moment());
	date1 = new FormControl(new Date());
	serializedDate = new FormControl((new Date()).toISOString());
	duedate = new FormControl();
	isfreeIpl: boolean = false;
	isfreeAbodement: boolean = false;
	billingIdEdit: string = ""


	billArray: any = [
		{
			_id: "1",
			payment: "IPL",
			value: "isCustomIPL"
		},
		{
			_id: "2",
			payment: "Water",
			value: "isCustomWater"
		},
		{
			_id: "3",
			payment: "Electricity",
			value: "isCustomElectricity"
		},
	]

	paymentSelection: any = [
		{
			payment: "Full Payment",
			value: "full-payment",
		},
		{
			payment: "Pembayaran Kurang",
			value: "bayar-kurang",
		},
		{
			payment: "Pembayaran Lebih",
			value: "bayar-lebih",
		},
		// {
		// 	payment: "Custom",
		// 	value: "custom",
		// },
	]
	paymentType: any = [
		{
			payment: "Cash",
			value: "Cash",
		},
		{
			payment: "Debit BCA",
			value: "Debit BCA"
		},
		{
			payment: "iPaymu",
			value: "iPaymu",
		},
		{
			payment: "Transfer",
			value: "Transfer",
		}
	]

	paymentValue: any


	displayedColumns = ['no', 'paidDate', 'nominal', 'description'];
	paymentHistory = []
	totalPayment: number = 0

	payment = {
		valid: false,
		target: {
			control: new FormControl(),
			val: undefined,
		},
		tagihanCustom: {
			control: new FormControl(),
			val: undefined,
		},
	};

	selectTargetTagihan: any = []

	// variabel condition payment START
	isPayCond: boolean = true
	isBayarKurang: boolean = true
	isBayarLebih: boolean = true
	isCustom: boolean = true
	// variabel condition payment END
	paymentTarget = new FormControl();
	selectedPay: any[] = [];

	// Variabel Custom Condition START
	isCustomIPL: boolean = true
	isCustomWater: boolean = true
	isCustomElectricity: boolean = true
	isCustomTagihan: boolean = true
	// Variabel Custom Condition END

	cekSelectPayment: boolean = true

	admBankPriceIPL: number = 3000

	isShowSTagihan: boolean = true
	isShowSPembayaran: boolean = true
	isShowTagihanBilling: boolean = true

	// cekValidation START
	isCekBayarKurang: boolean = false
	isCekBayarLebih: boolean = false
	isCekCustom: boolean = false
	isCekFullPayment: boolean = false
	// cekValidation END

	// cekPembayaran token / abodemen
	isCekTagihBayarToken: number = 0
	isCekTagihBayarAbodemen: number = 0

	// result totalBillLeftPembayaran
	rsltBillLeftPembayaran: any
	rsltNoBillLeftPembayaran: any

	// Sisa Tagihan Custom
	sTagihanCustom: number

	isGenerateBilling: string = "" /* To determine the condition of the generating billing process in progress */
	msgErrorGenerate: string = "" /* To display message error proccessing generate */

	// CheckAmount
	isIPLtrueAmount: boolean = false
	isPowertrueAmount: boolean = false
	isWatertrueAmount: boolean = false


	vaWaterResult: any[] = []
	vaIPLResult: any[] = []
	//cash payment type
	isCash: boolean = false;
	loadingData = {
		paidTo: false,
	};
	viewBankResult = new FormControl()

	// Private properties
	private subscriptions: Subscription[] = [];
	constructor(
		private activatedRoute: ActivatedRoute,
		private serviceFormat: ServiceFormat,
		private router: Router,
		private billingFB: FormBuilder,
		private layoutUtilsService: LayoutUtilsService,
		private store: Store<AppState>,
		private serviceBill: BillingService,
		private serviceUnit: UnitService,
		private bservice: AccountBankService,
		private coaService: AccountGroupService,
		private http: HttpClient,
		private cd: ChangeDetectorRef,
		private dialog: MatDialog,

	) { }

	ngOnInit() {
		this.loading$ = this.store.pipe(select(selectBillingActionLoading));
		const routeSubscription = this.activatedRoute.params.subscribe(params => {
			const id = params.id;
			if (id) {
				this.store.pipe(select(selectBillingById(id))).subscribe(res => {
					if (res) {
						this.billingIdEdit = res._id
						// this.idUnit = res.unit._id
						this.idUnit = res.unit
						this.billing = res;

						/** ================== Perhitungan dengan PPN dan FEE ================== */
						if (res.ipl.allIplAfterTax || res.water.allWaterAmountAfterFeeAndTax || res.power.allPowerAmountAfterFeeAndTax) {
							const pureBillingToken = (res.ipl.allIplAfterTax + res.water.allWaterAmountAfterFeeAndTax)
							const pureBillingAbodemen = (res.ipl.allIplAfterTax + res.water.allWaterAmountAfterFeeAndTax + res.power.allPowerAmountAfterFeeAndTax)


							this.isCekTagihBayarToken = pureBillingToken
							this.isCekTagihBayarAbodemen = pureBillingAbodemen
						}
						/** ================== Perhitungan Tanpa PPN dan FEE ================== */
						else {
							const pureBillingTokenNotFeePPN = (res.ipl.allIpl + res.water.allWaterAmount)
							const pureBillingAbodemenNotFeePPN = (res.ipl.allIpl + res.water.allWaterAmount + res.power.allPowerAmount)

							this.isCekTagihBayarToken = pureBillingTokenNotFeePPN
							this.isCekTagihBayarAbodemen = pureBillingAbodemenNotFeePPN
						}


						let validateToken: any = res.totalBilling - this.isCekTagihBayarToken
						let validateAbodemen: any = res.totalBilling - this.isCekTagihBayarAbodemen

						let rsltValidateToken, rsltValidateAbodemen

						const regexValidate = /\-\d/g;
						rsltValidateToken = regexValidate.test(validateToken)
						rsltValidateAbodemen = regexValidate.test(validateAbodemen)

						if (res.payCond === "full-payment") this.cekSelectPayment = false
						console.log(res.payCond, "res.payCond");



						if (rsltValidateToken || rsltValidateAbodemen) {
							this.isShowSPembayaran = false
						} else this.isShowSPembayaran = true

						// if (res.totalBilling < this.isCekTagihBayarToken ||
						// 	res.totalBilling < this.isCekTagihBayarAbodemen) {
						// 	this.isShowSPembayaran = false
						// } else {
						// 	this.isShowSPembayaran = true
						// }

						if (res.paymentSelection == "bayar-kurang") {
							this.isCekBayarKurang = true
							this.isCekBayarLebih = false
							this.isCekCustom = false
							this.isCekFullPayment = false
							// end
							this.paymentValue = res.paymentSelection
							this.isShowSTagihan = false
							this.isPayCond = false
							this.isBayarKurang = false
						}
						if (res.paymentSelection == "bayar-lebih") {
							this.isCekBayarLebih = true
							this.isCekBayarKurang = false
							this.isCekCustom = false
							this.isCekFullPayment = false
							// end
							this.paymentValue = res.paymentSelection
							this.isShowSPembayaran = false
							this.isPayCond = false
							this.isBayarLebih = false
						}
						if (res.paymentSelection == "full-payment") {
							this.isCekBayarLebih = false
							this.isCekBayarKurang = false
							this.isCekCustom = false
							this.isCekFullPayment = true
							// end
							this.paymentValue = res.paymentSelection
							this.isShowSPembayaran = false
							this.isPayCond = false
							this.isBayarLebih = false
						}
						if (res.paymentSelection == "custom") {
							this.paymentValue = res.paymentSelection
							this.isCekCustom = true
							this.isCekBayarKurang = false
							this.isCekBayarLebih = false
							this.isCekFullPayment = false
							// end
							this.isCustomTagihan = false
							this.isCustom = false
							res.billArray.forEach(data => this.selectedPay.push({ _id: data._id, payment: data.payment, value: data.value }))
							let cstmIPL = res.billArray.find(data => data.value === "isCustomIPL")
							let cstmWater = res.billArray.find(data => data.value === "isCustomWater")
							let cstmPower = res.billArray.find(data => data.value === "isCustomElectricity")

							if (cstmIPL !== undefined && cstmIPL.value === "isCustomIPL") this.isCustomIPL = false
							if (cstmWater !== undefined && cstmWater.value === "isCustomWater") this.isCustomWater = false
							if (cstmPower !== undefined && cstmPower.value === "isCustomElectricity") this.isCustomElectricity = false
						}
						this.getPaymentHistory()
						if (res.totalBillLeft) this.isShowTagihanBilling = false
						this.payment.target.control.setValue(res.paymentSelection)
						this.oldBilling = Object.assign({}, this.billing);
						this.initBilling();
						/** bank */
						if (this.billing.bank) {
							let bank = res.bank.toString()
							this.coaService.findAccountGroupById(bank).subscribe( /** accountGroup or COA */
								bankres => {
									// this.viewBankResult.setValue(`${bankres.data.acctName} - ${bankres.data.acctNo}`)
									this._filterBankList(`${bankres.data.acctName} - ${bankres.data.acctNo}`)
								}
							)
						}
						/** bank */
					}
				});
			}
			this.http.get<any>(`${environment.baseAPI}/api/contract/ownership/unit/${this.idUnit._id}`).subscribe(
				res => {
					this.isToken = res.data[0].isToken
					// this.sTagihanCustom = this.billing.totalBillLeft ? this.billing.totalBillLeft :
					// 	res.data[0].isToken ? (this.billing.totalBilling - this.isCekTagihBayarToken)
					// 		: (this.billing.totalBilling - this.isCekTagihBayarAbodemen)
					this.sTagihanCustom = res.data[0].isToken ? (this.billing.totalBilling - this.isCekTagihBayarToken)
						: (this.billing.totalBilling - this.isCekTagihBayarAbodemen);

					if (this.isShowSPembayaran === false) this.sTagihanCustom = this.convertMinesToPlus(this.sTagihanCustom)
				}
			)
			this.http.get<any>(`${environment.baseAPI}/api/vatoken/getbybilling/${this.billingIdEdit}`).subscribe(
				res => {
					this.vaIPLResult = [{ va: res.data.va_ipl }]
					this.vaWaterResult = [{ va: res.data.va_water }]
				}
			)

		});
		this.subscriptions.push(routeSubscription);
	}
	initBilling() {
		this.createForm();
		this.loadUnit();
		this.loadAccountBank()
		this.getBIllingmage(this.billing._id)
	}

	convertNumber(number) {
		const numb = number.toFixed(0);
		const format = numb.toString().split('').reverse().join('');
		const convert = format.match(/\d{1,3}/g);
		const rupiahSubTotal = convert.join('.').split('').reverse().join('')
		return rupiahSubTotal
	}
	// tester START
	buttonTester(id: string) {
		// Bayar Kurang START
		let controls = this.billingForm.controls;
		// let paymentSelection = this.payment.target.control.value
		// let totalNominal = this.serviceFormat.formatFloat(controls.totalNominal.value)
		let sisaTagihan = this.serviceFormat.formatFloat(controls.sisaTagihan.value)
		// console.log(paymentSelection, "paymentSelection")
		// console.log(totalNominal, "totalNominal")
		console.log(sisaTagihan, "sisaTagihan")
		// Bayar Kurang END



		// Bayar Lebih START
		// let controls = this.billingForm.controls;
		// let paymentSelection = this.payment.target.control.value
		// let totalNominal = this.serviceFormat.formatFloat(controls.totalNominal.value)
		let sisaPembayaran = -this.serviceFormat.formatFloat(controls.sisaPembayaran.value)
		// let sisaPembayaran = this.convertMinesToPlus(controls.sisaPembayaran.value)
		// console.log(paymentSelection, "paymentSelection")
		// console.log(totalNominal, "totalNominal")
		console.log(sisaPembayaran, "sisaPembayaran")
		// Bayar Lebih END

		// Custom START
		// let controls = this.billingForm.controls;
		// let tesCustomTagihan = this.selectedPay
		// let paymentSelection = this.payment.target.control.value
		// let nominalIpl = this.serviceFormat.formatFloat(controls.nominalIpl.value)
		// let nominalWater = this.serviceFormat.formatFloat(controls.nominalWater.value)
		// let nominalPower = this.serviceFormat.formatFloat(controls.nominalPower.value)
		// let iplBillLeft = this.serviceFormat.formatFloat(controls.iplBillLeft.value)
		// let waterBillLeft = this.serviceFormat.formatFloat(controls.waterBillLeft.value)
		// let powerBillLeft = this.serviceFormat.formatFloat(controls.powerBillLeft.value)
		let sisaAmountTotal = this.serviceFormat.formatFloat(controls.sisaCustomTagihan.value)
		// console.log(tesCustomTagihan, 'tesCustomTagihan');
		// console.log(paymentSelection, 'paymentSelection');
		// console.log(nominalIpl, 'nominalIpl');
		// console.log(nominalWater, 'nominalWater');
		// console.log(nominalPower, 'nominalPower');
		// console.log(iplBillLeft, 'iplBillLeft');
		// console.log(waterBillLeft, 'waterBillLeft');
		// console.log(powerBillLeft, 'powerBillLeft');
		// console.log(sisaAmountTotal, 'sisaAmountTotal');
		// Custom END

		console.log(sisaTagihan, "sisaTagihan");
		console.log(sisaPembayaran, "sisaPembayaran");
		console.log(sisaAmountTotal, "sisaAmountTotal");

	}
	// tester END

	// currency format
	changeAmount(event, id) {
		this.toCurrency(undefined, event, "amount", "amountClone", id);
	}
	toCurrency(
		values: any,
		event: any,
		formName: string,
		rawValueProps: string,
		id
	) {
		// Differenciate function calls (from event or another function)
		let controls = this.billingForm.controls;
		let value = event.target.value
		// controls.multiGLAccount.get(`amount${id}`).setValue(formattedNumber);

		var number_string = value.replace(/[^,\d]/g, "").toString(),
			split = number_string.split(","),
			sisa = split[0].length % 3,
			rupiah = split[0].substr(0, sisa),
			ribuan = split[0].substr(sisa).match(/\d{3}/gi);

		// tambahkan titik jika yang di input sudah menjadi value ribuan
		let separator
		if (ribuan) {
			separator = sisa ? "." : "";
			rupiah += separator + ribuan.join(".");
		}

		rupiah = split[1] != undefined ? split[1][1] != undefined ? rupiah + ","
			+ split[1][0] + split[1][1] : split[1] != '' ? rupiah + "," + split[1][0] : rupiah + "," + split[1] : rupiah;

		// const totalTagihan: any = Math.round(this.billing.totalBilling)
		const totalTagihan: any = Math.round(this.billing.totalBilling - this.billing.totalNominal)
		let inputValue = this.serviceFormat.formatFloat(rupiah)

		if (id == 'totalNominal' && this.paymentValue === "bayar-kurang") {
			controls.totalNominal.setValue(rupiah)
			let sisaTagihan: any = (totalTagihan - inputValue)
			controls.sisaTagihan.setValue(this.serviceFormat.rupiahFormatImprovement(sisaTagihan))
		} else if (id == 'totalNominal' && this.paymentValue === "bayar-lebih") {
			controls.totalNominal.setValue(rupiah)
			let sisaPembayaran: any = (inputValue - totalTagihan)
			controls.sisaPembayaran.setValue(this.serviceFormat.rupiahFormatImprovement(sisaPembayaran))
		} else if (this.paymentValue === "custom") {
			let totalIPL = this.billing.ipl.allIpl
			let totalWater = this.billing.water.allWaterAmount
			let totalPower = this.billing.power.allPowerAmount
			// const sisaCustomTagihan = this.serviceFormat.formatFloat(!controls.sisaCustomTagihan.value ? 0 : controls.sisaCustomTagihan.value)

			if (id == 'nominalIpl') {
				controls.nominalIpl.setValue(rupiah)
				if (this.isShowSPembayaran === false) {
					let nomIpl = this.serviceFormat.formatFloat(!controls.iplBillLeft.value ? 0 : controls.iplBillLeft.value)
					let nomWater = this.serviceFormat.formatFloat(!controls.waterBillLeft.value ? 0 : controls.waterBillLeft.value)
					let nomPower = this.serviceFormat.formatFloat(!controls.powerBillLeft.value ? 0 : controls.powerBillLeft.value)
					if (this.isIPLtrueAmount) {
						controls.iplBillLeft.setValue(this.serviceFormat.rupiahFormatImprovement(totalIPL - this.serviceFormat.formatFloat(rupiah) - this.sTagihanCustom))
						nomIpl = this.serviceFormat.formatFloat(!controls.nominalIpl.value ? 0 : controls.nominalIpl.value)
					} else {
						controls.iplBillLeft.setValue(this.serviceFormat.rupiahFormatImprovement(totalIPL - this.serviceFormat.formatFloat(rupiah)))
						nomIpl = this.serviceFormat.formatFloat(!controls.nominalIpl.value ? 0 : controls.nominalIpl.value)
					}

					let valIpl = this.serviceFormat.formatFloat(!controls.iplBillLeft.value ? 0 : controls.iplBillLeft.value)
					let totalBilling = valIpl + nomWater + nomPower

					controls.sisaCustomTagihan.setValue(this.serviceFormat.rupiahFormatImprovement(totalBilling))
					return
				}
				controls.iplBillLeft.setValue(this.serviceFormat.rupiahFormatImprovement(totalIPL - this.serviceFormat.formatFloat(rupiah)))
				let nomIpl = this.serviceFormat.formatFloat(!controls.iplBillLeft.value ? 0 : controls.iplBillLeft.value)
				let nomWater = this.serviceFormat.formatFloat(!controls.waterBillLeft.value ? 0 : controls.waterBillLeft.value)
				let nomPower = this.serviceFormat.formatFloat(!controls.powerBillLeft.value ? 0 : controls.powerBillLeft.value)
				controls.sisaCustomTagihan.setValue(this.serviceFormat.rupiahFormatImprovement(nomIpl + nomWater + nomPower + this.sTagihanCustom))
			}
			else if (id == 'nominalWater') {
				controls.nominalWater.setValue(rupiah);
				if (this.isShowSPembayaran === false) {
					let noIpl = this.serviceFormat.formatFloat(!controls.iplBillLeft.value ? 0 : controls.iplBillLeft.value)
					let nomWater = this.serviceFormat.formatFloat(!controls.waterBillLeft.value ? 0 : controls.waterBillLeft.value)
					let nomPower = this.serviceFormat.formatFloat(!controls.powerBillLeft.value ? 0 : controls.powerBillLeft.value)
					if (this.isWatertrueAmount) {
						controls.waterBillLeft.setValue(this.serviceFormat.rupiahFormatImprovement(totalWater - this.serviceFormat.formatFloat(rupiah) - this.sTagihanCustom))
						nomWater = this.serviceFormat.formatFloat(!controls.nominalWater.value ? 0 : controls.nominalWater.value)
					} else {
						controls.waterBillLeft.setValue(this.serviceFormat.rupiahFormatImprovement(totalWater - this.serviceFormat.formatFloat(rupiah)))
						nomWater = this.serviceFormat.formatFloat(!controls.nominalWater.value ? 0 : controls.nominalWater.value)
					}

					let valWater = this.serviceFormat.formatFloat(!controls.waterBillLeft.value ? 0 : controls.waterBillLeft.value)
					let totalBilling = noIpl + valWater + nomPower
					controls.sisaCustomTagihan.setValue(this.serviceFormat.rupiahFormatImprovement(totalBilling))
					return
				}
				controls.waterBillLeft.setValue(this.serviceFormat.rupiahFormatImprovement(totalWater - this.serviceFormat.formatFloat(rupiah)))
				let noIpl = this.serviceFormat.formatFloat(!controls.iplBillLeft.value ? 0 : controls.iplBillLeft.value)
				let nomWater = this.serviceFormat.formatFloat(!controls.waterBillLeft.value ? 0 : controls.waterBillLeft.value)
				let nomPower = this.serviceFormat.formatFloat(!controls.powerBillLeft.value ? 0 : controls.powerBillLeft.value)
				controls.sisaCustomTagihan.setValue(this.serviceFormat.rupiahFormatImprovement(noIpl + nomWater + nomPower + this.sTagihanCustom))
			}
			else if (id == 'nominalPower') {
				controls.nominalPower.setValue(rupiah);
				if (this.isShowSPembayaran === false) {
					let noIpl = this.serviceFormat.formatFloat(!controls.iplBillLeft.value ? 0 : controls.iplBillLeft.value)
					let nomWater = this.serviceFormat.formatFloat(!controls.waterBillLeft.value ? 0 : controls.waterBillLeft.value)
					let nomPower = this.serviceFormat.formatFloat(!controls.powerBillLeft.value ? 0 : controls.powerBillLeft.value)
					if (this.isPowertrueAmount) {
						controls.powerBillLeft.setValue(this.serviceFormat.rupiahFormatImprovement(totalPower - this.serviceFormat.formatFloat(rupiah) - this.sTagihanCustom))
						nomPower = this.serviceFormat.formatFloat(!controls.nominalPower.value ? 0 : controls.nominalPower.value)
					} else {
						controls.powerBillLeft.setValue(this.serviceFormat.rupiahFormatImprovement(totalPower - this.serviceFormat.formatFloat(rupiah)))
						nomPower = this.serviceFormat.formatFloat(!controls.nominalPower.value ? 0 : controls.nominalPower.value)
					}
					let valPower = this.serviceFormat.formatFloat(!controls.powerBillLeft.value ? 0 : controls.powerBillLeft.value)
					let totalBilling = noIpl + nomWater + valPower
					controls.sisaCustomTagihan.setValue(this.serviceFormat.rupiahFormatImprovement(totalBilling))
					return
				}
				controls.powerBillLeft.setValue(this.serviceFormat.rupiahFormatImprovement(totalPower - this.serviceFormat.formatFloat(rupiah)))
				let noIpl = this.serviceFormat.formatFloat(!controls.iplBillLeft.value ? 0 : controls.iplBillLeft.value)
				let nomWater = this.serviceFormat.formatFloat(!controls.waterBillLeft.value ? 0 : controls.waterBillLeft.value)
				let nomPower = this.serviceFormat.formatFloat(!controls.powerBillLeft.value ? 0 : controls.powerBillLeft.value)
				controls.sisaCustomTagihan.setValue(this.serviceFormat.rupiahFormatImprovement(noIpl + nomWater + nomPower + this.sTagihanCustom))
			} else if (id == 'bayarSisa') {
				controls.bayarSisa.setValue(rupiah);
				if (this.isShowSPembayaran == false) {
					let sTagihanCstm = this.serviceFormat.formatFloat(!controls.bayarSisa.value ? 0 : controls.bayarSisa.value)
					let totalBilling = this.billing.totalBilling
					controls.sisaCustomTagihan.setValue(this.serviceFormat.rupiahFormatImprovement(totalBilling - sTagihanCstm))
					return
				}
				let noIpl = this.serviceFormat.formatFloat(!controls.iplBillLeft.value ? 0 : controls.iplBillLeft.value)
				let nomWater = this.serviceFormat.formatFloat(!controls.waterBillLeft.value ? 0 : controls.waterBillLeft.value)
				let nomPower = this.serviceFormat.formatFloat(!controls.powerBillLeft.value ? 0 : controls.powerBillLeft.value)
				let sTagihanCstm = this.serviceFormat.formatFloat(!controls.bayarSisa.value ? 0 : controls.bayarSisa.value)
				controls.sisaCustomTagihan.setValue(this.serviceFormat.rupiahFormatImprovement((noIpl + nomWater + nomPower + this.sTagihanCustom) - sTagihanCstm))
			}
		}

		return rupiah
	}

	// convertStagihan() {
	// 	if (this.isShowSPembayaran === false) this.sTagihanCustom = this.convertMinesToPlus(this.sTagihanCustom)
	// }

	valueSelectPayment(e) {
		let controls = this.billingForm.controls;
		// Add to formInput paymentSelection

		this.paymentValue = e.value
		this.payment.target.control.setValue(e.value)
		this.payment.tagihanCustom.control.setValue(undefined)
		this.cekSelectPayment = true

		// Total All Consumption
		let totalIPL = this.billing.ipl.allIpl
		let totalWater = this.billing.water.allWaterAmount
		let totalPower = this.billing.power.allPowerAmount
		let totalBilling = this.billing.totalBilling
		// let sTagihanCustom = this.sTagihanCustom ? this.sTagihanCustom : 0
		// let resultTotal = (totalIPL + totalWater + totalPower + sTagihanCustom)
		let resultTotal = totalBilling


		if (e.value) {
			// Hide input Custom START
			this.selectedPay = []
			this.isCustomIPL = true
			this.isCustomWater = true
			this.isCustomElectricity = true
			// Hide input Custom END
			// Clear Custom START
			controls.nominalIpl.setValue("")
			controls.nominalWater.setValue("")
			controls.nominalPower.setValue("")
			controls.iplBillLeft.setValue("")
			controls.waterBillLeft.setValue("")
			controls.powerBillLeft.setValue("")
			controls.sisaCustomTagihan.setValue("")
			// Clear Custom END
		}
		if (e.value === 'bayar-kurang') {
			this.isCekBayarKurang = true
			this.isCekCustom = false
			this.isCekBayarLebih = false
			this.isCekFullPayment = false
			// strt
			this.isPayCond = false
			this.isBayarKurang = false
			this.isBayarLebih = true
			this.isCustom = true
			this.isCustomTagihan = true
			controls.sisaTagihan.setValue("")
			controls.sisaPembayaran.setValue("")
			controls.totalNominal.setValue("")
		} else if (e.value === 'bayar-lebih') {
			this.isCekBayarLebih = true
			this.isCekBayarKurang = false
			this.isCekCustom = false
			this.isCekFullPayment = false
			// strt
			this.isPayCond = false
			this.isBayarLebih = false
			this.isBayarKurang = true
			this.isCustom = true
			this.isCustomTagihan = true
			controls.sisaTagihan.setValue("")
			controls.sisaPembayaran.setValue("")
			controls.totalNominal.setValue("")
		} else if (e.value === 'full-payment') {
			this.isCekBayarLebih = false
			this.isCekBayarKurang = false
			this.isCekCustom = false
			this.isCekFullPayment = true

			// strt
			this.isPayCond = false
			this.isBayarKurang = false
			this.isBayarLebih = true
			this.isCustom = true
			this.isCustomTagihan = true
			controls.sisaTagihan.setValue(0)
			controls.sisaPembayaran.setValue("")
			// controls.totalNominal.setValue(this.serviceFormat.rupiahFormatImprovement(this.billing.totalBilling))
			controls.totalNominal.setValue(this.serviceFormat.rupiahFormatImprovement(this.billing.totalBilling - this.billing.totalNominal))
		}
		else if (e.value === "custom") {
			let totalIPL = this.billing.ipl.allIpl
			let totalWater = this.billing.water.allWaterAmount
			let totalPower = this.billing.power.allPowerAmount
			const sisaCustomTagihan = this.serviceFormat.formatFloat(!controls.sisaCustomTagihan.value ? 0 : controls.sisaCustomTagihan.value)

			if (this.isShowSPembayaran === false) {
				let checkAmount

				// Mengurangi nilai (IPL) disisa tagihan dengan sisaPembayaran
				if (totalIPL !== 0 && totalIPL > this.sTagihanCustom) {
					controls.iplBillLeft.setValue(this.serviceFormat.rupiahFormatImprovement(totalIPL - this.sTagihanCustom))
					checkAmount = "isIplTrue"
					this.isIPLtrueAmount = true
				} else controls.iplBillLeft.setValue(this.serviceFormat.rupiahFormatImprovement(totalIPL))

				if (checkAmount !== "isIplTrue" && totalPower !== "" && totalPower !== 0 && totalPower > this.sTagihanCustom) {
					// Mengurangi nilai (IPL) disisa tagihan dengan sisaPembayaran
					controls.powerBillLeft.setValue(this.serviceFormat.rupiahFormatImprovement(totalPower - this.sTagihanCustom))
					checkAmount = "isPowerTrue"
					this.isPowertrueAmount = true
				} else controls.powerBillLeft.setValue(this.serviceFormat.rupiahFormatImprovement(totalPower))

				if (checkAmount !== "isIplTrue" && checkAmount !== "isPowerTrue" && totalWater !== 0 && totalWater > this.sTagihanCustom) {
					// Mengurangi nilai (IPL) disisa tagihan dengan sisaPembayaran
					this.isWatertrueAmount = true
					controls.waterBillLeft.setValue(this.serviceFormat.rupiahFormatImprovement(totalWater - this.sTagihanCustom))
				} else controls.waterBillLeft.setValue(this.serviceFormat.rupiahFormatImprovement(totalWater))


			} else {
				controls.iplBillLeft.setValue(this.serviceFormat.rupiahFormatImprovement(totalIPL))
				controls.waterBillLeft.setValue(this.serviceFormat.rupiahFormatImprovement(totalWater))
				controls.powerBillLeft.setValue(this.serviceFormat.rupiahFormatImprovement(totalPower))

			}

			// controls.sisaCustomTagihan.setValue(this.serviceFormat.rupiahFormatImprovement(this.sTagihanCustom ? this.sTagihanCustom : 0))
			controls.sisaCustomTagihan.setValue(this.serviceFormat.rupiahFormatImprovement(resultTotal ? resultTotal : 0))
			this.isCekCustom = true
			this.isCekBayarKurang = false
			this.isCekBayarLebih = false
			this.isCekFullPayment = false
			// strt
			this.isPayCond = true
			this.isBayarKurang = true
			this.isBayarLebih = true
			this.isCustom = false
			this.isCustomTagihan = false
			controls.sisaTagihan.setValue("")
			controls.sisaPembayaran.setValue("")
			controls.totalNominal.setValue("")
			this.selectedPay = []
		}
	}



	// createForm() {
	// 	this.billingForm = this.billingFB.group({
	// 		contract: [this.billing.contract],
	// 		billed_to: [{ value: this.billing.billed_to, disabled: true }],
	// 		unit: [{ value: this.billing.unit._id, disabled: true }],
	// 		unit2: [{ value: this.billing.unit2, disabled: true }],
	// 		billing: this.billingFB.group({
	// 			electricity: this.billingFB.group({
	// 				electric_trans: [{ value: this.billing.billing.electricity.electric_trans._id, disabled: true }],
	// 			}),
	// 			water: this.billingFB.group({
	// 				water_trans: [{ value: this.billing.billing.water.water_trans, disabled: true }]
	// 			})
	// 		}),
	// 		power: this.billingFB.group({
	// 			powerMeter: [{ value: this.billing.power.powerMeter, disabled: true }],
	// 			powerRateName: [{ value: this.billing.power.powerRateName, disabled: true }],
	// 			powerRate: [{ value: this.billing.power.powerRate, disabled: true }],
	// 			startPower: [{ value: this.billing.power.startPower, disabled: true }],
	// 			endPower: [{ value: this.billing.power.endPower, disabled: true }],
	// 			usePower: [{ value: this.billing.power.usePower, disabled: true }],
	// 			useAmount: [{ value: this.convertNumber(this.billing.power.useAmount), disabled: true }],
	// 			sc: [{ value: this.billing.power.sc, disabled: true }],
	// 			scAmount: [{ value: this.billing.power.scAmount, disabled: true }],
	// 			ppju: [{ value: this.billing.power.ppju, disabled: true }],
	// 			ppjuAmount: [{ value: this.convertNumber(this.billing.power.ppjuAmount), disabled: true }],
	// 			loss: [{ value: this.billing.power.loss, disabled: true }],
	// 			lossAmount: [{ value: this.convertNumber(this.billing.power.lossAmount), disabled: true }],
	// 			allPowerAmount: [{ value: this.convertNumber(this.billing.power.allPowerAmount), disabled: true }]
	// 		}),
	// 		water: this.billingFB.group({
	// 			waterMeter: [{ value: this.billing.water.waterMeter, disabled: true }],
	// 			waterRate: [{ value: this.billing.water.waterRate, disabled: true }],
	// 			startWater: [{ value: this.billing.water.startWater, disabled: true }],
	// 			endWater: [{ value: this.billing.water.endWater, disabled: true }],
	// 			useWater: [{ value: this.billing.water.useWater, disabled: true }],
	// 			useWaterAmount: [{ value: this.convertNumber(this.billing.water.useWaterAmount), disabled: true }],
	// 			maintenance: [{ value: this.billing.water.maintenance, disabled: true }],
	// 			administration: [{ value: this.billing.water.administration, disabled: true }],
	// 			dirtyWater: [{ value: this.billing.water.dirtyWater, disabled: true }],
	// 			dirtyWaterAmount: [{ value: this.convertNumber(this.billing.water.dirtyWaterAmount), disabled: true }],
	// 			allWaterAmount: [{ value: this.convertNumber(this.billing.water.allWaterAmount), disabled: true }]
	// 		}),
	// 		ipl: this.billingFB.group({
	// 			unitSize: [{ value: this.billing.ipl.unitSize, disabled: true }],
	// 			serviceCharge: [{ value: this.billing.ipl.serviceCharge, disabled: true }],
	// 			sinkingFund: [{ value: this.billing.ipl.sinkingFund, disabled: true }],
	// 			monthIpl: [{ value: this.billing.ipl.monthIpl, disabled: true }],
	// 			ipl: [{ value: this.billing.ipl.ipl, disabled: true }],
	// 			allIpl: [{ value: this.convertNumber(this.billing.ipl.allIpl), disabled: true }]
	// 		}),
	// 		isFreeIpl: [{ value: this.billing.isFreeIpl, disabled: true }],
	// 		isFreeAbodement: [{ value: this.billing.isFreeAbodement, disabled: true }],
	// 		totalBilling: [{ value: this.convertNumber(this.billing.totalBilling), disabled: true }],
	// 		billing_number: [{ value: this.billing.billing_number, disabled: true }],
	// 		created_date: [{ "value": this.billing.created_date, "disabled": true }],
	// 		billing_date: [{ value: this.billing.billing_date, disabled: true }],
	// 		due_date: [{ value: this.billing.due_date, disabled: true }],

	// 		bank: [{ value: this.billing.bank, disabled: false }, Validators.required],
	// 		customerBankNo: [{ value: this.billing.customerBankNo, disabled: false }],
	// 		customerBank: [{ value: this.billing.customerBank, disabled: false }],
	// 		desc: [{ value: this.billing.desc, disabled: false }],
	// 		paidDate: [{ value: this.date1.value, disabled: false }],
	// 		isPaid: [true],
	// 		paymentStatus: [true],
	// 		transferAmount: [{ value: this.billing.transferAmount, disabled: true }],
	// 		paymentType: [{ value: this.billing.paymentType, disabled: false }],
	// 		attachment: [{ value: this.billing.attachment, disabled: false }],
	// 		accountOwner: [this.billing.accountOwner],
	// 		// Virtual Account
	// 		// va_water: [{ value: this.billing.va_water, disabled: false }],
	// 		// va_ipl: [{ value: this.billing.va_ipl, disabled: false }],

	// 		// Payment Status
	// 		totalNominal: [{ value: this.billing.totalNominal ? this.serviceFormat.rupiahFormatImprovement(this.billing.totalNominal) : "", disabled: false }],
	// 		sisaTagihan: [{ value: this.billing.paymentSelection == "bayar-kurang" ? this.serviceFormat.rupiahFormatImprovement(this.billing.totalBillLeft ? this.billing.totalBillLeft : 0) : 0, disabled: false }],
	// 		sisaPembayaran: [{ value: this.billing.paymentSelection == "bayar-lebih" ? this.serviceFormat.rupiahFormatImprovement(this.convertMinesToPlus(this.billing.totalBillLeft ? this.billing.totalBillLeft : 0)) : "", disabled: false }],
	// 		paymentSelection: [{ value: this.billing.billArray, disabled: false }],
	// 		billArray: [{ value: this.billing.billArray, disabled: false }],
	// 		nominalIpl: [{ value: this.billing.nominalIpl ? this.serviceFormat.rupiahFormatImprovement(this.billing.nominalIpl) : "", disabled: false }],
	// 		iplBillLeft: [{ value: this.billing.iplBillLeft ? this.serviceFormat.rupiahFormatImprovement(this.billing.iplBillLeft) : "", disabled: false }],
	// 		nominalWater: [{ value: this.billing.nominalWater ? this.serviceFormat.rupiahFormatImprovement(this.billing.nominalWater) : "", disabled: false }],
	// 		waterBillLeft: [{ value: this.billing.waterBillLeft ? this.serviceFormat.rupiahFormatImprovement(this.billing.waterBillLeft) : "", disabled: false }],
	// 		nominalPower: [{ value: this.billing.nominalPower ? this.serviceFormat.rupiahFormatImprovement(this.billing.nominalPower) : "", disabled: false }],
	// 		powerBillLeft: [{ value: this.billing.powerBillLeft ? this.serviceFormat.rupiahFormatImprovement(this.billing.powerBillLeft) : "", disabled: false }],
	// 		sisaCustomTagihan: [{ value: this.billing.paymentSelection == "custom" ? this.serviceFormat.rupiahFormatImprovement(this.billing.totalBillLeft ? this.billing.totalBillLeft : 0) : 0, disabled: false }],
	// 		bayarSisa: [{ value: this.billing.bayarSisa ? this.serviceFormat.rupiahFormatImprovement(this.billing.bayarSisa) : "", disabled: false }],
	// 		date: [{ value: "", disabled: false }],
	// 	});
	// }
	createForm() {
		this.billingForm = this.billingFB.group({
			contract: [this.billing.contract],
			billed_to: [{ value: this.billing.billed_to, disabled: true }],
			unitValue: [{ value: this.billing.unit2, disabled: true }],
			unit: [{ value: this.billing.unit._id, disabled: true }],
			unit2: [{ value: this.billing.unit2, disabled: true }],
			billing: this.billingFB.group({
				electricity: this.billingFB.group({
					electric_trans: [{ value: this.billing.billing.electricity ? this.billing.billing.electricity.electric_trans : "", disabled: true }],
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
				// useAmount: [{ value: this.convertNumber(this.billing.power.useAmount), disabled: true }],
				useAmount: [{ value: this.billing.power.useAmount, disabled: true }],

				sc: [{ value: this.billing.power.sc, disabled: true }],
				scAmount: [{ value: this.billing.power.scAmount, disabled: true }],
				ppju: [{ value: this.billing.power.ppju, disabled: true }],
				ppjuAmount: [{ value: this.billing.power.ppjuAmount, disabled: true }],
				// ppjuAmount: [{ value: this.convertNumber(this.billing.power.ppjuAmount), disabled: true }],
				loss: [{ value: this.billing.power.loss, disabled: true }],
				lossAmount: [{ value: this.billing.power.lossAmount, disabled: true }],
				allPowerAmount: [{ value: this.billing.power.allPowerAmount, disabled: true }],
				// lossAmount: [{ value: this.convertNumber(this.billing.power.lossAmount), disabled: true }],
				// allPowerAmount: [{ value: this.convertNumber(this.billing.power.allPowerAmount), disabled: true }]
				adminFeeAfterTax: [{ value: this.billing.power.adminFeeAfterTax, disabled: true }],
				ppn: [{ value: this.billing.power.ppn, disabled: true }]
			}),
			water: this.billingFB.group({
				waterMeter: [{ value: this.billing.water.waterMeter, disabled: true }],
				waterRate: [{ value: this.billing.water.waterRate, disabled: true }],
				startWater: [{ value: this.billing.water.startWater, disabled: true }],
				endWater: [{ value: this.billing.water.endWater, disabled: true }],
				useWater: [{ value: this.billing.water.useWater, disabled: true }],
				useWaterAmount: [{ value: this.billing.water.useWaterAmount, disabled: true }],
				// useWaterAmount: [{ value: this.convertNumber(this.billing.water.useWaterAmount), disabled: true }],
				maintenance: [{ value: this.billing.water.maintenance, disabled: true }],
				administration: [{ value: this.billing.water.administration, disabled: true }],
				dirtyWater: [{ value: this.billing.water.dirtyWater, disabled: true }],
				// dirtyWaterAmount: [{ value: this.convertNumber(this.billing.water.dirtyWaterAmount), disabled: true }],
				// allWaterAmount: [{ value: this.convertNumber(this.billing.water.allWaterAmount), disabled: true }]
				dirtyWaterAmount: [{ value: this.billing.water.dirtyWaterAmount, disabled: true }],
				allWaterAmount: [{ value: this.billing.water.allWaterAmount, disabled: true }],
				admBank: [{ value: this.billing.water.admBank == undefined ? "" : this.billing.water.admBank, disabled: true }],
				ppn: [{ value: this.billing.power.ppn, disabled: true }]
			}),
			ipl: this.billingFB.group({
				unitSize: [{ value: this.billing.ipl.unitSize, disabled: true }],
				serviceCharge: [{ value: this.billing.ipl.serviceCharge, disabled: true }],
				sinkingFund: [{ value: this.billing.ipl.sinkingFund, disabled: true }],
				sCharAmount: [{ value: this.billing.ipl.sCharAmount, disabled: true }],
				sFundAmount: [{ value: this.billing.ipl.sFundAmount, disabled: true }],
				monthIpl: [{ value: this.billing.ipl.monthIpl, disabled: true }],
				ipl: [{ value: this.billing.ipl.ipl, disabled: true }],
				// allIpl: [{ value: this.convertNumber(this.billing.ipl.allIpl), disabled: true }]
				allIpl: [{ value: this.billing.ipl.allIpl == undefined || this.billing.ipl.allIpl == null || this.billing.ipl.allIpl == 0 ? "" : this.billing.ipl.allIpl, disabled: true }],
			}),
			isFreeIpl: [{ value: this.billing.isFreeIpl, disabled: true }],
			isFreeAbodement: [{ value: this.billing.isFreeAbodement, disabled: true }],
			// totalBilling: [{ value: this.billing.subTotalBilling, disabled: true }],
			totalBilling: [{ value: this.billing.totalBilling, disabled: true }],
			grandTotalBilling: [{ value: this.billing.totalBilling, disabled: true }],
			billing_number: [{ value: this.billing.billing_number, disabled: true }],
			created_date: [{ "value": this.billing.created_date, "disabled": true }],
			billing_date: [{ value: this.billing.billing_date, disabled: true }],
			due_date: [{ value: this.billing.due_date, disabled: true }],

			bank: [{ value: "", disabled: false }],
			customerBankNo: [{ value: this.billing.customerBankNo, disabled: false }],
			customerBank: [{ value: this.billing.customerBank, disabled: false }],
			desc: [{ value: "", disabled: false }],
			paidDate: [{ value: "", disabled: false }],
			isPaid: [true],
			paymentStatus: [true],
			transferAmount: [{ value: this.billing.transferAmount, disabled: true }],
			paymentType: [{ value: "", disabled: false }, Validators.required],
			attachment: [{ value: this.billing.attachment, disabled: false }],
			accountOwner: [this.billing.accountOwner],

			// Payment Status
			totalNominal: [{ value: "", disabled: false }],
			sisaTagihan: [{ value: this.billing.paymentSelection == "bayar-kurang" ? this.serviceFormat.rupiahFormatImprovement(this.billing.totalBilling ? this.billing.totalBilling - this.billing.totalNominal : 0) : 0, disabled: false }],
			sisaPembayaran: [{ value: this.billing.paymentSelection == "bayar-lebih" ? this.serviceFormat.rupiahFormatImprovement(this.convertMinesToPlus(this.billing.totalBillLeft ? this.billing.totalBillLeft : 0)) : "", disabled: false }],
			paymentSelection: [{ value: this.billing.billArray, disabled: false }],
			billArray: [{ value: this.billing.billArray, disabled: false }],
			nominalIpl: [{ value: this.billing.nominalIpl ? this.serviceFormat.rupiahFormatImprovement(this.billing.nominalIpl) : "", disabled: false }],
			iplBillLeft: [{ value: this.billing.iplBillLeft ? this.serviceFormat.rupiahFormatImprovement(this.billing.iplBillLeft) : "", disabled: false }],
			nominalWater: [{ value: this.billing.nominalWater ? this.serviceFormat.rupiahFormatImprovement(this.billing.nominalWater) : "", disabled: false }],
			waterBillLeft: [{ value: this.billing.waterBillLeft ? this.serviceFormat.rupiahFormatImprovement(this.billing.waterBillLeft) : "", disabled: false }],
			nominalPower: [{ value: this.billing.nominalPower ? this.serviceFormat.rupiahFormatImprovement(this.billing.nominalPower) : "", disabled: false }],
			powerBillLeft: [{ value: this.billing.powerBillLeft ? this.serviceFormat.rupiahFormatImprovement(this.billing.powerBillLeft) : "", disabled: false }],
			sisaCustomTagihan: [{ value: this.billing.paymentSelection == "custom" ? this.serviceFormat.rupiahFormatImprovement(this.billing.totalBillLeft ? this.billing.totalBillLeft : 0) : 0, disabled: false }],
			bayarSisa: [{ value: this.billing.bayarSisa ? this.serviceFormat.rupiahFormatImprovement(this.billing.bayarSisa) : "", disabled: false }],
			date: [{ value: "", disabled: false }],
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

	selectList(list, target) {
		const controls = this.billingForm.controls;

		const validate = this.selectedPay.find(data => data.value === list.value)
		if (validate) return

		this[`selected${target}`].push(list);

		let value = list.value
		let totalIPL = this.billing.ipl.allIpl
		let totalWater = this.billing.water.allWaterAmount
		let totalPower = this.billing.power.allPowerAmount
		const sisaCustomTagihan = this.serviceFormat.formatFloat(!controls.sisaCustomTagihan.value ? 0 : controls.sisaCustomTagihan.value)


		// controls.iplBillLeft.setValue(this.serviceFormat.rupiahFormatImprovement(totalIPL))
		// controls.waterBillLeft.setValue(this.serviceFormat.rupiahFormatImprovement(totalWater))
		// controls.powerBillLeft.setValue(this.serviceFormat.rupiahFormatImprovement(totalPower))
		if (value === "isCustomIPL") {
			// controls.sisaCustomTagihan.setValue(this.serviceFormat.rupiahFormatImprovement(sisaCustomTagihan + totalIPL))
			this.isCustomIPL = false
		} else if (value === "isCustomWater") {
			// controls.sisaCustomTagihan.setValue(this.serviceFormat.rupiahFormatImprovement(sisaCustomTagihan + totalWater))
			this.isCustomWater = false
		} else if (value === "isCustomElectricity") {
			// controls.sisaCustomTagihan.setValue(this.serviceFormat.rupiahFormatImprovement(sisaCustomTagihan + totalPower))
			this.isCustomElectricity = false
		}

		this.cd.markForCheck();

	}

	deleteList(id, target, list) {
		const controls = this.billingForm.controls;
		console.log(id, "jhdsgv")
		console.log(this[`selected${target}`], "this[`selected${target}`]")

		let valueIndex = this[`selected${target}`].findIndex(
			(item) => item._id === id
		);
		console.log(valueIndex, "valueIndex")
		this[`selected${target}`].splice(valueIndex, 1);
		let value = list.value
		let totalIPL = this.billing.ipl.allIpl
		let totalWater = this.billing.water.allWaterAmount
		let totalPower = this.billing.power.allPowerAmount
		let totalBilling = this.billing.totalBilling
		const sisaCustomTagihan = this.serviceFormat.formatFloat(!controls.sisaCustomTagihan.value ? 0 : controls.sisaCustomTagihan.value)
		console.log(sisaCustomTagihan, 'sisaCustomTagihan');

		let nomIpl = this.serviceFormat.formatFloat(controls.nominalIpl.value ? controls.nominalIpl.value : 0)
		let nomWater = this.serviceFormat.formatFloat(controls.nominalWater.value ? controls.nominalWater.value : 0)
		let nomPower = this.serviceFormat.formatFloat(controls.nominalPower.value ? controls.nominalPower.value : 0)


		if (value === "isCustomIPL") {
			this.billArray = this.billArray
			controls.sisaCustomTagihan.setValue(this.serviceFormat.rupiahFormatImprovement(sisaCustomTagihan + nomIpl))
			controls.iplBillLeft.setValue("")
			this.isCustomIPL = true
		} else if (value === "isCustomWater") {
			controls.sisaCustomTagihan.setValue(this.serviceFormat.rupiahFormatImprovement(sisaCustomTagihan + nomWater))
			controls.waterBillLeft.setValue("")
			this.isCustomWater = true
		} else if (value === "isCustomElectricity") {
			controls.sisaCustomTagihan.setValue(this.serviceFormat.rupiahFormatImprovement(sisaCustomTagihan + nomPower))
			controls.powerBillLeft.setValue("")
			this.isCustomElectricity = true
		}

		this.cd.markForCheck();

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

	loadAccountBank() {
		this.selection.clear();
		const queryParams = new QueryAccountBankModel(
			null,
			"asc",
			null,
			1,
			1000
		);
		this.bservice.getListAccountBankPaidTo(queryParams).subscribe(
			res => {
				this.bankResult = res.data;
				this.BankResultFiltered = res.data
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

	onSubmit(withBack: boolean = false) {
		const check = this.checkValidationInput()

		if (check !== false) {
			this.hasFormErrors = false;
			const controls = this.billingForm.controls
			if (this.billingForm.invalid) {
				console.log(controls);
				Object.keys(controls).forEach(controlName =>
					controls[controlName].markAsTouched()
				);

				this.hasFormErrors = true;
				this.selectedTab = 0;
				return;
			}
			const editedBilling = this.prepareBilling();
			this.updateBilling(editedBilling, withBack);
		} else return


	}

	prepareBilling(): BillingModel {
		const controls = this.billingForm.controls;
		const _billing = new BillingModel();
		_billing.clear();
		_billing._id = this.billing._id;
		_billing.contract = controls.contract.value;
		_billing.billed_to = controls.billed_to.value.toLowerCase();
		_billing.unit = controls.unit.value;
		_billing.unit2 = controls.unit2.value.toLowerCase()
		_billing.isFreeIpl = controls.isFreeIpl.value;
		_billing.isFreeAbodement = controls.isFreeAbodement.value;
		_billing.totalBilling = controls.totalBilling.value;
		_billing.billing_number = controls.billing_number.value;
		_billing.created_date = controls.created_date.value;
		_billing.billing_date = controls.billing_date.value;
		_billing.due_date = controls.due_date.value;


		_billing.bank = controls.bank.value;
		_billing.isPaid = controls.isPaid.value;
		_billing.customerBank = controls.customerBank.value;
		_billing.customerBankNo = controls.customerBankNo.value;
		_billing.desc = controls.desc.value;
		_billing.paidDate = controls.paidDate.value;
		_billing.paymentStatus = controls.paymentStatus.value;
		_billing.paymentType = controls.paymentType.value;
		_billing.transferAmount = controls.transferAmount.value;
		_billing.accountOwner = controls.accountOwner.value;
		_billing.attachment = controls.attachment.value;

		// Virtual Account
		// _billing.va_water = controls.va_water.value
		// _billing.va_ipl = controls.va_ipl.value

		// UPDATE BILLING START


		let paymentSelection = this.payment.target.control.value
		let totalNominal = this.serviceFormat.formatFloat(controls.totalNominal.value)

		// Bayar Kurang START
		let sisaTagihan = this.serviceFormat.formatFloat(controls.sisaTagihan.value)
		// Bayar Kurang END

		// Bayar Lebih START
		let sisaPembayaran = -this.serviceFormat.formatFloat(controls.sisaPembayaran.value) //jadikan nilai sisa pembayaran menjadi minus
		// Bayar Lebih END

		console.log(sisaTagihan, "sisaTagihan bill");
		console.log(sisaPembayaran, "sisaPembayaran bill");


		// Custom START
		let tesCustomTagihan = this.selectedPay
		let nominalIpl = this.serviceFormat.formatFloat(controls.nominalIpl.value)
		let nominalWater = this.serviceFormat.formatFloat(controls.nominalWater.value)
		let nominalPower = this.serviceFormat.formatFloat(controls.nominalPower.value)
		let iplBillLeft = this.serviceFormat.formatFloat(controls.iplBillLeft.value)
		let waterBillLeft = this.serviceFormat.formatFloat(controls.waterBillLeft.value)
		let powerBillLeft = this.serviceFormat.formatFloat(controls.powerBillLeft.value)
		let sisaAmountTotal = this.serviceFormat.formatFloat(controls.sisaCustomTagihan.value)
		let bayarSisa = this.serviceFormat.formatFloat(controls.bayarSisa.value)
		// Custom END
		let slctdPay = []
		this.selectedPay.forEach(data => slctdPay.push(data.value))

		_billing.paymentSelection = paymentSelection
		_billing.totalNominal = totalNominal
		_billing.totalBillLeft = sisaTagihan !== 0 ? sisaTagihan :
			sisaPembayaran !== -0 ? sisaPembayaran : sisaAmountTotal !== 0 ?
				sisaAmountTotal : undefined
		_billing.billArray = this.selectedPay
		_billing.nominalIpl = nominalIpl !== 0 ? nominalIpl : undefined
		_billing.nominalWater = nominalWater !== 0 ? nominalWater : undefined
		_billing.iplBillLeft = iplBillLeft !== 0 ? iplBillLeft : undefined
		_billing.waterBillLeft = waterBillLeft !== 0 ? waterBillLeft : undefined
		_billing.nominalPower = nominalPower !== 0 ? nominalPower : undefined
		_billing.powerBillLeft = powerBillLeft !== 0 ? powerBillLeft : undefined
		_billing.bayarSisa = bayarSisa !== 0 ? bayarSisa : undefined

		console.log(_billing.totalBillLeft, "totalBillLeft")
		// UPDATE BILLING END

		return _billing;
	}


	updateBilling(_billing: BillingModel, withBack: boolean = false) {
		const editSubscription = this.serviceBill.updateBilling(_billing).subscribe(
			res => {
				this.checkProgressGenerate('success') // Progress "success" generate PopUp
				const message = `Billing successfully has been saved.`;
				this.layoutUtilsService.showActionNotification(message, MessageType.Update, 5000, true, true);
				const url = `/blog`;
				this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
			},
			err => {
				console.error(err);
				this.checkProgressGenerate('failed') // Progress "success" generate PopUp
				const message = 'Error while saving billing | ' + err.statusText;
				this.layoutUtilsService.showActionNotification(message, MessageType.Update, 5000, true, false);
			}
		);
		this.subscriptions.push(editSubscription);
	}

	getComponentTitle() {
		let result = `Update Billing`;
		return result;
	}

	onAlertClose($event) {
		this.hasFormErrors = false;
	}

	ngOnDestroy() {
		this.subscriptions.forEach(sb => sb.unsubscribe());
	}

	async getBIllingmage(id) {
		const URL_IMAGE = `${environment.baseAPI}/api/billing`
		await this.http.get(`${URL_IMAGE}/${id}/image`).subscribe((res: any) => {
			console.log(res)
			this.images = res.data;
		});
	}
	_setBankValue(value) {
		const controls = this.billingForm.controls;
		controls.bank.setValue(value)
	}
	_onKeyupPaidTo(e) {
		// this.billingForm.patchValue({ unit: undefined });
		this._filterBankList(e.target.value);
	}

	_filterBankList(text: string) {
		this.BankResultFiltered = this.bankResult.filter((i) => {
			const filterText = `${i.acctName.toLocaleLowerCase()} - ${i.acctNo.toLocaleLowerCase()}`;
			if (filterText.includes(text.toLocaleLowerCase())) return i;
		});
	}
	onChangePaidTo(e) {
		const controls = this.billingForm.controls
		controls.bank.setValue(e)
	}

	/** Process Generate
 * This is a popup for the progress of generating billing
 * @param content 
 */
	processGenerate(content) {
		const check = this.checkValidationInput()

		if (check !== false) {
			this.dialog.open(content, {
				data: {
					input: ""
				},
				maxWidth: "565px",
				minHeight: "375px",
				disableClose: true
			});
		}
	}

	/**
* Function to close the process generate dialog popup
*/
	closePopUp() {
		this.dialog.closeAll()
		this.isGenerateBilling = "" // Reset > isGenerateBilling
		this.msgErrorGenerate = "" // Reset > msgErrorGenerate
	}

	/**
 * Function to run progress on generating billing
 * @param status status, to determine the feedback response from the back-end
 */
	checkProgressGenerate(status: string) {
		this.isGenerateBilling = status
	}

	/**
	 * checkValidationInput
	 */
	checkValidationInput() {
		const controls = this.billingForm.controls;
		// Cek Validate
		const toNominal = controls.totalNominal.value
		const sTagihan = controls.sisaTagihan.value
		const sPembayaran = controls.sisaPembayaran.value
		const tBilling = this.serviceFormat.formatFloat(controls.totalBilling.value.toString())
		const sisaCustomTagihan = controls.sisaCustomTagihan.value
		let totalIPL = this.billing.ipl.allIpl
		let totalWater = this.billing.water.allWaterAmount
		let totalPower = this.billing.power.allPowerAmount

		const nomIpl = controls.nominalIpl.value
		const nomWater = controls.nominalWater.value
		const nomPower = controls.nominalPower.value

		if (!controls.bank.value) {
			const message = `Pilih salah satu bank pembayaran!`;
			this.layoutUtilsService.showActionNotification(message);
			return false
		}

		if (this.isCekBayarKurang) {
			if (this.serviceFormat.formatFloat(toNominal) > tBilling) {
				const message = `Nominal tidak bisa melebihi total billing`;
				this.layoutUtilsService.showActionNotification(message);
				return false
			}
			if (toNominal == "" || sTagihan == "") {
				const message = `Lengkapi input bayar kurang`;
				this.layoutUtilsService.showActionNotification(message);
				return false
			}
		} else if (this.isCekBayarLebih) {
			if (this.serviceFormat.formatFloat(toNominal) < tBilling) {
				const message = `Nominal tidak bisa lebih kecil dari total billing`;
				this.layoutUtilsService.showActionNotification(message);
				return false
			}
			if (toNominal == "" || sPembayaran == "") {
				const message = `Lengkapi input bayar lebih`;
				this.layoutUtilsService.showActionNotification(message);
				return false
			}
		} else if (this.isCekCustom) {
			if (this.serviceFormat.formatFloat(nomIpl) > totalIPL || this.serviceFormat.formatFloat(nomWater) > totalWater
				|| this.serviceFormat.formatFloat(nomPower) > totalPower) {
				const message = `Sisa tagihan tidak boleh melebihi input nominal`;
				this.layoutUtilsService.showActionNotification(message);
				return false
			}
			if (sisaCustomTagihan == '') {
				const message = `Lengkapi input custom`;
				this.layoutUtilsService.showActionNotification(message);
				return false
			}
		}

		/** check form */
		const payType = controls.paymentType.value
		if (payType !== 'Cash' && controls.bank.value == undefined) {
			const message = `Lengkapi input paid to`;
			this.layoutUtilsService.showActionNotification(message);
			return false
		}
	}
	getPaymentHistory() {
		this.serviceBill.getPayment(this.billing.billing_number).subscribe(res => {
			this.paymentHistory = res.data
			this.sumTotalPayment()

		})
	}
	sumTotalPayment() {
		let result = 0
		this.paymentHistory.map(item => {
			let val = item.log_after.totalNominal - item.log_before.totalNominal
			result = result + val
		})
		this.totalPayment = result
	}

}
