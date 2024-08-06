import {ChangeDetectorRef, Component, OnDestroy, OnInit} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { Store, select } from '@ngrx/store';
import { AppState } from '../../../../../core/reducers';
import { SubheaderService, LayoutConfigService } from '../../../../../core/_base/layout';
import { LayoutUtilsService, MessageType } from '../../../../../core/_base/crud';
import {TabulationModel} from "../../../../../core/purchaseManagement/tabulation/tabulation.model";
import {
	selectTabulationActionLoading,
	selectTabulationById
} from "../../../../../core/purchaseManagement/tabulation/tabulation.selector";
import {TabulationService} from '../../../../../core/purchaseManagement/tabulation/tabulation.service';
import { QueryPurchaseRequestModel } from '../../../../../core/purchaseManagement/purchaseRequest/querypurchaseRequest.model';
import { PurchaseRequestModel } from '../../../../../core/purchaseManagement/purchaseRequest/purchaseRequest.model';
import { SelectionModel } from '@angular/cdk/collections';
import { PurchaseRequestService } from '../../../../../core/purchaseManagement/purchaseRequest/purchaseRequest.service';
import { VendorModel } from '../../../../../core/masterData/vendor/vendor.model';
import { QueryVendorModel } from '../../../../../core/masterData/vendor/queryvendor.model';
import { VendorService } from '../../../../../core/masterData/vendor/vendor.service';
import { TaxModel } from '../../../../../core/masterData/tax/tax.model';
import { QueryTaxModel } from '../../../../../core/masterData/tax/querytax.model';
import { TaxService } from '../../../../../core/masterData/tax/tax.service';

@Component({
  selector: 'kt-view-tabulation',
  templateUrl: './view-tabulation.component.html',
  styleUrls: ['./view-tabulation.component.scss']
})
export class ViewTabulationComponent implements OnInit, OnDestroy {
	datauser = localStorage.getItem("user");
	tabulation: TabulationModel;
	TabulationId$: Observable<string>;
	oldTabulation: TabulationModel;
	selectedTab = 0;
	loading$: Observable<boolean>;
	tabulationForm: FormGroup;
	hasFormErrors = false;
	loading = {
		number: false,
		submit: false,
		product: false
	}
	date = new Date()
	isApproved: boolean = false;
	po_no: any

	TaxResult: any[] = []
	VendorResult: any[] = []
	prResult: any[] = []

	selectionPO = new SelectionModel<PurchaseRequestModel>(true, []);
	selectionTax = new SelectionModel<TaxModel>(true, []);
	selectionVendor = new SelectionModel<VendorModel>(true, []);


	dataSource: any = new BehaviorSubject([]);
	displayedColumns = ["product_code", "product_name","qty", "price", "after_discount", "available_qty", "description"];
	//displayedColumns = ["product_code", "product_name","qty", "price", "description"];

	private subscriptions: Subscription[] = [];
  	constructor(
		private activatedRoute: ActivatedRoute,
		private router: Router,
		private tabulationFB: FormBuilder,
		private subheaderService: SubheaderService,
		private layoutUtilsService: LayoutUtilsService,
		private store: Store<AppState>,
		private service: TabulationService,
		private serviceTax: TaxService,
		private serviceVendor: VendorService,
		private cd: ChangeDetectorRef,
		private servicePR: PurchaseRequestService,
		private layoutConfigService: LayoutConfigService
	) { }

  	ngOnInit() {
		this.loading$ = this.store.pipe(select(selectTabulationActionLoading));
		const routeSubscription =  this.activatedRoute.params.subscribe(params => {
			const id = params.id;
			if (id) {
				this.store.pipe(select(selectTabulationById(id))).subscribe(res => {
					if (res) {
						// console.log(res, "tabulation");

						this.tabulation = res;
						// console.log(res.select_product, "data baru");

						this.oldTabulation = Object.assign({}, this.tabulation);
						this.initTabulation();
					}
				});
			} else {
				this.tabulation = new TabulationModel();
				this.tabulation.clear();
				this.initTabulation();
			}
		});
		this.subscriptions.push(routeSubscription);
  	}

