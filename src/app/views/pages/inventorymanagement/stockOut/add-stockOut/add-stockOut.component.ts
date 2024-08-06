import {
	ChangeDetectionStrategy,
	ChangeDetectorRef,
	Component,
	OnDestroy,
	OnInit,
} from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import {
	FormBuilder,
	FormControl,
	FormGroup,
	Validators,
} from "@angular/forms";
import { BehaviorSubject, Observable, Subscription } from "rxjs";
import { Store, select } from "@ngrx/store";
import { AppState } from "../../../../../core/reducers";
import {
	SubheaderService,
	LayoutConfigService,
} from "../../../../../core/_base/layout";
import {
	LayoutUtilsService,
	MessageType,
} from "../../../../../core/_base/crud";
import { StockOutModel } from "../../../../../core/inventorymanagement/stockOut/stockOut.model";
import {
	selectStockOutActionLoading,
	selectStockOutById,
} from "../../../../../core/inventorymanagement/stockOut/stockOut.selector";
import { StockOutService } from "../../../../../core/inventorymanagement/stockOut/stockOut.service";
import { StockProductService } from "../../../../../core/inventorymanagement/stockProduct/stockProduct.service";
import { SelectionModel } from "@angular/cdk/collections";
import { StockProductModel } from "../../../../../core/inventorymanagement/stockProduct/stockProduct.model";
import { MatDialog } from "@angular/material/dialog";

import { TaxService } from "../../../../../core/masterData/tax/tax.service";
import { TaxModel } from "../../../../../core/masterData/tax/tax.model";
import { QueryRequestStockOutModel } from "../../../../../core/inventorymanagement/requestStockOut/queryrequestStockOut.model";
import { RequestStockOutService } from "../../../../../core/inventorymanagement/requestStockOut/requestStockOut.service";

@Component({
	selector: "kt-add-stockOut",
	templateUrl: "./add-stockOut.component.html",
	styleUrls: ["./add-stockOut.component.scss"],
})
export class AddStockOutComponent implements OnInit, OnDestroy {
	datauser = localStorage.getItem("user");
	stockOut: StockOutModel;
	stockOutId$: Observable<string>;
	oldstockOut: StockOutModel;
	selectedTab = 0;
	loading$: Observable<boolean>;
	stockOutForm: FormGroup;
	hasFormErrors = false;
	loading: boolean = false;
	loadingProduct: boolean = false;
	loadingGenerate: boolean = false;
	loadingTax: boolean = false;
	date1 = new FormControl(new Date());

	product_id = 1;
	minDate: Date;
	maxDate: Date;
	status: boolean;
	purchase_request_no: any;

	selection = new SelectionModel<StockProductModel>(true, []);
	selectionTax = new SelectionModel<TaxModel>(true, []);
	ProductResult: any[] = [];
	codenum;

	PRResult: any[] = [];

	// Autocomplete Filter and Options
	productResultFiltered = [];
	viewProductResult = new FormControl();

	// Private properties

