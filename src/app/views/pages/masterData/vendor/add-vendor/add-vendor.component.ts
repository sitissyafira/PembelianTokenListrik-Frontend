import {ChangeDetectorRef, Component, OnDestroy, OnInit} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable, Subscription } from 'rxjs';
import { Store, select } from '@ngrx/store';
import { AppState } from '../../../../../core/reducers';
import { SubheaderService, LayoutConfigService } from '../../../../../core/_base/layout';
import { LayoutUtilsService, MessageType } from '../../../../../core/_base/crud';
import {VendorModel} from "../../../../../core/masterData/vendor/vendor.model";
import {
	selectVendorActionLoading,
	selectVendorById
} from "../../../../../core/masterData/vendor/vendor.selector";
import {VendorService} from '../../../../../core/masterData/vendor/vendor.service';
import { SelectionModel } from '@angular/cdk/collections';
import { QueryVendorModel } from '../../../../../core/masterData/vendor/queryvendor.model';
import { VndrCategoryService } from '../../../../../core/masterData/vndrCategory/vndrCategory.service';
import { ProductBrandService } from '../../../../../core/masterData/productBrand/productBrand.service';
import { QueryProductBrandModel } from '../../../../../core/masterData/productBrand/queryproductBrand.model';

@Component({
  selector: 'kt-add-vendor',
  templateUrl: './add-vendor.component.html',
  styleUrls: ['./add-vendor.component.scss']
})
export class AddVendorComponent implements OnInit, OnDestroy {
	codenum;
	datauser = localStorage.getItem("user");
	vendor: VendorModel;
	VendorId$: Observable<string>;
	selection = new SelectionModel<VendorModel>(true, []);
	oldVendor: VendorModel;
	selectedTab = 0;
	loading$: Observable<boolean>;
	vendorForm: FormGroup;
	hasFormErrors = false;
	loading : boolean = false;
	vendorCategoryResult: any[] = [];
	productlist: any;
	allProductsMaster: any;
	selectedproduct: any[] = [];
	productSearchName: string;
	productSelection = new SelectionModel<any>(true, []);
	private loadingData = {
		vendorCategory: false,		
	}

	private subscriptions: Subscription[] = [];
  	constructor(
		private activatedRoute: ActivatedRoute,
		private router: Router,
		private vendorFB: FormBuilder,
		private subheaderService: SubheaderService,
		private layoutUtilsService: LayoutUtilsService,
		private store: Store<AppState>,
		private service: VendorService,
		private productService: ProductBrandService,
		private vendorCategoryService : VndrCategoryService,
		private cd: ChangeDetectorRef,
		private layoutConfigService: LayoutConfigService
	) { }

  	ngOnInit() {
		this.loading$ = this.store.pipe(select(selectVendorActionLoading));
		const routeSubscription =  this.activatedRoute.params.subscribe(params => {
			const id = params.id;
			if (id) {
				this.store.pipe(select(selectVendorById(id))).subscribe(res => {
					if (res) {
						this.vendor = res;
						this.oldVendor = Object.assign({}, this.vendor);
						this.initVendor();
						this.getListProducts();
					}
				});
			} else {
				this.vendor = new VendorModel();
				this.vendor.clear();
				this.initVendor();
				this.getListProducts();
			}
		});
		this.subscriptions.push(routeSubscription);
  	}

	initVendor() {
		this.createForm();
		this.loadVendorCategory();
		this.loadProductsList();
	}

	createForm() {
		if (this.vendor._id){
			this.vendorForm = this.vendorFB.group({
				vendor_name: [this.vendor.vendor_name, Validators.required],
				address: [this.vendor.address, Validators.required],
				vendor_code: [{value:this.vendor.vendor_code, disabled:true}],
				npwp: [this.vendor.npwp, Validators.required],
				phone: [this.vendor.phone, Validators.required],
				vendor_email: [this.vendor.vendor_email, Validators.required],
				vendor_category: [this.vendor.vendor_category._id, Validators.required],
				pic: [this.vendor.pic, Validators.required],
				pic_phone: [this.vendor.pic_phone, Validators.required],
				pic_email: [this.vendor.pic_email, Validators.required],
				remark: [this.vendor.remark],
				description: [this.vendor.description],
				created_by: [this.vendor.created_by],
			});
		}else{
			this.getVendorNo();
			this.vendorForm = this.vendorFB.group({
				vendor_name: ["", Validators.required],
				address: ["", Validators.required],
				vendor_code: [{value:"", disabled:true}],
				npwp : ["", Validators.required],
				phone: ["", Validators.required],
				vendor_email: ["", Validators.required],
				vendor_category: ["", Validators.required],
				pic: ["", Validators.required],
				pic_phone: ["", Validators.required],
				pic_email: ["", Validators.required],
				remark: [""],
				description: [""],
				created_by: [{value:this.datauser, disabled:true}],
			});
		}
	}

	getVendorNo(){
		this.service.getVendorNo().subscribe(
			res => {
				this.codenum = res.data
				const controls = this.vendorForm.controls;
				controls.vendor_code.setValue(this.codenum);
			}
		)
	}

