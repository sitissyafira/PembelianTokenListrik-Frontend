import {ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { Store, select } from '@ngrx/store';
import { AppState } from '../../../../../core/reducers';
// import { SubheaderService, LayoutConfigService } from '../../../../../core/_base/layout';
// import { LayoutUtilsService, MessageType } from '../../../../../core/_base/crud';
import {PurchaseRequestModel} from "../../../../../core/purchaseManagement/purchaseRequest/purchaseRequest.model";
import {
	selectPurchaseRequestActionLoading,
	selectPurchaseRequestById
} from "../../../../../core/purchaseManagement/purchaseRequest/purchaseRequest.selector";
// import {PurchaseRequestService} from '../../../../../core/purchaseManagement/purchaseRequest/purchaseRequest.service';
// import { StockProductService } from '../../../../../core/inventorymanagement/stockProduct/stockProduct.service';
import { SelectionModel } from '@angular/cdk/collections';
import { StockProductModel } from '../../../../../core/inventorymanagement/stockProduct/stockProduct.model';
import { TaxModel } from '../../../../../core/masterData/tax/tax.model';
import { TaxService } from '../../../../../core/masterData/tax/tax.service';
import { QueryTaxModel } from '../../../../../core/masterData/tax/querytax.model';
// import { QueryStockProductModel } from '../../../../../core/inventorymanagement/stockProduct/querystockProduct.model';
// import { MatDialog } from '@angular/material/dialog';
// import { PopupPurchaseRequest } from '../popup-purchaseRequest/popup-purchaseRequest.component';


@Component({
  selector: 'kt-view-purchaseRequest',
  templateUrl: './view-purchaseRequest.component.html',
  styleUrls: ['./view-purchaseRequest.component.scss']
})
export class ViewPurchaseRequestComponent implements OnInit, OnDestroy {
	datauser = localStorage.getItem("user");
	purchaseRequest: PurchaseRequestModel;
	purchaseRequestId$: Observable<string>;
	oldpurchaseRequest: PurchaseRequestModel;
	selectedTab = 0;
	loading$: Observable<boolean>;
	purchaseRequestForm: FormGroup;
	hasFormErrors = false;
	loading : boolean = false;
	loadingTax : boolean = false;
	loadingProduct : boolean = false;
	product_id = 1;
	minDate: Date;
	maxDate: Date;
	status : boolean;

	selectionTax = new SelectionModel<TaxModel>(true, []);
	TaxResult: any[] = [];

	selection = new SelectionModel<StockProductModel>(true, []);
	ProductResult: any[] = [];
	
	// Autocomplete Filter and Options
	productResultFiltered = [];
	viewProductResult = new FormControl();
	
	// Private properties

	dataSource: any = new BehaviorSubject([]);
	displayedColumns = ["product_code", "product_name","qty", "uom", "description"];

	private subscriptions: Subscription[] = [];
  	constructor(
		private activatedRoute: ActivatedRoute,
		private router: Router,
    	// private dialog: MatDialog,
		private serviceTax: TaxService,
		private purchaseRequestFB: FormBuilder,
		// private serviceProduct: StockProductService,
		private cd: ChangeDetectorRef,
		// private subheaderService: SubheaderService,
		// private layoutUtilsService: LayoutUtilsService,
		private store: Store<AppState>,
		// private service: PurchaseRequestService,
		// private layoutConfigService: LayoutConfigService
	) { }

  	ngOnInit() {
		this.loading$ = this.store.pipe(select(selectPurchaseRequestActionLoading));
		const routeSubscription =  this.activatedRoute.params.subscribe(params => {
			const id = params.id;
			if (id) {
				this.store.pipe(select(selectPurchaseRequestById(id))).subscribe(res => {
					if (res) {
						this.purchaseRequest = res;
						this.status = res.status;
						let dataSource = res.product_name.map((item) => {
							return Object.assign({}, item)
						})
						// console.log(res);
						
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
				isApproved: [{value: this.purchaseRequest.isApproved, disabled: true}],
				created_by: [{value: this.purchaseRequest.created_by, disabled: true}, Validators.required],
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

	taxChange(value){
		// console.log(value);
		this.selectionTax.clear();
		const controls = this.purchaseRequestForm.controls;
		this.serviceTax.findTaxById(value).subscribe(
			res => {
				// console.log(res, "purchase request");
				let data = res.data
				controls.tax.setValue(data._id)
				this.cd.markForCheck()		
		
			}
		);

		
	}

	// // Remove selected value on keydown
	// _onKeyup(e: any) {
	// 	// Unset the form value
	// 	// this.floorForm.patchValue({ blk: undefined });
	// 	this._filterBlockList(e.target.value);
	// }
	
	// _filterBlockList(text: string) {
	// 	this.productResultFiltered = this.ProductResult.filter(i => {
	// 		// const filterText = `${i.cdblk.toLocaleLowerCase()} - ${i.nmblk.toLocaleLowerCase()}`;
	// 		const filterText = `${i.product_name}`
	// 		if(filterText.includes(text.toLocaleLowerCase())) return i;
	// 	});
	// }

	// onSubmit(withBack: boolean = false) {
	// 	this.hasFormErrors = false;
	// 	const controls = this.purchaseRequestForm.controls;
	// 	if (this.purchaseRequestForm.invalid) {
	// 		Object.keys(controls).forEach(controlName =>
	// 			controls[controlName].markAsTouched()
	// 		);

	// 		this.hasFormErrors = true;
	// 		this.selectedTab = 0;
	// 		return;
	// 	}

	// 	this.loading = true;
	// 	const editedpurchaseRequest = this.preparepurchaseRequest();
	// 	if (editedpurchaseRequest._id) {
	// 		this.updatepurchaseRequest(editedpurchaseRequest, withBack);
	// 		return;
	// 	}
	// 	this.addpurchaseRequest(editedpurchaseRequest, withBack);
	// }

	// preparepurchaseRequest(): PurchaseRequestModel {
	// 	const controls = this.purchaseRequestForm.controls;
	// 	const _purchaseRequest = new PurchaseRequestModel();
	// 	_purchaseRequest.clear();
	// 	_purchaseRequest._id = this.purchaseRequest._id;
	// 	_purchaseRequest.purchase_request_no = controls.purchase_request_no.value;
	// 	_purchaseRequest.request_date = controls.request_date.value;
	// 	_purchaseRequest.estimated_date = controls.estimated_date.value;
	// 	_purchaseRequest.product_name = controls.product_name.value;
	// 	_purchaseRequest.description = controls.description.value;
	// 	_purchaseRequest.status = controls.status.value;
	// 	_purchaseRequest.created_by = controls.created_by.value;
	// 	return _purchaseRequest;
	// }

	// addpurchaseRequest( _purchaseRequest: PurchaseRequestModel, withBack: boolean = false) {
	// 	const addSubscription = this.service.createPurchaseRequest(_purchaseRequest).subscribe(
	// 		res => {
	// 			const message = `New product category successfully has been added.`;
	// 			this.layoutUtilsService.showActionNotification(message, MessageType.Create, 5000, true, true);
	// 			const url = `/purchaseRequest`;
	// 			this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	// 		},
	// 		err => {
	// 			console.error(err);
	// 			const message = 'Error while adding product category | ' + err.statusText;
	// 			this.layoutUtilsService.showActionNotification(message, MessageType.Create, 5000, true, false);
	// 		}
	// 	);
	// 	this.subscriptions.push(addSubscription);
	// }

	// updatepurchaseRequest(_purchaseRequest: PurchaseRequestModel, withBack: boolean = false) {
	// 	const addSubscription = this.service.updatePurchaseRequest(_purchaseRequest).subscribe(
	// 		res => {
	// 			const message = `Product category successfully has been saved.`;
	// 			this.layoutUtilsService.showActionNotification(message, MessageType.Update, 5000, true, true);
	// 			const url = `/purchaseRequest`;
	// 			this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	// 		},
	// 		err => {
	// 			console.error(err);
	// 			const message = 'Error while adding product category | ' + err.statusText;
	// 			this.layoutUtilsService.showActionNotification(message, MessageType.Update, 5000, true, false);
	// 		}
	// 	);
	// 	this.subscriptions.push(addSubscription);
	// }

	// // decrease qty by id
	// decStock(_id){
	// 	console.log(this.dataSource);
		
	// 	let data = this.dataSource.getValue();
	// 	console.log(_id);
	// 	let index = data.findIndex((item) => item._id == _id)
	// 	console.log(data);
	// 	console.log(index);
	// 	let newData = {...data[index]}
	// 	if (newData.qty > 1) {
	// 		data[index].qty -= 1		
	// 	}



	// 	// if (data[index].qty > 1) {
	// 	// 	data[index].qty -= 1		
	// 	// }
	// 	this.dataSource.next(data)
	// }

	// // increase qty by id
	// intStock(_id, qty){
	// 	console.log(_id);
	// 	const data = this.dataSource.value;
	// 	let index = data.findIndex((item) => item._id == _id)
	// 	console.log(data);
	// 	console.log(index);
	// 	console.log(qty, "qty datal indet");
		
	// 	if (qty !== undefined && qty > 0) {
	// 		data[index].qty = data[index].qty + qty
	// 	} else {
	// 		data[index].qty += 1
	// 	}
	// 	this.dataSource.next(data)		
	// }

	// deleteProduct(_id){
	// 	let data = this.dataSource.value;
	// 	let index = data.findIndex((item) => item._id == _id)
	// 	let removed = data.splice(index, index + 1)
	// 	console.log(removed);
	// 	this.dataSource.next(data)
	// }

	// processMenuHandler() {
	// 	const dialogRef = this.dialog.open(PopupPurchaseRequest, {
	// 	  data: this.product_id,
	// 	  maxWidth: '500px',
	// 	  minHeight: '300px'
	// 	});
	// 	dialogRef.afterClosed().subscribe(result => {
	// 	const controls = this.purchaseRequestForm.controls;

	// 		console.log(result.data);
	// 		let data = this.dataSource.value;
	// 		console.log(data);
			
	// 		let dataExist = data.find((item) => item.product_name == result.data.product_name)					
	// 			if (!dataExist) {
	// 				data.push(result.data)
	// 				this.product_id = this.product_id + 1
	// 			} else {
	// 				console.log(dataExist.qty);
	// 				this.intStock(dataExist._id, result.data.qty)
	// 			}
				
	// 			console.log(this.loadingProduct);
				
	// 			controls.product_name.setValue(data)
	// 		this.dataSource.next(data)			
	// 	})

	// }
	
	// receivedHandler(e){
	// 	const controls = this.purchaseRequestForm.controls;

	// 	let strtDate = controls.request_date.value
	// 	let endDate = controls.estimated_date.value

	// 	this.minDate = strtDate
	// 	this.maxDate = endDate

	// 	console.log(e);
		
	// }
	
	getComponentTitle() {
		let result = `Request Product Detail`;
		return result;
	}

	onAlertClose($event) {
		this.hasFormErrors = false;
	}

  	ngOnDestroy() {
		this.subscriptions.forEach(sb => sb.unsubscribe());
	}
}