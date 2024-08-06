import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
// RxJS
import { BehaviorSubject, Observable, of, Subscription } from 'rxjs';
// NGRX
import { Store, select } from '@ngrx/store';
import { Update } from '@ngrx/entity';
import { AppState } from '../../../../core/reducers';
// Layout
import { SubheaderService, LayoutConfigService } from '../../../../core/_base/layout';
import { LayoutUtilsService, MessageType } from '../../../../core/_base/crud';
import { PrkbillingModel } from "../../../../core/prkbilling/prkbilling.model";
import {
	selectLastCreatedPrkbillingId,
	selectPrkbillingActionLoading,
	selectPrkbillingById
} from "../../../../core/prkbilling/prkbilling.selector";
import { PrkbillingService } from '../../../../core/prkbilling/prkbilling.service';
import { QueryOwnerTransactionModel } from '../../../../core/contract/ownership/queryowner.model';
import { LeaseContractService } from '../../../../core/contract/lease/lease.service';
import { OwnershipContractService } from '../../../../core/contract/ownership/ownership.service';
import { SelectionModel } from '@angular/cdk/collections';
import { AddparkService } from '../../../../core/addpark/addpark.service';
import { QueryAddparkModel } from '../../../../core/addpark/queryaddpark.model';
import { BankService } from '../../../../core/masterData/bank/bank/bank.service';
import { AccountBankService } from '../../../../core/masterData/bank/accountBank/accountBank.service';
import { QueryAccountBankModel } from '../../../../core/masterData/bank/accountBank/queryaccountBank.model';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';
import { MatDialog } from '@angular/material';
import { SavingDialog } from "../../../partials/module/saving-confirm/confirmation.dialog.component";


@Component({
	selector: 'kt-edit-prkbilling',
	templateUrl: './edit-prkbilling.component.html',
	styleUrls: ['./edit-prkbilling.component.scss']
})
export class EditPrkbillingComponent implements OnInit, OnDestroy {
	// Public properties
	prkbilling: PrkbillingModel;
	PrkbillingId$: Observable<string>;
	oldPrkbilling: PrkbillingModel;
	selectedTab = 0;
	loading$: Observable<boolean>;
	prkbillingForm: FormGroup;
	hasFormErrors = false;
	selection = new SelectionModel<PrkbillingModel>(true, []);
	unitResult: any[] = [];
	bankResult: any[] = [];
	BankResultFiltered: any[] = [];
	// virtualAcctRslt: any = []
	date1 = new FormControl(new Date());
	codenum: any;
	buttonSave: boolean = true;
	isNew: boolean = false;
	ParkingFee: boolean = true;

	idUnitBillPark: any = ""
	idVA: string = ""
	nameVirtualAcct: string = ""
	virtualAcctRslt: any = []
	viewBankResult = new FormControl()
	isVirtualAcct: boolean = false

	isGenerateBilling: string = "" /* To determine the condition of the generating billing process in progress */
	msgErrorGenerate: string = "" /* To display message error proccessing generate */


	loading: boolean = false;
	// Private properties
	private subscriptions: Subscription[] = [];
	constructor(
		private activatedRoute: ActivatedRoute,
		private router: Router,
		private prkbillingFB: FormBuilder,
		private subheaderService: SubheaderService,
		private layoutUtilsService: LayoutUtilsService,
		private store: Store<AppState>,
		private bservice: AccountBankService,
		private parkingService: AddparkService,
		private service: PrkbillingService,
		private layoutConfigService: LayoutConfigService,
		private http: HttpClient,
		private dialog: MatDialog,

	) { }

	ngOnInit() {
		this.loading$ = this.store.pipe(select(selectPrkbillingActionLoading));
		const routeSubscription = this.activatedRoute.params.subscribe(params => {
			const id = params.id;
			if (id) {
				this.store.pipe(select(selectPrkbillingById(id))).subscribe(res => {
					if (res) {
						this.prkbilling = res;
						this.oldPrkbilling = Object.assign({}, this.prkbilling);
						this.initPrkbilling();
						this.idUnitBillPark = res.parking.unit

						this.loadVirtualAccount(res.parking.unit)
					}

				});
			}

		});
		this.subscriptions.push(routeSubscription);
	}

