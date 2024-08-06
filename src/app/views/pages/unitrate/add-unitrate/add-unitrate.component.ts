import {Component, OnDestroy, OnInit} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
// RxJS
import { BehaviorSubject, Observable, of, Subscription } from 'rxjs';
// NGRX
import { Store, select } from '@ngrx/store';
import { Update } from '@ngrx/entity';
import { AppState } from '../../../../core/reducers';
// Layout
import { SubheaderService, LayoutConfigService } from '../../../../core/_base/layout';
import { LayoutUtilsService, MessageType } from '../../../../core/_base/crud';
import {UnitRateModel} from "../../../../core/unitrate/unitrate.model";
import {
	selectLastCreatedUnitRateId,
	selectUnitRateActionLoading,
	selectUnitRateById
} from "../../../../core/unitrate/unitrate.selector";
import {UnitRateOnServerCreated, UnitRateUpdated} from "../../../../core/unitrate/unitrate.action";
import {UnitRateService} from '../../../../core/unitrate/unitrate.service';
import { lowerCase } from 'lodash';

@Component({
	selector: 'kt-add-unitrate',
	templateUrl: './add-unitrate.component.html',
	styleUrls: ['./add-unitrate.component.scss']
})
export class AddUnitRateComponent implements OnInit, OnDestroy {
	// Public properties
	unitRate: UnitRateModel;
	UnitRateId$: Observable<string>;
	oldUnitRate: UnitRateModel;
	selectedTab = 0;
	loading$: Observable<boolean>;
	unitRateForm: FormGroup;
	hasFormErrors = false;
	isHidden: boolean = true;
	RentPrice: boolean = true;
	IsRent: boolean = false;
	rentValue : number;

	loading  : boolean = false
	// Private properties
	private subscriptions: Subscription[] = [];
	constructor(
		private activatedRoute: ActivatedRoute,
		private router: Router,
		private unitRateFB: FormBuilder,
		private subheaderService: SubheaderService,
		private layoutUtilsService: LayoutUtilsService,
		private store: Store<AppState>,
		private service: UnitRateService,
		private layoutConfigService: LayoutConfigService
	) { }

	ngOnInit() {
		this.loading$ = this.store.pipe(select(selectUnitRateActionLoading));
		const routeSubscription =  this.activatedRoute.params.subscribe(params => {
			const id = params.id;
			if (id) {
				this.store.pipe(select(selectUnitRateById(id))).subscribe(res => {
					if (res) {
						this.unitRate = res;
						this.IsRent = res.isRent;
						if (this.IsRent == true){
							this.RentPrice = false;
							this.rentValue = res.rentPrice;
						} else {
							this.RentPrice = true;
						}
						this.oldUnitRate = Object.assign({}, this.unitRate);
						this.initUnitRate();
					}
				});
			} else {
				this.unitRate = new UnitRateModel();
				this.unitRate.clear();
				this.initUnitRate();
			}
		});
		this.subscriptions.push(routeSubscription);
	}

	initUnitRate() {
		this.createForm();
		this.changeRent();
	}

	createForm() {
	if (this.unitRate._id){
			this.unitRateForm = this.unitRateFB.group({
			unit_rate_name : [this.unitRate.unit_rate_name, Validators.required],
			service_rate: [this.unitRate.service_rate, Validators.required],
			sinking_fund: [this.unitRate.sinking_fund, Validators.required],
			isRent : [this.unitRate.isRent],
			rentPrice : [this.unitRate.rentPrice],
			overstay_rate: [this.unitRate.overstay_rate],
		});
		}else{
			this.unitRateForm = this.unitRateFB.group({
			unit_rate_name : ["", Validators.required],
			service_rate: ["", Validators.required],
			sinking_fund: ["", Validators.required],
			isRent : [this.unitRate.isRent],
			rentPrice : [""],
			overstay_rate: [""],
			});
		}
	}

	goBackWithId() {
		const url = `/rateunit`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}

