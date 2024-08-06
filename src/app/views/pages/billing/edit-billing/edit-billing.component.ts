// Angular
import { Component, OnInit, OnDestroy, ChangeDetectorRef } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";
import { BehaviorSubject, Observable, of, Subscription } from "rxjs";
import { Store, select } from "@ngrx/store";
import { AppState } from "../../../../core/reducers";
import { LayoutUtilsService, MessageType, QueryParamsModel } from "../../../../core/_base/crud";
import { selectBillingActionLoading, selectBillingById } from "../../../../core/billing/billing.selector";
import { BillingModel } from "../../../../core/billing/billing.model";
import { BillingService } from "../../../../core/billing/billing.service";
import { SelectionModel } from "@angular/cdk/collections";
import * as _moment from "moment";
import { default as _rollupMoment, Moment } from "moment";
import { UnitService } from "../../../../core/unit/unit.service";
import { QueryUnitModel } from "../../../../core/unit/queryunit.model";
import { QueryAccountBankModel } from "../../../../core/masterData/bank/accountBank/queryaccountBank.model";
import { AccountBankService } from "../../../../core/masterData/bank/accountBank/accountBank.service";
const moment = _rollupMoment || _moment;
import { environment } from "../../../../../environments/environment";
import { HttpClient } from "@angular/common/http";
import { OwnershipContractService } from "../../../../core/contract/ownership/ownership.service";
import { AccountGroupService } from "../../../../core/accountGroup/accountGroup.service";

@Component({
	selector: "kt-add-billing",
	templateUrl: "./edit-billing.component.html",
	styleUrls: ["./edit-billing.component.scss"],
})
export class EditBillingComponent implements OnInit, OnDestroy {
	billing: BillingModel;
	images: any;
	billingId$: Observable<string>;
	oldBilling: BillingModel;
	selectedTab = 0;
	loading$: Observable<boolean>;
	billingForm: FormGroup;
	ownService: OwnershipContractService;
	idUnit: any = "";
	hasFormErrors = false;
	unitResult: any[] = [];
	customerResult: any[] = [];
	powerResult: any[] = [];
	waterResult: any[] = [];
	bankResult: any[] = [];
	BankResultFiltered: any[] = [];
	depositToBayarLebihResult: any[] = [];
	depositToBayarLebihResultFiltered: any[] = [];
	isToken: boolean = false;
	selection = new SelectionModel<BillingModel>(true, []);
	date = new FormControl(moment());
	date1 = new FormControl(new Date());
	serializedDate = new FormControl(new Date().toISOString());
	duedate = new FormControl();
	isfreeIpl: boolean = false;
	isfreeAbodement: boolean = false;
	billingIdEdit: string = "";

