import { Component, OnDestroy, OnInit, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { SelectionModel } from "@angular/cdk/collections";
import { MatDialog } from '@angular/material';
import { PopupLogout, PopupPay } from '../popup/popup.component';
import { PosService } from '../../../../core/pos/pos.service';
import { QueryPosModel } from '../../../../core/pos/querypos.model';
import { LayoutUtilsService } from '../../../../core/_base/crud';
import { PosModel } from '../../../../core/pos/pos.model';

// Animaton Start
// import the required animation functions from the angular animations module
import { trigger, animate, transition, style } from '@angular/animations';
import moment from 'moment';
import { QueryBankModel } from '../../../../core/masterData/bank/bank/querybank.model'
import { ServiceFormat } from '../../../../core/serviceFormat/format.service';
export const fadeInAnimation =
	// trigger name for attaching this animation to an element using the [@triggerName] syntax
	trigger('fadeInAnimation', [

		// route 'enter' transition
		transition(':enter', [

			// css styles at start of transition
			style({ opacity: 0 }),

			// animation and styles at end of transition
			animate('.3s', style({ opacity: 1 }))
		]),
	]);
// Animaton End

@Component({
	selector: 'kt-welcome-pos',
	templateUrl: './welcome-pos.component.html',
	styleUrls: ['./welcome-pos.component.scss'],
	animations: [fadeInAnimation],
	host: { '[@fadeInAnimation]': '' }
})
export class WelcomePosComponent implements OnInit {
	posForm: FormGroup;
	cekLogin: boolean = true
	UnitResultFiltered: any[] = []
	unitResult: any[] = []
	setUnitLoad: string = ""
	idUnit: string = ""
	loadingBillUnit: boolean = false
	conditionBill: boolean = false

	isOpenSearch: boolean = false
	unitChoose: boolean = false
	categoryChoose: boolean = false
	categoryChooseTitle: string = ""
	codePOS: string = ""

	galonIdChoose: any[] = []

	wordingChecked: string = "Billing Outstanding"
	selectCategory: any[] = [
		{ name: "Invoice", value: "invoice" },
		{ name: "Galon", value: "galon" },
		{ name: "Ticketing", value: "ticket" },
		{ name: "Parking", value: "parking" },
	]

	// Timer Start
	ms: any = '0' + 0
	sec: any = '0' + 0
	min: any = '0' + 0
	hr: any = '0' + 0

	startTimer: any
	running = false

	newDateTime: any = `${moment(new Date()).format('dddd')}, ${moment(new Date()).format('LL')} - `

	// Timer End


	isChangeColor: boolean = false

	SlctPaymentResultFiltered = []
	slctPaymentResult = []
	BankMtdResultFiltered = []
	emoneyResultFiltered = []
	emoneyResult = []
	isCash: boolean = false
	isEmoney: boolean = true
	isCredDebCard: boolean = true

	bankMtdBlockResult = []
	nameCashier: string = JSON.parse(localStorage.getItem('loginPOS'))
	cashierRecordID: string = JSON.parse(localStorage.getItem('cashierRecordID'))

	dataClosingControl: any
	isCheckTotal: boolean = false

	invoices: any[] = [
		{ name: "Invoice", value: "invoice" },
		{ name: "Template", value: "template" }

	]
	loadingData = {
		unit: false,
	};
	viewBlockResult = new FormControl();
	bankMtdResult = new FormControl();
	moneyNameMtdResult = new FormControl();
	slctPaymentBlockResult = new FormControl();


	columnsList: any[] = [];
	detailList: any[] = [];

	descDetail: any[] = []
	descDetailGalon: any[] = []
	descDetailTicket: any[] = []
	descDetailParking: any[] = []

	dataParking = [] // save data Parking


	selectedColumns = [];
	selection = new SelectionModel<any>(true, []);

	// // HardCode price printed
	isPrintedActive: boolean = true // sementara template print tidak ada
	printedFee: number = this.isPrintedActive ? 2500 : 0


	constructor(
		private activatedRoute: ActivatedRoute,
		private serviceFormat: ServiceFormat,
		private router: Router,
		private posFB: FormBuilder,
		private dialog: MatDialog,
		private layoutUtilsService: LayoutUtilsService,
		private posService: PosService,
		private cd: ChangeDetectorRef,

	) { }
	ngOnInit() {
		const checkLoginPOS = localStorage.getItem('loginPOS')
		const checkCashierRecord = localStorage.getItem('isCashierRecord')
		const url = `/`;
		if (!checkLoginPOS || !checkCashierRecord) return this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });

		if (!this.isCheckTotal) {
			this.slctPaymentBlockResult.disable()
		}

		this.loadGenerateCode()

		this.loadEmoneyList()
		this.loadPaymentMethodList()
		this.loadBankList()
		this.loadGetUnitBilling("")
		this.loadClosingControl()
		this.createForm()
		// Timer Start
		this.startCountTimer()
	}



	startCountTimer(): void {
		if (!this.running) {
			this.running = true;
			this.startTimer = setInterval(() => {
				this.ms++;
				this.ms = this.ms < 10 ? '0' + this.ms : this.ms

				if (this.ms === 100) {
					this.sec++
					this.sec = this.sec < 10 ? '0' + this.sec : this.sec;
					this.ms = '0' + 0
				}

				if (this.sec === 60) {
					this.min++;
					this.min = this.min < 10 ? '0' + this.min : this.min;
					this.sec = '0' + 0
				}
				if (this.min === 60) {
					this.hr++;
					this.hr = this.hr < 10 ? '0' + this.hr : this.hr;
					this.min = '0' + 0
				}

				this.cd.markForCheck()
			}, 10)
		}
	}

	loadGetUnitBilling(text) {
		this.loadingData.unit = true;
		this.selection.clear();
		const queryParams = new QueryPosModel(
			{ "unit": text },
			"desc",
			"id",
			1,
			10
		);
		this.posService.getUnitAll(queryParams).subscribe((res) => {
			this.UnitResultFiltered = res.data
			this.unitResult = res.data
			this.cd.markForCheck()
		});
	}

	// Load Bank List
	loadBankList() {
		this.selection.clear();
		const queryParams = new QueryBankModel(
			{ bank: "" },
			"",
			"",
			1,
			1000
		);
		this.posService.getListBank(queryParams).subscribe(res => {
			if (res) {
				this.bankMtdBlockResult = res.data
				this.BankMtdResultFiltered = res.data
			}
		})
	}

	// Load Payment Method List
	loadPaymentMethodList() {
		this.selection.clear();
		this.posService.getPaymentSelection().subscribe(res => {
			if (res) {
				this.SlctPaymentResultFiltered = res.data
				this.slctPaymentResult = res.data
			}
		})
	}

	// Load Payment Method List
	loadEmoneyList() {
		this.selection.clear();
		this.posService.getEmoneyList().subscribe(res => {
			if (res) {
				this.emoneyResultFiltered = res.data
				this.emoneyResult = res.data
			}
		})
	}

	selectFormChange(status) {
		const controls = this.posForm.controls
		controls.category.setValue(status)
		this.categoryChoose = true
		// this.categoryChooseTitle = status
		this.checkSearching()
	}

	loadClosingControl() {
		this.loadingData.unit = true;
		this.selection.clear();
		const queryParams = {
			admName: this.nameCashier,
			cashierRecordID: this.cashierRecordID
		}

		this.posService.getClosingControl(queryParams).subscribe((res) => {
			if (res) {
				this.dataClosingControl = res.data
				this.cd.markForCheck()
			}
		});
	}

	createForm() {
		this.posForm = this.posFB.group({
			invoices: [{ value: "", disabled: false }],
			printedFee: [{ value: "", disabled: false }],
			subTotalPOS: [{ value: "", disabled: false }],
			change: [{ value: "", disabled: false }],
			totalPOS: [{ value: "", disabled: false }],
			amount: [{ value: "", disabled: false }],

			category: [{ value: "", disabled: false }],

			payMtd: [{ value: "", disabled: false }],
			bankMtd: [{ value: "", disabled: false }],
			cardNo: [{ value: "", disabled: false }],
			unitID: [{ value: "", disabled: false }],
			cashierRecordID: [{ value: JSON.parse(localStorage.getItem('cashierRecordID')), disabled: false }],
		});
	}

	logout() {
		this.loadClosingControl()
		const dialogRef = this.dialog.open(PopupLogout, {
			data: this.dataClosingControl ? this.dataClosingControl : {},
			maxWidth: "950px",
			minHeight: "350px",
		});

		// tes modal
		dialogRef.afterClosed().subscribe((result) => {
			console.log(result, "result");
		});
	}
	openPay() {
		const controls = this.posForm.controls
		const cardNoString = controls.cardNo.value.toString()
		const amount = this.serviceFormat.formatFloat(controls.amount.value)
		const totalPOS = this.serviceFormat.formatFloat(controls.totalPOS.value)
		const _pos = new PosModel();

		if (!controls.totalPOS.value) {
			const message = `Masukkan yang ingin dibayarkan`;
			this.layoutUtilsService.showActionNotification(message);
			return
		}

		if (controls.amount.value === "") {
			const message = `Masukkan uang yang dibayarkan!`;
			this.layoutUtilsService.showActionNotification(message);
			return
		}
		if (amount < totalPOS) {
			const message = `Uang yang dibayarkan kurang!`;
			this.layoutUtilsService.showActionNotification(message);
			return
		}
		if (!controls.payMtd.value) {
			const message = `Masukkan metode pembayaran`;
			this.layoutUtilsService.showActionNotification(message);
			return
		}

		if (this.payMetode === "emoney") {
			if (!this.moneyNameMtdResult.value) {
				const message = `Masukkan e-money pembayaran`;
				this.layoutUtilsService.showActionNotification(message);
				return
			}
		}
		if (this.payMetode === "credit" || this.payMetode === "debit") {
			if (!this.bankMtdResult.value) {
				const message = `Masukkan bank pembayaran`;
				this.layoutUtilsService.showActionNotification(message);
				return
			}
			if (!controls.cardNo.value) {
				const message = `Masukkan card number`;
				this.layoutUtilsService.showActionNotification(message);
				return
			}

			if (cardNoString.length < 16) {
				const message = `Masukkan card number 16 karakter!`;
				this.layoutUtilsService.showActionNotification(message);
				return
			}
		}

		const billingId = []
		this.descDetail.filter(data => billingId.push(data._id))
		const ticketId = []
		this.descDetailTicket.filter(data => ticketId.push(data._id))
		const parkingId = []
		this.dataParking.filter(data => parkingId.push(data._id))

		const detailTicket = {}
		const detailGalon = {}
		const detailParking = {}

		if (this.categoryChooseTitle === "ticket") {
			for (let i = 0; i < this.descDetailTicket.length; i++) {
				detailTicket[`"${this.descDetailTicket[i].ticketId}"`] = this.descDetailTicket[i].totalCost
			}
		} else if (this.categoryChooseTitle === "galon") {
			for (let i = 0; i < this.detailList.length; i++) {
				detailGalon[this.detailList[i].brand] = this.amountTotalGalon(this.detailList[i].value, 'view')
			}
		}
		else if (this.categoryChooseTitle === "parking") {
			for (let i = 0; i < this.dataParking.length; i++) {
				detailParking[`"${this.dataParking[i].billingNo}"`] = this.dataParking[i].parking.parkingRate
			}
		}

		_pos.admName = this.nameCashier
		_pos.subTotalPOS = this.serviceFormat.formatFloat(controls.subTotalPOS.value)
		_pos.billingID = this.categoryChooseTitle === 'invoice' ? billingId : this.categoryChooseTitle === 'ticket' ? ticketId :
			this.categoryChooseTitle === "parking" ? parkingId : this.galonIdChoose
		_pos.detailBilling = this.categoryChooseTitle === 'invoice' ? this.consumption : this.categoryChooseTitle === 'ticket' ? detailTicket :
			this.categoryChooseTitle === "parking" ? detailParking : detailGalon
		_pos.totalPOS = this.serviceFormat.formatFloat(controls.totalPOS.value)
		_pos.payMtd = controls.payMtd.value ? controls.payMtd.value : null
		_pos.bankMtd = this.payMetode === "cash" ? null : controls.bankMtd.value ? controls.bankMtd.value : null
		_pos.cardNo = controls.cardNo.value ? controls.cardNo.value : null
		_pos.amount = this.serviceFormat.formatFloat(controls.amount.value)
		_pos.change = this.serviceFormat.formatFloat(controls.change.value)
		_pos.unitID = this.idUnit
		_pos.cashierRecordID = controls.cashierRecordID.value
		_pos.category = this.categoryChooseTitle

		_pos.cashierNo = this.codePOS

		const dialogRef = this.dialog.open(PopupPay, {
			data: {
				descDetail: this.categoryChooseTitle === "invoice" ? this.descDetail :
					this.categoryChooseTitle === "galon" ? this.descDetailGalon : this.categoryChooseTitle === "parking" ? this.dataParking : this.descDetailTicket,
				formSend: _pos,
				category: this.categoryChooseTitle
			},
			maxWidth: "650px",
			minHeight: "250px",
		});

		// tes modal
		dialogRef.afterClosed().subscribe((result) => {
			if (result.validate) {
				this.loadGenerateCode()
				this.loadGetUnitBilling("")
				this.consumption = { ipl: 0, water: 0, power: 0, parking: 0, rental: 0, pinalty: 0 }
				this.loadClosingControl()
				controls.category.setValue("")
				controls.subTotalPOS.setValue("")
				controls.totalPOS.setValue("")
				controls.payMtd.setValue("")
				controls.bankMtd.setValue("")
				controls.amount.setValue("")
				controls.change.setValue("")
				controls.printedFee.setValue("")
				controls.cardNo.setValue("")
				this.isOpenSearch = false
				this.viewBlockResult.setValue(undefined)
				this.bankMtdResult.setValue(undefined)
				this.moneyNameMtdResult.setValue(undefined)
				this.slctPaymentBlockResult.setValue(undefined)
				this.detailList = []
				this.descDetail = []
				this.descDetailGalon = []
				this.descDetailTicket = []
				this.descDetailParking = []
				this.columnsList = []

				this.dataParking = []

				this.resultGalonId = []
				this.resultGalonIdNot = []
				this.resultGalon = []
				this.totalGalon = 0

				this.ticketTotalAll = {
					cost: 0
				}
				this.parkingTotalAll = {
					cost: 0
				}
			}
		});
	}

	loadGenerateCode() {
		// Generate Code
		this.posService.generateCode().subscribe(res => {
			if (res) {
				this.codePOS = res.data
				this.cd.markForCheck()
			}
		})
	}

	_onKeyup(e: any, status) {
		if (status === "noUnit") this._filterUnit(e.target.value);
		else if (status === "slctPayment") this._filterSlctMtd(e.target.value);
		else if (status === "bankMtd") this._filterBankMtd(e.target.value);
		else if (status === "moneyName") this._filterEmoney(e.target.value);
	}

	_filterUnit(text: string) {
		this.setUnitLoad = text
		this.loadGetUnitBilling(text)
	}

	_filterSlctMtd(text: string) {
		this.SlctPaymentResultFiltered = this.slctPaymentResult.filter((i) => {
			const filterText = `${i.name.toLocaleLowerCase()} `;
			if (filterText.includes(text.toLocaleLowerCase())) return i;
		});
	}
	_filterBankMtd(text: string) {
		this.BankMtdResultFiltered = this.bankMtdBlockResult.filter((i) => {
			const filterText = `${i.bank.toLocaleLowerCase()} `;
			if (filterText.includes(text.toLocaleLowerCase())) return i;
		});
	}
	_filterEmoney(text: string) {
		this.emoneyResultFiltered = this.emoneyResult.filter((i) => {
			const filterText = `${i.name.toLocaleLowerCase()} `;
			if (filterText.includes(text.toLocaleLowerCase())) return i;
		});
	}

	payMetode: string = ""

	_setBlockValue(value, stts) {
		const controls = this.posForm.controls
		if (stts === "unit") {
			this.unitChoose = true
			this.setUnitLoad = value.cdunt
			this.idUnit = value._id
			this.checkSearching()
		} else {
			if (value.name === "cash") {
				controls.payMtd.setValue(value._id)
				this.payMetode = value.name
				this.isCash = true
				this.bankMtdResult.setValue(undefined)
				this.moneyNameMtdResult.setValue(undefined)
			} else if (value.name === "emoney") {
				controls.payMtd.setValue(value._id)
				this.payMetode = value.name
				this.isEmoney = false
				this.isCash = false
				this.isCredDebCard = false
				this.bankMtdResult.setValue(undefined)
			} else if (value.name === "debit" || value.name === "credit") {
				controls.payMtd.setValue(value._id)
				this.payMetode = value.name
				this.isCash = false
				this.isCredDebCard = false
				this.isEmoney = true
				this.bankMtdResult.setValue(undefined)
				this.moneyNameMtdResult.setValue(undefined)
				this.posForm.controls.cardNo.setValue("")
			} else {
				controls.bankMtd.setValue(value._id)
			}
		}


	}

	payHistoryLink() {
		const url = `/pos/payhistory`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}


	checkSearching() {
		if (this.unitChoose && this.categoryChoose) this.isOpenSearch = true;
		else this.isOpenSearch = false
	}

	searching() {

		const controls = this.posForm.controls
		const categoryFiltered = controls.category.value
		this.categoryChooseTitle = categoryFiltered

		controls.bankMtd.setValue("")
		controls.payMtd.setValue("")
		controls.subTotalPOS.setValue("")
		controls.totalPOS.setValue("")
		controls.amount.setValue("")
		controls.change.setValue("")
		controls.printedFee.setValue("")
		controls.cardNo.setValue("")
		this.detailList = []
		this.descDetail = []
		this.descDetailGalon = []
		this.descDetailTicket = []
		this.descDetailParking = []
		this.columnsList = []
		this.loadingBillUnit = true
		this.dataParking = []

		this.ticketTotalAll = {
			cost: 0
		}
		this.parkingTotalAll = {
			cost: 0
		}

		this.resultGalonId = []
		this.resultGalonIdNot = []
		this.resultGalon = []
		this.totalGalon = 0

		if (categoryFiltered === "galon") this.wordingChecked = "Galon UnPaid";
		else if (categoryFiltered === "ticket") this.wordingChecked = "Ticket UnPaid";
		else this.wordingChecked = "Billing Outstanding";

		const queryParams = {
			filter: { unit: this.idUnit, category: categoryFiltered }
		}

		this.posService.getBillingByUnit(queryParams).subscribe((res) => {
			if (res) {
				if (res.data.length === 0) {
					const message = `No data result POS!`;
					this.layoutUtilsService.showActionNotification(message);
					this.conditionBill = true
					this.cd.markForCheck()
				} else {
					if (categoryFiltered === "galon") {


						this.conditionBill = false
						this.loadingBillUnit = false
						this.columnsList = res.detailGalon
						this.cd.markForCheck()
						return
					}
					this.conditionBill = false
					this.loadingBillUnit = false
					this.columnsList = res.data
					this.cd.markForCheck()
				}
			}
		});
		this.loadingBillUnit = false

	}

	checkTotal() {
		const controls = this.posForm.controls
		const total = controls.totalPOS.value
		if (total === "") {
			this.isCheckTotal = false;
		}
		else {
			this.isCheckTotal = true
			this.slctPaymentBlockResult.enable()
		}
	}


	onSubmit() {
		const url = `/ pos / openCash`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}

	isAllSelected() {
		const numSelected = this.selection.selected.length;
		const numRows = this.columnsList.length;
		return numSelected === numRows;
	}

	consumption: any = {
		ipl: 0, water: 0, power: 0, parking: 0, rental: 0, pinalty: 0
	}
	ticketTotalAll: any = {
		cost: 0
	}
	parkingTotalAll: any = {
		cost: 0
	}

	resultGalon = []
	totalGalon = 0

	toggleBilling(event, list) {
		const controls = this.posForm.controls
		if (event.checked) {
			if (this.categoryChooseTitle === "invoice") {
				this.consumption.ipl += list.ipl.allIplAfterTax ? list.ipl.allIplAfterTax : list.ipl.allIpl
				this.consumption.water += list.water.allWaterAmountAfterFeeAndTax ? list.water.allWaterAmountAfterFeeAndTax : list.water.allWaterAmount
				this.consumption.power += list.power.allPowerAmountAfterFeeAndTax ? list.power.allPowerAmountAfterFeeAndTax : list.power.allPowerAmount
				this.consumption.parking += list.parking ? list.parking : 0
				this.consumption.rental += list.rental ? list.rental : 0
				this.consumption.pinalty += list.pinalty ? list.pinalty : 0
				this.detailList = [
					{ name: "IPL", price: this.consumption.ipl },
					{ name: "Water Consumption ", price: this.consumption.water },
					{ name: "Electricity Consumption", price: this.consumption.power },
					{ name: "Parking", price: this.consumption.parking },
					{ name: "Rental", price: this.consumption.rental },
					{ name: "Pinalty", price: this.consumption.pinalty },
				]
				const validate = this.descDetail.find(data => data._id === list._id)
				if (!validate) this.descDetail.push(list)

				// Amount Start
				let subTotalValue = this.consumption.ipl + this.consumption.water + this.consumption.power + this.consumption.parking + this.consumption.rental + this.consumption.pinalty
				let total = subTotalValue + (subTotalValue === 0 ? 0 : this.printedFee)
				controls.subTotalPOS.setValue(this.serviceFormat.rupiahFormatImprovement(subTotalValue))
				controls.printedFee.setValue(this.serviceFormat.rupiahFormatImprovement(subTotalValue === 0 ? 0 : this.printedFee))
				controls.totalPOS.setValue(this.serviceFormat.rupiahFormatImprovement(total))
				// Amount End

				this.cd.markForCheck()
			} else if (this.categoryChooseTitle === "galon") {

				for (let i = 0; i < list.detail.length; i++) {
					this.resultGalon.push({ brand: list.detail[i].brand, totalTr: list.detail[i].totalTr, tgl: list.tgl })
				}

				// Manipulation Data Start
				// this gives an object with dates as keys
				const groups = this.resultGalon.reduce((groups, galon) => {
					const brand = galon.brand
					if (!groups[brand]) {
						groups[brand] = [];
					}
					groups[brand].push(galon);
					return groups;
				}, {});

				// Edit: to add it in the array format instead
				const groupArrays = Object.keys(groups).map((brand) => {
					return {
						brand,
						value: groups[brand]
					};
				});

				// Manipulation Data End

				this.detailList = groupArrays

				// Amount Start
				this.idGalonSelect(list.detail)

				let subTotalValue = 0

				subTotalValue = this.amountTotalGalon(list.detail, 'amountPlus')
				let total = subTotalValue + (subTotalValue === 0 ? 0 : this.printedFee)
				controls.subTotalPOS.setValue(this.serviceFormat.rupiahFormatImprovement(subTotalValue))
				controls.printedFee.setValue(this.serviceFormat.rupiahFormatImprovement(subTotalValue === 0 ? 0 : this.printedFee))
				controls.totalPOS.setValue(this.serviceFormat.rupiahFormatImprovement(total))
				// Amount End

				this.descDetailGalon.push(list)
				this.cd.markForCheck()
			} else if (this.categoryChooseTitle === "ticket") {
				this.ticketTotalAll.cost += list.totalCost ? list.totalCost : 0
				this.detailList = [{
					name: "Total Cost", price: this.ticketTotalAll.cost
				}]
				this.descDetailTicket.push(list)

				// Amount Start
				let subTotalValue = this.ticketTotalAll.cost
				let total = subTotalValue + (subTotalValue === 0 ? 0 : this.printedFee)
				controls.subTotalPOS.setValue(this.serviceFormat.rupiahFormatImprovement(subTotalValue))
				controls.printedFee.setValue(this.serviceFormat.rupiahFormatImprovement(subTotalValue === 0 ? 0 : this.printedFee))
				controls.totalPOS.setValue(this.serviceFormat.rupiahFormatImprovement(total))
				// Amount End
				this.cd.markForCheck()
			}

			else if (this.categoryChooseTitle === "parking") {
				this.parkingTotalAll.cost += list.parking.parkingRate ? list.parking.parkingRate : 0

				this.dataParking.push(list)

				// this gives an object with dates as keys
				const groups = this.dataParking.reduce((groups, item) => {
					const date = item.periode
					if (!groups[date]) {
						groups[date] = [];
					}
					groups[date].push(item);
					return groups;
				}, {});

				// Edit: to add it in the array format instead
				const groupPark = Object.keys(groups).map((date) => {
					const groupDate = groups[date]
					let total = 0
					groupDate.forEach(data => total += data.parking.parkingRate)
					return {
						name: date,
						price: total
					};
				});

				this.detailList = groupPark

				this.descDetailParking.push(list)

				// Amount Start
				let subTotalValue = this.parkingTotalAll.cost
				let total = subTotalValue + (subTotalValue === 0 ? 0 : this.printedFee)
				controls.subTotalPOS.setValue(this.serviceFormat.rupiahFormatImprovement(subTotalValue))
				controls.printedFee.setValue(this.serviceFormat.rupiahFormatImprovement(subTotalValue === 0 ? 0 : this.printedFee))
				controls.totalPOS.setValue(this.serviceFormat.rupiahFormatImprovement(total))
				// Amount End
				this.cd.markForCheck()
			}

		} else {
			if (this.categoryChooseTitle === "invoice") {
				this.consumption.ipl -= list.ipl.allIplAfterTax ? list.ipl.allIplAfterTax : list.ipl.allIpl
				this.consumption.water -= list.water.allWaterAmountAfterFeeAndTax ? list.water.allWaterAmountAfterFeeAndTax : list.water.allWaterAmount
				this.consumption.power -= list.power.allPowerAmountAfterFeeAndTax ? list.power.allPowerAmountAfterFeeAndTax : list.power.allPowerAmount
				this.consumption.parking -= list.parking ? list.parking : 0
				this.consumption.rental -= list.rental ? list.rental : 0
				this.consumption.pinalty -= list.pinalty ? list.pinalty : 0
				this.detailList = [
					{ name: "IPL", price: this.consumption.ipl },
					{ name: "Water Consumption ", price: this.consumption.water },
					{ name: "Electricity Consumption", price: this.consumption.power },
					{ name: "Parking", price: this.consumption.parking },
					{ name: "Rental", price: this.consumption.rental },
					{ name: "Pinalty", price: this.consumption.pinalty },
				]
				this.descDetail = this.descDetail.filter(data => data._id !== list._id)

				// Amount Start
				let subTotalValue = this.consumption.ipl + this.consumption.water + this.consumption.power + this.consumption.parking + this.consumption.rental + this.consumption.pinalty
				let total = subTotalValue + (subTotalValue === 0 ? 0 : this.printedFee)
				controls.subTotalPOS.setValue(this.serviceFormat.rupiahFormatImprovement(subTotalValue))
				controls.printedFee.setValue(this.serviceFormat.rupiahFormatImprovement(subTotalValue === 0 ? 0 : this.printedFee))
				controls.totalPOS.setValue(this.serviceFormat.rupiahFormatImprovement(total))
				// Amount End

				this.cd.markForCheck()
			} else if (this.categoryChooseTitle === "galon") {


				// for (let i = 0; i < list.detail.length; i++) {
				// 	this.resultGalon.push({ brand: list.detail[i].brand, totalTr: list.detail[i].totalTr, tgl: list.tgl })
				// }

				this.resultGalon = this.resultGalon.filter(data => data.tgl !== list.tgl)

				console.log(this.resultGalon, "result Gl");


				// Manipulation Data Start
				// this gives an object with dates as keys
				const groups = this.resultGalon.reduce((groups, galon) => {
					const brand = galon.brand
					if (!groups[brand]) {
						groups[brand] = [];
					}
					groups[brand].push(galon);
					return groups;
				}, {});

				// Edit: to add it in the array format instead
				const groupArrays = Object.keys(groups).map((brand) => {
					return {
						brand,
						value: groups[brand]
					};
				});

				// Manipulation Data End


				this.detailList = groupArrays
				this.descDetailGalon = this.descDetailGalon.filter(data => data.tgl !== list.tgl)

				// Amount Start
				this.idGalonSelectNot(list.detail)
				let subTotalValue = 0

				subTotalValue = this.amountTotalGalon(list.detail, 'amountMinus')
				let total = subTotalValue + (subTotalValue === 0 ? 0 : this.printedFee)
				controls.subTotalPOS.setValue(this.serviceFormat.rupiahFormatImprovement(subTotalValue))
				controls.printedFee.setValue(this.serviceFormat.rupiahFormatImprovement(subTotalValue === 0 ? 0 : this.printedFee))
				controls.totalPOS.setValue(this.serviceFormat.rupiahFormatImprovement(total))
				// Amount End

				this.cd.markForCheck()
			} else if (this.categoryChooseTitle === "ticket") {
				this.ticketTotalAll.cost -= list.totalCost ? list.totalCost : 0
				this.detailList = [{
					name: "Total Cost", price: this.ticketTotalAll.cost
				}]
				this.descDetailTicket = this.descDetailTicket.filter(data => data._id !== list._id)

				// Amount Start
				let subTotalValue = this.ticketTotalAll.cost
				let total = subTotalValue + (subTotalValue === 0 ? 0 : this.printedFee)
				controls.subTotalPOS.setValue(this.serviceFormat.rupiahFormatImprovement(subTotalValue))
				controls.printedFee.setValue(this.serviceFormat.rupiahFormatImprovement(subTotalValue === 0 ? 0 : this.printedFee))
				controls.totalPOS.setValue(this.serviceFormat.rupiahFormatImprovement(total))
				// Amount End

				this.cd.markForCheck()
			}

			else if (this.categoryChooseTitle === "parking") {
				this.parkingTotalAll.cost -= list.parking.parkingRate ? list.parking.parkingRate : 0

				this.dataParking = this.dataParking.filter(data => data._id !== list._id)
				// this gives an object with dates as keys
				const groups = this.dataParking.reduce((groups, item) => {
					const date = item.periode
					if (!groups[date]) {
						groups[date] = [];
					}
					groups[date].push(item);
					return groups;
				}, {});

				// Edit: to add it in the array format instead.
				const groupPark = Object.keys(groups).map((date) => {
					const groupDate = groups[date]
					let total = 0
					groupDate.forEach(data => total += data.parking.parkingRate)
					return {
						name: date,
						price: total
					};
				});

				this.detailList = groupPark
				this.descDetailParking = this.descDetailParking.filter(data => data._id !== list._id)

				// Amount Start
				let subTotalValue = this.parkingTotalAll.cost
				let total = subTotalValue + (subTotalValue === 0 ? 0 : this.printedFee)
				controls.subTotalPOS.setValue(this.serviceFormat.rupiahFormatImprovement(subTotalValue))
				controls.printedFee.setValue(this.serviceFormat.rupiahFormatImprovement(subTotalValue === 0 ? 0 : this.printedFee))
				controls.totalPOS.setValue(this.serviceFormat.rupiahFormatImprovement(total))
				// Amount End

				this.cd.markForCheck()
			}
		}



		controls.amount.setValue("")
		controls.change.setValue("")

		// Check Total
		this.checkTotal()
	}

	amountTotalGalon(data, type) {
		if (type === 'amountPlus') {
			data.map(data => {
				this.totalGalon += data.totalTr
			})
			return this.totalGalon
		} else if (type === 'amountMinus') {
			data.map(data => {
				this.totalGalon -= data.totalTr
			})
			return this.totalGalon
		} else {
			let result = 0
			data.map(data => {
				result += data.totalTr
			})
			return result
		}
	}

	resultGalonId: any[] = []
	resultGalonIdNot: any[] = []

	idGalonSelect(data) {

		data.map(data => {
			this.resultGalonId.push(data.idArray)
		})
		this.resultGalonId = [].concat.apply([], this.resultGalonId);

		this.galonIdChoose = this.resultGalonId

		// console.log(this.galonIdChoose, 'this.galonIdChoose YES');
		// console.log(this.galonIdChoose.length, 'this.galonIdChoose YES');
	}

	idGalonSelectNot(data) {
		data.map(data => {
			this.resultGalonIdNot.push(data.idArray)
		})
		this.resultGalonIdNot = [].concat.apply([], this.resultGalonIdNot);

		let arr1 = this.resultGalonId,
			arr2 = this.resultGalonIdNot,
			res = arr1.filter(item => !arr2.includes(item));

		this.galonIdChoose = res


		// Cond Start
		this.resultGalonId = res
		this.resultGalonIdNot = []
		// Cond End' 


		// console.log(this.galonIdChoose, 'this.galonIdChoose NO');
		// console.log(this.galonIdChoose.length, 'this.galonIdChoose NO');
	}


	// currency format
	changeAmount(event, id) {
		this.toCurrency(event, id);
	}

	toCurrency(event: any, id) {
		// Differenciate function calls (from event or another function)
		let controls = this.posForm.controls;
		let value = event.target.value
		// controls.multiGLAccount.get(`amount${ id } `).setValue(formattedNumber);

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

		const valueRupiah = this.serviceFormat.formatFloat(rupiah)
		const amountChange = valueRupiah - this.serviceFormat.formatFloat(controls.totalPOS.value)
		controls.amount.setValue(rupiah)
		controls.change.setValue(this.serviceFormat.rupiahFormatImprovement(amountChange))

		if (amountChange < 0) {
			this.isChangeColor = true
		} else {
			this.isChangeColor = false
		}

		return rupiah
	}


	masterToggle() {

		this.isAllSelected()
			? this.selection.clear()
			: this.columnsList.forEach((col) => this.selection.select(col));
	}


}


