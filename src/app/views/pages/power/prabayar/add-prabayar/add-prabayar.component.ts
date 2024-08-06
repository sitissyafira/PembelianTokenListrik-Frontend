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
import { PowerPrabayarModel } from "../../../../../core/power/prabayar/prabayar.model";
import {
	selectLastCreatedPowerPrabayarId,
	selectPowerPrabayarActionLoading,
	selectPowerPrabayarById
} from "../../../../../core/power/prabayar/prabayar.selector";
import { PowerPrabayarOnServerCreated, PowerPrabayarUpdated } from "../../../../../core/power/prabayar/prabayar.action";
import { PowerPrabayarService } from '../../../../../core/power';

@Component({
	selector: 'kt-add-prabayar',
	templateUrl: './add-prabayar.component.html',
	styleUrls: ['./add-prabayar.component.scss']
})
export class AddPrabayarComponent implements OnInit, OnDestroy {
	// Public properties
	powerPrabayar: PowerPrabayarModel;
	powerPrabayarId$: Observable<string>;
	oldPowerPrabayar: PowerPrabayarModel;
	selectedTab = 0;
	loading$: Observable<boolean>;
	powerPrabayarForm: FormGroup;
	hasFormErrors = false;
	loading: boolean = false

	// Private properties
	private subscriptions: Subscription[] = [];
	constructor(
		private activatedRoute: ActivatedRoute,
		private router: Router,
		private powerPrabayarFB: FormBuilder,
		private subheaderService: SubheaderService,
		private layoutUtilsService: LayoutUtilsService,
		private store: Store<AppState>,
		private layoutConfigService: LayoutConfigService,
		private service: PowerPrabayarService
	) { }
	ngOnInit() {
		this.loading$ = this.store.pipe(select(selectPowerPrabayarActionLoading));
		const routeSubscription = this.activatedRoute.params.subscribe(params => {
			const id = params.id;
			if (id) {
				this.store.pipe(select(selectPowerPrabayarById(id))).subscribe(res => {
					if (res) {
						this.powerPrabayar = res;
						this.oldPowerPrabayar = Object.assign({}, this.powerPrabayar);
						this.initPowerPrabayar();
					}
				});
			} else {
				this.powerPrabayar = new PowerPrabayarModel();
				this.powerPrabayar.clear();
				this.initPowerPrabayar();
			}
		});
		this.subscriptions.push(routeSubscription);
	}
	initPowerPrabayar() {
		this.createForm();
	}

	createForm() {
		if (this.powerPrabayar._id) {
			this.powerPrabayarForm = this.powerPrabayarFB.group({
				name: [this.powerPrabayar.name, Validators.required],
				rate: [this.powerPrabayar.rate, Validators.required],
				adminRate: [this.powerPrabayar.adminRate, Validators.required],
				status: [this.powerPrabayar.status, Validators.required],
			});
		} else {
			this.powerPrabayarForm = this.powerPrabayarFB.group({
				name: ["", Validators.required],
				rate: ["", Validators.required],
				adminRate: ["", Validators.required],
				status: ["", Validators.required],
			});
		}
	}
	goBackWithId() {
		const url = `/power-management/power/prabayar`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}
	refreshPowerPrabayar(isNew: boolean = false, id: string = "") {
		let url = this.router.url;
		if (!isNew) {
			this.router.navigate([url], { relativeTo: this.activatedRoute });
			return;
		}

		url = `/power-management/power/prabayar/edit/${id}`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}

	onSubmit(withBack: boolean = false) {
		this.hasFormErrors = false;
		const controls = this.powerPrabayarForm.controls;
		/** check form */
		if (this.powerPrabayarForm.invalid) {
			Object.keys(controls).forEach(controlName =>
				controls[controlName].markAsTouched()
			);

			this.hasFormErrors = true;
			this.selectedTab = 0;
			return;
		}

		this.loading = true;
		const editedPowerPrabayar = this.preparePowerPrabayar();
		if (editedPowerPrabayar._id) {
			this.updatePowerPrabayar(editedPowerPrabayar, withBack);
			return;
		}
		console.log(editedPowerPrabayar);

		this.addPowerPrabayar(editedPowerPrabayar, withBack);
	}
	preparePowerPrabayar(): PowerPrabayarModel {
		const controls = this.powerPrabayarForm.controls;
		const _powerPrabayar = new PowerPrabayarModel();
		_powerPrabayar.clear();
		_powerPrabayar._id = this.powerPrabayar._id;
		_powerPrabayar.name = controls.name.value.toLowerCase();
		_powerPrabayar.rate = controls.rate.value;
		_powerPrabayar.adminRate = controls.adminRate.value;
		_powerPrabayar.status = controls.status.value;

		return _powerPrabayar;
	}
	addPowerPrabayar(_powerPrabayar: PowerPrabayarModel, withBack: boolean = false) {
		const addSubscription = this.service.createPowerPrabayar(_powerPrabayar).subscribe(
			res => {
				const message = `New Electricity prabayar successfully has been added.`;
				this.layoutUtilsService.showActionNotification(message, MessageType.Create, 5000, true, true);
				const url = `/power-management/power/rt-prabayar`;
				this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
			},
			err => {
				console.error(err);
				const message = 'Error while adding electricity prabayar | ' + err.statusText;
				this.layoutUtilsService.showActionNotification(message, MessageType.Create, 5000, true, false);
			}
		);
		this.subscriptions.push(addSubscription);
	}
	updatePowerPrabayar(_powerPrabayar: PowerPrabayarModel, withBack: boolean = false) {
		// Update User
		// tslint:disable-next-line:prefer-const
		const editSubscription = this.service.updatePowerPrabayar(_powerPrabayar).subscribe(
			res => {
				const message = `Electricity prabayar successfully has been saved.`;
				this.layoutUtilsService.showActionNotification(message, MessageType.Update, 5000, true, true);
				const url = `/power-management/power/rt-prabayar`;
				this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
			},
			err => {
				console.error(err);
				const message = 'Error while saving electricity prabayar | ' + err.statusText;
				this.layoutUtilsService.showActionNotification(message, MessageType.Update, 5000, true, false);
			}
		);
		this.subscriptions.push(editSubscription);
	}
	getComponentTitle() {
		let result = 'Create Electricity Prabayar';
		if (!this.powerPrabayar || !this.powerPrabayar._id) {
			return result;
		}

		result = `Edit Electricity Prabayar`;
		return result;
	}
	onAlertClose($event) {
		this.hasFormErrors = false;
	}
	ngOnDestroy() {
		this.subscriptions.forEach(sb => sb.unsubscribe());
	}

}
