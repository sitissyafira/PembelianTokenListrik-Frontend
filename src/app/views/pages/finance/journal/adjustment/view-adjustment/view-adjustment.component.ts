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
	selector: "kt-view-adjustment",
	templateUrl: "./view-adjustment.component.html",
	styleUrls: ["./view-adjustment.component.scss"],
})
export class ViewAdjustmentComponent implements OnInit, OnDestroy {
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
	displayedColumns = ['no', 'gl', 'amount', 'desc', 'isdebit'];
	constructor(
		private activatedRoute: ActivatedRoute,
		private serviceFormat: ServiceFormat,
		private router: Router,
		private adjustmentFB: FormBuilder,
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
					this.service.findAdjustmentById(id).subscribe( resjoupen => {
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

	clickToggle(e) {
		const controls = this.adjustmentForm.controls;
		for (let i = 1; i <= 30; i++) {
			if (e.target.name == i) controls.multiGLAccount.get(('amount' + i)).setValue(null)
		}
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
			if (this.adjustment.JP.multiGLAccount[`amount${i}`] !== undefined) amount = this.serviceFormat.rupiahFormatImprovement(this.adjustment.JP.multiGLAccount[`amount${i}`] == undefined || this.adjustment.JP.multiGLAccount[`amount${i}`] == null ? 0 : this.adjustment.JP.multiGLAccount[`amount${i}`]);
			if (this.adjustment.JP.multiGLAccount[`isDebit${i}`] !== undefined) isDebit = this.adjustment.JP.multiGLAccount[`isDebit${i}`];

			objFormMultiGl[`glAccountId${i}`] = [{ value: glid, disabled: true }];
			objFormMultiGl[`glAcc${i}`] = [{ value: glacc, disabled: true }];
			objFormMultiGl[`memo${i}`] = [{ value: memo, disabled: true }];
			objFormMultiGl[`amount${i}`] = [{ value: amount, disabled: true }];
			objFormMultiGl[`isDebit${i}`] = [{ value: isDebit, disabled: true }];

		}

		this.adjustmentForm = this.adjustmentFB.group({
			// depositTo: [{ value: this.adjustment.JP.depositTo == undefined ? "" : this.adjustment.JP.depositTo._id, disabled: true }],
			voucherno: [{ value: this.adjustment.JP.voucherno, disabled: true }],
			rate: [{ value: this.adjustment.JP.rate, disabled: true }],
			date: [{ value: this.adjustment.JP.date, disabled: true }],

			payFrom: [{ value: this.adjustment.JP.payFrom, disabled: true }],
			createdBy: [{ value: this.adjustment.JP.createdBy, disabled: true }],
			crtdate: [{ value: this.adjustment.JP.crtdate, disabled: true }],
			status: [{ value: this.adjustment.JP.status, disabled: true }],
			printSize: [{ value: this.adjustment.JP.printSize, disabled: true }],

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
			this.viewAdjustmentResult.disable();
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
		// this.adjustmentForm.patchValue({ glaccount: undefined });
		this._filterGLList(e.target.value);
	}

	_filterGLList(text: string) {
		this.adjustmentListResultFiltered = this.adjustmentResult.filter((i) => {
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

	goBackWithId() {
		const url = `/adjustment`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}

	getComponentTitle() {
		let result = `View Journal Memorial`;
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
