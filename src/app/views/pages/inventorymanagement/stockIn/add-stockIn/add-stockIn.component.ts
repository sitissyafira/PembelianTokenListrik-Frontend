import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Observable, Subscription } from 'rxjs';
import { Store, select } from '@ngrx/store';
import { AppState } from '../../../../../core/reducers';
import { SubheaderService, LayoutConfigService } from '../../../../../core/_base/layout';
import { LayoutUtilsService, MessageType } from '../../../../../core/_base/crud';
import { StockInModel } from "../../../../../core/inventorymanagement/stockIn/stockIn.model";
import {
	selectStockInActionLoading,
	selectStockInById
} from "../../../../../core/inventorymanagement/stockIn/stockIn.selector";
import { StockInService } from '../../../../../core/inventorymanagement/stockIn/stockIn.service';
import { SelectionModel } from '@angular/cdk/collections';
import { UomService } from '../../../../../core/masterData/asset/uom/uom.service';
import { QueryUomModel } from '../../../../../core/masterData/asset/uom/queryuom.model';
import { QueryStockProductModel } from '../../../../../core/inventorymanagement/stockProduct/querystockProduct.model';
import { StockProductService } from '../../../../../core/inventorymanagement/stockProduct/stockProduct.service';

@Component({
	selector: 'kt-add-stockIn',
	templateUrl: './add-stockIn.component.html',
	styleUrls: ['./add-stockIn.component.scss']
})
export class AddStockInComponent implements OnInit, OnDestroy {

	data = localStorage.getItem("currentUser");
	dataUser = JSON.parse(this.data)
	role = this.dataUser.role

	datauser = localStorage.getItem("user");
	stockIn: StockInModel;
	StockInId$: Observable<string>;
	selection = new SelectionModel<StockInModel>(true, []);
	oldStockIn: StockInModel;
	selectedTab = 0;
	loading$: Observable<boolean>;
	stockInForm: FormGroup;
	hasFormErrors = false;
	loading: boolean = false;
	date1 = new FormControl(new Date());
	productResult: any[] = [];
	productBrandResult: any[] = [];
	UOMResult: any[] = [];


	// Autocomplete Filter and Options
	ProductResultFiltered = [];
	viewProductResult = new FormControl();

	private loadingData = {
		product: false,
		UOM: false
	}

	private subscriptions: Subscription[] = [];
	constructor(
		private activatedRoute: ActivatedRoute,
		private router: Router,
		private stockInFB: FormBuilder,
		private subheaderService: SubheaderService,
		private layoutUtilsService: LayoutUtilsService,
		private store: Store<AppState>,
		private service: StockInService,
		private serviceProduct: StockProductService,
		private serviceUOM: UomService,
		private cd: ChangeDetectorRef,
		private layoutConfigService: LayoutConfigService
	) { }

	ngOnInit() {
		this.loading$ = this.store.pipe(select(selectStockInActionLoading));
		const routeSubscription = this.activatedRoute.params.subscribe(params => {
			this.stockIn = new StockInModel();
			this.stockIn.clear();
			this.initStockIn();
		}
		)

		this.subscriptions.push(routeSubscription);
	}

	initStockIn() {
		this.createForm();
		this.loadProduct()
		// this.loadUOM();
	}

	createForm() {
		this.stockInForm = this.stockInFB.group({
			date: [{ value: this.date1.value, disabled: true }],
			trNo: [""],
			product: [""],
			product_name: ["", Validators.required],
			current_qty: [{ value: "", disabled: true }, Validators.required],
			stock_in: ["", Validators.required],
			actual_qty: [{ value: "", disabled: true }],
			available_qty: [{ value: 0, disabled: true }],
			uom: [{ value: "", disabled: true }],
			buy_price: [{ value: "", disabled: false }],
			description: [""],
			approval: [""],
			created_by: [{ value: this.datauser, disabled: true }],
		});
	}



	/**
	 * @param value
	 */
	_setProductValue(value) {
		//console.log(value, 'from the option click');
		this.stockInForm.patchValue({ product: value._id });
		this.productChange(value._id);
	}

	_onKeyup(e: any) {
		this.stockInForm.patchValue({ product: undefined });
		this._filterProductList(e.target.value);
	}

	_filterProductList(text: string) {
		this.ProductResultFiltered = this.productResult.filter(i => {
			const filterText = `${i.product_name.toLocaleLowerCase()}`;
			if (filterText.includes(text.toLocaleLowerCase())) return i;
		});
	}

