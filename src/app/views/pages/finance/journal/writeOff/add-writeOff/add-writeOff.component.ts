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
import { WriteOffModel } from "../../../../../../core/finance/journal/writeOff/writeOff.model";
import { selectWriteOffActionLoading } from "../../../../../../core/finance/journal/writeOff/writeOff.selector";
import { WriteOffService } from "../../../../../../core/finance/journal/writeOff/writeOff.service";
import { SelectionModel } from "@angular/cdk/collections";
import { AccountGroupService } from "../../../../../../core/accountGroup/accountGroup.service";
import { MatTable } from "@angular/material";
import { ServiceFormat } from "../../../../../../core/serviceFormat/format.service";
import { MatDialog } from "@angular/material"
import { ConfirmationDialog } from "../../../../../partials/module/confirmation-popup/confirmation.dialog.component";
import { SavingDialog } from "../../../../../partials/module/saving-confirm/confirmation.dialog.component";
@Component({
	selector: "kt-add-writeOff",
	templateUrl: "./add-writeOff.component.html",
	styleUrls: ["./add-writeOff.component.scss"],
})
export class AddWriteOffComponent implements OnInit, OnDestroy {
	writeOff: WriteOffModel;
	WriteOffId$: Observable<string>;
	oldWriteOff: WriteOffModel;
	selectedTab = 0;
	loading$: Observable<boolean>;
	selection = new SelectionModel<WriteOffModel>(true, []);
	writeOffResult: any[] = [];
	glResult: any[] = [];
	accountReceive: any[] = [];
	writeOffForm: FormGroup;
	date1 = new FormControl(new Date());
	hasFormErrors = false;
	isStatus: boolean = false;

	checkSubmit: boolean = false


	isGenerateBilling: string = "" /* To determine the condition of the generating billing process in progress */
	msgErrorGenerate: string = "" /* To display message error proccessing generate */


	viewVoucherResult = new FormControl();
	// VoucherResultFiltered = [];
	VoucherResultFiltered = [];
	loadingData = {
		voucher: false
	}

	tagihanBillingData: any = []

	valueIsDebitGL: any



	@ViewChild('myTable', { static: false }) table: MatTable<any>;
	@ViewChild('myTable2', { static: false }) table2: MatTable<any>;
	displayedColumns = ['no', 'gl', 'amount', 'desc', 'isdebit', 'action'];
	displayedColumns2 = ['no2', 'gl2', 'amount2', 'desc2', 'isdebit2', 'action2'];


	writeOffListResultFiltered = [];
	viewWriteOffResult = new FormControl();

	payCondList: any = [
		{
			payment: "Full Payment",
			value: "full-payment",
			empty: ""
		}
	]

