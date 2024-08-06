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
import { AppState } from "../../../../../core/reducers";
import {
	SubheaderService,
	LayoutConfigService,
} from "../../../../../core/_base/layout";
import {
	LayoutUtilsService,
	MessageType,
	QueryParamsModel,
} from "../../../../../core/_base/crud";
import { ArModel } from "../../../../../core/finance/ar/ar.model";
import {
	selectArActionLoading,
	selectArById,
} from "../../../../../core/finance/ar/ar.selector";
import { ArService } from "../../../../../core/finance/ar/ar.service";
import { SelectionModel } from "@angular/cdk/collections";
import { AccountGroupService } from "../../../../../core/accountGroup/accountGroup.service";
import { QueryAccountGroupModel } from "../../../../../core/accountGroup/queryag.model";
import { HttpClient } from "@angular/common/http";
import { environment } from "../../../../../../environments/environment";
import { MatTable } from "@angular/material";
import { UnitService } from '../../../../../core/unit/unit.service';
import { QueryUnitModel } from '../../../../../core/unit/queryunit.model';
import { ServiceFormat } from "../../../../../core/serviceFormat/format.service";


@Component({
	selector: "kt-edit-ar",
	templateUrl: "./edit-ar.component.html",
	styleUrls: ["./edit-ar.component.scss"],
})
export class EditArComponent implements OnInit, OnDestroy {
	ar: ArModel;
	ArId$: Observable<string>;
	oldAr: ArModel;
	selectedTab = 0;
	loading$: Observable<boolean>;
	selection = new SelectionModel<ArModel>(true, []);
	arResult: any[] = [];
	glResult: any[] = [];
	arForm: FormGroup;
	date1 = new FormControl(new Date());
	hasFormErrors = false;
	isStatus: boolean = false;
	private subscriptions: Subscription[] = [];

	selectSetOff: boolean = false;
	selectWriteOff: boolean = false;
	selectAr: boolean = false;

	isSelectVoucher: boolean = false;
	isTransSetOff: boolean = false;
	isOpenPayCond: boolean = true;
	isOpenDatePayCond: boolean = true;
	isCheckAmoutWO: boolean = true
	isSelectUnit: boolean = true;

	isSetOffSaldo: boolean = false
	isSaldo: boolean = false
	cekCeklisJournal: boolean = false

	viewBlockResult = new FormControl();
	viewVoucherResult = new FormControl();

	listHistoryAR: any = []
	displayedColumnsHistory = [
		"date",
		"voucherno",
		"amount",
		"credit",
		"status",
	];

	checked = {
		date: {
			control: new FormControl()
		},
		control: new FormControl(),
	};

	unitResult: any[] = [];
	voucherResult: any[] = [];
	loadingForm: boolean;