	loadProduct() {
		this.loadingData.product = true;
		this.selection.clear();
		const queryParams = new QueryStockProductModel(
			null,
			1,
			100000
		);
		this.serviceProduct.getListStockProduct(queryParams).subscribe(
			res => {
				this.productResult = res.data;
				this.ProductResultFiltered = this.productResult.slice();
				this.cd.markForCheck();
				this.viewProductResult.enable();

				this.loadingData.product = false;
				this.cd.markForCheck();
			}
		);
	}

	productChange(id) {
		if (id) {
			this.serviceProduct.findStockProductById(id).subscribe(
				res => {
					console.log(res.data);
					const controls = this.stockInForm.controls;
					controls.uom.setValue(res.data.uom.uom);
					controls.current_qty.setValue(res.data.stock_qty);
					controls.available_qty.setValue(res.data.available_qty);
					controls.product_name.setValue(res.data.product_name)
					controls.buy_price.setValue(res.data.buy_price)
					this.addActualQty()
				}
			);
		}
	};

	addActualQty() {
		const actual = Number(this.stockInForm.controls.current_qty.value);
		const stockIn = Number(this.stockInForm.controls.stock_in.value);

		if (actual >= 0) {
			const controls = this.stockInForm.controls;
			controls.actual_qty.setValue(actual + stockIn);
		}
	}


	// loadUOM() {
	// 	this.loadingData.UOM = true;
	// 	this.selection.clear();
	// 	const queryParams = new QueryUomModel(
	// 		null,
	// 		null,
	// 		null,
	// 		1,
	// 		1000
	// 	);
	// 	this.serviceUOM.getListUom(queryParams).subscribe(
	// 		res => {
	// 			this.UOMResult = res.data;
	// 			this.loadingData.UOM = false;
	// 			this.cd.markForCheck();
	// 		}
	// 	);
	// }

	goBackWithId() {
		const url = `/stockIn`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}
	refreshStockIn(isNew: boolean = false, id: string = "") {
		let url = this.router.url;
		if (!isNew) {
			this.router.navigate([url], { relativeTo: this.activatedRoute });
			return;
		}
		url = `/stockIn/edit/${id}`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}
	onSubmit(withBack: boolean = false) {
		this.hasFormErrors = false;
		const controls = this.stockInForm.controls;
		console.log(controls.product.value, "tes")
		if (this.stockInForm.invalid) {
			Object.keys(controls).forEach(controlName =>
				controls[controlName].markAsTouched()
			);

			this.hasFormErrors = true;
			this.selectedTab = 0;
			return;
		}

		this.loading = true;
		const editedStockIn = this.prepareStockIn();
		this.addStockIn(editedStockIn, withBack);
	}

	prepareStockIn(): StockInModel {
		const controls = this.stockInForm.controls;
		const _stockIn = new StockInModel();
		_stockIn.clear();
		_stockIn._id = this.stockIn._id;
		_stockIn.date = controls.date.value;
		_stockIn.trNo = controls.trNo.value;
		_stockIn.product = controls.product.value;
		_stockIn.product_name = controls.product_name.value.toLowerCase();
		_stockIn.current_qty = controls.current_qty.value;
		_stockIn.stock_in = controls.stock_in.value;
		_stockIn.actual_qty = controls.actual_qty.value;
		_stockIn.uom = controls.uom.value;
		_stockIn.buy_price = controls.buy_price.value;
		_stockIn.description = controls.description.value;
		_stockIn.approval = controls.approval.value;
		_stockIn.created_by = controls.created_by.value;
		return _stockIn;

	}

	addStockIn(_stockIn: StockInModel, withBack: boolean = false) {
		const addSubscription = this.service.createStockIn(_stockIn).subscribe(
			res => {
				const message = `New stock in successfully has been added.`;
				this.layoutUtilsService.showActionNotification(message, MessageType.Create, 5000, true, true);
				const url = `/stockIn`;
				this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
			},
			err => {
				console.error(err);
				const message = 'Error while adding stock in | ' + err.statusText;
				this.layoutUtilsService.showActionNotification(message, MessageType.Create, 5000, true, false);
			}
		);
		this.subscriptions.push(addSubscription);
	}


	getComponentTitle() {
		let result = 'Create Stock In';
		return result;
	}

	onAlertClose($event) {
		this.hasFormErrors = false;
	}

	ngOnDestroy() {
		this.subscriptions.forEach(sb => sb.unsubscribe());
	}

	inputKeydownHandler(event) {
		return event.keyCode === 8 || event.keyCode === 46 || event.keyCode === 189 ? true : !isNaN(Number(event.key));
	}
}
