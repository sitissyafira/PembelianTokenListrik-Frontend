import {ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild, ElementRef} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { Store, select } from '@ngrx/store';
import { AppState } from '../../../../../core/reducers';
import { SubheaderService, LayoutConfigService } from '../../../../../core/_base/layout';
import { LayoutUtilsService, MessageType } from '../../../../../core/_base/crud';
import {PoReceiptModel} from "../../../../../core/purchaseManagement/poReceipt/poReceipt.model";
import {
	selectPoReceiptActionLoading,
	selectPoReceiptById
} from "../../../../../core/purchaseManagement/poReceipt/poReceipt.selector";
import {PoReceiptService} from '../../../../../core/purchaseManagement/poReceipt/poReceipt.service';
import { SelectionModel } from '@angular/cdk/collections';
import { StockProductModel } from '../../../../../core/inventorymanagement/stockProduct/stockProduct.model';
import { MatDialog } from '@angular/material/dialog';
import { QueryQuotationModel } from '../../../../../core/purchaseManagement/quotation/queryquotation.model';
import { QuotationService } from '../../../../../core/purchaseManagement/quotation/quotation.service';
import { QueryTaxModel } from '../../../../../core/masterData/tax/querytax.model';
import { TaxService } from '../../../../../core/masterData/tax/tax.service';
import { TaxModel } from '../../../../../core/masterData/tax/tax.model';
import { QuotationModel } from '../../../../../core/purchaseManagement/quotation/quotation.model';
import { QueryVendorModel } from '../../../../../core/masterData/vendor/queryvendor.model';
import { VendorService } from '../../../../../core/masterData/vendor/vendor.service';
import { VendorModel } from '../../../../../core/masterData/vendor/vendor.model';
import { PurchaseRequestService } from '../../../../../core/purchaseManagement/purchaseRequest/purchaseRequest.service';
import { ProductBrandService } from '../../../../../core/masterData/productBrand/productBrand.service';
import { UomService } from '../../../../../core/masterData/asset/uom/uom.service';
import { QueryUomModel } from '../../../../../core/masterData/asset/uom/queryuom.model';
import { MatTable } from '@angular/material';
import { PurchaseOrderService } from '../../../../../core/purchaseManagement/purchaseOrder/purchaseOrder.service';

@Component({
  selector: 'kt-view-poReceipt',
  templateUrl: './view-poReceipt.component.html',
  styleUrls: ['./view-poReceipt.component.scss']
})
export class ViewpoReceiptComponent implements OnInit, OnDestroy {
	datauser = localStorage.getItem("user");
	poReceipt: PoReceiptModel;
	poReceiptId$: Observable<string>;
	oldpoReceipt: PoReceiptModel;
	selectedTab = 0;
	loading$: Observable<boolean>;
	poReceiptForm: FormGroup;
	hasFormErrors = false;
	loading : boolean = false;
	loadingTax : boolean = false;
	loadingVendor : boolean = false;
	loadingQuo : boolean = false;
	loadingPO : boolean = false;
	loadingProduct : boolean = false;
	quoResult: any[] = []
	TaxResult: any[] = []
	POResult: any[] = []
	POResultFiltered: any[] = []
	typePOReceipt: any[] = [
		{
			type_value: "in",
			type_label: "In"
		},
		{
			type_value: "return",
			type_label: "Return"
		},
	]
	receiptOptions: any[] = [
		{
			type_value: "1",
			type_label: "Full"
		},
		{
			type_value: "2",
			type_label: "Partial"
		},
		// {
		// 	type_value: "3",
		// 	type_label: "Return"
		// },
	]
	
	VendorResult: any[] = []
	VendorResultFiltered: any[] = []
	nowDate: any = Date.now()
	po_no: any;
	//quotation_no: any;
	loadingGenerate: boolean
	isApproved: boolean
	//product list is product_name in purchaseRequest
	productList: any[] = [{
		qty: "",
		uom: {uom: ""},
		price: "",
		subTotal: "",
	}]

	productsListFromPO: any[] = []
	products: any[] = []
	ProductResultFiltered: any[] = []
	unavailableProduct: any;

	uom: any[] = []
	uomFiltered: any[] = []

	documents: any[] = []
	documentsReturn: any[] = []
	selectedDocument: any
	selectedDocumentReturn: any

