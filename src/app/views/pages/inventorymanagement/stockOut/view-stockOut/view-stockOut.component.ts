import {ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { Store, select } from '@ngrx/store';
import { AppState } from '../../../../../core/reducers';
import { SubheaderService, LayoutConfigService } from '../../../../../core/_base/layout';
import { LayoutUtilsService, MessageType } from '../../../../../core/_base/crud';
import {StockOutModel} from "../../../../../core/inventorymanagement/stockOut/stockOut.model";
import {
	selectStockOutActionLoading,
	selectStockOutById
} from "../../../../../core/inventorymanagement/stockOut/stockOut.selector";
import {StockOutService} from '../../../../../core/inventorymanagement/stockOut/stockOut.service';
import { StockProductService } from '../../../../../core/inventorymanagement/stockProduct/stockProduct.service';
import { SelectionModel } from '@angular/cdk/collections';
import { StockProductModel } from '../../../../../core/inventorymanagement/stockProduct/stockProduct.model';
import { MatDialog } from '@angular/material/dialog';

import { TaxService } from '../../../../../core/masterData/tax/tax.service';
import { TaxModel } from '../../../../../core/masterData/tax/tax.model';
import { QueryRequestStockOutModel } from '../../../../../core/inventorymanagement/requestStockOut/queryrequestStockOut.model';
import { RequestStockOutService } from '../../../../../core/inventorymanagement/requestStockOut/requestStockOut.service';


@Component({
  selector: 'kt-view-stockOut',
  templateUrl: './view-stockOut.component.html',
  styleUrls: ['./view-stockOut.component.scss']
})
export class ViewStockOutComponent implements OnInit, OnDestroy {
	datauser = localStorage.getItem("user");
	stockOut: StockOutModel;
	stockOutId$: Observable<string>;
	oldstockOut: StockOutModel;
	selectedTab = 0;
	loading$: Observable<boolean>;
	stockOutForm: FormGroup;
	hasFormErrors = false;
	loading : boolean = false;
	loadingProduct : boolean = false;
	loadingGenerate: boolean = false;
	loadingTax : boolean = false;
	date1 = new FormControl(new Date());

	product_id = 1;
	minDate: Date;
	maxDate: Date;
	status : boolean;
	purchase_request_no: any;

	selection = new SelectionModel<StockProductModel>(true, []);
	selectionTax = new SelectionModel<TaxModel>(true, []);
	ProductResult: any[] = [];
	codenum

	PRResult: any[] = [];

	// Autocomplete Filter and Options
	productResultFiltered = [];
	viewProductResult = new FormControl();

	// Private properties
	dataSource: any = new BehaviorSubject([]);
	displayedColumns = ["product_code", "product_name", "qty_In_Stock", "qty", "actions"];

	private subscriptions: Subscription[] = [];
  	constructor(
		private activatedRoute: ActivatedRoute,
		private router: Router,
    	private dialog: MatDialog,
		private stockOutFB: FormBuilder,
		private serviceProduct: StockProductService,
		private serviceTax: TaxService,
		private cd: ChangeDetectorRef,
		private subheaderService: SubheaderService,
		private layoutUtilsService: LayoutUtilsService,
		private store: Store<AppState>,
		private service: StockOutService,
		private servicePR : RequestStockOutService,
		private layoutConfigService: LayoutConfigService
	) { }

  	ngOnInit() {
		this.loading$ = this.store.pipe(select(selectStockOutActionLoading));
		const routeSubscription =  this.activatedRoute.params.subscribe(params => {
			const id = params.id;
			// if (id) {
				this.store.pipe(select(selectStockOutById(id))).subscribe(res => {
					if (res) {
						//console.log(res);
						this.stockOut = res;
						// // this.status = res.status;
						// let dataSource = res.product_name.map((item) => {
						// 	return Object.assign({}, item)
						// })
						// console.log(dataSource);
						// this.dataSource.next(dataSource)

						this.oldstockOut = Object.assign({}, this.stockOut);
						this.initstockOut();
					}
				});
			// } else
			// {
				// this.stockOut = new StockOutModel();
				// this.stockOut.clear();
				// this.initstockOut();
			// }
		});
		this.subscriptions.push(routeSubscription);
  	}

	initstockOut() {
		this.createForm();
		this.loadPR();
	}

	createForm() {
			this.stockOutForm = this.stockOutFB.group({
				stockOutNo : [{value:this.stockOut.stockOutNo, disabled:true}],
				request_no : [{value:this.stockOut.request_no, disabled:true}],
				product : [{value:this.stockOut.product, disabled:true}],
				product_name : [{value:this.stockOut.product_name, disabled:true}],
				uom : [{value:this.stockOut.product.uom.uom, disabled:true}],
				current_qty : [{value:this.stockOut.current_qty, disabled:true}],
				stock_out : [{value:this.stockOut.stock_out, disabled:true}],
				actual_qty : [{value:this.stockOut.actual_qty, disabled:true}],
				available_qty : [{value:this.stockOut.product.available_qty, disabled:true}],
				description : [{value:this.stockOut.description, disabled:true}],
				created_by: [{value:this.datauser, disabled:true}],
				created_date : [{value:this.date1.value, disabled:true}],
				// approve : [{value:"", disabled:false}],
				// status : [{value:"", disabled:false}]
			});
	}

	goBackWithId() {
		const url = `/stockOut`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}
	refreshstockOut(isNew: boolean = false, id:string = "") {
		let url = this.router.url;
		if (!isNew) {
			this.router.navigate([url], { relativeTo: this.activatedRoute });
			return;
		}
		url = `/stockOut/edit/${id}`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}

	// getNumber(){
	// 	this.loadingGenerate = true
	// 	const controls = this.stockOutForm.controls;
	// 	this.service.generatePRCode().subscribe(
	// 		res => {
	// 			console.log(res.data);

	// 			this.purchase_request_no = res.data;
	// 			controls.purchase_request_no.setValue(this.purchase_request_no);
	// 			this.loadingGenerate = false;
	// 		}
	// 	)
	// }

	loadPR(){
		this.selection.clear();
		const queryParams = new QueryRequestStockOutModel(
			null,
			1,
			10000
		);
		this.servicePR.getListRequestStockOut(queryParams).subscribe(
			res => {
				this.PRResult = res.data;
			}
		);
	}


	pronChange(id){
		if(id){
			this.servicePR.findRequestStockOutById(id).subscribe(
				res => {
					const controls = this.stockOutForm.controls;
					// controls.uom.setValue(res.data.uom.uom);
					controls.current_qty.setValue(res.data.product.stock_qty);
					controls.product_name.setValue(res.data.product.product_name)
					controls.stock_out.setValue(res.data.qtyRequest);
					controls.description.setValue(res.data.description);
					controls.product.setValue(res.data.product);
					this.addActualQty()
				}
			);
		}
	};


	addActualQty(){
		const actual =	Number(this.stockOutForm.controls.current_qty.value);
		const stockOut = Number(this.stockOutForm.controls.stock_out.value);

		this.hasFormErrors = false;
		const data = actual - stockOut
		if (data < 0){
			this.hasFormErrors = true
		}else{
			const controls = this.stockOutForm.controls;
			controls.actual_qty.setValue(actual - stockOut);
		}
	}

	getComponentTitle() {
		let result = `View Stock out`;
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
