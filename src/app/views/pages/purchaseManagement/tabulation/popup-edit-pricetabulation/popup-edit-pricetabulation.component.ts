import { ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
// import { PriceService } from '../../../../../core/master/price/price.service';
// import { QueryPriceModel } from '../../../../../core/master/price/queryprice.model';
import { LayoutUtilsService, MessageType } from '../../../../../core/_base/crud';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../../../../environments/environment';
import { StockProductModel } from '../../../../../core/inventorymanagement/stockProduct/stockProduct.model';
import { StockProductService } from '../../../../../core/inventorymanagement/stockProduct/stockProduct.service';
import { QueryUomModel } from '../../../../../core/masterData/asset/uom/queryuom.model';
import { UomService } from '../../../../../core/masterData/asset/uom/uom.service';
import { ProductBrandService } from '../../../../../core/masterData/productBrand/productBrand.service';
import { QueryProductBrandModel } from '../../../../../core/masterData/productBrand/queryproductBrand.model';
import { ProductCategoryService } from '../../../../../core/masterData/productCategory/productCategory.service';
import { QueryProductCategoryModel } from '../../../../../core/masterData/productCategory/queryproductCategory.model';
import { QueryStockProductModel } from '../../../../../core/inventorymanagement/stockProduct/querystockProduct.model';
import { SelectionModel } from '@angular/cdk/collections';

import * as moment from 'moment';
//import { DatePipe } from '@angular/common';

@Component({
  selector: 'kt-popup-edit-pricetabulation',
  templateUrl: './popup-edit-pricetabulation.component.html',
  styleUrls: ['./popup-edit-pricetabulation.component.scss']
})
export class PopupEditPricetabulationComponent implements OnInit {

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
    public dialogRef: MatDialogRef<PopupEditPricetabulationComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit() {
	// console.log(this.data, "data dari table");
	this.product = this.data
    this.initProduct();
  }


  initProduct() {
	this.createForm();
	// this.loadProductList();
    this.loadUom();
	}

  createForm(){
    if (this.product._id){
			this.productForm = this.productFB.group({
				_id: [this.product._id, Validators.required],
				product_code: [{value: this.product.product_code, disabled: true}],
				product_name: [{value: this.product.product_name, disabled: true}, Validators.required],
				remaining_stock: [this.product.remaining_stock],
				stock_delivery: [this.product.stock_delivery],
				stock_request: [this.product.stock_request],
				typediscount: [this.product.typediscount],
				discount: [this.product.discount, Validators.required],
				qty: [this.product.qty, Validators.required],
				uom: [{value: this.product.uom, disabled: true}, Validators.required],
				uom2: [this.product.uom2, Validators.required],
				buy_price: [this.product.buy_price, Validators.required],
				subtotal: [{value: this.product.subtotal, disabled: true}, Validators.required],
				after_discount: [{value: this.product.after_discount, disabled: true}, Validators.required],
				description: [this.product.description],
		});
		}
  }

  // Product load
	// loadProductList() {
	// 	this.loading.product = true;
	// 	this.selection.clear();
	// 	const queryParams = new QueryStockProductModel(
	// 		null,
	// 		1,
	// 		1000
	// 	);
	// 	this.serviceProduct.getListStockProduct(queryParams).subscribe(
	// 		res => {
	// 			this.ProductResult = res.data;
	// 			// Set filtered value same as base
	// 			// this.blockResultFiltered = this.blockResult.slice();

	// 			this.loading.product = false;
	// 			// this.viewProductResult.enable();
	// 			// this.cd.markForCheck();
	// 		}
	// 	);
	// }

//   loadCategory() {
// 		this.loading.category = true;
// 		this.selection.clear();
// 		const queryParams = new QueryProductCategoryModel(
// 			null,
// 			1,
// 			1000
// 		);
// 		this.serviceProductCategory.getListProductCategory(queryParams).subscribe(
// 			res => {
// 				this.productCategoryResult = res.data;
// 				this.loading.category = false;
// 				this.cd.markForCheck();
// 			}
// 		);
// 	}

//   categoryChange(id){
// 		if(id){
// 			this.loadBrand(id);
// 		}
// 	};

//   loadBrand(id) {
// 		this.loading.brand = true;
// 		this.selection.clear();
// 		const queryParams = new QueryProductBrandModel(
// 			null,
// 			1,
// 			1000
// 		);
// 		this.serviceProductBrand.findProductBrandByCategory(id).subscribe(
// 			res => {
// 				this.productBrandResult = res.data;
// 				this.loading.brand = false;
// 				this.cd.markForCheck();
// 			}
// 		);
// 	}

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

  _setproductValue(value) {
		// console.log(value);
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

	// changeSubTotal(){
	// 	const controls = this.productForm.controls
		// console.log(controls.buy_price.value, "buy total");
		// console.log(controls.subtotal.value, "total");
	// }

	changeDiscount(){
		const controls = this.productForm.controls
		let subtotal = controls.buy_price.value * controls.qty.value;
		controls.subtotal.setValue(subtotal)
		let total
		if (controls.typediscount.value == "pr") {
			// console.log(controls.subtotal.value);
			// console.log(controls.discount.value);

			let persen = (controls.subtotal.value * controls.discount.value) / 100;
			// console.log(persen);
			total = controls.subtotal.value - persen
		} else {
			total = controls.subtotal.value - controls.discount.value
		}
		controls.after_discount.setValue(total)

	}

  onNoClick() {
    this.dialogRef.close();
  }

  prepareProduct() {
	this.hasFormErrors = false;
	const controls = this.productForm.controls;
    this.product._id = controls._id.value;
	this.product.buy_price = controls.buy_price.value;
    this.product.product_code = controls.product_code.value;
    this.product.product_name = controls.product_name.value;
    this.product.stock_request = parseInt(controls.stock_request.value);
    this.product.remaining_stock = parseInt(controls.remaining_stock.value);
    this.product.stock_delivery = parseInt(controls.stock_delivery.value);
    this.product.typediscount = controls.typediscount.value;
    this.product.discount = parseInt(controls.discount.value);
    this.product.subtotal = parseInt(controls.subtotal.value);
    this.product.after_discount = parseInt(controls.after_discount.value);
    this.product.qty = parseInt(controls.qty.value);
    this.product.uom = controls.uom.value;
    this.product.uom2 = controls.uom2.value;
    this.product.description = controls.description.value;
	// console.log(this.product);

	if (this.productForm.invalid) {
		// console.log(controls);
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
