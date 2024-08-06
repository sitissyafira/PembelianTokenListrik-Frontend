import { ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, ViewChild } from "@angular/core";
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
import { ApModel } from "../../../../../core/finance/ap/ap.model";
import {
	selectApActionLoading,
	selectApById,
} from "../../../../../core/finance/ap/ap.selector";
import { ApService } from "../../../../../core/finance/ap/ap.service";
import { SelectionModel } from "@angular/cdk/collections";
import { AccountGroupService } from "../../../../../core/accountGroup/accountGroup.service";
import { QueryAccountGroupModel } from "../../../../../core/accountGroup/queryag.model";
import { HttpClient } from "@angular/common/http";
import { environment } from "../../../../../../environments/environment";
import { MatTable } from "@angular/material";
import { QueryBankModel } from "../../../../../core/masterData/bank/bank/querybank.model";
import { BankService } from "../../../../../core/masterData/bank/bank/bank.service";
import { ServiceFormat } from "../../../../../core/serviceFormat/format.service";
import { MatDialog } from '@angular/material';
import { ConfirmationDialog } from "../../../../partials/module/confirmation-popup/confirmation.dialog.component";
import { SavingDialog } from "../../../../partials/module/saving-confirm/confirmation.dialog.component";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";

@Component({
	selector: "kt-edit-ap",
	templateUrl: "./edit-ap.component.html",
	styleUrls: ["./edit-ap.component.scss"],
})
export class EditApComponent implements OnInit, OnDestroy {
	ap: ApModel;
	ApId$: Observable<string>;
	oldAp: ApModel;
	selectedTab = 0;
	loading$: Observable<boolean>;
	selection = new SelectionModel<ApModel>(true, []);
	apResult: any[] = [];
	glResult: any[] = [];
	apForm: FormGroup;
	date1 = new FormControl(new Date());
	hasFormErrors = false;
	isStatus: boolean = false;
	private subscriptions: Subscription[] = [];
	balanced: boolean = false

	PaidFormResultFiltered = [];
	loadingData: boolean = false;
	bankResult: any[] = [];

	isGenerateBilling: string = "" /* To determine the condition of the generating billing process in progress */
	msgErrorGenerate: string = "" /* To display message error proccessing generate */

	totalField: number = 0

	ccList = [];

	loading = {
		deposit: false,
		submit: false,
		glaccount: false,
		bank: false,
	};

	apListResultFiltered = [];
	viewApResult = new FormControl();
	gLListResultFiltered = [];
	viewPaidFormResult = new FormControl();

	@ViewChild('myTable', { static: false }) table: MatTable<any>;
	@ViewChild("modaljournal", { static: true }) modaljournal: ElementRef;

