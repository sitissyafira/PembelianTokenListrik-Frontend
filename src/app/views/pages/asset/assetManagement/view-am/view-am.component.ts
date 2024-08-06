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

import {
	selectLastCreatedAmId,
	selectAmActionLoading,
	selectAmById
} from "../../../../../core/asset/assetManagement/am.selector";
import { AmModel } from '../../../../../core/asset/assetManagement/am.model';
import { AmService } from '../../../../../core/asset/assetManagement/am.service';
import { SelectionModel } from '@angular/cdk/collections';
import { FixedService } from '../../../../../core/masterData/asset/fixed/fixed.service';
import { QueryFixedModel } from '../../../../../core/masterData/asset/fixed/queryfixed.model';
import { UomService } from '../../../../../core/masterData/asset/uom/uom.service';
import { QueryUomModel } from '../../../../../core/masterData/asset/uom/queryuom.model';

@Component({
  selector: 'kt-view-am',
  templateUrl: './view-am.component.html',
  styleUrls: ['./view-am.component.scss']
})

export class ViewAmComponent implements OnInit, OnDestroy {
	// Public properties
	am: AmModel;
	AmId$: Observable<string>;
	oldAm: AmModel;
	selectedTab = 0;
	loading$: Observable<boolean>;
	amForm: FormGroup;
	hasFormErrors = false;
	rentalResult: any [] = [];	
	uomResult: any [] = [];
	loadingForm: boolean;
	// Private properties
	selection = new SelectionModel<AmModel>(true, []);
	// Private properties
	private subscriptions: Subscription[] = [];
  	constructor(
		private activatedRoute: ActivatedRoute,
		private router: Router,
		private amFB: FormBuilder,
		private subheaderService: SubheaderService,
		private layoutUtilsService: LayoutUtilsService,
		private store: Store<AppState>,
		private service: AmService,
		private fixed: FixedService,
		private uomService : UomService,
		private layoutConfigService: LayoutConfigService
	) { }

  	ngOnInit() {
		this.loadingForm = true;
		this.loading$ = this.store.pipe(select(selectAmActionLoading));
		const routeSubscription =  this.activatedRoute.params.subscribe(params => {
			const id = params.id;
			if (id) {
				this.store.pipe(select(selectAmById(id))).subscribe(res => {
					if (res) {
						this.am = res;
						this.oldAm = Object.assign({}, this.am);
						this.initAm();
					}
				});
			}
		});
		this.subscriptions.push(routeSubscription);
  	}

	initAm() {
		this.createForm();
		this.loadAssetType();
		this.loadUom();
	}

	createForm(){
			this.amForm = this.amFB.group({
				assetCode: [{value:this.am.assetCode, disabled:true}],
				assetType: [{value:this.am.assetType._id, disabled:true}],
				assetName: [{value:this.am.assetName, disabled:true}],
				description: [{value:this.am.description, disabled:true}],
				qty: [{value:this.am.qty, disabled:true}], //number, true
				location : [{value:this.am.location, disabled:true}],
				status : [{value:this.am.status, disabled:true}],
				uom: [{value:this.am.uom._id, disabled:true}],
				purchasePrice: [{value:this.am.purchasePrice, disabled:true}], //number
			});
	}

	async loadAssetType(){
		this.selection.clear();
		const queryParams = new QueryFixedModel(
			null,
			"asc",
			null,
			1,
			1000
		);
		
		this.fixed.getListFixed(queryParams).subscribe(
			res => {
				this.rentalResult = res.data;
				this.loadingForm = false;
				
				document.body.style.height = ""
				document.body.style.height = "101%"
				window.scrollTo(0, 1);
			}
		);
	}

	loadUom(){
		this.selection.clear();
		const queryParams = new QueryUomModel(
			null,
			"asc",
			null,
			1,
			1000
		);
		this.uomService.getListUom(queryParams).subscribe(
			res => {
				this.uomResult = res.data;
			}
		);
	}

	
	goBackWithId() {
		const url = `/am`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}

	refreshAm(isNew: boolean = false, id:string = "") {
		let url = this.router.url;
		if (!isNew) {
			this.router.navigate([url], { relativeTo: this.activatedRoute });
			return;
		}

		url = `/am/edit/${id}`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}

	getComponentTitle() {
		let result = `View Asset Management`;
		return result;
	}

	onAlertClose($event) {
		this.hasFormErrors = false;
	}

  	ngOnDestroy() {
		this.subscriptions.forEach(sb => sb.unsubscribe());
	}
	
}
