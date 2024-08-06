import {Component, OnDestroy, OnInit} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
// RxJS
import { BehaviorSubject, Observable, of, Subscription } from 'rxjs';
// NGRX
import { Store, select } from '@ngrx/store';
import { Update } from '@ngrx/entity';
import { AppState } from '../../../../core/reducers';
// Layout
import { SubheaderService, LayoutConfigService } from '../../../../core/_base/layout';
import { LayoutUtilsService, MessageType } from '../../../../core/_base/crud';
import {CategoryModel} from "../../../../core/category/category.model";
import {
	selectLastCreatedCategoryId,
	selectCategoryActionLoading,
	selectCategoryById
} from "../../../../core/category/category.selector";
import {CategoryService} from '../../../../core/category/category.service';

@Component({
  selector: 'kt-add-category',
  templateUrl: './add-category.component.html',
  styleUrls: ['./add-category.component.scss']
})
export class AddCategoryComponent implements OnInit, OnDestroy {
	// Public properties
	category: CategoryModel;
	CategoryId$: Observable<string>;
	oldCategory: CategoryModel;
	codenum : any;
	selectedTab = 0;
	loading$: Observable<boolean>;
	categoryForm: FormGroup;
	hasFormErrors = false;
	loading : boolean = false;
	// Private properties
	private subscriptions: Subscription[] = [];
  	constructor(
		private activatedRoute: ActivatedRoute,
		private router: Router,
		private categoryFB: FormBuilder,
		private subheaderService: SubheaderService,
		private layoutUtilsService: LayoutUtilsService,
		private store: Store<AppState>,
		private service: CategoryService,
		private layoutConfigService: LayoutConfigService
	) { }

  	ngOnInit() {
		this.loading$ = this.store.pipe(select(selectCategoryActionLoading));
		const routeSubscription =  this.activatedRoute.params.subscribe(params => {
			const id = params.id;
			if (id) {
				this.store.pipe(select(selectCategoryById(id))).subscribe(res => {
					if (res) {
						this.category = res;
						this.oldCategory = Object.assign({}, this.category);
						this.initCategory();
					}
				});
			} else {
				this.category = new CategoryModel();
				this.category.clear();
				this.initCategory();
			}
		});
		this.subscriptions.push(routeSubscription);
  	}

	initCategory() {
		this.createForm();
	}
	createForm() {
		if (this.category._id){
		this.categoryForm = this.categoryFB.group({
			categoryid: [{value: this.category.categoryid, disabled:true}, Validators.required],
			name: [this.category.name, Validators.required],
		});
	}else{
			this.getNumber()
			this.categoryForm = this.categoryFB.group({
			categoryid : [{"value":this.codenum, disabled:true}, Validators.required],
			name: [this.category.name, Validators.required],
		});
		}
	}

	getNumber() {
		this.service.generateCategoryCode().subscribe(
			res => {
				this.codenum = res.data
				const controls = this.categoryForm.controls;
				controls.categoryid.setValue(this.codenum);
				controls.status.setValue("Active");
			}
		)
			
	}

	goBackWithId() {
		const url = `/category`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}

	refreshCategory(isNew: boolean = false, id:string = "") {
		let url = this.router.url;
		if (!isNew) {
			this.router.navigate([url], { relativeTo: this.activatedRoute });
			return;
		}

		url = `/category/edit/${id}`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}

	onSubmit(withBack: boolean = false) {
		this.hasFormErrors = false;
		const controls = this.categoryForm.controls;
		/** check form */
		if (this.categoryForm.invalid) {
			Object.keys(controls).forEach(controlName =>
				controls[controlName].markAsTouched()
			);

			this.hasFormErrors = true;
			this.selectedTab = 0;
			return;
		}

		this.loading = true;
		const editedCategory = this.prepareCategory();

		if (editedCategory._id) {
			this.updateCategory(editedCategory, withBack);
			return;
		}

		this.addCategory(editedCategory, withBack);
	}
	prepareCategory(): CategoryModel {
		const controls = this.categoryForm.controls;
		const _category = new CategoryModel();
		_category.clear();
		_category._id = this.category._id;
		_category.categoryid = controls.categoryid.value;
		_category.name = controls.name.value.toLowerCase();
		return _category;
	}

	addCategory( _category: CategoryModel, withBack: boolean = false) {
		const addSubscription = this.service.createCategory(_category).subscribe(
			res => {
				const message = `New Category successfully has been added.`;
				this.layoutUtilsService.showActionNotification(message, MessageType.Create, 5000, true, true);
				const url = `/category`;
				this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
			},
			err => {
				console.error(err);
				const message = 'Error while adding category | ' + err.statusText;
				this.layoutUtilsService.showActionNotification(message, MessageType.Create, 5000, true, false);
			}
		);
		this.subscriptions.push(addSubscription);
	}

	updateCategory(_category: CategoryModel, withBack: boolean = false) {
		// Update User
		// tslint:disable-next-line:prefer-const
		const addSubscription = this.service.updateCategory(_category).subscribe(
			res => {
				const message = `Location successfully has been saved.`;
				this.layoutUtilsService.showActionNotification(message, MessageType.Update, 5000, true, true);
				const url = `/category`;
				this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
			},
			err => {
				console.error(err);
				const message = 'Error while adding location | ' + err.statusText;
				this.layoutUtilsService.showActionNotification(message, MessageType.Update, 5000, true, false);
			}
		);
		this.subscriptions.push(addSubscription);
	}

	getComponentTitle() {
		let result = 'Create Location';
		if (!this.category || !this.category._id) {
			return result;
		}

		result = `Edit Location`;
		return result;
	}

	onAlertClose($event) {
		this.hasFormErrors = false;
	}

  	ngOnDestroy() {
		this.subscriptions.forEach(sb => sb.unsubscribe());
	}
	
}
