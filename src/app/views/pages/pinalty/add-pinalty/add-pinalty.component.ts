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
import { LayoutUtilsService, MessageType, QueryParamsModel } from '../../../../core/_base/crud';
import {PinaltyModel} from "../../../../core/pinalty/pinalty.model";
import {
	selectLastCreatedPinaltyId,
	selectPinaltyActionLoading,
	selectPinaltyById
} from "../../../../core/pinalty/pinalty.selector";
import {PinaltyOnServerCreated, PinaltyUpdated} from "../../../../core/pinalty/pinalty.action";
import {PinaltyService} from '../../../../core/pinalty/pinalty.service';
import { lowerCase } from 'lodash';
import { SelectionModel } from '@angular/cdk/collections';
import { BillingService } from '../../../../core/billing/billing.service';

@Component({
	selector: 'kt-add-pinalty',
	templateUrl: './add-pinalty.component.html',
	styleUrls: ['./add-pinalty.component.scss']
})
export class AddPinaltyComponent implements OnInit, OnDestroy {
	// Public properties
	pinalty: PinaltyModel;
	PinaltyId$: Observable<string>;
	oldPinalty: PinaltyModel;
	selectedTab = 0;
	loading$: Observable<boolean>;
	selection = new SelectionModel<PinaltyModel>(true, []);
	pinaltyForm: FormGroup;
	billResult: any[] = [];
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
		private pinaltyFB: FormBuilder,
		private subheaderService: SubheaderService,
		private layoutUtilsService: LayoutUtilsService,
		private store: Store<AppState>,
		private service: PinaltyService,
		private billService: BillingService,
		private layoutConfigService: LayoutConfigService
	) { }

	ngOnInit() {
		this.loading$ = this.store.pipe(select(selectPinaltyActionLoading));
		const routeSubscription =  this.activatedRoute.params.subscribe(params => {
			const id = params.id;
			if (id) {
				this.store.pipe(select(selectPinaltyById(id))).subscribe(res => {
					if (res) {
						this.pinalty = res;
						this.oldPinalty = Object.assign({}, this.pinalty);
						this.initPinalty();
					}
				});
			} else {
				this.pinalty = new PinaltyModel();
				this.pinalty.clear();
				this.initPinalty();
			}
		});
		this.subscriptions.push(routeSubscription);
	}

	initPinalty() {
		this.createForm();
		this.loadBilling();
	}

	createForm() {
	if (this.pinalty._id){
			this.pinaltyForm = this.pinaltyFB.group({
			billing: [this.pinalty.billing],
			unit2: [this.pinalty.unit2],
			days: [this.pinalty.days],
			totalDenda: [this.pinalty.totalDenda],
		});
		}else{
			this.pinaltyForm = this.pinaltyFB.group({
			billing: [""],
  			unit2: [""],
    		days: [""],
			totalDenda: [{value:"", disabled:true}],
			

			totalbill : [{value:"", disabled:true}],
			});
		}
	}

	loadBilling(){
		this.selection.clear();
		const queryParams = new QueryParamsModel(
			null,
			"asc",
			null,
			1,
			1000
		);
		this.billService.getListForPinalty(queryParams).subscribe(
			res => {
				this.billResult = res.data;
			}
		);
	}

	billingOnChange(id){
		this.billService.getBillingByID(id).subscribe(
			data => {
			const controls = this.pinaltyForm.controls;
			
			const change = data.data.totalBilling.toFixed(2);
			controls.totalbill.setValue(change);
			controls.unit2.setValue(data.data.unit2);
			this.getDataChange();
		})
	}

	getDataChange(){
		const controls = this.pinaltyForm.controls;
		const change = controls.totalbill.value;
		console.log(change)
		const valueDyas = controls.days.value;
			if (change != 0 && valueDyas != 0){
				const valuepinalty = change / 1000 * valueDyas
				controls.totalDenda.setValue(Math.max(valuepinalty).toFixed(2));
			}
	}

	goBackWithId() {
		const url = `/rateunit`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}

	refreshPinalty(isNew: boolean = false, id:string = "") {
		let url = this.router.url;
		if (!isNew) {
			this.router.navigate([url], { relativeTo: this.activatedRoute });
			return;
		}
		url = `/pinalty/edit/${id}`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}

	onSubmit(withBack: boolean = false) {
		this.hasFormErrors = false;
		const controls = this.pinaltyForm.controls;
		/** check form */
		if (this.pinaltyForm.invalid) {
			Object.keys(controls).forEach(controlName =>
				controls[controlName].markAsTouched()
			);

			this.hasFormErrors = true;
			this.selectedTab = 0;
			return;
		}
		this.loading = true;
		const editedPinalty = this.preparePinalty();
		if (editedPinalty._id) {
			this.updatePinalty(editedPinalty, withBack);
			return;
		}

		this.addPinalty(editedPinalty, withBack);
	}
	
	preparePinalty(): PinaltyModel {
		const controls = this.pinaltyForm.controls;
		const _pinalty = new PinaltyModel();
		_pinalty.clear();
		_pinalty._id = this.pinalty._id;
		_pinalty.billing = controls.billing.value.toLowerCase();
		_pinalty.unit2 = controls.unit2.value.toLowerCase();
		_pinalty.days = controls.days.value;
		_pinalty.totalDenda = controls.totalDenda.value;
		return _pinalty;
	}

	addPinalty( _pinalty: PinaltyModel, withBack: boolean = false) {
		const addSubscription = this.service.createPinalty(_pinalty).subscribe(
			res => {
				const message = `New penalty rate successfully has been added.`;
				this.layoutUtilsService.showActionNotification(message, MessageType.Create, 5000, true, true);
				const url = `/pinalty`;
				this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
			},
			err => {
				console.error(err);
				const message = 'Error while adding penalty | ' + err.statusText;
				this.layoutUtilsService.showActionNotification(message, MessageType.Create, 5000, true, false);
			}
		);
		this.subscriptions.push(addSubscription);
	}

	updatePinalty(_pinalty: PinaltyModel, withBack: boolean = false) {
		const addSubscription = this.service.updatePinalty(_pinalty).subscribe(
			res => {
				const message = `Penalty successfully has been saved.`;
				this.layoutUtilsService.showActionNotification(message, MessageType.Update, 5000, true, true);
				const url = `/pinalty`;
				this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
			},
			err => {
				console.error(err);
				const message = 'Error while adding penalty | ' + err.statusText;
				this.layoutUtilsService.showActionNotification(message, MessageType.Update, 5000, true, false);
			}
		);
		this.subscriptions.push(addSubscription);
	}

	getComponentTitle() {
		let result = 'Create Penalty';
		if (!this.pinalty || !this.pinalty._id) {
			return result;
		}

		result = `Edit Penalty`;
		return result;
	}

	onAlertClose($event) {
		this.hasFormErrors = false;
	}

	ngOnDestroy() {
		this.subscriptions.forEach(sb => sb.unsubscribe());
	}

}
