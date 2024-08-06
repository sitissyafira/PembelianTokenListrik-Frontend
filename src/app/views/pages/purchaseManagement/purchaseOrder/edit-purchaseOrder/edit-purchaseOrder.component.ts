import {ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild, ElementRef} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { Store, select } from '@ngrx/store';
import { AppState } from '../../../../../core/reducers';
import { SubheaderService, LayoutConfigService } from '../../../../../core/_base/layout';
import { LayoutUtilsService, MessageType } from '../../../../../core/_base/crud';
import {PurchaseOrderModel} from "../../../../../core/purchaseManagement/purchaseOrder/purchaseOrder.model";
import {
	selectPurchaseOrderActionLoading,
	selectPurchaseOrderById
} from "../../../../../core/purchaseManagement/purchaseOrder/purchaseOrder.selector";
import {PurchaseOrderService} from '../../../../../core/purchaseManagement/purchaseOrder/purchaseOrder.service';
import { SelectionModel } from '@angular/cdk/collections';
import { StockProductModel } from '../../../../../core/inventorymanagement/stockProduct/stockProduct.model';
import { MatDialog } from '@angular/material/dialog';
import { QueryQuotationModel } from '../../../../../core/purchaseManagement/quotation/queryquotation.model';
import { QuotationService } from '../../../../../core/purchaseManagement/quotation/quotation.service';
import { PopupViewPurchaseOrder } from '../popup-view-purchaseOrder/popup-view-purchaseOrder.component';
import { PopupEditPurchaseOrder } from '../popup-edit-purchaseOrder/popup-edit-purchaseOrder.component';
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

