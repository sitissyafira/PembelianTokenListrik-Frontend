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
  selector: 'kt-view-rate',
  templateUrl: './view-rate.component.html',
  styleUrls: ['./view-rate.component.scss']
})
export class ViewRateComponent implements OnInit, OnDestroy {
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
			nmrtewtr: [{value:this.waterRate.nmrtewtr, disabled:true}],
			rte: [{value:this.waterRate.rte, disabled:true}],
			pemeliharaan: [{value:this.waterRate.pemeliharaan, disabled:true}],
			administrasi: [{value:this.waterRate.administrasi, disabled:true}],
		});}
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
	
	getComponentTitle() {
		let result = 'View Water Rate';
		return result;
	}
	
	onAlertClose($event) {
		this.hasFormErrors = false;
	}
	ngOnDestroy() {
		this.subscriptions.forEach(sb => sb.unsubscribe());
	}

}