	dataSource: any = new BehaviorSubject([]);
	displayedColumns = [
		"product_code",
		"product_name",
		"qty_In_Stock",
		"qty",
		"actions",
	];

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
		private servicePR: RequestStockOutService,
		private layoutConfigService: LayoutConfigService
	) {}

	ngOnInit() {
		this.loading$ = this.store.pipe(select(selectStockOutActionLoading));
		const routeSubscription = this.activatedRoute.params.subscribe(
			(params) => {
				// const id = params.id;
				// if (id) {
				// 	this.store.pipe(select(selectStockOutById(id))).subscribe(res => {
				// 		if (res) {
				// 			console.log(res);
				// 			this.stockOut = res;
				// 			this.status = res.status;
				// 			let dataSource = res.product_name.map((item) => {
				// 				return Object.assign({}, item)
				// 			})
				// 			console.log(dataSource);
				// 			this.dataSource.next(dataSource)
				// 			this.oldstockOut = Object.assign({}, this.stockOut);
				// 			this.initstockOut();
				// 		}
				// 	});
				// } else
				// {
				this.stockOut = new StockOutModel();
				this.stockOut.clear();
				this.initstockOut();
				// }
			}
		);
		this.subscriptions.push(routeSubscription);
	}

	initstockOut() {
		this.createForm();
		this.loadPR();
		this.getNumber();
		// this.loadProductList()
	}

	createForm() {
		this.stockOutForm = this.stockOutFB.group({
			stockOutNo: [{ value: "", disabled: true }],
			request_no: [{ value: "", disabled: false }],
			product: [{ value: "", disabled: true }],
			product_name: [{ value: "", disabled: true }],
			uom: [{ value: "", disabled: true }],
			current_qty: [{ value: "", disabled: true }],
			stock_out: [{ value: "", disabled: false }],
			actual_qty: [{ value: "", disabled: true }],
			available_qty: [{ value: "", disabled: true }],
			description: [
				{ value: this.stockOut.description, disabled: false },
			],
			created_by: [{ value: this.datauser, disabled: true }],
			created_date: [{ value: this.date1.value, disabled: true }],
			// approve : [{value:"", disabled:false}],
			// status : [{value:"", disabled:false}]
		});
	}

	getNumber() {
		this.service.generateCode().subscribe((res) => {
			this.codenum = res.data;
			const controls = this.stockOutForm.controls;
			controls.stockOutNo.setValue(this.codenum);
		});
	}

	goBackWithId() {
		const url = `/stockOut`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}
	refreshstockOut(isNew: boolean = false, id: string = "") {
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

	loadPR() {
		this.selection.clear();
		const queryParams = new QueryRequestStockOutModel(null, 1, 10000);
		this.servicePR
			.getListRequestStockOutTrue(queryParams)
			.subscribe((res) => {
				this.PRResult = res.data;
			});
	}

	pronChange(id) {
		if (id) {
			this.servicePR.findRequestStockOutById(id).subscribe((res) => {
				//console.log(res);
				const controls = this.stockOutForm.controls;
				controls.request_no.setValue(res.data._id);
				controls.uom.setValue(res.data.product.uom.uom);
				controls.current_qty.setValue(res.data.product.stock_qty);
				controls.available_qty.setValue(res.data.available_qty);
				controls.product_name.setValue(res.data.product.product_name);
				controls.stock_out.setValue(res.data.qtyRequest);
				controls.description.setValue(res.data.description);
				controls.product.setValue(res.data.product);
				this.addActualQty();
			});
		}
	}

	addActualQty() {
		//const actual =	Number(this.stockOutForm.controls.current_qty.value);
		const avail_qty = Number(
			this.stockOutForm.controls.available_qty.value
		);
		const stockOut = Number(this.stockOutForm.controls.stock_out.value);

		this.hasFormErrors = false;
		//const data = actual - stockOut
		const data = avail_qty - stockOut;
		if (data < 0) {
			this.hasFormErrors = true;
		} else {
			const controls = this.stockOutForm.controls;
			controls.available_qty.setValue(avail_qty - stockOut);
		}
	}

	onSubmit(withBack: boolean = false) {
		this.hasFormErrors = false;
		const controls = this.stockOutForm.controls;
		if (this.stockOutForm.invalid) {
			Object.keys(controls).forEach((controlName) =>
				controls[controlName].markAsTouched()
			);

			this.hasFormErrors = true;
			this.selectedTab = 0;
			return;
		}

		this.loading = true;
		const editedstockOut = this.preparestockOut();
		if (editedstockOut._id) {
			this.updatestockOut(editedstockOut, withBack);
			return;
		}
		this.addstockOut(editedstockOut, withBack);
	}

	preparestockOut(): StockOutModel {
		const controls = this.stockOutForm.controls;
		const _stockOut = new StockOutModel();
		_stockOut.clear();
		_stockOut._id = this.stockOut._id;
		_stockOut.stockOutNo = controls.stockOutNo.value;
		_stockOut.request_no = controls.request_no.value;
		_stockOut.product = controls.product.value;
		_stockOut.product_name = controls.product_name.value;
		_stockOut.uom = controls.uom.value;
		_stockOut.current_qty = controls.current_qty.value;
		_stockOut.stock_out = controls.stock_out.value;
		_stockOut.actual_qty = controls.actual_qty.value;
		_stockOut.description = controls.description.value;
		_stockOut.created_date = controls.created_date.value;
		_stockOut.created_by = controls.created_by.value;
		_stockOut.available_qty = controls.available_qty.value;

		return _stockOut;
	}

	addstockOut(_stockOut: StockOutModel, withBack: boolean = false) {
		const addSubscription = this.service
			.createStockOut(_stockOut)
			.subscribe(
				(res) => {
					const message = `New stock out data successfully has been added.`;
					this.layoutUtilsService.showActionNotification(
						message,
						MessageType.Create,
						5000,
						true,
						true
					);
					const url = `/stockOut`;
					this.router.navigateByUrl(url, {
						relativeTo: this.activatedRoute,
					});
				},
				(err) => {
					console.error(err);
					const message =
						"Error while adding stock out | " + err.statusText;
					this.layoutUtilsService.showActionNotification(
						message,
						MessageType.Create,
						5000,
						true,
						false
					);
				}
			);
		this.subscriptions.push(addSubscription);
	}

	updatestockOut(_stockOut: StockOutModel, withBack: boolean = false) {
		const addSubscription = this.service
			.updateStockOut(_stockOut)
			.subscribe(
				(res) => {
					const message = `Stock Out successfully has been saved.`;
					this.layoutUtilsService.showActionNotification(
						message,
						MessageType.Update,
						5000,
						true,
						true
					);
					const url = `/stockOut`;
					this.router.navigateByUrl(url, {
						relativeTo: this.activatedRoute,
					});
				},
				(err) => {
					console.error(err);
					const message =
						"Error while adding stock out | " + err.statusText;
					this.layoutUtilsService.showActionNotification(
						message,
						MessageType.Update,
						5000,
						true,
						false
					);
				}
			);
		this.subscriptions.push(addSubscription);
	}

	getComponentTitle() {
		let result = "Create Stock Out";
		if (!this.stockOut || !this.stockOut._id) {
			return result;
		}

		result = `Edit Stock out`;
		return result;
	}

	onAlertClose($event) {
		this.hasFormErrors = false;
	}

	ngOnDestroy() {
		this.subscriptions.forEach((sb) => sb.unsubscribe());
	}

	inputKeydownHandler(event) {
		return event.keyCode === 8 ||
			event.keyCode === 46 ||
			event.keyCode === 189
			? true
			: !isNaN(Number(event.key));
	}
}
