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
import { AdjustmentModel } from "../../../../../../core/finance/journal/adjustment/adjustment.model";
import { selectAdjustmentActionLoading } from "../../../../../../core/finance/journal/adjustment/adjustment.selector";
import { AdjustmentService } from "../../../../../../core/finance/journal/adjustment/adjustment.service";
import { SelectionModel } from "@angular/cdk/collections";
import { AccountGroupService } from "../../../../../../core/accountGroup/accountGroup.service";
import { MatTable } from "@angular/material";
import { ServiceFormat } from "../../../../../../core/serviceFormat/format.service";
import { MatDialog } from '@angular/material';
import { ConfirmationDialog } from "../../../../../partials/module/confirmation-popup/confirmation.dialog.component";
import { SavingDialog } from "../../../../../partials/module/saving-confirm/confirmation.dialog.component";
@Component({
	selector: "kt-add-adjustment",
	templateUrl: "./add-adjustment.component.html",
	styleUrls: ["./add-adjustment.component.scss"],
})
export class AddAdjustmentComponent implements OnInit, OnDestroy {
	adjustment: AdjustmentModel;
	AdjustmentId$: Observable<string>;
	oldAdjustment: AdjustmentModel;
	selectedTab = 0;
	loading$: Observable<boolean>;
	selection = new SelectionModel<AdjustmentModel>(true, []);
	adjustmentResult: any[] = [];
	glResult: any[] = [];
	accountReceive: any[] = [];
	adjustmentForm: FormGroup;
	date1 = new FormControl(new Date());
	hasFormErrors = false;
	isStatus: boolean = false;


	@ViewChild('myTable', { static: false }) table: MatTable<any>;
	displayedColumns = ['no', 'gl', 'amount', 'desc', 'isdebit', 'action'];


	adjustmentListResultFiltered = [];
	viewAdjustmentResult = new FormControl();

	totalField: number = 0
	balanced: boolean = false
	invalid: boolean = false

	gLListResultFiltered = [];
	viewGlResult = new FormControl();
	viewGlResult2 = new FormControl();


	isGenerateBilling: string = "" /* To determine the condition of the generating billing process in progress */
	msgErrorGenerate: string = "" /* To display message error proccessing generate */


	private subscriptions: Subscription[] = [];
	loading = {
		deposit: false,
		submit: false,
		glaccount: false,
	};
	constructor(
		private activatedRoute: ActivatedRoute,
		private serviceFormat: ServiceFormat,
		private router: Router,
		private adjustmentFB: FormBuilder,
		private subheaderService: SubheaderService,
		private layoutUtilsService: LayoutUtilsService,
		private store: Store<AppState>,
		private service: AdjustmentService,
		private COAService: AccountGroupService,
		private layoutConfigService: LayoutConfigService,
		private cd: ChangeDetectorRef,
		private dialog: MatDialog,

	) { }

	ngOnInit() {
		this.loading$ = this.store.pipe(select(selectAdjustmentActionLoading));
		this.adjustment = new AdjustmentModel();
		this.adjustment.clear();
		this.initAdjustment();
	}

	initAdjustment() {
		this.createForm();
		this.loadCOACashBank();
		this.loadGLAccountAR(null);
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

		this.adjustmentForm = this.adjustmentFB.group({
			depositTo: [""],
			voucherno: ["", Validators.required],
			rate: [{ value: "IDR", disabled: false }], //number
			glaccount: [""],
			payFrom: [{ value: "MEMORIAL JOURNAL", disabled: false }, Validators.required],
			date: [this.date1.value, Validators.required], // number
			createdBy: [this.adjustment.createdBy], // number
			crtdate: [{ value: this.date1.value, disabled: true }], // number
			status: [this.adjustment.status],
			printSize: [this.adjustment.printSize],

			multiGLAccount: this.adjustmentFB.group(objFormMultiGl),
		});
	}

	ccList = [];
	ifMaksField: boolean = false


	addCC(e) {
		const controls = this.adjustmentForm.controls;
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
		const controls = this.adjustmentForm.controls;
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
		const controls = this.adjustmentForm.controls;
		// for (let i = 1; i <= 30; i++) {
		// 	if (e.target.name == i) controls.multiGLAccount.get(('amount' + i)).setValue(null)
		// }
		this.cd.markForCheck()
	}

