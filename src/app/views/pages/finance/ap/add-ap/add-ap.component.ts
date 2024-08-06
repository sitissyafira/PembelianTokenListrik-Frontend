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
import { QueryBankModel } from "../../../../../core/masterData/bank/bank/querybank.model";
import { ApModel } from "../../../../../core/finance/ap/ap.model";
import { selectApActionLoading } from "../../../../../core/finance/ap/ap.selector";
import { ApService } from "../../../../../core/finance/ap/ap.service";
import { SelectionModel } from "@angular/cdk/collections";
import { AccountGroupService } from "../../../../../core/accountGroup/accountGroup.service";
import { MatTable } from "@angular/material";
import { BankService } from "../../../../../core/masterData/bank/bank/bank.service";
import { ServiceFormat } from "../../../../../core/serviceFormat/format.service";
import { MatDialog } from '@angular/material';
import { ConfirmationDialog } from "../../../../partials/module/confirmation-popup/confirmation.dialog.component";
import { SavingDialog } from "../../../../partials/module/saving-confirm/confirmation.dialog.component";

@Component({
	selector: "kt-add-ap",
	templateUrl: "./add-ap.component.html",
	styleUrls: ["./add-ap.component.scss"],
})
export class AddApComponent implements OnInit, OnDestroy {
	ap: ApModel;
	ApId$: Observable<string>;
	oldAp: ApModel;
	selectedTab = 0;
	loading$: Observable<boolean>;
	selection = new SelectionModel<ApModel>(true, []);
	apResult: any[] = [];
	glResult: any[] = [];
	accountReceive: any[] = [];
	apForm: FormGroup;
	date1 = new FormControl(new Date());
	hasFormErrors = false;
	isStatus: boolean = false;
	loadingData: boolean = false;



	isGenerateBilling: string = "" /* To determine the condition of the generating billing process in progress */
	msgErrorGenerate: string = "" /* To display message error proccessing generate */


	@ViewChild('myTable', { static: false }) table: MatTable<any>;
	displayedColumns = ['no', 'gl', 'amount', 'desc', 'isdebit', 'action'];


	apListResultFiltered = [];
	viewApResult = new FormControl();

	totalField: number = 0
	balanced: boolean = false
	invalid: boolean = false

	gLListResultFiltered = [];
	viewGlResult = new FormControl();
	viewGlResult2 = new FormControl();
	viewPaidFormResult = new FormControl();
	PaidFormResultFiltered = [];
	bankResult: any[] = [];

	private subscriptions: Subscription[] = [];
	loading = {
		deposit: false,
		submit: false,
		glaccount: false,
		bank: false,
		unit: false
	};
	constructor(
		private activatedRoute: ActivatedRoute,
		private serviceFormat: ServiceFormat,
		private router: Router,
		private apFB: FormBuilder,
		private subheaderService: SubheaderService,
		private layoutUtilsService: LayoutUtilsService,
		private store: Store<AppState>,
		private service: ApService,
		private COAService: AccountGroupService,
		private layoutConfigService: LayoutConfigService,
		private cd: ChangeDetectorRef,
		private serviceBank: BankService,
		private dialog: MatDialog,
	) { }

	ngOnInit() {
		this.loading$ = this.store.pipe(select(selectApActionLoading));
		this.ap = new ApModel();
		this.ap.clear();
		this.initAp();
	}

	initAp() {
		this.createForm();
		this.loadCOACashBank();
		this.loadGLAccountAP(null);
		this.loadBank()

	}

	createForm() {

		let objFormMultiGl = {}
		for (let i = 1; i <= 30; i++) {
			objFormMultiGl[`glAccountId${i}`] = [{ value: undefined, disabled: false }];
			objFormMultiGl[`glAcc${i}`] = [{ value: "", disabled: false }];
			objFormMultiGl[`memo${i}`] = [{ value: undefined, disabled: false }];
			objFormMultiGl[`amount${i}`] = [{ value: "", disabled: false }];
			objFormMultiGl[`isDebit${i}`] = [{ value: false, disabled: false }];
		}

		this.apForm = this.apFB.group({
			depositTo: [""],
			voucherno: ["", Validators.required],
			rate: [{ value: "IDR", disabled: false }], //number
			// glaccount: [""],
			payFrom: [{ value: "", disabled: false }],
			date: [this.date1.value, Validators.required], // number
			createdBy: [this.ap.createdBy], // number
			crtdate: [{ value: this.date1.value, disabled: true }], // number
			status: [this.ap.status],
			printSize: [this.ap.printSize],
			paidFrom: [{ value: this.ap.paidFrom }],
			multiGLAccount: this.apFB.group(objFormMultiGl),
			payTo: [this.ap.payTo],
			payee: [this.ap.payee],
			noAccount: [""],
			bank: [this.ap.bank],
		});
	}

	ccList = [];
	// ifMaksField: boolean = false

