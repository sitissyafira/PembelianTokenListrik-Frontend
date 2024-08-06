// Angular
import { Component, OnInit, OnDestroy } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import {
	FormBuilder,
	FormControl,
	FormGroup,
	Validators,
} from "@angular/forms";

import {  Observable, Subscription } from "rxjs";
// NGRX
import { Store, select } from "@ngrx/store";
import { AppState } from "../../../../../core/reducers";
// Layout
import {
	SubheaderService,
	LayoutConfigService,
} from "../../../../../core/_base/layout";
import {
	LayoutUtilsService,
	MessageType,
} from "../../../../../core/_base/crud";
import {
	selectGasTransactionActionLoading,
	selectGasTransactionById,
} from "../../../../../core/gas/transaction/transaction.selector";
import { GasTransactionModel } from "../../../../../core/gas/transaction/transaction.model";
import { GasMeterService } from "../../../../../core/gas/meter/meter.service";
import { SelectionModel } from "@angular/cdk/collections";
import { QueryGasMeterModel } from "../../../../../core/gas/meter/querymeter.model";

import * as _moment from "moment";
import { default as _rollupMoment} from "moment";
import { GasTransactionService } from "../../../../../core/gas/transaction/transaction.service";
const moment = _rollupMoment || _moment;

@Component({
	selector: "kt-edit-transaction",
	templateUrl: "./edit-transaction.component.html",
	styleUrls: ["./edit-transaction.component.scss"],
})
export class EditTransactionComponent implements OnInit, OnDestroy {
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
	checker : boolean;
	buttonSave : boolean = true;
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
		this.hiddenAfterRes()
		
	}

	hiddenAfterRes(){
		if (this.gasTransaction.checker != false){
				this.buttonSave = true;
			}else{
				this.buttonSave = false;
			}
		}
	
	createForm() {
		if (this.gasTransaction._id) {
			this.loadMeterList();
			if (this.gasTransaction.checker != true) {
			this.gasTransactionForm = this.gasTransactionFB.group({
				gas: [this.gasTransaction.gas._id, Validators.required],
				rate: [
					{
						value: this.gasTransaction.gas.rte.rte,
						disabled: true,
					},
				],
				strtpos: [{"value": this.gasTransaction.strtpos, "disabled":true},Validators.required],
				endpos: [this.gasTransaction.endpos, Validators.required],
				billmnt: [this.gasTransaction.billmnt, Validators.required],
				billamnt: [
					{ value: this.gasTransaction.billamnt, disabled: true },
					Validators.required,
				],
				checker : [this.gasTransaction.checker]
			});
		}else{
			
			this.gasTransactionForm = this.gasTransactionFB.group({
				gas: [{value:this.gasTransaction.gas._id, disabled:true}],
				rate: [
					{
						value: this.gasTransaction.gas.rte.rte,
						disabled: true,
					},
				],
				strtpos: [{"value": this.gasTransaction.strtpos, "disabled":true}],
				endpos: [{value:this.gasTransaction.endpos, disabled:true}],
				billmnt: [{value:this.gasTransaction.billmnt, disabled:true}],
				billamnt: [
					{ value: this.gasTransaction.billamnt, disabled: true },
				],
				checker : [{value:this.gasTransaction.checker, disabled:true}]
			});
			

			}
		}
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
		this.updateGasTransaction(editedGasTransaction, withBack);
		
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



	updateGasTransaction(
		_gasTransaction: GasTransactionModel,
		withBack: boolean = false
	) {
		const addSubscription = this.service
			.updateGasTransaction(_gasTransaction)
			.subscribe(
				(res) => {
					const message = `Gas consumption successfully has been saved.`;
					this.layoutUtilsService.showActionNotification(
						message,
						MessageType.Create,
						5000,
						true,
						true
					);
					const url = `/gas-management/gas/transaction`;
					this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
				},
				(err) => {
					console.error(err);
					const message =
						"Error while saving gas consumption | " +
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
		if (this.gasTransaction.checker != true){
			let result = `Edit Gas Consumption`;
			return result;
			}else{
			let result = `View Gas Consumption`;
			return result;
		}
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
			null,
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

	changeMeterPost() {
		const strtpos = this.gasTransactionForm.controls.strtpos.value / 100;
		const endpos = this.gasTransactionForm.controls.endpos.value / 100;
		const rate = this.gasTransactionForm.controls.rate.value;
		if (strtpos !==0 || endpos !== 0 && rate !== "") {
			if ((endpos - strtpos) <= 2){
				this.gasTransactionForm.controls.billamnt.setValue(
					40000
				);
			}else{
			this.gasTransactionForm.controls.billamnt.setValue(
				Math.round(((endpos - strtpos) * rate) / 100)*100);
			}
		}
	}

	ngOnDestroy() {
		this.subscriptions.forEach((sb) => sb.unsubscribe());
	}
}
