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
import { MatTable } from "@angular/material";
import { ServiceFormat } from "../../../../../../core/serviceFormat/format.service";

@Component({
	selector: "kt-view-setOff",
	templateUrl: "./view-setOff.component.html",
	styleUrls: ["./view-setOff.component.scss"],
})
export class ViewSetOffComponent implements OnInit, OnDestroy {
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
	private subscriptions: Subscription[] = [];

	totalField: number = 0
	valueBill: any


	ccList = [];

	loading = {
		deposit: false,
		submit: false,
		glaccount: false,
	};

	selectedVoucherno = []

	setOffListResultFiltered = [];
	viewSetOffResult = new FormControl();
	gLListResultFiltered = [];

	isTransSetOff: boolean = true;
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
		private setOffFB: FormBuilder,
		private store: Store<AppState>,
		private service: SetOffService,
		private COAService: AccountGroupService,
		private cd: ChangeDetectorRef,
	) { }

	ngOnInit() {
		this.loading$ = this.store.pipe(select(selectSetOffActionLoading));
		const routeSubscription = this.activatedRoute.params.subscribe(
			(params) => {
				const id = params.id;
				if (id) {
					this.service.findSetOffById(id).subscribe( resjousetoff => {
						this.totalField = resjousetoff.data.JS.totalField
						this.setOff = resjousetoff.data;
						this.isStatus = resjousetoff.data.JS.status
						this.valueBill = resjousetoff.data.JS.ARID.unit2

						resjousetoff.data.JS.voucherno.forEach(data => {
							this.selectedVoucherno.push({ voucherno: data.voucherno, amount: data.amount, _id: data._id })
						})

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

						for (let i = 0; i < this.totalField; i++) {
							this.ccList.push({
								id: '',
								refCc: '',
								name: ''
							})
						}
						this.setOff = resjousetoff.data;

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
		this.loadGLAccountAR(null);
		this.detailTagihanBill(this.valueBill)

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
	}

	clickToggle(e) {
		const controls = this.setOffForm.controls;
		for (let i = 1; i <= 30; i++) {
			if (e.target.name == i) controls.multiGLAccount.get(('amount' + i)).setValue(null)
		}
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

		let amountTotal = 0
		this.setOff.JS.voucherno.forEach(data => amountTotal += data.amount)

		let objFormMultiGl = {}
		for (let i = 1; i <= 30; i++) {
			let glid, glacc, memo, amount, isDebit;
			if (this.setOff.multiGLID[`glId${i}`] !== undefined) glid = this.setOff.multiGLID[`glId${i}`]._id;
			if (this.setOff.multiGLID[`glId${i}`] !== undefined) glacc = this.setOff.multiGLID[`glId${i}`].acctName;
			if (this.setOff.JS.multiGLAccount[`memo${i}`] !== undefined) memo = this.setOff.JS.multiGLAccount[`memo${i}`];
			if (this.setOff.JS.multiGLAccount[`amount${i}`] !== undefined) amount = this.serviceFormat.rupiahFormatImprovement(this.setOff.JS.multiGLAccount[`amount${i}`] == undefined || this.setOff.JS.multiGLAccount[`amount${i}`] == null ? 0 : this.setOff.JS.multiGLAccount[`amount${i}`]);
			if (this.setOff.JS.multiGLAccount[`isDebit${i}`] !== undefined) isDebit = this.setOff.JS.multiGLAccount[`isDebit${i}`];

			objFormMultiGl[`glAccountId${i}`] = [{ value: glid, disabled: true }];
			objFormMultiGl[`glAcc${i}`] = [{ value: glacc, disabled: true }];
			objFormMultiGl[`memo${i}`] = [{ value: memo, disabled: true }];
			objFormMultiGl[`amount${i}`] = [{ value: amount, disabled: true }];
			objFormMultiGl[`isDebit${i}`] = [{ value: isDebit, disabled: true }];

		}

		this.setOffForm = this.setOffFB.group({
			// depositTo: [{ value: this.setOff.JS.depositTo._id, disabled: true }],
			voucherno: [{ value: this.setOff.JS.voucherno, disabled: true }],
			rate: [{ value: this.setOff.JS.rate, disabled: true }],
			date: [{ value: this.setOff.JS.date, disabled: true }],

			payFrom: [{ value: this.setOff.JS.payFrom, disabled: true }],
			createdBy: [{ value: this.setOff.JS.createdBy, disabled: true }],
			crtdate: [{ value: this.setOff.JS.crtdate, disabled: true }],
			status: [{ value: this.setOff.JS.status, disabled: true }],
			printSize: [{ value: this.setOff.JS.printSize, disabled: true }],
			voucherAR: [{ value: (this.setOff.JS.ARID.voucherno + ' - ' + this.setOff.JS.ARID.unit2), disabled: true }],
			ARID: [this.setOff.JS.ARID],

			totalTagihan: [{ value: this.serviceFormat.rupiahFormatImprovement(amountTotal), disabled: true }],

			saldoVoucher: [{ value: amount1 == amount2 ? this.serviceFormat.rupiahFormatImprovement(amount1) : "", disabled: true }],

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

	_filterCashbankList(text: string) {
		this.setOffListResultFiltered = this.setOffResult.filter((i) => {
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

			this.setOffResult = res.data;
			this.setOffListResultFiltered = this.setOffResult.slice();
			this.viewSetOffResult.disable();
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

	_filterGLList(text: string) {
		this.setOffListResultFiltered = this.setOffResult.filter((i) => {
			const filterText = `${i.acctNo.toLocaleLowerCase()} - ${i.acctName.toLocaleLowerCase()}`;

			if (filterText.includes(text.toLocaleLowerCase())) return i;
		});
		this.loadGLAccountAR(text)
	}

	voucherDateHandler(e) {
		const controls = this.setOffForm.controls;
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
		const url = `/setOff`;
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
		let result = `View Journal Set Off`;
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
