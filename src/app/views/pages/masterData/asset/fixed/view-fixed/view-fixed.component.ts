import {Component, OnDestroy, OnInit} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
// RxJS
import { BehaviorSubject, Observable, of, Subscription } from 'rxjs';
// NGRX
import { Store, select } from '@ngrx/store';
import { Update } from '@ngrx/entity';
import { AppState } from '../../../../../../core/reducers';
// Layout
import { SubheaderService, LayoutConfigService } from '../../../../../../core/_base/layout';
import { LayoutUtilsService, MessageType } from '../../../../../../core/_base/crud';
import {FixedModel} from "../../../../../../core/masterData/asset/fixed/fixed.model";
import {
	selectLastCreatedFixedId,
	selectFixedActionLoading,
	selectFixedById
} from "../../../../../../core/masterData/asset/fixed/fixed.selector";
import {FixedService} from '../../../../../../core/masterData/asset/fixed/fixed.service';
import { SelectionModel } from '@angular/cdk/collections';
import { QueryFiscalModel } from '../../../../../../core/masterData/asset/fiscal/queryfiscal.model';
import { FiscalService } from '../../../../../../core/masterData/asset/fiscal/fiscal.service';

@Component({
  selector: 'kt-view-fixed',
  templateUrl: './view-fixed.component.html',
  styleUrls: ['./view-fixed.component.scss']
})
export class ViewFixedComponent implements OnInit, OnDestroy {
	// Public properties
	fixed: FixedModel;
	FixedId$: Observable<string>;
	oldFixed: FixedModel;
	selectedTab = 0;
	loading$: Observable<boolean>;
	selection = new SelectionModel<FixedModel>(true, []);
	fixedForm: FormGroup;
	hasFormErrors = false;
	fResult: any[] = [];
	loadingForm: boolean
	loading : boolean = false
	// Private properties
	private subscriptions: Subscription[] = [];
  	constructor(
		private activatedRoute: ActivatedRoute,
		private router: Router,
		private fixedFB: FormBuilder,
		private subheaderService: SubheaderService,
		private layoutUtilsService: LayoutUtilsService,
		private store: Store<AppState>,
		private service: FixedService,
		private fservice: FiscalService,
		private layoutConfigService: LayoutConfigService
	) { }

  	ngOnInit() {
		this.loading$ = this.store.pipe(select(selectFixedActionLoading));
		const routeSubscription =  this.activatedRoute.params.subscribe(params => {
			const id = params.id;
			if (id) {
				this.store.pipe(select(selectFixedById(id))).subscribe(res => {
					if (res) {
						this.loadingForm = true
						this.fixed = res;
						this.oldFixed = Object.assign({}, this.fixed);
						this.initFixed();
					}
				});
			}
		});
		this.subscriptions.push(routeSubscription);
  	}

	initFixed() {
		this.createForm();
		this.loadFiscalAsset();
	}

	createForm() {
		if(this.fixed._id){
		this.fixedForm = this.fixedFB.group({
			fixedAssetTypeName : [{value:this.fixed.fixedAssetTypeName, disabled:true}],
			fiscalFixedType : [{value:this.fixed.fiscalFixedType._id, disabled:true}],
			});
		}	
	}

	async loadFiscalAsset(){
		this.selection.clear();
		const queryParams = new QueryFiscalModel(
			null,
			"asc",
			null,
			1,
			1000
		);
		this.fservice.getListFiscal(queryParams).subscribe(
			res => {
				this.fResult = res.data;
				
				this.loadingForm = false
				document.body.style.height = "101%"
				window.scrollTo(0, 1);
				document.body.style.height = ""
			}
		);
	}

	goBackWithId() {
		const url = `/fixed`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}

	refreshFixed(isNew: boolean = false, id:string = "") {
		let url = this.router.url;
		if (!isNew) {
			this.router.navigate([url], { relativeTo: this.activatedRoute });
			return;
		}

		url = `/fixed/edit/${id}`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}

	
	getComponentTitle() {
		let result = `View Fixed Asset`;
		return result;
	}

	onAlertClose($event) {
		this.hasFormErrors = false;
	}

  	ngOnDestroy() {
		this.subscriptions.forEach(sb => sb.unsubscribe());
	}
	
}
