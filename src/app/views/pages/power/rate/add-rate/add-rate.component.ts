// Angular
import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
// RxJS
import { BehaviorSubject, Observable, of, Subscription } from 'rxjs';
// NGRX
import { Store, select } from '@ngrx/store';
import { Update } from '@ngrx/entity';
import { AppState } from '../../../../../core/reducers';
// Layout
import { SubheaderService, LayoutConfigService } from '../../../../../core/_base/layout';
import { LayoutUtilsService, MessageType } from '../../../../../core/_base/crud';
import {PowerRateModel} from "../../../../../core/power/rate/rate.model";
import {
	selectLastCreatedPowerRateId,
	selectPowerRateActionLoading,
	selectPowerRateById
} from "../../../../../core/power/rate/rate.selector";
import {PowerRateOnServerCreated, PowerRateUpdated} from "../../../../../core/power/rate/rate.action";
import {PowerRateService} from '../../../../../core/power';

@Component({
  selector: 'kt-add-rate',
  templateUrl: './add-rate.component.html',
  styleUrls: ['./add-rate.component.scss']
})
export class AddRateComponent implements OnInit, OnDestroy {
	// Public properties
	powerRate: PowerRateModel;
	powerRateId$: Observable<string>;
	oldPowerRate: PowerRateModel;
	selectedTab = 0;
	loading$: Observable<boolean>;
	powerRateForm: FormGroup;
	hasFormErrors = false;
	loading : boolean  = false
	// Private properties
	private subscriptions: Subscription[] = [];
	constructor(
		private activatedRoute: ActivatedRoute,
		private router: Router,
		private powerRateFB: FormBuilder,
		private subheaderService: SubheaderService,
		private layoutUtilsService: LayoutUtilsService,
		private store: Store<AppState>,
		private layoutConfigService: LayoutConfigService,
		private service: PowerRateService
	) { }
	ngOnInit() {
		this.loading$ = this.store.pipe(select(selectPowerRateActionLoading));
		const routeSubscription =  this.activatedRoute.params.subscribe(params => {
			const id = params.id;
			if (id) {
				this.store.pipe(select(selectPowerRateById(id))).subscribe(res => {
					if (res) {
						this.powerRate = res;
						this.oldPowerRate = Object.assign({}, this.powerRate);
						this.initPowerRate();
					}
				});
			} else {
				this.powerRate = new PowerRateModel();
				this.powerRate.clear();
				this.initPowerRate();
			}
		});
		this.subscriptions.push(routeSubscription);
	}
	initPowerRate() {
		this.createForm();
	}
	createForm() {
		if (this.powerRate._id){
		this.powerRateForm = this.powerRateFB.group({
			nmrtepow: [this.powerRate.nmrtepow, Validators.required],
			rte: [this.powerRate.rte, Validators.required],
			ppju: [this.powerRate.ppju, Validators.required],
			srvc: [this.powerRate.srvc, Validators.required],
		});}else{
			this.powerRateForm = this.powerRateFB.group({
				nmrtepow: ["", Validators.required],
				rte: ["", Validators.required],
				ppju: ["", Validators.required],
				srvc: ["", Validators.required],
			});
		}
	}
	goBackWithId() {
		const url = `/power-management/power/rate`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}
	refreshPowerRate(isNew: boolean = false, id:string = "") {
		let url = this.router.url;
		if (!isNew) {
			this.router.navigate([url], { relativeTo: this.activatedRoute });
			return;
		}

		url = `/power-management/power/rate/edit/${id}`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}
	
	
	onSubmit(withBack: boolean = false) {
		this.hasFormErrors = false;
		const controls = this.powerRateForm.controls;
		/** check form */
		if (this.powerRateForm.invalid) {
			Object.keys(controls).forEach(controlName =>
				controls[controlName].markAsTouched()
			);

			this.hasFormErrors = true;
			this.selectedTab = 0;
			return;
		}

		this.loading = true;
		const editedPowerRate = this.preparePowerRate();
		if (editedPowerRate._id) {
			this.updatePowerRate(editedPowerRate, withBack);
			return;
		}
		this.addPowerRate(editedPowerRate, withBack);
	}
	preparePowerRate(): PowerRateModel {
		const controls = this.powerRateForm.controls;
		const _powerRate = new PowerRateModel();
		_powerRate.clear();
		_powerRate._id = this.powerRate._id;
		_powerRate.nmrtepow = controls.nmrtepow.value.toLowerCase();
		_powerRate.rte = controls.rte.value;
		_powerRate.ppju = controls.ppju.value;
		_powerRate.srvc = controls.srvc.value;
		
		return _powerRate;
	}
	addPowerRate( _powerRate: PowerRateModel, withBack: boolean = false) {
		const addSubscription = this.service.createPowerRate(_powerRate).subscribe(
			res => {
				const message = `New Electricity rate successfully has been added.`;
				this.layoutUtilsService.showActionNotification(message, MessageType.Create, 5000, true, true);
				const url = `/power-management/power/rate`;
				this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
			},
			err => {
				console.error(err);
				const message = 'Error while adding electricity rate | ' + err.statusText;
				this.layoutUtilsService.showActionNotification(message, MessageType.Create, 5000, true, false);
			}
		);
		this.subscriptions.push(addSubscription);
	}
	updatePowerRate(_powerRate: PowerRateModel, withBack: boolean = false) {
		// Update User
		// tslint:disable-next-line:prefer-const
		const editSubscription = this.service.updatePowerRate(_powerRate).subscribe(
			res => {
				const message = `Electricity rate successfully has been saved.`;
				this.layoutUtilsService.showActionNotification(message, MessageType.Update, 5000, true, true);
				const url = `/power-management/power/rate`;
				this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
			},
			err => {
				console.error(err);
				const message = 'Error while saving electricity rate | ' + err.statusText;
				this.layoutUtilsService.showActionNotification(message, MessageType.Update, 5000, true, false);
			}
		);
		this.subscriptions.push(editSubscription);
	}
	getComponentTitle() {
		let result = 'Create Electricity Rate';
		if (!this.powerRate || !this.powerRate._id) {
			return result;
		}

		result = `Edit Electricity Rate`;
		return result;
	}
	onAlertClose($event) {
		this.hasFormErrors = false;
	}
	ngOnDestroy() {
		this.subscriptions.forEach(sb => sb.unsubscribe());
	}

}