	billArray: any = [
		{
			_id: "1",
			payment: "Service Charge",
			value: "isCustomSC",
		},
		{
			_id: "2",
			payment: "Sinking Fund",
			value: "isCustomIPL",
		},
		{
			_id: "3",
			payment: "Water",
			value: "isCustomWater",
		},
		{
			_id: "4",
			payment: "Electricity",
			value: "isCustomElectricity",
		},
	];

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
		// 	// payment: "Custom",
		// 	payment: "Pembayaran Kurang",
		// 	value: "custom",
		// },
	];

	paymentValue: any;

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

	paymentType: any = [
		{
			payment: "Transfer",
			value: "Transfer",
		},
		{
			payment: "Debit BCA",
			value: "Debit BCA",
		},
	];

	selectTargetTagihan: any = [];

	// variabel condition payment START
	isPayCond: boolean = true;
	isBayarKurang: boolean = true;
	isBayarLebih: boolean = true;
	isCustom: boolean = true;
	// variabel condition payment END
	paymentTarget = new FormControl();
	selectedPay: any[] = [];

	// Variabel Custom Condition START
	isCustomSC: boolean = true;
	isCustomIPL: boolean = true;
	isCustomWater: boolean = true;
	isCustomElectricity: boolean = true;
	isCustomTagihan: boolean = true;
	// Variabel Custom Condition END

	cekSelectPayment: boolean = true;

	admBankPriceIPL: number = 3000;

	isShowSTagihan: boolean = true;
	isShowSPembayaran: boolean = true;
	isShowTagihanBilling: boolean = true;

	// cekValidation START
	isCekBayarKurang: boolean = false;
	isCekBayarLebih: boolean = false;
	isCekCustom: boolean = false;
	isCekFullPayment: boolean = false;
	// cekValidation END

	// cekPembayaran token / abodemen
	isCekTagihBayarToken: number = 0;
	isCekTagihBayarAbodemen: number = 0;

	// result totalBillLeftPembayaran
	rsltBillLeftPembayaran: any;
	rsltNoBillLeftPembayaran: any;

	// Sisa Tagihan Custom
	sTagihanCustom: number;

	// CheckAmount
	isSCtrueAmount: boolean = false;
	isIPLtrueAmount: boolean = false;
	isPowertrueAmount: boolean = false;
	isWatertrueAmount: boolean = false;

	wordingPaySelect: string;

	vaWaterResult: any[] = [];
	vaIPLResult: any[] = [];
	// Private properties
	private subscriptions: Subscription[] = [];
	constructor(private activatedRoute: ActivatedRoute, private router: Router, private billingFB: FormBuilder, private layoutUtilsService: LayoutUtilsService, private store: Store<AppState>, private serviceBill: BillingService, private serviceUnit: UnitService, private bservice: AccountBankService, private http: HttpClient, private cd: ChangeDetectorRef) {}

	ngOnInit() {
		this.loading$ = this.store.pipe(select(selectBillingActionLoading));
		const routeSubscription = this.activatedRoute.params.subscribe((params) => {
			const id = params.id;
			if (id) {
				this.store.pipe(select(selectBillingById(id))).subscribe((res) => {
					if (res) {
						this.billingIdEdit = res._id;
						// this.idUnit = res.unit._id
						this.idUnit = res.unit;
						this.billing = res;

						this.wordingPaySelect = res.paymentSelection === "bayar-lebih" ? "Sisa Pembayaran" : "Sisa Tagihan";

						this.isCekTagihBayarToken = res.ipl.allIpl + res.water.allWaterAmount;
						this.isCekTagihBayarAbodemen = res.ipl.allIpl + res.water.allWaterAmount + res.power.allPowerAmount;
						let validateToken: any = res.totalBilling - this.isCekTagihBayarToken;
						let validateAbodemen: any = res.totalBilling - this.isCekTagihBayarAbodemen;

						let rsltValidateToken, rsltValidateAbodemen;

						const regexValidate = /\-\d/g;
						rsltValidateToken = regexValidate.test(validateToken);
						rsltValidateAbodemen = regexValidate.test(validateAbodemen);

						if (res.payCond === "full-payment") this.cekSelectPayment = false;

						if (rsltValidateToken || rsltValidateAbodemen) {
							this.isShowSPembayaran = false;
						} else this.isShowSPembayaran = true;

						// if (res.totalBilling < this.isCekTagihBayarToken ||
						// 	res.totalBilling < this.isCekTagihBayarAbodemen) {
						// 	this.isShowSPembayaran = false
						// } else {
						// 	this.isShowSPembayaran = true
						// }

						if (res.paymentSelection == "bayar-kurang") {
							this.isCekBayarKurang = true;
							this.isCekBayarLebih = false;
							// this.isCekCustom = false
							this.isCekFullPayment = false;
							// end
							this.paymentValue = res.paymentSelection;
							this.isShowSTagihan = false;
							this.isPayCond = false;
							this.isBayarKurang = false;
						}
						if (res.paymentSelection == "bayar-lebih") {
							this.isCekBayarLebih = true;
							this.isCekBayarKurang = false;
							// this.isCekCustom = false
							this.isCekFullPayment = false;

							// end
							this.paymentValue = res.paymentSelection;
							this.isShowSPembayaran = false;
							this.isPayCond = false;
							this.isBayarLebih = false;
						}
						if (res.paymentSelection == "full-payment") {
							this.isCekBayarLebih = false;
							this.isCekBayarKurang = false;
							// this.isCekCustom = false
							this.isCekFullPayment = true;
							// end
							this.paymentValue = res.paymentSelection;
							this.isShowSPembayaran = false;
							this.isPayCond = false;
							this.isBayarLebih = false;
						}

						// if (res.paymentSelection == "custom") {
						// 	this.paymentValue = res.paymentSelection
						// 	// this.isCekCustom = true
						// 	this.isCekBayarKurang = false
						// 	this.isCekBayarLebih = false
						// 	this.isCekFullPayment = false
						// 	// end
						// 	this.isCustomTagihan = false
						// 	this.isCustom = false

						// 	if (res.billArray) {
						// 		res.billArray.forEach(data => this.selectedPay.push({ _id: data._id, payment: data.payment, value: data.value }))
						// 		let cstmIPL = res.billArray.find(data => data.value === "isCustomIPL")
						// 		let cstmWater = res.billArray.find(data => data.value === "isCustomWater")
						// 		let cstmPower = res.billArray.find(data => data.value === "isCustomElectricity")

						// 		if (cstmIPL !== undefined && cstmIPL.value === "isCustomIPL") this.isCustomIPL = false
						// 		if (cstmWater !== undefined && cstmWater.value === "isCustomWater") this.isCustomWater = false
						// 		if (cstmPower !== undefined && cstmPower.value === "isCustomElectricity") this.isCustomElectricity = false
						// 	}

						// }
						if (res.totalBillLeft) this.isShowTagihanBilling = false;
						this.payment.target.control.setValue(res.paymentSelection);
						this.oldBilling = Object.assign({}, this.billing);
						this.initBilling();
					}
				});
			}

			this.http.get<any>(`${environment.baseAPI}/api/contract/ownership/unit/${this.idUnit}`).subscribe((res) => {
				this.isToken = res.data[0].isToken;
				// this.sTagihanCustom = this.billing.totalBillLeft ? this.billing.totalBillLeft :
				// 	res.data[0].isToken ? (this.billing.totalBilling - this.isCekTagihBayarToken)
				// 		: (this.billing.totalBilling - this.isCekTagihBayarAbodemen)
				this.sTagihanCustom = res.data[0].isToken ? this.billing.totalBilling - this.isCekTagihBayarToken : this.billing.totalBilling - this.isCekTagihBayarAbodemen;

				if (this.isShowSPembayaran === false) this.sTagihanCustom = this.convertMinesToPlus(this.sTagihanCustom);
			});
			this.http.get<any>(`${environment.baseAPI}/api/vatoken/getbybilling/${this.billingIdEdit}`).subscribe((res) => {
				this.vaIPLResult = [{ va: res.data.va_ipl }];
				this.vaWaterResult = [{ va: res.data.va_water }];
			});
		});
		this.subscriptions.push(routeSubscription);
	}
	initBilling() {
		this.createForm();
		this.loadUnit();
		this.loadAccountBank();
		this.loadDepositBayarLebih();
		this.getBIllingmage(this.billing._id);
		// this.convertStagihan()
	}

	/**
	 * changeAmount > Change Display Format Number
	 * @param event
	 * @param id
	 * @returns
	 */
	changeAmount(event: any, id: any) {
		// Differenciate function calls (from event or another function)
		let controls = this.billingForm.controls;
		let value = event.target.value;

		var number_string = value.replace(/[^,\d]/g, "").toString(),
			split = number_string.split(","),
			sisa = split[0].length % 3,
			rupiah = split[0].substr(0, sisa),
			ribuan = split[0].substr(sisa).match(/\d{3}/gi);

		// tambahkan titik jika yang di input sudah menjadi value ribuan
		let separator;
		if (ribuan) {
			separator = sisa ? "." : "";
			rupiah += separator + ribuan.join(".");
		}

		rupiah = this.rupiahGetComma(split, rupiah);

		const totalTagihan: any = this.billing.totalBilling;
		let inputValue = this.formatFloat(rupiah);

		// Bayar Kurang
		if (id == "totalNominal" && this.paymentValue === "bayar-kurang") {
			controls.totalNominal.setValue(rupiah);
			let sisaTagihan: any = totalTagihan - inputValue;
			controls.sisaTagihan.setValue(this.rupiahFormatImprovement(sisaTagihan));
		}
		// Bayar Lebih
		else if (id == "totalNominal" && this.paymentValue === "bayar-lebih") {
			controls.totalNominal.setValue(rupiah);
			let sisaPembayaran: any = inputValue - totalTagihan;
			controls.sisaPembayaran.setValue(this.rupiahFormatImprovement(sisaPembayaran));
		}
		// Bayar Custom
		else if (this.paymentValue === "custom") {
			// Total Murni Dari Utility
			const totalIPL = this.billing.ipl.sFundAmount || this.billing.ipl.sFundAmount === 0 ? this.billing.ipl.sFundAmount : this.billing.ipl.sinkingFund * this.billing.ipl.unitSize * this.billing.ipl.monthIpl;
			const totalSC = this.billing.ipl.sCharAmount || this.billing.ipl.sCharAmount === 0 ? this.billing.ipl.sCharAmount : this.billing.ipl.serviceCharge * this.billing.ipl.unitSize * this.billing.ipl.monthIpl;
			const totalWater = this.billing.water.allWaterAmount;
			const totalPower = this.billing.power.allPowerAmount;

			// Total Dari Sisa Tagihan Per utility
			const iplBillLeft = this.formatFloat(!controls.iplBillLeft.value ? 0 : controls.iplBillLeft.value);
			const scBillLeft = this.formatFloat(!controls.scBillLeft.value ? 0 : controls.scBillLeft.value);
			const waterBillLeft = this.formatFloat(!controls.waterBillLeft.value ? 0 : controls.waterBillLeft.value);
			const powerBillLeft = this.formatFloat(!controls.powerBillLeft.value ? 0 : controls.powerBillLeft.value);

			// Rupiah FormatFloat
			const rupiahFormatFloat = this.formatFloat(rupiah);

			if (id == "nominalIpl") {
				// Mencegah lebih besar dari tagihan
				if (rupiahFormatFloat > iplBillLeft) return;
				controls.nominalIpl.setValue(rupiah);
				if (this.isShowSPembayaran === false) {
					let nomIpl = iplBillLeft;
					let nomSc = scBillLeft;
					let nomWater = waterBillLeft;
					let nomPower = powerBillLeft;
					if (this.isIPLtrueAmount) {
						controls.iplBillLeft.setValue(this.rupiahFormatImprovement(totalIPL - rupiahFormatFloat - this.sTagihanCustom));
						nomIpl = this.formatFloat(!controls.nominalIpl.value ? 0 : controls.nominalIpl.value);
					} else {
						controls.iplBillLeft.setValue(this.rupiahFormatImprovement(totalIPL - rupiahFormatFloat));
						nomIpl = this.formatFloat(!controls.nominalIpl.value ? 0 : controls.nominalIpl.value);
					}

					let valIpl = iplBillLeft;
					let totalBilling = valIpl + nomWater + nomPower + nomSc;

					controls.sisaCustomTagihan.setValue(this.rupiahFormatImprovement(totalBilling));
					return;
				}
				controls.iplBillLeft.setValue(this.rupiahFormatImprovement(totalIPL - rupiahFormatFloat));
				let nomIpl = iplBillLeft;
				let nomSc = scBillLeft;
				let nomWater = waterBillLeft;
				let nomPower = powerBillLeft;

				// Nominal Dibayarkan
				const nominalPayment = totalIPL - rupiahFormatFloat;

				controls.sisaCustomTagihan.setValue(this.rupiahFormatImprovement(nominalPayment + nomSc + nomWater + nomPower));
			} else if (id == "nominalSc") {
				// Mencegah lebih besar dari tagihan
				if (rupiahFormatFloat > scBillLeft) return;
				controls.nominalSc.setValue(rupiah);
				if (this.isShowSPembayaran === false) {
					let noIpl = iplBillLeft;
					let nomSc = scBillLeft;
					let nomWater = waterBillLeft;
					let nomPower = powerBillLeft;
					if (this.isSCtrueAmount) {
						controls.scBillLeft.setValue(this.rupiahFormatImprovement(totalSC - rupiahFormatFloat - this.sTagihanCustom));
						nomSc = this.formatFloat(!controls.nominalSc.value ? 0 : controls.nominalSc.value);
					} else {
						controls.scBillLeft.setValue(this.rupiahFormatImprovement(totalSC - rupiahFormatFloat));
						nomSc = this.formatFloat(!controls.nominalSc.value ? 0 : controls.nominalSc.value);
					}

					let valSc = scBillLeft;
					let totalBilling = noIpl + valSc + nomPower + nomWater;
					controls.sisaCustomTagihan.setValue(this.rupiahFormatImprovement(totalBilling));
					return;
				}
				controls.scBillLeft.setValue(this.rupiahFormatImprovement(totalSC - rupiahFormatFloat));
				let noIpl = iplBillLeft;
				let noSc = scBillLeft;
				let nomWater = waterBillLeft;
				let nomPower = powerBillLeft;

				// Nominal Dibayarkan
				const nominalPayment = totalSC - rupiahFormatFloat;

				controls.sisaCustomTagihan.setValue(this.rupiahFormatImprovement(noIpl + nominalPayment + nomWater + nomPower));
			} else if (id == "nominalWater") {
				// Mencegah lebih besar dari tagihan
				if (rupiahFormatFloat > waterBillLeft) return;
				controls.nominalWater.setValue(rupiah);
				if (this.isShowSPembayaran === false) {
					let noIpl = iplBillLeft;
					let nomSc = scBillLeft;
					let nomWater = waterBillLeft;
					let nomPower = powerBillLeft;
					if (this.isWatertrueAmount) {
						controls.waterBillLeft.setValue(this.rupiahFormatImprovement(totalWater - rupiahFormatFloat - this.sTagihanCustom));
						nomWater = this.formatFloat(!controls.nominalWater.value ? 0 : controls.nominalWater.value);
					} else {
						controls.waterBillLeft.setValue(this.rupiahFormatImprovement(totalWater - rupiahFormatFloat));
						nomWater = this.formatFloat(!controls.nominalWater.value ? 0 : controls.nominalWater.value);
					}

					let valWater = waterBillLeft;
					let totalBilling = noIpl + valWater + nomPower + nomSc;
					controls.sisaCustomTagihan.setValue(this.rupiahFormatImprovement(totalBilling));
					return;
				}
				controls.waterBillLeft.setValue(this.rupiahFormatImprovement(totalWater - rupiahFormatFloat));
				let noIpl = iplBillLeft;
				let noSc = scBillLeft;
				let nomWater = waterBillLeft;
				let nomPower = powerBillLeft;

				// Nominal Dibayarkan
				const nominalPayment = totalWater - rupiahFormatFloat;

				controls.sisaCustomTagihan.setValue(this.rupiahFormatImprovement(noIpl + noSc + nominalPayment + nomPower));
			} else if (id == "nominalPower") {
				// Mencegah lebih besar dari tagihan
				if (rupiahFormatFloat > powerBillLeft) return;
				controls.nominalPower.setValue(rupiah);
				if (this.isShowSPembayaran === false) {
					let noIpl = iplBillLeft;
					let nomSc = scBillLeft;
					let nomWater = waterBillLeft;
					let nomPower = powerBillLeft;
					if (this.isPowertrueAmount) {
						controls.powerBillLeft.setValue(this.rupiahFormatImprovement(totalPower - rupiahFormatFloat - this.sTagihanCustom));
						nomPower = this.formatFloat(!controls.nominalPower.value ? 0 : controls.nominalPower.value);
					} else {
						controls.powerBillLeft.setValue(this.rupiahFormatImprovement(totalPower - rupiahFormatFloat));
						nomPower = this.formatFloat(!controls.nominalPower.value ? 0 : controls.nominalPower.value);
					}
					let valPower = powerBillLeft;
					let totalBilling = noIpl + nomWater + valPower + nomSc;
					controls.sisaCustomTagihan.setValue(this.rupiahFormatImprovement(totalBilling));
					return;
				}
				controls.powerBillLeft.setValue(this.rupiahFormatImprovement(totalPower - rupiahFormatFloat));
				let noIpl = iplBillLeft;
				let noSc = scBillLeft;
				let nomWater = waterBillLeft;
				let nomPower = powerBillLeft;

				// Nominal Dibayarkan
				const nominalPayment = totalPower - rupiahFormatFloat;

				controls.sisaCustomTagihan.setValue(this.rupiahFormatImprovement(noIpl + noSc + nomWater + nominalPayment));
			}
		}

		return rupiah;
	}

	/**
	 * rupiahGetComma > Get Comma Format Float
	 * @param split
	 * @param rupiah
	 * @returns
	 */
	rupiahGetComma(split: any, rupiah: any) {
		return split[1] != undefined ? (split[1][1] != undefined ? rupiah + "," + split[1][0] + split[1][1] : split[1] != "" ? rupiah + "," + split[1][0] : rupiah + "," + split[1]) : rupiah;
	}

	/**
	 * valueSelectPayment
	 * @param e
	 */
	valueSelectPayment(e: any) {
		let controls = this.billingForm.controls;
		// Add to formInput paymentSelection

		this.paymentValue = e.value;
		this.payment.target.control.setValue(e.value);
		this.payment.tagihanCustom.control.setValue(undefined);
		this.cekSelectPayment = true;

		// Total All Consumption
		let totalBilling = this.billing.totalBilling;
		// let sTagihanCustom = this.sTagihanCustom ? this.sTagihanCustom : 0
		// let resultTotal = (totalIPL + totalWater + totalPower + sTagihanCustom)
		let resultTotal = totalBilling;

		if (e.value) {
			// Hide input Custom START
			this.selectedPay = [];
			this.isCustomSC = true;
			this.isCustomIPL = true;
			this.isCustomWater = true;
			this.isCustomElectricity = true;
			// Hide input Custom END
			// Clear Custom START
			controls.nominalIpl.setValue("");
			controls.nominalWater.setValue("");
			controls.nominalPower.setValue("");
			controls.scBillLeft.setValue("");
			controls.iplBillLeft.setValue("");
			controls.waterBillLeft.setValue("");
			controls.powerBillLeft.setValue("");
			controls.sisaCustomTagihan.setValue("");
			// Clear Custom END
		}
		if (e.value === "bayar-kurang") {
			this.isCekBayarKurang = true;
			this.isCekCustom = false;
			this.isCekBayarLebih = false;
			this.isCekFullPayment = false;
			// strt
			this.isPayCond = false;
			this.isBayarKurang = false;
			this.isBayarLebih = true;
			this.isCustom = true;
			this.isCustomTagihan = true;
			controls.sisaTagihan.setValue("");
			controls.sisaPembayaran.setValue("");
			controls.totalNominal.setValue("");
		} else if (e.value === "bayar-lebih") {
			this.isCekBayarLebih = true;
			this.isCekBayarKurang = false;
			this.isCekCustom = false;
			this.isCekFullPayment = true;
			// strt
			this.isPayCond = false;
			this.isBayarLebih = false;
			this.isBayarKurang = true;
			this.isCustom = true;
			this.isCustomTagihan = true;
			controls.sisaTagihan.setValue("");
			controls.sisaPembayaran.setValue("");
			controls.totalNominal.setValue("");
		} else if (e.value === "full-payment") {
			this.isCekBayarLebih = false;
			this.isCekBayarKurang = false;
			this.isCekCustom = false;
			this.isCekFullPayment = true;

			// strt
			this.isPayCond = false;
			this.isBayarKurang = false;
			this.isBayarLebih = true;
			this.isCustom = true;
			this.isCustomTagihan = true;
			controls.sisaTagihan.setValue(0);
			controls.sisaPembayaran.setValue("");
			controls.totalNominal.setValue(this.rupiahFormatImprovement(this.billing.totalBilling));
		} else if (e.value === "custom") {
			let totalIPL = this.billing.ipl.sFundAmount || this.billing.ipl.sFundAmount === 0 ? this.billing.ipl.sFundAmount : this.billing.ipl.sinkingFund * this.billing.ipl.unitSize * this.billing.ipl.monthIpl;
			let totalSc = this.billing.ipl.sCharAmount || this.billing.ipl.sCharAmount === 0 ? this.billing.ipl.sCharAmount : this.billing.ipl.serviceCharge * this.billing.ipl.unitSize * this.billing.ipl.monthIpl;
			let totalWater = this.billing.water.allWaterAmount;
			let totalPower = this.billing.power.allPowerAmount;
			const sisaCustomTagihan = this.formatFloat(!controls.sisaCustomTagihan.value ? 0 : controls.sisaCustomTagihan.value);

			if (this.isShowSPembayaran === false) {
				let checkAmount;

				// Mengurangi nilai (IPL) disisa tagihan dengan sisaPembayaran
				if (totalIPL !== 0 && totalIPL > this.sTagihanCustom) {
					controls.iplBillLeft.setValue(this.rupiahFormatImprovement(totalIPL - this.sTagihanCustom));
					checkAmount = "isIplTrue";
					this.isIPLtrueAmount = true;
				} else controls.iplBillLeft.setValue(this.rupiahFormatImprovement(totalIPL));

				// Mengurangi nilai (IPL) disisa tagihan dengan sisaPembayaran
				if (totalSc !== 0 && totalSc > this.sTagihanCustom) {
					controls.scBillLeft.setValue(this.rupiahFormatImprovement(totalSc - this.sTagihanCustom));
					checkAmount = "isIplTrue";
					this.isSCtrueAmount = true;
				} else controls.scBillLeft.setValue(this.rupiahFormatImprovement(totalSc));

				if (checkAmount !== "isIplTrue" && totalPower !== "" && totalPower !== 0 && totalPower > this.sTagihanCustom) {
					// Mengurangi nilai (IPL) disisa tagihan dengan sisaPembayaran
					controls.powerBillLeft.setValue(this.rupiahFormatImprovement(totalPower - this.sTagihanCustom));
					checkAmount = "isPowerTrue";
					this.isPowertrueAmount = true;
				} else controls.powerBillLeft.setValue(this.rupiahFormatImprovement(totalPower));

				if (checkAmount !== "isIplTrue" && checkAmount !== "isPowerTrue" && totalWater !== 0 && totalWater > this.sTagihanCustom) {
					// Mengurangi nilai (IPL) disisa tagihan dengan sisaPembayaran
					this.isWatertrueAmount = true;
					controls.waterBillLeft.setValue(this.rupiahFormatImprovement(totalWater - this.sTagihanCustom));
				} else controls.waterBillLeft.setValue(this.rupiahFormatImprovement(totalWater));
			} else {
				controls.scBillLeft.setValue(this.rupiahFormatImprovement(totalSc));
				controls.iplBillLeft.setValue(this.rupiahFormatImprovement(totalIPL));
				controls.waterBillLeft.setValue(this.rupiahFormatImprovement(totalWater));
				controls.powerBillLeft.setValue(this.rupiahFormatImprovement(totalPower));
			}

			// controls.sisaCustomTagihan.setValue(this.rupiahFormatImprovement(this.sTagihanCustom ? this.sTagihanCustom : 0))
			controls.sisaCustomTagihan.setValue(this.rupiahFormatImprovement(resultTotal ? resultTotal : 0));
			this.isCekCustom = true;
			this.isCekBayarKurang = false;
			this.isCekBayarLebih = false;
			this.isCekFullPayment = false;
			// strt
			this.isPayCond = true;
			this.isBayarKurang = true;
			this.isBayarLebih = true;
			this.isCustom = false;
			this.isCustomTagihan = false;
			controls.sisaTagihan.setValue("");
			controls.sisaPembayaran.setValue("");
			controls.totalNominal.setValue("");
			this.selectedPay = [];
		}
	}

	formatFloat(v) {
		let value = v == 0 ? 0 : v.replace(/[\.]+/g, "").replace(/[\,]+/g, ".");
		return parseFloat(value);
	}

	rupiahFormatImprovement(x) {
		// Float with accounting format
		if (x % 1 != 0) {
			if (x < 0) {
				let num2Str = x.toString();
				let spl = num2Str.split("");
				spl.shift();
				let joi = spl.join("");
				let xStr0 = joi.toString().split("."),
					dec0 = xStr0[1].substr(0, 2),
					Sisa = xStr0[0].length % 3,
					head = xStr0[0].substr(0, Sisa),
					body = xStr0[0].substr(Sisa).match(/\d{1,3}/g);

				if (body) {
					let separate = Sisa ? "." : "";
					return "(" + head + separate + body.join(".") + "," + dec0 + ")";
				}
				return "(" + xStr0[0] + "," + dec0 + ")";
			}
			let xStr0 = x.toString().split("."),
				dec0 = xStr0[1].substr(0, 2),
				Sisa = xStr0[0].length % 3,
				head = xStr0[0].substr(0, Sisa),
				body = xStr0[0].substr(Sisa).match(/\d{1,3}/g);

			if (body) {
				let separate = Sisa ? "." : "";
				return head + separate + body.join(".") + "," + dec0;
			}
			return xStr0[0] + "," + dec0;
		}

		if (x < 0) {
			let num2Str = x.toString();
			let spl = num2Str.split("");
			spl.shift();
			spl = spl.join("");
			let sisa = spl.length % 3,
				headValue = spl.substr(0, sisa),
				bodyValue = spl.substr(sisa).match(/\d{1,3}/g);

			if (bodyValue) {
				let separator = sisa ? "." : "";
				return "(" + headValue + separator + bodyValue.join(".") + ")";
			}
			return "(" + headValue + ")";
		}

		// Integer with accounting format
		let xStr = x.toString(),
			sisa = xStr.length % 3,
			headValue = xStr.substr(0, sisa),
			bodyValue = xStr.substr(sisa).match(/\d{1,3}/g);

		if (bodyValue) {
			let separator = sisa ? "." : "";
			return headValue + separator + bodyValue.join(".");
		}
		return headValue;
	}

	createForm() {
		this.billingForm = this.billingFB.group({
			contract: [this.billing.contract],
			billed_to: [{ value: this.billing.billed_to, disabled: true }],
			unitValue: [{ value: this.billing.unit2, disabled: true }],
			unit: [{ value: this.billing.unit, disabled: true }],
			unit2: [{ value: this.billing.unit2, disabled: true }],
			billing: this.billingFB.group({
				electricity: this.billingFB.group({
					electric_trans: [{ value: this.billing.billing.electricity.electric_trans === null ? "" : this.billing.billing.electricity.electric_trans, disabled: true }],
				}),
				water: this.billingFB.group({
					water_trans: [{ value: this.billing.billing.water.water_trans, disabled: true }],
				}),
			}),
			power: this.billingFB.group({
				powerMeter: [{ value: this.billing.power.powerMeter, disabled: true }],
				powerRateName: [{ value: this.billing.power.powerRateName, disabled: true }],
				powerRate: [{ value: this.billing.power.powerRate, disabled: true }],
				startPower: [{ value: this.billing.power.startPower, disabled: true }],
				endPower: [{ value: this.billing.power.endPower, disabled: true }],
				usePower: [{ value: this.billing.power.usePower, disabled: true }],
				useAmount: [{ value: this.billing.power.useAmount, disabled: true }],
				// sc: [{ value: this.billing.power.sc, disabled: true }],
				// scAmount: [{ value: this.billing.power.scAmount, disabled: true }],
				ppju: [{ value: this.billing.power.ppju, disabled: true }],
				ppjuAmount: [{ value: this.billing.power.ppjuAmount, disabled: true }],
				loss: [{ value: this.billing.power.loss, disabled: true }],
				lossAmount: [{ value: this.billing.power.lossAmount, disabled: true }],
				administration: [{ value: this.billing.power.administration, disabled: true }],
				allPowerAmount: [{ value: this.billing.power.allPowerAmount, disabled: true }],
				status: [{ value: this.billing.power.status, disabled: true }],
				description: [{ value: this.billing.power.description, disabled: true }],
			}),
			water: this.billingFB.group({
				waterMeter: [{ value: this.billing.water.waterMeter, disabled: true }],
				waterRate: [{ value: this.billing.water.waterRate, disabled: true }],
				startWater: [{ value: this.billing.water.startWater, disabled: true }],
				endWater: [{ value: this.billing.water.endWater, disabled: true }],
				useWater: [{ value: this.billing.water.useWater, disabled: true }],
				useWaterAmount: [{ value: this.billing.water.useWaterAmount, disabled: true }],
				maintenance: [{ value: this.billing.water.maintenance, disabled: true }],
				administration: [{ value: this.billing.water.administration, disabled: true }],
				dirtyWater: [{ value: this.billing.water.dirtyWater, disabled: true }],
				dirtyWaterAmount: [{ value: this.billing.water.dirtyWaterAmount, disabled: true }],
				allWaterAmount: [{ value: this.billing.water.allWaterAmount, disabled: true }],
				abodemen: [{ value: this.billing.water.abodemen, disabled: true }],
				// admBank: [{ value: this.billing.water.admBank == undefined ? "" : this.billing.water.admBank, disabled: true }],
				status: [{ value: this.billing.water.status, disabled: true }],
				description: [{ value: this.billing.water.description, disabled: true }],
			}),
			ipl: this.billingFB.group({
				unitSize: [{ value: this.billing.ipl.unitSize, disabled: true }],
				serviceCharge: [{ value: this.billing.ipl.serviceCharge, disabled: true }],
				sinkingFund: [{ value: this.billing.ipl.sinkingFund, disabled: true }],
				monthIpl: [{ value: this.billing.ipl.monthIpl, disabled: true }],
				ipl: [{ value: this.billing.ipl.ipl, disabled: true }],
				allIpl: [{ value: this.billing.ipl.allIpl == undefined || this.billing.ipl.allIpl == null || this.billing.ipl.allIpl == 0 ? "" : this.billing.ipl.allIpl, disabled: true }],
				// admBank: [{ value: this.billing.ipl.admBank == undefined ? "" : this.billing.ipl.admBank, disabled: true }],
				sCharAmount: [{ value: this.billing.ipl.sCharAmount, disabled: true }],
				sFundAmount: [{ value: this.billing.ipl.sFundAmount, disabled: true }],
			}),
			isFreeIpl: [{ value: this.billing.isFreeIpl, disabled: true }],
			isFreeAbodement: [{ value: this.billing.isFreeAbodement, disabled: true }],
			totalBilling: [{ value: this.billing.totalBilling, disabled: true }],
			billing_number: [{ value: this.billing.billing_number, disabled: true }],
			created_date: [{ value: this.billing.created_date, disabled: true }],
			billing_date: [{ value: this.billing.billing_date, disabled: true }],
			due_date: [{ value: this.billing.due_date, disabled: true }],

			bank: [{ value: this.billing.bank, disabled: false }],
			depositToBayarLebih: [{ value: this.billing.depositToBayarLebih, disabled: false }],
			customerBankNo: [{ value: this.billing.customerBankNo, disabled: false }],
			customerBank: [{ value: this.billing.customerBank, disabled: false }],
			desc: [{ value: this.billing.desc, disabled: false }],
			paidDate: [{ value: this.billing.paidDate, disabled: false }, Validators.required],
			// isPaid: [true],
			paymentStatus: [true],
			transferAmount: [{ value: this.billing.transferAmount, disabled: true }],
			paymentType: [{ value: this.billing.paymentType, disabled: false }, Validators.required],
			attachment: [{ value: this.billing.attachment, disabled: false }],
			accountOwner: [this.billing.accountOwner],

			// Virtual Account
			va_water: [{ value: this.billing.va_water, disabled: false }],
			va_ipl: [{ value: this.billing.va_ipl, disabled: false }],

			// Payment Status
			totalNominal: [{ value: this.billing.totalNominal ? this.rupiahFormatImprovement(this.billing.totalNominal) : "", disabled: false }],
			sisaTagihan: [{ value: this.billing.paymentSelection == "bayar-kurang" ? this.rupiahFormatImprovement(this.billing.totalBillLeft ? this.billing.totalBillLeft : 0) : 0, disabled: false }],
			sisaPembayaran: [{ value: this.billing.paymentSelection == "bayar-lebih" ? this.rupiahFormatImprovement(this.convertMinesToPlus(this.billing.totalBillLeft ? this.billing.totalBillLeft : 0)) : "", disabled: false }],
			paymentSelection: [{ value: this.billing.billArray, disabled: false }],
			billArray: [{ value: this.billing.billArray, disabled: false }],
			nominalSc: [{ value: this.billing.nominalSc ? this.rupiahFormatImprovement(this.billing.nominalSc) : "", disabled: false }],
			nominalIpl: [{ value: this.billing.nominalIpl ? this.rupiahFormatImprovement(this.billing.nominalIpl) : "", disabled: false }],
			iplBillLeft: [{ value: this.billing.iplBillLeft ? this.rupiahFormatImprovement(this.billing.iplBillLeft) : "", disabled: false }],
			scBillLeft: [{ value: this.billing.scBillLeft ? this.rupiahFormatImprovement(this.billing.scBillLeft) : "", disabled: false }],
			nominalWater: [{ value: this.billing.nominalWater ? this.rupiahFormatImprovement(this.billing.nominalWater) : "", disabled: false }],
			waterBillLeft: [{ value: this.billing.waterBillLeft ? this.rupiahFormatImprovement(this.billing.waterBillLeft) : "", disabled: false }],
			nominalPower: [{ value: this.billing.nominalPower ? this.rupiahFormatImprovement(this.billing.nominalPower) : "", disabled: false }],
			powerBillLeft: [{ value: this.billing.powerBillLeft ? this.rupiahFormatImprovement(this.billing.powerBillLeft) : "", disabled: false }],
			sisaCustomTagihan: [{ value: this.billing.paymentSelection == "custom" ? this.rupiahFormatImprovement(this.billing.totalBillLeft ? this.billing.totalBillLeft : 0) : 0, disabled: false }],
			bayarSisa: [{ value: this.billing.bayarSisa ? this.rupiahFormatImprovement(this.billing.bayarSisa) : "", disabled: false }],
			date: [{ value: "", disabled: false }],
		});
	}

	convertMinesToPlus(val) {
		const value = val;
		const regex = /\-\d/g;
		const validate = regex.test(value);

		if (validate) {
			const number = val;
			const str = number.toString();
			const result = str.replace("-", "");
			const resultNumber = parseFloat(result);
			return resultNumber;
		} else return parseFloat(val);
	}

	sliceAdmBankIPL(val) {
		return val - this.admBankPriceIPL;
	}

	/**
	 * selectList > Select List Billing Utility
	 * @param list
	 * @param target
	 * @returns
	 */
	selectList(list: any, target: any) {
		const controls = this.billingForm.controls;

		const validate = this.selectedPay.find((data) => data.value === list.value);
		if (validate) return;

		this[`selected${target}`].push(list);

		let value = list.value;
		let totalIPL = this.billing.ipl.sFundAmount || this.billing.ipl.sFundAmount === 0 ? this.billing.ipl.sFundAmount : this.billing.ipl.sinkingFund * this.billing.ipl.unitSize * this.billing.ipl.monthIpl;
		let totalSc = this.billing.ipl.sCharAmount || this.billing.ipl.sCharAmount === 0 ? this.billing.ipl.sCharAmount : this.billing.ipl.serviceCharge * this.billing.ipl.unitSize * this.billing.ipl.monthIpl;
		let totalWater = this.billing.water.allWaterAmount;
		let totalPower = this.billing.power.allPowerAmount;

		if (value === "isCustomIPL") {
			controls.iplBillLeft.setValue(this.rupiahFormatImprovement(totalIPL));
			this.isCustomIPL = false;
		} else if (value === "isCustomWater") {
			controls.waterBillLeft.setValue(this.rupiahFormatImprovement(totalWater));
			this.isCustomWater = false;
		} else if (value === "isCustomElectricity") {
			controls.powerBillLeft.setValue(this.rupiahFormatImprovement(totalPower));
			this.isCustomElectricity = false;
		} else if (value === "isCustomSC") {
			controls.scBillLeft.setValue(this.rupiahFormatImprovement(totalSc));
			this.isCustomSC = false;
		}

		this.cd.markForCheck();
	}

	/**
	 * deleteList > Delete List Tagihan Billing
	 * @param id
	 * @param target
	 * @param list
	 */
	deleteList(id: any, target: any, list: any) {
		const controls = this.billingForm.controls;

		let valueIndex = this[`selected${target}`].findIndex((item) => item._id === id);
		this[`selected${target}`].splice(valueIndex, 1);
		let value = list.value;

		let totalIPL = this.billing.ipl.sFundAmount || this.billing.ipl.sFundAmount === 0 ? this.billing.ipl.sFundAmount : this.billing.ipl.sinkingFund * this.billing.ipl.unitSize * this.billing.ipl.monthIpl;
		let totalSc = this.billing.ipl.sCharAmount || this.billing.ipl.sCharAmount === 0 ? this.billing.ipl.sCharAmount : this.billing.ipl.serviceCharge * this.billing.ipl.unitSize * this.billing.ipl.monthIpl;
		let totalWater = this.billing.water.allWaterAmount;
		let totalPower = this.billing.power.allPowerAmount;
		const totalBilling = totalIPL + totalSc + totalPower + totalWater;
		const sisaCustomTagihan = this.formatFloat(!controls.sisaCustomTagihan.value ? 0 : controls.sisaCustomTagihan.value);

		let nomIpl = this.formatFloat(controls.nominalIpl.value ? controls.nominalIpl.value : 0);
		let nomSc = this.formatFloat(controls.nominalSc.value ? controls.nominalSc.value : 0);
		let nomWater = this.formatFloat(controls.nominalWater.value ? controls.nominalWater.value : 0);
		let nomPower = this.formatFloat(controls.nominalPower.value ? controls.nominalPower.value : 0);

		if (value === "isCustomIPL") {
			this.billArray = this.billArray;
			if (nomIpl > totalIPL) {
				const result = totalBilling - sisaCustomTagihan;
				controls.sisaCustomTagihan.setValue(this.rupiahFormatImprovement(sisaCustomTagihan + result));
			} else controls.sisaCustomTagihan.setValue(this.rupiahFormatImprovement(sisaCustomTagihan + nomIpl));
			controls.iplBillLeft.setValue(this.rupiahFormatImprovement(totalIPL));
			controls.nominalIpl.setValue("");
			this.isCustomIPL = true;
		} else if (value === "isCustomWater") {
			if (nomWater > totalWater) {
				const result = totalBilling - sisaCustomTagihan;
				controls.sisaCustomTagihan.setValue(this.rupiahFormatImprovement(sisaCustomTagihan + result));
			} else controls.sisaCustomTagihan.setValue(this.rupiahFormatImprovement(sisaCustomTagihan + nomWater));
			controls.waterBillLeft.setValue(this.rupiahFormatImprovement(totalWater));
			controls.nominalWater.setValue("");
			this.isCustomWater = true;
		} else if (value === "isCustomElectricity") {
			if (nomPower > totalPower) {
				const result = totalBilling - sisaCustomTagihan;
				controls.sisaCustomTagihan.setValue(this.rupiahFormatImprovement(sisaCustomTagihan + result));
			} else controls.sisaCustomTagihan.setValue(this.rupiahFormatImprovement(sisaCustomTagihan + nomPower));
			controls.powerBillLeft.setValue(this.rupiahFormatImprovement(totalPower));
			controls.nominalPower.setValue("");
			this.isCustomElectricity = true;
		} else if (value === "isCustomSC") {
			if (nomSc > totalSc) {
				const result = totalBilling - sisaCustomTagihan;
				controls.sisaCustomTagihan.setValue(this.rupiahFormatImprovement(sisaCustomTagihan + result));
			} else controls.sisaCustomTagihan.setValue(this.rupiahFormatImprovement(sisaCustomTagihan + nomSc));
			controls.scBillLeft.setValue(this.rupiahFormatImprovement(totalSc));
			controls.nominalSc.setValue("");
			this.isCustomSC = true;
		}

		this.cd.markForCheck();
	}

	loadUnit() {
		this.selection.clear();
		const queryParams = new QueryUnitModel(null, "asc", "grpnm", 1, 10);
		this.serviceUnit.getDataUnitForParking(queryParams).subscribe((res) => {
			this.unitResult = res.data;
		});
	}

	loadAccountBank() {
		this.selection.clear();
		const queryParams = new QueryAccountBankModel(null, "asc", null, 1, 1000);
		this.bservice.getListAccountBankPaidTo(queryParams).subscribe((res) => {
			this.bankResult = res.data;
			this.BankResultFiltered = res.data;
		});
	}

	loadDepositBayarLebih() {
		this.selection.clear();
		const queryParams = new QueryAccountBankModel(null, "asc", null, 1, 1000);
		this.bservice.getListDepositToBayarLebih(queryParams).subscribe((res) => {
			this.depositToBayarLebihResult = res.data;
			this.depositToBayarLebihResultFiltered = res.data;
		});
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
		this.hasFormErrors = false;
		const controls = this.billingForm.controls;
		// Cek Validate
		const toNominal = controls.totalNominal.value;
		const sTagihan = controls.sisaTagihan.value;
		const sPembayaran = controls.sisaPembayaran.value;
		const tBilling = controls.totalBilling.value;
		const sisaCustomTagihan = controls.sisaCustomTagihan.value;
		let totalSc = this.billing.ipl.sCharAmount;
		let totalIPL = this.billing.ipl.sFundAmount;
		let totalWater = this.billing.water.allWaterAmount;
		let totalPower = this.billing.power.allPowerAmount;

		const nomIpl = controls.nominalIpl.value ? controls.nominalIpl.value : 0;
		const nomSc = controls.nominalSc.value ? controls.nominalSc.value : 0;
		const nomWater = controls.nominalWater.value ? controls.nominalWater.value : 0;
		const nomPower = controls.nominalPower.value ? controls.nominalPower.value : 0;

		const payType = controls.paymentType.value;
		if (!controls.bank.value) {
			const message = `Pilih Paid To Bank..`;
			this.layoutUtilsService.showActionNotification(message);
			return;
		}
		if (this.isCekBayarKurang) {
			if (this.formatFloat(toNominal) > tBilling) {
				const message = `Nominal tidak bisa melebihi total billing`;
				this.layoutUtilsService.showActionNotification(message);
				return;
			}
			if (toNominal == "" || sTagihan == "") {
				const message = `Lengkapi input bayar kurang`;
				this.layoutUtilsService.showActionNotification(message);
				return;
			}
		} else if (this.isCekBayarLebih) {
			if (this.formatFloat(toNominal) < tBilling) {
				const message = `Nominal tidak bisa lebih kecil dari total billing`;
				this.layoutUtilsService.showActionNotification(message);
				return;
			}
			if (toNominal == "" || sPembayaran == "") {
				const message = `Lengkapi input bayar lebih`;
				this.layoutUtilsService.showActionNotification(message);
				return;
			}
		} else if (this.isCekCustom) {
			if (this.formatFloat(nomIpl) > totalIPL || this.formatFloat(nomWater) > totalWater || this.formatFloat(nomPower) > totalPower || this.formatFloat(nomSc) > totalSc) {
				const message = `Sisa tagihan tidak boleh melebihi input nominal`;
				this.layoutUtilsService.showActionNotification(message);
				return;
			}
			if (sisaCustomTagihan == "") {
				const message = `Lengkapi input custom`;
				this.layoutUtilsService.showActionNotification(message);
				return;
			}
			if (parseFloat(sisaCustomTagihan) == 0) {
				const message = `Silahkan Pilih Full Payment jika ingin melunaskan`;
				this.layoutUtilsService.showActionNotification(message);
				return;
			}
		}

		// Jika bayar lebih harus mengisikan COA untuk deposit to
		if (!this.isBayarLebih) {
			if (!controls.depositToBayarLebih.value) {
				const message = `Silahkan Pilih Deposit To Bayar Lebih`;
				this.layoutUtilsService.showActionNotification(message);
				return;
			}
		}

		// // Jika bayar kurang dan memiliki saldo deposit
		if (this.billing.saldoDeposit) {
			const totalBilling = controls.totalBilling.value;
			const totalNominal = this.formatFloat(nomIpl) + this.formatFloat(nomSc) + this.formatFloat(nomPower) + this.formatFloat(nomWater);
			const saldoDepo = this.billing.saldoDeposit;
			const countTotal = totalBilling - totalNominal - saldoDepo;

			if (countTotal <= 0) {
				const message = `Anda masih memiliki Saldo Deposit kurangi pembayaran anda`;
				this.layoutUtilsService.showActionNotification(message);
				return;
			}
		}

		/** check form */
		if (this.billingForm.invalid) {
			Object.keys(controls).forEach((controlName) => controls[controlName].markAsTouched());

			this.hasFormErrors = true;
			this.selectedTab = 0;
			return;
		}

		const editedBilling = this.prepareBilling();
		this.updateBilling(editedBilling, withBack);
	}

	prepareBilling(): BillingModel {
		const controls = this.billingForm.controls;
		const _billing = new BillingModel();
		_billing.clear();
		_billing._id = this.billing._id;
		_billing.contract = controls.contract.value;
		_billing.billed_to = controls.billed_to.value.toLowerCase();
		_billing.unit = controls.unit.value;
		_billing.unit2 = controls.unit2.value.toLowerCase();
		_billing.billing = {
			electricity: {
				electric_trans: controls.billing.get("electricity")["controls"].electric_trans.value,
			},
			water: {
				water_trans: controls.billing.get("water")["controls"].water_trans.value,
			},
		};
		_billing.power = {
			powerMeter: controls.power.get("powerMeter").value,
			powerRateName: controls.power.get("powerRateName").value,
			powerRate: controls.power.get("powerRate").value,
			startPower: controls.power.get("startPower").value,
			endPower: controls.power.get("endPower").value,
			usePower: controls.power.get("usePower").value,
			useAmount: controls.power.get("useAmount").value,
			// sc: controls.power.get('sc').value,
			// scAmount: controls.power.get('scAmount').value,
			administration: controls.power.get("administration").value,
			ppju: controls.power.get("ppju").value,
			ppjuAmount: controls.power.get("ppjuAmount").value,
			loss: controls.power.get("loss").value,
			lossAmount: controls.power.get("lossAmount").value,
			allPowerAmount: controls.power.get("allPowerAmount").value,
		};
		// _billing.water = {
		// 	waterMeter: controls.water.get('waterMeter').value,
		// 	waterRate: controls.water.get('waterRate').value,
		// 	startWater: controls.water.get('startWater').value,
		// 	endWater: controls.water.get('endWater').value,
		// 	useWater: controls.water.get('useWater').value,
		// 	useWaterAmount: controls.water.get('useWaterAmount').value,
		// 	maintenance: controls.water.get('maintenance').value,
		// 	administration: controls.water.get('administration').value,
		// 	dirtyWater: controls.water.get('dirtyWater').value,
		// 	dirtyWaterAmount: controls.water.get('dirtyWaterAmount').value,
		// 	allWaterAmount: controls.water.get('allWaterAmount').value,
		// };
		// _billing.ipl = {
		// 	unitSize: controls.ipl.get('unitSize').value,
		// 	serviceCharge: controls.ipl.get('serviceCharge').value,
		// 	sinkingFund: controls.ipl.get('sinkingFund').value,
		// 	monthIpl: controls.ipl.get('monthIpl').value,
		// 	ipl: controls.ipl.get('ipl').value,
		// 	allIpl: controls.ipl.get('allIpl').value,
		// };
		_billing.isFreeIpl = controls.isFreeIpl.value;
		_billing.isFreeAbodement = controls.isFreeAbodement.value;
		_billing.totalBilling = controls.totalBilling.value;
		_billing.billing_number = controls.billing_number.value;
		_billing.created_date = controls.created_date.value;
		_billing.billing_date = controls.billing_date.value;
		_billing.due_date = controls.due_date.value;
		if (!this.isToken) {
			_billing.isPaid = true;
		}

		_billing.bank = controls.bank.value;
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
		_billing.va_water = controls.va_water.value;
		_billing.va_ipl = controls.va_ipl.value;

		// UPDATE BILLING START

		let paymentSelection = this.payment.target.control.value;
		let totalNominal = this.formatFloat(controls.totalNominal.value);

		// Bayar Kurang START
		let sisaTagihan = this.formatFloat(controls.sisaTagihan.value);
		// Bayar Kurang END

		// Bayar Lebih START
		let sisaPembayaran = -this.formatFloat(controls.sisaPembayaran.value); //jadikan nilai sisa pembayaran menjadi minus
		// Bayar Lebih END

		// Custom START
		let tesCustomTagihan = this.selectedPay;
		let nominalIpl = this.formatFloat(controls.nominalIpl.value);
		let nominalSc = this.formatFloat(controls.nominalSc.value);
		let nominalWater = this.formatFloat(controls.nominalWater.value);
		let nominalPower = this.formatFloat(controls.nominalPower.value);
		let iplBillLeft = this.formatFloat(controls.iplBillLeft.value);
		let scBillLeft = this.formatFloat(controls.scBillLeft.value);
		let waterBillLeft = this.formatFloat(controls.waterBillLeft.value);
		let powerBillLeft = this.formatFloat(controls.powerBillLeft.value);
		let sisaAmountTotal = this.formatFloat(controls.sisaCustomTagihan.value);
		let bayarSisa = this.formatFloat(controls.bayarSisa.value);
		// Custom END
		let slctdPay = [];
		this.selectedPay.forEach((data) => slctdPay.push(data.value));

		_billing.paymentSelection = paymentSelection;
		_billing.totalNominal = totalNominal;
		if (paymentSelection === "full-payment") _billing.totalBillLeft = 0;
		else {
			_billing.totalBillLeft = sisaTagihan !== 0 ? sisaTagihan : sisaPembayaran !== 0 ? sisaPembayaran : sisaAmountTotal !== 0 ? sisaAmountTotal : undefined;
		}
		_billing.billArray = this.selectedPay;
		_billing.nominalIpl = nominalIpl;
		_billing.nominalWater = nominalWater;
		_billing.iplBillLeft = iplBillLeft;
		_billing.waterBillLeft = waterBillLeft;
		_billing.nominalPower = nominalPower;
		_billing.powerBillLeft = powerBillLeft;
		_billing.bayarSisa = bayarSisa;
		_billing.nominalSc = nominalSc;
		_billing.scBillLeft = scBillLeft;

		// UPDATE BILLING END

		// Jika bayar lebih harus mengisikan COA untuk deposit to
		if (!this.isBayarLebih) {
			_billing.depositToBayarLebih = controls.depositToBayarLebih.value;
		}

		return _billing;
	}

	updateBilling(_billing: BillingModel, withBack: boolean = false) {
		const editSubscription = this.serviceBill.updateBilling(_billing).subscribe(
			(res) => {
				const message = `Billing successfully has been saved.`;
				this.layoutUtilsService.showActionNotification(message);
				// this.layoutUtilsService.showActionNotification(message, MessageType.Update, 5000, true, true);
				const url = `/billing`;
				this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
			},
			(err) => {
				console.error(err);
				const message = "Error while saving billing | " + err.statusText;
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
		this.subscriptions.forEach((sb) => sb.unsubscribe());
	}
	unitOnChange(e) {}

	addEvent(e) {}
	async getBIllingmage(id) {
		const URL_IMAGE = `${environment.baseAPI}/api/billing`;
		await this.http.get(`${URL_IMAGE}/${id}/image`).subscribe((res: any) => {
			this.images = res.data;
		});
	}

	getMonthFromDate(date) {
		let dates = moment(new Date(date), moment.locale("id")).format("MMMM DD YYYY");
		return dates;
	}
}