	loadBank() {
		this.selection.clear();
		this.loading.bank = true;
		const queryParams = new QueryBankModel(null, "asc", null, 1, 1000);
		this.serviceBank.getListBank(queryParams).subscribe((res) => {
			this.bankResult = res.data;
			this.loading.bank = false;
		});
	}


	addCC(e) {
		const controls = this.apForm.controls;
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
		this.ccList.push({
			id: '',
			refCc: '',
			name: ''
		});
		this.totalField = this.totalField += 1

		this.table.renderRows();

	}

	removeCC(i: number) {
		const controls = this.apForm.controls;
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
		const controls = this.apForm.controls;
		// for (let i = 1; i <= 30; i++) {
		// 	if (e.target.name == i) controls.multiGLAccount.get(('amount' + i)).setValue(null)
		// }
		this.cd.markForCheck()
	}

	// loadCOACashBank() {
	// 	this.loading.deposit = true;
	// 	this.selection.clear();
	// 	const queryParams = new QueryParamsModel(null, "asc", null, 1, 1000);
	// 	this.COAService.getListCashBank(queryParams).subscribe((res) => {
	// 		this.apResult = res.data;
	// 		this.PaidFormResultFiltered = this.apResult;
	// 		this.loading.deposit = false;
	// 		this.cd.markForCheck();
	// 	});
	// }


	valueIsDebit(e) {
		const controls = this.apForm.controls;
		for (let i = 1; i <= 30; i++) {
			let value = e.target.value == "true" ? true : false
			if (e.target.name == i) controls.multiGLAccount.get(('isDebit' + i)).setValue(value)
		}
		this.cd.markForCheck()
	}


	changeStatus() {
		const controls = this.apForm.controls;
		if (this.isStatus == true) {
			controls.status.setValue(true);
		} else {
			controls.status.setValue(false);
		}
	}

	addPaidForm(value: string) {
		const controls = this.apForm.controls;
		this.apForm.controls.paidFrom.setValue(value);
	}


	_setPaidForm(value) {
		this.addPaidForm(value._id);
	}



	/**
	 * @param value
	 */
	_setApValue(value) {
		this.apForm.patchValue({ depositTo: value._id });
	}

	_onKeyupPaidForm(e: any) {
		// this.topupForm.patchValue({ bank: _onKeyupPaidForm });
		this._filterPaidFormList(e.target.value);
	}

	_filterPaidFormList(text: string) {
		this.PaidFormResultFiltered = this.apResult.filter((i) => {
			const filterText = `${i.acctNo.toLocaleLowerCase()}`;
			if (filterText.includes(text.toLocaleLowerCase())) return i;
		});
	}



	_onKeyup(e: any) {
		this.apForm.patchValue({ depositTo: undefined });
		this._filterCashbankList(e.target.value);
	}

	_filterCashbankList(text: string) {
		this.apListResultFiltered = this.apResult.filter((i) => {
			const filterText = `${i.acctNo.toLocaleLowerCase()} - ${i.acctName.toLocaleLowerCase()}`;
			if (filterText.includes(text.toLocaleLowerCase())) return i;
		});
	}

	printOptions = [
		{ value: "A5", name: "A5" },
		{ value: "A4", name: "A4" },
	];


	// loadCOACashBank() {
	// 	this.loading.deposit = true;
	// 	this.selection.clear();
	// 	const queryParams = new QueryParamsModel(null, "asc", null, 1, 10000);
	// 	this.COAService.getListCashBankAR(queryParams).subscribe((res) => {
	// 		this.apResult = res.data;
	// 		this.apListResultFiltered = this.apResult.slice();
	// 		this.viewApResult.enable();
	// 		this.cd.markForCheck();
	// 		this.loading.deposit = false;
	// 	});
	// }

	loadCOACashBank() {
		this.loading.deposit = true;
		this.selection.clear();
		const queryParams = new QueryParamsModel(null, "asc", null, 1, 1000);
		this.COAService.getListCashBank(queryParams).subscribe((res) => {
			this.apResult = res.data;
			this.PaidFormResultFiltered = this.apResult;
			this.loading.deposit = false;
			this.cd.markForCheck();
		});
	}



	/**
	 * @papam value
	 */

	_setGLAccount(value, target) {
		const controls = this.apForm.controls;
		for (let i = 1; i <= 30; i++) {
			if (target == ('target' + i)) {
				controls.multiGLAccount.get(('glAcc' + i)).setValue(`${value.acctNo} - ${value.acctName}`)
				controls.multiGLAccount.get(('glAccountId' + i)).setValue(value._id)
			}
		}
	}

	_onKeyupGL(e: any) {
		this.apForm.patchValue({ glaccount: undefined });
		this._filterGLList(e.target.value);
	}

