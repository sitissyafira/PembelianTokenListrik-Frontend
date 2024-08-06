import {Component, OnDestroy, OnInit} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {  Observable, of, Subscription } from 'rxjs';
import { Store, select } from '@ngrx/store';
import { AppState } from '../../../../../core/reducers';
import { SubheaderService, LayoutConfigService } from '../../../../../core/_base/layout';
import { LayoutUtilsService, MessageType, QueryParamsModel } from '../../../../../core/_base/crud';
import {
	selectAdActionLoading,
	selectAdById
} from "../../../../../core/asset/assetDepreciation/ad.selector";

import { AdModel } from '../../../../../core/asset/assetDepreciation/ad.model';
import { AdService } from '../../../../../core/asset/assetDepreciation/ad.service';
import { SelectionModel } from '@angular/cdk/collections';
import { AmService } from '../../../../../core/asset/assetManagement/am.service';
import { QueryAmModel } from '../../../../../core/asset/assetManagement/queryam.model';
import { AccountGroupService } from '../../../../../core/accountGroup/accountGroup.service';
import { AccountTypeService } from '../../../../../core/accountType/accountType.service';

@Component({
  selector: 'kt-edit-ad',
  templateUrl: './edit-ad.component.html',
  styleUrls: ['./edit-ad.component.scss']
})
export class EditAdComponent implements OnInit, OnDestroy {
	// Public properties
	ad: AdModel;
	AdId$: Observable<string>;
	oldAd: AdModel;
	selectedTab = 0;
	loading$: Observable<boolean>;
	adForm: FormGroup;
	hasFormErrors = false;
	amResult: any [] = [];
	acResult: any [] = [];
	adaResult: any [] = [];
	exResult : any [] = [];
	deaResult: any [] = [];	// Private properties
	selection = new SelectionModel<AdModel>(true, []);
	hiddendata : boolean = true
	isIA: boolean = false;
	// Private properties
	private subscriptions: Subscription[] = [];
  	constructor(
		private activatedRoute: ActivatedRoute,
		private router: Router,
		private adFB: FormBuilder,
		private subheaderService: SubheaderService,
		private layoutUtilsService: LayoutUtilsService,
		private store: Store<AppState>,
		private service: AdService,
		private amService : AmService,
		private acService : AccountGroupService,
		private AcctypeService : AccountTypeService,
		private layoutConfigService: LayoutConfigService
	) { }

  	ngOnInit() {
		this.loading$ = this.store.pipe(select(selectAdActionLoading));
		const routeSubscription =  this.activatedRoute.params.subscribe(parads => {
			const id = parads.id;
			if (id) {
				this.store.pipe(select(selectAdById(id))).subscribe(res => {
					if (res) {
						this.ad = res;
						this.oldAd = Object.assign({}, this.ad);
						this.initAd();
					}
				});
				
			}
		});
		this.subscriptions.push(routeSubscription);
  	}

	initAd() {
		this.createForm();
		this.loadAssetManagement();
		this.loadAda();
		this.loadAc();
		// this.loadDea();
		this.loadEx();
		this.perhitungan();
		
	}

	createForm() {
				this.adForm = this.adFB.group({
				assetManagement: [this.ad.assetManagement._id], //model
				aquicitionDate: [this.ad.aquicitionDate], //string
				accumulatedDepAcct: [this.ad.accumulatedDepAcct._id], //model
				assetAccount: [this.ad.assetAccount._id], //model
				// depreciationExpAcct: [this.ad.depreciationExpAcct._id], //mode
				expenditures : [this.ad.expenditures._id],
				depMethod : [this.ad.depMethod],
				life : [this.ad.life],
				assetName : [this.ad.assetName],
				depRate : [{value:this.ad.depRate, disabled:true}],
				intangibleAsset: [this.ad.intangibleAsset], //boolean
				fiscalFixedAsset: [this.ad.fiscalFixedAsset], //boolean
				remarks: [this.ad.remarks], //string
				codeAsset : [{value:this.ad.assetManagement.assetCode, disabled:true}],
				price : [{value:this.ad.assetManagement.purchasePrice, disabled:true}],
			});
	}

	perhitungan(){
		const value = this.adForm.controls.life.value;
		const type = this.adForm.controls.depMethod.value;

		if (type == "Straight Line Method" && value != 0){
			this.adForm.controls.depRate.setValue(
				((100 / value)).toPrecision(4)
			);
			
		}else if (type == "Double Declining Method" && value != 0){
			this.adForm.controls.depRate.setValue(
				((200 / value)).toPrecision(4)
			);
			
		}else{
			this.adForm.controls.depRate.setValue(
				((0 * value))
			);
			
		}

		if (type == "Straight Line Method"){
			this.hiddendata = false
		}else if (type == "Double Declining Method"){
			this.hiddendata = false
		}else{
			this.hiddendata = true;
		}
	}

	loadAssetManagement(){
		this.selection.clear();
		const queryParams = new QueryAmModel(
			null,
			"asc",
			null,
			1,
			1000
		);
		this.amService.getListAm(queryParams).subscribe(
			res => {
				this.amResult = res.data;
			}
		);
	}