	isPreviewPdf: boolean = false;

	selection = new SelectionModel<StockProductModel>(true, []);
	selectionTax = new SelectionModel<TaxModel>(true, []);
	selectionQuo = new SelectionModel<QuotationModel>(true, []);
	selectionVendor = new SelectionModel<VendorModel>(true, []);

	dataSource: any = new BehaviorSubject([]);
	@ViewChild('myTable', { static: false }) table: MatTable<any>;
	@ViewChild('documentInput', { static: false }) documentInputEl: ElementRef;
	displayedColumns = ["product_brand", "qty","in", "return","uom", "price", "in_price"];

	private subscriptions: Subscription[] = [];
  	constructor(
		private activatedRoute: ActivatedRoute,
		private router: Router,
    	private dialog: MatDialog,
		private poReceiptFB: FormBuilder,
		private serviceQuo: QuotationService,
		private cd: ChangeDetectorRef,
		private subheaderService: SubheaderService,
		private layoutUtilsService: LayoutUtilsService,
		private store: Store<AppState>,
		private service: PoReceiptService,
		private serviceTax: TaxService,
		private serviceVendor: VendorService,
		private servicePR: PurchaseRequestService,
		private serviceUom: UomService,
		private layoutConfigService: LayoutConfigService,
		private serviceProduct: ProductBrandService,
		private servicePO: PurchaseOrderService,
	) { }

  	ngOnInit() {
		this.loading$ = this.store.pipe(select(selectPoReceiptActionLoading));
		
		const routeSubscription =  this.activatedRoute.params.subscribe(params => {
			const id = params.id;
			
			this.store.pipe(select(selectPoReceiptById(id))).subscribe(res => {
				if(res){
					this.poReceipt = res
					this.initpoReceipt();
				}
			})
			// this.poReceipt = new PoReceiptModel();
			// this.poReceipt.clear();

		});
		this.subscriptions.push(routeSubscription);
  	}

	initpoReceipt() {
		this.createForm();
		this.loadPO();
		// this.loadQuo();
		// this.loadTax();
		// this.loadAllProductList();
		// this.loadVendor();
		// this.loadUom();
		this.getNumber();

	}

	createForm() {
		this.poReceiptForm = this.poReceiptFB.group({
			// product_name: [undefined, Validators.required],
			
			receipt_number: [{value: this.poReceipt.receipt_number, disabled: true}, Validators.required],
			po_no: [{value: this.poReceipt.po.po_no, disabled: true}, Validators.required],
			po: [{value: undefined, disabled: true}, Validators.required],
			type_receipt: [{value: this.poReceipt.type_receipt, disabled: true}, Validators.required],
			status: [{value: this.poReceipt.status, disabled: true}, Validators.required],
			DO_number: [{value: this.poReceipt.DO_number, disabled: true}, Validators.required],
			courier_name: [{value: this.poReceipt.courier_name, disabled: true}, Validators.required],
			description: [{value: this.poReceipt.description, disabled: true}, Validators.required],
			vendorAddress: [{value: this.poReceipt.po.vendor_name.address, disabled: true}, Validators.required],
			vendor: [{value: this.poReceipt.po.vendor_name.vendor_name, disabled: true}, Validators.required],
			type_po: [{value: this.poReceipt.type_po, disabled: true}, Validators.required],

			products: this.poReceiptFB.array(this.poReceipt.product.map(el => this.poReceiptFB.group(
				{
					product: new FormControl(el.product._id),
					productName: new FormControl(el.product.brand_name),
					price: new FormControl(el.price),
					subTotal: new FormControl(el.subTotal),
					qty: new FormControl(el.qty),
					uom: new FormControl(el.uom._id),
					uomName: new FormControl(el.uom.uom),
					in_qty: new FormControl(el.in_qty),
					return_qty: new FormControl(el.return_qty),
					in_price: new FormControl(el.in_price)
				}
			)))

		});
		this.productList = (this.poReceiptForm.get('products') as FormArray).controls

		this.documents = this.loadDocumentUrl("attachmentDO")
		this.documentsReturn = this.loadDocumentUrl("attachmentReturn")

	}
	goBackWithId() {
		const url = `/poReceipt`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}
	refreshpoReceipt(isNew: boolean = false, id:string = "") {
		let url = this.router.url;
		if (!isNew) {
			this.router.navigate([url], { relativeTo: this.activatedRoute });
			return;
		}
		url = `/poReceipt/edit/${id}`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}

