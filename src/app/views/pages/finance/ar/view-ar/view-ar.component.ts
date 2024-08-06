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
import { ArModel } from "../../../../../core/finance/ar/ar.model";
import {
	selectArActionLoading,
} from "../../../../../core/finance/ar/ar.selector";
import { ArService } from "../../../../../core/finance/ar/ar.service";
import { SelectionModel } from "@angular/cdk/collections";
import { AccountGroupService } from "../../../../../core/accountGroup/accountGroup.service";
import { MatTable } from "@angular/material";
import { ServiceFormat } from "../../../../../core/serviceFormat/format.service";

@Component({
	selector: "kt-view-ar",
	templateUrl: "./view-ar.component.html",
	styleUrls: ["./view-ar.component.scss"],
})
export class ViewArComponent implements OnInit, OnDestroy {
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
	statusPaid: boolean = false
	private subscriptions: Subscription[] = [];

	isSaldo: boolean = false

	totalField: number = 0

	ccList = [];

	loading = {
		deposit: false,
		submit: false,
		glaccount: false,
	};

	listHistoryAR: any = []
	selectSetOff: boolean = false;
	selectWriteOff: boolean = false;
	selectAr: boolean = false

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

	isSelectUnit: boolean = true;

	isSelectVoucher: boolean = false;
	isTransSetOff: boolean = false;
	isOpenPayCond: boolean = true;
	isOpenDatePayCond: boolean = true;
	isCheckAmoutWO: boolean = true
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

	arListResultFiltered = [];
	viewArResult = new FormControl();
	gLListResultFiltered = [];

	@ViewChild('myTable', { static: false }) table: MatTable<any>;
	displayedColumns = ['no', 'gl', 'amount', 'desc', 'isdebit'];
	constructor(
		private activatedRoute: ActivatedRoute,
		private serviceFormat: ServiceFormat,
		private router: Router,
		private arFB: FormBuilder,
		private store: Store<AppState>,
		private service: ArService,
		private COAService: AccountGroupService,
		private cd: ChangeDetectorRef,
	) { }

