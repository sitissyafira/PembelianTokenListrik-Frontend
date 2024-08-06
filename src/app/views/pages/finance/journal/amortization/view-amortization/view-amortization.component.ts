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
	selector: "kt-view-amortization",
	templateUrl: "./view-amortization.component.html",
	styleUrls: ["./view-amortization.component.scss"],
})
export class ViewAmortizationComponent implements OnInit, OnDestroy {
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

	totalField: number = 0

	ccList = [];

	loading = {
		deposit: false,
		submit: false,
		glaccount: false,
	};

	amortizationListResultFiltered = [];
	viewAmortizationResult = new FormControl();
	gLListResultFiltered = [];

	@ViewChild('myTable', { static: false }) table: MatTable<any>;
	displayedColumns = ['no', 'gl', 'amount', 'desc', 'isdebit'];
	constructor(
		private activatedRoute: ActivatedRoute,
		private serviceFormat: ServiceFormat,
		private router: Router,
		private amortizationFB: FormBuilder,
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

						for (let i = 0; i < this.totalField; i++) {
							this.ccList.push({
								id: '',
								refCc: '',
								name: ''
							})
						}

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

	clickToggle(e) {
		const controls = this.amortizationForm.controls;
		for (let i = 1; i <= 30; i++) {
			if (e.target.name == i) controls.multiGLAccount.get(('amount' + i)).setValue(null)
		}
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
			if (this.amortization.JA.multiGLAccount[`amount${i}`] !== undefined) amount = this.serviceFormat.rupiahFormatImprovement(this.amortization.JA.multiGLAccount[`amount${i}`] == undefined || this.amortization.JA.multiGLAccount[`amount${i}`] == null ? 0 : this.amortization.JA.multiGLAccount[`amount${i}`]);
			if (this.amortization.JA.multiGLAccount[`isDebit${i}`] !== undefined) isDebit = this.amortization.JA.multiGLAccount[`isDebit${i}`];

			objFormMultiGl[`glAccountId${i}`] = [{ value: glid, disabled: true }];
			objFormMultiGl[`glAcc${i}`] = [{ value: glacc, disabled: true }];
			objFormMultiGl[`memo${i}`] = [{ value: memo, disabled: true }];
			objFormMultiGl[`amount${i}`] = [{ value: amount, disabled: true }];
			objFormMultiGl[`isDebit${i}`] = [{ value: isDebit, disabled: true }];

		}

		this.amortizationForm = this.amortizationFB.group({
			// depositTo: [{ value: this.amortization.JA.depositTo._id, disabled: true }],
			voucherno: [{ value: this.amortization.JA.voucherno, disabled: true }],
			rate: [{ value: this.amortization.JA.rate, disabled: true }],
			date: [{ value: this.amortization.JA.date, disabled: true }],

			payFrom: [{ value: this.amortization.JA.payFrom, disabled: true }],
			createdBy: [{ value: this.amortization.JA.createdBy, disabled: true }],
			crtdate: [{ value: this.amortization.JA.crtdate, disabled: true }],
			status: [{ value: this.amortization.JA.status, disabled: true }],
			printSize: [{ value: this.amortization.JA.printSize, disabled: true }],

			ARID: [{ value: this.amortization.JA.ARID == undefined ? "" : this.amortization.JA.ARID._id }],
			nameARID: [{ value: this.amortization.JA.ARID == undefined ? "" : (`${this.amortization.JA.ARID.voucherno} - ${this.amortization.JA.ARID.memo.toUpperCase()}`), disabled: true }],

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
			this.viewAmortizationResult.disable();
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
		this._filterGLList(e.target.value);
	}

	_filterGLList(text: string) {
		this.amortizationListResultFiltered = this.amortizationResult.filter((i) => {
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
		const url = `/amortization`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}

	getComponentTitle() {
		let result = `View Journal Amortization`;
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