	loadDocumentUrl(doc) {
		let fileType = this.poReceipt[doc].split(".").pop();
			if (fileType == "pdf") {
				this.isPreviewPdf = true;
			}
		let fileName = this.poReceipt[doc].split("/").pop()
		return [{ name: fileName, url: this.poReceipt[doc] }]
	}

	// Product load

	getNumber(){
		this.loadingGenerate = true
		const controls = this.poReceiptForm.controls;
		//this.service.generatePRCode().subscribe(
		this.service.generatePORCode().subscribe(
			res => {
				// console.log(res.data);
				if (!this.poReceipt._id) {
					controls.receipt_number.setValue(res.data)
				}
				this.loadingGenerate = false;
			}
		)
	}

	loadUom() {
		const queryParams = new QueryUomModel(
			null,
			'asc',
			'',
			1,
			10000
		);
		const addSubscription = this.serviceUom.getListUom(queryParams).subscribe(res => {
			this.uom = res.data
			this.uomFiltered = res.data
		})
	}

	loadQuo(){
		this.loadingQuo = true;
		this.selectionQuo.clear();
		const queryParams = new QueryQuotationModel(
			null,
			1,
			10000
		);
		if (this.poReceipt._id) {
			this.serviceQuo.getListQuotation(queryParams).subscribe(
				res => {
					// console.log(res);
					this.quoResult = res.data;
					this.loadingQuo = false;
					this.cd.markForCheck();
				}
			);
		} else {
		this.serviceQuo.getListSelQuotation(queryParams).subscribe(
			res => {
				// console.log(res);
				this.quoResult = res.data;
				this.loadingQuo = false
				this.cd.markForCheck();
				}
			);
		}
	}

	loadTax(){
				this.loadingTax = true;
				this.selectionTax.clear();
		const queryParams = new QueryTaxModel(
			null,
			1,
			10000
		);
		this.serviceTax.getListTax(queryParams).subscribe(
			res => {
				this.TaxResult = res.data;
				this.loadingTax = false;
				this.cd.markForCheck();
			}
		);
	}

	loadVendor(){
		this.loadingVendor = true;
		this.selectionVendor.clear();
		const queryParams = new QueryVendorModel(
			null,
			1,
			10000
		);
		this.serviceVendor.getListVendor(queryParams).subscribe(
			res => {

				this.VendorResult = res.data;
				this.VendorResultFiltered = res.data;
				
				this.loadingVendor = false;
				this.cd.markForCheck();
			}
		);
	}

	onSubmit(withBack: boolean = false) {
		this.hasFormErrors = false;
		const controls = this.poReceiptForm.controls;
		//console.log(controls);
		if (this.poReceiptForm.invalid) {
			Object.keys(controls).forEach(controlName =>
				controls[controlName].markAsTouched()
			);

			this.hasFormErrors = true;
			this.selectedTab = 0;
			return;
		}

		this.loading = true;
		const editedpoReceipt = this.preparepoReceipt();

		// if (this.poReceipt._id) {
		// 	this.updatepoReceipt(editedpoReceipt, withBack);
		// 	return;
		// }
		console.log(editedpoReceipt, 'edit')
		this.addpoReceipt(editedpoReceipt, withBack);
	}

