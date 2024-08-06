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
import { AmortizationModel } from "../../../../../../core/finance/journal/amortization/amortization.model";
import {
	selectAmortizationActionLoading,
	selectAmortizationById,
} from "../../../../../../core/finance/journal/amortization/amortization.selector";
import { AmortizationService } from "../../../../../../core/finance/journal/amortization/amortization.service";
import { SelectionModel } from "@angular/cdk/collections";
import { AccountGroupService } from "../../../../../../core/accountGroup/accountGroup.service";
import { MatTable } from "@angular/material";
import { ServiceFormat } from "../../../../../../core/serviceFormat/format.service";

@Component({
	selector: "kt-edit-amortization",
	templateUrl: "./edit-amortization.component.html",
	styleUrls: ["./edit-amortization.component.scss"],
})
export class EditAmortizationComponent implements OnInit, OnDestroy {
	amortization: AmortizationModel;
	AmortizationId$: Observable<string>;
	oldAmortization: AmortizationModel;
	selectedTab = 0;
	loading$: Observable<boolean>;
	selection = new SelectionModel<AmortizationModel>(true, []);
	amortizationResult: any[] = [];
	glResult: any[] = [];
	amortizationForm: FormGroup;
	date1 = new FormControl(new Date());
	hasFormErrors = false;
	isStatus: boolean = false;
	private subscriptions: Subscription[] = [];

	voucherBillFiltered = [];
	voucherBillResult = [];

	totalField: number = 0

	ccList = [];
	ccList2 = [];

	loading = {
		deposit: false,
		submit: false,
		glaccount: false,
		glaccount2: false,
		voucherBill: false
	};

	amortizationListResultFiltered = [];
	viewAmortizationResult = new FormControl();
	gLListResultFiltered = [];
	gLListResultFiltered2 = [];

	@ViewChild('myTable', { static: false }) table: MatTable<any>;
	@ViewChild('myTable2', { static: false }) table2: MatTable<any>;
	displayedColumns = ['no', 'gl', 'amount', 'desc', 'isdebit', 'action'];
	displayedColumns2 = ['no2', 'gl2', 'amount2', 'desc2', 'isdebit2', 'action2'];
	constructor(
		private activatedRoute: ActivatedRoute,
		private serviceFormat: ServiceFormat,
		private router: Router,
		private amortizationFB: FormBuilder,
		private layoutUtilsService: LayoutUtilsService,
		private store: Store<AppState>,
		private service: AmortizationService,
		private COAService: AccountGroupService,
		private cd: ChangeDetectorRef,
	) { }

	ngOnInit() {
		this.loading$ = this.store.pipe(select(selectAmortizationActionLoading));
		const routeSubscription = this.activatedRoute.params.subscribe(
			(params) => {
				const id = params.id;
				if (id) {
					this.service.findAmortizationById(id).subscribe( resjouamor => {
						this.totalField = resjouamor.data.JA.totalField

						// for (let i = 0; i < this.totalField; i++) {
						this.ccList.push({ id: '', refCc: '', name: '' })
						this.ccList2.push({ id: '', refCc: '', name: '' })
						// }

						this.amortization = resjouamor.data;


						this.oldAmortization = Object.assign({}, this.amortization);
						this.initAmortization();

						this.viewAmortizationResult.disable();
						this.viewAmortizationResult.setValue(
							`${resjouamor.data.JA.depositTo.acctName.toLocaleLowerCase()}`
						);
						this._filterCashbankList(
							`${resjouamor.data.JA.depositTo.acctName.toLocaleLowerCase()}`
						);


						this._filterGLList(
							`${resjouamor.data.JA.glaccount.acctName.toLocaleLowerCase()}`
						);

						this.initAmortization();
						// }
						// });
					})

				}
			}
		);
		this.subscriptions.push(routeSubscription);
	}



	valueChecked(choose) {
		for (let i = 1; i <= 30; i++) {
			let valIsDeb
			if (this.amortization.JA.multiGLAccount[`isDebit${i}`] != undefined) valIsDeb = this.amortization.JA.multiGLAccount[`isDebit${i}`];
			else valIsDeb = true

			if (choose == ('deb' + i)) return valIsDeb;
			else if (choose == ('cred' + i)) return !valIsDeb
		}
	}

	initAmortization() {
		this.createForm();
		this.loadCOACashBank();
		this.loadVoucherBill(null)
		this.loadGLAccountJA(null);
		this.loadGLAccountJA2(null);

	}

	printOptions = [
		{ value: "A5", name: "A5" },
		{ value: "A4", name: "A4" },
	];

	ifMaksField: boolean = false

	_setVoucherBill(value) {
		const controls = this.amortizationForm.controls;
		controls.ARID.setValue(value._id)
	}