	initPrkbilling() {
		this.createForm();
		this.loadUnit();
		this.loadAccountBank()
	}

	changeParking() {
		if (this.isNew == true) {
			this.ParkingFee = false;
		} else {
			this.ParkingFee = true;
		}
	}

	createForm() {
		if (this.prkbilling._id) {
			this.prkbillingForm = this.prkbillingFB.group({
				billingNo: [{ value: this.prkbilling.billingNo, disabled: true }],
				billingDate: [{ value: this.prkbilling.billingDate, disabled: true }],
				createdDate: [{ value: this.prkbilling.createdDate, disabled: true }],
				dueDate: [{ value: this.prkbilling.dueDate, disabled: true }],
				notes: [{ value: this.prkbilling.notes, disabled: true }],
				parking: [{ value: this.prkbilling.parking._id, disabled: true }],
				tenantName: [{ value: this.prkbilling.parking.customer, disabled: true }],
				priceRent: [{ value: this.prkbilling.parking.parkingRate, disabled: true }],
				parkingFee: [{ value: this.prkbilling.parkingFee, disabled: true }],
				isNEW: [{ value: this.prkbilling.isNEW, disabled: true }],
				unit: [this.prkbilling.unit],
				amountParking: [{ value: this.prkbilling.amountParking, disabled: true }],

				// bank: ["", Validators.required],
				virtualAccId: [""],
				account: [""],
				isPaid: true,
				customerBank: [""],
				customerBankNo: [""],
				paymentType: [""],
				desc: [""],
				paidDate: [{ value: this.date1.value, disabled: false }]
			});
		}
	}

	getNumber() {
		this.service.generateCodeLeaseBiling().subscribe(
			res => {
				this.codenum = res.data
				const controls = this.prkbillingForm.controls;
				controls.billingNo.setValue(this.codenum);
			}
		)
	}



	loadUnit() {
		this.selection.clear();
		const queryParams = new QueryAddparkModel(
			null,
			"asc",
			null,
			1,
			1000
		);
		this.parkingService.getListAddpark(queryParams).subscribe(
			res => {
				this.unitResult = res.data;
			}
		);
	}


	/**
	 * loadAccountBank
	 */
	loadAccountBank() {
		this.selection.clear();
		const queryParams = new QueryAccountBankModel(
			null,
			"asc",
			null,
			1,
			1000
		);
		this.bservice.getListAccountBankPaidTo(queryParams).subscribe(
			res => {
				this.bankResult = res.data;
				this.BankResultFiltered = res.data;
			}
		);
	}

	/**
	 * _onKeyupPaidTo
	 * @param event 
	 */
	_onKeyupPaidTo(event) {
		this._filterBankList(event.target.value)
	}

	/**
	 * _filterBankList
	 * @param text 
	 */
	_filterBankList(text: string) {
		this.BankResultFiltered = this.bankResult.filter((i) => {
			const filterText = `${i.acctName.toLocaleLowerCase()} - ${i.acctNo.toLocaleLowerCase()}`;
			if (filterText.includes(text.toLocaleLowerCase())) return i;
		});
	}

	/**
	 * _setBankValue
	 * @param id 
	 */
	_setBankValue(id) {
		const controls = this.prkbillingForm.controls
		controls.account.setValue(id)
	}

	loadVirtualAccount(parkUnit) {
		this.http.get<any>(`${environment.baseAPI}/api/vatoken/getbyunit/${parkUnit}`).subscribe(
			res => {
				this.isVirtualAcct = true
				this.idVA = res.data._id
				this.nameVirtualAcct = res.data.va_parking

				this.virtualAcctRslt = [
					{
						name: res.data.va_parking,
						_id: res.data._id
					}
				]
			}
		)
	}

	getUnitId(id) {
		const controls = this.prkbillingForm.controls;
		this.parkingService.findAddparkById(id).subscribe(data => {
			controls.tenantName.setValue(data.data.customer);
			controls.priceRent.setValue(data.data.amountParking);
			controls.unit.setValue(data.data.unit);
			controls.amountParking.setValue(data.data.amountParking);
		});
	}