	vendorchange(value){
		// console.log(value, "id vendor");

		this.poReceiptForm.controls.vendor_id.setValue(value)

		this.selectionVendor.clear();
		this.serviceVendor.findVendorById(value._id).subscribe(
			res => {
				// console.log(res, "data vendor id");
				let data = res.data;
				if (this.poReceipt._id) {
					this.poReceiptForm.controls.vendor_name.setValue(data._id)

				}
				//set product available for that vendor

				this.products = res.data.products
				this.ProductResultFiltered = res.data.products

				//if product from PR
				if(this.poReceiptForm.controls.typePO.value === "purchase_request"){
					this.products = this.products.filter(productVendor => this.productsListFromPO.some(productPR => productVendor._id === productPR._id ) );
					this.ProductResultFiltered = this.products
					let productsArray = this.poReceiptForm.controls['products'] as FormArray

					//remove old value
					while (productsArray.length !== 0) {
						productsArray.removeAt(0)
					  }

					this.productsListFromPO.map(el =>
						{
							//determine if product is available from vendor
							let isAvailable = this.products.some(productVendor => productVendor._id === el._id)

							productsArray.push(this.poReceiptFB.group({
								product: new FormControl(el._id),
								productName: new FormControl(el.product_name),
								price: new FormControl(el.price),
								qty: new FormControl(el.qty),
								subTotal: new FormControl(el.subTotal),
								uom: new FormControl(el.uom),
								uomName: new FormControl(el.uom2),
								isNotAvailable: new FormControl(!isAvailable)
							})
							)
						} 
					)
					this.productList = (this.poReceiptForm.get('products') as FormArray).controls

					this.table.renderRows();
					// this.productList
				}

				this.poReceiptForm.controls.vendorAddress.setValue(data.address)
			// this.changePOTotal()
			}
		);
	}

	taxchange(value){
		//console.log(value, "id tax");
		const controls = this.poReceiptForm.controls;

		this.selectionTax.clear();
		this.serviceTax.findTaxById(value).subscribe(
			res => {
				//console.log(res, "data tax id");
				//console.log(this.poReceipt._id);
				let data = res.data;
				controls.tax.setValue(data._id);
				// if (this.poReceipt._id) {
				// 	this.poReceiptForm.controls.tax.setValue(data._id)
				// }
				this.changePOTotal()
			}
		);
	}

	preparepoReceipt() {
		try{

		const controls = this.poReceiptForm.controls;
		const form = new FormData()
		// const _poReceipt = new PoReceiptModel();
		
		console.log(controls, 'controls')

		form.append("po", (controls.po.value)._id)
		form.append("receipt_number", controls.receipt_number.value)
		form.append("product", JSON.stringify(this.poReceiptForm.value.products))
		form.append("type_receipt", controls.type_receipt.value)
		form.append("type_po", controls.type_po.value)
		form.append("status", "on progress")
		form.append("DO_number", controls.DO_number.value)
		form.append("courier_name", controls.courier_name.value)
		
		if(this.selectedDocument){
			form.append("attachmentDO", this.selectedDocument[0])
		}

		if(this.selectedDocumentReturn){
			form.append("attachmentReturn", this.selectedDocumentReturn[0])
		}

		form.append("description", controls.description.value)
		form.append("vendorAddress", (controls.vendorAddress.value))

		return form;
		}
		catch(e){
			console.log(e, 'error')
		}
	}

	addpoReceipt( _poReceipt, withBack: boolean = false) {
		const addSubscription = this.service.createPoReceipt(_poReceipt).subscribe(
			res => {
				const message = `New PO Receipt successfully has been added.`;
				this.layoutUtilsService.showActionNotification(message, MessageType.Create, 5000, true, true);
				const url = `/POReceipt`;
				this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
			},
			err => {
				console.error(err);
				const message = 'Error while adding PO Receipt | ' + err.statusText;
				this.layoutUtilsService.showActionNotification(message, MessageType.Create, 5000, true, false);
			}
		);
		this.subscriptions.push(addSubscription);
	}

	// updatepoReceipt(_poReceipt, withBack: boolean = false) {
	// 	const addSubscription = this.service.updatePoReceipt(_poReceipt).subscribe(
	// 		res => {
	// 			const message = `Purchase order successfully has been saved.`;
	// 			this.layoutUtilsService.showActionNotification(message, MessageType.Update, 5000, true, true);
	// 			const url = `/POReceipt`;
	// 			this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	// 		},
	// 		err => {
	// 			console.error(err);
	// 			const message = 'Error while adding purchase order | ' + err.statusText;
	// 			this.layoutUtilsService.showActionNotification(message, MessageType.Update, 5000, true, false);
	// 		}
	// 	);
	// 	this.subscriptions.push(addSubscription);
	// }

