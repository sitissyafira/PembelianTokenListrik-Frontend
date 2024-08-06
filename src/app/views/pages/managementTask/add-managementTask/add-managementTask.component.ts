import {ChangeDetectorRef, Component, OnDestroy, OnInit,} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import {  Observable, Subscription } from 'rxjs';
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
import { QueryCheckpointModel } from '../../../../core/masterData/checkpoint/querycheckpoint.model';
import { CheckpointService } from '../../../../core/masterData/checkpoint/checkpoint.service';
import { TaskManagementMasterService } from '../../../../core/taskManagementMaster/taskManagementMaster.service';

@Component({
  selector: 'kt-add-managementTask',
  templateUrl: './add-managementTask.component.html',
  styleUrls: ['./add-managementTask.component.scss']
})
export class AddManagementTaskComponent implements OnInit, OnDestroy {
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
	viewUserResult = new FormControl()
	viewCheckpointResult = new FormControl()
	loading : Boolean = false

	attachments: any[] = []

	departmentList: any[] = []
	departmentListFiltered: any[] = []
	divisionList: any[] = []
	divisionListFiltered: any[] = []
	checkpointList: any[] = []
	checkpointListFiltered: any[] = []
	userList: any[] = []
	userListFiltered: any[] = []

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
		private checkpointService: CheckpointService,
		private taskManagementMasterService: TaskManagementMasterService,
		private shiftService: ShiftService,
		private cd: ChangeDetectorRef,
	) {

	}
	ngOnInit() {
		this.loading$ = this.store.pipe(select(selectManagementTaskActionLoading));
		const routeSubscription =  this.activatedRoute.params.subscribe(params =>
			{
				this.managementTask = new ManagementTaskModel()
				this.managementTask.clear()
				this.initManagementTask()
			});
		this.subscriptions.push(routeSubscription);
	
	}
	initManagementTask(){
		this.createForm();
		this.loadDepartment();
		this.loadDivision();
		this.loadCheckpoint();
		// this.loadProvince();
	}
	createForm() {
			this.managementTaskForm = this.managementTaskFB.group({
				// cstrmrcd: [{"value":this.codenum, "disabled":true}, Validators.required],
				department: [{value: "", disabled: false},Validators.required],
				division: [{value: "", disabled: false},Validators.required],
				user: [{value: "", disabled: false},Validators.required],
				// userId: [{value: "", disabled: false},Validators.required],
				created_date: [{value: "", disabled: false},Validators.required],
				start_time: [{value: "", disabled: false},Validators.required],
				end_time: [{value: "", disabled: false},Validators.required],
				checkpoint: [{value: "", disabled: false},Validators.required],
				remark: [{value: "", disabled: false},Validators.required],
			});
	}
	loadDepartment(){
		const querydepartment = new QueryDepartmentModel(
			null,
			1,
			10000
		)

		this.departmentService.getListDepartment(querydepartment).subscribe(res => {
			console.log(res)
			this.departmentList = res.data
			this.departmentListFiltered = this.departmentList.slice()

			this.cd.markForCheck()
		})
	}

	loadDivision(){
		const querydivision = new QueryDivisionModel(
			null,
			1,
			10000
		)

		this.divisionService.getListDivision(querydivision).subscribe(res => {
			this.divisionList = res.data
			this.cd.markForCheck()
		})
	}
	loadCheckpoint(){
		const queryCP = new QueryCheckpointModel(
			null, 
			1, 
			10000
		)

		this.checkpointService.getListCheckpoint(queryCP).subscribe(res => {
			this.checkpointList = res.data
			this.checkpointListFiltered = this.checkpointList.slice()
			this.cd.markForCheck()
		})
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
		const _title = 'Task Management'
		const _description = 'Are you sure to Task to this User?';
		const _waitDesciption = 'creating...';
		const _deleteMessage = `Task Has been create`;
		
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
		_managementTask.department = this.managementTaskForm.controls.department.value
		_managementTask.division = this.managementTaskForm.controls.division.value
		_managementTask.user = this.managementTaskForm.controls.user.value
		_managementTask.created_date = this.managementTaskForm.controls.created_date.value
		_managementTask.start_time = this.managementTaskForm.controls.start_time.value
		_managementTask.end_time = this.managementTaskForm.controls.end_time.value
		_managementTask.checkpoint = this.managementTaskForm.controls.checkpoint.value
		_managementTask.remark = this.managementTaskForm.controls.remark.value
		_managementTask.status = "open"
		
		// _managementTask.cstrmrcd = controls.cstrmrcd.value;
		
		return _managementTask;
	}
	addManagementTask( _managementTask: ManagementTaskModel, withBack: boolean = false) {
		const addSubscription = this.managementTaskService.createManagementTask(_managementTask).subscribe(
			res => {
				const message = `New Task successfully has been added.`;
				this.layoutUtilsService.showActionNotification(message, MessageType.Create, 5000, true, true);
				const url = `/managementTask`;
				this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
			},
			err => {
				console.error(err);
				const message = 'Error while adding Task | ' + err.statusText;
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

	_onKeyup(e: any, type) {
		this.managementTaskForm.patchValue({ [type]: undefined });
		this._filterList(e.target.value, type);
	}
	_filterList(text: string, type) {
		if(type === "department"){
			this.departmentListFiltered = this.departmentList.filter(i => {
				const filterText = `${i.department_name.toLocaleLowerCase()}`;
				if (filterText.includes(text.toLocaleLowerCase())) return i;
			});
		}
		else if(type === "division"){
			this.divisionListFiltered = this.divisionList.filter(i => {
				const filterText = `${i.division_name.toLocaleLowerCase()}`;
				if (filterText.includes(text.toLocaleLowerCase()) && this.managementTaskForm.controls.department.value === i.department._id) return i;
			});
		}
		else if(type === "user"){
			this.userListFiltered = this.userList.filter(i => {
				const filterText = `${i.name.toLocaleLowerCase()}`;
				if (filterText.includes(text.toLocaleLowerCase())) return i;
			});
		}
		else if(type === "checkpoint"){
			this.checkpointListFiltered = this.checkpointList.filter(i => {
				const filterText = `${i.name.toLocaleLowerCase()}`;
				if (filterText.includes(text.toLocaleLowerCase())) return i;
			});
		}
	}


	_setFormValue(value, type) {
		this.managementTaskForm.patchValue({[type] : value._id})

		//show division filtered by department
		if(type === "department"){
			this.divisionListFiltered = this.divisionList.filter(i => 
				i.department._id === value._id
			)

			//reset division
			this.managementTaskForm.controls.division.setValue(undefined)
			this.viewDivisionResult.setValue("")
		}

		if(type === 'division'){
			this.taskManagementMasterService.findUser(this.managementTaskForm.controls.department.value, this.managementTaskForm.controls.division.value).subscribe(res => {
				this.userList = res.data
				this.userListFiltered = res.data.slice()
			})
		}
	}
	setFormTime(value, type){
		this.managementTaskForm.patchValue({[type] : value})
	}
}
