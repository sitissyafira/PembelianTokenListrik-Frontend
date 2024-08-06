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
import { DebitNoteModel } from "../../../../../../core/finance/journal/debitNote/debitNote.model";
import { selectDebitNoteActionLoading } from "../../../../../../core/finance/journal/debitNote/debitNote.selector";
import { DebitNoteService } from "../../../../../../core/finance/journal/debitNote/debitNote.service";
import { SelectionModel } from "@angular/cdk/collections";
import { AccountGroupService } from "../../../../../../core/accountGroup/accountGroup.service";
import { MatDialog, MatTable } from "@angular/material";
import { result } from "lodash";

import { SavingDialog } from "../../../../../partials/module/saving-confirm/confirmation.dialog.component";

@Component({
	selector: "kt-add-debitNote",
	templateUrl: "./add-debitNote.component.html",
	styleUrls: ["./add-debitNote.component.scss"],
})
export class AddDebitNoteComponent implements OnInit, OnDestroy {
	debitNote: DebitNoteModel;
	DebitNoteId$: Observable<string>;
	oldDebitNote: DebitNoteModel;
	selectedTab = 0;
	loading$: Observable<boolean>;
	selection = new SelectionModel<DebitNoteModel>(true, []);
	debitNoteResult: any[] = [];
	glResult: any[] = [];
	accountReceive: any[] = [];
	debitNoteForm: FormGroup;
	date1 = new FormControl(new Date());
	hasFormErrors = false;
	isStatus: boolean = false;
	ccList = [];
	ccList2 = [];
	ifMaksField: boolean = false




	@ViewChild('myTable', { static: false }) table: MatTable<any>;
	@ViewChild('myTable2', { static: false }) table2: MatTable<any>;
	displayedColumns = ['no', 'gl', 'amount', 'desc', 'isdebit', 'action'];
	displayedColumns2 = ['no2', 'gl2', 'amount2', 'desc2', 'isdebit2', 'action2'];


	debitNoteListResultFiltered = [];
	viewDebitNoteResult = new FormControl();

	totalField: number = 0


	isGenerateBilling: string = "" /* To determine the condition of the generating billing process in progress */
	msgErrorGenerate: string = "" /* To display message error proccessing generate */


	gLListResultFiltered2 = [];
	gLListResultFiltered = [];
	voucherBillFiltered = [];
	voucherBillResult = [];
	viewGlResult = new FormControl();
	viewGlResult2 = new FormControl();

	private subscriptions: Subscription[] = [];
	loading = {
		deposit: false,
		submit: false,
		glaccount: false,
		glaccount2: false,
		voucherBill: false
	};
	balance: boolean = false;
	constructor(
		private activatedRoute: ActivatedRoute,
		private router: Router,
		private debitNoteFB: FormBuilder,
		private subheaderService: SubheaderService,
		private layoutUtilsService: LayoutUtilsService,
		private store: Store<AppState>,
		private service: DebitNoteService,
		private COAService: AccountGroupService,
		private layoutConfigService: LayoutConfigService,
		private cd: ChangeDetectorRef,
		private dialog: MatDialog,

	) { }

	ngOnInit() {
		this.loading$ = this.store.pipe(select(selectDebitNoteActionLoading));
		this.debitNote = new DebitNoteModel();
		this.debitNote.clear();
		this.initDebitNote();
		this.loadVoucherBill(null)
	}

	initDebitNote() {
		this.createForm();
		this.loadCOACashBank();
		this.loadGLAccountJA(null);
		this.loadGLAccountJA2(null);
		this.validateDebit();
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

		this.debitNoteForm = this.debitNoteFB.group({
			depositTo: [""],
			voucherno: ["", Validators.required],
			rate: [{ value: "IDR", disabled: false }], //number
			glaccount: [""],
			payFrom: [{ value: "JOURNAL DEBIT NOTE", disabled: false }, Validators.required],
			date: [this.date1.value, Validators.required], // number
			createdBy: [this.debitNote.createdBy], // number
			crtdate: [{ value: this.date1.value, disabled: true }], // number
			status: [this.debitNote.status],
			// printSize: [this.debitNote.printSize],

			// ARID: [""],

			multiGLAccount: this.debitNoteFB.group(objFormMultiGl),
		});
	}


