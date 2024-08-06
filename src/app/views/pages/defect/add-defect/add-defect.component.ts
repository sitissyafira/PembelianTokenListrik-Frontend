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
  selector: 'kt-add-defect',
  templateUrl: './add-defect.component.html',
  styleUrls: ['./add-defect.component.scss']
})
export class AddDefectComponent implements OnInit, OnDestroy {
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
			} else {
				this.defect = new DefectModel();
				this.defect.clear();
				this.initDefect();
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
			defectid: [{value:this.defect.defectid, disabled: true}, Validators.required],
			category: [this.defect.category._id, Validators.required],
			defect_name: [this.defect.defect_name, Validators.required],
		});

		}else{
			this.getNumber()
			this.defectForm = this.defectFB.group({
			defectid : [{"value":this.codenum, disabled:true}, Validators.required],
			category: ["", Validators.required],
			defect_name: [""],
		});
		}
	}

	getNumber() {
		this.service.generateCategoryCode().subscribe(
			res => {
				this.codenum = res.data
				const controls = this.defectForm.controls;
				controls.defectid.setValue(this.codenum);
			}
		)
			
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
			}
		);
		document.body.style.height = "101%"
		window.scrollTo(0, 1);
		document.body.style.height = ""
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


	onSubmit(withBack: boolean = false) {
		this.hasFormErrors = false;
		const controls = this.defectForm.controls;
		/** check form */
		if (this.defectForm.invalid) {
			Object.keys(controls).forEach(controlName =>
				controls[controlName].markAsTouched()
			);

			this.hasFormErrors = true;
			this.selectedTab = 0;
			return;
		}

		this.loading = true;
		const editedDefect = this.prepareDefect();

		if (editedDefect._id) {
			this.updateDefect(editedDefect, withBack);
			return;
		}

		this.addDefect(editedDefect, withBack);
	}
	prepareDefect(): DefectModel {
		const controls = this.defectForm.controls;
		const _defect = new DefectModel();
		_defect.clear();
		_defect._id = this.defect._id;
		_defect.defectid = controls.defectid.value;
		_defect.category = controls.category.value;
		_defect.defect_name = controls.defect_name.value.toLowerCase();
		return _defect;
	}

	addDefect( _defect: DefectModel, withBack: boolean = false) {
		const addSubscription = this.service.createDefect(_defect).subscribe(
			res => {
				const message = `New detail location successfully has been added.`;
				this.layoutUtilsService.showActionNotification(message, MessageType.Create, 5000, true, true);
				const url = `/defect`;
				this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
			},
			err => {
				console.error(err);
				const message = 'Error while adding detail location | ' + err.statusText;
				this.layoutUtilsService.showActionNotification(message, MessageType.Create, 5000, true, false);
			}
		);
		this.subscriptions.push(addSubscription);
	}

	updateDefect(_defect: DefectModel, withBack: boolean = false) {
		// Update User
		// tslint:disable-next-line:prefer-const
		const addSubscription = this.service.updateDefect(_defect).subscribe(
			res => {
				const message = `Detail location successfully has been saved.`;
				this.layoutUtilsService.showActionNotification(message, MessageType.Update, 5000, true, true);
				const url = `/defect`;
				this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
			},
			err => {
				console.error(err);
				const message = 'Error while adding detail location | ' + err.statusText;
				this.layoutUtilsService.showActionNotification(message, MessageType.Update, 5000, true, false);
			}
		);
		this.subscriptions.push(addSubscription);
	}

	getComponentTitle() {
		let result = 'Create Detail Location';
		if (!this.defect || !this.defect._id) {
			return result;
		}

		result = `Edit Detail Location`;
		return result;
	}

	onAlertClose($event) {
		this.hasFormErrors = false;
	}

  	ngOnDestroy() {
		this.subscriptions.forEach(sb => sb.unsubscribe());
	}
	
}