	loadVendorCategory() {
		this.loadingData.vendorCategory = true;
		this.selection.clear();
		const queryParams = new QueryVendorModel(
			null,
			1,
			1000000
		);
		this.vendorCategoryService.getListVndrCategory(queryParams).subscribe(
			res => {
				this.vendorCategoryResult = res.data;
				this.loadingData.vendorCategory = false;
				this.cd.markForCheck();
			}
		);
	}
	goBackWithId() {
		const url = `/vendor`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}
	refreshVendor(isNew: boolean = false, id:string = "") {
		let url = this.router.url;
		if (!isNew) {
			this.router.navigate([url], { relativeTo: this.activatedRoute });
			return;
		}
		url = `/vendor/edit/${id}`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}
	onSubmit(withBack: boolean = false) {
		this.hasFormErrors = false;
		//get all products
		this.allProductsMaster.forEach(e => {
			if(this.productSelection.isSelected(e._id)){
				this.selectedproduct.push(e._id)
			}
		});

		const controls = this.vendorForm.controls;

		if (this.vendorForm.invalid) {
			Object.keys(controls).forEach(controlName =>
				controls[controlName].markAsTouched()
			);

			this.hasFormErrors = true;
			this.selectedTab = 0;
			return;
		}

		this.loading = true;
		const editedVendor = this.prepareVendor();
		if (editedVendor._id) {
			this.updateVendor(editedVendor, withBack);
			return;
		}
		this.addVendor(editedVendor, withBack);
	}

	prepareVendor(): VendorModel {
		const controls = this.vendorForm.controls;
		const _vendor = new VendorModel();
		_vendor.clear();
		_vendor._id = this.vendor._id;
		_vendor.vendor_name = controls.vendor_name.value.toLowerCase();
		_vendor.address  = controls.address.value;
		_vendor.vendor_code = controls.vendor_code.value;
		_vendor.npwp = controls.npwp.value;
		_vendor.phone = controls.phone.value;
		_vendor.vendor_email = controls.vendor_email.value;
		_vendor.vendor_category = controls.vendor_category.value;
		_vendor.pic = controls.pic.value;
		_vendor.pic_phone = controls.pic_phone.value;
		_vendor.pic_email = controls.pic_email.value;
		_vendor.remark = controls.remark.value;
		_vendor.description = controls.description.value;
		_vendor.created_by = controls.created_by.value;
		_vendor.products = this.selectedproduct;
		return _vendor;
	}

	addVendor( _vendor: VendorModel, withBack: boolean = false) {
		const addSubscription = this.service.createVendor(_vendor).subscribe(
			res => {
				const message = `New product category successfully has been added.`;
				this.layoutUtilsService.showActionNotification(message, MessageType.Create, 5000, true, true);
				const url = `/vendor`;
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

	updateVendor(_vendor: VendorModel, withBack: boolean = false) {
		const addSubscription = this.service.updateVendor(_vendor).subscribe(
			res => {
				const message = `Product category successfully has been saved.`;
				this.layoutUtilsService.showActionNotification(message, MessageType.Update, 5000, true, true);
				const url = `/vendor`;
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
		let result = 'Create Vendor';
		if (!this.vendor || !this.vendor._id) {
			return result;
		}

		result = `Edit Vendor`;
		return result;
	}

	onAlertClose($event) {
		this.hasFormErrors = false;
	}

  	ngOnDestroy() {
		this.subscriptions.forEach(sb => sb.unsubscribe());
	}

	inputKeydownHandler(event) {
		// (e.keyCode >= 48 && e.keyCode <=57) || (e.keyCode >= 96 && e.keyCode <=105))
		return event.keyCode === 8 || event.keyCode === 46 ? true : !isNaN(Number(event.key))
	}

	onSearchProducts(e) {
		console.log(e.target.value)
		this.productSearchName = e.target.value
		this._filterProductList()
	}

	clearAllSelection(e) {
		console.log("clear")
	}

	selectAllProducts(e) {
		console.log("all products selected")
		if(this.isAllSelected()){
			this.productSelection.clear()
		}
		else {
			this.productSelection.clear()
			this.allProductsMaster.forEach(e => {
				this.productSelection.select(e._id)
			});
		}

		console.log(this.productSelection)
		this.cd.markForCheck()

	}

	selectProducts(product, e) {
		e.stopPropagation()
		// this.productSelection.select(product._id)
		// this.selectedproduct.push(product)
		// this.productSelection.toggle(product._id)
	}

	getListProducts() {
		const queryParam = new QueryProductBrandModel(this.productSearchName, 1, 100000)
		const addSubscription = this.productService.getListProductBrand(queryParam).subscribe(res => {
			console.log(res)
			this.allProductsMaster = res.data
			this.productlist = res.data
		})
	}

	_filterProductList(){
		let tempProduct = this.allProductsMaster.filter(product => {
			if(product.brand_name.includes(this.productSearchName)){
				return product
			}
		})
		this.productlist = tempProduct
		this.cd.markForCheck()
	}

	changeCheckBoxProduct(id) {
		this.productSelection.toggle(id)
		console.log(this.selectedproduct, 'change cek box')
		this.cd.markForCheck()
	}
	
	checkProductSelected(id) {
		this.productSelection.isSelected(id)
		console.log(this.selectedproduct, 'cek product selected')
	}

	isAllSelected(){
		const numSelected = this.productSelection.selected.length
		const numProducts = this.allProductsMaster.length

		if(numSelected === numProducts) return true
		else return false
	}

	loadProductsList(){
		if(this.vendor.products){
			this.vendor.products.forEach(e => {
				this.productSelection.select(e)
			})
		}
	}
}