	addCC(e) {
		const controls = this.debitNoteForm.controls;
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
		const controls = this.debitNoteForm.controls;
		this.ccList.push({ id: '', refCc: '', name: '' })
		this.ccList2.push({ id: '', refCc: '', name: '' });

		this.totalField = this.totalField += 1

		// controls.multiGLAccount.get(('isDebit' + 1)).setValue(true)
		// controls.multiGLAccount.get(('isDebit' + 2)).setValue(false)

		this.table.renderRows();
		// this.table2.renderRows();

	}


	removeCC(i: number) {
		const controls = this.debitNoteForm.controls;
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

	clickToggle(e) {
		const controls = this.debitNoteForm.controls;
		// for (let i = 1; i <= 30; i++) {
		// 	if (e.target.name == i) controls.multiGLAccount.get(('amount' + i)).setValue(null)
		// }
		this.cd.markForCheck()
	}

	valueIsDebit(e) {
		const controls = this.debitNoteForm.controls;
		for (let i = 1; i <= 30; i++) {
			let value = e.target.value == "true" ? true : false
			if (e.target.name == i) controls.multiGLAccount.get(('isDebit' + i)).setValue(value)
		}
		this.validateDebit()
		this.cd.markForCheck()
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

	formatFloat(v) {
		let value = v == 0 ? 0 : v.replace(/[\.]+/g, "").replace(/[\,]+/g, ".");
		return parseFloat(value)
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
		let controls = this.debitNoteForm.controls;
		let value = event
			? event.target.value.replace(/\./g, "")
			: values.toString();

		//Make sure it is not undefined, but atleast 0
		if (value === "" || value === NaN) {
			value = "0";
		}

		var number_string = value.replace(/[^,\d]/g, "").toString(),
			split = number_string.split(","),
			sisa = split[0].length % 3,
			rupiah = split[0].substr(0, sisa),
			ribuan = split[0].substr(sisa).match(/\d{3}/gi);

		//Check if value is not number, ingnore it
		if (value.match(/[0-9-]/g) !== null) {
			let intValue; //Raw Number
			let formattedNumber; // Formatted Number

			//Minus symbol validation
			if (value === "-" || value === "--" || value === "0-") {
				intValue = 0;
				formattedNumber = "-";
			} else {
				intValue = parseInt(value);
				formattedNumber = new Intl.NumberFormat("id-ID", {
					minimumFractionDigits: 0,
				}).format(intValue);
			}

			// Validasi balance gl Account
			let totalAllDebit = 0
			let totalAllCredit = 0
			let resultIsDebit = []
			let resultIsCredit = []
			for (let i = 1; i <= this.totalField; i++) {
				if (controls.multiGLAccount.get(`isDebit${i}`).value == true) {
					resultIsDebit.push({ amount: this.formatFloat(controls.multiGLAccount.get(`amount${i}`).value), no: i })
				} else {
					resultIsCredit.push({ amount: this.formatFloat(controls.multiGLAccount.get(`amount${i}`).value), no: i })
				}
			}

			resultIsDebit.forEach(data => totalAllDebit += data.amount)
			resultIsCredit.forEach(data => totalAllCredit += data.amount)

			if (totalAllDebit == totalAllCredit) {
				this.balance = true
			} else {
				this.balance = false
			}

			//Set Raw Value
			this[rawValueProps] = intValue;

			//Set Formatted Value
			controls.multiGLAccount.get(`amount${id}`).setValue(formattedNumber);

			return formattedNumber;
		} else {
			controls[formName].setValue(value.substring(0, value.length - 1));
		}
	}

	changeStatus() {
		const controls = this.debitNoteForm.controls;
		if (this.isStatus == true) {
			controls.status.setValue(true);
		} else {
			controls.status.setValue(false);
		}
	}

	/**
	 * @pdebitNoteam value
	 */
	_setDebitNoteValue(value) {
		this.debitNoteForm.patchValue({ depositTo: value._id });
	}

	_onKeyup(e: any) {
		this.debitNoteForm.patchValue({ depositTo: undefined });
		this._filterCashbankList(e.target.value);
	}

	_filterCashbankList(text: string) {
		this.debitNoteListResultFiltered = this.debitNoteResult.filter((i) => {
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
			this.debitNoteResult = res.data;
			this.debitNoteListResultFiltered = this.debitNoteResult.slice();
			this.viewDebitNoteResult.enable();
			this.cd.markForCheck();
			this.loading.deposit = false;
		});
	}

	/**
	 * @pdebitNoteam value
	 */

	_setGLAccount(value, target) {

		const controls = this.debitNoteForm.controls;
		for (let i = 1; i <= 30; i++) {
			if (target == ('target' + i)) {
				controls.multiGLAccount.get(('glAcc' + i)).setValue(`${value.acctNo} - ${value.acctName}`)
				controls.multiGLAccount.get(('glAccountId' + i)).setValue(value._id)
			}
		}
	}
	_setVoucherBill(value) {
		const controls = this.debitNoteForm.controls;
		// controls.ARID.setValue(value._id)
	}

	_onKeyupGL(e: any) {
		// this.debitNoteForm.patchValue({ glaccount: undefined });
		this._filterGLList(e.target.value);
	}

	_filterGLList(text: string) {
		this.loadGLAccountJA(text)
	}
	_onKeyupGL2(e: any) {
		// this.debitNoteForm.patchValue({ glaccount: undefined });
		this._filterGLList2(e.target.value);
	}

	_filterGLList2(text: string) {
		this.loadGLAccountJA2(text)
	}
	// voucher Bill Start
	_onKeyupVoucherBill(e: any) {
		// this.debitNoteForm.patchValue({ ARID: undefined });
		this._filterVoucherBillList(e.target.value);
	}

	_filterVoucherBillList(text: string) {
		this.loadVoucherBill(text)
	}
	// End


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
			this.loading.glaccount2 = false;
			this.cd.markForCheck();
		});

	}


	loadVoucherBill(text) {
		this.selection.clear();
		const queryParams = new QueryParamsModel(text, "asc", null, 1, 10);

		this.COAService.getListVoucherBill(queryParams).subscribe((res) => {
			this.voucherBillResult = res.data
			this.voucherBillFiltered = res.data.slice();

			this.loading.voucherBill = false;
			this.cd.markForCheck();
		});

	}

	goBackWithId() {
		const url = `/debitnote`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}

	refreshDebitNote(isNew: boolean = false, id: string = "") {
		let url = this.router.url;
		if (!isNew) {
			this.router.navigate([url], { relativeTo: this.activatedRoute });
			return;
		}
		url = `/debitnote/edit/${id}`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}

	valueChecked(index) {

		if (index == 1) {
			return true
		} else if (index == 2) {
			return false
		}
	}

	onSubmit(withBack: boolean = false) {

		const controls = this.debitNoteForm.controls;
		// Validation Start
		const valGL1 = controls.multiGLAccount.get('glAccountId1').value
		const valGL2 = controls.multiGLAccount.get('glAccountId2').value

		if (valGL1 == undefined || valGL2 == undefined) {
			const message = `GlAccount 1 or GlAccount 2, is required.`;
			this.layoutUtilsService.showActionNotification(
				message,
				MessageType.Create,
				5000,
				true,
				true
			);
			return
		}

		if (this.balance == false) {
			const message = `not balance, all data must be filled.`;
			this.layoutUtilsService.showActionNotification(
				message,
				MessageType.Create,
				5000,
				true,
				true
			);
			return
		}

		// Validation End
		this.loading.submit = true;
		this.hasFormErrors = false;
		if (this.debitNoteForm.invalid) {
			Object.keys(controls).forEach((controlName) =>
				controls[controlName].markAsTouched()
			);

			this.loading.submit = false;
			this.hasFormErrors = true;
			this.selectedTab = 0;

			return;
		}
		const editedDebitNote = this.prepdebitNoteeDebitNote();
		this.addDebitNote(editedDebitNote, withBack);
	}

	prepdebitNoteeDebitNote(): DebitNoteModel {
		const controls = this.debitNoteForm.controls;
		const _debitNote = new DebitNoteModel();


		let objRes = {}
		for (let i = 2; i <= 30; i++) {
			const a = controls.multiGLAccount.get(`amount${i}`).value
			const amountLoop = a.replace(/\./g, "");

			objRes[`glAcc${i}`] = controls.multiGLAccount.get(`glAccountId${i}`).value;
			objRes[`memo${i}`] = controls.multiGLAccount.get(`memo${i}`).value;
			objRes[`amount${i}`] = controls.multiGLAccount.get(`amount${i}`).value == "" ? undefined : parseInt(amountLoop);
			objRes[`isDebit${i}`] = controls.multiGLAccount.get(`amount${i}`).value == "" ? undefined : controls.multiGLAccount.get(`isDebit${i}`).value
		}

		_debitNote.clear();
		_debitNote._id = this.debitNote._id;
		_debitNote.depositTo = controls.depositTo.value == "" ? undefined : controls.depositTo.value;
		_debitNote.voucherno = controls.voucherno.value;
		_debitNote.rate = controls.rate.value;
		_debitNote.date = controls.date.value;
		_debitNote.createdBy = controls.createdBy.value;
		_debitNote.crtdate = controls.crtdate.value;
		_debitNote.status = controls.status.value;
		_debitNote.payFrom = controls.payFrom.value;
		// _debitNote.printSize = controls.printSize.value;
		_debitNote.totalField = this.totalField

		// _debitNote.ARID = controls.ARID.value;

		const a = controls.multiGLAccount.get('amount1').value;
		const amount1 = a.replace(/\./g, "");

		_debitNote.glaccount = controls.multiGLAccount.get('glAccountId1').value
		_debitNote.amount = controls.multiGLAccount.get('amount1').value == "" ? undefined : parseInt(amount1)
		_debitNote.memo = controls.multiGLAccount.get('memo1').value
		_debitNote.isDebit = controls.multiGLAccount.get('amount1').value == "" ? undefined : controls.multiGLAccount.get('isDebit1').value

		_debitNote.multiGLAccount = objRes

		return _debitNote;
	}

	addDebitNote(_debitNote: DebitNoteModel, withBack: boolean = false) {
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

		const addSubscription = this.service.createDebitNote(_debitNote).subscribe(
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
				const url = `/debitnote`;
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
		let result = "Create Journal Debit Note";
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

	validateDebit() {
		const controls = this.debitNoteForm.controls
		let totalAllDebit = 0
		let totalAllCredit = 0
		let resultIsDebit = []
		let resultIsCredit = []
		for (let i = 1; i <= this.totalField; i++) {
			if (controls.multiGLAccount.get(`isDebit${i}`).value == true) {
				resultIsDebit.push({ amount: this.formatFloat(controls.multiGLAccount.get(`amount${i}`).value), no: i })
			} else {
				resultIsCredit.push({ amount: this.formatFloat(controls.multiGLAccount.get(`amount${i}`).value), no: i })
			}
		}

		resultIsDebit.forEach(data => totalAllDebit += data.amount)
		resultIsCredit.forEach(data => totalAllCredit += data.amount)

		if (totalAllDebit == totalAllCredit) {
			this.balance = true
		} else {
			this.balance = false
		}
	}

	/**
* Load DEB NOTE Process Saving.
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

