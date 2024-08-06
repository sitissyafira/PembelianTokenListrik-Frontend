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
import { MatTable } from "@angular/material";
import { QueryBankModel } from "../../../../../core/masterData/bank/bank/querybank.model";
import { BankService } from "../../../../../core/masterData/bank/bank/bank.service";
import { ServiceFormat } from "../../../../../core/serviceFormat/format.service";
@Component({
	selector: "kt-view-ap",
	templateUrl: "./view-ap.component.html",
	styleUrls: ["./view-ap.component.scss"],
})
export class ViewApComponent implements OnInit, OnDestroy {
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

	viewPaidFormResult = new FormControl();
	PaidFormResultFiltered = [];
	bankResult: any[] = [];

	totalField: number = 0
	loadingData: boolean = false;

	ccList = [];
	ifMaksField: boolean = false
	valuePaidFrom = ""


	loading = {
		deposit: false,
		submit: false,
		glaccount: false,
		bank: false
	};

	apListResultFiltered = [];
	viewApResult = new FormControl();
	gLListResultFiltered = [];

	@ViewChild('myTable', { static: false }) table: MatTable<any>;
	displayedColumns = ['no', 'gl', 'amount', 'desc', 'isdebit'];
	constructor(
		private activatedRoute: ActivatedRoute,
		private serviceFormat: ServiceFormat,
		private router: Router,
		private apFB: FormBuilder,
		private store: Store<AppState>,
		private service: ApService,
		private COAService: AccountGroupService,
		private cd: ChangeDetectorRef,
		private serviceBank: BankService,

	) { }

	ngOnInit() {
		this.loading$ = this.store.pipe(select(selectApActionLoading));
		const routeSubscription = this.activatedRoute.params.subscribe(
			(params) => {
				const id = params.id;
				if (id) {
						this.service.findApById(id).subscribe( resaccpurchase => {
						this.totalField = resaccpurchase.data.AP.totalField
						this.isStatus = resaccpurchase.data.AP.status

						for (let i = 0; i < this.totalField; i++) {
							this.ccList.push({
								id: '',
								refCc: '',
								name: ''
							})
						}

						this.ap = resaccpurchase.data;

						this.valuePaidFrom = resaccpurchase.data.AP.paidFrom.acctName

						this.oldAp = Object.assign({}, this.ap);
						this.initAp();

						this.viewApResult.disable();
						this.viewApResult.setValue(
							`${resaccpurchase.data.AP.depositTo.acctName.toLocaleLowerCase()}`
						);
						this._filterCashbankList(
							`${resaccpurchase.data.AP.depositTo.acctName.toLocaleLowerCase()}`
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
			else valIsDeb = true

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

	addCC() {
		this.ccList.push({
			id: '',
			refCc: '',
			name: ''
		});

		this.totalField = this.totalField += 1

		this.table.renderRows();
	}

	loadBank() {
		this.selection.clear();
		this.loading.bank = true;
		const queryParams = new QueryBankModel(null, "asc", null, 1, 1000);
		this.serviceBank.getListBank(queryParams).subscribe((res) => {
			this.bankResult = res.data;
			this.loading.bank = false;
		});
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
		for (let i = 1; i <= 30; i++) {
			if (e.target.name == i) controls.multiGLAccount.get(('amount' + i)).setValue(null)
		}
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
			if (this.ap.AP.multiGLAccount[`amount${i}`] !== undefined || this.ap.AP.multiGLAccount[`amount${i}`] !== null) amount = this.serviceFormat.rupiahFormatImprovement(this.ap.AP.multiGLAccount[`amount${i}`] == undefined || this.ap.AP.multiGLAccount[`amount${i}`] == null ? 0 : this.ap.AP.multiGLAccount[`amount${i}`]);
			if (this.ap.AP.multiGLAccount[`isDebit${i}`] !== undefined || this.ap.AP.multiGLAccount[`isDebit${i}`] !== null) isDebit = this.ap.AP.multiGLAccount[`isDebit${i}`];

			objFormMultiGl[`glAccountId${i}`] = [{ value: glid, disabled: true }];
			objFormMultiGl[`glAcc${i}`] = [{ value: glacc, disabled: true }];
			objFormMultiGl[`memo${i}`] = [{ value: memo, disabled: true }];
			objFormMultiGl[`amount${i}`] = [{ value: amount, disabled: true }];
			objFormMultiGl[`isDebit${i}`] = [{ value: isDebit, disabled: true }];

		}

		this.apForm = this.apFB.group({
			depositTo: [this.ap.AP.depositTo, Validators.required],
			voucherno: [{ value: this.ap.AP.voucherno, disabled: true }, Validators.required],
			rate: [{ value: this.ap.AP.rate, disabled: true }], //number
			// payFrom: [{ value: this.ap.AP.paidFrom, disabled: true }, Validators.required],
			date: [{ value: this.ap.AP.date, disabled: true }, Validators.required], // number
			createdBy: [{ value: this.ap.AP.createdBy, disabled: true }], // number
			crtdate: [{ value: this.ap.AP.crtdate, disabled: true }], // number
			status: [{ value: this.ap.AP.status, disabled: true }],
			paidFrom: [{ value: this.ap.AP.paidFrom == undefined ? "" : this.ap.AP.paidFrom.acctName, disabled: true }, Validators.required],
			multiGLAccount: this.apFB.group(objFormMultiGl),
			payTo: [{ value: this.ap.AP.payTo, disabled: true }],
			payee: [{ value: this.ap.AP.payee, disabled: true }],
			noAccount: [{ value: this.ap.AP.noAccount, disabled: true }],
			bank: [{ value: this.ap.AP.bank == null ? "" : this.ap.AP.bank._id, disabled: true }],

			// glaccount: [this.ap.AP.depositTo],
		});
	}

	changeStatus() {
		const controls = this.apForm.controls;
		this.isStatus = controls.status.value
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
		this.selection.clear();
		const queryParams = new QueryParamsModel(null, "asc", null, 1, 10000);
		this.COAService.getListCashBank(queryParams).subscribe((res) => {
			this.apResult = res.data;
			this.apListResultFiltered = this.apResult.slice();
			this.viewApResult.disable();
			this.cd.markForCheck();
			this.loading.deposit = false;
		});
	}

	/**
	 * @papam value
	 */
	_setGlValue(value) {
		this.apForm.patchValue({ glaccount: value._id });
	}

	_onKeyupGL(e: any) {
		this._filterGLList(e.tapget.value);
	}

	_filterGLList(text: string) {
		this.apListResultFiltered = this.apResult.filter((i) => {
			const filterText = `${i.acctNo.toLocaleLowerCase()} - ${i.acctName.toLocaleLowerCase()}`;

			if (filterText.includes(text.toLocaleLowerCase())) return i;
		});
		this.loadGLAccountAP(text)
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

	getComponentTitle() {
		let result = `View Account Payment`;
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
}
