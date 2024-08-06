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
import { AmortizationModel } from "../../../../../../core/finance/journal/amortization/amortization.model";
import { selectAmortizationActionLoading } from "../../../../../../core/finance/journal/amortization/amortization.selector";
import { AmortizationService } from "../../../../../../core/finance/journal/amortization/amortization.service";
import { SelectionModel } from "@angular/cdk/collections";
import { AccountGroupService } from "../../../../../../core/accountGroup/accountGroup.service";
import { MatTable } from "@angular/material";
import { result } from "lodash";
import { ServiceFormat } from "../../../../../../core/serviceFormat/format.service";
import { MatDialog } from '@angular/material';
import { ConfirmationDialog } from "../../../../../partials/module/confirmation-popup/confirmation.dialog.component";
@Component({
	selector: "kt-add-amortization",
	templateUrl: "./add-amortization.component.html",
	styleUrls: ["./add-amortization.component.scss"],
})
export class AddAmortizationComponent implements OnInit, OnDestroy {
	amortization: AmortizationModel;
	AmortizationId$: Observable<string>;
	oldAmortization: AmortizationModel;
	selectedTab = 0;
	loading$: Observable<boolean>;
	selection = new SelectionModel<AmortizationModel>(true, []);
	amortizationResult: any[] = [];
	glResult: any[] = [];
	accountReceive: any[] = [];
	amortizationForm: FormGroup;
	date1 = new FormControl(new Date());
	hasFormErrors = false;
	isStatus: boolean = false;




	@ViewChild('myTable', { static: false }) table: MatTable<any>;
	@ViewChild('myTable2', { static: false }) table2: MatTable<any>;
	displayedColumns = ['no', 'gl', 'amount', 'desc', 'isdebit', 'action'];
	displayedColumns2 = ['no2', 'gl2', 'amount2', 'desc2', 'isdebit2', 'action2'];


	amortizationListResultFiltered = [];
	viewAmortizationResult = new FormControl();

	totalField: number = 0
	balanced: boolean = false
	invalid: boolean = false

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
	constructor(
		private activatedRoute: ActivatedRoute,
		private router: Router,
		private amortizationFB: FormBuilder,
		private subheaderService: SubheaderService,
		private layoutUtilsService: LayoutUtilsService,
		private store: Store<AppState>,
		private service: AmortizationService,
		private COAService: AccountGroupService,
		private layoutConfigService: LayoutConfigService,
		private cd: ChangeDetectorRef,
		private serviceFormat: ServiceFormat,
		private dialog: MatDialog,
	) { }

	ngOnInit() {
		this.loading$ = this.store.pipe(select(selectAmortizationActionLoading));
		this.amortization = new AmortizationModel();
		this.amortization.clear();
		this.initAmortization();
		this.loadVoucherBill(null)
	}

	initAmortization() {
		this.createForm();
		this.loadCOACashBank();
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

		this.amortizationForm = this.amortizationFB.group({
			depositTo: [""],
			voucherno: ["", Validators.required],
			rate: [{ value: "IDR", disabled: false }], //number
			glaccount: [""],
			payFrom: [{ value: "AMORTIZATION JOURNAL", disabled: false }, Validators.required],
			date: [this.date1.value, Validators.required], // number
			createdBy: [this.amortization.createdBy], // number
			crtdate: [{ value: this.date1.value, disabled: true }], // number
			status: [this.amortization.status],
			printSize: [this.amortization.printSize],

			ARID: [""],

			multiGLAccount: this.amortizationFB.group(objFormMultiGl),
		});
	}

	ccList = [];
	ccList2 = [];
	ifMaksField: boolean = false


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

