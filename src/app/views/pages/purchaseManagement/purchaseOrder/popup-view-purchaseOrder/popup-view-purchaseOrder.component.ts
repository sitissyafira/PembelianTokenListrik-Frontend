import { SelectionModel } from '@angular/cdk/collections';
import { ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { QueryUomModel } from '../../../../../core/masterData/asset/uom/queryuom.model';
import { UomService } from '../../../../../core/masterData/asset/uom/uom.service';
import { ProductBrandService } from '../../../../../core/masterData/productBrand/productBrand.service';
import { QueryProductBrandModel } from '../../../../../core/masterData/productBrand/queryproductBrand.model';
import { ProductCategoryService } from '../../../../../core/masterData/productCategory/productCategory.service';
import { QueryProductCategoryModel } from '../../../../../core/masterData/productCategory/queryproductCategory.model';
import { QueryStockProductModel } from '../../../../../core/inventorymanagement/stockProduct/querystockProduct.model';
import { StockProductModel } from '../../../../../core/inventorymanagement/stockProduct/stockProduct.model';
import { StockProductService } from '../../../../../core/inventorymanagement/stockProduct/stockProduct.service';
import { LayoutUtilsService, MessageType } from '../../../../../core/_base/crud';

@Component({
  selector: 'kt-popup-view-purchaseOrder',
  templateUrl: './popup-view-purchaseOrder.component.html',
  styleUrls: ['./popup-view-purchaseOrder.component.scss']
})

// interface product {
// 	_id: any;
// 	product_code: String,
// 	product_name: String,
// 	product_category: String,
// 	product_brand: String,
// 	qty: Number,
// 	uom: String,
// 	description: String,
// }

export class PopupViewPurchaseOrder implements OnInit {
	productForm: FormGroup;
	hasFormErrors = false;
	selectedTab = 0;
  loading = {
    dialog: false,
    product: false,
    uom: false,
    category: false,
    brand: false
  }

  // product property
	selection = new SelectionModel<StockProductModel>(true, []);
	ProductResult: any[] = [];
	productResultFiltered = [];
	viewProductResult = new FormControl();
  	product:any = {}

  // category property
	productCategoryResult: any[] = [];

  // brand property
	productBrandResult: any[] = [];

  // uom property
  UOMResult: any[] = [];

  constructor(
		private productFB: FormBuilder,
    private cdr: ChangeDetectorRef,
    private layoutUtilsService: LayoutUtilsService,
		private serviceProduct: StockProductService,
		private serviceProductCategory : ProductCategoryService,
		private serviceProductBrand : ProductBrandService,
		private serviceUOM : UomService,
		private cd: ChangeDetectorRef,
    private route: Router,
    private activatedRoute: ActivatedRoute,
    public dialogRef: MatDialogRef<PopupViewPurchaseOrder>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit() {
	console.log(this.data);
	this.product = this.data
    this.initProduct();
  }

  
  initProduct() {
	this.createForm();
	this.loadProductList();
    this.loadCategory();
    this.loadUom();
    this.categoryChange(this.product.product_category);
	}

  createForm(){
    if (this.product.product_code){
			this.productForm = this.productFB.group({
				product_code: [{value: this.product.product_code,disabled: true}],
				product_name: [{value: this.product.product_name,disabled: true}],
				product_category: [{value: this.product.product_category,disabled: true}],
				product_brand: [{value: this.product.product_brand,disabled: true}],
				qty: [{value: this.product.qty ,disabled: true}],
				uom: [{value: this.product.uom,disabled: true}],
				price: [{value: this.product.price, disabled: true}],
				description: [{value: this.product.description, disabled: true}],
			});
		}
  }

  // Product load
	loadProductList() {
		this.loading.product = true;
		this.selection.clear();
		const queryParams = new QueryStockProductModel(
			null,
			1,
			1000
		);
		this.serviceProduct.getListStockProduct(queryParams).subscribe(
			res => {
				this.ProductResult = res.data;
				// Set filtered value same as base
				// this.blockResultFiltered = this.blockResult.slice();

				this.loading.product = false;
				// this.viewProductResult.enable();
				// this.cd.markForCheck();
			}
		);
	}

  loadCategory() {
		this.loading.category = true;
		this.selection.clear();
		const queryParams = new QueryProductCategoryModel(
			null,
			1,
			1000
		);
		this.serviceProductCategory.getListProductCategory(queryParams).subscribe(
			res => {
				this.productCategoryResult = res.data;
				this.loading.category = false;
				this.cd.markForCheck();
			}
		);
	}

  categoryChange(id){
		if(id){
			this.loadBrand(id);
		}
	};

  loadBrand(id) {
		this.loading.brand = true;
		this.selection.clear();
		const queryParams = new QueryProductBrandModel(
			null,
			1,
			1000
		);
		this.serviceProductBrand.findProductBrandByCategory(id).subscribe(
			res => {
				this.productBrandResult = res.data;
				this.loading.brand = false;
				this.cd.markForCheck();
			}
		);
	}

  loadUom() {
		this.loading.uom = true;
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
				this.loading.uom = false;
				this.cd.markForCheck();
			}
		);
	}

	// _setViewProduct(value){
	// 	console.log(value);
	// 	this.product = value;
	// 	this.ngOnInit()
	// }

  _setproductValue(value) {
		console.log(value);
    this.product = value;
    this.ngOnInit()
	}

	// Remove selected value on keydown
	_onKeyup(e: any) {
		// Unset the form value
		// this.floorForm.patchValue({ blk: undefined });
		this._filterBlockList(e.target.value);
	}
	
	_filterBlockList(text: string) {
		this.productResultFiltered = this.ProductResult.filter(i => {
			// const filterText = `${i.cdblk.toLocaleLowerCase()} - ${i.nmblk.toLocaleLowerCase()}`;
			const filterText = `${i.product_name}`
			if(filterText.includes(text.toLocaleLowerCase())) return i;
		});
	}

  onNoClick() {
    this.dialogRef.close();
  }

  prepareProduct() {
	this.hasFormErrors = false;
	const controls = this.productForm.controls;
	this.product.qty = controls.qty.value;
    this.product.product_code = controls.product_code.value;
    this.product.product_name = controls.product_name.value;
    this.product.product_category = controls.product_category.value;
    this.product.product_brand = controls.product_brand.value;
    this.product.qty = parseInt(controls.qty.value);
    this.product.uom = controls.uom.value;
    this.product.description = controls.description.value;
	console.log(this.product);
	
	if (this.productForm.invalid) {
		console.log(controls);
		Object.keys(controls).forEach((controlName) =>
			controls[controlName].markAsTouched()
		);

		this.hasFormErrors = true;
		this.selectedTab = 1;
		return;
	}
}

  AddProduct() {
    this.prepareProduct();
	if (!this.hasFormErrors) {
		this.dialogRef.close({
			data: this.product
		});
	}
  }

  onAlertClose($event) {
	this.hasFormErrors = false;
}


}
