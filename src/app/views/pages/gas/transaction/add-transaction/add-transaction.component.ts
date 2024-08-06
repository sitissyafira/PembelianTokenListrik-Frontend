// Angular
import { Component, OnInit, OnDestroy } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import {
	FormBuilder,
	FormControl,
	FormGroup,
	Validators,
} from "@angular/forms";
// RxJS
import { BehaviorSubject, Observable, of, Subscription } from "rxjs";
// NGRX
import { Store, select } from "@ngrx/store";
import { Update } from "@ngrx/entity";
import { AppState } from "../../../../../core/reducers";
// Layout
import {
	SubheaderService,
	LayoutConfigService,
} from "../../../../../core/_base/layout";
import {
	LayoutUtilsService,
	MessageType,
	QueryParamsModel,
} from "../../../../../core/_base/crud";
import {
	selectLastCreatedGasTransactionId,
	selectGasTransactionActionLoading,
	selectGasTransactionById,
} from "../../../../../core/gas/transaction/transaction.selector";
import { GasTransactionModel } from "../../../../../core/gas/transaction/transaction.model";

import { SelectionModel } from "@angular/cdk/collections";

import {
	DateAdapter,
	MAT_DATE_FORMATS,
	MAT_DATE_LOCALE,
	MatDatepicker,
} from "@angular/material";
import * as _moment from "moment";
import { default as _rollupMoment, Moment } from "moment";
import { GasTransactionService } from "../../../../../core/gas/transaction/transaction.service";
import { GasMeterService } from '../../../../../core/gas/meter/meter.service';
import { QueryGasMeterModel } from '../../../../../core/gas/meter/querymeter.model';
const moment = _rollupMoment || _moment;

@Component({
	selector: "kt-add-transaction",
	templateUrl: "./add-transaction.component.html",
	styleUrls: ["./add-transaction.component.scss"],
})
export class AddTransactionComponent implements OnInit, OnDestroy {
	gasTransaction: GasTransactionModel;
	gasTransactionId$: Observable<string>;
	oldGasTransaction: GasTransactionModel;
	selectedTab = 0;
	loading$: Observable<boolean>;
	gasTransactionForm: FormGroup;
	hasFormErrors = false;
	gasTransactionResult: any[] = [];
	gasMeter: any[] = [];
	selection = new SelectionModel<GasTransactionModel>(true, []);
	date = new FormControl(moment());
	date1 = new FormControl(new Date());
	checker : boolean;
	// Private properties
	private subscriptions: Subscription[] = [];
	constructor(
		private activatedRoute: ActivatedRoute,
		private router: Router,
		private gasTransactionFB: FormBuilder,
		private subheaderService: SubheaderService,
		private layoutUtilsService: LayoutUtilsService,
		private store: Store<AppState>,
		private serviceGasrMeter: GasMeterService,
		private layoutConfigService: LayoutConfigService,
		private service: GasTransactionService
	) {}

	ngOnInit() {
		this.loading$ = this.store.pipe(
			select(selectGasTransactionActionLoading)
		);
		const routeSubscription = this.activatedRoute.params.subscribe(
			(params) => {
				const id = params.id;
				if (id) {
					this.store
						.pipe(select(selectGasTransactionById(id)))
						.subscribe((res) => {
							if (res) {
								this.gasTransaction = res;
								this.checker = res.checker;
								this.oldGasTransaction = Object.assign(
									{},
									this.gasTransaction
								);
								this.initGasTransaction();
							}
						});
				} else {
					this.gasTransaction = new GasTransactionModel();
					this.gasTransaction.clear();
					this.initGasTransaction();
				}
			}
		);
		this.subscriptions.push(routeSubscription);
	}
	initGasTransaction() {
		this.createForm();
		
	}
	createForm() {
			this.loadMeterList();
			this.gasTransactionForm = this.gasTransactionFB.group({
				gas: ["", Validators.required],
				rate: [{ value: "", disabled: true }, Validators.required],
				strtpos: ["", Validators.required],
				endpos: ["", Validators.required],
				billmnt: [{value: this.date1.value, disabled:false}, Validators.required],
				billamnt: [{ value: "", disabled: true }, Validators.required],
				checker:[""]
			});
	}
	goBackWithId() {
		const url = `/gas-management/gas/transaction`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}
	refreshGasTransaction(isNew: boolean = false, id: string = "") {
		let url = this.router.url;
		if (!isNew) {
			this.router.navigate([url], { relativeTo: this.activatedRoute });
			return;
		}

		url = `/gas-management/gas/transaction/edit/${id}`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}
	onSubmit(withBack: boolean = false) {
		this.hasFormErrors = false;
		const controls = this.gasTransactionForm.controls;
		/** check form */
		if (this.gasTransactionForm.invalid) {
			console.log(controls);
			Object.keys(controls).forEach((controlName) =>
				controls[controlName].markAsTouched()
			);

			this.hasFormErrors = true;
			this.selectedTab = 0;
			return;
		}

		const editedGasTransaction = this.prepareGasTransaction();
		this.addGasTransaction(editedGasTransaction, withBack);
	}
	prepareGasTransaction(): GasTransactionModel {
		const controls = this.gasTransactionForm.controls;
		const _gasTransaction = new GasTransactionModel();
		_gasTransaction.clear();
		_gasTransaction._id = this.gasTransaction._id;
		_gasTransaction.gas = controls.gas.value;
		_gasTransaction.strtpos = controls.strtpos.value;
		_gasTransaction.endpos = controls.endpos.value;
		_gasTransaction.billmnt = controls.billmnt.value;
		_gasTransaction.billamnt = controls.billamnt.value;
		_gasTransaction.checker = controls.checker.value;
		return _gasTransaction;
	}


