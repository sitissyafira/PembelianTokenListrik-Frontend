import {Component, OnDestroy, OnInit} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable, Subscription } from 'rxjs';
import { Store, select } from '@ngrx/store';
import { AppState } from '../../../../../core/reducers';
import { SubheaderService, LayoutConfigService } from '../../../../../core/_base/layout';
import { LayoutUtilsService, MessageType } from '../../../../../core/_base/crud';
import {VndrCategoryModel} from "../../../../../core/masterData/vndrCategory/vndrCategory.model";
import {
	selectVndrCategoryActionLoading,
	selectVndrCategoryById
} from "../../../../../core/masterData/vndrCategory/vndrCategory.selector";
import {VndrCategoryService} from '../../../../../core/masterData/vndrCategory/vndrCategory.service';

@Component({
  selector: 'kt-add-vndrCategory',
  templateUrl: './add-vndrCategory.component.html',
  styleUrls: ['./add-vndrCategory.component.scss']
})
export class AddVndrCategoryComponent implements OnInit, OnDestroy {
	datauser = localStorage.getItem("user");
	vndrCategory: VndrCategoryModel;
	VndrCategoryId$: Observable<string>;
	oldVndrCategory: VndrCategoryModel;
	selectedTab = 0;
	loading$: Observable<boolean>;
	vndrCategoryForm: FormGroup;
	hasFormErrors = false;
	loading : boolean = false;

	private subscriptions: Subscription[] = [];
  	constructor(
		private activatedRoute: ActivatedRoute,
		private router: Router,
		private vndrCategoryFB: FormBuilder,
		private subheaderService: SubheaderService,
		private layoutUtilsService: LayoutUtilsService,
		private store: Store<AppState>,
		private service: VndrCategoryService,
		private layoutConfigService: LayoutConfigService
	) { }

  	ngOnInit() {
		this.loading$ = this.store.pipe(select(selectVndrCategoryActionLoading));
		const routeSubscription =  this.activatedRoute.params.subscribe(params => {
			const id = params.id;
			if (id) {
				this.store.pipe(select(selectVndrCategoryById(id))).subscribe(res => {
					if (res) {
						this.vndrCategory = res;
						this.oldVndrCategory = Object.assign({}, this.vndrCategory);
						this.initVndrCategory();
					}
				});
			} else {
				this.vndrCategory = new VndrCategoryModel();
				this.vndrCategory.clear();
				this.initVndrCategory();
			}
		});
		this.subscriptions.push(routeSubscription);
  	}

	initVndrCategory() {
		this.createForm();
	}



	createForm() {
		if (this.vndrCategory._id){
			this.vndrCategoryForm = this.vndrCategoryFB.group({
				category_name: [this.vndrCategory.category_name, Validators.required],
				description: [this.vndrCategory.description, Validators.required],
				created_by: [this.vndrCategory.created_by],
			});
		}else{
			this.vndrCategoryForm = this.vndrCategoryFB.group({
				category_name: ["", Validators.required],
				description: [""],
				created_by: [{value:this.datauser, disabled:true}],
			});
		}
	}
	goBackWithId() {
		const url = `/vndrCategory`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}
	refreshVndrCategory(isNew: boolean = false, id:string = "") {
		let url = this.router.url;
		if (!isNew) {
			this.router.navigate([url], { relativeTo: this.activatedRoute });
			return;
		}
		url = `/vndrCategory/edit/${id}`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}
	onSubmit(withBack: boolean = false) {
		this.hasFormErrors = false;
		const controls = this.vndrCategoryForm.controls;
		if (this.vndrCategoryForm.invalid) {
			Object.keys(controls).forEach(controlName =>
				controls[controlName].markAsTouched()
			);

			this.hasFormErrors = true;
			this.selectedTab = 0;
			return;
		}

		this.loading = true;
		const editedVndrCategory = this.prepareVndrCategory();
		if (editedVndrCategory._id) {
			this.updateVndrCategory(editedVndrCategory, withBack);
			return;
		}
		this.addVndrCategory(editedVndrCategory, withBack);
	}

	prepareVndrCategory(): VndrCategoryModel {
		const controls = this.vndrCategoryForm.controls;
		const _vndrCategory = new VndrCategoryModel();
		_vndrCategory.clear();
		_vndrCategory._id = this.vndrCategory._id;
		_vndrCategory.category_name = controls.category_name.value.toLowerCase();
		_vndrCategory.description = controls.description.value;
		_vndrCategory.created_by = controls.created_by.value;
		return _vndrCategory;
	}

	category_name
	addVndrCategory( _vndrCategory: VndrCategoryModel, withBack: boolean = false) {
		const addSubscription = this.service.createVndrCategory(_vndrCategory).subscribe(
			res => {
				const message = `New vendor category successfully has been added.`;
				this.layoutUtilsService.showActionNotification(message, MessageType.Create, 5000, true, true);
				const url = `/vndrCategory`;
				this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
			},
			err => {
				console.error(err);
				const message = 'Error while adding vendor category | ' + err.statusText;
				this.layoutUtilsService.showActionNotification(message, MessageType.Create, 5000, true, false);
			}
		);
		this.subscriptions.push(addSubscription);
	}

	updateVndrCategory(_vndrCategory: VndrCategoryModel, withBack: boolean = false) {
		const addSubscription = this.service.updateVndrCategory(_vndrCategory).subscribe(
			res => {
				const message = `Vendor category successfully has been saved.`;
				this.layoutUtilsService.showActionNotification(message, MessageType.Update, 5000, true, true);
				const url = `/vndrCategory`;
				this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
			},
			err => {
				console.error(err);
				const message = 'Error while adding vendor category | ' + err.statusText;
				this.layoutUtilsService.showActionNotification(message, MessageType.Update, 5000, true, false);
			}
		);
		this.subscriptions.push(addSubscription);
	}

	getComponentTitle() {
		let result = 'Create Vendor Category';
		if (!this.vndrCategory || !this.vndrCategory._id) {
			return result;
		}

		result = `Edit Vendor Category`;
		return result;
	}

	onAlertClose($event) {
		this.hasFormErrors = false;
	}

  	ngOnDestroy() {
		this.subscriptions.forEach(sb => sb.unsubscribe());
	}
}