	addCC(e) {
		const controls = this.amortizationForm.controls;
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
		this.ccList.push({ id: '', refCc: '', name: '' });
		this.ccList2.push({ id: '', refCc: '', name: '' });
		this.totalField = this.totalField += 2

		this.table.renderRows();
		this.table2.renderRows();
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

	// voucher Bill Start
	_onKeyupVoucherBill(e: any) {
		this.amortizationForm.patchValue({ ARID: undefined });
		this._filterVoucherBillList(e.target.value);
	}

	_filterVoucherBillList(text: string) {
		this.loadVoucherBill(text)
	}
	// End

	removeCC(i: number) {
		const controls = this.amortizationForm.controls;
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
		const controls = this.amortizationForm.controls;
		for (let i = 1; i <= 30; i++) {
			if (target == ('target' + i)) {
				controls.multiGLAccount.get(('glAcc' + i)).setValue(`${value.acctNo} - ${value.acctName}`)
				controls.multiGLAccount.get(('glAccountId' + i)).setValue(value._id)
			}
		}
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
		let controls = this.amortizationForm.controls;
		let value = event
			? event.target.value.replace(/\./g, "")
			: values.toString();

		//Make sure it is not undefined, but atleast 0
		if (value === "" || value === NaN) {
			value = "0";
		}

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

			//Set Raw Value
			this[rawValueProps] = intValue;

			//Set Formatted Value
			controls.multiGLAccount.get(`amount${id}`).setValue(formattedNumber);

			return formattedNumber;
		} else {
			controls[formName].setValue(value.substring(0, value.length - 1));
		}
	}

	clickToggle(e) {
		const controls = this.amortizationForm.controls;
		// for (let i = 1; i <= 30; i++) {
		// 	if (e.target.name == i) controls.multiGLAccount.get(('amount' + i)).setValue(null)
		// }
		this.cd.markForCheck()
	}

	valueIsDebit(e) {
		const controls = this.amortizationForm.controls;
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
			if (this.amortization.multiGLID[`glId${i}`] !== undefined) glid = this.amortization.multiGLID[`glId${i}`]._id;
			if (this.amortization.multiGLID[`glId${i}`] !== undefined) glacc = this.amortization.multiGLID[`glId${i}`].acctName;
			if (this.amortization.JA.multiGLAccount[`memo${i}`] !== undefined) memo = this.amortization.JA.multiGLAccount[`memo${i}`];
			if (this.amortization.JA.multiGLAccount[`amount${i}`] !== undefined) amount = this.serviceFormat.rupiahFormatImprovement(this.amortization.JA.multiGLAccount[`amount${i}`] == undefined || this.amortization.JA.multiGLAccount[`amount${i}`] == null ? "" : this.amortization.JA.multiGLAccount[`amount${i}`]);
			if (this.amortization.JA.multiGLAccount[`isDebit${i}`] !== undefined) isDebit = this.amortization.JA.multiGLAccount[`isDebit${i}`];

			objFormMultiGl[`glAccountId${i}`] = [{ value: glid, disabled: true }];
			objFormMultiGl[`glAcc${i}`] = [{ value: glacc, disabled: true }];
			objFormMultiGl[`memo${i}`] = [{ value: memo, disabled: true }];
			objFormMultiGl[`amount${i}`] = [{ value: amount, disabled: true }];
			objFormMultiGl[`isDebit${i}`] = [{ value: isDebit, disabled: true }];

		}