	getamId(id) {
		const controls = this.adForm.controls;
		this.amService.findAmModelById(id).subscribe(
			data => {
				controls.assetName.setValue(data.data.assetName);
				controls.remarks.setValue(data.data.description);
				controls.codeAsset.setValue(data.data.assetCode);
				controls.price.setValue(data.data.purchasePrice);
			}
		);
	}

	loadEx(){
		this.selection.clear();
		const queryParams = new QueryParamsModel(
			null,
			"asc",
			null,
			1,
			1000
		);
		this.acService.getListExpenditures(queryParams).subscribe(
			res => {
				const data = [];
				res.data.map(item => {
					item.map(item2 => {
						console.log(item2);
						data.push(item2);
					})
				});
				this.exResult = data;
				// console.log(res.data + "gl");
			}
		);
	}

	loadAda(){
		this.selection.clear();
		const queryParams = new QueryParamsModel(
			null,
			"asc",
			null,
			1,
			1000
		);
		this.AcctypeService.getListAccDept(queryParams).subscribe(
			res => {
				this.adaResult = res.data;
			}
		);
	}

	loadAc(){
		this.selection.clear();
		const queryParams = new QueryParamsModel(
			null,
			"asc",
			null,
			1,
			1000
		);
		this.AcctypeService.getListAssetAccount(queryParams).subscribe(
			res => {
				this.acResult = res.data;
			}
		);
	}

	// loadDea(){
	// 	this.selection.clear();
	// 	const queryParams = new QueryParamsModel(
	// 		null,
	// 		"asc",
	// 		null,
	// 		1,
	// 		1000
	// 	);
	// 	this.AcctypeService.getListDEA(queryParams).subscribe(
	// 		res => {
	// 			this.deaResult = res.data;
	// 		}
	// 	);
	// }

	goBackWithId() {
		const url = `/assetDepreciation`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}

	refreshAd(isNew: boolean = false, id:string = "") {
		let url = this.router.url;
		if (!isNew) {
			this.router.navigate([url], { relativeTo: this.activatedRoute });
			return;
		}

		url = `/assetDepreciation/edit/${id}`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}
	onSubmit(withBack: boolean = false) {
		this.hasFormErrors = false;
		const controls = this.adForm.controls;
		/** check form */
		if (this.adForm.invalid) {
			Object.keys(controls).forEach(controlNade =>
				controls[controlNade].markAsTouched()
			);

			this.hasFormErrors = true;
			this.selectedTab = 0;
			return;
		}

		const editedAd = this.prepareAd();
		this.updateAd(editedAd, withBack);
	}
	prepareAd(): AdModel {
		const controls = this.adForm.controls;
		const _ad = new AdModel();
		_ad.clear();
		_ad._id = this.ad._id;
		_ad.assetManagement = controls.assetManagement.value;
		_ad.aquicitionDate = controls.aquicitionDate.value;
		_ad.assetAccount = controls.assetAccount.value;
		_ad.assetName = controls.assetName.value.toLowerCase();
		_ad.accumulatedDepAcct = controls.accumulatedDepAcct.value;
		// _ad.depreciationExpAcct = controls.depreciationExpAcct.value;
		_ad.expenditures = controls.expenditures.value;
		_ad.intangibleAsset = controls.intangibleAsset.value;
		_ad.fiscalFixedAsset = controls.fiscalFixedAsset.value;
		_ad.remarks = controls.remarks.value;
		_ad.life = controls.life.value;
		_ad.depMethod = controls.depMethod.value;
		_ad.depRate = controls.depRate.value;
		return _ad;
	}

	

	updateAd(_ad: AdModel, withBack: boolean = false) {
		// Update User
		// tslint:disable-next-line:prefer-const
		const addSubscription = this.service.updateAd(_ad).subscribe(
			res => {
				const message = `Asset Depreciation successfully has been saved.`;
				this.layoutUtilsService.showActionNotification(message, MessageType.Update, 5000, true, true);
				const url = `/assetDepreciation`;
				this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
			},
			err => {
				console.error(err);
				const message = 'Error while adding asset depreciation | ' + err.statusText;
				this.layoutUtilsService.showActionNotification(message, MessageType.Update, 5000, true, false);
			}
		);
		this.subscriptions.push(addSubscription);
	}

	getComponentTitle() {
		let result = `Edit Asset Depreciation`;
		return result;
	}

	onAlertClose($event) {
		this.hasFormErrors = false;
	}

  	ngOnDestroy() {
		this.subscriptions.forEach(sb => sb.unsubscribe());
	}
	

	// changeQty() {
	// 	const qtySadple = this.adForm.controls.qtySadple.value;
	// 	const qtyGood = this.adForm.controls.qtyGood.value;
	// 	const qtyReject = this.adForm.controls.qtyReject.value;
	// 	if (qtySadple !== 0 && qtyGood !== 0 && qtyReject ) {
	// 		this.adForm.controls.qty.setValue(
	// 			(qtySadple + qtyGood + qtyReject )
	// 		);
	// 	}
	// }
}