	poonChange(value){

		let controls = this.poReceiptForm.controls
		let data
		//get PO by Id
		controls.po.setValue(value)
		this.servicePO.findPurchaseOrderById(value._id).subscribe(res => {
			this.productsListFromPO = res.data.product_name
			data = res.data
			let productsArray = this.poReceiptForm.controls['products'] as FormArray
		
			//set vendor
			controls.vendor.setValue(data.vendor_name.vendor_name)
			controls.vendorAddress.setValue(data.vendor_name.address)

			//set type po
			controls.type_po.setValue(data.type_po)

			//set product list
			//remove old value
			while (productsArray.length !== 0) {
				productsArray.removeAt(0)
			}

			console.log(controls, 'first')
					
			//iterate thourh all product
			data.product.map(el =>
				{
					productsArray.push(this.poReceiptFB.group({
						product: new FormControl(el.product._id),
						productName: new FormControl(el.product.brand_name),
						price: new FormControl(el.price),
						subTotal: new FormControl(el.subTotal),
						qty: new FormControl(el.qty),
						uom: new FormControl(el.uom._id),
						uomName: new FormControl(el.uom.uom),
						in_qty: new FormControl(),
						return_qty: new FormControl(),
						in_price: new FormControl()
					})
					)
				} 
			)
			this.productList = (this.poReceiptForm.get('products') as FormArray).controls

			this.cd.markForCheck()

			//render table
			this.table.renderRows();
			
		})
	}

	loadProductList(value) {
		const controls = this.poReceiptForm.controls;
		this.loadingProduct = true;
		this.dataSource.next(value);
		this.productList
		controls.product_name.setValue(this.dataSource.value)
		// console.log(value.product_name);
		//this.changePOTotal()

		this.loadingProduct = false;
	}

	loadAllProductList() {
		const queryParams = new QueryQuotationModel(
			null,
			1,
			10000
		);
		const addSubscription = this.serviceProduct.getListProductBrand(queryParams).subscribe(res => {
			this.loadingProduct = true
			this.products = res.data

			this.ProductResultFiltered = res.data
			this.loadingProduct = false

		})
	}

	// decrease stock by id
	decStock(_id){
		// console.log(this.dataSource);
		const controls = this.poReceiptForm.controls
		let data = this.dataSource.getValue();
		// console.log(_id);
		let index = data.findIndex((item) => item._id == _id)
		// console.log(data);
		// console.log(index);
		if (data[index].qty > 1) {
			data[index].qty -= 1
		}
		data[index].subtotal = data[index].buy_price * data[index].qty
		if (data[index].typediscount == "pr") {
			// console.log(data[index].subtotal);
			// console.log(data[index].discount);

			let persen = (data[index].subtotal * data[index].discount) / 100;
			// console.log(persen);
			data[index].after_discount = data[index].subtotal - persen
		} else {
			data[index].after_discount = data[index].subtotal - data[index].discount
		}



		// if (data[index].qty > 1) {
		// 	data[index].qty -= 1
		// }
		this.dataSource.next(data)
		controls.product_name.setValue(data)
		this.changePOTotal()
	}

	// increase qty by id
	intStock(_id, qty){
		// console.log(_id);
		const controls = this.poReceiptForm.controls
		const data = this.dataSource.value;
		let index = data.findIndex((item) => item._id == _id)
		// console.log(data);
		// console.log(index);
		// console.log(qty, "qty datal indet");

		if (qty !== undefined && qty > 0) {
			data[index].qty = data[index].qty + qty
		} else {
			data[index].qty += 1
		}
		data[index].subtotal = data[index].buy_price * data[index].qty
		if (data[index].typediscount == "pr") {
			// console.log(data[index].subtotal);
			// console.log(data[index].discount);

			let persen = (data[index].subtotal * data[index].discount) / 100;
			// console.log(persen);
			data[index].after_discount = data[index].subtotal - persen
		} else {
			data[index].after_discount = data[index].subtotal - data[index].discount
		}
		this.dataSource.next(data)
		controls.product_name.setValue(data)
		this.cd.markForCheck()
		this.changePOTotal()
	}

	deleteProduct(_id){
		const controls = this.poReceiptForm.controls
		let data = this.dataSource.value;
		let index = data.findIndex((item) => item._id == _id)
		let removed = data.splice(index, index + 1)
		// console.log(removed);
		controls.product_name.setValue(data)
		this.dataSource.next(data)
		this.changePOTotal()
	}