	showHidden(){
		this.isHidden = true;
	}

	refreshUnitRate(isNew: boolean = false, id:string = "") {
		let url = this.router.url;
		if (!isNew) {
			this.router.navigate([url], { relativeTo: this.activatedRoute });
			return;
		}
		url = `/rateunit/edit/${id}`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}
	onSubmit(withBack: boolean = false) {
		this.hasFormErrors = false;
		const controls = this.unitRateForm.controls;
		/** check form */
		if (this.unitRateForm.invalid) {
			Object.keys(controls).forEach(controlName =>
				controls[controlName].markAsTouched()
			);

			this.hasFormErrors = true;
			this.selectedTab = 0;
			return;
		}

		this.loading = true;
		const editedUnitRate = this.prepareUnitRate();

		if (editedUnitRate._id) {
			this.updateUnitRate(editedUnitRate, withBack);
			return;
		}

		this.addUnitRate(editedUnitRate, withBack);
	}
	prepareUnitRate(): UnitRateModel {
		const controls = this.unitRateForm.controls;
		const _unitRate = new UnitRateModel();
		_unitRate.clear();
		_unitRate._id = this.unitRate._id;
		_unitRate.unit_rate_name = controls.unit_rate_name.value.toLowerCase();
		_unitRate.service_rate = controls.service_rate.value;
		_unitRate.sinking_fund = controls.sinking_fund.value;
		_unitRate.overstay_rate = controls.overstay_rate.value;
		_unitRate.isRent = controls.isRent.value;
		_unitRate.rentPrice = controls.rentPrice.value;
		return _unitRate;
	}

	addUnitRate( _unitRate: UnitRateModel, withBack: boolean = false) {
		const addSubscription = this.service.createUnitRate(_unitRate).subscribe(
			res => {
				const message = `New unit rate successfully has been added.`;
				this.layoutUtilsService.showActionNotification(message, MessageType.Create, 5000, true, true);
				const url = `/rateunit`;
				this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
			},
			err => {
				console.error(err);
				const message = 'Error while adding unit rate | ' + err.statusText;
				this.layoutUtilsService.showActionNotification(message, MessageType.Create, 5000, true, false);
			}
		);
		this.subscriptions.push(addSubscription);
	}

	updateUnitRate(_unitRate: UnitRateModel, withBack: boolean = false) {
		// Update User
		// tslint:disable-next-line:prefer-const
		const addSubscription = this.service.updateUnitRate(_unitRate).subscribe(
			res => {
				const message = `Unit rate successfully has been saved.`;
				this.layoutUtilsService.showActionNotification(message, MessageType.Update, 5000, true, true);
				const url = `/rateunit`;
				this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
			},
			err => {
				console.error(err);
				const message = 'Error while adding unit rate | ' + err.statusText;
				this.layoutUtilsService.showActionNotification(message, MessageType.Update, 5000, true, false);
			}
		);
		this.subscriptions.push(addSubscription);
	}

	getComponentTitle() {
		let result = 'Create Unit Rate';
		if (!this.unitRate || !this.unitRate._id) {
			return result;
		}

		result = `Edit Unit Rate`;
		return result;
	}

	changeRent(){
		if (this.IsRent == true){
			this.RentPrice = false;
			this.showTaxId();
		} else {
			// console.log(this.leaseForm.controls['tax_id']);
			this.RentPrice = true;
			this.hiddenTaxId();
		}
	}

	hiddenTaxId(){
		this.unitRateForm.controls['rentPrice'].setValidators([]);
		this.unitRateForm.controls['rentPrice'].updateValueAndValidity();
	}
	showTaxId(){
		this.unitRateForm.controls['rentPrice'].setValidators([Validators.required]);
		this.unitRateForm.controls['rentPrice'].updateValueAndValidity();
	}

	onAlertClose($event) {
		this.hasFormErrors = false;
	}

	ngOnDestroy() {
		this.subscriptions.forEach(sb => sb.unsubscribe());
	}

}