	initTabulation() {
		this.createForm();
		this.loadTax();
		this.loadVendor();
		this.loadPO2()
		if (this.tabulation._id) {
			this.prnoChange(this.tabulation.select_pr_no._id);
		}
	}

	createForm() {
		if (this.tabulation._id){
			this.tabulationForm = this.tabulationFB.group({
				tabulation_no: [{value: this.tabulation.tabulation_no, disabled: true}, Validators.required],
				vendor_name: [{value: this.tabulation.vendor, disabled: true}, Validators.required],
				date: [{value: this.tabulation.date, disabled: true}, Validators.required],
				select_pr_no: [{value: this.tabulation.select_pr_no, disabled: true}, Validators.required],
				//select_product: [{value: this.tabulation.select_product, disabled: true}, Validators.required],
				product_name: [{value: this.tabulation.product, disabled: true}, Validators.required],
				tabulation_subject : [{value: this.tabulation.tabulation_subject, disabled: true}, Validators.required],

				created_by: [{value: this.tabulation.created_by, disabled: true}],
			});
		}
	}
	goBackWithId() {
		const url = `/tabulation`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}
	refreshTabulation(isNew: boolean = false, id:string = "") {
		let url = this.router.url;
		if (!isNew) {
			this.router.navigate([url], { relativeTo: this.activatedRoute });
			return;
		}
		url = `/tabulation/edit/${id}`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}

	loadPO2(){
		this.selectionPO.clear();
		const queryParams = new QueryPurchaseRequestModel(
			null,
			1,
			10000
		);
		this.servicePR.getListPurchaseRequest(queryParams).subscribe(
			res => {
				//console.log(res.data, "rehan4");

				this.prResult = res.data;
			}
		);
	}

	loadVendor(){
		this.selectionVendor.clear();
		const queryParams = new QueryVendorModel(
			null,
			1,
			10000
		);
		this.serviceVendor.getListVendor(queryParams).subscribe(
			res => {
				// console.log(res);

				this.VendorResult = res.data;
			}
		);
	}

	loadTax(){
		this.selectionTax.clear();
		const queryParams = new QueryTaxModel(
			null,
			1,
			10000
		);
		this.serviceTax.getListTax(queryParams).subscribe(
			res => {
				// console.log(res);

				this.TaxResult = res.data;
			}
		);
	}

	loadProductList(value) {
		const controls = this.tabulationForm.controls
		this.loading.product = true;
		this.dataSource.next(value);
		// console.log(value, "load product");

		controls.product_name.setValue(this.dataSource.value)
		// console.log(value);
		this.loading.product = false;
	}

	prnoChange(value){
		// console.log(value);
		this.selectionPO.clear();
		this.servicePR.findPurchaseRequestById(value).subscribe(
			res => {
				// console.log(res, "purchase request");
				let data = res.data;
				// console.log(this.tabulation.select_product, "purchase order product");
				// console.log(this.tabulation.select_pr_no._id);
				const controls = this.tabulationForm.controls

				// this.po_no = data.purchase_request_no;
				if (this.tabulation._id) {
					controls.select_pr_no.setValue(this.tabulation.select_pr_no._id)
					// this.vendorchange(this.tabulation.vendor_name._id)
					
					//this.loadProductList(this.tabulation.select_product)
					this.loadProductList(this.tabulation.product)
				} else {
					this.vendorchange(data.vendor_name)
					if (data.tax != null)
						this.taxchange(data.tax);
					controls.total.setValue(data.total)
					controls.type_discount.setValue(data.type_discount)
					controls.discount.setValue(data.discount)
					controls.grand_total.setValue(data.grand_total)
					this.loadProductList(data.product_name)
					// this.tabulationForm.controls.pr_no.setValue(data.purchase_request_no)
				}
			this.cd.markForCheck()

			}
		);

	}

