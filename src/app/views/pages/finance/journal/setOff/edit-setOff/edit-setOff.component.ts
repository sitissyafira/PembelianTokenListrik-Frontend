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
	LayoutUtilsService,
	MessageType,
	QueryParamsModel,
} from "../../../../../../core/_base/crud";
import { SetOffModel } from "../../../../../../core/finance/journal/setOff/setOff.model";
import {
	selectSetOffActionLoading,
	selectSetOffById,
} from "../../../../../../core/finance/journal/setOff/setOff.selector";
import { SetOffService } from "../../../../../../core/finance/journal/setOff/setOff.service";
import { SelectionModel } from "@angular/cdk/collections";
import { AccountGroupService } from "../../../../../../core/accountGroup/accountGroup.service";
import { MatDialog, MatTable } from "@angular/material";
import { ServiceFormat } from "../../../../../../core/serviceFormat/format.service";
import { SavingDialog } from "../../../../../partials/module/saving-confirm/confirmation.dialog.component";

@Component({
	selector: "kt-edit-setOff",
	templateUrl: "./edit-setOff.component.html",
	styleUrls: ["./edit-setOff.component.scss"],
})
export class EditSetOffComponent implements OnInit, OnDestroy {
	setOff: SetOffModel;
	SetOffId$: Observable<string>;
	oldSetOff: SetOffModel;
	selectedTab = 0;
	loading$: Observable<boolean>;
	selection = new SelectionModel<SetOffModel>(true, []);
	setOffResult: any[] = [];
	glResult: any[] = [];
	setOffForm: FormGroup;
	date1 = new FormControl(new Date());
	hasFormErrors = false;
	isStatus: boolean = false;


	isGenerateBilling: string = "" /* To determine the condition of the generating billing process in progress */
	msgErrorGenerate: string = "" /* To display message error proccessing generate */



	private subscriptions: Subscription[] = [];

	unitSO = ""
	totalField: number = 0

	ccList = [];
	ccList2 = [];


	loading = {
		deposit: false,
		submit: false,
		glaccount: false,
		glaccount2: false,
	};

	setOffListResultFiltered = [];
	viewSetOffResult = new FormControl();
	gLListResultFiltered = [];
	gLListResultFiltered2 = [];

	isTransSetOff: boolean = true;
	// isSelectVoucher: boolean = true;
	isSelectVoucher: boolean = false;
	isOpenPayCond: boolean = true;
	isOpenDatePayCond: boolean = true;

	valueBill: any


	checked = {
		date: {
			control: new FormControl()
		},
		control: new FormControl(),
	};

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

	selectedVoucherno: any[] = [];
	arSaldoID: string = ""


	viewVoucherResult = new FormControl();
	viewVoucherNoResult = new FormControl();

	// VoucherResultFiltered = [];
	VoucherResultFiltered = [];
	VoucherNoResultFiltered = [];

	loadingData = {
		voucher: false
	}

	tagihanBillingData: any = [
		{
			tes: 'tes'
		},
		{
			tes: 'tes'
		},
	]

	totalSVAllMulti: any
	totalSVAll: any

	@ViewChild('myTable', { static: false }) table: MatTable<any>;
	@ViewChild('myTable2', { static: false }) table2: MatTable<any>;
	displayedColumns = ['no', 'gl', 'amount', 'desc', 'isdebit', 'action'];
	displayedColumns2 = ['no2', 'gl2', 'amount2', 'desc2', 'isdebit2', 'action2'];

	constructor(
		private activatedRoute: ActivatedRoute,
		private serviceFormat: ServiceFormat,
		private router: Router,
		private setOffFB: FormBuilder,
		private layoutUtilsService: LayoutUtilsService,
		private store: Store<AppState>,
		private service: SetOffService,
		private COAService: AccountGroupService,
		private cd: ChangeDetectorRef,
		private dialog: MatDialog

	) { }



