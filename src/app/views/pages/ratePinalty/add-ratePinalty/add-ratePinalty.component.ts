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
import {RatePinaltyModel} from "../../../../core/ratepinalty/ratePinalty.model";
import {
	selectLastCreatedRatePinaltyId,
	selectRatePinaltyActionLoading,
	selectRatePinaltyById
} from "../../../../core/ratepinalty/ratePinalty.selector";
import {RatePinaltyService} from '../../../../core/ratepinalty/ratePinalty.service';

@Component({
  selector: 'kt-add-ratePinalty',
  templateUrl: './add-ratePinalty.component.html',
  styleUrls: ['./add-ratePinalty.component.scss']
})
export class AddRatePinaltyComponent implements OnInit, OnDestroy {
	// Public properties
	ratePinalty: RatePinaltyModel;
	RatePinaltyId$: Observable<string>;
	oldRatePinalty: RatePinaltyModel;
	selectedTab = 0;
	loading$: Observable<boolean>;
	ratePinaltyForm: FormGroup;
	hasFormErrors = false;
	// Private properties
	private subscriptions: Subscription[] = [];
  	constructor(
		private activatedRoute: ActivatedRoute,
		private router: Router,
		private ratePinaltyFB: FormBuilder,
		private subheaderService: SubheaderService,
		private layoutUtilsService: LayoutUtilsService,
		private store: Store<AppState>,
		private service: RatePinaltyService,
		private layoutConfigService: LayoutConfigService
	) { }

  	ngOnInit() {
		this.loading$ = this.store.pipe(select(selectRatePinaltyActionLoading));
		const routeSubscription =  this.activatedRoute.params.subscribe(params => {
			const id = params.id;
			if (id) {
				this.store.pipe(select(selectRatePinaltyById(id))).subscribe(res => {
					if (res) {
						this.ratePinalty = res;
						this.oldRatePinalty = Object.assign({}, this.ratePinalty);
						this.initRatePinalty();
					}
				});
			} else {
				this.ratePinalty = new RatePinaltyModel();
				this.ratePinalty.clear();
				this.initRatePinalty();
			}
		});
		this.subscriptions.push(routeSubscription);
  	}

	initRatePinalty() {
		this.createForm();
	}

	createForm() {
		this.ratePinaltyForm = this.ratePinaltyFB.group({
			rateName: [this.ratePinalty.rateName, Validators.required],
			rate: [this.ratePinalty.rate, Validators.required],
			periode: [this.ratePinalty.periode, Validators.required],
			remarks: [this.ratePinalty.remarks, Validators.required],
		});
	}

	goBackWithId() {
		const url = `/ratePinalty`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}

	refreshRatePinalty(isNew: boolean = false, id:string = "") {
		let url = this.router.url;
		if (!isNew) {
			this.router.navigate([url], { relativeTo: this.activatedRoute });
			return;
		}

		url = `/ratePinalty/edit/${id}`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}

	reset() {
		this.ratePinalty = Object.assign({}, this.oldRatePinalty);
		this.createForm();
		this.hasFormErrors = false;
		this.ratePinaltyForm.markAsPristine();
		this.ratePinaltyForm.markAsUntouched();
		this.ratePinaltyForm.updateValueAndValidity();
	}

	onSubmit(withBack: boolean = false) {
		this.hasFormErrors = false;
		const controls = this.ratePinaltyForm.controls;
		/** check form */
		if (this.ratePinaltyForm.invalid) {
			Object.keys(controls).forEach(controlName =>
				controls[controlName].markAsTouched()
			);

			this.hasFormErrors = true;
			this.selectedTab = 0;
			return;
		}

		const editedRatePinalty = this.prepareRatePinalty();

		if (editedRatePinalty._id) {
			this.updateRatePinalty(editedRatePinalty, withBack);
			return;
		}

		this.addRatePinalty(editedRatePinalty, withBack);
	}
	prepareRatePinalty(): RatePinaltyModel {
		const controls = this.ratePinaltyForm.controls;
		const _ratePinalty = new RatePinaltyModel();
		_ratePinalty.clear();
		_ratePinalty._id = this.ratePinalty._id;
		_ratePinalty.rateName = controls.rateName.value.toLowerCase();
		_ratePinalty.rate = controls.rate.value.toLowerCase();
		_ratePinalty.periode = controls.periode.value.toLowerCase();
		_ratePinalty.remarks = controls.remarks.value.toLowerCase();
		return _ratePinalty;
	}

	addRatePinalty( _ratePinalty: RatePinaltyModel, withBack: boolean = false) {
		const addSubscription = this.service.createRatePinalty(_ratePinalty).subscribe(
			res => {
				const message = `New pinalty rate successfully has been added.`;
				this.layoutUtilsService.showActionNotification(message, MessageType.Create, 5000, true, true);
				const url = `/ratePinalty`;
				this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
			},
			err => {
				console.error(err);
				const message = 'Error while adding pinalty rate | ' + err.statusText;
				this.layoutUtilsService.showActionNotification(message, MessageType.Create, 5000, true, false);
			}
		);
		this.subscriptions.push(addSubscription);
	}

	updateRatePinalty(_ratePinalty: RatePinaltyModel, withBack: boolean = false) {
		// Update User
		// tslint:disable-next-line:prefer-const
		const addSubscription = this.service.updateRatePinalty(_ratePinalty).subscribe(
			res => {
				const message = `Pinalty rate successfully has been saved.`;
				this.layoutUtilsService.showActionNotification(message, MessageType.Update, 5000, true, true);
				const url = `/ratePinalty`;
				this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
			},
			err => {
				console.error(err);
				const message = 'Error while adding pinalty rate | ' + err.statusText;
				this.layoutUtilsService.showActionNotification(message, MessageType.Update, 5000, true, false);
			}
		);
		this.subscriptions.push(addSubscription);
	}

	getComponentTitle() {
		let result = 'Create Pinalty Rate';
		if (!this.ratePinalty || !this.ratePinalty._id) {
			return result;
		}

		result = `Edit Pinalty Rate`;
		return result;
	}

	onAlertClose($event) {
		this.hasFormErrors = false;
	}

  	ngOnDestroy() {
		this.subscriptions.forEach(sb => sb.unsubscribe());
	}
	
}