	_filterGLList(text: string) {
		// this.apListResultFiltered = this.apResult.filter((i) => {
		// 	const filterText = `${i.acctNo.toLocaleLowerCase()} - ${i.acctName.toLocaleLowerCase()}`;
		// 	if (filterText.includes(text.toLocaleLowerCase())) return i;
		// });

		// this.gLListResultFiltered = this.glResult.filter((i) => {
		// 	const filterText = `${i.acctNo.toLocaleLowerCase()}`;
		// 	if (filterText.includes(text.toLocaleLowerCase())) return i;
		// });
		this.loadGLAccountAP(text)
	}

	loadGLAccountAP(text) {
		this.loading.glaccount = true;
		this.selection.clear();
		// const queryParams = new QueryParamsModel(null, "asc", null, 1, 10);
		const queryParams = new QueryParamsModel(text, "asc", null, 1, 10);

		this.COAService.getListGLAccountAP(queryParams).subscribe((res) => {
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

	goBackWithId() {
		const url = `/ap`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}

	refreshAp(isNew: boolean = false, id: string = "") {
		let url = this.router.url;
		if (!isNew) {
			this.router.navigate([url], { relativeTo: this.activatedRoute });
			return;
		}
		url = `/ap/edit/${id}`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}


	onSubmit(withBack: boolean = false) {
		const controls = this.apForm.controls;
		const valPaidFrom = controls.paidFrom.value

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

		if (typeof valPaidFrom == "object") {
			const message = `Paid From is required.`;
			this.layoutUtilsService.showActionNotification(
				message,
				MessageType.Create,
				5000,
				true,
				true)
			return
		}

		this.loading.submit = true;
		this.hasFormErrors = false;
		if (this.apForm.invalid) {
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
				this.loadingData = true;
				const editedAp = this.prepareAp();
				this.addAp(editedAp, withBack);
			} else {
				return;
			}
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
		let controls = this.apForm.controls;
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

		rupiah = split[1] != undefined ? split[1][1] != undefined ? rupiah + "," + split[1][0] + split[1][1] : split[1] != '' ? rupiah + "," + split[1][0] : rupiah + "," + split[1] : rupiah;
		controls.multiGLAccount.get(`amount${id}`).setValue(rupiah);

		return rupiah
	}

	prepareAp(): ApModel {
		const controls = this.apForm.controls;
		const _ap = new ApModel();


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

		_ap.clear();
		_ap._id = this.ap._id;
		_ap.depositTo = controls.depositTo.value;
		_ap.voucherno = controls.voucherno.value;
		_ap.rate = controls.rate.value;
		_ap.date = controls.date.value;
		_ap.createdBy = controls.createdBy.value;
		_ap.crtdate = controls.crtdate.value;
		_ap.status = controls.status.value;
		_ap.payFrom = controls.payFrom.value;
		_ap.printSize = controls.printSize.value;
		_ap.totalField = this.totalField

		_ap.bank = controls.bank.value;

		_ap.paidFrom = controls.paidFrom.value;
		_ap.payTo = controls.payTo.value;
		_ap.payee = controls.payee.value;
		_ap.noAccount = controls.noAccount.value;

		const a = controls.multiGLAccount.get('amount1').value;
		// const amount1 = a.replace(/\./g, "");
		let rupiah = a.replace(/[\.]+/g, "").replace(/[\,]+/g, ".");
		let rupiahNum = rupiah

		_ap.glaccount = controls.multiGLAccount.get('glAccountId1').value
		_ap.amount = controls.multiGLAccount.get('amount1').value == "" ? undefined : parseFloat(rupiahNum)
		_ap.memo = controls.multiGLAccount.get('memo1').value
		_ap.isDebit = controls.multiGLAccount.get('amount1').value == "" ? undefined : controls.multiGLAccount.get('isDebit1').value

		_ap.multiGLAccount = objRes

		return _ap;
	}

	addAp(_ap: ApModel, withBack: boolean = false) {
		// Condition Total Field
		// if (this.totalField > 10) {
		// 	const message = `Total Field Maks 10 field`;
		// 	this.layoutUtilsService.showActionNotification(
		// 		message,
		// 		MessageType.Create,
		// 		5000,
		// 		true,
		// 		true)

		// 	return
		// }


		// if (this.totalField == 0 || amn1 == "" || gl1 == undefined) {
		// 	const message = `Input Minimal 1 Field GL, Amount`;
		// 	this.layoutUtilsService.showActionNotification(
		// 		message,
		// 		MessageType.Create,
		// 		8000,
		// 		true,
		// 		true)

		// 	return
		// }

		this.processSaving()
		const addSubscription = this.service.createAp(_ap).subscribe(
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
				const url = `/ap`;
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
		let result = "Create Account Payment";
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
		const controls = this.apForm.controls
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
		const controls = this.apForm.controls
		let list = []
		for (let i = 1; i <= this.totalField; i++) {
			let gl = controls.multiGLAccount.get(`glAccountId${i}`).value
			list.push(gl != undefined)
		}
		this.invalid = list.some(item => item == false)
	}

	/**
 * Load AP Process Saving.
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
