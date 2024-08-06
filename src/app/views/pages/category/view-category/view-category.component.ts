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
  selector: 'kt-view-category',
  templateUrl: './view-category.component.html',
  styleUrls: ['./view-category.component.scss']
})
export class ViewCategoryComponent implements OnInit, OnDestroy {
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
				categoryid: [{value: this.category.categoryid, disabled:true}],
				name: [{value:this.category.name, disabled:true}],
			});
		}
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

	
	getComponentTitle() {
		let result = `View Location`;
		return result;
	}

	onAlertClose($event) {
		this.hasFormErrors = false;
	}

  	ngOnDestroy() {
		this.subscriptions.forEach(sb => sb.unsubscribe());
	}
	
}
