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
import { AdjustmentModel } from "../../../../../../core/finance/journal/adjustment/adjustment.model";
import {
	selectAdjustmentActionLoading,
	selectAdjustmentById,
} from "../../../../../../core/finance/journal/adjustment/adjustment.selector";
import { AdjustmentService } from "../../../../../../core/finance/journal/adjustment/adjustment.service";
import { SelectionModel } from "@angular/cdk/collections";
import { AccountGroupService } from "../../../../../../core/accountGroup/accountGroup.service";
import { MatTable } from "@angular/material";
import { ServiceFormat } from "../../../../../../core/serviceFormat/format.service";

@Component({
	selector: "kt-edit-adjustment",
	templateUrl: "./edit-adjustment.component.html",
	styleUrls: ["./edit-adjustment.component.scss"],
})
export class EditAdjustmentComponent implements OnInit, OnDestroy {
	adjustment: AdjustmentModel;
	AdjustmentId$: Observable<string>;
	oldAdjustment: AdjustmentModel;
	selectedTab = 0;
	loading$: Observable<boolean>;
	selection = new SelectionModel<AdjustmentModel>(true, []);
	adjustmentResult: any[] = [];
	glResult: any[] = [];
	adjustmentForm: FormGroup;
	date1 = new FormControl(new Date());
	hasFormErrors = false;
	isStatus: boolean = false;
	private subscriptions: Subscription[] = [];


	totalField: number = 0

	ccList = [];

	loading = {
		deposit: false,
		submit: false,
		glaccount: false,
	};

	adjustmentListResultFiltered = [];
	viewAdjustmentResult = new FormControl();
	gLListResultFiltered = [];

	@ViewChild('myTable', { static: false }) table: MatTable<any>;
	displayedColumns = ['no', 'gl', 'amount', 'desc', 'isdebit', 'action'];
	constructor(
		private activatedRoute: ActivatedRoute,
		private serviceFormat: ServiceFormat,
		private router: Router,
		private adjustmentFB: FormBuilder,
		private layoutUtilsService: LayoutUtilsService,
		private store: Store<AppState>,
		private service: AdjustmentService,
		private COAService: AccountGroupService,
		private cd: ChangeDetectorRef,
	) { }



	ngOnInit() {
		this.loading$ = this.store.pipe(select(selectAdjustmentActionLoading));
		const routeSubscription = this.activatedRoute.params.subscribe(
			(params) => {
				const id = params.id;
				if (id) {
					this.service.findAdjustmentById(id).subscribe(resjoupen => {
						this.totalField = resjoupen.data.JP.totalField

						for (let i = 0; i < this.totalField; i++) {
							this.ccList.push({
								id: '',
								refCc: '',
								name: ''
							})
						}

						this.adjustment = resjoupen.data;

						this.oldAdjustment = Object.assign({}, this.adjustment);
						this.initAdjustment();

						this.viewAdjustmentResult.disable();
						this.viewAdjustmentResult.setValue(
							`${resjoupen.data.JP.depositTo.acctName.toLocaleLowerCase()}`
						);
						this._filterCashbankList(
							`${resjoupen.data.JP.depositTo.acctName.toLocaleLowerCase()}`
						);
						this._filterGLList(
							`${resjoupen.data.JP.glaccount.acctName.toLocaleLowerCase()}`
						);
						this.initAdjustment();
					})

				}
			}
		);
		this.subscriptions.push(routeSubscription);
	}

	valueChecked(choose) {
		for (let i = 1; i <= 30; i++) {
			let valIsDeb
			if (this.adjustment.JP.multiGLAccount[`isDebit${i}`] != undefined) valIsDeb = this.adjustment.JP.multiGLAccount[`isDebit${i}`];
			else valIsDeb = true

			if (choose == ('deb' + i)) return valIsDeb;
			else if (choose == ('cred' + i)) return !valIsDeb
		}
	}

	initAdjustment() {
		this.createForm();
		this.loadCOACashBank();
		this.loadGLAccountAR(null);
	}

	printOptions = [
		{ value: "A5", name: "A5" },
		{ value: "A4", name: "A4" },
	];

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
		controls.multiGLAccount.get(`isDebit${this.totalField}`).setValue(true)

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
		controls.multiGLAccount.get(('isDebit' + index)).setValue(undefined)

