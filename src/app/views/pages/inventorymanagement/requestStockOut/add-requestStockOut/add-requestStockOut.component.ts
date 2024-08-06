import {ChangeDetectorRef, Component, OnDestroy, OnInit} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Observable, Subscription } from 'rxjs';
import { Store, select } from '@ngrx/store';
import { AppState } from '../../../../../core/reducers';
import { SubheaderService, LayoutConfigService } from '../../../../../core/_base/layout';
import { LayoutUtilsService, MessageType } from '../../../../../core/_base/crud';
import {RequestStockOutModel} from "../../../../../core/inventorymanagement/requestStockOut/requestStockOut.model";
import {
	selectRequestStockOutActionLoading,
} from "../../../../../core/inventorymanagement/requestStockOut/requestStockOut.selector";
import {RequestStockOutService} from '../../../../../core/inventorymanagement/requestStockOut/requestStockOut.service';
import { SelectionModel } from '@angular/cdk/collections';
import { QueryStockProductModel } from '../../../../../core/inventorymanagement/stockProduct/querystockProduct.model';
import { StockProductService } from '../../../../../core/inventorymanagement/stockProduct/stockProduct.service';

@Component({
  selector: 'kt-add-requestStockOut',
  templateUrl: './add-requestStockOut.component.html',
  styleUrls: ['./add-requestStockOut.component.scss']
})
export class AddRequestStockOutComponent implements OnInit, OnDestroy {
	datauser = localStorage.getItem("user");
	data = localStorage.getItem("currentUser");
	dataUser = JSON.parse(this.data)
	role = this.dataUser.role
	requestStockOut: RequestStockOutModel;
	RequestStockOutId$: Observable<string>;
	selection = new SelectionModel<RequestStockOutModel>(true, []);
	oldRequestStockOut: RequestStockOutModel;
	selectedTab = 0;
	loading$: Observable<boolean>;
	requestStockOutForm: FormGroup;
	hasFormErrors = false;
	loading : boolean = false;
	productResult: any[] = [];
	productBrandResult: any[] = [];
	UOMResult: any[] = [];
	date1 = new FormControl(new Date());
	codenum


	private subscriptions: Subscription[] = [];
  	constructor(
		private activatedRoute: ActivatedRoute,
		private router: Router,
		private requestStockOutFB: FormBuilder,
		private subheaderService: SubheaderService,
		private layoutUtilsService: LayoutUtilsService,
		private store: Store<AppState>,
		private service: RequestStockOutService,
		private serviceProduct : StockProductService,
		private cd: ChangeDetectorRef,
		private layoutConfigService: LayoutConfigService
	) { }

  	ngOnInit() {
		this.loading$ = this.store.pipe(select(selectRequestStockOutActionLoading));
		const routeSubscription =  this.activatedRoute.params.subscribe(params => {
				this.requestStockOut = new RequestStockOutModel();
				this.requestStockOut.clear();
				this.initRequestStockOut();
			}
		)
		this.subscriptions.push(routeSubscription);
  	}

	initRequestStockOut() {
		this.createForm();
		this.loadProduct();
		this.getNumber()
	}

	createForm() {
			this.requestStockOutForm = this.requestStockOutFB.group({
				rsoNo : [{value:"", disabled:true}],
				product: [{value:"", disabled:false}],
				qtyRequest : [{value:"", disabled:false}],
				uom :[{value:"", disabled:true}],
				approve : [""],
				status : [false],
				description : [""],

				created_date : [{value:this.date1.value, disabled:true}],
				created_by: [{value:this.datauser, disabled:true}],
			});
	}

	getNumber() {
		this.service.generateCode().subscribe(
			res => {
				this.codenum = res.data
				const controls = this.requestStockOutForm.controls;
				controls.rsoNo.setValue(this.codenum);
			}
		)
	}

	loadProduct() {
		this.selection.clear();
		const queryParams = new QueryStockProductModel(
			null,
			1,
			100000
		);
		this.serviceProduct.getListStockProduct(queryParams).subscribe(
			res => {
				this.productResult = res.data;

			}
		);
	}


	getProduct(id){
		const controls = this.requestStockOutForm.controls;
		 this.serviceProduct.findStockProductById(id).subscribe(data =>{
			controls.uom.setValue(data.data.uom.uom);
		 	}
		 );
	}

	goBackWithId() {
		const url = `/requestStockOut`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}
	refreshRequestStockOut(isNew: boolean = false, id:string = "") {
		let url = this.router.url;
		if (!isNew) {
			this.router.navigate([url], { relativeTo: this.activatedRoute });
			return;
		}
		url = `/requestStockOut/edit/${id}`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}
	onSubmit(withBack: boolean = false) {
		this.hasFormErrors = false;
		const controls = this.requestStockOutForm.controls;
		if (this.requestStockOutForm.invalid) {
			Object.keys(controls).forEach(controlName =>
				controls[controlName].markAsTouched()
			);

			this.hasFormErrors = true;
			this.selectedTab = 0;
			return;
		}

		this.loading = true;
		const editedRequestStockOut = this.prepareRequestStockOut();
		this.addRequestStockOut(editedRequestStockOut, withBack);
	}

	prepareRequestStockOut(): RequestStockOutModel {
		const controls = this.requestStockOutForm.controls;
		const _requestStockOut = new RequestStockOutModel();
		_requestStockOut.clear();
		_requestStockOut._id = this.requestStockOut._id;
		_requestStockOut.rsoNo = controls.rsoNo.value;
		_requestStockOut.approve = controls.approve.value
		_requestStockOut.status = controls.status.value;
		_requestStockOut.product = controls.product.value;
		_requestStockOut.qtyRequest = controls.qtyRequest.value;
		_requestStockOut.description = controls.description.value;
		_requestStockOut.created_date = controls.created_date.value;
		_requestStockOut.created_by = controls.created_by.value;
		return _requestStockOut;
	}

	addRequestStockOut( _requestStockOut: RequestStockOutModel, withBack: boolean = false) {
		const addSubscription = this.service.createRequestStockOut(_requestStockOut).subscribe(
			res => {
				const message = `New request stock out successfully has been added.`;
				this.layoutUtilsService.showActionNotification(message, MessageType.Create, 5000, true, true);
				const url = `/requestStockOut`;
				this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
			},
			err => {
				console.error(err);
				const message = 'Error while adding request stock out | ' + err.statusText;
				this.layoutUtilsService.showActionNotification(message, MessageType.Create, 5000, true, false);
			}
		);
		this.subscriptions.push(addSubscription);
	}


	getComponentTitle() {
		let result = 'Create';
		return result;
	}

	onAlertClose($event) {
		this.hasFormErrors = false;
	}

  	ngOnDestroy() {
		this.subscriptions.forEach(sb => sb.unsubscribe());
	}

	inputKeydownHandler(event) {
		return event.keyCode === 8 || event.keyCode === 46 || event.keyCode === 189  ? true : !isNaN(Number(event.key));
	}
}
