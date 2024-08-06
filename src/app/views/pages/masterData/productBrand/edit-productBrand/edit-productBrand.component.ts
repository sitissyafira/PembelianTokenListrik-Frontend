import {ChangeDetectorRef, Component, OnDestroy, OnInit} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Observable, Subscription } from 'rxjs';
import { Store, select } from '@ngrx/store';
import { AppState } from '../../../../../core/reducers';
import { SubheaderService, LayoutConfigService } from '../../../../../core/_base/layout';
import { LayoutUtilsService, MessageType } from '../../../../../core/_base/crud';
import {ProductBrandModel} from "../../../../../core/masterData/productBrand/productBrand.model";
import {
	selectProductBrandActionLoading,
	selectProductBrandById
} from "../../../../../core/masterData/productBrand/productBrand.selector";
import {ProductBrandService} from '../../../../../core/masterData/productBrand/productBrand.service';
import { SelectionModel } from '@angular/cdk/collections';
import { QueryProductCategoryModel } from '../../../../../core/masterData/productCategory/queryproductCategory.model';
import { ProductCategoryService } from '../../../../../core/masterData/productCategory/productCategory.service';

@Component({
  selector: 'kt-edit-productBrand',
  templateUrl: './edit-productBrand.component.html',
  styleUrls: ['./edit-productBrand.component.scss']
})
export class EditProductBrandComponent implements OnInit, OnDestroy {
	datauser = localStorage.getItem("user");
	productBrand: ProductBrandModel;
	ProductBrandId$: Observable<string>;
	selection = new SelectionModel<ProductBrandModel>(true, []);
	oldProductBrand: ProductBrandModel;
	selectedTab = 0;
	loading$: Observable<boolean>;
	productBrandForm: FormGroup;
	hasFormErrors = false;
	loadingSubmit : boolean = false;
	productCategoryResult: any[] = [];


	productCategoryResultFiltered = [];
	viewProductCategoryResult = new FormControl();

	private loading = {
		productCategory: false,
	}

	

	private subscriptions: Subscription[] = [];
  	constructor(
		private activatedRoute: ActivatedRoute,
		private router: Router,
		private productBrandFB: FormBuilder,
		private subheaderService: SubheaderService,
		private layoutUtilsService: LayoutUtilsService,
		private productCategoryService : ProductCategoryService,
		private store: Store<AppState>,
		private service: ProductBrandService,
		private cd: ChangeDetectorRef,
		private layoutConfigService: LayoutConfigService
	) { }

  	ngOnInit() {
		this.loading$ = this.store.pipe(select(selectProductBrandActionLoading));
		const routeSubscription =  this.activatedRoute.params.subscribe(params => {
			const id = params.id;
			if (id) {
				this.store.pipe(select(selectProductBrandById(id))).subscribe(res => {
					if (res) {
						this.productBrand = res;
						this.oldProductBrand = Object.assign({}, this.productBrand);
						this.initProductBrand();

					
						this.viewProductCategoryResult.setValue(`${res.product_category.category_name}`);
						this._filterCstmrList(`${res.product_category.category_name}`);		



					}
				});
			}
		});
		this.subscriptions.push(routeSubscription);
  	}

	initProductBrand() {
		this.createForm();
		this.loadProductCategory()
	}

	createForm() {
			this.productBrandForm = this.productBrandFB.group({
				brand_code: [this.productBrand.brand_code, Validators.required],
				brand_name: [this.productBrand.brand_name, Validators.required],
				product_category :[this.productBrand.product_category._id, Validators.required],
				description: [this.productBrand.description, Validators.required],
				created_by: [this.productBrand.created_by],
			});
	}

	/**
	 * @param value
	 */
	 _setBlockValue(value) {
		console.log(value, 'from the option click');
		this.productBrandForm.patchValue({ product_category: value._id });
	}

	_onKeyup(e: any) {
		this.productBrandForm.patchValue({ product_category: undefined });
		this._filterCstmrList(e.target.value);
	}
	
	_filterCstmrList(text: string) {
		this.productCategoryResultFiltered = this.productCategoryResult.filter(i => {
			const filterText = `${i.category_name.toLocaleLowerCase()}`;
			if(filterText.includes(text.toLocaleLowerCase())) return i;
		});
	}

	loadProductCategory() {
		this.loading.productCategory = true
		this.selection.clear();
		const queryParams = new QueryProductCategoryModel(
			null,
			1,
			100000
		);
		this.productCategoryService.getListProductCategory(queryParams).subscribe(
			res => {
				this.productCategoryResult = res.data;
				this.productCategoryResultFiltered = this.productCategoryResult.slice();
				this.cd.markForCheck();
				this.viewProductCategoryResult.enable();
				this.loading.productCategory = false
			}
		);
	}


	goBackWithId() {
		const url = `/productBrand`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}

	refreshProductBrand(isNew: boolean = false, id:string = "") {
		let url = this.router.url;
		if (!isNew) {
			this.router.navigate([url], { relativeTo: this.activatedRoute });
			return;
		}
		url = `/productBrand/edit/${id}`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}

	onSubmit(withBack: boolean = false) {
		this.hasFormErrors = false;
		const controls = this.productBrandForm.controls;
		if (this.productBrandForm.invalid) {
			Object.keys(controls).forEach(controlName =>
				controls[controlName].markAsTouched()
			);

			this.hasFormErrors = true;
			this.selectedTab = 0;
			return;
		}

		this.loadingSubmit = true;
		const editedProductBrand = this.prepareProductBrand();
		this.updateProductBrand(editedProductBrand, withBack);
	}

	prepareProductBrand(): ProductBrandModel {
		const controls = this.productBrandForm.controls;
		const _productBrand = new ProductBrandModel();
		_productBrand.clear();
		_productBrand._id = this.productBrand._id;
		_productBrand.brand_code = controls.brand_code.value;
		_productBrand.brand_name = controls.brand_name.value.toLowerCase();
		_productBrand.product_category = controls.product_category.value;
		_productBrand.description = controls.description.value;
		_productBrand.created_by = controls.created_by.value;
		return _productBrand;
	}


	updateProductBrand(_productBrand: ProductBrandModel, withBack: boolean = false) {
		const addSubscription = this.service.updateProductBrand(_productBrand).subscribe(
			res => {
				const message = `Product brand successfully has been saved.`;
				this.layoutUtilsService.showActionNotification(message, MessageType.Update, 5000, true, true);
				const url = `/productBrand`;
				this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
			},
			err => {
				console.error(err);
				const message = 'Error while adding product brand | ' + err.statusText;
				this.layoutUtilsService.showActionNotification(message, MessageType.Update, 5000, true, false);
			}
		);
		this.subscriptions.push(addSubscription);
	}

	getComponentTitle() {
		let result = `Edit Product Brand`;
		return result;
	}

	onAlertClose($event) {
		this.hasFormErrors = false;
	}

  	ngOnDestroy() {
		this.subscriptions.forEach(sb => sb.unsubscribe());
	}

	inputKeydownHandler(event) {
		return event.keyCode === 8 || event.keyCode === 46 ? true : !isNaN(Number(event.key)) || event.key === '.';
	}
	
}