	changePOTotal(){
		const controls = this.poReceiptForm.controls
		let data = this.dataSource.value
		//console.log(data, "rhn3");
		if (data.length > 0) {
			let prices = data.map((item) => item.after_discount).reduce((a, b) => parseInt(a) + parseInt(b))
			//let prices = data.map((item) => item.after_discount).reduce((a, b) => console.log(a) + console.log(b))
			controls.total.setValue(prices)
			//console.log(prices, "price po total");
			this.changeTotal()
		}
		// else {
		// 	const message = `Product list has not been updated`;
		// 	this.layoutUtilsService.showActionNotification(message, MessageType.Update, 5000, true, true);
		// }
	}

	inputKeydownHandler(event) {
		return event.keyCode === 8 || event.keyCode === 46 ? true : !isNaN(Number(event.key));
	}

	changeTotal(){
		const controls = this.poReceiptForm.controls
		let tax = 0
		let taxamount = 0
		this.selectionTax.clear();
		if (controls.tax.value != "") {
			this.serviceTax.findTaxById(controls.tax.value).subscribe(
			res => {
				// console.log(res, "purchase request");
				let data = res.data
				tax = data.nominal
				// console.log(tax);
				this.cd.markForCheck()


			// console.log(tax, "tax");

			let total = 0;
			let totalamount = 0;
			if (controls.type_discount.value == "pr") {
				let persen = controls.total.value * controls.discount.value / 100
				total = controls.total.value - persen;
				taxamount = ((total * tax) / 100)
				totalamount = total + taxamount

				// console.log(taxamount, "taxamount");
				//console.log(totalamount, "total amount1");
				controls.grand_total.setValue(totalamount)
			} else {
				total = controls.total.value - controls.discount.value
				taxamount = ((total * tax) / 100)
				totalamount = total + taxamount
				// console.log(taxamount, "taxamount");
				//console.log(totalamount, "total amount2");
				controls.grand_total.setValue(totalamount)
			}
		}
		)}
		else
		{
			let total = 0;
			let totalamount = 0;
			if (controls.type_discount.value == "pr") {
				let persen = controls.total.value * controls.discount.value / 100
				total = controls.total.value - persen;
				taxamount = ((total * tax) / 100)
				totalamount = total + taxamount

				// console.log(taxamount, "taxamount");
				//console.log(totalamount, "total amount1");
				controls.grand_total.setValue(totalamount)
			} else {
				total = controls.total.value - controls.discount.value
				taxamount = ((total * tax) / 100)
				totalamount = total + taxamount
				// console.log(taxamount, "taxamount");
				//console.log(totalamount, "total amount2");
				controls.grand_total.setValue(totalamount)
			}
		}


	}

	// changeTotal(){
	// 	const controls = this.poReceiptForm.controls
	// 	let total;
	// 	if (controls.type_discount.value == "pr") {
	// 		let persen = controls.total.value * controls.discount.value / 100
	// 		total = controls.total.value - persen;
			// console.log(total, persen);

	// 		controls.grand_total.setValue(total)
	// 	} else {
	// 		total = controls.total.value - controls.discount.value
	// 		controls.grand_total.setValue(total)
	// 	}
	// }

	// editProduct(_id) {
	// 	let data = this.dataSource.value;
	// 	let dataExist = data.find((item) => item._id == _id)
	// 	let index = data.findIndex((item) => item._id == _id)
	// 	// let dataExist = data.find((item) => item.product_code == product_code)
	// 	if (dataExist && index >= 0) {
	// 		const dialogRef = this.dialog.open(PopupEditPoReceipt, {
	// 			data: dataExist,
	// 			maxWidth: '500px',
	// 			minHeight: '300px'
	// 		});
	// 		dialogRef.afterClosed().subscribe(result => {
	// 	if (result !== undefined) {
	// 		this.loadingProduct = true;
	// 		const controls = this.poReceiptForm.controls;
	// 			// console.log(result.data, "data edited");
	// 			data[index] = result.data;
	// 			// console.log(data);
	// 			this.dataSource.next(data);
	// 			controls.product_name.setValue(data)
	// 			this.changePOTotal()
	// 			this.loadingProduct = false;
	// 			this.cd.markForCheck()
	// 			}
	// 		})
	// 	}

	// }

	// viewProduct(_id){
	// 	// console.log(_id);

	// 	let data = this.dataSource.value;
	// 	let dataExist = data.find((item) => item._id == _id)
	// 	if (dataExist) {

