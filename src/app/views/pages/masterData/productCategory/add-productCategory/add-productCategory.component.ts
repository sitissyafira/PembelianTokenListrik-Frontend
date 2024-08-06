import {Component, OnDestroy, OnInit} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable, Subscription } from 'rxjs';
import { Store, select } from '@ngrx/store';
import { AppState } from '../../../../../core/reducers';
import { SubheaderService, LayoutConfigService } from '../../../../../core/_base/layout';
import { LayoutUtilsService, MessageType } from '../../../../../core/_base/crud';
import {ProductCategoryModel} from "../../../../../core/masterData/productCategory/productCategory.model";
import {
	selectProductCategoryActionLoading,
	selectProductCategoryById
} from "../../../../../core/masterData/productCategory/productCategory.selector";
import {ProductCategoryService} from '../../../../../core/masterData/productCategory/productCategory.service';

@Component({
  selector: 'kt-add-productCategory',
  templateUrl: './add-productCategory.component.html',
  styleUrls: ['./add-productCategory.component.scss']
})
export class AddProductCategoryComponent implements OnInit, OnDestroy {
	datauser = localStorage.getItem("user");
	productCategory: ProductCategoryModel;
	ProductCategoryId$: Observable<string>;
	oldProductCategory: ProductCategoryModel;
	selectedTab = 0;
	loading$: Observable<boolean>;
	productCategoryForm: FormGroup;
	hasFormErrors = false;
	loading : boolean = false;

	private subscriptions: Subscription[] = [];
  	constructor(
		private activatedRoute: ActivatedRoute,
		private router: Router,
		private productCategoryFB: FormBuilder,
		private subheaderService: SubheaderService,
		private layoutUtilsService: LayoutUtilsService,
		private store: Store<AppState>,
		private service: ProductCategoryService,
		private layoutConfigService: LayoutConfigService
	) { }

  	ngOnInit() {
		this.loading$ = this.store.pipe(select(selectProductCategoryActionLoading));
		const routeSubscription =  this.activatedRoute.params.subscribe(params => {
			const id = params.id;
			if (id) {
				this.store.pipe(select(selectProductCategoryById(id))).subscribe(res => {
					if (res) {
						this.productCategory = res;
						this.oldProductCategory = Object.assign({}, this.productCategory);
						this.initProductCategory();
					}
				});
			} else {
				this.productCategory = new ProductCategoryModel();
				this.productCategory.clear();
				this.initProductCategory();
			}
		});
		this.subscriptions.push(routeSubscription);
  	}

	initProductCategory() {
		this.createForm();
	}

	createForm() {
		if (this.productCategory._id){
			this.productCategoryForm = this.productCategoryFB.group({
				category_code: [this.productCategory.category_code, Validators.required],
				category_name: [this.productCategory.category_name, Validators.required],
				description: [this.productCategory.description],
				createdBy: [this.productCategory.createdBy],
			});
		}else{
			this.productCategoryForm = this.productCategoryFB.group({
				category_code: ["", Validators.required],
				category_name: ["", Validators.required],
				description: [""],
				createdBy: [{value:this.datauser, disabled:true}],
			});
		}
	}

	goBackWithId() {
		const url = `/productCategory`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}

	refreshProductCategory(isNew: boolean = false, id:string = "") {
		let url = this.router.url;
		if (!isNew) {
			this.router.navigate([url], { relativeTo: this.activatedRoute });
			return;
		}
		url = `/productCategory/edit/${id}`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}

	onSubmit(withBack: boolean = false) {
		this.hasFormErrors = false;
		const controls = this.productCategoryForm.controls;
		if (this.productCategoryForm.invalid) {
			Object.keys(controls).forEach(controlName =>
				controls[controlName].markAsTouched()
			);

			this.hasFormErrors = true;
			this.selectedTab = 0;
			return;
		}

		this.loading = true;
		const editedProductCategory = this.prepareProductCategory();
		if (editedProductCategory._id) {
			this.updateProductCategory(editedProductCategory, withBack);
			return;
		}
		this.addProductCategory(editedProductCategory, withBack);
	}

	prepareProductCategory(): ProductCategoryModel {
		const controls = this.productCategoryForm.controls;
		const _productCategory = new ProductCategoryModel();
		_productCategory.clear();
		_productCategory._id = this.productCategory._id;
		_productCategory.category_code = controls.category_code.value;
		_productCategory.category_name = controls.category_name.value.toLowerCase();
		_productCategory.description = controls.description.value;
		_productCategory.createdBy = controls.createdBy.value;
		return _productCategory;
	}

	addProductCategory( _productCategory: ProductCategoryModel, withBack: boolean = false) {
		const addSubscription = this.service.createProductCategory(_productCategory).subscribe(
			res => {
				const message = `New product category successfully has been added.`;
				this.layoutUtilsService.showActionNotification(message, MessageType.Create, 5000, true, true);
				const url = `/productCategory`;
				this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
			},
			err => {
				console.error(err);
				const message = 'Error while adding product category | ' + err.statusText;
				this.layoutUtilsService.showActionNotification(message, MessageType.Create, 5000, true, false);
			}
		);
		this.subscriptions.push(addSubscription);
	}

	updateProductCategory(_productCategory: ProductCategoryModel, withBack: boolean = false) {
		const addSubscription = this.service.updateProductCategory(_productCategory).subscribe(
			res => {
				const message = `Product category successfully has been saved.`;
				this.layoutUtilsService.showActionNotification(message, MessageType.Update, 5000, true, true);
				const url = `/productCategory`;
				this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
			},
			err => {
				console.error(err);
				const message = 'Error while adding product category | ' + err.statusText;
				this.layoutUtilsService.showActionNotification(message, MessageType.Update, 5000, true, false);
			}
		);
		this.subscriptions.push(addSubscription);
	}

	getComponentTitle() {
		let result = 'Create Product Category';
		if (!this.productCategory || !this.productCategory._id) {
			return result;
		}

		result = `Edit Product Category`;
		return result;
	}

	onAlertClose($event) {
		this.hasFormErrors = false;
	}

  	ngOnDestroy() {
		this.subscriptions.forEach(sb => sb.unsubscribe());
	}
	
}