	goBackWithId() {
		const url = `/prkbilling`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}

	refreshPrkbilling(isNew: boolean = false, id: string = "") {
		let url = this.router.url;
		if (!isNew) {
			this.router.navigate([url], { relativeTo: this.activatedRoute });
			return;
		}

		url = `/prkbilling/edit/${id}`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}

	reset() {
		this.prkbilling = Object.assign({}, this.oldPrkbilling);
		this.createForm();
		this.hasFormErrors = false;
		this.prkbillingForm.markAsPristine();
		this.prkbillingForm.markAsUntouched();
		this.prkbillingForm.updateValueAndValidity();
	}

	onSubmit(withBack: boolean = false) {
		const controls = this.prkbillingForm.controls;

		if (this.isVirtualAcct) {
			if (!controls.virtualAccId.value) {
				const message = `Choose Paid To`;
				this.layoutUtilsService.showActionNotification(message, MessageType.Update, 5000, true, true);
				return
			}
		} else {
			if (!controls.account.value) {
				const message = `Choose Paid To`;
				this.layoutUtilsService.showActionNotification(message, MessageType.Update, 5000, true, true);
				return
			}
		}

		this.hasFormErrors = false;
		/** check form */
		if (this.prkbillingForm.invalid) {
			Object.keys(controls).forEach(controlName =>
				controls[controlName].markAsTouched()
			);

			this.hasFormErrors = true;
			this.selectedTab = 0;
			return;
		}

		this.loading = true;
		const editedPrkbilling = this.preparePrkbilling();
		this.updatePrkbilling(editedPrkbilling, withBack);
	}
	preparePrkbilling(): PrkbillingModel {
		const controls = this.prkbillingForm.controls;
		const _prkbilling = new PrkbillingModel();
		_prkbilling.clear();
		_prkbilling._id = this.prkbilling._id;
		_prkbilling.billingNo = controls.billingNo.value.toLowerCase();
		_prkbilling.billingDate = controls.billingDate.value;
		_prkbilling.createdDate = controls.createdDate.value;
		_prkbilling.dueDate = controls.dueDate.value;
		_prkbilling.notes = controls.notes.value;
		_prkbilling.parking = controls.parking.value;
		_prkbilling.parkingFee = controls.parkingFee.value;
		_prkbilling.isNEW = controls.isNEW.value;
		_prkbilling.unit = controls.unit.value.toLowerCase();
		_prkbilling.amountParking = controls.amountParking.value;

		_prkbilling.account = controls.account.value ? controls.account.value : undefined;
		_prkbilling.virtualAccId = controls.virtualAccId.value ? controls.virtualAccId.value : undefined;
		// _prkbilling.bank = controls.bank.value;
		_prkbilling.isPaid = controls.isPaid.value;
		_prkbilling.customerBank = controls.customerBank.value;
		_prkbilling.customerBankNo = controls.customerBankNo.value;
		_prkbilling.desc = controls.desc.value;
		_prkbilling.paidDate = controls.paidDate.value;
		_prkbilling.paymentType = controls.paymentType.value;
		return _prkbilling;
	}

	updatePrkbilling(_prkbilling: PrkbillingModel, withBack: boolean = false) {
		// Update User
		// tslint:disable-next-line:prefer-const
		this.processSaving()
		const addSubscription = this.service.updatePrkbilling(_prkbilling).subscribe(
			res => {
				this.dialog.closeAll()
				const message = `Parking billing successfully has been saved.`;
				this.layoutUtilsService.showActionNotification(message, MessageType.Update, 5000, true, true);
				const url = `/prkbilling`;
				this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
			},
			err => {
				console.error(err);
				this.dialog.closeAll()

				const message = 'Error while adding parking billing | ' + err.statusText;
				this.layoutUtilsService.showActionNotification(message, MessageType.Update, 5000, true, false);
			}
		);
		this.subscriptions.push(addSubscription);
	}

	getComponentTitle() {
		let result = 'Update Parking billing';
		return result;
	}

	onAlertClose($event) {
		this.hasFormErrors = false;
	}




	ngOnDestroy() {
		this.subscriptions.forEach(sb => sb.unsubscribe());
	}

	/**
 * Load Process Saving.
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
