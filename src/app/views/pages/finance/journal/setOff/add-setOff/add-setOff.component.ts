import { ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";

import {
	FormBuilder,
	FormControl,
	FormGroup,
	Validators,
} from "@angular/forms";
import { Observable, Subscription } from "rxjs";
import { Store, select } from "@ngrx/store";
import { AppState } from "../../../../../../core/reducers";
import {
	SubheaderService,
	LayoutConfigService,
} from "../../../../../../core/_base/layout";
import {
	LayoutUtilsService,
	MessageType,
	QueryParamsModel,
} from "../../../../../../core/_base/crud";
import { SetOffModel } from "../../../../../../core/finance/journal/setOff/setOff.model";
import { selectSetOffActionLoading } from "../../../../../../core/finance/journal/setOff/setOff.selector";
import { SetOffService } from "../../../../../../core/finance/journal/setOff/setOff.service";
import { SelectionModel } from "@angular/cdk/collections";
import { AccountGroupService } from "../../../../../../core/accountGroup/accountGroup.service";
import { MatTable } from "@angular/material";
import { ServiceFormat } from "../../../../../../core/serviceFormat/format.service";
import { MatDialog } from "@angular/material";
import { ConfirmationDialog } from "../../../../../partials/module/confirmation-popup/confirmation.dialog.component";
import { SavingDialog } from "../../../../../partials/module/saving-confirm/confirmation.dialog.component";
@Component({
	selector: "kt-add-setOff",
	templateUrl: "./add-setOff.component.html",
	styleUrls: ["./add-setOff.component.scss"],
})
export class AddSetOffComponent implements OnInit, OnDestroy {
	setOff: SetOffModel;
	SetOffId$: Observable<string>;
	oldSetOff: SetOffModel;
	selectedTab = 0;
	loading$: Observable<boolean>;
	selection = new SelectionModel<SetOffModel>(true, []);
	setOffResult: any[] = [];
	glResult: any[] = [];
	accountReceive: any[] = [];
	setOffForm: FormGroup;
	date1 = new FormControl(new Date());
	hasFormErrors = false;
	isStatus: boolean = false;

	isGenerateBilling: string = "" /* To determine the condition of the generating billing process in progress */
	msgErrorGenerate: string = "" /* To display message error proccessing generate */



	valueSelectARUnit = ""
	checkSubmit: boolean = false

	viewVoucherResult = new FormControl();
	viewVoucherNoResult = new FormControl();
	// VoucherResultFiltered = [];
	VoucherResultFiltered = [];
	VoucherNoResultFiltered = [];
	loadingData = {
		voucher: false
	}

	tagihanBillingData: any = []
	selectedVoucherno: any[] = [];
	arSaldoID: string = ""



	@ViewChild('myTable', { static: false }) table: MatTable<any>;
	@ViewChild('myTable2', { static: false }) table2: MatTable<any>;
	displayedColumns = ['no', 'gl', 'amount', 'desc', 'isdebit', 'action'];
	displayedColumns2 = ['no2', 'gl2', 'amount2', 'desc2', 'isdebit2', 'action2'];


	setOffListResultFiltered = [];
	viewSetOffResult = new FormControl();

	valSaldoVoucher: any

	payCondList: any = [
		{
			payment: "Full Payment",
			value: "full-payment",
			empty: ""
		},
		{
			payment: "Parsial Lebih",
			value: "parsial-lebih",
			empty: ""
		},
		{
			payment: "Parsial Kurang",
			value: "parsial-kurang",
			empty: ""
		},
	]

	totalField: number = 0
	balanced: boolean = false
	invalid: boolean = false
	isSelectVoucher: boolean = true;
	isOpenPayCond: boolean = true;
	isOpenDatePayCond: boolean = true;
	isTransSetOff: boolean = true;

	checked = {
		date: {
			control: new FormControl()
		},
		control: new FormControl(),
	};

	gLListResultFiltered2 = [];

	gLListResultFiltered = [];
	viewGlResult = new FormControl();
	viewGlResult2 = new FormControl();

	private subscriptions: Subscription[] = [];
	loading = {
		deposit: false,
		submit: false,
		glaccount: false,
		glaccount2: false
	};
	constructor(
		private activatedRoute: ActivatedRoute,
		private serviceFormat: ServiceFormat,
		private router: Router,
		private setOffFB: FormBuilder,
		private subheaderService: SubheaderService,
		private layoutUtilsService: LayoutUtilsService,
		private store: Store<AppState>,
		private service: SetOffService,
		private COAService: AccountGroupService,
		private layoutConfigService: LayoutConfigService,
		private cd: ChangeDetectorRef,
		private dialog: MatDialog
	) { }

	ngOnInit() {
		this.loading$ = this.store.pipe(select(selectSetOffActionLoading));
		this.setOff = new SetOffModel();
		this.setOff.clear();
		this.initSetOff();
	}

	initSetOff() {
		this.createForm();
		this.loadCOACashBank();
		this.loadVoucherBill(null);
		this.loadVoucherNo(null, "");
		this.loadGLAccountJA(null);
		this.loadGLAccountJA2(null);
	}

	createForm() {

		let objFormMultiGl = {}
		for (let i = 1; i <= 30; i++) {
			objFormMultiGl[`glAccountId${i}`] = [{ value: undefined, disabled: false }];
			objFormMultiGl[`glAcc${i}`] = [{ value: "", disabled: false }];
			objFormMultiGl[`memo${i}`] = [{ value: undefined, disabled: false }];
			objFormMultiGl[`amount${i}`] = [{ value: "", disabled: false }];
			objFormMultiGl[`isDebit${i}`] = [{ value: true, disabled: false }];
		}

		this.setOffForm = this.setOffFB.group({
			depositTo: [""],
			voucherno: [""],
			rate: [{ value: "IDR", disabled: false }], //number
			glaccount: [""],
			payFrom: [{ value: "SET OFF JOURNAL", disabled: false }, Validators.required],
			date: [this.date1.value, Validators.required], // number
			createdBy: [this.setOff.createdBy], // number
			crtdate: [{ value: this.date1.value, disabled: true }], // number
			// statusAR: [""],
			status: [""],
			printSize: [this.setOff.printSize],
			saldoVoucher: ["", Validators.required],
			payCond: [""],
			payDate: ["",],
			ARID: [""],
			totalTagihan: [0],
			multiGLAccount: this.setOffFB.group(objFormMultiGl),
		});
	}

	ccList2 = [];
	ccList = [];
	ifMaksField: boolean = false


	addCC(e) {
		const controls = this.setOffForm.controls;
		let glRslt = controls.multiGLAccount.get(`glAccountId${e}`).value
		let amntRslt = controls.multiGLAccount.get(`amount${e}`).value

		if (glRslt == undefined || amntRslt == "") {
			const message = `Complete contents of GlAccount and amount No. ${e}`;
			this.layoutUtilsService.showActionNotification(
				message,
				MessageType.Create,
				5000,
				true,
				true)
			return
		}
		this.ccList.push({
			id: '',
			refCc: '',
			name: ''
		});
		this.totalField = this.totalField += 1

		this.table.renderRows();

	}

	addCCEmpty() {
		const controls = this.setOffForm.controls;

		this.checkSubmit = true
		this.isTransSetOff = false

		this.ccList.push({ id: '', refCc: '', name: '' })
		this.ccList2.push({ id: '', refCc: '', name: '' });

		this.totalField = this.totalField += 2

		controls.multiGLAccount.get(('isDebit' + 1)).setValue(true)
		controls.multiGLAccount.get(('isDebit' + 2)).setValue(false)

		this.table.renderRows();
		this.table2.renderRows();

	}
	_setVoucherValue(value) {
		const controls = this.setOffForm.controls;
		this.isSelectVoucher = false
		const totalVoucher = value.totalAll.debit == value.totalAll.credit ? value.totalAll.debit : 0
		this.valSaldoVoucher = this.serviceFormat.rupiahFormatImprovement(totalVoucher)
		controls.saldoVoucher.setValue(this.serviceFormat.rupiahFormatImprovement(totalVoucher))
		controls.ARID.setValue(value._id)
		this.arSaldoID = value._id
		this.valueSelectARUnit = value.unit2

		this.loadVoucherNo(null, value.unit2)
		this.detailTagihanBill(value.unit2)
	}


	removeCC(i: number) {
		const controls = this.setOffForm.controls;
		this.ccList.splice(i, 1);

		const index = i + 1
		this.totalField = this.totalField -= 1

		controls.multiGLAccount.get(('glAcc' + index)).setValue("")
		controls.multiGLAccount.get(('amount' + index)).setValue("")
		controls.multiGLAccount.get(('glAccountId' + index)).setValue(undefined)
		controls.multiGLAccount.get(('memo' + index)).setValue(undefined)
		controls.multiGLAccount.get(('isDebit' + index)).setValue(true)

		this.table.renderRows();
	}

	clickToggle(e) {
		const controls = this.setOffForm.controls;
		// for (let i = 1; i <= 30; i++) {
		// 	if (e.target.name == i) controls.multiGLAccount.get(('amount' + i)).setValue(null)
		// }
		this.cd.markForCheck()
	}

	valueIsDebit(e) {
		const controls = this.setOffForm.controls;
		for (let i = 1; i <= 30; i++) {
			let value = e.target.value == "true" ? true : false
			if (e.target.name == i) controls.multiGLAccount.get(('isDebit' + i)).setValue(value)
		}
		this.cd.markForCheck()
	}

	// currency format
	changeAmount(event, id) {
		this.toCurrency(undefined, event, "amount", "amountClone", id);
	}

	voucherDateHandler(e) {
		const controls = this.setOffForm.controls;
		controls.payDate.setValue(this.checked.date.control.value)
	}

	valuePayCond(e) {
		const controls = this.setOffForm.controls;
		this.isOpenDatePayCond = false
		controls.payCond.setValue(e)
	}

	// toCurrency(
	// 	values: any,
	// 	event: any,
	// 	formName: string,
	// 	rawValueProps: string,
	// 	id
	// ) {
	// 	// Differenciate function calls (from event or another function)
	// 	let controls = this.setOffForm.controls;
	// 	let value = event
	// 		? event.target.value.replace(/\./g, "")
	// 		: values.toString();

	// 	//Make sure it is not undefined, but atleast 0
	// 	if (value === "" || value === NaN) {
	// 		value = "0";
	// 	}

	// 	//Check if value is not number, ingnore it
	// 	if (value.match(/[0-9-]/g) !== null) {
	// 		let intValue; //Raw Number
	// 		let formattedNumber; // Formatted Number

	// 		//Minus symbol validation
	// 		if (value === "-" || value === "--" || value === "0-") {
	// 			intValue = 0;
	// 			formattedNumber = "-";
	// 		} else {
	// 			intValue = parseInt(value);
	// 			formattedNumber = new Intl.NumberFormat("id-ID", {
	// 				minimumFractionDigits: 0,
	// 			}).format(intValue);
	// 		}

	// 		//Set Raw Value
	// 		this[rawValueProps] = intValue;

	// 		//Set Formatted Value
	// 		controls.multiGLAccount.get(`amount${id}`).setValue(formattedNumber);

	// 		return formattedNumber;
	// 	} else {
	// 		controls[formName].setValue(value.substring(0, value.length - 1));
	// 	}
	// }


	toCurrency(
		values: any,
		event: any,
		formName: string,
		rawValueProps: string,
		id
	) {
		// Differenciate function calls (from event or another function)
		let controls = this.setOffForm.controls;
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

		controls.multiGLAccount.get(`amount${id}`).setValue(rupiah);
		return rupiah
	}



	changeStatus() {
		const controls = this.setOffForm.controls;
		if (this.isStatus == true) {
			this.isOpenPayCond = false
			controls.status.setValue(true);

		} else {
			this.checked.control.setValue(undefined)
			this.checked.date.control.setValue(undefined)
			this.isOpenPayCond = true
			this.isOpenDatePayCond = true
			controls.status.setValue(false);
		}
	}


	/**
	 * @psetOffam value
	 */
	_setSetOffValue(value) {
		this.setOffForm.patchValue({ depositTo: value._id });
	}

	_onKeyup(e: any) {
		this.setOffForm.patchValue({ depositTo: undefined });
		this._filterCashbankList(e.target.value);
	}

	_filterCashbankList(text: string) {
		this.setOffListResultFiltered = this.setOffResult.filter((i) => {
			const filterText = `${i.acctNo.toLocaleLowerCase()} - ${i.acctName.toLocaleLowerCase()}`;
			if (filterText.includes(text.toLocaleLowerCase())) return i;
		});
	}

	printOptions = [
		{ value: "A5", name: "A5" },
		{ value: "A4", name: "A4" },
	];


	loadCOACashBank() {
		this.loading.deposit = true;
		this.selection.clear();
		const queryParams = new QueryParamsModel(null, "asc", null, 1, 10000);
		this.COAService.getListCashBankAR(queryParams).subscribe((res) => {
			this.setOffResult = res.data;
			this.setOffListResultFiltered = this.setOffResult.slice();
			this.viewSetOffResult.enable();
			this.cd.markForCheck();
			this.loading.deposit = false;
		});
	}

	/**
	 * @psetOffam value
	 */

	_setGLAccount(value, target) {
		const controls = this.setOffForm.controls;
		for (let i = 1; i <= 30; i++) {
			if (target == ('target' + i)) {
				controls.multiGLAccount.get(('glAcc' + i)).setValue(`${value.acctNo} - ${value.acctName}`)
				controls.multiGLAccount.get(('glAccountId' + i)).setValue(value._id)
			}
		}
	}

	_onKeyupGL(e: any) {
		this.setOffForm.patchValue({ glaccount: undefined });
		this._filterGLList(e.target.value);
	}

	_onKeyupGL2(e: any) {
		this.setOffForm.patchValue({ glaccount: undefined });
		this._filterGLList2(e.target.value);
	}

	_filterGLList2(text: string) {
		this.loadGLAccountJA2(text)
	}
	_onKeyupVoucher(e: any) {
		this.setOffForm.patchValue({ glaccount: undefined });
		this._filterGLListVoucher(e.target.value);
	}
	_onKeyupVoucherNo(e: any) {
		this.setOffForm.patchValue({ glaccount: undefined });
		this._filterGLListVoucherNo(e.target.value);
	}

	_filterGLListVoucher(text: string) {
		this.loadVoucherBill(text)
		this.cd.markForCheck()
	}
	_filterGLListVoucherNo(text: string) {
		this.loadVoucherNo(text, "")
		this.cd.markForCheck()
	}

	_filterGLList(text: string) {
		this.setOffListResultFiltered = this.setOffResult.filter((i) => {
			const filterText = `${i.acctNo.toLocaleLowerCase()} - ${i.acctName.toLocaleLowerCase()}`;
			if (filterText.includes(text.toLocaleLowerCase())) return i;
		});

		// this.gLListResultFiltered = this.glResult.filter((i) => {
		// 	const filterText = `${i.acctNo.toLocaleLowerCase()}`;
		// 	if (filterText.includes(text.toLocaleLowerCase())) return i;
		// });
		this.loadGLAccountJA(text)
	}

	loadGLAccountJA(text) {
		this.selection.clear();
		// const queryParams = new QueryParamsModel(null, "asc", null, 1, 10);
		const queryParams = new QueryParamsModel(text, "asc", null, 1, 10);
		this.COAService.getListGLAccountSODebit(queryParams).subscribe((res) => {
			const data = [];
			res.data.map((item) => {
				item.map((item2) => {
					data.push(item2);
				});
			});

			this.gLListResultFiltered = data.slice();
			this.loading.glaccount = false;
			// this.glResult = data;
			this.cd.markForCheck();
		});

	}

	loadGLAccountJA2(text) {
		this.selection.clear();
		// const queryParams = new QueryParamsModel(null, "asc", null, 1, 10);
		const queryParams = new QueryParamsModel(text, "asc", null, 1, 10);
		this.COAService.getListGLAccountSOCredit(queryParams).subscribe((res) => {

			const data = [];
			res.data.map((item) => {
				item.map((item2) => {
					data.push(item2);
				});
			});
			this.gLListResultFiltered2 = data.slice();
			// this.glResult = data;
			this.loading.glaccount = false;
			this.cd.markForCheck();
		});

	}
	loadVoucherBill(text) {
		const queryParams = new QueryParamsModel(text, "asc", null, 1, 10);
		this.service.getAllSelectVoucher(queryParams).subscribe((res) => {
			this.VoucherResultFiltered = res.data
			this.cd.markForCheck()
		});
	}

	loadVoucherNo(text, unit) {
		const queryParams = {
			filter: text,
			sortOrder: 'asc',
			sortField: null,
			pageNumber: 1,
			limit: 10,
			unit: this.valueSelectARUnit
		}

		this.service.getAllSelectVoucherNo(queryParams).subscribe((res) => {
			this.VoucherNoResultFiltered = res.data
			this.cd.markForCheck()
		});
	}

	detailTagihanBill(voucherNo) {
		const queryParams = new QueryParamsModel(voucherNo, "asc", null, 1, 10);
		this.service.getDetailTagihanBill(queryParams).subscribe((res) => {
			this.tagihanBillingData = res.data.reverse()
			this.cd.markForCheck()
		});
	}

	selectList(list, target) {
		const controls = this.setOffForm.controls;
		let valTotalTagihan = controls.totalTagihan.value
		let valTotal = typeof valTotalTagihan == "string" ? this.serviceFormat.formatFloat(valTotalTagihan) : valTotalTagihan
		// let amountTarget = list.totalAll.credit == list.totalAll.debit ? list.totalAll.debit : 0
		let amountTarget = list.totalBilling
		let totalResult = valTotal += amountTarget
		controls.totalTagihan.setValue(this.serviceFormat.rupiahFormatImprovement(totalResult))

		let validate = this.selectedVoucherno.find(data => data.billing_number == list.billing_number)

		if (validate == undefined) {
			this[`selected${target}`].push(list);
			this.setOffForm.controls[target.toLowerCase()].reset();
			this.cd.markForCheck();
		}

	}



	deleteList(id, target, list) {
		let valueIndex = this[`selected${target}`].findIndex(
			(item) => item._id === id
		);

		const controls = this.setOffForm.controls;
		let valTotalTagihan = controls.totalTagihan.value
		let valTotal = typeof valTotalTagihan == "string" ? this.serviceFormat.formatFloat(valTotalTagihan) : valTotalTagihan
		let amountTarget = list.totalBilling
		let totalResult = valTotal -= amountTarget
		controls.totalTagihan.setValue(this.serviceFormat.rupiahFormatImprovement(totalResult))

		this[`selected${target}`].splice(valueIndex, 1);
	}


	goBackWithId() {
		const url = `/setOff`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}

	refreshSetOff(isNew: boolean = false, id: string = "") {
		let url = this.router.url;
		if (!isNew) {
			this.router.navigate([url], { relativeTo: this.activatedRoute });
			return;
		}
		url = `/setOff/edit/${id}`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}

	onSubmit(withBack: boolean = false) {
		const controls = this.setOffForm.controls;
		const statusPaid = controls.status.value;
		const payCond = controls.payCond.value
		const payDate = controls.payDate.value
		const message = `Input your payment or payment date`;
		const messageSubmit = `Input your GL Account`;
		const amount1 = controls.multiGLAccount.get('amount1').value
		const amount2 = controls.multiGLAccount.get('amount2').value


		if (this.selectedVoucherno.length == 0) {
			this.layoutUtilsService.showActionNotification("Select your voucher number!", MessageType.Create, 5000, true, true);
			return
		}
		if (!this.checkSubmit) {
			this.layoutUtilsService.showActionNotification(messageSubmit, MessageType.Create, 5000, true, true);
			return
		}
		if (!this.checkSubmit) {
			this.layoutUtilsService.showActionNotification(messageSubmit, MessageType.Create, 5000, true, true);
			return
		}
		this.glAccountValidation()
		if (this.invalid) {
			const message = `Complete contents of GlAccount`;
			this.layoutUtilsService.showActionNotification(
				message,
				MessageType.Create,
				5000,
				true,
				true)
			return
		}

		this.balancedValidation()
		if (!this.balanced) {
			this.layoutUtilsService.showActionNotification(
				"Amount is not Balanced",
				MessageType.Create,
				5000,
				true,
				true
			)
			return
		}

		if (this.serviceFormat.formatFloat(amount1) == this.serviceFormat.formatFloat(this.valSaldoVoucher) ||
			this.serviceFormat.formatFloat(amount2) == this.serviceFormat.formatFloat(this.valSaldoVoucher)) {
			if (this.isStatus == false) {
				this.layoutUtilsService.showActionNotification(
					"Check paid for payment conditions",
					MessageType.Create,
					5000,
					true,
					true
				);
				return
			}
		}

		if (this.serviceFormat.formatFloat(amount1) > this.serviceFormat.formatFloat(this.valSaldoVoucher) ||
			this.serviceFormat.formatFloat(amount2) > this.serviceFormat.formatFloat(this.valSaldoVoucher)) {
			this.layoutUtilsService.showActionNotification(
				"Amount can't be bigger than saldo voucher",
				MessageType.Create,
				5000,
				true,
				true
			);
			return
		}


		if (statusPaid) {
			if (payCond == "" || payDate == "") {
				this.layoutUtilsService.showActionNotification(
					message,
					MessageType.Create,
					5000,
					true,
					true
				);
				return
			}
		} else {
			this.layoutUtilsService.showActionNotification(
				"Click paid your transaction Set Off",
				MessageType.Create,
				5000,
				true,
				true
			);
			return
		}


		this.loading.submit = true;
		this.hasFormErrors = false;
		if (this.setOffForm.invalid) {
			Object.keys(controls).forEach((controlName) =>
				controls[controlName].markAsTouched()
			);

			this.loading.submit = false;
			this.hasFormErrors = true;
			this.selectedTab = 0;

			return;
		}
		const dialogRef = this.dialog.open(
			ConfirmationDialog,
			{
				data: {
					event: 'confirmation',
					title: "Save",
					subTitle: "Are you sure the data is correct?"
				},
				width: '300px',
				disableClose: true
			}
		);
		dialogRef.afterClosed().subscribe((result) => {
			console.log(result)
			if (result == true) {
				const editedSetOff = this.prepsetOffeSetOff();
				this.addSetOff(editedSetOff, withBack);
			} else {
				return;
			}
		});
	}

	prepsetOffeSetOff(): SetOffModel {
		const controls = this.setOffForm.controls;
		const _setOff = new SetOffModel();


		let objRes = {}
		for (let i = 2; i <= 30; i++) {
			const a = controls.multiGLAccount.get(`amount${i}`).value

			objRes[`glAcc${i}`] = controls.multiGLAccount.get(`glAccountId${i}`).value;
			objRes[`memo${i}`] = controls.multiGLAccount.get(`memo${i}`).value;
			objRes[`amount${i}`] = controls.multiGLAccount.get(`amount${i}`).value == "" ? undefined : this.serviceFormat.formatFloat(a);
			objRes[`isDebit${i}`] = controls.multiGLAccount.get(`amount${i}`).value == "" ? undefined : controls.multiGLAccount.get(`isDebit${i}`).value
		}

		let dataVoucherNo = []
		let dataVoucherId = []
		this.selectedVoucherno.forEach(data => dataVoucherNo.push(data.billing_number))
		this.selectedVoucherno.forEach(data => dataVoucherId.push(data._id))

		_setOff.clear();
		_setOff._id = this.setOff._id;
		_setOff.depositTo = controls.depositTo.value == "" ? undefined : controls.depositTo.value;
		// _setOff.voucherno = controls.voucherno.value;
		_setOff.voucherno = dataVoucherNo
		_setOff.voucherID = dataVoucherId
		_setOff.rate = controls.rate.value;
		_setOff.date = controls.date.value;
		_setOff.createdBy = controls.createdBy.value;
		_setOff.crtdate = controls.crtdate.value;
		_setOff.payFrom = controls.payFrom.value;
		_setOff.printSize = controls.printSize.value;
		_setOff.totalField = this.totalField

		// _setOff.statusAR = controls.statusAR.value == "" ? false :  controls.statusAR.value;
		_setOff.status = controls.status.value == "" ? false : controls.status.value;
		_setOff.payCond = controls.status.value == false ? "outstanding" : controls.payCond.value == "" ? undefined : controls.payCond.value;
		_setOff.payDate = controls.payDate.value == "" ? undefined : controls.payDate.value;
		_setOff.ARID = controls.ARID.value;
		_setOff.arSaldoID = this.arSaldoID

		// _setOff.totalTagihan = this.serviceFormat.formatFloat(controls.totalTagihan.value);

		const a = controls.multiGLAccount.get('amount1').value;

		_setOff.glaccount = controls.multiGLAccount.get('glAccountId1').value
		_setOff.amount = controls.multiGLAccount.get('amount1').value == "" ? undefined : this.serviceFormat.formatFloat(a)
		_setOff.memo = controls.multiGLAccount.get('memo1').value
		_setOff.isDebit = controls.multiGLAccount.get('amount1').value == "" ? undefined : controls.multiGLAccount.get('isDebit1').value

		_setOff.multiGLAccount = objRes

		return _setOff;
	}

	addSetOff(_setOff: SetOffModel, withBack: boolean = false) {
		this.processSaving()
		const addSubscription = this.service.createSetOff(_setOff).subscribe(
			(res) => {
				this.dialog.closeAll()
				this.loading.submit = false;
				const message = `New Account receive successfully has been added.`;
				this.layoutUtilsService.showActionNotification(
					message,
					MessageType.Create,
					5000,
					true,
					true
				);
				const url = `/setOff`;
				this.router.navigateByUrl(url, {
					relativeTo: this.activatedRoute,
				});
			},
			(err) => {
				console.error(err);
				this.dialog.closeAll()

				this.loading.submit = false;
				const message =
					"Error while adding account receive | " + err.statusText;
				this.layoutUtilsService.showActionNotification(
					message,
					MessageType.Create,
					5000,
					true,
					false
				);
			}
		);
		this.subscriptions.push(addSubscription);
	}

	isSelected(item, target) {
		if (this[`selected${target}`].includes(item)) {
			return "d-none";
		}
	}


	getComponentTitle() {
		let result = "Create Journal Set Off";
		return result;
	}
	onAlertClose($event) {
		this.hasFormErrors = false;
	}
	ngOnDestroy() {
		this.subscriptions.forEach((sb) => sb.unsubscribe());
	}
	// onkeydown handler input
	inputKeydownHandler(event) {
		return event.keyCode === 8 || event.keyCode === 46
			? true
			: !isNaN(Number(event.key));
	}

	balancedValidation() {
		const controls = this.setOffForm.controls
		let totalAllDebit = 0
		let totalAllCredit = 0
		let resultIsDebit = []
		let resultIsCredit = []
		for (let i = 1; i <= this.totalField; i++) {
			if (controls.multiGLAccount.get(`isDebit${i}`).value == true) {
				resultIsDebit.push({ amount: this.serviceFormat.formatFloat(controls.multiGLAccount.get(`amount${i}`).value), no: i })
			} else {
				resultIsCredit.push({ amount: this.serviceFormat.formatFloat(controls.multiGLAccount.get(`amount${i}`).value), no: i })
			}
		}

		resultIsDebit.forEach(data => totalAllDebit += data.amount)
		resultIsCredit.forEach(data => totalAllCredit += data.amount)
		if (totalAllDebit == totalAllCredit) {
			this.balanced = true
		} else {
			this.balanced = false
		}
	}
	glAccountValidation() {
		const controls = this.setOffForm.controls
		let list = []
		for (let i = 1; i <= this.totalField; i++) {
			let gl = controls.multiGLAccount.get(`glAccountId${i}`).value
			list.push(gl != undefined)
		}
		this.invalid = list.some(item => item == false)
	}

	/**
 * Load SO Process Saving.
 */
	processSaving() {
		const dialogRef = this.dialog.open(
			SavingDialog,
			{
				data: {
					isGenerateBilling: this.isGenerateBilling,
					msgErrorGenerate: this.msgErrorGenerate
				},
				maxWidth: "565px",
				minHeight: "375px",
				disableClose: true
			}
		);
	}
}