		this.table.renderRows();
	}

	_setGLAccount(value, target) {
		const controls = this.adjustmentForm.controls;
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



	createForm() {

		let objFormMultiGl = {}
		for (let i = 1; i <= 30; i++) {
			let glid, glacc, memo, amount, isDebit;
			if (this.adjustment.multiGLID[`glId${i}`] !== undefined) glid = this.adjustment.multiGLID[`glId${i}`]._id;
			if (this.adjustment.multiGLID[`glId${i}`] !== undefined) glacc = this.adjustment.multiGLID[`glId${i}`].acctName;
			if (this.adjustment.JP.multiGLAccount[`memo${i}`] !== undefined) memo = this.adjustment.JP.multiGLAccount[`memo${i}`];
			if (this.adjustment.JP.multiGLAccount[`amount${i}`] !== undefined) amount = this.serviceFormat.rupiahFormatImprovement(this.adjustment.JP.multiGLAccount[`amount${i}`] == undefined || this.adjustment.JP.multiGLAccount[`amount${i}`] == null ? "" : this.adjustment.JP.multiGLAccount[`amount${i}`]);
			if (this.adjustment.JP.multiGLAccount[`isDebit${i}`] !== undefined) isDebit = this.adjustment.JP.multiGLAccount[`isDebit${i}`];

			objFormMultiGl[`glAccountId${i}`] = [{ value: glid, disabled: true }];
			objFormMultiGl[`glAcc${i}`] = [{ value: glacc, disabled: true }];
			objFormMultiGl[`memo${i}`] = [{ value: memo, disabled: true }];
			objFormMultiGl[`amount${i}`] = [{ value: amount, disabled: true }];
			objFormMultiGl[`isDebit${i}`] = [{ value: isDebit, disabled: true }];

		}

		this.adjustmentForm = this.adjustmentFB.group({
			depositTo: [this.adjustment.JP.depositTo == undefined ? "" : this.adjustment.JP.depositTo._id],
			voucherno: [this.adjustment.JP.voucherno],
			rate: [this.adjustment.JP.rate],
			date: [{ value: this.adjustment.JP.date, disabled: true }],

			payFrom: [this.adjustment.JP.payFrom],
			createdBy: [this.adjustment.JP.createdBy],
			crtdate: [this.adjustment.JP.crtdate],
			status: [this.adjustment.JP.status],
			printSize: [this.adjustment.JP.printSize],

			multiGLAccount: this.adjustmentFB.group(objFormMultiGl),
		})
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
			const filterText = `${i.acctNo.toLocaleLowerCase()}`;
			if (filterText.includes(text.toLocaleLowerCase())) return i;
		});
	}

	loadCOACashBank() {
		this.selection.clear();
		const queryParams = new QueryParamsModel(null, "asc", null, 1, 10000);
		this.COAService.getListCashBank(queryParams).subscribe((res) => {
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
	_setGlValue(value) {
		this.adjustmentForm.patchValue({ glaccount: value._id });
	}

	_onKeyupGL(e: any) {
		this._filterGLList(e.target.value);
	}

	_filterGLList(text: string) {
		this.loadGLAccountAR(text)
	}

	loadGLAccountAR(text) {
		this.loading.glaccount = true;
		this.selection.clear();
		// const queryParams = new QueryParamsModel(null, "asc", null, 1, 1000);
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
		const url = `/adjustment`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}

	refreshAdjustment(isNew: boolean = false, id: string = "") {
		let url = this.router.url;
		if (!isNew) {
			this.router.navigate([url], { relativeTo: this.activatedRoute });
			return;
		}

		url = `/adjustment/edit/${id}`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}

	onSubmit(withBack: boolean = false) {
		this.loading.submit = true;
		this.hasFormErrors = false;
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

		const editedAdjustment = this.prepareAdjustment();
		this.updateAdjustment(editedAdjustment, withBack);
	}

	prepareAdjustment(): AdjustmentModel {
		const controls = this.adjustmentForm.controls;
		const _adjustment = new AdjustmentModel();

		let objRes = {}
		for (let i = 2; i <= 30; i++) {
			const a = controls.multiGLAccount.get(`amount${i}`).value
			let rupiah = controls.multiGLAccount.get(`amount${i}`).value == undefined || controls.multiGLAccount.get(`amount${i}`).value == null ? "" : a.replace(/[\.]+/g, "").replace(/[\,]+/g, ".");
			let rupiahNum = rupiah

			objRes[`glAcc${i}`] = controls.multiGLAccount.get(`glAccountId${i}`).value;
			objRes[`memo${i}`] = controls.multiGLAccount.get(`memo${i}`).value;
			objRes[`amount${i}`] = controls.multiGLAccount.get(`amount${i}`).value == "" || controls.multiGLAccount.get(`amount${i}`).value == undefined ? undefined : parseFloat(rupiahNum);
			objRes[`isDebit${i}`] = controls.multiGLAccount.get(`amount${i}`).value == "" ? undefined : controls.multiGLAccount.get(`isDebit${i}`).value
		}



		_adjustment.clear();
		_adjustment._id = this.adjustment.JP._id;
		_adjustment.depositTo = controls.depositTo.value == "" ? undefined : controls.depositTo.value;
		_adjustment.voucherno = controls.voucherno.value;
		_adjustment.date = controls.date.value;
		_adjustment.rate = controls.rate.value;
		_adjustment.createdBy = controls.createdBy.value;
		_adjustment.crtdate = controls.crtdate.value;
		_adjustment.status = controls.status.value;
		_adjustment.printSize = controls.printSize.value;
		_adjustment.payFrom = controls.payFrom.value;
		_adjustment.totalField = this.totalField

		const a = controls.multiGLAccount.get('amount1').value;
		// const amount1 = a.replace(/\./g, "");
		let rupiah = controls.multiGLAccount.get(`amount1`).value == undefined || controls.multiGLAccount.get(`amount1`).value == null ? "" : a.replace(/[\.]+/g, "").replace(/[\,]+/g, ".");
		let rupiahNum = rupiah


		_adjustment.glaccount = controls.multiGLAccount.get('glAccountId1').value
		_adjustment.memo = controls.multiGLAccount.get('memo1').value
		_adjustment.amount = controls.multiGLAccount.get(`amount1`).value == "" || controls.multiGLAccount.get(`amount1`).value == undefined ? undefined : parseFloat(rupiahNum)
		_adjustment.isDebit = controls.multiGLAccount.get(`amount1`).value == "" ? undefined : controls.multiGLAccount.get(`isDebit1`).value


		_adjustment.multiGLAccount = objRes == {} ? undefined : objRes

		return _adjustment;
	}

	updateAdjustment(_adjustment: AdjustmentModel, withBack: boolean = false) {
		const addSubscription = this.service.updateAdjustment(_adjustment).subscribe(
			(res) => {
				this.loading.submit = false;
				const message = `Journal Memorial successfully has been saved.`;
				this.layoutUtilsService.showActionNotification(
					message,
					MessageType.Update,
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
		let result = `Edit Journal Memorial`;
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