	vendorchange(value){
		// console.log(value, "id vendor");

		this.selectionVendor.clear();
		this.serviceVendor.findVendorById(value).subscribe(
			res => {
				// console.log(res, "data vendor id");
				let data = res.data;
				// if (this.tabulation._id) {
					this.tabulationForm.controls.vendor_name.setValue(data._id)
				// }
				this.cd.markForCheck()
			}
		);
	}
	taxchange(value){
		// console.log(value, "id tax");
		this.selectionTax.clear();
		this.serviceTax.findTaxById(value).subscribe(
			res => {
				// console.log(res, "data tax id");
				let data = res.data;
				// if (this.tabulation._id) {
					this.tabulationForm.controls.tax.setValue(data._id)
				// }
				this.cd.markForCheck()
			}
		);
	}

	onSubmit(withBack: boolean = false) {
		this.hasFormErrors = false;
		const controls = this.tabulationForm.controls;
		if (this.tabulationForm.invalid) {
			Object.keys(controls).forEach(controlName =>
				controls[controlName].markAsTouched()
			);

			this.hasFormErrors = true;
			this.selectedTab = 0;
			return;
		}

		this.loading.submit = true;
		const editedTabulation = this.prepareTabulation();
		if (editedTabulation._id) {
			this.updateTabulation(editedTabulation, withBack);
			return;
		}
		this.addTabulation(editedTabulation, withBack);
	}

	prepareTabulation(): TabulationModel {
		const controls = this.tabulationForm.controls;
		const _tabulation = new TabulationModel();
		_tabulation.clear();
		_tabulation._id = this.tabulation._id;
		_tabulation.tabulation_no = controls.tabulation_no.value;
		_tabulation.vendor = controls.vendor_name.value;
		_tabulation.date = controls.date.value;
		_tabulation.select_pr_no = controls.select_pr_no.value;
		//_tabulation.select_product = controls.select_product.value;
		_tabulation.product = controls.product_name.value;
		_tabulation.tabulation_subject = controls.tabulation_subject.value;
		_tabulation.created_by = controls.created_by.value;
		// console.log(controls, "controls");

		return _tabulation;
	}

	addTabulation( _tabulation: TabulationModel, withBack: boolean = false) {
		const addSubscription = this.service.createTabulation(_tabulation).subscribe(
			res => {
				const message = `New tabulation successfully has been added.`;
				this.layoutUtilsService.showActionNotification(message, MessageType.Create, 5000, true, true);
				const url = `/tabulation`;
				this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
			},
			err => {
				// console.error(err);
				const message = 'Error while adding tabulation | ' + err.statusText;
				this.layoutUtilsService.showActionNotification(message, MessageType.Create, 5000, true, false);
			}
		);
		this.subscriptions.push(addSubscription);
	}

	updateTabulation(_tabulation: TabulationModel, withBack: boolean = false) {
		const addSubscription = this.service.updateTabulation(_tabulation).subscribe(
			res => {
				const message = `Tabulation successfully has been saved.`;
				this.layoutUtilsService.showActionNotification(message, MessageType.Update, 5000, true, true);
				const url = `/tabulation`;
				this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
			},
			err => {
				// console.error(err);
				const message = 'Error while adding tabulation | ' + err.statusText;
				this.layoutUtilsService.showActionNotification(message, MessageType.Update, 5000, true, false);
			}
		);
		this.subscriptions.push(addSubscription);
	}

	getComponentTitle() {
		let result = 'Create Tabulation';
		if (!this.tabulation || !this.tabulation._id) {
			return result;
		}

		result = `Edit Tabulation`;
		return result;
	}

	onAlertClose($event) {
		this.hasFormErrors = false;
	}

  	ngOnDestroy() {
		this.subscriptions.forEach(sb => sb.unsubscribe());
	}
}