	ngOnInit() {
		this.loading$ = this.store.pipe(select(selectArActionLoading));
		const routeSubscription = this.activatedRoute.params.subscribe(
			(params) => {
				const id = params.id;
				if (id) {
					this.service.findArById(id).subscribe( resaccreceive => {
						this.totalField = resaccreceive.data.AR.totalField
						this.statusPaid = resaccreceive.data.AR.status
						this.isSaldo = resaccreceive.data.AR.isSaldo

						for (let i = 0; i < this.totalField; i++) {
							this.ccList.push({
								id: '',
								refCc: '',
								name: ''
							})
						}

						this.ar = resaccreceive.data;
						this.isStatus = resaccreceive.data.AR.status

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
						} else if(resaccreceive.data.AR.isJournal != undefined && resaccreceive.data.AR.isJournal == "ar"){
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
							if (resaccreceive.data.AR.payCond !== 'outstanding' &&
								resaccreceive.data.AR.payDate !== undefined) {
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
		this.createForm();
		this.loadCOACashBank();
		this.loadGLAccountAR(null);
		this.loadHistory()
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

	clickToggle(e) {
		const controls = this.arForm.controls;
		for (let i = 1; i <= 30; i++) {
			if (e.target.name == i) controls.multiGLAccount.get(('amount' + i)).setValue(null)
		}
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
			if (this.ar.AR.multiGLAccount[`amount${i}`] !== undefined) amount = this.serviceFormat.rupiahFormatImprovement(this.ar.AR.multiGLAccount[`amount${i}`] == undefined || this.ar.AR.multiGLAccount[`amount${i}`] == null ? 0 : this.ar.AR.multiGLAccount[`amount${i}`]);
			if (this.ar.AR.multiGLAccount[`isDebit${i}`] !== undefined) isDebit = this.ar.AR.multiGLAccount[`isDebit${i}`];

			objFormMultiGl[`glAccountId${i}`] = [{ value: glid, disabled: true }];
			objFormMultiGl[`glAcc${i}`] = [{ value: glacc, disabled: true }];
			objFormMultiGl[`memo${i}`] = [{ value: memo, disabled: true }];
			objFormMultiGl[`amount${i}`] = [{ value: amount, disabled: true }];
			objFormMultiGl[`isDebit${i}`] = [{ value: isDebit, disabled: true }];

		}

		this.arForm = this.arFB.group({
			depositTo: [{ value: this.ar.AR.depositTo == undefined ? "" : this.ar.AR.depositTo._id, disabled: true }],
			voucherno: [{ value: this.ar.AR.voucherno, disabled: true }],
			rate: [{ value: this.ar.AR.rate, disabled: true }],
			date: [{ value: this.ar.AR.date, disabled: true }],
			unitName: [{ value: this.ar.AR.unit2, disabled: true }],
			payFrom: [{ value: this.ar.AR.payFrom, disabled: true }],
			createdBy: [{ value: this.ar.AR.createdBy, disabled: true }],
			crtdate: [{ value: this.ar.AR.crtdate, disabled: true }],
			status: [{ value: this.ar.AR.status, disabled: true }],
			printSize: [{ value: this.ar.AR.printSize, disabled: true }],
			payCond: [this.ar.AR.payCond == undefined ? "" : this.ar.AR.payCond],
			payDate: [this.ar.AR.payDate == undefined ? "" : this.ar.AR.payDate],
			payAmount: [this.ar.AR.paidAmount == undefined ? "" : this.serviceFormat.rupiahFormatImprovement(this.ar.AR.paidAmount)],
			underPayment: [this.ar.AR.underPayment == undefined ? "" : this.serviceFormat.rupiahFormatImprovement(this.ar.AR.underPayment)],

			isJournal: [{value: this.ar.AR.isJournal, disabled:true}],
			multiGLAccount: this.arFB.group(objFormMultiGl),
		})
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

	voucherDateHandler(e) {
		const controls = this.arForm.controls;
		controls.payDate.setValue(this.checked.date.control.value)
	}

	valuePayCond(e) {
		const controls = this.arForm.controls;
		this.isOpenDatePayCond = false
		controls.payCond.setValue(e)
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

	_filterCashbankList(text: string) {
		this.arListResultFiltered = this.arResult.filter((i) => {
			const filterText = `${i.acctNo.toLocaleLowerCase()}`;
			if (filterText.includes(text.toLocaleLowerCase())) return i;
		});
	}
	formatVoucherno(item) {
		if (typeof item == "string") return item

		let result;
		if (item.length == 1) return result = item[0];
		else if (item.length > 1) return result = item[0] + " & " + (item.length - 1) + " more";
	}

	_getStatusClass(status) {

		if (status.payCond == "parsial-kurang") return 'chip chip--parsial-kurang-so';
		else if (status.payCond == "parsial-lebih") return 'chip chip--parsial-lebih-so';
		else if (status.payCond == "full-payment") return 'chip chip--full-payment-so';
		else if (status.payCond == "outstanding") return 'chip chip--danger';
	}

	loadCOACashBank() {
		this.selection.clear();
		const queryParams = new QueryParamsModel(null, "asc", null, 1, 10000);
		this.COAService.getListCashBank(queryParams).subscribe((res) => {
			this.arResult = res.data;
			this.arListResultFiltered = this.arResult.slice();
			this.viewArResult.disable();
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
		this.arListResultFiltered = this.arResult.filter((i) => {
			const filterText = `${i.acctNo.toLocaleLowerCase()} - ${i.acctName.toLocaleLowerCase()}`;

			if (filterText.includes(text.toLocaleLowerCase())) return i;
		});
		this.loadGLAccountAR(text)
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

	loadHistory() {
		this.service.listHistoryAR(this.ar.AR._id).subscribe((res) => {
			this.listHistoryAR = res.data
		});
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

	getComponentTitle() {
		let result = `View Account Receive`;
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