	addGasTransaction(
		_gasTransaction: GasTransactionModel,
		withBack: boolean = false
	) {
		const addSubscription = this.service
			.createGasTransaction(_gasTransaction)
			.subscribe(
				(res) => {
					const message = `New gas consumption successfully has been added.`;
					this.layoutUtilsService.showActionNotification(
						message,
						MessageType.Create,
						5000,
						true,
						true
					);
					if (_gasTransaction.checker != true){
						const url = `/gas-management/gas/transaction/new`;
						this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
						}
						else{
						const url2 = `/gas-management/gas/transaction`;
						this.router.navigateByUrl(url2, { relativeTo: this.activatedRoute });
					}
				},
				(err) => {
					console.error(err);
					const message =
						"Error while adding gas consumption | " +
						err.statusText;
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
		let result = "Create Gas Consumption";
		if (!this.gasTransaction || !this.gasTransaction._id) {
			return result;
		}

		result = `Edit Gas Consumption`;
		return result;
	}
	onAlertClose($event) {
		this.hasFormErrors = false;
	}
	reset() {
		this.gasTransaction = Object.assign({}, this.oldGasTransaction);
		this.createForm();
		this.hasFormErrors = false;
		this.gasTransactionForm.markAsPristine();
		this.gasTransactionForm.markAsUntouched();
		this.gasTransactionForm.updateValueAndValidity();
	}

	loadMeterList() {
		this.selection.clear();
		const queryParams = new QueryGasMeterModel(
			null,
			"asc",
			"grpnm",
			1,
			10
		);
		this.serviceGasrMeter
			.getListGasMeter(queryParams)
			.subscribe((res) => {
				this.gasMeter = res.data;
			});
	}
	
	changeGasMeter(item) {
		this.serviceGasrMeter.getGasMeter(item).subscribe((res) => {
			this.gasTransactionForm.controls.rate.setValue(res.data.rte.rte);
			this.gasTransactionForm.controls.strtpos.setValue(
				res.lastConsumtion.endpos
			);
			
		});
	}




	// changeMeterPost() {
	// 	const strtpos = this.gasTransactionForm.controls.strtpos.value;
	// 	const endpos = this.gasTransactionForm.controls.endpos.value;
	// 	const rate = this.gasTransactionForm.controls.rate.value;
	// 	if (strtpos !== "" && endpos !== "" && rate !== "") {
	// 		this.gasTransactionForm.controls.billamn.setValue(
	// 			(endpos - strtpos) * rate
	// 		);
	// 	}
	// }

	changeMeterPost() {
		const strtpos = this.gasTransactionForm.controls.strtpos.value;
		const endpos = this.gasTransactionForm.controls.endpos.value;
		const rate = this.gasTransactionForm.controls.rate.value;
		if (endpos !== 0 && rate !== 0) {
			this.gasTransactionForm.controls.billamnt.setValue(
				(endpos - strtpos) * rate)
		}
	}
	ngOnDestroy() {
		this.subscriptions.forEach((sb) => sb.unsubscribe());
	}
}