	// 		const dialogRef = this.dialog.open(PopupViewPoReceipt, {
	// 			data: dataExist,
	// 			maxWidth: '500px',
	// 			minHeight: '300px'
	// 		});
	// 	}
	// }


	getComponentTitle() {
		let result = 'View PO Receipt';
		return result;
	}

	onAlertClose($event) {
		this.hasFormErrors = false;
	}

  	ngOnDestroy() {
		this.subscriptions.forEach(sb => sb.unsubscribe());
	}

	loadPO(){
		const queryParams = new QueryQuotationModel(
			null,
			1,
			10000
		);
		
		this.servicePO.getListPOCode(queryParams).subscribe(res => {
			this.loadingPO = true
			this.POResult = res.data
			this.POResultFiltered = res.data
			this.loadingPO = false
		})
	}

	filterPO(e) {
		this.POResultFiltered = this.POResult.filter(item => item.po_no.includes(e.target.value))
	}

	filterVendor(e) {
		this.VendorResultFiltered = this.VendorResult.filter(item => item.vendor_name.includes(e.target.value))
	}

	filterProduct(e) {
		this.ProductResultFiltered = this.products.filter(item => item.brand_name.includes(e.target.value))
	}
	filterUom(e) {
		this.uomFiltered = this.uom.filter(item => item.uom.includes(e.target.value))
	}

	addProductToList(id){
		let productsArray = this.poReceiptForm.controls['products'] as FormArray
		productsArray.push(this.poReceiptFB.group({
			product: new FormControl(),
			productName: new FormControl(),
			price: new FormControl(),
			qty: new FormControl(),
			subTotal: new FormControl(),
			uom: new FormControl(),
			uomName: new FormControl(),
			isNotAvailable: new FormControl()
		})
		)

		this.cd.markForCheck()
		this.productList = (this.poReceiptForm.get('products') as FormArray).controls
		this.table.dataSource= this.productList
		this.table.renderRows();
	}

	removeProductFromList(id) {
		let productsArray = this.poReceiptForm.controls['products'] as FormArray
		productsArray.removeAt(id)
		this.productList = (this.poReceiptForm.get('products') as FormArray).controls

		this.cd.markForCheck()
		
		this.table.dataSource= this.productList
		this.table.renderRows();

	}

	onChangeProduct(e, id, prop) {
		let valueTarget
		let productsArray = this.poReceiptForm.controls['products'] as FormArray
		if(prop === 'product') valueTarget = {
			product: e._id,
			productName: e.brand_name
		}
		else if(prop === 'uom') valueTarget = {
			uom: e._id,
			uomName: e.uom
		}
		else valueTarget = {
			[prop]: e.target.value
		}
		// if(prop === 'product' || prop === 'uom') this.productList[id][prop] = e
		// else this.productList[id][prop] = e.target.value
		this.cd.markForCheck()

		productsArray.at(id).patchValue(valueTarget)
		this.productList = (this.poReceiptForm.get('products') as FormArray).controls

		this.calculateGrandTotal()
	}

	typeReceiptChange(value) {
		const control = this.poReceiptForm.controls
		let productsArray = this.poReceiptForm.controls['products'] as FormArray

		console.log(control)
		// control.type_receipt.setValue(value)
		if(control.type_po.value === "in" && control.type_receipt.value === "1"){
			productsArray.controls.forEach((el, id) => {
				if(el instanceof FormGroup){
					el.controls.in_qty.setValue(el.value.qty)
					el.controls.return_qty.setValue(0)
				}
			});
		}
		else if(control.type_po.value === "return" && control.type_receipt.value === "1"){
			productsArray.controls.forEach((el, id) => {
				if(el instanceof FormGroup){
					el.controls.return_qty.setValue(el.value.qty)
					el.controls.in_qty.setValue(0)

					//disable form in qty
					el.controls.in_qty.disable()
				}
			});
		}

		else {
			productsArray.controls.forEach((el, id) => {
				if(el instanceof FormGroup){
					//enable form in qty
					el.controls.in_qty.enable()
				}
			});
		}

	}

