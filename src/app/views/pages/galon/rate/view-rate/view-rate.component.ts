// Angular
import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
// RxJS
import { BehaviorSubject, Observable, of, Subscription } from 'rxjs';
// NGRX
import { Store, select } from '@ngrx/store';
import { AppState } from '../../../../../core/reducers';
// Layout
import { SubheaderService, LayoutConfigService } from '../../../../../core/_base/layout';
import { LayoutUtilsService } from '../../../../../core/_base/crud';
import { GalonRateModel } from "../../../../../core/galon/rate/rate.model";
import {
	selectLastCreatedGalonRateId,
	selectGalonRateActionLoading,
	selectGalonRateById
} from "../../../../../core/galon/rate/rate.selector";
import { GalonRateService } from '../../../../../core/galon';
import { ServiceFormat } from '../../../../../core/serviceFormat/format.service';

@Component({
	selector: 'kt-view-rate',
	templateUrl: './view-rate.component.html',
	styleUrls: ['./view-rate.component.scss']
})
export class ViewRateComponent implements OnInit, OnDestroy {
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
				brand: [{ value: this.galonRate.brand, disabled: true }],
				rate: [{ value: this.serviceFormat.rupiahFormatImprovement(this.galonRate.rate ? this.galonRate.rate : 0), disabled: true }],
				// ppju: [{ value: this.galonRate.ppju, disabled: true }],
				// srvc: [{ value: this.galonRate.srvc, disabled: true }],
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

	getComponentTitle() {
		let result = `View Galon Rate`;
		return result;
	}
	onAlertClose($event) {
		this.hasFormErrors = false;
	}
	ngOnDestroy() {
		this.subscriptions.forEach(sb => sb.unsubscribe());
	}

}
