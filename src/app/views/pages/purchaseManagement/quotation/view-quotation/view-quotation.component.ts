import {ChangeDetectorRef, Component, OnDestroy, OnInit} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { Store, select } from '@ngrx/store';
import { AppState } from '../../../../../core/reducers';
import { SubheaderService, LayoutConfigService } from '../../../../../core/_base/layout';
import { LayoutUtilsService, MessageType } from '../../../../../core/_base/crud';
import {QuotationModel} from "../../../../../core/purchaseManagement/quotation/quotation.model";
import {
	selectQuotationActionLoading,
	selectQuotationById
} from "../../../../../core/purchaseManagement/quotation/quotation.selector";
import {QuotationService} from '../../../../../core/purchaseManagement/quotation/quotation.service';
//import { QueryPurchaseOrderModel } from '../../../../../core/purchaseManagement/purchaseOrder/querypurchaseOrder.model';
import { QueryPurchaseRequestModel } from '../../../../../core/purchaseManagement/purchaseRequest/querypurchaseRequest.model';
import { PurchaseOrderModel } from '../../../../../core/purchaseManagement/purchaseOrder/purchaseOrder.model';
import { SelectionModel } from '@angular/cdk/collections';
//import { PurchaseOrderService } from '../../../../../core/purchaseManagement/purchaseOrder/purchaseOrder.service';
import { PurchaseRequestService } from '../../../../../core/purchaseManagement/purchaseRequest/purchaseRequest.service';
import { VendorModel } from '../../../../../core/masterData/vendor/vendor.model';
import { QueryVendorModel } from '../../../../../core/masterData/vendor/queryvendor.model';
import { VendorService } from '../../../../../core/masterData/vendor/vendor.service';
import { TaxModel } from '../../../../../core/masterData/tax/tax.model';
import { QueryTaxModel } from '../../../../../core/masterData/tax/querytax.model';
import { TaxService } from '../../../../../core/masterData/tax/tax.service';
import { MatDialog } from '@angular/material/dialog';
import { PopupEditPricequotationComponent } from '../popup-edit-pricequotation/popup-edit-pricequotation.component';
import { TemplatePDFQuotation } from '../../../../../core/templatePDF/quotation.service';
import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';

@Component({
  selector: 'kt-view-quotation',
  templateUrl: './view-quotation.component.html',
  styleUrls: ['./view-quotation.component.scss']
})
export class ViewQuotationComponent implements OnInit, OnDestroy {
	datauser = localStorage.getItem("user");
	quotation: QuotationModel;
	QuotationId$: Observable<string>;
	oldQuotation: QuotationModel;
	selectedTab = 0;
	loading$: Observable<boolean>;
	quotationForm: FormGroup;
	vendorForm: FormGroup;
	hasFormErrors = false;
	loading = {
		number: false,
		submit: false,
		product: false,
		vendor: false,
	}
	date = new Date()
	isApproved: boolean = false;
	po_no: any

	TaxResult: any[] = []
	VendorResult: any[] = []
	prResult: any[] = []

	downloadInProcess: number = 0;
	failedQueue: string[] = [];

	selectionPO = new SelectionModel<PurchaseOrderModel>(true, []);
	selectionTax = new SelectionModel<TaxModel>(true, []);
	selectionVendor = new SelectionModel<VendorModel>(true, []);

	dataSource: any = new BehaviorSubject([]);
	dataVendor: any = new BehaviorSubject([]);
	displayedColumns = ["product_code", "product_name", "uom", "qty", "product_category", "specification", "description"];
	displayedColumnsVendor = ["print", "vendor_code", "vendor_name","email", "product_brand"];
	//displayedColumns = ["product_code", "product_name","qty", "price", "description"];

	private subscriptions: Subscription[] = [];
  	constructor(
		private activatedRoute: ActivatedRoute,
		private router: Router,
		private quotationFB: FormBuilder,
		private subheaderService: SubheaderService,
		private layoutUtilsService: LayoutUtilsService,
		private store: Store<AppState>,
		private service: QuotationService,
		private serviceTax: TaxService,
		private serviceVendor: VendorService,
		private cd: ChangeDetectorRef,
		//private servicePO: PurchaseOrderService,
		private servicePR: PurchaseRequestService,
		private layoutConfigService: LayoutConfigService,
		private dialog: MatDialog,
		private templatePDFQuotation: TemplatePDFQuotation,
	) { }

