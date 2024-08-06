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
import { WriteOffModel } from "../../../../../../core/finance/journal/writeOff/writeOff.model";
import {
	selectWriteOffActionLoading,
	selectWriteOffById,
} from "../../../../../../core/finance/journal/writeOff/writeOff.selector";
import { WriteOffService } from "../../../../../../core/finance/journal/writeOff/writeOff.service";
import { SelectionModel } from "@angular/cdk/collections";
import { AccountGroupService } from "../../../../../../core/accountGroup/accountGroup.service";
import { MatDialog, MatTable } from "@angular/material";
import { ServiceFormat } from "../../../../../../core/serviceFormat/format.service";
import { SavingDialog } from "../../../../../partials/module/saving-confirm/confirmation.dialog.component";
@Component({
	selector: "kt-edit-writeOff",
	templateUrl: "./edit-writeOff.component.html",
	styleUrls: ["./edit-writeOff.component.scss"],
})
export class EditWriteOffComponent implements OnInit, OnDestroy {
	writeOff: WriteOffModel;
	WriteOffId$: Observable<string>;
	oldWriteOff: WriteOffModel;
	selectedTab = 0;
	loading$: Observable<boolean>;
	selection = new SelectionModel<WriteOffModel>(true, []);
	writeOffResult: any[] = [];
	glResult: any[] = [];
	writeOffForm: FormGroup;
	date1 = new FormControl(new Date());
	hasFormErrors = false;
	isStatus: boolean = false;
	private subscriptions: Subscription[] = [];

	totalField: number = 0

	ccList = [];
	ccList2 = [];

	loading = {
		deposit: false,
		submit: false,
		glaccount: false,
		glaccount2: false,
	};

	writeOffListResultFiltered = [];
	viewWriteOffResult = new FormControl();
	gLListResultFiltered = [];
	gLListResultFiltered2 = [];

	isTransWriteOff: boolean = true;
	// isSelectVoucher: boolean = true;
	isSelectVoucher: boolean = false;
	isOpenPayCond: boolean = true;
	isOpenDatePayCond: boolean = true;


