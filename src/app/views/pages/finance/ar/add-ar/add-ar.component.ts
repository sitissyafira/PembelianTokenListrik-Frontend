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
import { selectArActionLoading } from "../../../../../core/finance/ar/ar.selector";
import { ArService } from "../../../../../core/finance/ar/ar.service";
import { SelectionModel } from "@angular/cdk/collections";
import { AccountGroupService } from "../../../../../core/accountGroup/accountGroup.service";
import { MatTable } from "@angular/material";
import { UnitService } from '../../../../../core/unit/unit.service';
import { QueryUnitModel } from '../../../../../core/unit/queryunit.model';
import { ServiceFormat } from "../../../../../core/serviceFormat/format.service";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { MatDialog } from '@angular/material';
import { ConfirmationDialog } from "../../../../partials/module/confirmation-popup/confirmation.dialog.component";
import { SavingDialog } from "../../../../partials/module/saving-confirm/confirmation.dialog.component";
@Component({
	selector: "kt-add-ar",
	templateUrl: "./add-ar.component.html",
	styleUrls: ["./add-ar.component.scss"],
})
export class AddArComponent implements OnInit, OnDestroy {
	ar: ArModel;
	ArId$: Observable<string>;
	oldAr: ArModel;
	selectedTab = 0;
	loading$: Observable<boolean>;
	selection = new SelectionModel<ArModel>(true, []);
	arResult: any[] = [];
	glResult: any[] = [];
	accountReceive: any[] = [];
	arForm: FormGroup;
	date1 = new FormControl(new Date());
	hasFormErrors = false;
	isStatus: boolean = false;

	isSelectVoucher: boolean = true;
	isTransSetOff: boolean = true;
	isOpenPayCond: boolean = true;
	isOpenDatePayCond: boolean = true;
	isSelectUnit: boolean = true;

	checkSubmit: boolean = false;
	viewBlockResult = new FormControl();
	viewVoucherResult = new FormControl();

	checkIsWO: boolean = false /** Check apakah journal yang dipilih adalah WO */

	loadingData = {
		unit: false,
		voucher: false
	};

	isCheckAmoutWO: boolean = true
	UnitResultFiltered = [];
	VoucherResultFiltered = [];

	isGenerateBilling: string = "" /* To determine the condition of the generating billing process in progress */
	msgErrorGenerate: string = "" /* To display message error proccessing generate */


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

	isSetOffSaldo: boolean = false



	@ViewChild('myTable', { static: false }) table: MatTable<any>;
	displayedColumns = ['no', 'gl', 'amount', 'desc', 'isdebit', 'action'];


	arListResultFiltered = [];
	viewArResult = new FormControl();
	unitResult: any[] = [];
	voucherResult: any[] = [];
	loadingForm: boolean;


	balanced: boolean = false
	invalid: boolean = false
	totalField: number = 0

	gLListResultFiltered = [];
	viewGlResult = new FormControl();
	viewGlResult2 = new FormControl();

	private subscriptions: Subscription[] = [];
	loading = {
		deposit: false,
		submit: false,
		glaccount: false,
	};
	constructor(
		private activatedRoute: ActivatedRoute,
		private serviceFormat: ServiceFormat,
		private router: Router,
		private arFB: FormBuilder,
		private subheaderService: SubheaderService,
		private layoutUtilsService: LayoutUtilsService,
		private store: Store<AppState>,
		private service: ArService,
		private COAService: AccountGroupService,
		private layoutConfigService: LayoutConfigService,
		private cd: ChangeDetectorRef,
		private uservice: UnitService,
		private modalService: NgbModal,
		private dialog: MatDialog,

	) { }

	ngOnInit() {
		this.loading$ = this.store.pipe(select(selectArActionLoading));
		this.ar = new ArModel();
		this.ar.clear();
		this.initAr();
	}

	initAr() {
		this.createForm();
		this.loadCOACashBank();
		this.loadGLAccountAR(null);
		this.loadUnit(null)
		this.loadVoucher(null)
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

		this.arForm = this.arFB.group({
			depositTo: ["", Validators.required],
			voucherno: ["", Validators.required],
			rate: [{ value: "IDR", disabled: false }], //number
			glaccount: [""],
			payFrom: [{ value: "", disabled: false }, Validators.required],
			date: [this.date1.value, Validators.required], // number
			createdBy: [this.ar.createdBy], // number
			crtdate: [{ value: this.date1.value, disabled: true }], // number
			status: [this.ar.status],
			printSize: [this.ar.printSize],
			payCond: [""],
			payDate: [""],
			payAmount: [""],
			underPayment: [""],
			unit: [""],
			unit2: [""],
			isJournal: [""],

			multiGLAccount: this.arFB.group(objFormMultiGl),
		});
	}

