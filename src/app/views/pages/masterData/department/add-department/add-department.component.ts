import {Component, OnDestroy, OnInit} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable, Subscription } from 'rxjs';
import { Store, select } from '@ngrx/store';
import { AppState } from '../../../../../core/reducers';
import { SubheaderService, LayoutConfigService } from '../../../../../core/_base/layout';
import { LayoutUtilsService, MessageType } from '../../../../../core/_base/crud';
import {DepartmentModel} from "../../../../../core/masterData/department/department.model";
import {
	selectDepartmentActionLoading,
	selectDepartmentById
} from "../../../../../core/masterData/department/department.selector";
import {DepartmentService} from '../../../../../core/masterData/department/department.service';

@Component({
  selector: 'kt-add-department',
  templateUrl: './add-department.component.html',
  styleUrls: ['./add-department.component.scss']
})
export class AddDepartmentComponent implements OnInit, OnDestroy {
	datauser = localStorage.getItem("user");
	department: DepartmentModel;
	DepartmentId$: Observable<string>;
	oldDepartment: DepartmentModel;
	selectedTab = 0;
	loading$: Observable<boolean>;
	departmentForm: FormGroup;
	hasFormErrors = false;
	loading : boolean = false;

	private subscriptions: Subscription[] = [];
  	constructor(
		private activatedRoute: ActivatedRoute,
		private router: Router,
		private departmentFB: FormBuilder,
		private subheaderService: SubheaderService,
		private layoutUtilsService: LayoutUtilsService,
		private store: Store<AppState>,
		private service: DepartmentService,
		private layoutConfigService: LayoutConfigService
	) { }

  	ngOnInit() {
		this.loading$ = this.store.pipe(select(selectDepartmentActionLoading));
		const routeSubscription =  this.activatedRoute.params.subscribe(params => {
			const id = params.id;
			if (id) {
				this.store.pipe(select(selectDepartmentById(id))).subscribe(res => {
					if (res) {
						this.department = res;
						this.oldDepartment = Object.assign({}, this.department);
						this.initDepartment();
					}
				});
			} else {
				this.department = new DepartmentModel();
				this.department.clear();
				this.initDepartment();
			}
		});
		this.subscriptions.push(routeSubscription);
  	}

	initDepartment() {
		this.createForm();
	}

	createForm() {
		if (this.department._id){
			this.departmentForm = this.departmentFB.group({
				department_id: [this.department.department_id, Validators.required],
				department_name : [this.department.department_name, Validators.required],
				description : [this.department.description],
				created_by: [this.department.created_by],
			});
		}else{
			this.departmentForm = this.departmentFB.group({
				department_id: ["", Validators.required],
				department_name: ["", Validators.required],
				description: [""],
				created_by: [{value:this.datauser, disabled:true}],
			});
		}
	}
	goBackWithId() {
		const url = `/department`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}
	refreshDepartment(isNew: boolean = false, id:string = "") {
		let url = this.router.url;
		if (!isNew) {
			this.router.navigate([url], { relativeTo: this.activatedRoute });
			return;
		}
		url = `/department/edit/${id}`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}
	onSubmit(withBack: boolean = false) {
		this.hasFormErrors = false;
		const controls = this.departmentForm.controls;
		if (this.departmentForm.invalid) {
			Object.keys(controls).forEach(controlName =>
				controls[controlName].markAsTouched()
			);

			this.hasFormErrors = true;
			this.selectedTab = 0;
			return;
		}

		this.loading = true;
		const editedDepartment = this.prepareDepartment();
		if (editedDepartment._id) {
			this.updateDepartment(editedDepartment, withBack);
			return;
		}
		this.addDepartment(editedDepartment, withBack);
	}

	prepareDepartment(): DepartmentModel {
		const controls = this.departmentForm.controls;
		const _department = new DepartmentModel();
		_department.clear();
		_department._id = this.department._id;
		_department.department_id = controls.department_id.value;
		_department.department_name = controls.department_name.value.toLowerCase();
		_department.description = controls.description.value;
		_department.created_by = controls.created_by.value;
		return _department;
	}

	addDepartment( _department: DepartmentModel, withBack: boolean = false) {
		const addSubscription = this.service.createDepartment(_department).subscribe(
			res => {
				const message = `New department successfully has been added.`;
				this.layoutUtilsService.showActionNotification(message, MessageType.Create, 5000, true, true);
				const url = `/department`;
				this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
			},
			err => {
				console.error(err);
				const message = 'Error while adding department | ' + err.statusText;
				this.layoutUtilsService.showActionNotification(message, MessageType.Create, 5000, true, false);
			}
		);
		this.subscriptions.push(addSubscription);
	}

	updateDepartment(_department: DepartmentModel, withBack: boolean = false) {
		const addSubscription = this.service.updateDepartment(_department).subscribe(
			res => {
				const message = `Department successfully has been saved.`;
				this.layoutUtilsService.showActionNotification(message, MessageType.Update, 5000, true, true);
				const url = `/department`;
				this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
			},
			err => {
				console.error(err);
				const message = 'Error while adding department | ' + err.statusText;
				this.layoutUtilsService.showActionNotification(message, MessageType.Update, 5000, true, false);
			}
		);
		this.subscriptions.push(addSubscription);
	}

	getComponentTitle() {
		let result = 'Create Department';
		if (!this.department || !this.department._id) {
			return result;
		}

		result = `Edit Department`;
		return result;
	}

	onAlertClose($event) {
		this.hasFormErrors = false;
	}

  	ngOnDestroy() {
		this.subscriptions.forEach(sb => sb.unsubscribe());
	}
}