	isGenerateBilling: string = "" /* To determine the condition of the generating billing process in progress */
	msgErrorGenerate: string = "" /* To display message error proccessing generate */


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
		}
	]

	viewVoucherResult = new FormControl();
	// VoucherResultFiltered = [];
	VoucherResultFiltered = [];

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

	@ViewChild('myTable', { static: false }) table: MatTable<any>;
	@ViewChild('myTable2', { static: false }) table2: MatTable<any>;
	displayedColumns = ['no', 'gl', 'amount', 'desc', 'isdebit', 'action'];
	displayedColumns2 = ['no2', 'gl2', 'amount2', 'desc2', 'isdebit2', 'action2'];

	constructor(
		private activatedRoute: ActivatedRoute,
		private serviceFormat: ServiceFormat,
		private router: Router,
		private writeOffFB: FormBuilder,
		private layoutUtilsService: LayoutUtilsService,
		private store: Store<AppState>,
		private service: WriteOffService,
		private COAService: AccountGroupService,
		private cd: ChangeDetectorRef,
		private dialog: MatDialog,

	) { }

	ngOnInit() {
		this.loading$ = this.store.pipe(select(selectWriteOffActionLoading));
		const routeSubscription = this.activatedRoute.params.subscribe(
			(params) => {
				const id = params.id;
				if (id) {
					this.service.findWriteOffById(id).subscribe(resjouwriteoff => {
						this.totalField = resjouwriteoff.data.JW.totalField
						for (let i = 0; i < this.totalField; i++) {
							this.ccList.push({ id: '', refCc: '', name: '' })
						}

						this.writeOff = resjouwriteoff.data;
						// this.valueBill = resjouwriteoff.data.JW.ARID.voucherno
						this.isStatus = resjouwriteoff.data.JW.status

						if (resjouwriteoff.data.JW.status) {
							this.isTransWriteOff = false
							if (resjouwriteoff.data.JW.payCond != undefined) {
								this.isOpenPayCond = false
								this.checked.control.setValue(resjouwriteoff.data.JW.payCond)
							}
							if (resjouwriteoff.data.JW.payDate != undefined) {
								this.isOpenDatePayCond = false
								this.checked.date.control.setValue(resjouwriteoff.data.JW.payDate)
							}
						} else {
							this.isTransWriteOff = false
						}

						this.oldWriteOff = Object.assign({}, this.writeOff);
						this.initWriteOff();

						this.viewWriteOffResult.disable();
						this.viewWriteOffResult.setValue(
							`${resjouwriteoff.data.JW.depositTo.acctName.toLocaleLowerCase()}`
						);
						this._filterCashbankList(
							`${resjouwriteoff.data.JW.depositTo.acctName.toLocaleLowerCase()}`
						);
						this._filterGLList(
							`${resjouwriteoff.data.JW.glaccount.acctName.toLocaleLowerCase()}`
						);
						this.initWriteOff();
					})

				}
			}
		);
		this.subscriptions.push(routeSubscription);
	}

	valueChecked(choose) {
		for (let i = 1; i <= 30; i++) {
			let valIsDeb
			if (this.writeOff.JW.multiGLAccount[`isDebit${i}`] != undefined) valIsDeb = this.writeOff.JW.multiGLAccount[`isDebit${i}`];
			else valIsDeb = true

			if (choose == ('deb' + i)) return valIsDeb;
			else if (choose == ('cred' + i)) return !valIsDeb
		}
	}

	initWriteOff() {
		this.createForm();
		this.loadCOACashBank();
		this.loadGLAccountJS(null);
		this.loadVoucherBill(null)
	}

	printOptions = [
		{ value: "A5", name: "A5" },
		{ value: "A4", name: "A4" },
	];

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
		controls.multiGLAccount.get(`isDebit${this.totalField}`).setValue(true)

		this.table.renderRows();

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

	addCCEmpty() {
		const controls = this.writeOffForm.controls;

		this.isTransWriteOff = false

		this.ccList.push({ id: '', refCc: '', name: '' })
		this.ccList2.push({ id: '', refCc: '', name: '' });
		this.totalField = this.totalField += 1
		controls.multiGLAccount.get(('isDebit' + this.totalField)).setValue(true)

		this.table.renderRows();
		this.table2.renderRows();

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
		controls.multiGLAccount.get(('isDebit' + index)).setValue(undefined)

		this.table.renderRows();
	}

	_setGLAccount(value, target) {
		const controls = this.writeOffForm.controls;
		for (let i = 1; i <= 30; i++) {
			if (target == ('target' + i)) {
				controls.multiGLAccount.get(('glAcc' + i)).setValue(`${value.acctNo} - ${value.acctName}`)
				controls.multiGLAccount.get(('glAccountId' + i)).setValue(value._id)
			}
		}
	}

	_setVoucherValue(value) {
		const controls = this.writeOffForm.controls;
		this.isSelectVoucher = false
		controls.ARID.setValue(value._id)
		controls.voucherno.setValue(value.voucherno)
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


	detailTagihanBill(voucherNo) {
		const queryParams = new QueryParamsModel(voucherNo, "asc", null, 1, 10);
		this.service.getDetailTagihanBill(queryParams).subscribe((res) => {
			this.tagihanBillingData = res.data
			this.cd.markForCheck()
		});
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



	createForm() {
		// Check Saldo Voucher
		// const amount1 = this.writeOff.JW.ARID.totalAll.debit
		// const amount2 = this.writeOff.JW.ARID.totalAll.credit

		let objFormMultiGl = {}
		for (let i = 1; i <= 30; i++) {
			let glid, glacc, memo, amount, isDebit;
			if (this.writeOff.multiGLID[`glId${i}`] !== undefined) glid = this.writeOff.multiGLID[`glId${i}`]._id;
			if (this.writeOff.multiGLID[`glId${i}`] !== undefined) glacc = this.writeOff.multiGLID[`glId${i}`].acctName;
			if (this.writeOff.JW.multiGLAccount[`memo${i}`] !== undefined) memo = this.writeOff.JW.multiGLAccount[`memo${i}`];
			if (this.writeOff.JW.multiGLAccount[`amount${i}`] !== undefined) amount = this.serviceFormat.rupiahFormatImprovement(this.writeOff.JW.multiGLAccount[`amount${i}`] == undefined || this.writeOff.JW.multiGLAccount[`amount${i}`] == null ? "" : this.writeOff.JW.multiGLAccount[`amount${i}`]);
			if (this.writeOff.JW.multiGLAccount[`isDebit${i}`] !== undefined) isDebit = this.writeOff.JW.multiGLAccount[`isDebit${i}`];

			objFormMultiGl[`glAccountId${i}`] = [{ value: glid, disabled: true }];
			objFormMultiGl[`glAcc${i}`] = [{ value: glacc, disabled: true }];
			objFormMultiGl[`memo${i}`] = [{ value: memo, disabled: true }];
			objFormMultiGl[`amount${i}`] = [{ value: amount, disabled: true }];
			objFormMultiGl[`isDebit${i}`] = [{ value: isDebit, disabled: true }];

		}

		this.writeOffForm = this.writeOffFB.group({
			// depositTo: [this.writeOff.JW.depositTo == undefined ? "" : this.writeOff.JW.depositTo._id],
			voucherno: [this.writeOff.JW.voucherno],
			rate: [this.writeOff.JW.rate],
			date: [{ value: this.writeOff.JW.date, disabled: true }],

			payFrom: [this.writeOff.JW.payFrom],
			createdBy: [this.writeOff.JW.createdBy],
			crtdate: [this.writeOff.JW.crtdate],
			// status: [this.writeOff.JW.status],
			printSize: [this.writeOff.JW.printSize],
			voucherAR: [(this.writeOff.JW.ARID.voucherno + ' - ' + (this.writeOff.JW.ARID.memo == undefined ? "" : this.writeOff.JW.ARID.memo))],
			ARID: [this.writeOff.JW.ARID],
			status: [this.writeOff.JW.status == undefined ? "" : this.writeOff.JW.status],
			payCond: [this.writeOff.JW.payCond == undefined ? "" : this.writeOff.JW.payCond],
			payDate: [this.writeOff.JW.payDate == undefined ? "" : this.writeOff.JW.payDate],
			// saldoVoucher: [amount1 == amount2 ? this.serviceFormat.rupiahFormatImprovement(amount1) : ""],

			multiGLAccount: this.writeOffFB.group(objFormMultiGl),
		})
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

	_onKeyupGL2(e: any) {
		this.writeOffForm.patchValue({ glaccount: undefined });
		this._filterGLList2(e.target.value);
	}

	_filterGLList2(text: string) {
		this.loadGLAccountJS2(text)
	}

	_onKeyupVoucher(e: any) {
		this.writeOffForm.patchValue({ glaccount: undefined });
		this._filterGLListVoucher(e.target.value);
	}

	_filterGLListVoucher(text: string) {
		this.loadVoucherBill(text)
	}


	_filterCashbankList(text: string) {
		this.writeOffListResultFiltered = this.writeOffResult.filter((i) => {
			const filterText = `${i.acctNo.toLocaleLowerCase()}`;
			if (filterText.includes(text.toLocaleLowerCase())) return i;
		});
	}

	loadCOACashBank() {
		this.selection.clear();
		const queryParams = new QueryParamsModel(null, "asc", null, 1, 10000);
		this.COAService.getListCashBank(queryParams).subscribe((res) => {
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
	_setGlValue(value) {
		this.writeOffForm.patchValue({ glaccount: value._id });
	}

	_onKeyupGL(e: any) {
		this._filterGLList(e.target.value);
	}

	_filterGLList(text: string) {
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

		const editedWriteOff = this.prepareWriteOff();
		this.updateWriteOff(editedWriteOff, withBack);
	}

	prepareWriteOff(): WriteOffModel {
		const controls = this.writeOffForm.controls;
		const _writeOff = new WriteOffModel();

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

		_writeOff.clear();
		_writeOff._id = this.writeOff.JW._id;
		_writeOff.voucherno = controls.voucherno.value;
		_writeOff.date = controls.date.value;
		_writeOff.rate = controls.rate.value;
		_writeOff.createdBy = controls.createdBy.value;
		_writeOff.crtdate = controls.crtdate.value;
		// _writeOff.status = controls.status.value;
		_writeOff.printSize = controls.printSize.value;
		_writeOff.payFrom = controls.payFrom.value;
		_writeOff.totalField = this.totalField

		const valStatus = controls.status.value;
		_writeOff.status = valStatus
		_writeOff.payCond = valStatus == false ? "outstanding" : controls.payCond.value == "" ? undefined : controls.payCond.value;
		_writeOff.payDate = valStatus == false ? "" : controls.payDate.value == "" ? undefined : controls.payDate.value;
		_writeOff.ARID = controls.ARID.value;

		const a = controls.multiGLAccount.get('amount1').value;
		// const amount1 = a.replace(/\./g, "");
		const amount1 = controls.multiGLAccount.get(`amount1`).value == undefined || controls.multiGLAccount.get(`amount1`).value == null ? "" : a.replace(/[\.]+/g, "").replace(/[\,]+/g, ".");

		_writeOff.glaccount = controls.multiGLAccount.get('glAccountId1').value
		_writeOff.memo = controls.multiGLAccount.get('memo1').value
		_writeOff.amount = controls.multiGLAccount.get(`amount1`).value == "" || controls.multiGLAccount.get(`amount1`).value == undefined ? undefined : parseFloat(amount1)
		_writeOff.isDebit = controls.multiGLAccount.get(`amount1`).value == "" ? undefined : controls.multiGLAccount.get(`isDebit1`).value


		_writeOff.multiGLAccount = objRes == {} ? undefined : objRes

		return _writeOff;
	}

	updateWriteOff(_writeOff: WriteOffModel, withBack: boolean = false) {
		this.processSaving()
		const addSubscription = this.service.updateWriteOff(_writeOff).subscribe(
			(res) => {
				this.dialog.closeAll()
				this.loading.submit = false;
				const message = `Journal Write Off successfully has been saved.`;
				this.layoutUtilsService.showActionNotification(
					message,
					MessageType.Update,
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
		let result = `Edit Journal Write Off`;
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