	ccList = [];

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
				this.viewBlockResult.enable();
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

		this.table.renderRows();

	}



	_filterCstmrList(text: string) {
		this.loadUnit(text)
	}
	_filterVoucherList(text: string) {
		this.loadVoucher(text)
	}


	addCCEmpty() {
		this.checkSubmit = true
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




	removeCC(i: number) {
		const controls = this.arForm.controls;
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
		const controls = this.arForm.controls;
		// for (let i = 1; i <= 30; i++) {
		// 	if (e.target.name == i) controls.multiGLAccount.get(('amount' + i)).setValue(null)
		// }
		this.cd.markForCheck()
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

	valueIsDebit(e) {
		const controls = this.arForm.controls;
		for (let i = 1; i <= 30; i++) {
			let value = e.target.value == "true" ? true : false
			if (e.target.name == i) controls.multiGLAccount.get(('isDebit' + i)).setValue(value)
		}
		this.cd.markForCheck()
	}

	onSelectJournal(value) {
		const controls = this.arForm.controls;
		if (value == "so") {
			this.checkIsWO = false
			this.isSetOffSaldo = true
			this.isSelectUnit = false
			this.isCheckAmoutWO = true
			controls.payAmount.setValue("")
			controls.underPayment.setValue("")
		} else if (value == "wo") {
			this.checkIsWO = true
			this.isSetOffSaldo = false
			this.isSelectUnit = true
			this.isCheckAmoutWO = false
			this.viewBlockResult.setValue("");
			controls.unit.setValue("")
			controls.unit2.setValue("")
		} else if (value == "ar") {
			this.checkIsWO = false
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
			this.checked.control.setValue(undefined)
			this.checked.date.control.setValue(undefined)
			this.isOpenPayCond = true
			this.isOpenDatePayCond = true
			controls.status.setValue(false);
		}
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

	_filterCashbankList(text: string) {
		this.arListResultFiltered = this.arResult.filter((i) => {
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
			console.log(res)
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

	_setGLAccount(value, target) {
		const controls = this.arForm.controls;
		for (let i = 1; i <= 30; i++) {
			if (target == ('target' + i)) {
				controls.multiGLAccount.get(('glAcc' + i)).setValue(`${value.acctNo} - ${value.acctName}`)
				controls.multiGLAccount.get(('glAccountId' + i)).setValue(value._id)
			}
		}
	}

	_setBlockValue(value) {
		this.arForm.patchValue({ unit: value._id });
		this.arForm.patchValue({ unit2: value.cdunt });
	}


	_setVoucherBillValue(value) {
		this.arForm.patchValue({ voucherno: value.billing_number });
	}

	_onKeyupGL(e: any) {
		this.arForm.patchValue({ glaccount: undefined });
		this._filterGLList(e.target.value);
	}

	_filterGLList(text: string) {
		this.arListResultFiltered = this.arResult.filter((i) => {
			const filterText = `${i.acctNo.toLocaleLowerCase()} - ${i.acctName.toLocaleLowerCase()}`;
			if (filterText.includes(text.toLocaleLowerCase())) return i;
		});
		this.loadGLAccountAR(text)
	}

	loadGLAccountAR(text) {
		this.loading.glaccount = true;
		this.selection.clear();
		// const queryParams = new QueryParamsModel(null, "asc", null, 1, 10);
		const queryParams = new QueryParamsModel(text, "asc", null, 1, 10);

		this.COAService.getListGLAccountAR(queryParams).subscribe((res) => {
			const data = [];
			res.data.map((item) => {
				item.map((item2) => {
					data.push(item2);
				});
			});
			this.gLListResultFiltered = data.slice();
			this.viewGlResult.enable();
			this.viewGlResult2.enable();
			this.cd.markForCheck();
			this.loading.deposit = false;

			this.glResult = data;
			this.loading.glaccount = false;
			this.cd.markForCheck();
		});
	}

	_setVoucherValue(value) {
		const controls = this.arForm.controls;
		this.isSelectVoucher = false
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
		const messageSubmit = `Input your GL Account`;

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

		if (!this.checkSubmit) {
			this.layoutUtilsService.showActionNotification(
				messageSubmit,
				MessageType.Create,
				5000,
				true,
				true
			);
			return
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

		if (this.isCheckAmoutWO) {
			console.log("validate");
		} else {
			if (payAmount == "" || underPayment == "") {
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
				this.loading.submit = true;
				const editedAr = this.prepareAr();
				this.addAr(editedAr, withBack);
			} else {
				return;
			}
		});

	}

	prepareAr(): ArModel {
		const controls = this.arForm.controls;
		const _ar = new ArModel();

		let objRes = {}
		for (let i = 2; i <= 30; i++) {
			const a = controls.multiGLAccount.get(`amount${i}`).value
			let rupiah = a.replace(/[\.]+/g, "").replace(/[\,]+/g, ".");
			let rupiahNum = rupiah
			objRes[`glAcc${i}`] = controls.multiGLAccount.get(`glAccountId${i}`).value;
			objRes[`memo${i}`] = controls.multiGLAccount.get(`memo${i}`).value;
			objRes[`amount${i}`] = controls.multiGLAccount.get(`amount${i}`).value == "" ? undefined : parseFloat(rupiahNum);
			objRes[`isDebit${i}`] = controls.multiGLAccount.get(`amount${i}`).value == "" ? undefined : controls.multiGLAccount.get(`isDebit${i}`).value
		}

		_ar.clear();
		_ar._id = this.ar._id;
		_ar.depositTo = controls.depositTo.value;
		_ar.voucherno = controls.voucherno.value;
		_ar.rate = controls.rate.value;
		_ar.date = controls.date.value;
		_ar.createdBy = controls.createdBy.value;
		_ar.crtdate = controls.crtdate.value;
		_ar.payFrom = controls.payFrom.value;
		_ar.printSize = controls.printSize.value;
		_ar.unit = controls.unit.value == "" ? undefined : controls.unit.value;
		_ar.unit2 = controls.unit2.value == "" ? undefined : controls.unit2.value
		_ar.totalField = this.totalField



		const a = controls.multiGLAccount.get('amount1').value;
		// const amount1 = a.replace(/\./g, "");
		let rupiah = a.replace(/[\.]+/g, "").replace(/[\,]+/g, ".");
		let rupiahNum = rupiah

		_ar.glaccount = controls.multiGLAccount.get('glAccountId1').value
		_ar.amount = controls.multiGLAccount.get('amount1').value == "" ? undefined : parseFloat(rupiahNum)
		_ar.memo = controls.multiGLAccount.get('memo1').value
		_ar.isDebit = controls.multiGLAccount.get('amount1').value == "" ? undefined : controls.multiGLAccount.get('isDebit1').value

		_ar.multiGLAccount = objRes

		// Payment Condtion Start
		const valPayCond = controls.payCond.value
		const valPayDate = controls.payDate.value
		const valPaidStatus = controls.status.value
		const isJournal = controls.isJournal.value
		const payCondValue = valPaidStatus == false ? "outstanding" : valPayCond == "" ? undefined : valPayCond
		const payDateValue = valPayDate == "" ? undefined : valPayDate

		_ar.status = valPaidStatus
		_ar.isJournal = isJournal
		_ar.payCond = this.isSetOffSaldo ? "saldo" : payCondValue
		_ar.payDate = payDateValue
		_ar.statusJournal = this.isSetOffSaldo ? "saldo" : undefined

		// Payment Condtion End
		// WRITE OFF
		const woPayment = controls.payAmount.value
		const woUnder = controls.underPayment.value

		_ar.paidAmount = controls.payAmount.value == "" ? undefined : this.serviceFormat.formatFloat(woPayment)
		_ar.underPayment = controls.underPayment.value == "" ? undefined : this.serviceFormat.formatFloat(woUnder)

		return _ar;
	}

	addAr(_ar: ArModel, withBack: boolean = false) {
		// Condition Total Field
		if (this.totalField > 10) {
			const message = `Total Field Maks 10 field`;
			this.layoutUtilsService.showActionNotification(
				message,
				MessageType.Create,
				5000,
				true,
				true)

			return
		}

		this.processSaving()
		const addSubscription = this.service.createAr(_ar).subscribe(
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
				const url = `/ar`;
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

	getComponentTitle() {
		let result = "Create Account Receive";
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

	/**
	 * Load AR Process Saving.
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