	ngOnInit() {
		this.loading$ = this.store.pipe(select(selectSetOffActionLoading));
		const routeSubscription = this.activatedRoute.params.subscribe(
			(params) => {
				const id = params.id;
				if (id) {
					this.service.findSetOffById(id).subscribe(resjousetoff => {
						this.totalField = resjousetoff.data.JS.totalField
						this.unitSO = resjousetoff.data.JS.ARID.unit2
						// for (let i = 0; i < this.totalField; i++) {
						this.ccList.push({ id: '', refCc: '', name: '' })
						this.ccList2.push({ id: '', refCc: '', name: '' })
						// }

						this.arSaldoID = resjousetoff.data.JS.ARID

						resjousetoff.data.JS.voucherno.forEach(data => {
							this.selectedVoucherno.push({ voucherno: data.voucherno, amount: data.amount, _id: data._id })
						})

						let sldoGL = resjousetoff.data.JS.amount == resjousetoff.data.JS.multiGLAccount.amount2 ?
							resjousetoff.data.JS.amount : 0

						this.totalSVAllMulti = parseFloat(sldoGL)

						this.setOff = resjousetoff.data;
						this.valueBill = resjousetoff.data.JS.ARID.unit2
						this.isStatus = resjousetoff.data.JS.status

						if (resjousetoff.data.JS.status) {
							this.isTransSetOff = false
							if (resjousetoff.data.JS.payCond != undefined) {
								this.isOpenPayCond = false
								this.checked.control.setValue(resjousetoff.data.JS.payCond)
							}
							if (resjousetoff.data.JS.payDate != undefined) {
								this.isOpenDatePayCond = false
								this.checked.date.control.setValue(resjousetoff.data.JS.payDate)
							}
						} else {
							this.isTransSetOff = false
						}

						this.oldSetOff = Object.assign({}, this.setOff);
						this.initSetOff();

						this.viewSetOffResult.disable();
						this.viewSetOffResult.setValue(
							`${resjousetoff.data.JS.depositTo.acctName.toLocaleLowerCase()}`
						);
						this._filterCashbankList(
							`${resjousetoff.data.JS.depositTo.acctName.toLocaleLowerCase()}`
						);

						this._filterGLList(
							`${resjousetoff.data.JS.glaccount.acctName.toLocaleLowerCase()}`
						);
						this.initSetOff();
					})

				}
			}
		);
		this.subscriptions.push(routeSubscription);
	}



	valueChecked(choose) {
		for (let i = 1; i <= 30; i++) {
			let valIsDeb
			if (this.setOff.JS.multiGLAccount[`isDebit${i}`] != undefined) valIsDeb = this.setOff.JS.multiGLAccount[`isDebit${i}`];
			else valIsDeb = true

			if (choose == ('deb' + i)) return valIsDeb;
			else if (choose == ('cred' + i)) return !valIsDeb
		}
	}

	initSetOff() {
		this.createForm();
		this.loadCOACashBank();
		this.loadGLAccountJS(null);
		this.loadGLAccountJS2(null);
		this.loadVoucherBill(null)
		this.loadVoucherNo(null, this.unitSO)
		this.detailTagihanBill(this.valueBill)
	}


	printOptions = [
		{ value: "A5", name: "A5" },
		{ value: "A4", name: "A4" },
	];

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
		controls.multiGLAccount.get(`isDebit${this.totalField}`).setValue(true)

		this.table.renderRows();
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

	addCCEmpty() {
		const controls = this.setOffForm.controls;
		this.isTransSetOff = false
		this.ccList.push({ id: '', refCc: '', name: '' })
		this.ccList2.push({ id: '', refCc: '', name: '' });

		this.totalField = this.totalField += 2

		controls.multiGLAccount.get(('isDebit' + 1)).setValue(true)
		controls.multiGLAccount.get(('isDebit' + 2)).setValue(false)

		this.table.renderRows();
		this.table2.renderRows();

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
		controls.multiGLAccount.get(('isDebit' + index)).setValue(undefined)

		this.table.renderRows();
	}

	_setGLAccount(value, target) {
		const controls = this.setOffForm.controls;
		for (let i = 1; i <= 30; i++) {
			if (target == ('target' + i)) {
				controls.multiGLAccount.get(('glAcc' + i)).setValue(`${value.acctNo} - ${value.acctName}`)
				controls.multiGLAccount.get(('glAccountId' + i)).setValue(value._id)
			}
		}
	}

	_setVoucherValue(value) {
		const controls = this.setOffForm.controls;
		this.isSelectVoucher = false
		const totalVoucher = value.totalAll.debit == value.totalAll.credit ? value.totalAll.debit : 0

		controls.saldoVoucher.setValue(this.serviceFormat.rupiahFormatImprovement(totalVoucher))
		controls.ARID.setValue(value._id)
		this.arSaldoID = value._id
		this.unitSO = value.unit2

		this.loadVoucherNo(null, value.unit2)
		this.detailTagihanBill(value.unit2)
	}

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


