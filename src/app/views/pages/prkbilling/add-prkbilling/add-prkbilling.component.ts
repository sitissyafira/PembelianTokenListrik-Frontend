import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
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
import { MatDialog } from '@angular/material';
import { SavingDialog } from "../../../partials/module/saving-confirm/confirmation.dialog.component";


@Component({
	selector: 'kt-add-prkbilling',
	templateUrl: './add-prkbilling.component.html',
	styleUrls: ['./add-prkbilling.component.scss']
})
export class AddPrkbillingComponent implements OnInit, OnDestroy {
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
	date1 = new FormControl(new Date());
	codenum: any;
	buttonSave: boolean = true;
	isNew: boolean = false;
	ParkingFee: boolean = true;
	UnitResultFiltered = [];
	viewBlockResult = new FormControl();
	showSpinner = false;

	isGenerateBilling: string = "" /* To determine the condition of the generating billing process in progress */
	msgErrorGenerate: string = "" /* To display message error proccessing generate */


	loadingData = {
		unit: false,
	};

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

		private parkingService: AddparkService,
		private service: PrkbillingService,
		private layoutConfigService: LayoutConfigService,
		private cd: ChangeDetectorRef,
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
					}
				});
			} else {
				this.prkbilling = new PrkbillingModel();
				this.prkbilling.clear();
				this.initPrkbilling();
			}
		});
		this.subscriptions.push(routeSubscription);
	}

	initPrkbilling() {
		this.createForm();
		this.loadUnit(null);
		this.hiddenAfterRes()
	}

	hiddenAfterRes() {
		if (this.prkbilling._id) {
			this.buttonSave = true;
		} else {
			this.buttonSave = false;
		}
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
				isNEW: [this.prkbilling.isNEW],
				unit: [this.prkbilling.unit],
				amountParking: [{ value: this.prkbilling.amountParking, disabled: true }]
			});
		} else {
			this.getNumber();
			this.prkbillingForm = this.prkbillingFB.group({
				billingNo: [{ value: this.codenum, disabled: true }],
				billingDate: [{ value: this.date1.value, disabled: false }, Validators.required],
				createdDate: [{ value: this.date1.value, disabled: true }, Validators.required],
				dueDate: ["", Validators.required],
				notes: [""],
				parking: [""],
				tenantName: [""],
				priceRent: [""],
				isNEW: [""],
				unit: [""],
				parkingFee: [this.prkbilling.parkingFee],
				amountParking: [""],
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

	loadData() {
		this.showSpinner = true;
		setTimeout(() => {
			this.showSpinner = false;
		}, 1000);

	}

	loadUnit(text: string) {
		this.selection.clear();
		const queryParams = new QueryAddparkModel(
			text,
			"asc",
			null,
			1,
			1000
		);
		this.parkingService.getListAddpark(queryParams).subscribe(
			res => {
				this.unitResult = res.data;
				console.log(this.unitResult);
				this.UnitResultFiltered = this.unitResult.slice();
				this.cd.markForCheck();
				this.viewBlockResult.enable();
				this.loadingData.unit = false;
			}
		);
	}

	_setBlockValue(value) {
		//console.log(value, 'from the option click');
		this.prkbillingForm.patchValue({ unit: value.unit2 });
		this.prkbillingForm.patchValue({ parking: value._id });
		// this.isUnitChild = value.isChild;
		// this.unitOnChange(value._id);
		this.getUnitId(value._id)
	}


	getUnitId(id) {
		const controls = this.prkbillingForm.controls;
		this.parkingService.findAddparkById(id).subscribe(data => {
			controls.tenantName.setValue(data.data.customer);
			controls.priceRent.setValue(data.data.parkingRate);
			controls.unit.setValue(data.data.unit2);
			controls.amountParking.setValue(data.data.parkingRate);
		});
	}


	goBackWithId() {
		const url = `/prkbilling`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}

	_onKeyup(e: any) {
		this.prkbillingForm.patchValue({ unit: undefined });
		this._filterCstmrList(e.target.value);
	}

	_filterCstmrList(text: string) {
		// this.UnitResultFiltered = this.unitResult.filter((i) => {
		// 	const filterText = `${i.unit2.toLocaleLowerCase()}`;
		// 	if (filterText.includes(text.toLocaleLowerCase())) return i;
		// });
		this.loadUnit(text)
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
		this.hasFormErrors = false;
		const controls = this.prkbillingForm.controls;
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

		if (editedPrkbilling._id) {
			this.updatePrkbilling(editedPrkbilling, withBack);
			return;
		}

		this.addPrkbilling(editedPrkbilling, withBack);
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

		console.log(controls.unit.value, "controls.unit.value");


		return _prkbilling;
	}

	addPrkbilling(_prkbilling: PrkbillingModel, withBack: boolean = false) {
		this.processSaving()

		const addSubscription = this.service.createPrkbilling(_prkbilling).subscribe(
			res => {
				this.dialog.closeAll()

				const message = `New parking billing successfully has been added.`;
				this.layoutUtilsService.showActionNotification(message, MessageType.Create, 5000, true, true);
				const url = `/prkbilling`;
				this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
			},
			err => {
				this.dialog.closeAll()

				console.error(err);
				const message = 'Error while adding parking billing | ' + err.statusText;
				this.layoutUtilsService.showActionNotification(message, MessageType.Create, 5000, true, false);
			}
		);
		this.subscriptions.push(addSubscription);
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
		let result = 'Create Parking billing';
		if (!this.prkbilling || !this.prkbilling._id) {
			return result;
		}

		result = `View Parking billing`;
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
