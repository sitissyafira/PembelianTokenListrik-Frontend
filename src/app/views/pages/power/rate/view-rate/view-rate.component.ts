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
import {PowerRateModel} from "../../../../../core/power/rate/rate.model";
import {
	selectLastCreatedPowerRateId,
	selectPowerRateActionLoading,
	selectPowerRateById
} from "../../../../../core/power/rate/rate.selector";
import {PowerRateService} from '../../../../../core/power';

@Component({
  selector: 'kt-view-rate',
  templateUrl: './view-rate.component.html',
  styleUrls: ['./view-rate.component.scss']
})
export class ViewRateComponent implements OnInit, OnDestroy {
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
				nmrtepow: [{value:this.powerRate.nmrtepow, disabled:true}],
				rte: [{value:this.powerRate.rte, disabled:true}],
				ppju: [{value:this.powerRate.ppju, disabled:true}],
				srvc: [{value:this.powerRate.srvc, disabled:true}],
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
	
	getComponentTitle() {
		let result = `View Electricity Rate`;
		return result;
	}
	onAlertClose($event) {
		this.hasFormErrors = false;
	}
	ngOnDestroy() {
		this.subscriptions.forEach(sb => sb.unsubscribe());
	}

}
