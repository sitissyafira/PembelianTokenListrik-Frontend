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
import { MatTable } from "@angular/material";
import { ServiceFormat } from "../../../../../../core/serviceFormat/format.service";

@Component({
	selector: "kt-view-writeOff",
	templateUrl: "./view-writeOff.component.html",
	styleUrls: ["./view-writeOff.component.scss"],
})
export class ViewWriteOffComponent implements OnInit, OnDestroy {
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
	valueBill: any

	ccList = [];

	loading = {
		deposit: false,
		submit: false,
		glaccount: false,
	};

	writeOffListResultFiltered = [];
	viewWriteOffResult = new FormControl();
	gLListResultFiltered = [];

	isTransWriteOff: boolean = true;
	// isSelectVoucher: boolean = true;
	isSelectVoucher: boolean = false;
	isOpenPayCond: boolean = true;
	isOpenDatePayCond: boolean = true;

	tagihanBillingData: any = []

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

	checked = {
		date: {
			control: new FormControl()
		},
		control: new FormControl(),
	};

	@ViewChild('myTable', { static: false }) table: MatTable<any>;
	displayedColumns = ['no', 'gl', 'amount', 'desc', 'isdebit'];
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
	) { }



	ngOnInit() {
		this.loading$ = this.store.pipe(select(selectWriteOffActionLoading));
		const routeSubscription = this.activatedRoute.params.subscribe(
			(params) => {
				const id = params.id;
				if (id) {
					this.service.findWriteOffById(id).subscribe( resjouwriteoff => {
						this.totalField = resjouwriteoff.data.JW.totalField

						this.writeOff = resjouwriteoff.data;
						this.isStatus = resjouwriteoff.data.JW.status
						// this.valueBill = resjouwriteoff.data.JW.ARID.voucherno

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

						for (let i = 0; i < this.totalField; i++) {
							this.ccList.push({
								id: '',
								refCc: '',
								name: ''
							})
						}

						this.writeOff = resjouwriteoff.data;

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
		this.loadGLAccountAR(null);
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
	}

	clickToggle(e) {
		const controls = this.writeOffForm.controls;
		for (let i = 1; i <= 30; i++) {
			if (e.target.name == i) controls.multiGLAccount.get(('amount' + i)).setValue(null)
		}
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
			if (this.writeOff.JW.multiGLAccount[`amount${i}`] !== undefined) amount = this.serviceFormat.rupiahFormatImprovement(this.writeOff.JW.multiGLAccount[`amount${i}`] == undefined || this.writeOff.JW.multiGLAccount[`amount${i}`] == null ? 0 : this.writeOff.JW.multiGLAccount[`amount${i}`]);
			if (this.writeOff.JW.multiGLAccount[`isDebit${i}`] !== undefined) isDebit = this.writeOff.JW.multiGLAccount[`isDebit${i}`];

			objFormMultiGl[`glAccountId${i}`] = [{ value: glid, disabled: true }];
			objFormMultiGl[`glAcc${i}`] = [{ value: glacc, disabled: true }];
			objFormMultiGl[`memo${i}`] = [{ value: memo, disabled: true }];
			objFormMultiGl[`amount${i}`] = [{ value: amount, disabled: true }];
			objFormMultiGl[`isDebit${i}`] = [{ value: isDebit, disabled: true }];

		}

		this.writeOffForm = this.writeOffFB.group({
			// depositTo: [{ value: this.writeOff.JW.depositTo._id, disabled: true }],
			// voucherno: [{ value: this.writeOff.JW.voucherno, disabled: true }],
			rate: [{ value: this.writeOff.JW.rate, disabled: true }],
			date: [{ value: this.writeOff.JW.date, disabled: true }],

			payFrom: [{ value: this.writeOff.JW.payFrom, disabled: true }],
			createdBy: [{ value: this.writeOff.JW.createdBy, disabled: true }],
			crtdate: [{ value: this.writeOff.JW.crtdate, disabled: true }],
			status: [{ value: this.writeOff.JW.status, disabled: true }],
			printSize: [{ value: this.writeOff.JW.printSize, disabled: true }],
			voucherAR: [{ value: (this.writeOff.JW.ARID.voucherno + ' - ' + (this.writeOff.JW.ARID.memo == undefined ? "" : this.writeOff.JW.ARID.memo)), disabled: true }],
			ARID: [this.writeOff.JW.ARID],

			// saldoVoucher: [{ value: amount1 == amount2 ? this.serviceFormat.rupiahFormatImprovement(amount1) : "", disabled: true }],

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

	_filterCashbankList(text: string) {
		this.writeOffListResultFiltered = this.writeOffResult.filter((i) => {
			const filterText = `${i.acctNo.toLocaleLowerCase()}`;
			if (filterText.includes(text.toLocaleLowerCase())) return i;
		});
	}

	valuePayCond(e) {
		this.isOpenDatePayCond = false
	}

	loadCOACashBank() {
		this.selection.clear();
		const queryParams = new QueryParamsModel(null, "asc", null, 1, 10000);
		this.COAService.getListCashBank(queryParams).subscribe((res) => {
			this.writeOffResult = res.data;
			this.writeOffListResultFiltered = this.writeOffResult.slice();
			this.viewWriteOffResult.disable();
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
		this.writeOffListResultFiltered = this.writeOffResult.filter((i) => {
			const filterText = `${i.acctNo.toLocaleLowerCase()} - ${i.acctName.toLocaleLowerCase()}`;

			if (filterText.includes(text.toLocaleLowerCase())) return i;
		});
		this.loadGLAccountAR(text)
	}

	voucherDateHandler(e) {
		const controls = this.writeOffForm.controls;
	}

	loadGLAccountAR(text) {
		this.loading.glaccount = true;
		this.selection.clear();
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

	goBackWithId() {
		const url = `/writeOff`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}

	detailTagihanBill(voucherNo) {
		const queryParams = new QueryParamsModel(voucherNo, "asc", null, 1, 10);
		this.service.getDetailTagihanBill(queryParams).subscribe((res) => {
			this.tagihanBillingData = res.data
			this.cd.markForCheck()
		});
	}

	getComponentTitle() {
		let result = `View Journal Write Off`;
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