  	ngOnInit() {
		this.loading$ = this.store.pipe(select(selectQuotationActionLoading));
		const routeSubscription =  this.activatedRoute.params.subscribe(params => {
			const id = params.id;
			if (id) {
				this.store.pipe(select(selectQuotationById(id))).subscribe(res => {
					if (res) {
						// console.log(res, "quotation");

						this.quotation = res;
						// console.log(res.select_product, "data baru");


						this.oldQuotation = Object.assign({}, this.quotation);
						this.initQuotation();
					}
				});
			} else {
				this.quotation = new QuotationModel();
				this.quotation.clear();
				this.initQuotation();
			}
		});
		this.subscriptions.push(routeSubscription);
  	}

	initQuotation() {
		this.createForm();
		// this.loadTax();
		// this.loadVendor();
		//console.log(this.quotation._id);
		if (this.quotation._id) {
			this.loadPO2();
			this.prnoChange(this.quotation.select_pr_no._id)
		} else {
			this.loadPO();
			// this.getNumber();
		}
	}

	createForm() {
		if (this.quotation._id){
			this.quotationForm = this.quotationFB.group({
				quotation_no: [{value: this.quotation.quotation_no, disabled: true}, Validators.required],
				// vendor_name: [{value: this.quotation.vendor_name, disabled: true}, Validators.required],
				date: [{value: this.quotation.date, disabled: true}, Validators.required],
				select_pr_no: [{value: this.quotation.select_pr_no, disabled: true}, Validators.required],
				//select_product: [{value: this.quotation.select_product, disabled: true}, Validators.required],
				product_name: [{value: this.quotation.product, disabled: true}, Validators.required],
				quotation_subject : [{value: this.quotation.quotation_subject, disabled: true}, Validators.required],
				created_by: [this.quotation.created_by],
				vendor: [this.dataVendor],
			});
		}else{
			this.quotationForm = this.quotationFB.group({
				quotation_no: [{value: "", disabled: true}, Validators.required],
				date: [{value: this.date, disabled: false}, Validators.required],
				select_pr_no: ["", Validators.required],
				//select_product: [{value: []}, Validators.required],
				product_name: [{value: []}, Validators.required],
				quotation_subject: [""],
				created_by: [{value:this.datauser, disabled:true}],
				vendor: [{value: []}, Validators.required],
			});
		}
	}
	goBackWithId() {
		const url = `/quotation`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}
	refreshQuotation(isNew: boolean = false, id:string = "") {
		let url = this.router.url;
		if (!isNew) {
			this.router.navigate([url], { relativeTo: this.activatedRoute });
			return;
		}
		url = `/quotation/edit/${id}`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}

	getNumber(){
		this.loading.number = true
		const controls = this.quotationForm.controls;
		this.service.generateQuotationCode().subscribe(
			res => {
				// console.log(res.data, "get number");
				if (!this.quotation._id) {
					// console.log(res.data);
					controls.quotation_no.setValue(res.data)

					// this.po = res.data;
					// controls.po_no.setValue(this.po_no)
				}
				this.loading.number = false;
			}
		)
	}

	inputKeydownHandler(event) {
		return event.keyCode === 8 || event.keyCode === 46 ? true : !isNaN(Number(event.key));
	}

	loadPO(){
		this.selectionPO.clear();
		//const queryParams = new QueryPurchaseOrderModel(
		const queryParams = new QueryPurchaseRequestModel(
			null,
			1,
			10000
		);
		//this.servicePO.getListQuotationPurchaseOrder(queryParams).subscribe(
		this.servicePR.getListPOPurchaseRequest(queryParams).subscribe(
			res => {
				//console.log(res.data);

				this.prResult = res.data;
			}
		);
	}

