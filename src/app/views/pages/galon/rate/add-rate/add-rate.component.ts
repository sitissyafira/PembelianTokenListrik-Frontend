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
import { GalonRateModel } from "../../../../../core/galon/rate/rate.model";
import {
	selectLastCreatedGalonRateId,
	selectGalonRateActionLoading,
	selectGalonRateById
} from "../../../../../core/galon/rate/rate.selector";
import { GalonRateOnServerCreated, GalonRateUpdated } from "../../../../../core/galon/rate/rate.action";
import { GalonRateService } from '../../../../../core/galon';
import { ServiceFormat } from '../../../../../core/serviceFormat/format.service';

@Component({
	selector: 'kt-add-rate',
	templateUrl: './add-rate.component.html',
	styleUrls: ['./add-rate.component.scss']
})
export class AddRateComponent implements OnInit, OnDestroy {
	// Public properties
	galonRate: GalonRateModel;
	galonRateId$: Observable<string>;
	oldGalonRate: GalonRateModel;
	selectedTab = 0;
	loading$: Observable<boolean>;
	galonRateForm: FormGroup;
	hasFormErrors = false;
	loading: boolean = false
	// Private properties
	private subscriptions: Subscription[] = [];
	constructor(
		private activatedRoute: ActivatedRoute,
		private serviceFormat: ServiceFormat,
		private router: Router,
		private galonRateFB: FormBuilder,
		private subheaderService: SubheaderService,
		private layoutUtilsService: LayoutUtilsService,
		private store: Store<AppState>,
		private layoutConfigService: LayoutConfigService,
		private service: GalonRateService
	) { }
	ngOnInit() {
		this.loading$ = this.store.pipe(select(selectGalonRateActionLoading));
		const routeSubscription = this.activatedRoute.params.subscribe(params => {
			const id = params.id;
			if (id) {
				this.store.pipe(select(selectGalonRateById(id))).subscribe(res => {
					if (res) {
						this.galonRate = res;
						this.oldGalonRate = Object.assign({}, this.galonRate);
						this.initGalonRate();
					}
				});
			} else {
				this.galonRate = new GalonRateModel();
				this.galonRate.clear();
				this.initGalonRate();
			}
		});
		this.subscriptions.push(routeSubscription);
	}
	initGalonRate() {
		this.createForm();
	}
	createForm() {
		if (this.galonRate._id) {
			this.galonRateForm = this.galonRateFB.group({
				_id: [this.galonRate._id, Validators.required],
				brand: [this.galonRate.brand, Validators.required],
				rate: [this.serviceFormat.rupiahFormatImprovement(this.galonRate.rate ? this.galonRate.rate : 0), Validators.required],
				// ppju: [this.galonRate.ppju, Validators.required],
				// srvc: [this.galonRate.srvc, Validators.required],
			});
		} else {
			this.galonRateForm = this.galonRateFB.group({
				_id: [""],
				brand: ["", Validators.required],
				rate: ["", Validators.required],
				// ppju: ["", Validators.required],
				// srvc: ["", Validators.required],
			});
		}
	}
	goBackWithId() {
		const url = `/galon-management/galon/rate`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}
	refreshGalonRate(isNew: boolean = false, id: string = "") {
		let url = this.router.url;
		if (!isNew) {
			this.router.navigate([url], { relativeTo: this.activatedRoute });
			return;
		}

		url = `/galon-management/galon/rate/edit/${id}`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}


	onSubmit(withBack: boolean = false) {
		this.hasFormErrors = false;
		const controls = this.galonRateForm.controls;
		/** check form */
		if (this.galonRateForm.invalid) {
			Object.keys(controls).forEach(controlName =>
				controls[controlName].markAsTouched()
			);

			this.hasFormErrors = true;
			this.selectedTab = 0;
			return;
		}

		this.loading = true;
		const editedGalonRate = this.prepareGalonRate();
		if (editedGalonRate._id) {
			this.updateGalonRate(editedGalonRate, withBack);
			return;
		}
		this.addGalonRate(editedGalonRate, withBack);
	}
	prepareGalonRate(): GalonRateModel {
		const controls = this.galonRateForm.controls;
		const _galonRate = new GalonRateModel();
		_galonRate.clear();
		_galonRate._id = this.galonRate._id;
		_galonRate.brand = controls.brand.value
		_galonRate.rate = this.serviceFormat.formatFloat(controls.rate.value);
		// _galonRate.ppju = controls.ppju.value;
		// _galonRate.srvc = controls.srvc.value;

		return _galonRate;
	}



	// currency format
	changeAmount(event) {
		this.toCurrency(undefined, event, "amount", "amountClone");
	}

	toCurrency(
		values: any,
		event: any,
		formName: string,
		rawValueProps: string,
	) {
		// Differenciate function calls (from event or another function)
		let controls = this.galonRateForm.controls;
		let value = event.target.value
		// controls.multiGLAccount.get(`amount${id}`).setValue(formattedNumber);

		var number_string = value.replace(/[^,\d]/g, "").toString(),
			split = number_string.split(","),
			sisa = split[0].length % 3,
			rupiah = split[0].substr(0, sisa),
			ribuan = split[0].substr(sisa).match(/\d{3}/gi);

		// tambahkan titik jika yang di input sudah menjadi value ribuan
		let separator
		if (ribuan) {
			separator = sisa ? "." : "";
			rupiah += separator + ribuan.join(".");
		}

		rupiah = split[1] != undefined ? split[1][1] != undefined ? rupiah + ","
			+ split[1][0] + split[1][1] : split[1] != '' ? rupiah + "," + split[1][0] : rupiah + "," + split[1] : rupiah;


		controls.rate.setValue(rupiah)
		return rupiah
	}


	addGalonRate(_galonRate: GalonRateModel, withBack: boolean = false) {
		const addSubscription = this.service.createGalonRate(_galonRate).subscribe(
			res => {
				const message = `New Galon rate successfully has been added.`;
				this.layoutUtilsService.showActionNotification(message, MessageType.Create, 5000, true, true);
				const url = `/galon-management/galon/rate`;
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
	updateGalonRate(_galonRate: GalonRateModel, withBack: boolean = false) {
		// Update User
		// tslint:disable-next-line:prefer-const
		const editSubscription = this.service.updateGalonRate(_galonRate).subscribe(
			res => {
				const message = `Galon rate successfully has been saved.`;
				this.layoutUtilsService.showActionNotification(message, MessageType.Update, 5000, true, true);
				const url = `/galon-management/galon/rate`;
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
		let result = 'Create Galon Rate';
		if (!this.galonRate || !this.galonRate._id) {
			return result;
		}

		result = `Edit Galon Rate`;
		return result;
	}
	onAlertClose($event) {
		this.hasFormErrors = false;
	}
	ngOnDestroy() {
		this.subscriptions.forEach(sb => sb.unsubscribe());
	}

}