	detailTagihanBill(voucherNo) {
		const queryParams = new QueryParamsModel(voucherNo, "asc", null, 1, 10);
		this.service.getDetailTagihanBill(queryParams).subscribe((res) => {
			this.tagihanBillingData = res.data
			this.cd.markForCheck()
		});
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



	createForm() {
		// Check Saldo Voucher
		const amount1 = this.setOff.JS.ARID.totalAll.debit
		const amount2 = this.setOff.JS.ARID.totalAll.credit
		let totalVoucher = amount1 == amount2 ? amount1 : 0

		this.totalSVAll = parseFloat(totalVoucher + this.totalSVAllMulti)

		let amountTotal = 0
		this.setOff.JS.voucherno.forEach(data => amountTotal += data.amount)

		let objFormMultiGl = {}
		for (let i = 1; i <= 30; i++) {
			let glid, glacc, memo, amount, isDebit;
			if (this.setOff.multiGLID[`glId${i}`] !== undefined) glid = this.setOff.multiGLID[`glId${i}`]._id;
			if (this.setOff.multiGLID[`glId${i}`] !== undefined) glacc = this.setOff.multiGLID[`glId${i}`].acctName;
			if (this.setOff.JS.multiGLAccount[`memo${i}`] !== undefined) memo = this.setOff.JS.multiGLAccount[`memo${i}`];
			if (this.setOff.JS.multiGLAccount[`amount${i}`] !== undefined) amount = this.serviceFormat.rupiahFormatImprovement(this.setOff.JS.multiGLAccount[`amount${i}`] == undefined || this.setOff.JS.multiGLAccount[`amount${i}`] == null ? "" : this.setOff.JS.multiGLAccount[`amount${i}`]);
			if (this.setOff.JS.multiGLAccount[`isDebit${i}`] !== undefined) isDebit = this.setOff.JS.multiGLAccount[`isDebit${i}`];

			objFormMultiGl[`glAccountId${i}`] = [{ value: glid, disabled: true }];
			objFormMultiGl[`glAcc${i}`] = [{ value: glacc, disabled: true }];
			objFormMultiGl[`memo${i}`] = [{ value: memo, disabled: true }];
			objFormMultiGl[`amount${i}`] = [{ value: amount, disabled: true }];
			objFormMultiGl[`isDebit${i}`] = [{ value: isDebit, disabled: true }];

		}

		this.setOffForm = this.setOffFB.group({
			depositTo: [this.setOff.JS.depositTo == undefined ? "" : this.setOff.JS.depositTo._id],
			voucherno: [this.setOff.JS.voucherno],
			rate: [this.setOff.JS.rate],
			date: [{ value: this.setOff.JS.date, disabled: true }],

			payFrom: [this.setOff.JS.payFrom],
			createdBy: [this.setOff.JS.createdBy],
			crtdate: [this.setOff.JS.crtdate],
			// status: [this.setOff.JS.status],
			printSize: [this.setOff.JS.printSize],
			voucherAR: [(this.setOff.JS.ARID.voucherno + ' - ' + this.setOff.JS.ARID.unit2)],
			ARID: [this.setOff.JS.ARID],
			status: [this.setOff.JS.status == undefined ? "" : this.setOff.JS.status],
			payCond: [this.setOff.JS.payCond == undefined ? "" : this.setOff.JS.payCond],
			payDate: [this.setOff.JS.payDate == undefined ? "" : this.setOff.JS.payDate],
			saldoVoucher: [amount1 == amount2 ? this.serviceFormat.rupiahFormatImprovement(amount1) : ""],
			totalTagihan: [this.serviceFormat.rupiahFormatImprovement(amountTotal)],

			multiGLAccount: this.setOffFB.group(objFormMultiGl),
		})
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

	_onKeyupGL2(e: any) {
		this.setOffForm.patchValue({ glaccount: undefined });
		this._filterGLList2(e.target.value);
	}

	_filterGLList2(text: string) {
		this.loadGLAccountJS2(text)
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


	_filterCashbankList(text: string) {
		this.setOffListResultFiltered = this.setOffResult.filter((i) => {
			const filterText = `${i.acctNo.toLocaleLowerCase()}`;
			if (filterText.includes(text.toLocaleLowerCase())) return i;
		});
	}

	loadCOACashBank() {
		this.selection.clear();
		const queryParams = new QueryParamsModel(null, "asc", null, 1, 10000);
		this.COAService.getListCashBank(queryParams).subscribe((res) => {
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
	_setGlValue(value) {
		this.setOffForm.patchValue({ glaccount: value._id });
	}

	_onKeyupGL(e: any) {
		this._filterGLList(e.target.value);
	}

	isSelected(item, target) {
		if (this[`selected${target}`].includes(item)) {
			return "d-none";
		}
	}

	selectList(list, target) {
		let validate = this.selectedVoucherno.find(data => data.voucherno == list.voucherno)

		const controls = this.setOffForm.controls;
		let valTotalTagihan = controls.totalTagihan.value
		let valTotal = typeof valTotalTagihan == "string" ? this.serviceFormat.formatFloat(valTotalTagihan) : valTotalTagihan
		let amountTarget = list.amount
		let totalResult = valTotal += amountTarget
		controls.totalTagihan.setValue(this.serviceFormat.rupiahFormatImprovement(totalResult))

		if (validate == undefined) {
			this[`selected${target}`].push(list);
			this.setOffForm.controls[target.toLowerCase()].reset();
			this.cd.markForCheck();
		}

	}

	_filterGLList(text: string) {
		this.setOffListResultFiltered = this.setOffResult.filter((i) => {
			const filterText = `${i.acctNo.toLocaleLowerCase()} - ${i.acctName.toLocaleLowerCase()}`;

			if (filterText.includes(text.toLocaleLowerCase())) return i;
		});
		this.loadGLAccountJS(text)
	}

	loadGLAccountJS(text) {
		this.loading.glaccount = true;
		this.selection.clear();
		const queryParams = new QueryParamsModel(text, "asc", null, 1, 1000);

		this.COAService.getListGLAccountSODebit(queryParams).subscribe((res) => {
			const data = [];
			res.data.map((item) => {
				item.map((item2) => {
					data.push(item2);
				});
			});
			this.gLListResultFiltered = data.slice();
			this.cd.markForCheck();
			this.loading.deposit = false;
			this.loading.glaccount = false;
			this.cd.markForCheck();
			this.glResult = data;
		});
	}

	loadGLAccountJS2(text) {
		this.selection.clear();
		const queryParams = new QueryParamsModel(text, "asc", null, 1, 10);
		this.COAService.getListGLAccountSOCredit(queryParams).subscribe((res) => {

			const data = [];
			res.data.map((item) => {
				item.map((item2) => {
					data.push(item2);
				});
			});
			this.gLListResultFiltered2 = data.slice();
			this.loading.glaccount2 = false;
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
			unit: this.unitSO
		}
		this.service.getAllSelectVoucherNo(queryParams).subscribe((res) => {
			this.VoucherNoResultFiltered = res.data
			this.cd.markForCheck()
		});
	}

	deleteList(id, target, list) {
		let valueIndex = this[`selected${target}`].findIndex(
			(item) => item._id === id
		);

		const controls = this.setOffForm.controls;
		let valTotalTagihan = controls.totalTagihan.value
		let valTotal = typeof valTotalTagihan == "string" ? this.serviceFormat.formatFloat(valTotalTagihan) : valTotalTagihan
		let amountTarget = list.amount
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
		const amount1 = controls.multiGLAccount.get('amount1').value;
		const amount2 = controls.multiGLAccount.get('amount2').value;
		const payCond = controls.payCond.value
		const payDate = controls.payDate.value
		const message = `Input your payment or payment date`;

		if (this.selectedVoucherno.length == 0) {
			this.layoutUtilsService.showActionNotification("Select your voucher number!", MessageType.Create, 5000, true, true);
			return
		}

		if (statusPaid) {
			if (payCond == "" || payDate == "") {
				this.layoutUtilsService.showActionNotification(message, MessageType.Create, 5000, true, true
				);
				return
			}
		}

		if (this.serviceFormat.formatFloat(amount1) > this.totalSVAll ||
			this.serviceFormat.formatFloat(amount2) > this.totalSVAll) {
			this.layoutUtilsService.showActionNotification(
				"Amount can't be bigger than saldo voucher",
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

		const editedSetOff = this.prepareSetOff();
		this.updateSetOff(editedSetOff, withBack);
	}

	prepareSetOff(): SetOffModel {
		const controls = this.setOffForm.controls;
		const _setOff = new SetOffModel();

		let objRes = {}
		for (let i = 2; i <= 30; i++) {
			const a = controls.multiGLAccount.get(`amount${i}`).value
			// const amountLoop = a.replace(/\./g, "");
			const amountLoop = controls.multiGLAccount.get(`amount${i}`).value == undefined || controls.multiGLAccount.get(`amount${i}`).value == null ? "" : a.replace(/[\.]+/g, "").replace(/[\,]+/g, ".");

			objRes[`glAcc${i}`] = controls.multiGLAccount.get(`glAccountId${i}`).value;
			objRes[`memo${i}`] = controls.multiGLAccount.get(`memo${i}`).value;
			objRes[`amount${i}`] = controls.multiGLAccount.get(`amount${i}`).value == "" || controls.multiGLAccount.get(`amount${i}`).value == undefined ? undefined : parseFloat(amountLoop);
			objRes[`isDebit${i}`] = controls.multiGLAccount.get(`amount${i}`).value == "" ? undefined : controls.multiGLAccount.get(`isDebit${i}`).value
		}

		let dataVoucherNo = []
		let dataVoucherId = []
		this.selectedVoucherno.forEach(data => dataVoucherNo.push(data.voucherno))
		this.selectedVoucherno.forEach(data => dataVoucherId.push(data._id))

		_setOff.clear();
		_setOff._id = this.setOff.JS._id;
		_setOff.depositTo = controls.depositTo.value == "" ? undefined : controls.depositTo.value;
		// _setOff.voucherno = controls.voucherno.value;
		_setOff.date = controls.date.value;
		_setOff.rate = controls.rate.value;
		_setOff.createdBy = controls.createdBy.value;
		_setOff.crtdate = controls.crtdate.value;
		// _setOff.status = controls.status.value;
		_setOff.printSize = controls.printSize.value;
		_setOff.payFrom = controls.payFrom.value;
		_setOff.totalField = this.totalField
		let valStatus = controls.status.value;

		_setOff.status = valStatus

		_setOff.status = controls.status.value;

		_setOff.payCond = valStatus == false ? "outstanding" : controls.payCond.value == "" ? undefined : controls.payCond.value;
		_setOff.payDate = valStatus == false ? "" : controls.payDate.value == "" ? undefined : controls.payDate.value;
		_setOff.ARID = controls.ARID.value;

		// _setOff.totalTagihan = this.serviceFormat.formatFloat(controls.totalTagihan.value);

		_setOff.voucherno = dataVoucherNo
		_setOff.voucherID = dataVoucherId
		_setOff.arSaldoID = this.arSaldoID

		const a = controls.multiGLAccount.get('amount1').value;
		// const amount1 = a.replace(/\./g, "");
		const amount1 = controls.multiGLAccount.get(`amount1`).value == undefined || controls.multiGLAccount.get(`amount1`).value == null ? "" : a.replace(/[\.]+/g, "").replace(/[\,]+/g, ".");

		_setOff.glaccount = controls.multiGLAccount.get('glAccountId1').value
		_setOff.memo = controls.multiGLAccount.get('memo1').value
		_setOff.amount = controls.multiGLAccount.get(`amount1`).value == "" || controls.multiGLAccount.get(`amount1`).value == undefined ? undefined : parseFloat(amount1)
		_setOff.isDebit = controls.multiGLAccount.get(`amount1`).value == "" ? undefined : controls.multiGLAccount.get(`isDebit1`).value


		_setOff.multiGLAccount = objRes == {} ? undefined : objRes

		return _setOff;
	}

	updateSetOff(_setOff: SetOffModel, withBack: boolean = false) {
		this.processSaving()
		const addSubscription = this.service.updateSetOff(_setOff).subscribe(
			(res) => {
				this.dialog.closeAll()
				this.loading.submit = false;
				const message = `Journal Set Off successfully has been saved.`;
				this.layoutUtilsService.showActionNotification(
					message,
					MessageType.Update,
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
					MessageType.Update,
					5000,
					true,
					false
				);
			}
		);
		this.subscriptions.push(addSubscription);
	}

	getComponentTitle() {
		let result = `Edit Journal Set Off`;
		return result;
	}

	onAlertClose($event) {
		this.hasFormErrors = false;
	}

	ngOnDestroy() {
		this.subscriptions.forEach((sb) => sb.unsubscribe());
	}

	inputKeydownHandler(event) {
		return event.keyCode === 8 || event.keyCode === 46
			? true
			: !isNaN(Number(event.key));
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
