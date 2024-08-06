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
import {GasRateModel} from "../../../../../core/gas/rate/rate.model";
import {
	selectLastCreatedGasRateId,
	selectGasRateActionLoading,
	selectGasRateById
} from "../../../../../core/gas/rate/rate.selector";
import {GasRateOnServerCreated, GasRateUpdated} from "../../../../../core/gas/rate/rate.action";
import {GasRateService} from '../../../../../core/gas/rate/rate.service';

@Component({
  selector: 'kt-add-rate',
  templateUrl: './add-rate.component.html',
  styleUrls: ['./add-rate.component.scss']
})
export class AddRateComponent implements OnInit, OnDestroy {
	// Public properties
	gasRate: GasRateModel;
	gasRateId$: Observable<string>;
	oldGasRate: GasRateModel;
	selectedTab = 0;
	loading$: Observable<boolean>;
	gasRateForm: FormGroup;
	hasFormErrors = false;
	// Private properties
	private subscriptions: Subscription[] = [];
	constructor(
		private activatedRoute: ActivatedRoute,
		private router: Router,
		private gasRateFB: FormBuilder,
		private subheaderService: SubheaderService,
		private layoutUtilsService: LayoutUtilsService,
		private store: Store<AppState>,
		private layoutConfigService: LayoutConfigService,
		private service: GasRateService
	) { }
	ngOnInit() {
		this.loading$ = this.store.pipe(select(selectGasRateActionLoading));
		const routeSubscription =  this.activatedRoute.params.subscribe(params => {
			const id = params.id;
			if (id) {
				this.store.pipe(select(selectGasRateById(id))).subscribe(res => {
					if (res) {
						this.gasRate = res;
						this.oldGasRate = Object.assign({}, this.gasRate);
						this.initGasRate();
					}
				});
			} else {
				this.gasRate = new GasRateModel();
				this.gasRate.clear();
				this.initGasRate();
			}
		});
		this.subscriptions.push(routeSubscription);
	}
	initGasRate() {
		this.createForm();
		// if (!this.gasRate._id) {
		// 	this.subheaderService.setTitle('Create gas rate');
		// 	this.subheaderService.setBreadcrumbs([
		// 		{ title: 'Gas Rate', page: `gas-management/gas/rate` },
		// 		{ title: 'Create Gas Rate', page: `gas-management/gas/rate/add` }
		// 	]);
		// 	return;
		// }
		// this.subheaderService.setTitle('Edit gas rate');
		// this.subheaderService.setBreadcrumbs([
		// 	{ title: 'Gas Rate', page: `gas-management/gas/rate` },
		// 	{ title: 'Edit Gas Rate', page: `gas-management/gas/rate/edit`, queryParams: { id: this.gasRate._id } }
		// ]);
	}
	createForm() {
		this.gasRateForm = this.gasRateFB.group({
			nmrtegas: [this.gasRate.nmrtegas, Validators.required],
			rte: [this.gasRate.rte, Validators.required],
			administrasi: [this.gasRate.administrasi, Validators.required],
			maintenance: [this.gasRate.maintenance, Validators.required],
		});
	}
	goBackWithId() {
		const url = `/gas-management/gas/rate`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}
	refreshGasRate(isNew: boolean = false, id:string = "") {
		let url = this.router.url;
		if (!isNew) {
			this.router.navigate([url], { relativeTo: this.activatedRoute });
			return;
		}

		url = `/gas-management/gas/rate/edit/${id}`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}
	reset() {
		this.gasRate = Object.assign({}, this.oldGasRate);
		this.createForm();
		this.hasFormErrors = false;
		this.gasRateForm.markAsPristine();
		this.gasRateForm.markAsUntouched();
		this.gasRateForm.updateValueAndValidity();
	}
	onSubmit(withBack: boolean = false) {
		this.hasFormErrors = false;
		const controls = this.gasRateForm.controls;
		/** check form */
		if (this.gasRateForm.invalid) {
			Object.keys(controls).forEach(controlName =>
				controls[controlName].markAsTouched()
			);

			this.hasFormErrors = true;
			this.selectedTab = 0;
			return;
		}

		const editedGasRate = this.prepareGasRate();

		if (editedGasRate._id) {
			this.updateGasRate(editedGasRate, withBack);
			return;
		}

		this.addGasRate(editedGasRate, withBack);
	}
	prepareGasRate(): GasRateModel {
		const controls = this.gasRateForm.controls;
		const _gasRate = new GasRateModel();
		_gasRate.clear();
		_gasRate._id = this.gasRate._id;
		_gasRate.nmrtegas = controls.nmrtegas.value.toLowerCase();
		_gasRate.rte = controls.rte.value;
		_gasRate.administrasi = controls.administrasi.value;
		_gasRate.maintenance = controls.maintenance.value;
		return _gasRate;
	}
	addGasRate( _gasRate: GasRateModel, withBack: boolean = false) {
		const addSubscription = this.service.createGasRate(_gasRate).subscribe(
			res => {
				const message = `New gas rate successfully has been added.`;
				this.layoutUtilsService.showActionNotification(message, MessageType.Create, 5000, true, true);
				const url = `/gas-management/gas/rate`;
				this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
			},
			err => {
				console.error(err);
				const message = 'Error while adding gas rate | ' + err.statusText;
				this.layoutUtilsService.showActionNotification(message, MessageType.Create, 5000, true, false);
			}
		);
		this.subscriptions.push(addSubscription);
	}
	updateGasRate(_gasRate: GasRateModel, withBack: boolean = false) {
		// Update User
		// tslint:disable-next-line:prefer-const
		const addSubscription = this.service.updateGasRate(_gasRate).subscribe(
			res => {
				const message = `Gas rate successfully has been saved.`;
				this.layoutUtilsService.showActionNotification(message, MessageType.Update, 5000, true, true);
				const url = `/gas-management/gas/rate`;
				this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
			},
			err => {
				console.error(err);
				const message = 'Error while saving gas rate | ' + err.statusText;
				this.layoutUtilsService.showActionNotification(message, MessageType.Create, 5000, true, false);
			}
		);
		this.subscriptions.push(addSubscription);
	}
	getComponentTitle() {
		let result = 'Create Gas Rate';
		if (!this.gasRate || !this.gasRate._id) {
			return result;
		}

		result = `Edit Gas Rate `;
		return result;
	}
	onAlertClose($event) {
		this.hasFormErrors = false;
	}
	ngOnDestroy() {
		this.subscriptions.forEach(sb => sb.unsubscribe());
	}

}
