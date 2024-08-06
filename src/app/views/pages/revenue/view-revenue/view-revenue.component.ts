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
  selector: 'kt-view-revenue',
  templateUrl: './view-revenue.component.html',
  styleUrls: ['./view-revenue.component.scss']
})
export class ViewRevenueComponent implements OnInit, OnDestroy {
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
			} 
		});
		this.subscriptions.push(routeSubscription);
  	}

	initRevenue() {
		this.createForm();
	}

	createForm() {
		this.revenueForm = this.revenueFB.group({
			revenueName: [{value:this.revenue.revenueName, disabled:true}],
			serviceFee: [{value:this.revenue.serviceFee, disabled:true}],
			administration: [{value:this.revenue.administration, disabled:true}],
			remarks: [{value:this.revenue.remarks, disabled:true}],
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


	getComponentTitle() {
		let result = `View Revenue`;
		return result;
	}

	onAlertClose($event) {
		this.hasFormErrors = false;
	}

  	ngOnDestroy() {
		this.subscriptions.forEach(sb => sb.unsubscribe());
	}
	
}
