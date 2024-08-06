import {Component, OnDestroy, OnInit} from '@angular/core';
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
import {WaterRateModel} from "../../../../../core/water/rate/rate.model";
import {
	selectLastCreatedWaterRateId,
	selectWaterRateActionLoading,
	selectWaterRateById
} from "../../../../../core/water/rate/rate.selector";
import {WaterRateOnServerCreated, WaterRateUpdated} from "../../../../../core/water/rate/rate.action";
import {WaterRateService} from '../../../../../core/water/rate/rate.service';

@Component({
  selector: 'kt-add-rate',
  templateUrl: './add-rate.component.html',
  styleUrls: ['./add-rate.component.scss']
})
export class AddRateComponent implements OnInit, OnDestroy {
	// Public properties
	waterRate: WaterRateModel;
	waterRateId$: Observable<string>;
	oldWaterRate: WaterRateModel;
	selectedTab = 0;
	loading$: Observable<boolean>;
	waterRateForm: FormGroup;
	hasFormErrors = false;
	loading : boolean  = false;
	// Private properties
	private subscriptions: Subscription[] = [];
	constructor(
		private activatedRoute: ActivatedRoute,
		private router: Router,
		private waterRateFB: FormBuilder,
		private subheaderService: SubheaderService,
		private layoutUtilsService: LayoutUtilsService,
		private store: Store<AppState>,
		private layoutConfigService: LayoutConfigService,
		private service: WaterRateService
	) { }
	ngOnInit() {
		this.loading$ = this.store.pipe(select(selectWaterRateActionLoading));
		const routeSubscription =  this.activatedRoute.params.subscribe(params => {
			const id = params.id;
			if (id) {
				this.store.pipe(select(selectWaterRateById(id))).subscribe(res => {
					if (res) {
						this.waterRate = res;
						this.oldWaterRate = Object.assign({}, this.waterRate);
						this.initWaterRate();
					}
				});
			} else {
				this.waterRate = new WaterRateModel();
				this.waterRate.clear();
				this.initWaterRate();
			}
		});
		this.subscriptions.push(routeSubscription);
	}
	initWaterRate() {
		this.createForm();
	}
	createForm() {
		if(this.waterRate._id){
		this.waterRateForm = this.waterRateFB.group({
			nmrtewtr: [this.waterRate.nmrtewtr, Validators.required],
			rte: [this.waterRate.rte, Validators.required],
			pemeliharaan: [this.waterRate.pemeliharaan, Validators.required],
			administrasi: [this.waterRate.administrasi, Validators.required],
		});}else{
			this.waterRateForm = this.waterRateFB.group({
				nmrtewtr: ["", Validators.required],
				rte: ["", Validators.required],
				pemeliharaan: ["", Validators.required],
				administrasi: ["", Validators.required],
			});
		}
	}
	goBackWithId() {
		const url = `/water-management/water/rate`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}
	refreshWaterRate(isNew: boolean = false, id:string = "") {
		let url = this.router.url;
		if (!isNew) {
			this.router.navigate([url], { relativeTo: this.activatedRoute });
			return;
		}

		url = `/water-management/water/rate/edit/${id}`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}


	onSubmit(withBack: boolean = false) {
		this.hasFormErrors = false;
		const controls = this.waterRateForm.controls;
		/** check form */
		if (this.waterRateForm.invalid) {
			Object.keys(controls).forEach(controlName =>
				controls[controlName].markAsTouched()
			);

			this.hasFormErrors = true;
			this.selectedTab = 0;
			return;
		}

		this.loading = true;
		const editedWaterRate = this.prepareWaterRate();
		if (editedWaterRate._id) {
			this.updateWaterRate(editedWaterRate, withBack);
			return;
		}
		this.addWaterRate(editedWaterRate, withBack);
	}
	
	prepareWaterRate(): WaterRateModel {
		const controls = this.waterRateForm.controls;
		const _waterRate = new WaterRateModel();
		_waterRate.clear();
		_waterRate._id = this.waterRate._id;
		_waterRate.nmrtewtr = controls.nmrtewtr.value.toLowerCase();
		_waterRate.rte = controls.rte.value;
		_waterRate.pemeliharaan = controls.pemeliharaan.value;
		_waterRate.administrasi = controls.administrasi.value;
		return _waterRate;
	}


	addWaterRate( _waterRate: WaterRateModel, withBack: boolean = false) {
		const addSubscription = this.service.createWaterRate(_waterRate).subscribe(
			res => {
				const message = `New water rate successfully has been added.`;
				this.layoutUtilsService.showActionNotification(message, MessageType.Create, 5000, true, true);
				const url = `/water-management/water/rate`;
				this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
			},
			err => {
				console.error(err);
				const message = 'Error while adding water rate | ' + err.statusText;
				this.layoutUtilsService.showActionNotification(message, MessageType.Create, 5000, true, false);
			}
		);
		this.subscriptions.push(addSubscription);
	}
	updateWaterRate(_waterRate: WaterRateModel, withBack: boolean = false) {
		// Update User
		// tslint:disable-next-line:prefer-const
		const addSubscription = this.service.updateWaterRate(_waterRate).subscribe(
			res => {
				const message = `Water rate successfully has been saved.`;
				this.layoutUtilsService.showActionNotification(message, MessageType.Update, 5000, true, true);
				const url = `/water-management/water/rate`;
				this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
			},
			err => {
				console.error(err);
				const message = 'Error while saving water rate | ' + err.statusText;
				this.layoutUtilsService.showActionNotification(message, MessageType.Create, 5000, true, false);
			}
		);
		this.subscriptions.push(addSubscription);
	}
	getComponentTitle() {
		let result = 'Create Water Rate';
		if (!this.waterRate || !this.waterRate._id) {
			return result;
		}

		result = `Edit Water Rate `;
		return result;
	}
	onAlertClose($event) {
		this.hasFormErrors = false;
	}
	ngOnDestroy() {
		this.subscriptions.forEach(sb => sb.unsubscribe());
	}

}
