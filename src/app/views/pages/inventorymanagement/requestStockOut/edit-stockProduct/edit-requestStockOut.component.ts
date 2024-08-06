import {ChangeDetectorRef, Component, OnDestroy, OnInit} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable, Subscription } from 'rxjs';
import { Store, select } from '@ngrx/store';
import { AppState } from '../../../../../core/reducers';
import { SubheaderService, LayoutConfigService } from '../../../../../core/_base/layout';
import { LayoutUtilsService, MessageType } from '../../../../../core/_base/crud';
import {RequestStockOutModel} from "../../../../../core/inventorymanagement/requestStockOut/requestStockOut.model";
import {
	selectRequestStockOutActionLoading,
	selectRequestStockOutById
} from "../../../../../core/inventorymanagement/requestStockOut/requestStockOut.selector";
import {RequestStockOutService} from '../../../../../core/inventorymanagement/requestStockOut/requestStockOut.service';
import { SelectionModel } from '@angular/cdk/collections';
import { QueryStockProductModel } from '../../../../../core/inventorymanagement/stockProduct/querystockProduct.model';
import { StockProductService } from '../../../../../core/inventorymanagement/stockProduct/stockProduct.service';


@Component({
  selector: 'kt-edit-requestStockOut',
  templateUrl: './edit-requestStockOut.component.html',
  styleUrls: ['./edit-requestStockOut.component.scss']
})
export class EditRequestStockOutComponent implements OnInit, OnDestroy {
	data = localStorage.getItem("currentUser");
	dataUser = JSON.parse(this.data)
	role = this.dataUser.role
	datauser = localStorage.getItem("user");
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

	private loadingData = {
		productCategory: false,
		productBrand : false,
		UOM : false
	}

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
			const id = params.id;
			if (id) {
				this.store.pipe(select(selectRequestStockOutById(id))).subscribe(res => {
					if (res) {
						this.requestStockOut = res;
						this.oldRequestStockOut = Object.assign({}, this.requestStockOut);
						this.initRequestStockOut();
					}
				});
			}
		});
		this.subscriptions.push(routeSubscription);
  	}

	initRequestStockOut() {
		this.createForm();
		this.loadProduct();
        this.getProduct(this.requestStockOut.product._id)

	}

	createForm() {
        this.requestStockOutForm = this.requestStockOutFB.group({
            rsoNo : [{value:this.requestStockOut.rsoNo, disabled:true}],
            product: [{value:this.requestStockOut.product._id, disabled:true}],
            qtyRequest : [{value:this.requestStockOut.qtyRequest, disabled:true}],
            uom :[{value:this.requestStockOut.product.uom, disabled:true}],
            approve : [this.requestStockOut.approve],
            status : [this.requestStockOut.status],
            description : [{value:this.requestStockOut.description, disabled:true}],

            created_date : [{value:this.requestStockOut.created_date, disabled:true}],
            created_by: [{value:this.requestStockOut.created_by, disabled:true}],
        });
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
		this.updateRequestStockOut(editedRequestStockOut, withBack);
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

	updateRequestStockOut(_requestStockOut: RequestStockOutModel, withBack: boolean = false) {
		const addSubscription = this.service.updateRequestStockOut(_requestStockOut).subscribe(
			res => {
				const message = `Request Stock Out successfully has been saved.`;
				this.layoutUtilsService.showActionNotification(message, MessageType.Update, 5000, true, true);
				const url = `/requestStockOut`;
				this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
			},
			err => {
				console.error(err);
				const message = 'Error while adding Request Stock Out | ' + err.statusText;
				this.layoutUtilsService.showActionNotification(message, MessageType.Update, 5000, true, false);
			}
		);
		this.subscriptions.push(addSubscription);
	}

	getComponentTitle() {
		let result = `Edit Request Stock Out`;
		return result;
	}

	onAlertClose($event) {
		this.hasFormErrors = false;
	}

  	ngOnDestroy() {
		this.subscriptions.forEach(sb => sb.unsubscribe());
	}
}