	loadPO2(){
		this.selectionPO.clear();
		//const queryParams = new QueryPurchaseOrderModel(
		const queryParams = new QueryPurchaseRequestModel(
			null,
			1,
			10000
		);
		//this.servicePO.getListQuotationPurchaseOrder(queryParams).subscribe(
		this.servicePR.getListPOPurchaseRequest2(queryParams).subscribe(
			res => {
				//console.log(res.data, "rehan1");

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
		const controls = this.quotationForm.controls
		this.loading.product = true;
		this.dataSource.next(value);
		//console.log(value, "load product");

		//controls.select_product.setValue(this.dataSource.value)
		controls.product_name.setValue(this.dataSource.value)
		// console.log(value);
		this.loading.product = false;
	}

	prnoChange(value){
		this.selectionPO.clear();
		//this.servicePR.findPurchaseOrderById(value).subscribe(
		this.servicePR.findPurchaseRequestById(value).subscribe(
			res => {
				//console.log(res, "purchase request");
				let data = res.data;
				// console.log(this.quotation.select_product, "purchase order product");
				const controls = this.quotationForm.controls

				// this.po_no = data.purchase_request_no;
				if (this.quotation._id) {
					//console.log(this.quotation.select_pr_no._id);
					controls.select_pr_no.setValue(this.quotation.select_pr_no._id)
					// this.vendorchange(this.quotation.vendor_name._id)
					// if (this.quotation.tax != null)
					// 	this.taxchange(this.quotation.tax);

					// controls.total.setValue(this.quotation.total)
					// controls.grand_total.setValue(this.quotation.grand_total)

					let productAdjusted = this.adjustProduct(this.quotation)
					this.loadProductList(productAdjusted)

					productAdjusted.forEach(e => {
						this.getVendorByProduct(e._id)
			});
				} else {
					//this.vendorchange(data.vendor_name)
					// if (data.tax != null)
					// 	this.taxchange(data.tax);
					// if (data.type_discount != "")
					// 	controls.type_discount.setValue(data.type_discount);
					// if (data.discount != null || data.discount != "" || data.discount != "0")
					// 	controls.discount.setValue(data.discount);
					this.loadProductList(data.product_name)
					// this.quotationForm.controls.pr_no.setValue(data.purchase_request_no)
				}
				// this.changePOTotal();
				//this.cd.markForCheck()

			}
		);

	}

	changePOTotal(){
		const controls = this.quotationForm.controls
		let data = this.dataSource.value
		//change after_discount
		data.forEach((currentValue, index) => {
			//masukkin ke datasource
			this.dataSource.next(data)
			controls.product_name.setValue(data)
			this.cd.markForCheck()
			//console.log(currentValue.after_discount);
			//console.log(index);
		});

		//let index = data.findIndex((item) => item._id == _id)


		//console.log(data, "rhn3");
		if (data.length > 0) {
			let prices = data.map((item) => item.after_discount).reduce((a, b) => parseInt(a) + parseInt(b))
			//let prices = data.map((item) => item.after_discount).reduce((a, b) => console.log(a) + console.log(b))
			//console.log(prices, "price po total");
			// this.changeTotal2();
		}
		// else {
		// 	const message = `Product list has not been updated`;
		// 	this.layoutUtilsService.showActionNotification(message, MessageType.Update, 5000, true, true);
		// }
	}

	changeTotal2(){
		const controls = this.quotationForm.controls
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
				//this.cd.markForCheck()

				// console.log(tax, "tax");

				// let datanya = this.dataSource.value
				// //console.log(datanya);
				// //change after_discount
				// datanya.forEach((currentValue, index) => {
				// 	//hitung sab total
				// 	currentValue.subtotal = currentValue.buy_price * currentValue.qty
				// 	//hitung after discount
				// 	if (currentValue.typediscount == "pr") {
				// 		// console.log(data[index].subtotal);
				// 		// console.log(data[index].discount);

				// 		let persen = (currentValue.subtotal * currentValue.discount) / 100;
				// 		// console.log(persen);
				// 		currentValue.after_discount = currentValue.subtotal - persen
				// 	} else {
				// 		currentValue.after_discount = currentValue.subtotal - currentValue.discount
				// 	}
				// 	//masukkin ke datasource
				// 	this.dataSource.next(datanya)
				// 	controls.product_name.setValue(datanya)
				// 	this.cd.markForCheck()
				// 	//console.log(currentValue.after_discount);
				// 	//console.log(index);
				// });

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
			// let datanya = this.dataSource.value
			// //console.log(datanya);
			// //change after_discount
			// datanya.forEach((currentValue, index) => {
			// 	//hitung sab total
			// 	currentValue.subtotal = currentValue.buy_price * currentValue.qty
			// 	//hitung after discount
			// 	if (currentValue.typediscount == "pr") {
			// 		// console.log(data[index].subtotal);
			// 		// console.log(data[index].discount);

			// 		let persen = (currentValue.subtotal * currentValue.discount) / 100;
			// 		// console.log(persen);
			// 		currentValue.after_discount = currentValue.subtotal - persen
			// 	} else {
			// 			currentValue.after_discount = currentValue.subtotal - currentValue.discount
			// 	}
			// 	//masukkin ke datasource
			// 	this.dataSource.next(datanya)
			// 	controls.product_name.setValue(datanya)
			// 	this.cd.markForCheck()
			// 	//console.log(currentValue.after_discount);
			// 	//console.log(index);
			// });

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
		this.cd.markForCheck();

	}

	changeTotal(){
		const controls = this.quotationForm.controls
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
				//this.cd.markForCheck()

				// console.log(tax, "tax");

				let datanya = this.dataSource.value
				//console.log(datanya);
				//change after_discount
				datanya.forEach((currentValue, index) => {
					//hitung sab total
					currentValue.subtotal = currentValue.buy_price * currentValue.qty
					//hitung after discount
					if (controls.type_discount.value == "pr") {
						// console.log(data[index].subtotal);
						// console.log(data[index].discount);

						let persen = (currentValue.subtotal * controls.discount.value) / 100;
						// console.log(persen);
						currentValue.after_discount = currentValue.subtotal - persen
					} else {
						currentValue.after_discount = currentValue.subtotal - controls.discount.value
					}
					//masukkin ke datasource
					this.dataSource.next(datanya)
					controls.product_name.setValue(datanya)
					this.cd.markForCheck()
					//console.log(currentValue.after_discount);
					//console.log(index);
				});

				this.changePOTotal2();

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
			let datanya = this.dataSource.value
			//console.log(datanya);
			//change after_discount
			datanya.forEach((currentValue, index) => {
				//hitung sab total
				currentValue.subtotal = currentValue.buy_price * currentValue.qty
				//hitung after discount
				if (controls.type_discount.value == "pr") {
					let persen = (currentValue.subtotal * controls.discount.value) / 100;
					// console.log(persen);
					currentValue.after_discount = currentValue.subtotal - persen
				} else {
					currentValue.after_discount = currentValue.subtotal - controls.discount.value
				}
				//masukkin ke datasource
				this.dataSource.next(datanya)
				controls.product_name.setValue(datanya)
				this.cd.markForCheck()

				//console.log(index);
			});

			this.changePOTotal2();

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
		//this.cd.markForCheck();

	}

	changePOTotal2(){
		const controls = this.quotationForm.controls
		let data = this.dataSource.value
		//console.log(data, "rhn3");
		if (data.length > 0) {
			let prices = data.map((item) => item.after_discount).reduce((a, b) => parseInt(a) + parseInt(b))
			//let prices = data.map((item) => item.after_discount).reduce((a, b) => console.log(a) + console.log(b))
			controls.total.setValue(prices)
			//console.log(prices, "price po total");
			//this.changeTotal()
		}
		// else {
		// 	const message = `Product list has not been updated`;
		// 	this.layoutUtilsService.showActionNotification(message, MessageType.Update, 5000, true, true);
		// }
	}

	vendorchange(value){
		// console.log(value, "id vendor");

		this.selectionVendor.clear();
		this.serviceVendor.findVendorById(value).subscribe(
			res => {
				// console.log(res, "data vendor id");
				let data = res.data;
				// if (this.quotation._id) {
					this.quotationForm.controls.vendor_name.setValue(data._id)
				// }
				this.cd.markForCheck()
			}
		);
	}
	taxchange(value){
		// console.log(value, "id tax");
		const controls = this.quotationForm.controls
		let tax = 0
		let taxamount = 0

		this.selectionTax.clear();
		this.serviceTax.findTaxById(value).subscribe(
			res => {
				// console.log(res, "data tax id");
				let data = res.data;
				//console.log(data, "data tax id");
				// if (this.quotation._id) {
				this.quotationForm.controls.tax.setValue(data._id)

				let total = 0;
				let totalamount = 0;
				if (controls.type_discount.value == "pr") {
					let persen = controls.total.value * controls.discount.value / 100
					total = controls.total.value - persen;
					taxamount = ((total * data.nominal) / 100)
					totalamount = total + taxamount

					// console.log(taxamount, "taxamount");
					//console.log(totalamount, "total amount1");
					controls.grand_total.setValue(totalamount)
				} else {
					total = controls.total.value - controls.discount.value
					taxamount = ((total * data.nominal) / 100)
					totalamount = total + taxamount
					// console.log(taxamount, "taxamount");
					//console.log(totalamount, "total amount2");
					controls.grand_total.setValue(totalamount)
				}
				// }
				this.cd.markForCheck()
			}
		);
	}

	onSubmit(withBack: boolean = false) {
		this.hasFormErrors = false;
		const controls = this.quotationForm.controls;
		if (this.quotationForm.invalid) {
			Object.keys(controls).forEach(controlName =>
				controls[controlName].markAsTouched()
			);

			this.hasFormErrors = true;
			this.selectedTab = 0;
			return;
		}

		this.loading.submit = true;
		const editedQuotation = this.prepareQuotation();

		if (editedQuotation._id) {
			this.updateQuotation(editedQuotation, withBack);
			return;
		}
		this.addQuotation(editedQuotation, withBack);

	}

	prepareQuotation(): QuotationModel {
		const controls = this.quotationForm.controls;
		const _quotation = new QuotationModel();
		_quotation.clear();
		_quotation._id = this.quotation._id;
		_quotation.quotation_no = controls.quotation_no.value;
		_quotation.vendor = controls.vendor.value;
		_quotation.date = controls.date.value;
		_quotation.select_pr_no = controls.select_pr_no.value;
		//_quotation.select_product = controls.select_product.value;
		_quotation.product = controls.product_name.value;
		_quotation.quotation_subject = controls.quotation_subject.value;
		_quotation.created_by = controls.created_by.value;
		_quotation.vendor = controls.vendor.value.filter(item => item.select === true);
		// console.log(controls, "controls");

		return _quotation;
	}

	addQuotation( _quotation: QuotationModel, withBack: boolean = false) {
		const addSubscription = this.service.createQuotation(_quotation).subscribe(
			res => {
				const message = `New quotation successfully has been added.`;
				this.layoutUtilsService.showActionNotification(message, MessageType.Create, 5000, true, true);
				const url = `/quotation`;
				this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
			},
			err => {
				console.error(err);
				const message = 'Error while adding quotation | ' + err.statusText;
				this.layoutUtilsService.showActionNotification(message, MessageType.Create, 5000, true, false);
			}
		);
		this.subscriptions.push(addSubscription);
	}

	updateQuotation(_quotation: QuotationModel, withBack: boolean = false) {
		const addSubscription = this.service.updateQuotation(_quotation).subscribe(
			res => {
				const message = `Quotation successfully has been saved.`;
				this.layoutUtilsService.showActionNotification(message, MessageType.Update, 5000, true, true);
				const url = `/quotation`;
				this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
			},
			err => {
				console.error(err);
				const message = 'Error while adding quotation | ' + err.statusText;
				this.layoutUtilsService.showActionNotification(message, MessageType.Update, 5000, true, false);
			}
		);
		this.subscriptions.push(addSubscription);
	}

	getComponentTitle() {
		let result = 'Create Quotation';
		if (!this.quotation || !this.quotation._id) {
			return result;
		}

		result = `Edit Quotation`;
		return result;
	}

	onAlertClose($event) {
		this.hasFormErrors = false;
	}

  	ngOnDestroy() {
		this.subscriptions.forEach(sb => sb.unsubscribe());
	}

	editPrice(_id) {
		let data = this.dataSource.value;
		let dataExist = data.find((item) => item._id == _id)
		let index = data.findIndex((item) => item._id == _id)

		if (dataExist && index >= 0) {
			const dialogRef = this.dialog.open(PopupEditPricequotationComponent, {
				data: dataExist,
				maxWidth: '500px',
				minHeight: '300px'
			});
			dialogRef.afterClosed().subscribe(result => {
				if (result !== undefined) {
					this.loading.product = true;
					const controls = this.quotationForm.controls;
					// console.log(result.data, "data edited");
					data[index] = result.data;
					// console.log(data);
					this.dataSource.next(data);
					controls.product_name.setValue(data)
					this.changeQuoTotal()
					this.loading.product = false;
					this.cd.markForCheck()
				}
			})
		}

	}

	onChangeCheckBox(id) {
		// let data = this.dataSource.value.find((item) => item._id ==_id)
		const isExist = this.checkDataVendorIsExist(id)
		if(isExist){
			this.removeDataVendorByProduct(id)
		}
		else{
			this.getVendorByProduct(id)
		}
	}

	onClickCheckBox(item, e) {
		e.stopPropagation()
	}
	
	isChecked(id) {
		return true
	}

	changeQuoTotal(){
		const controls = this.quotationForm.controls
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

	getVendorByProduct(id) {
		const query = new QueryVendorModel(
			id,
			1,
			10000
		)
		let temp = this.dataVendor.value
		const addSubscription = this.serviceVendor.getListVendorByProduct(query).subscribe(res => {

			this.loading.vendor = true
			
			//olah data untuk mendapat product_brand
			let data = res.data
			data.forEach(item => {
				let temp_product = item.products.filter(product => product._id === id)
				item.product_brand = temp_product[0]
				item.select = false
				temp.push(item)
			})

			this.dataVendor.next(temp)

			//define control form
			const controls = this.quotationForm.controls

			controls.vendor.setValue(this.dataVendor.value)

			this.loading.vendor = false

			this.cd.markForCheck()
		})
	}

	checkDataVendorIsExist(id) {
		let data = this.dataVendor.value

		const length = (data.find(item => item.product_brand._id === id))
		console.log(length, 'ini length')
		if(length ) return true
		else return false
	}

	removeDataVendorByProduct(id){
		let data = this.dataVendor.value

		this.loading.vendor = true
		let temp = []
		data.filter(item => {
			if(item.product_brand._id != id){
				temp.push(item)
			}
		})

		this.dataVendor.next(temp)

		const controls = this.quotationForm.controls

		controls.vendor.setValue(this.dataVendor.value)
		
		this.loading.vendor = false
		this.cd.markForCheck()
	}

	onChangeVendorBox(itemVendor) {
		// let data = this.dataSource.value.find((item) => item._id ==_id)
		let dataVendor = this.dataVendor.value
		const controls = this.quotationForm.controls

		dataVendor.filter(vendor => {
			if(vendor._id === itemVendor._id && vendor.product_brand === itemVendor.product_brand){
				vendor.select = !vendor.select
			}
		})

		controls.vendor.setValue(dataVendor)

		this.cd.markForCheck()
		
	}

	onClickVendorBox(item, e) {
		e.stopPropagation()
	}

	adjustProduct(product){

		let temp = {
			...product.product,
			_id: product.product._id,
			qty: product.qty,
			product_name: product.product.brand_name,
			product_code: product.product.brand_code,
			product_category: product.product.product_category,
			uom: product.uom._id,
			uom2: product.uom.uom,
			price: product.product.price,
			description: product.product.description
		}

		return [temp]
	}

	checkBeforePrint(vendor) {
		console.log(vendor, 'vendor')
		vendor['PR_no'] = this.quotation.select_pr_no.purchase_request_no
		vendor['qty'] = this.quotation.qty
		vendor['req_date'] = this.quotation.date

		//define template
		const addSubscription = this.service.printPurchaseRequestTemplate(this.quotation._id, vendor._id).subscribe(res => {
			vendor["project_name"] = res.data.project_name
			vendor["project_email"] = res.data.project_email
			let template = this.templatePDFQuotation.generatePDF(vendor)
			pdfMake.createPdf(template).download(this.quotation.quotation_no)
	
			this.setPDFProcessNotification()
		})

	}

	setPDFProcessNotification() {
		this.downloadInProcess -= 1;
		if (this.downloadInProcess <= 0) {
			// Reset in process value
			this.downloadInProcess = 0;
			this.layoutUtilsService.showActionNotification(
				'All queue process has been finished.',
				MessageType.Create,
				3500,
				true,
				false
			);

			// Show alert when encountered error in process
			if (this.failedQueue.length > 0) {
				let msg = 'Failed to Download';
				this.failedQueue.forEach((item, index) => {
					msg += `\n${index + 1}. ${item}`;
				});

				// Show and clear the listed failed unit invoices
				alert(msg);
				this.failedQueue = [];
			}
		} else {
			this.layoutUtilsService.showActionNotification(
				`Processing download for ${this.downloadInProcess} ${this.downloadInProcess > 1 ? 'items' : 'item'}.`,
				MessageType.Create,
				15000,
				true,
				false
			);
		}
	}
	
}
