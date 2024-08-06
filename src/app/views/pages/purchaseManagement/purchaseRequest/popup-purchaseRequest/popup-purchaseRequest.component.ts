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
	selector: 'kt-popup-purchaseRequest',
	templateUrl: './popup-purchaseRequest.component.html',
	styleUrls: ['./popup-purchaseRequest.component.scss']
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

export class PopupPurchaseRequest implements OnInit {
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

	dataUOM: any;

	// product property
	selection = new SelectionModel<StockProductModel>(true, []);
	ProductResult: any[] = [];
	productResultFiltered = [];
	viewProductResult = new FormControl();
	product: any = {}

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
		private serviceProductCategory: ProductCategoryService,
		private serviceProductBrand: ProductBrandService,
		private serviceUOM: UomService,
		private cd: ChangeDetectorRef,
		private route: Router,
		private activatedRoute: ActivatedRoute,
		public dialogRef: MatDialogRef<PopupPurchaseRequest>,
		@Inject(MAT_DIALOG_DATA) public data: any
	) { }

	ngOnInit() {
		this.initProduct();
		console.log(this.data._id);

	}

	initProduct() {
		this.createForm();
		this.loadProductList(null);
		// this.loadCategory();
		this.loadUom();
		// this.categoryChange(this.product.product_category);
	}




	createForm() {
		if (this.product._id) {
			// console.log(this.product);

			this.productForm = this.productFB.group({
				_id: [this.product._id, Validators.required],
				product_code: [this.product.brand_code],
				product_name: [this.product.brand_name, Validators.required],
				remaining_stock: [0],
				stock_delivery: [0],
				stock_request: [0],
				buy_price: [this.product.buy_price],
				typediscount: [""],
				discount: [0],
				subtotal: [{ value: 0, disabled: true }],
				after_discount: [0],
				qty: [1, Validators.required],
				uom: [this.product.uom, Validators.required],
				uom2: [this.product.uom2, Validators.required],
				description: [this.product.description],
			});
		} else {
			this.productForm = this.productFB.group({
				_id: [this.data.id, Validators.required],
				product_code: [""],
				product_name: ["", Validators.required],
				remaining_stock: [0],
				stock_delivery: [0],
				stock_request: [0],
				qty: [1, Validators.required],
				typediscount: [""],
				subtotal: [{ value: 0, disabled: true }],
				after_discount: [0],
				buy_price: [0],
				discount: [0],
				uom: ["", Validators.required],
				uom2: ["", Validators.required],
				description: [""],
			});
		}
	}

	//load product from product instead inventory
	loadProductList(product_queryname) {
		// this.loading.product = true;
		// this.selection.clear();
		const queryParams = new QueryProductBrandModel(
			product_queryname,
			1,
			3
		);
		this.serviceProductBrand.getListProductBrand(queryParams).subscribe(
			res => {
				this.ProductResult = res.data;
				console.log(res.data, 'data')
				// Set filtered value same as base
				// this.blockResultFiltered = this.blockResult.slice();

				this.loading.product = false;
				// this.viewProductResult.enable();
				// this.cd.markForCheck();
			}
		);
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
	// 	  console.log(id);

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

	setUom(e) {
		const controls = this.productForm.controls;
		if (e) {
			this.serviceUOM.findUomById(e).subscribe(
				res => {
					// console.log(res.data)
					this.dataUOM = res.data
					this.product.uom2 = res.data.uom;
					controls.uom.setValue(res.data._id);
					controls.uom2.setValue(res.data.uom);
					this.cd.markForCheck();
				}
			)
		}
	}

	_setproductValue(value) {
		// this.loadUom(value.uom)
		this.product = value;
		this.createForm();
		this.changeTotal()
		this.setUom(value.uom._id)
		// const controls = this.purchaseRequestForm.controls;
		// this.loadingProduct = true;
		// let data = this.data;
		// console.log(data);

		// console.log(value, 'from the option click');
		// let dataExist = data.find((item) => item._id == value._id)

		// 	if (!dataExist) {
		// 		data.push({...value, qty: 1})
		// 		console.log(data);

		// 		// this.cd.markForCheck()
		// 	} else {
		// 		console.log(dataExist);

		// 		// this.intStock(dataExist._id)
		// 	}

		// 	let dataId = data.map((item) => item._id)
		// 	// controls.product_name.setValue(dataId)
		// 	console.log(dataId);


		// this.viewProductResult.setValue("")
		// this.floorForm.patchValue({ blk: value._id });
		// this.loadingProduct = false;

	}

	// Remove selected value on keydown
	_onKeyup(e: any) {
		// Unset the form value
		// this.floorForm.patchValue({ blk: undefined });
		this.loadProductList(e.target.value)
		this._filterBlockList(e.target.value);
	}

	_filterBlockList(text: string) {
		this.productResultFiltered = this.ProductResult.filter(i => {
			// const filterText = `${i.cdblk.toLocaleLowerCase()} - ${i.nmblk.toLocaleLowerCase()}`;
			const filterText = `${i.brand_name}`
			if (filterText.includes(text.toLocaleLowerCase())) return i;
		});
	}

	onNoClick() {
		this.dialogRef.close();
	}

	changeTotal() {
		const controls = this.productForm.controls
		let subtotal = controls.buy_price.value * controls.qty.value;
		controls.subtotal.setValue(subtotal)
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
		this.product.typediscount = parseInt(controls.typediscount.value);
		this.product.discount = parseInt(controls.discount.value);
		this.product.subtotal = parseInt(controls.subtotal.value);
		this.product.after_discount = parseInt(controls.after_discount.value);
		this.product.qty = parseInt(controls.qty.value);
		this.product.uom = controls.uom.value;
		this.product.uom2 = controls.uom2.value;
		this.product.description = controls.description.value;


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
