import {Component, OnDestroy, OnInit} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
// RxJS
import { Observable, Subscription } from 'rxjs';
// NGRX
import { Store, select } from '@ngrx/store';
import { AppState } from '../../../../core/reducers';
// Layout
import { SubheaderService, LayoutConfigService } from '../../../../core/_base/layout';
import { LayoutUtilsService } from '../../../../core/_base/crud';
import {UnitRateModel} from "../../../../core/unitrate/unitrate.model";
import {
	selectUnitRateActionLoading,
	selectUnitRateById
} from "../../../../core/unitrate/unitrate.selector";
import {UnitRateService} from '../../../../core/unitrate/unitrate.service';


@Component({
	selector: 'kt-view-unitrate',
	templateUrl: './view-unitrate.component.html',
	styleUrls: ['./view-unitrate.component.scss']
})
export class ViewUnitRateComponent implements OnInit, OnDestroy {
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
			unit_rate_name : [{value:this.unitRate.unit_rate_name, disabled:true}],
			service_rate: [{value:this.unitRate.service_rate, disabled:true}],
			sinking_fund: [{value:this.unitRate.sinking_fund, disabled:true}],
			isRent : [{value:this.unitRate.isRent, disabled:true}],
			rentPrice : [{value:this.unitRate.rentPrice, disabled:true}],
			overstay_rate: [{value:this.unitRate.overstay_rate, disabled:true}],
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

	
	getComponentTitle() {
		let result = `View Unit Rate`;
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
