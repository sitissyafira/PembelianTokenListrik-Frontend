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
import {DefectModel} from "../../../../core/defect/defect.model";
import {
	selectLastCreatedDefectId,
	selectDefectActionLoading,
	selectDefectById
} from "../../../../core/defect/defect.selector";
import {DefectService} from '../../../../core/defect/defect.service';
import { SelectionModel } from '@angular/cdk/collections';
import { QueryDefectModel } from '../../../../core/defect/querydefect.model';
import { QueryCategoryModel } from '../../../../core/category/querycategory.model';
import { CategoryService } from '../../../../core/category/category.service';

@Component({
  selector: 'kt-view-defect',
  templateUrl: './view-defect.component.html',
  styleUrls: ['./view-defect.component.scss']
})
export class ViewDefectComponent implements OnInit, OnDestroy {
	// Public properties
	defect: DefectModel;
	DefectId$: Observable<string>;
	oldDefect: DefectModel;
	selectedTab = 0;
	loading$: Observable<boolean>;
	defectForm: FormGroup;
	selection = new SelectionModel<DefectModel>(true, []);
	hasFormErrors = false;
	categoryResult: any[] = [];
	codenum : any;
	loadingForm : boolean
	loading : boolean = false
	// Private properties
	private subscriptions: Subscription[] = [];
	
  	constructor(
		private activatedRoute: ActivatedRoute,
		private router: Router,
		private defectFB: FormBuilder,
		private subheaderService: SubheaderService,
		private layoutUtilsService: LayoutUtilsService,
		private store: Store<AppState>,
		private service: DefectService,
		private cservice : CategoryService,
		private layoutConfigService: LayoutConfigService
	) { }

  	ngOnInit() {
		
		this.loading$ = this.store.pipe(select(selectDefectActionLoading));
		const routeSubscription =  this.activatedRoute.params.subscribe(params => {
			const id = params.id;
			if (id) {
				this.store.pipe(select(selectDefectById(id))).subscribe(res => {
					if (res) {
						this.loadingForm = true
						this.defect = res;
						this.oldDefect = Object.assign({}, this.defect);
						this.initDefect();
					}
				});
			}
		});
		this.subscriptions.push(routeSubscription);
  	}

	initDefect() {
		this.createForm();
		this.loadCategory();
	}

	createForm() {
		if (this.defect._id){
			this.loadCategory();
		    this.defectForm = this.defectFB.group({
			defectid: [{value:this.defect.defectid, disabled: true}],
			category: [{value:this.defect.category._id, disabled:true}],
			defect_name: [{value:this.defect.defect_name, disabled:true}],
		});
		}
	}

	async loadCategory(){
		this.selection.clear();
		const queryParams = new QueryCategoryModel(
			null,
			"asc",
			null,
			1,
			1000
		);
		this.cservice.getListCategory(queryParams).subscribe(
			res => {
				this.categoryResult = res.data;

				this.loadingForm = false
				document.body.style.height = "101%"
				window.scrollTo(0, 1);
				document.body.style.height = ""

			}
		);
	}

	goBackWithId() {
		const url = `/defect`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}

	refreshDefect(isNew: boolean = false, id:string = "") {
		let url = this.router.url;
		if (!isNew) {
			this.router.navigate([url], { relativeTo: this.activatedRoute });
			return;
		}

		url = `/defect/edit/${id}`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}

	
	getComponentTitle() {
		let result = `View Detail Location`;
		return result;
	}

	onAlertClose($event) {
		this.hasFormErrors = false;
	}

  	ngOnDestroy() {
		this.subscriptions.forEach(sb => sb.unsubscribe());
	}
	
}