@Component({
  selector: 'kt-edit-purchaseOrder',
  templateUrl: './edit-purchaseOrder.component.html',
  styleUrls: ['./edit-purchaseOrder.component.scss']
})
export class EditpurchaseOrderComponent implements OnInit, OnDestroy {
	datauser = localStorage.getItem("user");
	purchaseOrder: PurchaseOrderModel;
	purchaseOrderId$: Observable<string>;
	oldpurchaseOrder: PurchaseOrderModel;
	selectedTab = 0;
	loading$: Observable<boolean>;
	purchaseOrderForm: FormGroup;
	hasFormErrors = false;
	loading : boolean = false;
	loadingTax : boolean = false;
	loadingVendor : boolean = false;
	loadingQuo : boolean = false;
	loadingPR : boolean = false;
	loadingProduct : boolean = false;
	quoResult: any[] = []
	TaxResult: any[] = []
	PRResult: any[] = []
	PRResultFiltered: any[] = []
	typePOList: any[] = [
		{
			type_value: "purchase_request",
			type_label: "Purchase Request"
		},
		{
			type_value: "manual",
			type_label: "Manual"
		},
	]
	discountOptions: any[] = [
		{
			type_value: "fixed",
			type_label: "Fixed"
		},
		{
			type_value: "percentage",
			type_label: "Percentage"
		},
	]
	termOptions: any[] = [
		{
			type_value: "month",
			type_label: "Bulan"
		},
		{
			type_value: "day",
			type_label: "Hari"
		},
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

	productsListFromPR: any[] = []
	products: any[] = []
	ProductResultFiltered: any[] = []

	uom: any[] = []
	uomFiltered: any[] = []

	documents: any[] = []
	selectedDocument: any

	isPreviewPdf: boolean = false;

	selection = new SelectionModel<StockProductModel>(true, []);
	selectionTax = new SelectionModel<TaxModel>(true, []);
	selectionQuo = new SelectionModel<QuotationModel>(true, []);
	selectionVendor = new SelectionModel<VendorModel>(true, []);

	dataSource: any = new BehaviorSubject([]);
	@ViewChild('myTable', { static: false }) table: MatTable<any>;
	@ViewChild('documentInput', { static: false }) documentInputEl: ElementRef;
	displayedColumns = ["product_brand", "qty","uom", "price", "subTotal", "actions"];

	private subscriptions: Subscription[] = [];
  	constructor(
		private activatedRoute: ActivatedRoute,
		private router: Router,
    	private dialog: MatDialog,
		private purchaseOrderFB: FormBuilder,
		private serviceQuo: QuotationService,
		private cd: ChangeDetectorRef,
		private subheaderService: SubheaderService,
		private layoutUtilsService: LayoutUtilsService,
		private store: Store<AppState>,
		private service: PurchaseOrderService,
		private serviceTax: TaxService,
		private serviceVendor: VendorService,
		private servicePR: PurchaseRequestService,
		private serviceUom: UomService,
		private layoutConfigService: LayoutConfigService,
		private serviceProduct: ProductBrandService,
	) { }

  	ngOnInit() {
		this.loading$ = this.store.pipe(select(selectPurchaseOrderActionLoading));
		const routeSubscription =  this.activatedRoute.params.subscribe(params => {
			const id = params.id;
			this.store.pipe(select(selectPurchaseOrderById(id))).subscribe(res => {
				if(res){
					this.purchaseOrder = res
					this.initpurchaseOrder();
				}
			})
			// this.purchaseOrder = new PurchaseOrderModel();
			// this.purchaseOrder.clear();

		});
		this.subscriptions.push(routeSubscription);
  	}

	initpurchaseOrder() {
		this.createForm();
		this.loadPR();
		// this.loadQuo();
		// this.loadTax();
		// this.loadAllProductList();
		this.loadVendor();
		this.loadUom();
		// this.getNumber();

	}

	createForm() {
		console.log(this.purchaseOrder, 'po')
		this.purchaseOrderForm = this.purchaseOrderFB.group({
			// product_name: [undefined, Validators.required],
			
			// isApproved: [""],
			
			// created_by: [{value:this.datauser, disabled:true}, Validators.required],
			
			date: [{value: this.purchaseOrder.date, disabled: false}, Validators.required],
			typePO: [{value: this.purchaseOrder.type_po, disabled: false}, Validators.required],
			po_no: [{value: this.purchaseOrder.po_no, disabled: true}, Validators.required],
			pr: [{value: this.purchaseOrder.pr, disabled: false}],
			pr_name: [{value: this.purchaseOrder.pr.purchase_request_no, disabled: false}],
			vendor_id: [{value: this.purchaseOrder.vendor_name, disabled: false}],
			vendor_name: [{value: this.purchaseOrder.vendor_name.vendor_name, disabled: false}, Validators.required],
			vendorAddress: [{value: this.purchaseOrder.vendor_name.address, disabled: true}, Validators.required],
			vendorDesc: [{value: this.purchaseOrder.vendor_name.description, disabled: true}, Validators.required],
			grandTotal: [{value: this.purchaseOrder.grand_total, disabled:true}, Validators.required],
			discountValue: [{value: this.purchaseOrder.payment.discountValue, disabled: false}, Validators.required],
			shippingCost: [{value: this.purchaseOrder.payment.shippingCost, disabled: false}, Validators.required],
			pph: [{value: this.purchaseOrder.payment.pph, disabled: false}, Validators.required],
			ppn: [{value: this.purchaseOrder.payment.ppn, disabled: false}, Validators.required],
			note: [{value: this.purchaseOrder.note, disabled: false}, Validators.required],
			term: [{value: this.purchaseOrder.term.term, disabled: false}, Validators.required],
			termPeriod: [{value: this.purchaseOrder.term.termPeriod, disabled: false}, Validators.required],
			discountType: [{value: this.purchaseOrder.payment.discountType, disabled: false}, Validators.required],
			products: this.purchaseOrderFB.array(this.purchaseOrder.product.map(el => this.purchaseOrderFB.group(
				{
					product: new FormControl(el.product.brand_name),
					price: new FormControl(el.price),
					qty: new FormControl(el.qty),
					subTotal: new FormControl(el.subTotal),
					uom: new FormControl(el.uom.uom),
				}
			)))
		});
		this.documents = this.loadDocumentUrl();
		this.productList = (this.purchaseOrderForm.get('products') as FormArray).controls

		console.log(this.productList, 'prolist')
		console.log(this.purchaseOrderForm.get('products'), 'products')

	}

	loadDocumentUrl() {
		let fileType = this.purchaseOrder.document.split(".").pop();
			if (fileType == "pdf") {
				this.isPreviewPdf = true;
			}
		let fileName = this.purchaseOrder.document.split("/").pop()
		return [{ name: fileName, url: this.purchaseOrder.document }]
	}

	goBackWithId() {
		const url = `/purchaseOrder`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}
	refreshpurchaseOrder(isNew: boolean = false, id:string = "") {
		let url = this.router.url;
		if (!isNew) {
			this.router.navigate([url], { relativeTo: this.activatedRoute });
			return;
		}
		url = `/purchaseOrder/edit/${id}`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}

	// Product load

	getNumber(){
		this.loadingGenerate = true
		const controls = this.purchaseOrderForm.controls;
		//this.service.generatePRCode().subscribe(
		this.service.generatePRCode().subscribe(
			res => {
				// console.log(res.data);
				if (!this.purchaseOrder._id) {
					this.po_no = res.data;
					controls.po_no.setValue(this.po_no)
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
		if (this.purchaseOrder._id) {
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
		const controls = this.purchaseOrderForm.controls;
		console.log(controls, 'con')
		//console.log(controls);
		if (this.purchaseOrderForm.invalid) {
			Object.keys(controls).forEach(controlName =>
				controls[controlName].markAsTouched()
			);

			this.hasFormErrors = true;
			this.selectedTab = 0;
			return;
		}

		this.loading = true;
		const editedpurchaseOrder = this.preparepurchaseOrder();

		console.log(editedpurchaseOrder, 'edit')

		if (this.purchaseOrder._id) {
			this.updatepurchaseOrder(editedpurchaseOrder, withBack);
			return;
		}
		this.addpurchaseOrder(editedpurchaseOrder, withBack);
	}

	vendorchange(value){
		// console.log(value, "id vendor");

		this.purchaseOrderForm.controls.vendor_id.setValue(value)

		this.selectionVendor.clear();
		this.serviceVendor.findVendorById(value._id).subscribe(
			res => {
				// console.log(res, "data vendor id");
				let data = res.data;
				if (this.purchaseOrder._id) {
					this.purchaseOrderForm.controls.vendor_name.setValue(data._id)

				}
				//set product available for that vendor

				this.products = res.data.products
				this.ProductResultFiltered = res.data.products

				//if product from PR
				if(this.purchaseOrderForm.controls.typePO.value === "purchase_request"){
					this.products = this.products.filter(productVendor => this.productsListFromPR.some(productPR => productVendor._id === productPR._id ) );
					this.ProductResultFiltered = this.products
				}

				this.purchaseOrderForm.controls.vendorDesc.setValue(data.description)
				this.purchaseOrderForm.controls.vendorAddress.setValue(data.address)
			// this.changePOTotal()
			}
		);
	}

	taxchange(value){
		//console.log(value, "id tax");
		const controls = this.purchaseOrderForm.controls;

		this.selectionTax.clear();
		this.serviceTax.findTaxById(value).subscribe(
			res => {
				//console.log(res, "data tax id");
				//console.log(this.purchaseOrder._id);
				let data = res.data;
				controls.tax.setValue(data._id);
				// if (this.purchaseOrder._id) {
				// 	this.purchaseOrderForm.controls.tax.setValue(data._id)
				// }
				this.changePOTotal()
			}
		);
	}

	preparepurchaseOrder() {
		try{

		const controls = this.purchaseOrderForm.controls;
		const form = new FormData()
		// const _purchaseOrder = new PurchaseOrderModel();
		let payment = {
			pph: controls.pph.value,
			ppn: controls.ppn.value,
			shippingCost: controls.shippingCost.value,
			discountType: controls.discountType.value,
			discountValue: controls.discountValue.value,
		}
		let term = {
			termPeriod: controls.termPeriod.value,
			term: controls.term.value,
		}


		form.append("po_no", controls.po_no.value)
		form.append("date", controls.date.value)
		form.append("grand_total", controls.grandTotal.value)
		form.append("note", controls.note.value)
		form.append("pr", (controls.pr.value)._id)
		form.append("payment", JSON.stringify(payment))
		form.append("term", JSON.stringify(term))
		form.append("type_po", controls.typePO.value)
		form.append("vendor_name", (controls.vendor_id.value)._id)
		form.append("product", JSON.stringify(this.productList))
		form.append("document", this.selectedDocument[0])

		console.log(this.selectedDocument, 'selected doc')
		
		// _purchaseOrder.clear();
		// _purchaseOrder._id = this.purchaseOrder._id;
		// _purchaseOrder.po_no = controls.po_no.value;
		// _purchaseOrder.date = controls.date.value
		
		// _purchaseOrder.grand_total = controls.grandTotal.value
		// _purchaseOrder.note = controls.note.value
		// _purchaseOrder.pr = controls.pr.value
		// _purchaseOrder.payment = {
		// 	pph: controls.pph.value,
		// 	ppn: controls.ppn.value,
		// 	shippingCost: controls.shippingCost.value,
		// 	discountType: controls.discountType.value,
		// 	discountValue: controls.discountValue.value,
		// }
		// _purchaseOrder.term = {
		// 	termPeriod: controls.termPeriod.value,
		// 	term: controls.term.value,
		// }
		// _purchaseOrder.type_po = controls.typePO.value;
		// _purchaseOrder.vendor_name = controls.vendor_id.value;
		// _purchaseOrder.product = this.productList;
		// _purchaseOrder.document = this.documents

		return form;
		}
		catch(e){
			console.log(e, 'error')
		}
	}

	addpurchaseOrder( _purchaseOrder, withBack: boolean = false) {
		const addSubscription = this.service.createPurchaseOrder(_purchaseOrder).subscribe(
			res => {
				const message = `New purchase order successfully has been added.`;
				this.layoutUtilsService.showActionNotification(message, MessageType.Create, 5000, true, true);
				const url = `/purchaseOrder`;
				this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
			},
			err => {
				console.error(err);
				const message = 'Error while adding purchase order | ' + err.statusText;
				this.layoutUtilsService.showActionNotification(message, MessageType.Create, 5000, true, false);
			}
		);
		this.subscriptions.push(addSubscription);
	}

	updatepurchaseOrder(_purchaseOrder, withBack: boolean = false) {
		const addSubscription = this.service.updatePurchaseOrder(_purchaseOrder).subscribe(
			res => {
				const message = `Purchase order successfully has been saved.`;
				this.layoutUtilsService.showActionNotification(message, MessageType.Update, 5000, true, true);
				const url = `/purchaseOrder`;
				this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
			},
			err => {
				console.error(err);
				const message = 'Error while adding purchase order | ' + err.statusText;
				this.layoutUtilsService.showActionNotification(message, MessageType.Update, 5000, true, false);
			}
		);
		this.subscriptions.push(addSubscription);
	}

	pronChange(value){


		// if(this.purchaseOrder._id){

		// }
		console.log(this.purchaseOrderForm.controls.pr.value, 'pr value')
		this.purchaseOrderForm.controls.pr.setValue(value)
		this.servicePR.findPurchaseRequestById(value._id).subscribe(res => {
			console.log(res)
			this.productsListFromPR = res.data.product_name
		})

		// console.log(value, "purchase request");
		// this.selectionQuo.clear();
		// //this.servicePR.findPurchaseRequestById(value).subscribe(
		// this.serviceQuo.findQuotationById(value).subscribe(
		// 	res => {
		// 		let data = res.data;
		// 		//console.log(data, "-Quotation");
		// 		// console.log(this.purchaseOrder.product_name, "purchase order product");
		// 		const controls = this.purchaseOrderForm.controls;

		// 		//this.quotation_no = data.quotation_no;
		// 		if (this.purchaseOrder._id) {
		// 			//console.log("rhn1");
		// 			//console.log(this.purchaseOrder);
		// 			//controls.quo.setValue(data._id)
		// 			controls.quo.setValue(this.purchaseOrder.quo)
		// 			this.vendorchange(this.purchaseOrder.vendor_name._id)
		// 			if (this.purchaseOrder.tax != null)
		// 				this.taxchange(this.purchaseOrder.tax._id);

		// 			controls.total.setValue(this.purchaseOrder.total);
		// 			controls.grand_total.setValue(this.purchaseOrder.grand_total);

		// 			//this.loadProductList(this.purchaseOrder)
		// 			this.loadProductList(this.purchaseOrder.product_name);
		// 		} else {
		// 			//console.log("rhn2");
		// 			//console.log(data);
		// 			//console.log(data.vendor_name._id);
		// 			//this.purchaseOrderForm.controls.quotation_no.setValue(data.quotation_no)
		// 			controls.quo.setValue(data._id)
		// 			controls.vendor_name.setValue(data.vendor_name._id)
		// 			if (data.tax != null)
		// 				this.taxchange(data.tax);
		// 			controls.total.setValue(data.total);
		// 			controls.type_discount.setValue(data.type_discount);
		// 			controls.discount.setValue(data.discount);
		// 			controls.grand_total.setValue(data.grand_total);
		// 			this.loadProductList(data.product_name);
		// 		}
		// 		//this.changePOTotal()
		// 	}
		// );

	}

	loadProductList(value) {
		const controls = this.purchaseOrderForm.controls;
		this.loadingProduct = true;
		this.dataSource.next(value);
		// this.productList
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
		const controls = this.purchaseOrderForm.controls
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
		const controls = this.purchaseOrderForm.controls
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
		const controls = this.purchaseOrderForm.controls
		let data = this.dataSource.value;
		let index = data.findIndex((item) => item._id == _id)
		let removed = data.splice(index, index + 1)
		// console.log(removed);
		controls.product_name.setValue(data)
		this.dataSource.next(data)
		this.changePOTotal()
	}

	changePOTotal(){
		const controls = this.purchaseOrderForm.controls
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
		const controls = this.purchaseOrderForm.controls
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
	// 	const controls = this.purchaseOrderForm.controls
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

	editProduct(_id) {
		let data = this.dataSource.value;
		let dataExist = data.find((item) => item._id == _id)
		let index = data.findIndex((item) => item._id == _id)
		// let dataExist = data.find((item) => item.product_code == product_code)
		if (dataExist && index >= 0) {
			const dialogRef = this.dialog.open(PopupEditPurchaseOrder, {
				data: dataExist,
				maxWidth: '500px',
				minHeight: '300px'
			});
			dialogRef.afterClosed().subscribe(result => {
		if (result !== undefined) {
			this.loadingProduct = true;
			const controls = this.purchaseOrderForm.controls;
				// console.log(result.data, "data edited");
				data[index] = result.data;
				// console.log(data);
				this.dataSource.next(data);
				controls.product_name.setValue(data)
				this.changePOTotal()
				this.loadingProduct = false;
				this.cd.markForCheck()
				}
			})
		}

	}

	viewProduct(_id){
		// console.log(_id);

		let data = this.dataSource.value;
		let dataExist = data.find((item) => item._id == _id)
		if (dataExist) {

			const dialogRef = this.dialog.open(PopupViewPurchaseOrder, {
				data: dataExist,
				maxWidth: '500px',
				minHeight: '300px'
			});
		}
	}


	getComponentTitle() {
		let result = 'Create Purchase Order';
		if (!this.purchaseOrder || !this.purchaseOrder._id) {
			return result;
		}

		result = `Edit Purchase Order`;
		return result;
	}

	onAlertClose($event) {
		this.hasFormErrors = false;
	}

  	ngOnDestroy() {
		this.subscriptions.forEach(sb => sb.unsubscribe());
	}

	loadPR(){
		const queryParams = new QueryQuotationModel(
			null,
			1,
			10000
		);
		
		this.servicePR.getListPOPurchaseRequest(queryParams).subscribe(res => {
			this.loadingPR = true
			this.PRResult = res.data
			this.PRResultFiltered = res.data
			this.loadingPR = false
		})
	}

	filterPR(e) {
		this.PRResultFiltered = this.PRResult.filter(item => item.purchase_request_no.includes(e.target.value))
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
		this.productList.push({
			qty: "",
			uom: {uom: ""},
			price: "",
			subTotal: "",
		})

		this.cd.markForCheck()
		
		this.table.dataSource= this.productList
		this.table.renderRows();
		console.log(this.productList, 'pro list')
	}

	removeProductFromList(id) {
		this.productList.splice(id, 1)

		this.cd.markForCheck()
		
		this.table.dataSource= this.productList
		this.table.renderRows();

	}

	onChangeProduct(e, id, prop) {
		if(prop === 'product' || prop === 'uom') this.productList[id][prop] = e
		else this.productList[id][prop] = e.target.value
		this.cd.markForCheck()

		this.calculateGrandTotal()
	}

	typePOChange(value) {
		const control = this.purchaseOrderForm.controls

		control.typePO.setValue(value)

		console.log(control.typePO.value)
		console.log(value)
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
			console.log(files[i].name, "file name")
			let fileType = files[i].name.split(".").pop();
			if (fileType == "pdf") {
				this.isPreviewPdf = true;
			}
			else {
				this.isPreviewPdf = false
			}
			const reader = new FileReader();
			reader.onload = () => {
				console.log(reader.result, 'result')
				console.log(reader, 'reader')
				this.documents = [{ name: files[i].name, url: reader.result }];
				this.cd.markForCheck();
			}
			reader.readAsDataURL(files[i]);
		}
		console.log(this.documents, 'doc')
		

	}

	removeSelectedDocument(item) {
		this.documents = this.documents.filter(i => i.name !== item.name);
		this.documents = this.documents.filter(i => i.url !== item.url);
		this.documentInputEl.nativeElement.value = "";

		this.cd.markForCheck();
	}

	calculateGrandTotal() {
		let control = this.purchaseOrderForm.controls
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

		this.productList.map(product => {
			temp = temp + parseInt(product.subTotal)
		})

		return temp
	}

	changeDiscountType(value) {
		let control = this.purchaseOrderForm.controls

		control.discountType.setValue(value)
	}

	changeTermPeriod(value) {
		let control = this.purchaseOrderForm.controls

		control.termPeriod.setValue(value)
	}

}
