import {ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild,} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import {  BehaviorSubject, Observable, Subscription } from 'rxjs';
import { Store, select } from '@ngrx/store';
import { AppState } from '../../../../core/reducers';
import { SubheaderService, LayoutConfigService } from '../../../../core/_base/layout';
import {LayoutUtilsService, MessageType, QueryParamsModel} from '../../../../core/_base/crud';
import {ManagementTaskModel} from "../../../../core/managementTask/managementTask.model";
import {
	selectManagementTaskActionLoading, selectManagementTaskById,
} from "../../../../core/managementTask/managementTask.selector";
import {StateService} from '../../../../core/state/state.service';
import { ManagementTaskService } from '../../../../core/managementTask/managementTask.service';
import { DepartmentService } from '../../../../core/masterData/department/department.service';
import { DivisionService } from '../../../../core/masterData/division/division.service';
import { QueryDepartmentModel } from '../../../../core/masterData/department/querydepartment.model';
import { QueryDivisionModel } from '../../../../core/masterData/division/querydivision.model'
import { LocationBuildingService } from '../../../../core/masterData/locationBuilding/locationBuilding.service';
import { QueryLocationBuildingModel } from '../../../../core/masterData/locationBuilding/querylocationBuilding.model';
import { ShiftService } from '../../../../core/masterData/shift/shift.service';
import { QueryShiftModel } from '../../../../core/masterData/shift/queryshift.model';
import moment from 'moment';
import { MatTable } from '@angular/material';

@Component({
  selector: 'kt-edit-managementTask',
  templateUrl: './edit-managementTask.component.html',
  styleUrls: ['./edit-managementTask.component.scss']
})
export class EditManagementTaskComponent implements OnInit, OnDestroy {
	managementTask: ManagementTaskModel;
	managementTaskId$: Observable<string>;
	oldManagementTask: ManagementTaskModel;
	selectedTab = 0;
	loading$: Observable<boolean>;
	managementTaskForm: FormGroup;
	hasFormErrors = false;
	codenum: any = null;
	viewDepartmentResult = new FormControl()
	viewDivisionResult = new FormControl()
	viewLocationResult = new FormControl()
	viewShiftResult = new FormControl()
	loading : Boolean = false

	attachments: any[] = []

	listRemark: any[] = []

	dataSource: any = new BehaviorSubject([]);
	@ViewChild('myTable', { static: false }) table: MatTable<any>;
	displayedColumns = ["question", "description", "check", "attachment", "actions"];

	private subscriptions: Subscription[] = [];
	constructor(
		private activatedRoute: ActivatedRoute,
		private router: Router,
		private managementTaskFB: FormBuilder,
		private subheaderService: SubheaderService,
		private layoutUtilsService: LayoutUtilsService,
		private stateService: StateService,
		private managementTaskService: ManagementTaskService,
		private locationBuildingService: LocationBuildingService,
		private store: Store<AppState>,
		private layoutConfigService: LayoutConfigService,
		private departmentService: DepartmentService,
		private divisionService: DivisionService,
		private shiftService: ShiftService,
		private cd: ChangeDetectorRef,
	) {

	}
	ngOnInit() {
		this.loading$ = this.store.pipe(select(selectManagementTaskActionLoading));
		const routeSubscription =  this.activatedRoute.params.subscribe(params =>
			{
				this.store.pipe(select(selectManagementTaskById(params.id))).subscribe(res => {
					if(res){
						this.managementTask = res
						this.oldManagementTask = Object.assign({}, this.managementTask)
						this.initManagementTask()
					}
				})
			});
		this.subscriptions.push(routeSubscription);
	
	}
	initManagementTask(){
		this.createForm();
		// this.loadProvince();
	}
	createForm() {
			this.managementTaskForm = this.managementTaskFB.group({
				// cstrmrcd: [{"value":this.codenum, "disabled":true}, Validators.required],
				_id: [this.managementTask._id],
				user: [{value: this.managementTask.user.name, disabled: false},Validators.required],
				userId: [{value: this.managementTask.user._id, disabled: false},Validators.required],
				created_date: [{value: this.managementTask.start_time, disabled: false},Validators.required],
				start_time: [{value: this.managementTask.start_time? moment(this.managementTask.start_time).format("HH:mm"): "", disabled: false},Validators.required],
				end_time: [{value: this.managementTask.end_time? moment(this.managementTask.end_time).format("HH:mm"): "", disabled: false},Validators.required],
				checkpoint: [{value: this.managementTask.checkpoint.name, disabled: false},Validators.required],
				status: [{value: this.managementTask.status, disabled: false},Validators.required],
				// remark: [{value: this.managementTask.remark, disabled: false},Validators.required],
				remark: this.managementTaskFB.array(this.managementTask.remark.map(el => 
					this.managementTaskFB.group({
						question: new FormControl(el.question),
						check: new FormControl(el.check),
						description: new FormControl(el.description),
						attachment: new FormControl(el.attachment),
				})))
			});

			this.listRemark = (this.managementTaskForm.get("remark") as FormArray).controls
	}
	// getNumber() {
	// 	this.managementTaskService.generateManagementTaskCode().subscribe(
	// 		res => {
	// 			this.codenum = res.data
	// 		}
	// 	)
	// }

	goBackWithId() {
		const url = `/managementTask`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}


	onSubmit(withBack: boolean = false) {
		const _title = 'Internal User'
		const _description = 'Are you sure to create this User?';
		const _waitDesciption = 'User is creating...';
		const _deleteMessage = `User Has been create`;
		
		const dialogRef = this.layoutUtilsService.jobElement(_title, _description, _waitDesciption);
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				return;
			}
			this.hasFormErrors = false;
			const controls = this.managementTaskForm.controls;
			/** check form */
			if (this.managementTaskForm.invalid) {
				Object.keys(controls).forEach(controlName =>
					controls[controlName].markAsTouched()
				);
	
				this.hasFormErrors = true;
				this.selectedTab = 0;
				return;
			}
			this.loading = true;
			const editedManagementTask = this.prepareManagementTask();
			this.addManagementTask(editedManagementTask, withBack);
			});
	}
	prepareManagementTask(): ManagementTaskModel {
		const controls = this.managementTaskForm.controls;
		const _managementTask = new ManagementTaskModel();
		_managementTask.clear();
		_managementTask._id = this.managementTask._id;
		
		// _managementTask.cstrmrcd = controls.cstrmrcd.value;
		
		return _managementTask;
	}
	addManagementTask( _managementTask: ManagementTaskModel, withBack: boolean = false) {
		const addSubscription = this.managementTaskService.createManagementTask(_managementTask).subscribe(
			res => {
				const message = `New internal User successfully has been added.`;
				this.layoutUtilsService.showActionNotification(message, MessageType.Create, 5000, true, true);
				const url = `/managementTask`;
				this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
			},
			err => {
				console.error(err);
				const message = 'Error while adding internal User | ' + err.statusText;
				this.layoutUtilsService.showActionNotification(message, MessageType.Create, 5000, true, false);
			}
		);
		this.subscriptions.push(addSubscription);
	}
	getComponentTitle() {
		let result = 'Task Management';
		return result;
	}
	onAlertClose($event) {
		this.hasFormErrors = false;
	}
	ngOnDestroy() {
		this.subscriptions.forEach(sb => sb.unsubscribe());
	}

	_setFormValue(value, type) {
		this.managementTaskForm.patchValue({[type] : value._id})
	}
}
