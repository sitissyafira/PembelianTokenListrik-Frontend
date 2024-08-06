import {ChangeDetectorRef, Component, OnDestroy, OnInit} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable, Subscription } from 'rxjs';
import { Store, select } from '@ngrx/store';
import { AppState } from '../../../../../core/reducers';
import { SubheaderService, LayoutConfigService } from '../../../../../core/_base/layout';
import { LayoutUtilsService, MessageType } from '../../../../../core/_base/crud';
import {StockProductModel} from "../../../../../core/inventorymanagement/stockProduct/stockProduct.model";
import {
	selectStockProductActionLoading,
	selectStockProductById
} from "../../../../../core/inventorymanagement/stockProduct/stockProduct.selector";
import {StockProductService} from '../../../../../core/inventorymanagement/stockProduct/stockProduct.service';
import { SelectionModel } from '@angular/cdk/collections';
import { QueryProductCategoryModel } from '../../../../../core/masterData/productCategory/queryproductCategory.model';
import { ProductCategoryService } from '../../../../../core/masterData/productCategory/productCategory.service';
import { QueryProductBrandModel } from '../../../../../core/masterData/productBrand/queryproductBrand.model';
import { ProductBrandService } from '../../../../../core/masterData/productBrand/productBrand.service';
import { UomService } from '../../../../../core/masterData/asset/uom/uom.service';
import { QueryUomModel } from '../../../../../core/masterData/asset/uom/queryuom.model';

@Component({
  selector: 'kt-add-stockProduct',
  templateUrl: './add-stockProduct.component.html',
  styleUrls: ['./add-stockProduct.component.scss']
})
export class AddStockProductComponent implements OnInit, OnDestroy {
	datauser = localStorage.getItem("user");
	stockProduct: StockProductModel;
	StockProductId$: Observable<string>;
	selection = new SelectionModel<StockProductModel>(true, []);
	oldStockProduct: StockProductModel;
	selectedTab = 0;
	loading$: Observable<boolean>;
	stockProductForm: FormGroup;
	hasFormErrors = false;
	loading : boolean = false;
	productCategoryResult: any[] = [];
	productBrandResult: any[] = [];
	UOMResult: any[] = [];

	private loadingData = {
		productCategory: false,
		productBrand : false,
		UOM : false
	}

	private subscriptions: Subscription[] = [];
  	constructor(
		private activatedRoute: ActivatedRoute,
		private router: Router,
		private stockProductFB: FormBuilder,
		private subheaderService: SubheaderService,
		private layoutUtilsService: LayoutUtilsService,
		private store: Store<AppState>,
		private service: StockProductService,
		private serviceProductCategory : ProductCategoryService,
		private serviceProductBrand : ProductBrandService,
		private serviceUOM : UomService,
		private cd: ChangeDetectorRef,
		private layoutConfigService: LayoutConfigService
	) { }

  	ngOnInit() {
		this.loading$ = this.store.pipe(select(selectStockProductActionLoading));
		const routeSubscription =  this.activatedRoute.params.subscribe(params => {
				this.stockProduct = new StockProductModel();
				this.stockProduct.clear();
				this.initStockProduct();
			}
		)
		this.subscriptions.push(routeSubscription);
  	}

	initStockProduct() {
		this.createForm();
		this.loadProductCategory()
		this.loadUOM();

	}

	createForm() {
			this.stockProductForm = this.stockProductFB.group({
				product_category: ["", Validators.required],
				product_brand: ["", Validators.required],
				product_code: ["", Validators.required],
				product_name: ["", Validators.required],
				stock_qty: [{value:0, disabled:true}],
				uom : ["", Validators.required],
				buy_price : [{value:0, disabled:true}],
				discount : [{value:0, disabled:true}],
				description : [""],
				created_by: [{value:this.datauser, disabled:true}],
			});
	}


	loadProductCategory() {
		this.loadingData.productCategory = true;
		this.selection.clear();
		const queryParams = new QueryProductCategoryModel(
			null,
			1,
			1000
		);
		this.serviceProductCategory.getListProductCategory(queryParams).subscribe(
			res => {
				this.productCategoryResult = res.data;
				this.loadingData.productCategory = false;
				this.cd.markForCheck();
			}
		);
	}