	loadingData = {
		unit: false,
		voucher: false
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

	journalType: any = [
		{
			name: "Account Receive",
			value: "ar"
		},
		{
			name: "Set Off",
			value: "so"
		},
		{
			name: "Write Off",
			value: "wo"
		}
	]

	balanced: boolean = false
	invalid: boolean = false
	totalField: number = 0
	UnitResultFiltered = [];
	VoucherResultFiltered = [];


	ccList = [];

	loading = {
		deposit: false,
		submit: false,
		glaccount: false,
	};

	arListResultFiltered = [];
	viewArResult = new FormControl();
	gLListResultFiltered = [];

	@ViewChild('myTable', { static: false }) table: MatTable<any>;
	displayedColumns = ['no', 'gl', 'amount', 'desc', 'isdebit', 'action'];
	constructor(
		private activatedRoute: ActivatedRoute,
		private serviceFormat: ServiceFormat,
		private router: Router,
		private arFB: FormBuilder,
		private layoutUtilsService: LayoutUtilsService,
		private store: Store<AppState>,
		private service: ArService,
		private COAService: AccountGroupService,
		private cd: ChangeDetectorRef,
		private http: HttpClient,
		private uservice: UnitService,

	) { }



	ngOnInit() {
		this.loading$ = this.store.pipe(select(selectArActionLoading));
		const routeSubscription = this.activatedRoute.params.subscribe(
			(params) => {
				const id = params.id;
				if (id) {
					this.service.findArById(id).subscribe(resaccreceive => {
						this.totalField = resaccreceive.data.AR.totalField
						this.cekCeklisJournal = resaccreceive.data.AR.isJournal ? true : false
						this.isSaldo = resaccreceive.data.AR.isSaldo


						this.isSetOffSaldo = resaccreceive.data.AR.isJournal !== undefined ? false :
							resaccreceive.data.AR.isJournal == "so" ? true : false

						for (let i = 0; i < this.totalField; i++) {
							this.ccList.push({
								id: '',
								refCc: '',
								name: ''
							})
						}

						this.ar = resaccreceive.data;
						this.isStatus = resaccreceive.data.AR.status

						this.viewVoucherResult.setValue(resaccreceive.data.AR.voucherno)

						this.viewBlockResult.setValue(
							`${resaccreceive.data.AR.unit2 == undefined ? "" : resaccreceive.data.AR.unit2}`
						);
						this.viewBlockResult.disable()

						if (resaccreceive.data.AR.status) {
							this.isTransSetOff = false
							if (resaccreceive.data.AR.payCond != undefined) {
								this.isOpenPayCond = false
								this.checked.control.setValue(resaccreceive.data.AR.payCond)
							}
							if (resaccreceive.data.AR.payDate != undefined) {
								this.isOpenDatePayCond = false
								this.checked.date.control.setValue(resaccreceive.data.AR.payDate)
							}
						} else {
							this.isTransSetOff = false
						}

						if (resaccreceive.data.AR.isJournal !== undefined && resaccreceive.data.AR.isJournal == "so") {
							this.selectSetOff = true
							this.isSelectUnit = false
						} else if (resaccreceive.data.AR.isJournal != undefined && resaccreceive.data.AR.isJournal == "ar") {
							this.selectAr = true
						} else if (resaccreceive.data.AR.isJournal !== undefined && resaccreceive.data.AR.isJournal == "wo") {
							if (resaccreceive.data.AR.payCond !== 'outstanding' ||
								resaccreceive.data.AR.payDate !== null) {
								this.isOpenDatePayCond = false
								this.isOpenPayCond = false
								this.checked.control.setValue(resaccreceive.data.AR.payCond)
								this.checked.date.control.setValue(resaccreceive.data.AR.payDate)
							}
							this.selectWriteOff = true
							this.isCheckAmoutWO = false
						}
						else {
							if (resaccreceive.data.AR.payCond !== 'outstanding' && resaccreceive.data.AR.payDate !== undefined) {
								this.isOpenDatePayCond = false
								this.isOpenPayCond = false
								this.checked.control.setValue(resaccreceive.data.AR.payCond)
								this.checked.date.control.setValue(resaccreceive.data.AR.payDate)
							}
						}

						this.oldAr = Object.assign({}, this.ar);
						this.initAr();

						this.viewArResult.disable();
						this.viewArResult.setValue(
							`${resaccreceive.data.AR.depositTo.acctName.toLocaleLowerCase()}`
						);
						this._filterCashbankList(
							`${resaccreceive.data.AR.depositTo.acctName.toLocaleLowerCase()}`
						);
						this._filterGLList(
							`${resaccreceive.data.AR.glaccount.acctName.toLocaleLowerCase()}`
						);
						this.initAr();
					})

				}
			}
		);
		this.subscriptions.push(routeSubscription);
	}

	valueChecked(choose) {
		for (let i = 1; i <= 30; i++) {
			let valIsDeb
			if (this.ar.AR.multiGLAccount[`isDebit${i}`] != undefined) valIsDeb = this.ar.AR.multiGLAccount[`isDebit${i}`];
			else valIsDeb = true

			if (choose == ('deb' + i)) return valIsDeb;
			else if (choose == ('cred' + i)) return !valIsDeb
		}
	}

	initAr() {
		console.log(this.ar, "ar data")
		this.createForm();
		this.loadCOACashBank();
		this.loadGLAccountAR(null);
		this.loadHistory()
		this.loadUnit(null)
		this.loadVoucher(null)
	}

	printOptions = [
		{ value: "A5", name: "A5" },
		{ value: "A4", name: "A4" },
	];

	addCC(e) {
		const controls = this.arForm.controls;
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

	addCCEmpty() {
		this.isSelectVoucher = false
		this.isTransSetOff = false
		this.ccList.push({
			id: '',
			refCc: '',
			name: ''
		});
		this.totalField = this.totalField += 1

		this.table.renderRows();

	}

	_setVoucherBillValue(value) {
		this.arForm.patchValue({ voucherno: value.billing_number });
	}

	removeCC(i: number) {
		const controls = this.arForm.controls;
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
		const controls = this.arForm.controls;
		for (let i = 1; i <= 30; i++) {
			if (target == ('target' + i)) {
				controls.multiGLAccount.get(('glAcc' + i)).setValue(`${value.acctNo} - ${value.acctName}`)
				controls.multiGLAccount.get(('glAccountId' + i)).setValue(value._id)
			}
		}
	}

	_setVoucherValue(value) {
		const controls = this.arForm.controls;
		this.isSelectVoucher = false
	}

	clickToggle(e) {
		const controls = this.arForm.controls;
		// for (let i = 1; i <= 30; i++) {
		// 	if (e.target.name == i) controls.multiGLAccount.get(('amount' + i)).setValue(null)
		// }
		this.cd.markForCheck()
	}

	valueIsDebit(e) {
		const controls = this.arForm.controls;
		for (let i = 1; i <= 30; i++) {
			let value = e.target.value == "true" ? true : false
			if (e.target.name == i) controls.multiGLAccount.get(('isDebit' + i)).setValue(value)
		}
		this.cd.markForCheck()
	}

	createForm() {
		let objFormMultiGl = {}
		for (let i = 1; i <= 30; i++) {
			let glid, glacc, memo, amount, isDebit;
			if (this.ar.multiGLID[`glId${i}`] !== undefined) glid = this.ar.multiGLID[`glId${i}`]._id;
			if (this.ar.multiGLID[`glId${i}`] !== undefined) glacc = this.ar.multiGLID[`glId${i}`].acctName;
			if (this.ar.AR.multiGLAccount[`memo${i}`] !== undefined) memo = this.ar.AR.multiGLAccount[`memo${i}`];
			if (this.ar.AR.multiGLAccount[`amount${i}`] !== undefined) amount = this.serviceFormat.rupiahFormatImprovement(this.ar.AR.multiGLAccount[`amount${i}`] == null ? "" : this.ar.AR.multiGLAccount[`amount${i}`]);
			if (this.ar.AR.multiGLAccount[`isDebit${i}`] !== undefined) isDebit = this.ar.AR.multiGLAccount[`isDebit${i}`];

			objFormMultiGl[`glAccountId${i}`] = [{ value: glid, disabled: true }];
			objFormMultiGl[`glAcc${i}`] = [{ value: glacc, disabled: true }];
			objFormMultiGl[`memo${i}`] = [{ value: memo, disabled: true }];
			objFormMultiGl[`amount${i}`] = [{ value: amount, disabled: true }];
			objFormMultiGl[`isDebit${i}`] = [{ value: isDebit, disabled: true }];

		}

		this.arForm = this.arFB.group({
			depositTo: [this.ar.AR.depositTo == undefined ? "" : this.ar.AR.depositTo._id],
			voucherno: [this.ar.AR.voucherno],
			rate: [this.ar.AR.rate],
			date: [{ value: this.ar.AR.date, disabled: true }],

			payFrom: [this.ar.AR.payFrom],
			createdBy: [this.ar.AR.createdBy],
			crtdate: [this.ar.AR.crtdate],
			status: [this.ar.AR.status],
			printSize: [this.ar.AR.printSize],

			payCond: [this.ar.AR.payCond == undefined ? "" : this.ar.AR.payCond],
			payDate: [this.ar.AR.payDate == undefined ? "" : this.ar.AR.payDate],
			payAmount: [this.ar.AR.paidAmount == undefined ? "" : this.serviceFormat.rupiahFormatImprovement(this.ar.AR.paidAmount)],
			underPayment: [this.ar.AR.underPayment == undefined ? "" : this.serviceFormat.rupiahFormatImprovement(this.ar.AR.underPayment)],
			unit: [this.ar.AR.unit],
			unit2: [this.ar.AR.unit2],
			isJournal: [{ value: this.ar.AR.isJournal, disabled: true }],

			multiGLAccount: this.arFB.group(objFormMultiGl),
		})
	}


	async loadUnit(text: string) {
		this.selection.clear();
		const queryParams = new QueryUnitModel(
			text,
			"asc",
			null,
			1,
			1000
		);

		this.uservice.getDataUnitForSearchUnit(queryParams).subscribe(
			res => {
				this.unitResult = res.data;
				this.loadingForm = false
				document.body.style.height = "101%"
				window.scrollTo(0, 1);
				document.body.style.height = ""
				this.UnitResultFiltered = this.unitResult.slice();
				this.cd.markForCheck();
				// this.viewBlockResult.enable();
				this.loadingData.unit = false;
			}
		);
	}



	async loadVoucher(text: string) {
		this.selection.clear();
		const queryParams = new QueryUnitModel(
			text,
			"asc",
			null,
			1,
			1000
		);

		this.service.getVoucherBill(queryParams).subscribe(
			res => {
				this.voucherResult = res.data;
				this.loadingForm = false
				document.body.style.height = "101%"
				window.scrollTo(0, 1);
				document.body.style.height = ""

				this.VoucherResultFiltered = this.voucherResult.slice();
				this.cd.markForCheck();
			}
		);
	}

	onSelectJournal(value) {
		const controls = this.arForm.controls;
		if (value == "so") {
			this.isSetOffSaldo = true
			this.isSelectUnit = false
			this.isCheckAmoutWO = true
			controls.payAmount.setValue("")
			controls.underPayment.setValue("")
		} else if (value == "wo") {
			this.isSetOffSaldo = false
			this.isSelectUnit = true
			this.isCheckAmoutWO = false
			this.viewBlockResult.setValue("");
			controls.unit.setValue("")
			controls.unit2.setValue("")
		} else if (value == "ar") {
			this.isSetOffSaldo = false
			this.isSelectUnit = true
			this.isCheckAmoutWO = true
			controls.payAmount.setValue("")
			controls.underPayment.setValue("")
		}
	}

	changeStatus() {
		const controls = this.arForm.controls;
		if (this.isStatus == true) {
			this.isOpenPayCond = false
			controls.status.setValue(true);
		} else {
			this.checked.control.setValue("")
			this.checked.date.control.setValue("")
			this.isOpenPayCond = true
			this.isOpenDatePayCond = true
			controls.status.setValue(false);
		}

	}

	voucherDateHandler(e) {
		const controls = this.arForm.controls;
		controls.payDate.setValue(this.checked.date.control.value)
	}

	valuePayCond(e) {
		const controls = this.arForm.controls;
		this.isOpenDatePayCond = false
		controls.payCond.setValue(e)
	}

	_setBlockValue(value) {
		this.arForm.patchValue({ unit: value._id });
		this.arForm.patchValue({ unit2: value.cdunt });
	}

	/**
	 * @param value
	 */
	_setArValue(value) {
		this.arForm.patchValue({ depositTo: value._id });
	}

	_onKeyup(e: any) {
		this.arForm.patchValue({ depositTo: undefined });
		this._filterCashbankList(e.target.value);
	}

	_onKeyupUnit(e: any) {
		this.arForm.patchValue({ unit2: undefined });
		this._filterCstmrList(e.target.value);
	}

	_onKeyupVoucherNo(e: any) {
		this.arForm.patchValue({ voucherno: e.target.value });
		this._filterVoucherList(e.target.value);
	}

	_filterVoucherList(text: string) {
		this.loadVoucher(text)
	}


	_filterCstmrList(text: string) {
		this.loadUnit(text)
	}


	_filterCashbankList(text: string) {
		this.arListResultFiltered = this.arResult.filter((i) => {
			const filterText = `${i.acctNo.toLocaleLowerCase()}`;
			if (filterText.includes(text.toLocaleLowerCase())) return i;
		});
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
		let controls = this.arForm.controls;
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

		if (id == 'payAmountWO') {
			controls.payAmount.setValue(rupiah)

			const paidAmount = this.serviceFormat.formatFloat(rupiah == "" ? 0 : rupiah)

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
				controls.underPayment.setValue(this.serviceFormat.rupiahFormatImprovement(totalAllDebit - paidAmount))
			}

			return rupiah
		} else if (id == 'payUnderWO') {
			controls.underPayment.setValue(rupiah)
			return rupiah
		}

		controls.multiGLAccount.get(`amount${id}`).setValue(rupiah);
		return rupiah
	}



	loadCOACashBank() {
		this.selection.clear();
		const queryParams = new QueryParamsModel(null, "asc", null, 1, 10000);
		this.COAService.getListCashBank(queryParams).subscribe((res) => {
			this.arResult = res.data;
			this.arListResultFiltered = this.arResult.slice();
			this.viewArResult.enable();
			this.cd.markForCheck();
			this.loading.deposit = false;
		});
	}

	/**
	 * @param value
	 */
	_setGlValue(value) {
		this.arForm.patchValue({ glaccount: value._id });
	}

	_onKeyupGL(e: any) {
		this._filterGLList(e.target.value);
	}

	_filterGLList(text: string) {
		this.loadGLAccountAR(text)
	}

	loadGLAccountAR(text) {
		this.loading.glaccount = true;
		this.selection.clear();
		// const queryParams = new QueryParamsModel(null, "asc", null, 1, 1000);
		const queryParams = new QueryParamsModel(text, "asc", null, 1, 1000);

		this.COAService.getListGLAccountAR(queryParams).subscribe((res) => {
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

	loadHistory() {
		this.service.listHistoryAR(this.ar.AR._id).subscribe((res) => {
			this.listHistoryAR = res.data
		});
	}


	_getStatusClass(status) {

		if (status.payCond == "parsial-kurang") return 'chip chip--parsial-kurang-so';
		else if (status.payCond == "parsial-lebih") return 'chip chip--parsial-lebih-so';
		else if (status.payCond == "full-payment") return 'chip chip--full-payment-so';
		else if (status.payCond == "outstanding") return 'chip chip--danger';
	}

	goBackWithId() {
		const url = `/ar`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}

	refreshAr(isNew: boolean = false, id: string = "") {
		let url = this.router.url;
		if (!isNew) {
			this.router.navigate([url], { relativeTo: this.activatedRoute });
			return;
		}

		url = `/ar/edit/${id}`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}

	onSubmit(withBack: boolean = false) {
		const controls = this.arForm.controls;

		const statusPaid = controls.status.value;
		const payCond = controls.payCond.value
		const payDate = controls.payDate.value
		const message = `Input your payment or payment date`;
		const messageWO = `Input your paid payment and under payment`;
		const payAmount = controls.payAmount.value
		const underPayment = controls.underPayment.value

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

		if (this.isCheckAmoutWO) {
			console.log("validate");
		} else {
			if (
				payAmount == "" || underPayment == "" ||
				payAmount == 0 || underPayment == 0
			) {
				this.layoutUtilsService.showActionNotification(
					messageWO,
					MessageType.Create,
					5000,
					true,
					true
				);
				return
			}
		}

		if (this.isSelectUnit == false) {
			if (controls.unit.value == "") {
				this.layoutUtilsService.showActionNotification(
					"Select unit SO",
					MessageType.Create,
					5000,
					true,
					true
				);
				return
			}
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
		}

		this.loading.submit = true;
		this.hasFormErrors = false;
		if (this.arForm.invalid) {
			Object.keys(controls).forEach((controlName) =>
				controls[controlName].markAsTouched()
			);
			this.loading.submit = false;
			this.hasFormErrors = true;
			this.selectedTab = 0;
			return;
		}

		const editedAr = this.prepareAr();
		this.updateAr(editedAr, withBack);
	}

	prepareAr(): ArModel {
		const controls = this.arForm.controls;
		const _ar = new ArModel();

		let objRes = {}
		for (let i = 2; i <= 30; i++) {
			const a = controls.multiGLAccount.get(`amount${i}`).value
			let rupiah = controls.multiGLAccount.get(`amount${i}`).value == undefined || controls.multiGLAccount.get(`amount${i}`).value == null ? "" : a.replace(/[\.]+/g, "").replace(/[\,]+/g, ".");
			let rupiahNum = rupiah

			objRes[`glAcc${i}`] = controls.multiGLAccount.get(`glAccountId${i}`).value;
			objRes[`memo${i}`] = controls.multiGLAccount.get(`memo${i}`).value == null ? undefined : controls.multiGLAccount.get(`memo${i}`).value;
			objRes[`amount${i}`] = controls.multiGLAccount.get(`amount${i}`).value == "" || controls.multiGLAccount.get(`amount${i}`).value == undefined || controls.multiGLAccount.get(`amount${i}`).value == null ? undefined : parseFloat(rupiahNum);
			objRes[`isDebit${i}`] = controls.multiGLAccount.get(`amount${i}`).value == "" || controls.multiGLAccount.get(`isDebit${i}`).value == null ? undefined : controls.multiGLAccount.get(`isDebit${i}`).value
		}

		_ar.clear();
		_ar._id = this.ar.AR._id;
		_ar.depositTo = controls.depositTo.value;
		_ar.voucherno = controls.voucherno.value;
		_ar.date = controls.date.value;
		_ar.rate = controls.rate.value;
		_ar.createdBy = controls.createdBy.value;
		_ar.crtdate = controls.crtdate.value;
		// _ar.status = controls.status.value;
		_ar.printSize = controls.printSize.value;
		_ar.payFrom = controls.payFrom.value;
		_ar.unit = controls.unit.value == "" ? undefined : controls.unit.value;
		_ar.unit2 = controls.unit2.value == "" ? undefined : controls.unit2.value
		_ar.totalField = this.totalField

		const a = controls.multiGLAccount.get('amount1').value;

		// const amount1 = a.replace(/\./g, "");
		let rupiah = controls.multiGLAccount.get(`amount1`).value == undefined || controls.multiGLAccount.get(`amount1`).value == null ? "" : a.replace(/[\.]+/g, "").replace(/[\,]+/g, ".");
		let rupiahNum = rupiah

		_ar.glaccount = controls.multiGLAccount.get('glAccountId1').value
		_ar.memo = controls.multiGLAccount.get('memo1').value
		_ar.amount = controls.multiGLAccount.get(`amount1`).value == "" || controls.multiGLAccount.get(`amount1`).value == undefined ? undefined : parseFloat(rupiahNum)
		_ar.isDebit = controls.multiGLAccount.get(`amount1`).value == "" ? undefined : controls.multiGLAccount.get(`isDebit1`).value


		_ar.multiGLAccount = objRes == {} ? undefined : objRes

		// Payment Condtion Start
		const valPayCond = controls.payCond.value
		const valPayDate = controls.payDate.value
		const valPaidStatus = controls.status.value
		const isJournal = controls.isJournal.value
		const payCondValue = valPaidStatus == false ? "outstanding" : valPayCond == "" ? undefined : valPayCond
		const payDateValue = valPaidStatus == false ? "" : valPayDate == "" ? "" : valPayDate

		_ar.status = valPaidStatus
		_ar.isJournal = isJournal
		_ar.payCond = this.isSetOffSaldo ? "saldo" : payCondValue
		_ar.statusJournal = this.isSetOffSaldo ? "saldo" : ""
		_ar.payDate = payDateValue

		// Payment Condtion End
		// WRITE OFF
		const woPayment = controls.payAmount.value
		const woUnder = controls.underPayment.value

		_ar.paidAmount = controls.payAmount.value == "" ? "" : this.serviceFormat.formatFloat(woPayment)
		_ar.underPayment = controls.underPayment.value == "" ? "" : this.serviceFormat.formatFloat(woUnder)


		return _ar;
	}

	updateAr(_ar: ArModel, withBack: boolean = false) {
		if (this.totalField > 20) {
			const message = `Total Field Maks 20 field`;
			this.layoutUtilsService.showActionNotification(
				message,
				MessageType.Create,
				5000,
				true,
				true)

			return
		}
		const addSubscription = this.service.updateAr(_ar).subscribe(
			(res) => {
				this.loading.submit = false;
				const message = `Account Receive successfully has been saved.`;
				this.layoutUtilsService.showActionNotification(
					message,
					MessageType.Update,
					5000,
					true,
					true
				);
				const url = `/ar`;
				this.router.navigateByUrl(url, {
					relativeTo: this.activatedRoute,
				});
			},
			(err) => {
				console.error(err);
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
		let result = `Edit Account Receive`;
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
	balancedValidation() {
		const controls = this.arForm.controls
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
		const controls = this.arForm.controls
		let list = []
		for (let i = 1; i <= this.totalField; i++) {
			let gl = controls.multiGLAccount.get(`glAccountId${i}`).value
			list.push(gl != undefined)
		}
		this.invalid = list.some(item => item == false)
	}
}