	displayedColumns = ['no', 'gl', 'amount', 'desc', 'isdebit', 'action'];
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
		private http: HttpClient,
		private serviceBank: BankService,
		private dialog: MatDialog,
		private modalService: NgbModal,

	) { }

	ngOnInit() {
		this.loading$ = this.store.pipe(select(selectApActionLoading));
		const routeSubscription = this.activatedRoute.params.subscribe(
			(params) => {
				const id = params.id;
				if (id) {
					this.service.findApById(id).subscribe(resaccpurchase => {
						this.totalField = resaccpurchase.data.AP.totalField

						for (let i = 0; i < this.totalField; i++) {
							this.ccList.push({
								id: '',
								refCc: '',
								name: ''
							})
						}

						this.ap = resaccpurchase.data;

						this.oldAp = Object.assign({}, this.ap);
						this.initAp();

						// this.viewPaidFormResult.disable();
						this.viewPaidFormResult.setValue(
							`${resaccpurchase.data.AP.paidFrom.acctName.toLocaleLowerCase()}`
						);
						this._filterGLList(
							`${resaccpurchase.data.AP.glaccount.acctName.toLocaleLowerCase()}`
						);
						this.initAp();
					})

				}
			}
		);
		this.subscriptions.push(routeSubscription);
	}

	valueChecked(choose) {
		for (let i = 1; i <= 30; i++) {
			let valIsDeb
			if (this.ap.AP.multiGLAccount[`isDebit${i}`] != undefined) valIsDeb = this.ap.AP.multiGLAccount[`isDebit${i}`];
			else valIsDeb = false

			if (choose == ('deb' + i)) return valIsDeb;
			else if (choose == ('cred' + i)) return !valIsDeb
		}
	}

	initAp() {
		this.createForm();
		this.loadCOACashBank();
		this.loadGLAccountAP(null);
		this.loadBank()
	}

	printOptions = [
		{ value: "A5", name: "A5" },
		{ value: "A4", name: "A4" },
	];

	// ifMaksField: boolean = false

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
		controls.multiGLAccount.get(`isDebit${this.totalField}`).setValue(false)

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
		controls.multiGLAccount.get(('isDebit' + index)).setValue(undefined)

		this.table.renderRows();
	}

	_setGLAccount(value, target) {
		const controls = this.apForm.controls;
		for (let i = 1; i <= 30; i++) {
			if (target == ('target' + i)) {
				controls.multiGLAccount.get(('glAcc' + i)).setValue(`${value.acctNo} - ${value.acctName}`)
				controls.multiGLAccount.get(('glAccountId' + i)).setValue(value._id)
			}
		}
	}

	clickToggle(e) {
		const controls = this.apForm.controls;
		// for (let i = 1; i <= 30; i++) {
		// 	if (e.target.name == i) controls.multiGLAccount.get(('amount' + i)).setValue(null)
		// }
		this.cd.markForCheck()
	}

	valueIsDebit(e) {
		const controls = this.apForm.controls;
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
			if (this.ap.multiGLID[`glId${i}`] !== undefined) glid = this.ap.multiGLID[`glId${i}`]._id;
			if (this.ap.multiGLID[`glId${i}`] !== undefined) glacc = this.ap.multiGLID[`glId${i}`].acctName;
			if (this.ap.AP.multiGLAccount[`memo${i}`] !== undefined || this.ap.AP.multiGLAccount[`memo${i}`] !== undefined !== null) memo = this.ap.AP.multiGLAccount[`memo${i}`];
			if (this.ap.AP.multiGLAccount[`amount${i}`] !== undefined || this.ap.AP.multiGLAccount[`amount${i}`] !== null) amount = this.serviceFormat.rupiahFormatImprovement(this.ap.AP.multiGLAccount[`amount${i}`] == undefined || this.ap.AP.multiGLAccount[`amount${i}`] == null ? "" : this.ap.AP.multiGLAccount[`amount${i}`]);
			if (this.ap.AP.multiGLAccount[`isDebit${i}`] !== undefined || this.ap.AP.multiGLAccount[`isDebit${i}`] !== null) isDebit = this.ap.AP.multiGLAccount[`isDebit${i}`];

			objFormMultiGl[`glAccountId${i}`] = [{ value: glid, disabled: false }];
			objFormMultiGl[`glAcc${i}`] = [{ value: glacc, disabled: false }];
			objFormMultiGl[`memo${i}`] = [{ value: memo, disabled: false }];
			objFormMultiGl[`amount${i}`] = [{ value: amount, disabled: false }];
			objFormMultiGl[`isDebit${i}`] = [{ value: isDebit, disabled: false }];
		}

		this.apForm = this.apFB.group({
			bank: [this.ap.AP.bank == null ? "" : this.ap.AP.bank._id],
			depositTo: [this.ap.AP.depositTo],
			voucherno: [this.ap.AP.voucherno, Validators.required],
			rate: [{ value: this.ap.AP.rate, disabled: false }], //number
			// payFrom: [{ value: this.ap.AP.paidFrom, disabled: false }, Validators.required],
			date: [{ value: this.ap.AP.date, disabled: false }], // number
			createdBy: [this.ap.AP.createdBy], // number
			crtdate: [{ value: this.ap.AP.crtdate, disabled: true }], // number
			status: [this.ap.AP.status],
			printSize: [this.ap.AP.printSize],
			paidFrom: [this.ap.AP.paidFrom == undefined ? "" : this.ap.AP.paidFrom._id],
			multiGLAccount: this.apFB.group(objFormMultiGl),
			payTo: [this.ap.AP.payTo],
			payee: [this.ap.AP.payee],
			noAccount: [this.ap.AP.noAccount],
			paidDate: [this.ap.AP.paidDate]
			// glaccount: [this.ap.AP.depositTo],
		});
	}


	changeStatus() {
		const controls = this.apForm.controls;
		if (this.isStatus == true) {
			controls.status.setValue(true);
			controls.paidDate.setValue(new Date())
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
			const filterText = `${i.acctNo.toLocaleLowerCase()}`;
			if (filterText.includes(text.toLocaleLowerCase())) return i;
		});
	}

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
	_setGlValue(value) {
		this.apForm.patchValue({ glaccount: value._id });
	}

	_onKeyupGL(e: any) {
		this._filterGLList(e.target.value);
	}

	_filterGLList(text: string) {
		this.apListResultFiltered = this.apResult.filter((i) => {
			const filterText = `${i.acctNo.toLocaleLowerCase()} - ${i.acctName.toLocaleLowerCase()}`;

			if (filterText.includes(text.toLocaleLowerCase())) return i;
		});
		this.loadGLAccountAP(text)
	}

	loadBank() {
		const controls = this.apForm.controls;
		this.selection.clear();
		this.loading.bank = true;
		const queryParams = new QueryBankModel(null, "asc", null, 1, 1000);
		this.serviceBank.getListBank(queryParams).subscribe((res) => {
			this.bankResult = res.data;
			this.loading.bank = false;
		});
	}

	loadGLAccountAP(text) {
		this.loading.glaccount = true;
		this.selection.clear();
		const queryParams = new QueryParamsModel(text, "asc", null, 1, 1000);
		this.COAService.getListGLAccountAP(queryParams).subscribe((res) => {
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

	onSubmit(withBack: boolean = false) {
		// Validation Paid From
		const controls = this.apForm.controls;

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

		const editedAp = this.prepareAp();
		console.log(editedAp, 'edited ap')
		this.updateAp(editedAp, withBack);
	}

	prepareAp(): ApModel {
		const controls = this.apForm.controls;
		const _ap = new ApModel();

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

		_ap.clear();
		_ap._id = this.ap.AP._id;
		_ap.depositTo = controls.depositTo.value;
		_ap.voucherno = controls.voucherno.value;
		_ap.date = controls.date.value;
		_ap.rate = controls.rate.value;
		_ap.createdBy = controls.createdBy.value;
		_ap.crtdate = controls.crtdate.value;
		_ap.status = controls.status.value;
		_ap.printSize = controls.printSize.value;
		_ap.payTo = controls.payTo.value;
		_ap.totalField = this.totalField
		_ap.paidFrom = controls.paidFrom.value;
		_ap.noAccount = controls.noAccount.value;
		_ap.bank = controls.bank.value;
		_ap.payee = controls.payee.value;
		_ap.paidDate = controls.paidDate.value;

		const a = controls.multiGLAccount.get('amount1').value;
		// const amount1 = a.replace(/\./g, "");
		let rupiah = controls.multiGLAccount.get(`amount1`).value == undefined || controls.multiGLAccount.get(`amount1`).value == null ? "" : a.replace(/[\.]+/g, "").replace(/[\,]+/g, ".");
		let rupiahNum = rupiah

		_ap.glaccount = controls.multiGLAccount.get('glAccountId1').value
		_ap.memo = controls.multiGLAccount.get('memo1').value
		_ap.amount = controls.multiGLAccount.get(`amount1`).value == "" || controls.multiGLAccount.get(`amount1`).value == undefined ? undefined : parseFloat(rupiahNum)
		_ap.isDebit = controls.multiGLAccount.get(`amount1`).value == "" ? undefined : controls.multiGLAccount.get(`isDebit1`).value


		_ap.multiGLAccount = objRes == {} ? undefined : objRes

		return _ap;
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

	updateAp(_ap: ApModel, withBack: boolean = false) {
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
		const addSubscription = this.service.updateAp(_ap).subscribe(
			(res) => {
				this.loading.submit = false;
				const message = `Account Payment successfully has been saved.`;
				this.layoutUtilsService.showActionNotification(
					message,
					MessageType.Update,
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
		let result = `Edit Account Payment`;
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
* PopUp Loading
*/
	openLarge() {
		this.modalService.open(this.modaljournal, {
			centered: true,
			size: 'sm',
			backdrop: "static",
		});
	}
}