		this.table.renderRows();

	}

	addCCEmpty() {
		const controls = this.amortizationForm.controls;
		this.ccList.push({ id: '', refCc: '', name: '' })
		this.ccList2.push({ id: '', refCc: '', name: '' });

		this.totalField = this.totalField += 2

		controls.multiGLAccount.get(('isDebit' + 1)).setValue(true)
		controls.multiGLAccount.get(('isDebit' + 2)).setValue(false)

		this.table.renderRows();
		this.table2.renderRows();

	}


	removeCC(i: number) {
		const controls = this.amortizationForm.controls;
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

	_setGLAccount(value, target) {

		const controls = this.amortizationForm.controls;
		for (let i = 1; i <= 30; i++) {
			if (target == ('target' + i)) {
				controls.multiGLAccount.get(('glAcc' + i)).setValue(`${value.acctNo} - ${value.acctName}`)
				controls.multiGLAccount.get(('glAccountId' + i)).setValue(value._id)
			}
		}
	}
	_setVoucherBill(value) {
		const controls = this.amortizationForm.controls;
		controls.ARID.setValue(value._id)
	}

	_onKeyupGL(e: any) {
		this.amortizationForm.patchValue({ glaccount: undefined });
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
	// voucher Bill Start
	_onKeyupVoucherBill(e: any) {
		this.amortizationForm.patchValue({ ARID: undefined });
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
			console.log(res, "gergrem");

			this.voucherBillResult = res.data
			this.voucherBillFiltered = res.data.slice();

			this.loading.voucherBill = false;
			this.cd.markForCheck();
		});

	}

	goBackWithId() {
		const url = `/amortisasi`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}

	refreshAmortization(isNew: boolean = false, id: string = "") {
		let url = this.router.url;
		if (!isNew) {
			this.router.navigate([url], { relativeTo: this.activatedRoute });
			return;
		}
		url = `/amortisasi/edit/${id}`;
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
		const controls = this.amortizationForm.controls;
		// Validation Start
		const valGL1 = controls.multiGLAccount.get('glAccountId1').value
		const valGL2 = controls.multiGLAccount.get('glAccountId2').value

		this.glAccountValidation()
		if(this.invalid){
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
		if(!this.balanced){
			this.layoutUtilsService.showActionNotification(
				"Amount is not Balanced",
				MessageType.Create,
				5000,
				true,
				true
			)
			return
		}
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
		const dialogRef = this.dialog.open(
			ConfirmationDialog, 
			{ 
				data: { 
					event: 'confirmation', 
					title:"Save", 
					subTitle:"Are you sure the data is correct?"
				},
				width: '300px',
				disableClose: true
			}
			);
			dialogRef.afterClosed().subscribe((result) => {
				console.log(result)
				if(result == true){
					const editedAmortization = this.prepamortizationeAmortization();
					this.addAmortization(editedAmortization, withBack);
				}else{
					return;
				}
		});
	}

	prepamortizationeAmortization(): AmortizationModel {
		const controls = this.amortizationForm.controls;
		const _amortization = new AmortizationModel();


		let objRes = {}
		for (let i = 2; i <= 30; i++) {
			const a = controls.multiGLAccount.get(`amount${i}`).value
			const amountLoop = a.replace(/\./g, "");

			objRes[`glAcc${i}`] = controls.multiGLAccount.get(`glAccountId${i}`).value;
			objRes[`memo${i}`] = controls.multiGLAccount.get(`memo${i}`).value;
			objRes[`amount${i}`] = controls.multiGLAccount.get(`amount${i}`).value == "" ? undefined : parseInt(amountLoop);
			objRes[`isDebit${i}`] = controls.multiGLAccount.get(`amount${i}`).value == "" ? undefined : controls.multiGLAccount.get(`isDebit${i}`).value
		}

		_amortization.clear();
		_amortization._id = this.amortization._id;
		_amortization.depositTo = controls.depositTo.value == "" ? undefined : controls.depositTo.value;
		_amortization.voucherno = controls.voucherno.value;
		_amortization.rate = controls.rate.value;
		_amortization.date = controls.date.value;
		_amortization.createdBy = controls.createdBy.value;
		_amortization.crtdate = controls.crtdate.value;
		_amortization.status = controls.status.value;
		_amortization.payFrom = controls.payFrom.value;
		_amortization.printSize = controls.printSize.value;
		_amortization.totalField = this.totalField

		_amortization.ARID = controls.ARID.value;

		const a = controls.multiGLAccount.get('amount1').value;
		const amount1 = a.replace(/\./g, "");

		_amortization.glaccount = controls.multiGLAccount.get('glAccountId1').value
		_amortization.amount = controls.multiGLAccount.get('amount1').value == "" ? undefined : parseInt(amount1)
		_amortization.memo = controls.multiGLAccount.get('memo1').value
		_amortization.isDebit = controls.multiGLAccount.get('amount1').value == "" ? undefined : controls.multiGLAccount.get('isDebit1').value

		_amortization.multiGLAccount = objRes

		return _amortization;
	}

	addAmortization(_amortization: AmortizationModel, withBack: boolean = false) {
		const addSubscription = this.service.createAmortization(_amortization).subscribe(
			(res) => {
				this.loading.submit = false;
				const message = `New Account receive successfully has been added.`;
				this.layoutUtilsService.showActionNotification(
					message,
					MessageType.Create,
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
		let result = "Create Journal Amortization";
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
	balancedValidation(){
		const controls = this.amortizationForm.controls
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
			if(totalAllDebit == totalAllCredit){
				this.balanced = true
			}else{
				this.balanced = false
			}
	}
	glAccountValidation(){
		const controls = this.amortizationForm.controls
		let list = []
		for(let i = 1; i <= this.totalField; i++){
			let gl = controls.multiGLAccount.get(`glAccountId${i}`).value
			list.push(gl != undefined )
		}
		this.invalid = list.some(item => item == false)
	}
}