	totalField: number = 0
	balanced: boolean = false
	invalid: boolean = false
	isSelectVoucher: boolean = true;
	isOpenPayCond: boolean = true;
	isOpenDatePayCond: boolean = true;
	isTransWriteOff: boolean = true;

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
		private writeOffFB: FormBuilder,
		private subheaderService: SubheaderService,
		private layoutUtilsService: LayoutUtilsService,
		private store: Store<AppState>,
		private service: WriteOffService,
		private COAService: AccountGroupService,
		private layoutConfigService: LayoutConfigService,
		private cd: ChangeDetectorRef,
		private dialog: MatDialog,
	) { }

	ngOnInit() {
		this.loading$ = this.store.pipe(select(selectWriteOffActionLoading));
		this.writeOff = new WriteOffModel();
		this.writeOff.clear();
		this.initWriteOff();
	}

	initWriteOff() {
		this.createForm();
		this.loadCOACashBank();
		this.loadVoucherBill(null);
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

		this.writeOffForm = this.writeOffFB.group({
			depositTo: [""],
			voucherno: [""],
			rate: [{ value: "IDR", disabled: false }], //number
			glaccount: [""],
			payFrom: [{ value: "WRITE OFF JOURNAL", disabled: false }, Validators.required],
			date: [this.date1.value, Validators.required], // number
			createdBy: [this.writeOff.createdBy], // number
			crtdate: [{ value: this.date1.value, disabled: true }], // number
			// statusAR: [""],
			status: [""],
			printSize: [this.writeOff.printSize],
			// saldoVoucher: ["", Validators.required],
			payCond: [""],
			payDate: ["",],
			ARID: [""],

			multiGLAccount: this.writeOffFB.group(objFormMultiGl),
		});
	}

	ccList2 = [];
	ccList = [];
	ifMaksField: boolean = false


	addCC(e) {
		const controls = this.writeOffForm.controls;
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
		const controls = this.writeOffForm.controls;


		this.checkSubmit = true
		this.isTransWriteOff = false

		this.ccList.push({ id: '', refCc: '', name: '' })

		this.totalField = this.totalField += 1

		controls.multiGLAccount.get(('isDebit' + this.totalField)).setValue(true)

		this.table.renderRows();
		// this.table2.renderRows();

	}

	totalFieldClickVoucher: any = 0

	_setVoucherValue(value) {
		this.valueIsDebitGL = value
		this.isTransWriteOff = false

		const controls = this.writeOffForm.controls;
		this.isSelectVoucher = false
		controls.ARID.setValue(value._id)
		controls.voucherno.setValue(value.voucherno)

		if (this.totalFieldClickVoucher > 0) {
			this.ccList.splice(0, this.totalFieldClickVoucher);
			this.table.renderRows();
		}

		this.totalField = value.totalField


		let objFormMultiGl = {}
		for (let i = 1; i <= value.totalField; i++) {
			let glid, glacc, memo, amount, isDebit;
			if (value.dataARWO[`glAcc${i}`] !== undefined) glid = value.dataARWO[`glAcc${i}`];
			if (value.dataARWO[`glAcc${i}`] !== undefined) glacc = (`${value.dataARWO[`acctNo${i}`]} - ${value.dataARWO[`acctName${i}`]}`);
			if (value.dataARWO[`memo${i}`] !== undefined) memo = value.dataARWO[`memo${i}`];
			if (value.dataARWO[`amount${i}`] !== undefined) amount = this.serviceFormat.rupiahFormatImprovement(value.dataARWO[`amount${i}`] == undefined || value.dataARWO[`amount${i}`] == null ? "" : value.dataARWO[`amount${i}`]);
			if (value.dataARWO[`isDebit${i}`] !== undefined) isDebit = value.dataARWO[`isDebit${i}`];

			controls.multiGLAccount.get(`glAccountId${i}`).setValue(glid)
			controls.multiGLAccount.get(`glAcc${i}`).setValue(glacc)
			controls.multiGLAccount.get(`memo${i}`).setValue(memo)
			controls.multiGLAccount.get(`amount${i}`).setValue(amount)
			controls.multiGLAccount.get(`isDebit${i}`).setValue(isDebit)
		}

		this.totalFieldClickVoucher = value.totalField

		for (let i = 0; i < value.totalField; i++) {
			this.ccList.push({ id: '', refCc: '', name: '' })
		}

		this.table.renderRows();

		setTimeout(() => {
			this.valueChecked(null)
		}, 100)
	}

	valueChecked(choose) {

		for (let i = 0; i <= this.valueIsDebitGL.totalField; i++) {
			let valIsDeb
			if (this.valueIsDebitGL.dataARWO[`isDebit${i}`] != undefined) valIsDeb = this.valueIsDebitGL.dataARWO[`isDebit${i}`];
			else valIsDeb = true


			if (choose == ('deb' + i)) return valIsDeb;
			else if (choose == ('cred' + i)) return !valIsDeb
		}

	}


	removeCC(i: number) {
		const controls = this.writeOffForm.controls;
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
		const controls = this.writeOffForm.controls;
		// for (let i = 1; i <= 30; i++) {
		// 	if (e.target.name == i) controls.multiGLAccount.get(('amount' + i)).setValue(null)
		// }
		this.cd.markForCheck()
	}

	valueIsDebit(e) {
		const controls = this.writeOffForm.controls;
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
		const controls = this.writeOffForm.controls;
		controls.payDate.setValue(this.checked.date.control.value)
	}

	valuePayCond(e) {
		const controls = this.writeOffForm.controls;
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
	// 	let controls = this.writeOffForm.controls;
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
		let controls = this.writeOffForm.controls;
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
		const controls = this.writeOffForm.controls;
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
	 * @pwriteOffam value
	 */
	_setWriteOffValue(value) {
		this.writeOffForm.patchValue({ depositTo: value._id });
	}

	_onKeyup(e: any) {
		this.writeOffForm.patchValue({ depositTo: undefined });
		this._filterCashbankList(e.target.value);
	}

	_filterCashbankList(text: string) {
		this.writeOffListResultFiltered = this.writeOffResult.filter((i) => {
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
			this.writeOffResult = res.data;
			this.writeOffListResultFiltered = this.writeOffResult.slice();
			this.viewWriteOffResult.enable();
			this.cd.markForCheck();
			this.loading.deposit = false;
		});
	}

	/**
	 * @pwriteOffam value
	 */

	_setGLAccount(value, target) {
		const controls = this.writeOffForm.controls;
		for (let i = 1; i <= 30; i++) {
			if (target == ('target' + i)) {
				controls.multiGLAccount.get(('glAcc' + i)).setValue(`${value.acctNo} - ${value.acctName}`)
				controls.multiGLAccount.get(('glAccountId' + i)).setValue(value._id)
			}
		}
	}

	_onKeyupGL(e: any) {
		this.writeOffForm.patchValue({ glaccount: undefined });
		this._filterGLList(e.target.value);
	}

	_onKeyupGL2(e: any) {
		this.writeOffForm.patchValue({ glaccount: undefined });
		this._filterGLList2(e.target.value);
	}

	_filterGLList2(text: string) {
		this.loadGLAccountJA2(text)
	}
	_onKeyupVoucher(e: any) {
		this.writeOffForm.patchValue({ glaccount: undefined });
		this._filterGLListVoucher(e.target.value);


	}

	_filterGLListVoucher(text: string) {
		this.loadVoucherBill(text)
	}

	_filterGLList(text: string) {
		this.writeOffListResultFiltered = this.writeOffResult.filter((i) => {
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
		this.COAService.getListGLAccountAR(queryParams).subscribe((res) => {
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
		});
	}

	detailTagihanBill(voucherNo) {
		const queryParams = new QueryParamsModel(voucherNo, "asc", null, 1, 10);
		this.service.getDetailTagihanBill(queryParams).subscribe((res) => {
			this.tagihanBillingData = res.data
			this.cd.markForCheck()
		});
	}

	goBackWithId() {
		const url = `/writeOff`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}

	refreshWriteOff(isNew: boolean = false, id: string = "") {
		let url = this.router.url;
		if (!isNew) {
			this.router.navigate([url], { relativeTo: this.activatedRoute });
			return;
		}
		url = `/writeOff/edit/${id}`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}


	onSubmit(withBack: boolean = false) {
		const controls = this.writeOffForm.controls;
		const statusPaid = controls.status.value;
		const payCond = controls.payCond.value
		const payDate = controls.payDate.value
		const message = `Input your payment or payment date`;
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
		// if (!this.checkSubmit) {
		// 	this.layoutUtilsService.showActionNotification(
		// 		messageSubmit,
		// 		MessageType.Create,
		// 		5000,
		// 		true,
		// 		true
		// 	);
		// 	return
		// }


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
				"Click paid your transaction Write Off",
				MessageType.Create,
				5000,
				true,
				true
			);
			return
		}


		this.loading.submit = true;
		this.hasFormErrors = false;
		if (this.writeOffForm.invalid) {
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
				const editedWriteOff = this.prepwriteOffeWriteOff();
				this.addWriteOff(editedWriteOff, withBack);
			} else {
				return;
			}
		});
	}

	prepwriteOffeWriteOff(): WriteOffModel {
		const controls = this.writeOffForm.controls;
		const _writeOff = new WriteOffModel();


		let objRes = {}
		for (let i = 2; i <= 30; i++) {
			const a = controls.multiGLAccount.get(`amount${i}`).value
			const amountLoop = controls.multiGLAccount.get(`amount${i}`).value == undefined || controls.multiGLAccount.get(`amount${i}`).value == null ? "" : a.replace(/[\.]+/g, "").replace(/[\,]+/g, ".");

			objRes[`glAcc${i}`] = controls.multiGLAccount.get(`glAccountId${i}`).value;
			objRes[`memo${i}`] = controls.multiGLAccount.get(`memo${i}`).value;
			objRes[`amount${i}`] = controls.multiGLAccount.get(`amount${i}`).value == "" ? undefined : this.serviceFormat.formatFloat(amountLoop)
			objRes[`isDebit${i}`] = controls.multiGLAccount.get(`amount${i}`).value == "" ? undefined : controls.multiGLAccount.get(`isDebit${i}`).value
		}

		_writeOff.clear();
		_writeOff._id = this.writeOff._id;
		_writeOff.depositTo = controls.depositTo.value == "" ? undefined : controls.depositTo.value;
		_writeOff.voucherno = controls.voucherno.value;
		_writeOff.rate = controls.rate.value;
		_writeOff.date = controls.date.value;
		_writeOff.createdBy = controls.createdBy.value;
		_writeOff.crtdate = controls.crtdate.value;
		_writeOff.payFrom = controls.payFrom.value;
		_writeOff.printSize = controls.printSize.value;
		_writeOff.totalField = this.totalField

		// _writeOff.statusAR = controls.statusAR.value == "" ? false :  controls.statusAR.value;
		_writeOff.status = controls.status.value == "" ? false : controls.status.value;
		_writeOff.payCond = controls.status.value == false ? "outstanding" : controls.payCond.value == "" ? undefined : controls.payCond.value;
		_writeOff.payDate = controls.payDate.value == "" ? undefined : controls.payDate.value;
		_writeOff.ARID = controls.ARID.value;

		const a = controls.multiGLAccount.get('amount1').value;
		const amount1 = controls.multiGLAccount.get(`amount1`).value == undefined || controls.multiGLAccount.get(`amount1`).value == null ? "" : a.replace(/[\.]+/g, "").replace(/[\,]+/g, ".");

		_writeOff.glaccount = controls.multiGLAccount.get('glAccountId1').value
		_writeOff.amount = controls.multiGLAccount.get('amount1').value == "" ? undefined : this.serviceFormat.formatFloat(amount1)
		_writeOff.memo = controls.multiGLAccount.get('memo1').value
		_writeOff.isDebit = controls.multiGLAccount.get('amount1').value == "" ? undefined : controls.multiGLAccount.get('isDebit1').value

		_writeOff.multiGLAccount = objRes

		return _writeOff;
	}

	addWriteOff(_writeOff: WriteOffModel, withBack: boolean = false) {
		this.processSaving()
		const addSubscription = this.service.createWriteOff(_writeOff).subscribe(
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
				const url = `/writeOff`;
				this.router.navigateByUrl(url, {
					relativeTo: this.activatedRoute,
				});
			},
			(err) => {
				this.dialog.closeAll()

				console.error(err);
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
		let result = "Create Journal Write Off";
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
		const controls = this.writeOffForm.controls
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
		const controls = this.writeOffForm.controls
		let list = []
		for (let i = 1; i <= this.totalField; i++) {
			let gl = controls.multiGLAccount.get(`glAccountId${i}`).value
			list.push(gl != undefined)
		}
		this.invalid = list.some(item => item == false)
	}

	/**
* Load WO Process Saving.
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
