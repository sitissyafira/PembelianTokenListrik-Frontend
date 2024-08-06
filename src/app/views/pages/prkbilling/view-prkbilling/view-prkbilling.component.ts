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
import { AccountBankService } from '../../../../core/masterData/bank/accountBank/accountBank.service';
import { environment } from '../../../../../environments/environment';
import { HttpClient } from '@angular/common/http';

@Component({
	selector: 'kt-view-prkbilling',
	templateUrl: './view-prkbilling.component.html',
	styleUrls: ['./view-prkbilling.component.scss']
})
export class ViewPrkbillingComponent implements OnInit, OnDestroy {
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
	date1 = new FormControl(new Date());
	codenum: any;
	buttonSave: boolean = true;
	isNew: boolean = false;
	ParkingFee: boolean = true;
	parkingvalue: Number;
	loading: boolean = false;

	virtualAcctRslt: any = []
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
		private http: HttpClient
	) { }

	ngOnInit() {
		this.loading$ = this.store.pipe(select(selectPrkbillingActionLoading));
		const routeSubscription = this.activatedRoute.params.subscribe(params => {
			const id = params.id;
			if (id) {
				this.store.pipe(select(selectPrkbillingById(id))).subscribe(res => {
					if (res) {

						console.log(res, "res view");

						this.isNew = res.isNEW;
						if (this.isNew == true) {
							this.ParkingFee = false;
							this.parkingvalue = res.parkingFee;

						} else {
							this.ParkingFee = true;
						}
						this.prkbilling = res;
						this.oldPrkbilling = Object.assign({}, this.prkbilling);

						this.http.get<any>(`${environment.baseAPI}/api/vatoken/getbyunit/${res.parking.unit}`).subscribe(
							res => {

								this.virtualAcctRslt = [
									{
										name: res.data.va_parking,
										_id: res.data._id
									}
								]
								console.log(res.data.va_parking, "res.data.va_parking");
							}
						)

						this.initPrkbilling();
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
		console.log(this.prkbilling.bank)
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
				priceRent: [{ value: this.prkbilling.amountParking, disabled: true }],
				parkingFee: [{ value: this.prkbilling.parkingFee, disabled: true }],
				isNEW: [{ value: this.prkbilling.isNEW, disabled: true }],
				amountParking: [{ value: this.prkbilling.amountParking, disabled: true }],
				unit: [this.prkbilling.unit],
				// bank: [{ value: this.prkbilling.bank, disabled: true }],
				virtualAccId: [{ value: this.prkbilling.virtualAccId, disabled: true }],
				isPaid: [{ value: this.prkbilling.isPaid, disabled: true }],
				customerBank: [{ value: this.prkbilling.customerBank, disabled: true }],
				customerBankNo: [{ value: this.prkbilling.customerBankNo, disabled: true }],
				desc: [{ value: this.prkbilling.desc, disabled: true }],
				paidDate: [{ value: this.prkbilling.paidDate, disabled: true }],
				paymentType: [{ value: this.prkbilling.paymentType, disabled: true }]
			});
		}
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

	loadAccountBank() {
		this.selection.clear();
		const queryParams = new QueryAddparkModel(
			null,
			"asc",
			null,
			1,
			1000
		);
		this.bservice.getListAccountBank(queryParams).subscribe(
			res => {
				this.bankResult = res.data;
			}
		);
	}

	getUnitId(id) {
		const controls = this.prkbillingForm.controls;
		this.parkingService.findAddparkById(id).subscribe(data => {
			controls.tenantName.setValue(data.data.customer);
			controls.priceRent.setValue(data.data.amountParking);
			controls.unit.setValue(data.data.unit);
			controls.amountRate.setValue(data.data.amountRate);

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


	getComponentTitle() {
		let result = `View Parking billing`;
		return result;
	}

	onAlertClose($event) {
		this.hasFormErrors = false;
	}


	ngOnDestroy() {
		this.subscriptions.forEach(sb => sb.unsubscribe());
	}

}