	typePOChange(value) {
		const control = this.poReceiptForm.controls
		let productsArray = this.poReceiptForm.controls['products'] as FormArray

		console.log(control)
		// control.type_po.setValue(value)
		if(control.type_po.value === "in" && control.type_receipt.value === "1"){
			productsArray.controls.forEach((el, id) => {
				if(el instanceof FormGroup){
					el.controls.in_qty.setValue(el.value.qty)
					el.controls.return_qty.setValue(0)
				}
			});
		}
		else if(control.type_po.value === "return" && control.type_receipt.value === "1"){
			productsArray.controls.forEach((el, id) => {
				if(el instanceof FormGroup){
					el.controls.return_qty.setValue(el.value.qty)
					el.controls.in_qty.setValue(0)

					//disable form in qty
					el.controls.in_qty.disable()
				}
			});
		}

		else {
			productsArray.controls.forEach((el, id) => {
				if(el instanceof FormGroup){
					//enable form in qty
					el.controls.in_qty.enable()
				}
			});
		}
		
	}

	selectDocument(e) {
		this.cd.markForCheck()
		const files = (e.target as HTMLInputElement).files;
		this.selectedDocument = files
		for (let i = 0; i < files.length; i++) {
			// Skip uploading if file is already selected
			const alreadyIn = this.documents.filter(tFile => tFile.name === files[i].name).length > 0;
			if (alreadyIn) continue;

			this.documents.push(files[i]);
			let fileType = files[i].name.split(".").pop();
			if (fileType == "pdf") {
				this.isPreviewPdf = true;
			}
			else {
				this.isPreviewPdf = false
			}
			const reader = new FileReader();
			reader.onload = () => {
				this.documents = [{ name: files[i].name, url: reader.result }];
				this.cd.markForCheck();
			}
			reader.readAsDataURL(files[i]);
		}
		

	}

	removeSelectedDocument(item) {
		this.documents = this.documents.filter(i => i.name !== item.name);
		this.documents = this.documents.filter(i => i.url !== item.url);
		this.documentInputEl.nativeElement.value = "";
		this.selectedDocument = undefined;

		this.cd.markForCheck();
	}

	selectDocumentReturn(e) {
		this.cd.markForCheck()
		const files = (e.target as HTMLInputElement).files;
		this.selectedDocumentReturn = files
		for (let i = 0; i < files.length; i++) {
			// Skip uploading if file is already selected
			const alreadyIn = this.documentsReturn.filter(tFile => tFile.name === files[i].name).length > 0;
			if (alreadyIn) continue;

			this.documentsReturn.push(files[i]);
			let fileType = files[i].name.split(".").pop();
			if (fileType == "pdf") {
				this.isPreviewPdf = true;
			}
			else {
				this.isPreviewPdf = false
			}
			const reader = new FileReader();
			reader.onload = () => {
				this.documentsReturn = [{ name: files[i].name, url: reader.result }];
				this.cd.markForCheck();
			}
			reader.readAsDataURL(files[i]);
		}
		

	}

	removeSelectedDocumentReturn(item) {
		this.documentsReturn = this.documentsReturn.filter(i => i.name !== item.name);
		this.documentsReturn = this.documentsReturn.filter(i => i.url !== item.url);
		this.documentInputEl.nativeElement.value = "";
		this.selectedDocumentReturn = undefined;

		this.cd.markForCheck();
	}

	calculateGrandTotal() {
		let control = this.poReceiptForm.controls
		let tPrice = this.calculateTotalPrice()
		let temp
		
		if(control.discountType.value === 'fixed'){
			temp = tPrice - parseInt(control.discountValue.value)
		}

		if(control.discountType.value === 'percentage'){
			temp = ((100 - parseInt(control.discountValue.value))  * tPrice)/100
		}
		
		temp = temp + parseInt(control.ppn.value) - parseInt(control.pph.value) + parseInt(control.shippingCost.value)

		control.grandTotal.setValue(temp)

	}

	calculateTotalPrice() {
		let temp = 0
		let productsArray = this.poReceiptForm.controls['products'] as FormArray

		productsArray.value.map(product => {
			temp = temp + parseInt(product.subTotal)
		})

		return temp
	}

	changeDiscountType(value) {
		let control = this.poReceiptForm.controls

		control.discountType.setValue(value)
	}

	changeTermPeriod(value) {
		let control = this.poReceiptForm.controls

		control.termPeriod.setValue(value)
	}

}