	valueIsDebit(e) {
		const controls = this.adjustmentForm.controls;
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
		let controls = this.adjustmentForm.controls;
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



	changeStatus() {
		const controls = this.adjustmentForm.controls;
		if (this.isStatus == true) {
			controls.status.setValue(true);
		} else {
			controls.status.setValue(false);
		}
	}

	/**
	 * @padjustmentam value
	 */
	_setAdjustmentValue(value) {
		this.adjustmentForm.patchValue({ depositTo: value._id });
	}

	_onKeyup(e: any) {
		this.adjustmentForm.patchValue({ depositTo: undefined });
		this._filterCashbankList(e.target.value);
	}

	_filterCashbankList(text: string) {
		this.adjustmentListResultFiltered = this.adjustmentResult.filter((i) => {
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
			this.adjustmentResult = res.data;
			this.adjustmentListResultFiltered = this.adjustmentResult.slice();
			this.viewAdjustmentResult.enable();
			this.cd.markForCheck();
			this.loading.deposit = false;
		});
	}

	/**
	 * @padjustmentam value
	 */

	_setGLAccount(value, target) {
		const controls = this.adjustmentForm.controls;
		for (let i = 1; i <= 30; i++) {
			if (target == ('target' + i)) {
				controls.multiGLAccount.get(('glAcc' + i)).setValue(`${value.acctNo} - ${value.acctName}`)
				controls.multiGLAccount.get(('glAccountId' + i)).setValue(value._id)
			}
		}
	}

	_onKeyupGL(e: any) {
		this.adjustmentForm.patchValue({ glaccount: undefined });
		this._filterGLList(e.target.value);
	}

	_filterGLList(text: string) {
		this.adjustmentListResultFiltered = this.adjustmentResult.filter((i) => {
			const filterText = `${i.acctNo.toLocaleLowerCase()} - ${i.acctName.toLocaleLowerCase()}`;
			if (filterText.includes(text.toLocaleLowerCase())) return i;
		});

		// this.gLListResultFiltered = this.glResult.filter((i) => {
		// 	const filterText = `${i.acctNo.toLocaleLowerCase()}`;
		// 	if (filterText.includes(text.toLocaleLowerCase())) return i;
		// });
		this.loadGLAccountAR(text)
	}

	loadGLAccountAR(text) {
		this.loading.glaccount = true;
		this.selection.clear();
		// const queryParams = new QueryParamsModel(null, "asc", null, 1, 10);
		const queryParams = new QueryParamsModel(text, "asc", null, 1, 10);

		this.COAService.getListGLAccountAR(queryParams).subscribe((res) => {
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
		const url = `/penyesuaian`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}

	refreshAdjustment(isNew: boolean = false, id: string = "") {
		let url = this.router.url;
		if (!isNew) {
			this.router.navigate([url], { relativeTo: this.activatedRoute });
			return;
		}
		url = `/penyesuaian/edit/${id}`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}


	onSubmit(withBack: boolean = false) {
		this.loading.submit = true;
		this.hasFormErrors = false;
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

		const controls = this.adjustmentForm.controls;
		if (this.adjustmentForm.invalid) {
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
				const editedAdjustment = this.prepadjustmenteAdjustment();
				this.addAdjustment(editedAdjustment, withBack);
			} else {
				return;
			}
		});

	}

	prepadjustmenteAdjustment(): AdjustmentModel {
		const controls = this.adjustmentForm.controls;
		const _adjustment = new AdjustmentModel();


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

		_adjustment.clear();
		_adjustment._id = this.adjustment._id;
		_adjustment.depositTo = controls.depositTo.value == "" ? undefined : controls.depositTo.value;
		_adjustment.voucherno = controls.voucherno.value;
		_adjustment.rate = controls.rate.value;
		_adjustment.date = controls.date.value;
		_adjustment.createdBy = controls.createdBy.value;
		_adjustment.crtdate = controls.crtdate.value;
		_adjustment.status = controls.status.value;
		_adjustment.payFrom = controls.payFrom.value;
		_adjustment.printSize = controls.printSize.value;
		_adjustment.totalField = this.totalField

		const a = controls.multiGLAccount.get('amount1').value;
		// const amount1 = a.replace(/\./g, "");
		let rupiah = a.replace(/[\.]+/g, "").replace(/[\,]+/g, ".");
		let rupiahNum = rupiah

		_adjustment.glaccount = controls.multiGLAccount.get('glAccountId1').value
		_adjustment.amount = controls.multiGLAccount.get('amount1').value == "" ? undefined : parseFloat(rupiahNum)
		_adjustment.memo = controls.multiGLAccount.get('memo1').value
		_adjustment.isDebit = controls.multiGLAccount.get('amount1').value == "" ? undefined : controls.multiGLAccount.get('isDebit1').value

		_adjustment.multiGLAccount = objRes

		return _adjustment;
	}

	addAdjustment(_adjustment: AdjustmentModel, withBack: boolean = false) {
		this.processSaving()
		const addSubscription = this.service.createAdjustment(_adjustment).subscribe(
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
				const url = `/penyesuaian`;
				this.router.navigateByUrl(url, {
					relativeTo: this.activatedRoute,
				});
			},
			(err) => {
				this.dialog.closeAll()

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
		let result = "Create Journal Memorial";
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
		const controls = this.adjustmentForm.controls
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
		const controls = this.adjustmentForm.controls
		let list = []
		for (let i = 1; i <= this.totalField; i++) {
			let gl = controls.multiGLAccount.get(`glAccountId${i}`).value
			list.push(gl != undefined)
		}
		this.invalid = list.some(item => item == false)
	}

	/**
* Load MEMORIAL Process Saving.
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
