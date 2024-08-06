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
import {RevenueModel} from "../../../../core/revenue/revenue.model";
import {
	selectLastCreatedRevenueId,
	selectRevenueActionLoading,
	selectRevenueById
} from "../../../../core/revenue/revenue.selector";
import {RevenueService} from '../../../../core/revenue/revenue.service';

@Component({
  selector: 'kt-add-revenue',
  templateUrl: './add-revenue.component.html',
  styleUrls: ['./add-revenue.component.scss']
})
export class AddRevenueComponent implements OnInit, OnDestroy {
	// Public properties
	revenue: RevenueModel;
	RevenueId$: Observable<string>;
	oldRevenue: RevenueModel;
	selectedTab = 0;
	loading$: Observable<boolean>;
	revenueForm: FormGroup;
	hasFormErrors = false;
	
	loading : boolean = false
	// Private properties
	private subscriptions: Subscription[] = [];
  	constructor(
		private activatedRoute: ActivatedRoute,
		private router: Router,
		private revenueFB: FormBuilder,
		private subheaderService: SubheaderService,
		private layoutUtilsService: LayoutUtilsService,
		private store: Store<AppState>,
		private service: RevenueService,
		private layoutConfigService: LayoutConfigService
	) { }

  	ngOnInit() {
		this.loading$ = this.store.pipe(select(selectRevenueActionLoading));
		const routeSubscription =  this.activatedRoute.params.subscribe(params => {
			const id = params.id;
			if (id) {
				this.store.pipe(select(selectRevenueById(id))).subscribe(res => {
					if (res) {
						this.revenue = res;
						this.oldRevenue = Object.assign({}, this.revenue);
						this.initRevenue();
					}
				});
			} else {
				this.revenue = new RevenueModel();
				this.revenue.clear();
				this.initRevenue();
			}
		});
		this.subscriptions.push(routeSubscription);
  	}

	initRevenue() {
		this.createForm();
	}

	createForm() {
		this.revenueForm = this.revenueFB.group({
			revenueName: [this.revenue.revenueName, Validators.required],
			serviceFee: [this.revenue.serviceFee, Validators.required],
			administration: [this.revenue.administration, Validators.required],
			remarks: [this.revenue.remarks],
		});
	}

	goBackWithId() {
		const url = `/revenue`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}

	refreshRevenue(isNew: boolean = false, id:string = "") {
		let url = this.router.url;
		if (!isNew) {
			this.router.navigate([url], { relativeTo: this.activatedRoute });
			return;
		}

		url = `/revenue/edit/${id}`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}

	onSubmit(withBack: boolean = false) {
		this.hasFormErrors = false;
		const controls = this.revenueForm.controls;
		/** check form */
		if (this.revenueForm.invalid) {
			Object.keys(controls).forEach(controlName =>
				controls[controlName].markAsTouched()
			);

			this.hasFormErrors = true;
			this.selectedTab = 0;
			return;
		}

		this.loading = true
		const editedRevenue = this.prepareRevenue();

		if (editedRevenue._id) {
			this.updateRevenue(editedRevenue, withBack);
			return;
		}

		this.addRevenue(editedRevenue, withBack);
	}
	prepareRevenue(): RevenueModel {
		const controls = this.revenueForm.controls;
		const _revenue = new RevenueModel();
		_revenue.clear();
		_revenue._id = this.revenue._id;
		_revenue.revenueName = controls.revenueName.value.toLowerCase();
		_revenue.serviceFee = controls.serviceFee.value;
		_revenue.administration = controls.administration.value;
		_revenue.remarks = controls.remarks.value;
		return _revenue;
	}

	addRevenue( _revenue: RevenueModel, withBack: boolean = false) {
		const addSubscription = this.service.createRevenue(_revenue).subscribe(
			res => {
				const message = `New Revenue successfully has been added.`;
				this.layoutUtilsService.showActionNotification(message, MessageType.Create, 5000, true, true);
				const url = `/revenue`;
				this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
			},
			err => {
				console.error(err);
				const message = 'Error while adding Revenue | ' + err.statusText;
				this.layoutUtilsService.showActionNotification(message, MessageType.Create, 5000, true, false);
			}
		);
		this.subscriptions.push(addSubscription);
	}

	updateRevenue(_revenue: RevenueModel, withBack: boolean = false) {
		// Update User
		// tslint:disable-next-line:prefer-const
		const addSubscription = this.service.updateRevenue(_revenue).subscribe(
			res => {
				const message = `Revenue successfully has been saved.`;
				this.layoutUtilsService.showActionNotification(message, MessageType.Update, 5000, true, true);
				const url = `/revenue`;
				this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
			},
			err => {
				console.error(err);
				const message = 'Error while adding Revenue | ' + err.statusText;
				this.layoutUtilsService.showActionNotification(message, MessageType.Update, 5000, true, false);
			}
		);
		this.subscriptions.push(addSubscription);
	}

	getComponentTitle() {
		let result = 'Create Revenue';
		if (!this.revenue || !this.revenue._id) {
			return result;
		}

		result = `Edit Revenue`;
		return result;
	}

	onAlertClose($event) {
		this.hasFormErrors = false;
	}

  	ngOnDestroy() {
		this.subscriptions.forEach(sb => sb.unsubscribe());
	}
	
}
