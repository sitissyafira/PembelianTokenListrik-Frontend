import {ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { Store, select } from '@ngrx/store';
import { AppState } from '../../../../../core/reducers';
import { SubheaderService, LayoutConfigService } from '../../../../../core/_base/layout';
import { LayoutUtilsService, MessageType } from '../../../../../core/_base/crud';
import {PurchaseRequestModel} from "../../../../../core/purchaseManagement/purchaseRequest/purchaseRequest.model";
import {
	selectPurchaseRequestActionLoading,
	selectPurchaseRequestById
} from "../../../../../core/purchaseManagement/purchaseRequest/purchaseRequest.selector";
import {PurchaseRequestService} from '../../../../../core/purchaseManagement/purchaseRequest/purchaseRequest.service';
import { StockProductService } from '../../../../../core/inventorymanagement/stockProduct/stockProduct.service';
import { SelectionModel } from '@angular/cdk/collections';
import { StockProductModel } from '../../../../../core/inventorymanagement/stockProduct/stockProduct.model';
import { QueryStockProductModel } from '../../../../../core/inventorymanagement/stockProduct/querystockProduct.model';
import { MatDialog } from '@angular/material/dialog';
import { PopupPurchaseRequest } from '../popup-purchaseRequest/popup-purchaseRequest.component';
import { QueryTaxModel } from '../../../../../core/masterData/tax/querytax.model';
import { TaxService } from '../../../../../core/masterData/tax/tax.service';
import { TaxModel } from '../../../../../core/masterData/tax/tax.model';


@Component({
  selector: 'kt-add-purchaseRequest',
  templateUrl: './add-purchaseRequest.component.html',
  styleUrls: ['./add-purchaseRequest.component.scss']
})
export class AddpurchaseRequestComponent implements OnInit, OnDestroy {
	datauser = localStorage.getItem("user");
	purchaseRequest: PurchaseRequestModel;
	purchaseRequestId$: Observable<string>;
	oldpurchaseRequest: PurchaseRequestModel;
	selectedTab = 0;
	loading$: Observable<boolean>;
	purchaseRequestForm: FormGroup;
	hasFormErrors = false;
	loading : boolean = false;
	loadingProduct : boolean = false;
	loadingGenerate: boolean = false;
	loadingTax : boolean = false;
	product_id = 1;
	minDate: Date;
	maxDate: Date;
	status : boolean;
	purchase_request_no: any;

	selection = new SelectionModel<StockProductModel>(true, []);
	selectionTax = new SelectionModel<TaxModel>(true, []);
	ProductResult: any[] = [];
	type: any;
	TaxResult: any[] = [];

	// Autocomplete Filter and Options
	productResultFiltered = [];
	viewProductResult = new FormControl();
	
	user = localStorage.getItem("currentUser");
	dataUser = JSON.parse(this.user)
	role = this.dataUser.role

	// Private properties

	dataSource: any = new BehaviorSubject([]);
	displayedColumns = ["product_code", "product_name","qty", "uom", "description","actions"];

	private subscriptions: Subscription[] = [];
  	constructor(
		private activatedRoute: ActivatedRoute,
		private router: Router,
    	private dialog: MatDialog,
		private purchaseRequestFB: FormBuilder,
		private serviceProduct: StockProductService,
		private serviceTax: TaxService,
		private cd: ChangeDetectorRef,
		private subheaderService: SubheaderService,
		private layoutUtilsService: LayoutUtilsService,
		private store: Store<AppState>,
		private service: PurchaseRequestService,
		private layoutConfigService: LayoutConfigService
	) { }

  	ngOnInit() {
		this.loading$ = this.store.pipe(select(selectPurchaseRequestActionLoading));
		const routeSubscription =  this.activatedRoute.params.subscribe(params => {
			const id = params.id;
			if (id) {
				this.store.pipe(select(selectPurchaseRequestById(id))).subscribe(res => {
					if (res) {
						// console.log(res);
						this.purchaseRequest = res;
						this.status = res.isApproved;
						let dataSource = res.product_name.map((item) => {
							return Object.assign({}, item)
						})
						// console.log(dataSource);
						this.dataSource.next(dataSource)
						this.oldpurchaseRequest = Object.assign({}, this.purchaseRequest);
						this.initpurchaseRequest();
					}
				});
			} else {
				this.purchaseRequest = new PurchaseRequestModel();
				this.purchaseRequest.clear();
				this.initpurchaseRequest();
			}
		});
		this.subscriptions.push(routeSubscription);
  	}

	initpurchaseRequest() {
		this.createForm();
		this.loadTax()
		if (this.purchaseRequest._id) {
			this.taxChange(this.purchaseRequest.tax._id)
		} else {
			this.getNumber();
		}
		// this.loadProductList()
	}

	createForm() {
		if (this.purchaseRequest._id){
			this.purchaseRequestForm = this.purchaseRequestFB.group({
				purchase_request_no: [{value: this.purchaseRequest.purchase_request_no, disabled: true}, Validators.required],
				request_date: [{value: this.purchaseRequest.request_date, disabled: true}, Validators.required],
				estimated_date: [{value: this.purchaseRequest.estimated_date, disabled: true}, Validators.required],
				product_name: [{value: this.purchaseRequest.product_name, disabled: true}, Validators.required],
				tax: [{value: this.purchaseRequest.tax, disabled: true}],
				discount: [{value: this.purchaseRequest.discount, disabled: true}],
				type: [{value: this.purchaseRequest.type, disabled: true}],
				subTotal: [{value: this.purchaseRequest.subTotal, disabled: true}],
				grandTotal: [{value: this.purchaseRequest.grandTotal, disabled: true}],
				type_discount: [{value: this.purchaseRequest.type_discount, disabled: true}],
				description: [{value: this.purchaseRequest.description, disabled: true}, Validators.required],
				isApproved: [this.purchaseRequest.isApproved],
				created_by: [{value: this.purchaseRequest.created_by, disabled: true}, Validators.required],
			});
		}else{
			this.purchaseRequestForm = this.purchaseRequestFB.group({
				purchase_request_no: [{value: this.purchase_request_no, disabled: true}, Validators.required],
				request_date: ["", Validators.required],
				estimated_date: ["", Validators.required],
				product_name: [{value: []}, Validators.required],
				description: ["", Validators.required],
				//type_discount: ["", Validators.required],
				type_discount: [""],
				//type: ["", Validators.required],
				type: [""],
				subTotal: [{value: "", disabled: true}],
				grandTotal: [{value: "", disabled: true}],
				tax: [""],
				discount: [""],
				isApproved: [""],
				created_by: [{value:this.datauser, disabled:true}],
			});
		}
	}
	goBackWithId() {
		const url = `/purchaseRequest`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}
	refreshpurchaseRequest(isNew: boolean = false, id:string = "") {
		let url = this.router.url;
		if (!isNew) {
			this.router.navigate([url], { relativeTo: this.activatedRoute });
			return;
		}
		url = `/purchaseRequest/edit/${id}`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}

	getNumber(){
		this.loadingGenerate = true
		const controls = this.purchaseRequestForm.controls;
		this.service.generatePRCode().subscribe(
			res => {
				//console.log(res.data);

				this.purchase_request_no = res.data;
				controls.purchase_request_no.setValue(this.purchase_request_no);
				controls.type.setValue("purchase order");
				this.loadingGenerate = false;
			}
		)
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

	// changeType(item){
	// 	const controls = this.purchaseRequestForm.controls
	// 	controls.type.setValue(item.value)
	// 	this.type = item.value;
	// 	this.resetProduct()
	// }

	loadTax() {
				this.loadingTax = true;
				this.selection.clear();
				const queryParams = new QueryTaxModel(
					null,
					1,
					1000
				);
				this.serviceTax.getListTax(queryParams).subscribe(
					res => {
						this.TaxResult = res.data;
						this.loadingTax = false;
						this.cd.markForCheck();
					}
				);
			}

		//   categoryChange(id){
			//   console.log(id);

		// 	};

	onSubmit(withBack: boolean = false) {
		this.hasFormErrors = false;
		const controls = this.purchaseRequestForm.controls;
		if (this.purchaseRequestForm.invalid) {
			Object.keys(controls).forEach(controlName =>
				controls[controlName].markAsTouched()
			);

			this.hasFormErrors = true;
			this.selectedTab = 0;
			return;
		}

		this.loading = true;
		const editedpurchaseRequest = this.preparepurchaseRequest();

		if (editedpurchaseRequest.product_name.values == undefined)
		{
			const message = 'Error, Product must be filled!.';
			this.layoutUtilsService.showActionNotification(message, MessageType.Create, 5000, true, false);
			this.loading = false;
		}
		else
		{
			if (editedpurchaseRequest._id) {
				this.updatepurchaseRequest(editedpurchaseRequest, withBack);
				return;
			}
			this.addpurchaseRequest(editedpurchaseRequest, withBack);
		}
	}

	preparepurchaseRequest(): PurchaseRequestModel {
		const controls = this.purchaseRequestForm.controls;
		const _purchaseRequest = new PurchaseRequestModel();
		_purchaseRequest.clear();
		_purchaseRequest._id = this.purchaseRequest._id;
		_purchaseRequest.purchase_request_no = controls.purchase_request_no.value;
		_purchaseRequest.request_date = controls.request_date.value;
		_purchaseRequest.estimated_date = controls.estimated_date.value;
		_purchaseRequest.product_name = controls.product_name.value;
		_purchaseRequest.type = controls.type.value;
		_purchaseRequest.description = controls.description.value;
		_purchaseRequest.grandTotal = controls.grandTotal.value;
		_purchaseRequest.discount = controls.discount.value;
		if (controls.tax.value != "")
			_purchaseRequest.tax = controls.tax.value;
		_purchaseRequest.type_discount = controls.type_discount.value;
		_purchaseRequest.subTotal = controls.subTotal.value;
		_purchaseRequest.isApproved = controls.isApproved.value;
		_purchaseRequest.created_by = controls.created_by.value;
		return _purchaseRequest;
	}

	addpurchaseRequest( _purchaseRequest: PurchaseRequestModel, withBack: boolean = false) {
		const addSubscription = this.service.createPurchaseRequest(_purchaseRequest).subscribe(
			res => {
				const message = `New purchase request successfully has been added.`;
				this.layoutUtilsService.showActionNotification(message, MessageType.Create, 5000, true, true);
				const url = `/purchaseRequest`;
				this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
			},
			err => {
				console.error(err);
				const message = 'Error while adding purchase request | ' + err.statusText;
				this.layoutUtilsService.showActionNotification(message, MessageType.Create, 5000, true, false);
			}
		);
		this.subscriptions.push(addSubscription);
	}

	updatepurchaseRequest(_purchaseRequest: PurchaseRequestModel, withBack: boolean = false) {
		const addSubscription = this.service.updatePurchaseRequest(_purchaseRequest).subscribe(
			res => {
				const message = `Purchase request successfully has been saved.`;
				this.layoutUtilsService.showActionNotification(message, MessageType.Update, 5000, true, true);
				const url = `/purchaseRequest`;
				this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
			},
			err => {
				console.error(err);
				const message = 'Error while adding purchase request | ' + err.statusText;
				this.layoutUtilsService.showActionNotification(message, MessageType.Update, 5000, true, false);
			}
		);
		this.subscriptions.push(addSubscription);
	}

	// decrease qty by id
	decStock(_id){
		// console.log(this.dataSource);
		const controls = this.purchaseRequestForm.controls;
		let data = this.dataSource.getValue();
		// console.log(_id);
		let index = data.findIndex((item) => item._id == _id)
		// console.log(data);
		// console.log(index);
		let newData = {...data[index]}
		if (newData.qty > 1) {
			data[index].qty -= 1
		}



		// if (data[index].qty > 1) {
		// 	data[index].qty -= 1
		// }
		data[index].subtotal = data[index].buy_price * data[index].qty

		controls.product_name.setValue(data)
		this.dataSource.next(data)
		this.changePOTotal()
		this.cd.markForCheck()
	}

	// increase qty by id
	intStock(_id, qty){
		const controls = this.purchaseRequestForm.controls;
		// console.log(_id);
		const data = this.dataSource.value;
		let index = data.findIndex((item) => item._id == _id)
		// console.log(data);
		// console.log(index);
		// console.log(qty, "qty datal indet");

		if (qty !== undefined && qty > 0) {
			data[index].qty = data[index].qty + qty;
		} else {
			data[index].qty += 1
		}
		data[index].subtotal = data[index].buy_price * data[index].qty

		controls.product_name.setValue(data)
		this.dataSource.next(data)
		this.changePOTotal()
		this.cd.markForCheck()
	}

	deleteProduct(_id){
		const controls = this.purchaseRequestForm.controls;
		let data = this.dataSource.value;
		let index = data.findIndex((item) => item._id == _id)
		let removed = data.splice(index, index + 1)
		// console.log(removed);
		controls.product_name.setValue(data)
		this.dataSource.next(data)
		// console.log(this.dataSource);

		this.changePOTotal()
	}

	changePOTotal(){
		const controls = this.purchaseRequestForm.controls
		let data = this.dataSource.value
		// console.log(data);
		if (data.length > 0) {
			let prices = data.map((item) => item.subtotal).reduce((a, b) => parseInt(a) + parseInt(b))
			controls.subTotal.setValue(prices);
			controls.grandTotal.setValue(prices);
			// console.log(prices, "price po total");
			//this.changeTotal()
		} else {
			controls.subTotal.setValue(0)
			controls.grandTotal.setValue(0)
			//this.changeTotal()
		}
	}

	taxChange(value){
		console.log(value, "tax");
		this.selectionTax.clear();
		const controls = this.purchaseRequestForm.controls;
		this.serviceTax.findTaxById(value).subscribe(
			res => {
				console.log(res, "purchase request");
				let data = res.data
				controls.tax.setValue(data._id)
				this.changePOTotal()
				this.cd.markForCheck()

			}
		);


	}

	changeTotal(){
		const controls = this.purchaseRequestForm.controls
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

					let total = 0;
					let totalamount = 0;
					if (controls.type_discount.value == "pr") {
						let persen = controls.subTotal.value * controls.discount.value / 100
						total = controls.subTotal.value - persen;
						taxamount = ((total * tax) / 100)
						totalamount = total + taxamount

						// console.log(taxamount, "taxamount");
						// console.log(totalamount, "total amount");
						controls.grandTotal.setValue(totalamount)
					} else {
						total = controls.subTotal.value - controls.discount.value
						taxamount = ((total * tax) / 100)
						totalamount = total + taxamount
						// console.log(taxamount, "taxamount");
						// console.log(totalamount, "total amount");
						controls.grandTotal.setValue(totalamount)
					}
				}
			);

		}
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
		this.cd.markForCheck();
	}

	processMenuHandler() {
		const dialogRef = this.dialog.open(PopupPurchaseRequest, {
		  data: {id: this.product_id, type: this.type},
		  maxWidth: '500px',
		  minHeight: '300px'
		});
		dialogRef.afterClosed().subscribe(result => {
		const controls = this.purchaseRequestForm.controls;

			// console.log(result.data);
			let data = this.dataSource.value;
			console.log(data);

			let dataExist = data.find((item) => item.product_name == result.data.product_name)
				if (!dataExist) {
					data.push(result.data)
					this.product_id = this.product_id + 1
				} else {
					// console.log(dataExist.qty);
					this.intStock(dataExist._id, result.data.qty)
				}

				// console.log(this.loadingProduct);

				controls.product_name.setValue(data)
				this.dataSource.next(data)
				this.changePOTotal()
		})

	}

	inputKeydownHandler(event) {
		return event.keyCode === 8 || event.keyCode === 46 ? true : !isNaN(Number(event.key));
	}

	receivedHandler(e){
		const controls = this.purchaseRequestForm.controls;

		let strtDate = controls.request_date.value
		let endDate = controls.estimated_date.value

		this.minDate = strtDate
		this.maxDate = endDate

		// console.log(e);

	}

	resetProduct(){
		const controls = this.purchaseRequestForm.controls;
		this.dataSource.next([])
		controls.product_name.setValue([])
	}

	getComponentTitle() {
		let result = 'Create Purchase Request';
		if (!this.purchaseRequest || !this.purchaseRequest._id) {
			return result;
		}

		result = `Edit Purchase Request`;
		return result;
	}

	onAlertClose($event) {
		this.hasFormErrors = false;
	}

  	ngOnDestroy() {
		this.subscriptions.forEach(sb => sb.unsubscribe());
	}

	hidePosting(role) {
		console.log(role, 'role')
		if(role === "manager" || role === "administrator" || role === "admin-finance" || role === "spv-finance"
			|| role === "admin-tro" || role === "spv-tro" || role === "admin-engineer"){
				return false
		}
		else return true
	}
}
