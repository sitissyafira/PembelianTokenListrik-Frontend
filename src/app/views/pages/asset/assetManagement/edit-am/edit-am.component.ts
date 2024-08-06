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
  selector: 'kt-edit-am',
  templateUrl: './edit-am.component.html',
  styleUrls: ['./edit-am.component.scss']
})

export class EditAmComponent implements OnInit, OnDestroy {
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
	// Private properties
	selection = new SelectionModel<AmModel>(true, []);
	loadingForm: boolean;
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
				assetCode: [this.am.assetCode],
				assetType: [this.am.assetType._id],
				assetName: [this.am.assetName],
				description: [this.am.description],
				qty: [{value:this.am.qty, disabled:false}], //number, true
				location : [this.am.location],
				status : [this.am.status],
				uom: [this.am.uom._id],
				purchasePrice: [this.am.purchasePrice], //number
			});
	}

	loadAssetType(){
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

	onSubmit(withBack: boolean = false) {
		this.hasFormErrors = false;
		const controls = this.amForm.controls;
		/** check form */
		if (this.amForm.invalid) {
			Object.keys(controls).forEach(controlName =>
				controls[controlName].markAsTouched()
			);

			this.hasFormErrors = true;
			this.selectedTab = 0;
			return;
		}
		const editedAm = this.prepareAm();
		this.updateAm(editedAm, withBack);		
	}
	prepareAm(): AmModel {
		const controls = this.amForm.controls;
		const _am = new AmModel();
		_am.clear();
		_am._id = this.am._id;
		_am.assetCode = controls.assetCode.value;
		_am.assetType = controls.assetType.value;
		_am.assetName = controls.assetName.value.toLowerCase();
		_am.description = controls.description.value;
		_am.qty = controls.qty.value;
		_am.status = controls.status.value;
		_am.uom = controls.uom.value;
		_am.location = controls.location.value.toLowerCase();
		_am.purchasePrice = controls.purchasePrice.value;
		return _am;
	}

	updateAm(_am: AmModel, withBack: boolean = false) {
		// Update User
		// tslint:disable-next-line:prefer-const
		const addSubscription = this.service.updateAm(_am).subscribe(
			res => {
				const message = `Asset Management successfully has been saved.`;
				this.layoutUtilsService.showActionNotification(message, MessageType.Update, 5000, true, true);
				const url = `/am`;
				this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
			},
			err => {
				console.error(err);
				const message = 'Error while adding asset management | ' + err.statusText;
				this.layoutUtilsService.showActionNotification(message, MessageType.Update, 5000, true, false);
			}
		);
		this.subscriptions.push(addSubscription);
	}

	getComponentTitle() {
		let result = `Edit Asset Management`;
		return result;
	}

	onAlertClose($event) {
		this.hasFormErrors = false;
	}

  	ngOnDestroy() {
		this.subscriptions.forEach(sb => sb.unsubscribe());
	}
	
}