	productCategoryChange(id){
		if(id){
			this.loadProductBrand(id);
		}
	};

	loadProductBrand(id) {
		this.loadingData.productBrand = true;
		this.selection.clear();
		const queryParams = new QueryProductBrandModel(
			null,
			1,
			1000
		);
		this.serviceProductBrand.findProductBrandByCategory(id).subscribe(
			res => {
				this.productBrandResult = res.data;
				this.loadingData.productBrand = false;
				this.cd.markForCheck();
			}
		);
	}

	loadUOM() {
		this.loadingData.UOM = true;
		this.selection.clear();
		const queryParams = new QueryUomModel(
			null,
			null,
			null,
			1,
			1000
		);
		this.serviceUOM.getListUom(queryParams).subscribe(
			res => {
				this.UOMResult = res.data;
				this.loadingData.UOM = false;
				this.cd.markForCheck();
			}
		);
	}

	goBackWithId() {
		const url = `/stockProduct`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}
	refreshStockProduct(isNew: boolean = false, id:string = "") {
		let url = this.router.url;
		if (!isNew) {
			this.router.navigate([url], { relativeTo: this.activatedRoute });
			return;
		}
		url = `/stockProduct/edit/${id}`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}
	onSubmit(withBack: boolean = false) {
		this.hasFormErrors = false;
		const controls = this.stockProductForm.controls;
		if (this.stockProductForm.invalid) {
			Object.keys(controls).forEach(controlName =>
				controls[controlName].markAsTouched()
			);

			this.hasFormErrors = true;
			this.selectedTab = 0;
			return;
		}

		this.loading = true;
		const editedStockProduct = this.prepareStockProduct();
		this.addStockProduct(editedStockProduct, withBack);
	}

	prepareStockProduct(): StockProductModel {
		const controls = this.stockProductForm.controls;
		const _stockProduct = new StockProductModel();
		_stockProduct.clear();
		_stockProduct._id = this.stockProduct._id;
		_stockProduct.product_code = controls.product_code.value;
		_stockProduct.product_name = controls.product_name.value.toLowerCase();
		_stockProduct.product_category = controls.product_category.value;
		_stockProduct.product_brand = controls.product_brand.value;
		_stockProduct.uom = controls.uom.value;
		_stockProduct.stock_qty = controls.stock_qty.value;
		_stockProduct.buy_price = controls.buy_price.value;
		_stockProduct.discount = controls.discount.value;
		_stockProduct.description = controls.description.value;
		_stockProduct.created_by = controls.created_by.value;
		return _stockProduct;


	}

	addStockProduct( _stockProduct: StockProductModel, withBack: boolean = false) {
		const addSubscription = this.service.createStockProduct(_stockProduct).subscribe(
			res => {
				const message = `New stock product successfully has been added.`;
				this.layoutUtilsService.showActionNotification(message, MessageType.Create, 5000, true, true);
				const url = `/stockProduct`;
				this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
			},
			err => {
				if (err.status == '409')
				{
					this.loading = false;
					this.layoutUtilsService.showActionNotification(err.error.message, MessageType.Create, 5000, true, false);
					this.cd.markForCheck();
				}
				else
				{
					//console.error(err);
					const message = 'Error while adding stock product | ' + err.statusText;
					this.layoutUtilsService.showActionNotification(message, MessageType.Create, 5000, true, false);
				}
			}
		);
		this.subscriptions.push(addSubscription);
	}


	getComponentTitle() {
		let result = 'Create Product';
		return result;
	}

	onAlertClose($event) {
		this.hasFormErrors = false;
	}

  	ngOnDestroy() {
		this.subscriptions.forEach(sb => sb.unsubscribe());
	}

	inputKeydownHandler(event) {
		return event.keyCode === 8 || event.keyCode === 46 ? true : !isNaN(Number(event.key));
	}
}