		this.amortizationForm = this.amortizationFB.group({
			depositTo: [this.amortization.JA.depositTo == undefined ? "" : this.amortization.JA.depositTo._id],
			voucherno: [this.amortization.JA.voucherno],
			rate: [this.amortization.JA.rate],
			date: [this.amortization.JA.date],

			payFrom: [this.amortization.JA.payFrom],
			createdBy: [this.amortization.JA.createdBy],
			crtdate: [this.amortization.JA.crtdate],
			status: [this.amortization.JA.status],
			printSize: [this.amortization.JA.printSize],
			ARID: [this.amortization.JA.ARID == undefined ? "" : this.amortization.JA.ARID.id],
			nameARID: [this.amortization.JA.ARID == undefined ? "" : (`${this.amortization.JA.ARID.voucherno} - ${this.amortization.JA.ARID.memo.toUpperCase()}`)],

			multiGLAccount: this.amortizationFB.group(objFormMultiGl),
		})
	}


	changeStatus() {
		const controls = this.amortizationForm.controls;
		if (this.isStatus == true) {
			controls.status.setValue(true);
		} else {
			controls.status.setValue(false);
		}
	}

	/**
	 * @pamortizationam value
	 */
	_setAmortizationValue(value) {
		this.amortizationForm.patchValue({ depositTo: value._id });
	}

	_onKeyup(e: any) {
		this.amortizationForm.patchValue({ depositTo: undefined });
		this._filterCashbankList(e.target.value);
	}

	_filterCashbankList(text: string) {
		this.amortizationListResultFiltered = this.amortizationResult.filter((i) => {
			const filterText = `${i.acctNo.toLocaleLowerCase()}`;
			if (filterText.includes(text.toLocaleLowerCase())) return i;
		});
	}

	loadCOACashBank() {
		this.selection.clear();
		const queryParams = new QueryParamsModel(null, "asc", null, 1, 10000);
		this.COAService.getListCashBank(queryParams).subscribe((res) => {
			this.amortizationResult = res.data;
			this.amortizationListResultFiltered = this.amortizationResult.slice();
			this.viewAmortizationResult.enable();
			this.cd.markForCheck();
			this.loading.deposit = false;
		});
	}

	/**
	 * @pamortizationam value
	 */
	_setGlValue(value) {
		this.amortizationForm.patchValue({ glaccount: value._id });
	}

	_onKeyupGL(e: any) {
		// this.amortizationForm.patchValue({ glaccount: undefined });
		this._filterGLList(e.target.value);
	}

	_filterGLList(text: string) {
		this.loadGLAccountJA(text)
	}

	_onKeyupGL2(e: any) {
		this.amortizationForm.patchValue({ glaccount: undefined });
		this._filterGLList2(e.target.value);
	}

	_filterGLList2(text: string) {
		this.loadGLAccountJA2(text)
	}

	loadGLAccountJA(text) {
		this.selection.clear();
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
			this.cd.markForCheck();
		});

	}
	loadGLAccountJA2(text) {
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

	goBackWithId() {
		const url = `/amortization`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}

	refreshAmortization(isNew: boolean = false, id: string = "") {
		let url = this.router.url;
		if (!isNew) {
			this.router.navigate([url], { relativeTo: this.activatedRoute });
			return;
		}

		url = `/amortization/edit/${id}`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}

	onSubmit(withBack: boolean = false) {
		const controls = this.amortizationForm.controls;
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
		// Validation End
		this.loading.submit = true;
		this.hasFormErrors = false;
		if (this.amortizationForm.invalid) {
			Object.keys(controls).forEach((controlName) =>
				controls[controlName].markAsTouched()
			);
			this.loading.submit = false;
			this.hasFormErrors = true;
			this.selectedTab = 0;
			return;
		}

		const editedAmortization = this.prepareAmortization();
		this.updateAmortization(editedAmortization, withBack);
	}

	prepareAmortization(): AmortizationModel {
		const controls = this.amortizationForm.controls;
		const _amortization = new AmortizationModel();

		let objRes = {}
		for (let i = 2; i <= 30; i++) {
			const a = controls.multiGLAccount.get(`amount${i}`).value
			// const amountLoop = a.replace(/\./g, "");
			const amountLoop = controls.multiGLAccount.get(`amount${i}`).value == undefined || controls.multiGLAccount.get(`amount${i}`).value == null ? "" : a.replace(/\./g, "");

			objRes[`glAcc${i}`] = controls.multiGLAccount.get(`glAccountId${i}`).value;
			objRes[`memo${i}`] = controls.multiGLAccount.get(`memo${i}`).value;
			objRes[`amount${i}`] = controls.multiGLAccount.get(`amount${i}`).value == "" || controls.multiGLAccount.get(`amount${i}`).value == undefined ? undefined : parseInt(amountLoop);
			objRes[`isDebit${i}`] = controls.multiGLAccount.get(`amount${i}`).value == "" ? undefined : controls.multiGLAccount.get(`isDebit${i}`).value
		}

		_amortization.clear();
		_amortization._id = this.amortization.JA._id;
		_amortization.depositTo = controls.depositTo.value == "" ? undefined : controls.depositTo.value;
		_amortization.voucherno = controls.voucherno.value;
		_amortization.date = controls.date.value;
		_amortization.rate = controls.rate.value;
		_amortization.createdBy = controls.createdBy.value;
		_amortization.crtdate = controls.crtdate.value;
		_amortization.status = controls.status.value;
		_amortization.printSize = controls.printSize.value;
		_amortization.payFrom = controls.payFrom.value;
		_amortization.totalField = this.totalField

		_amortization.ARID = controls.ARID.value;

		const a = controls.multiGLAccount.get('amount1').value;
		// const amount1 = a.replace(/\./g, "");
		const amount1 = controls.multiGLAccount.get(`amount1`).value == undefined || controls.multiGLAccount.get(`amount1`).value == null ? "" : a.replace(/\./g, "");

		_amortization.glaccount = controls.multiGLAccount.get('glAccountId1').value
		_amortization.memo = controls.multiGLAccount.get('memo1').value
		_amortization.amount = controls.multiGLAccount.get(`amount1`).value == "" || controls.multiGLAccount.get(`amount1`).value == undefined ? undefined : parseInt(amount1)
		_amortization.isDebit = controls.multiGLAccount.get(`amount1`).value == "" ? undefined : controls.multiGLAccount.get(`isDebit1`).value


		_amortization.multiGLAccount = objRes == {} ? undefined : objRes

		return _amortization;
	}

	updateAmortization(_amortization: AmortizationModel, withBack: boolean = false) {
		const addSubscription = this.service.updateAmortization(_amortization).subscribe(
			(res) => {
				this.loading.submit = false;
				const message = `Journal Amortization successfully has been saved.`;
				this.layoutUtilsService.showActionNotification(
					message,
					MessageType.Update,
					5000,
					true,
					true
				);
				const url = `/amortisasi`;
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
		let result = `Edit Journal Amortization`;
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
