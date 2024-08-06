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
import { PopupEditPricetabulationComponent } from '../popup-edit-pricetabulation/popup-edit-pricetabulation.component';

@Component({
  selector: 'kt-add-tabulation',
  templateUrl: './add-tabulation.component.html',
  styleUrls: ['./add-tabulation.component.scss']
})
export class AddTabulationComponent implements OnInit, OnDestroy {
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

	selectionPO = new SelectionModel<PurchaseOrderModel>(true, []);
	selectionTax = new SelectionModel<TaxModel>(true, []);
	selectionVendor = new SelectionModel<VendorModel>(true, []);


	dataSource: any = new BehaviorSubject([]);
	displayedColumns = ["product_code", "product_name","qty", "price", "after_discount","available_qty", "description", "actions"];
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
		//private servicePO: PurchaseOrderService,
		private servicePR: PurchaseRequestService,
		private layoutConfigService: LayoutConfigService,
		private dialog: MatDialog
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
		//console.log(this.tabulation._id);
		if (this.tabulation._id) {
			this.loadPO2();
			this.prnoChange(this.tabulation.select_pr_no._id)
		} else {
			this.loadPO();
			this.getNumber();
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
				created_by: [this.tabulation.created_by],
			});
		}else{
			this.tabulationForm = this.tabulationFB.group({
				tabulation_no: [{value: "", disabled: true}, Validators.required],
				vendor_name: ["", Validators.required],
				date: [{value: this.date, disabled: true}, Validators.required],
				select_pr_no: ["", Validators.required],
				//select_product: [{value: []}, Validators.required],
				product_name: [{value: []}, Validators.required],
				type_discount: [""],
				discount: [""],
				tax: ["", Validators.required],
				total: [{value: "", disabled: true}, Validators.required],
				grand_total: [{value: "", disabled: true}, Validators.required],
				tabulation_subject: [""],
				isApproved: [""],
				created_by: [{value:this.datauser, disabled:true}],
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

	getNumber(){
		this.loading.number = true
		const controls = this.tabulationForm.controls;
		this.service.generateTabulationCode().subscribe(
			res => {
				// console.log(res.data, "get number");
				if (!this.tabulation._id) {
					// console.log(res.data);
					controls.tabulation_no.setValue(res.data)

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
		//this.servicePO.getListTabulationPurchaseOrder(queryParams).subscribe(
		this.servicePR.getListPOPurchaseRequestTrue(queryParams).subscribe(
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
		//this.servicePO.getListTabulationPurchaseOrder(queryParams).subscribe(
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
		const controls = this.tabulationForm.controls
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
		
		console.log(value, 'value')


	}

	changePOTotal(){
		const controls = this.tabulationForm.controls
		let data = this.dataSource.value
		//change after_discount
		data.forEach((currentValue, index) => {
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
			controls.total.setValue(prices)
			//console.log(prices, "price po total");
			this.changeTotal2();
		}
		// else {
		// 	const message = `Product list has not been updated`;
		// 	this.layoutUtilsService.showActionNotification(message, MessageType.Update, 5000, true, true);
		// }
	}

	changeTotal2(){
		const controls = this.tabulationForm.controls
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
		const controls = this.tabulationForm.controls
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
		const controls = this.tabulationForm.controls
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
				// if (this.tabulation._id) {
					this.tabulationForm.controls.vendor_name.setValue(data._id)
				// }
				this.cd.markForCheck()
			}
		);
	}
	taxchange(value){
		// console.log(value, "id tax");
		const controls = this.tabulationForm.controls
		let tax = 0
		let taxamount = 0

		this.selectionTax.clear();
		this.serviceTax.findTaxById(value).subscribe(
			res => {
				// console.log(res, "data tax id");
				let data = res.data;
				//console.log(data, "data tax id");
				// if (this.tabulation._id) {
				this.tabulationForm.controls.tax.setValue(data._id)

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
				console.error(err);
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
				console.error(err);
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

	editPrice(_id) {
		let data = this.dataSource.value;
		let dataExist = data.find((item) => item._id == _id)
		let index = data.findIndex((item) => item._id == _id)

		if (dataExist && index >= 0) {
			const dialogRef = this.dialog.open(PopupEditPricetabulationComponent, {
				data: dataExist,
				maxWidth: '500px',
				minHeight: '300px'
			});
			dialogRef.afterClosed().subscribe(result => {
				if (result !== undefined) {
					this.loading.product = true;
					const controls = this.tabulationForm.controls;
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

	changeQuoTotal(){
		const controls = this.tabulationForm.controls
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


}
