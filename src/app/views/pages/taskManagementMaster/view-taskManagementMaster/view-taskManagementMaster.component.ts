import {ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild,} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import {  BehaviorSubject, Observable, Subscription } from 'rxjs';
import { Store, select } from '@ngrx/store';
import { AppState } from '../../../../core/reducers';
import { SubheaderService, LayoutConfigService } from '../../../../core/_base/layout';
import {LayoutUtilsService, MessageType, QueryParamsModel} from '../../../../core/_base/crud';
import {TaskManagementMasterModel} from "../../../../core/taskManagementMaster/taskManagementMaster.model";
import {
	selectTaskManagementMasterActionLoading, selectTaskManagementMasterById,
} from "../../../../core/taskManagementMaster/taskManagementMaster.selector";
import {StateService} from '../../../../core/state/state.service';
import { TaskManagementMasterService } from '../../../../core/taskManagementMaster/taskManagementMaster.service';
import { DepartmentService } from '../../../../core/masterData/department/department.service';
import { DivisionService } from '../../../../core/masterData/division/division.service';
import { QueryDepartmentModel } from '../../../../core/masterData/department/querydepartment.model';
import { QueryDivisionModel } from '../../../../core/masterData/division/querydivision.model'
import { LocationBuildingService } from '../../../../core/masterData/locationBuilding/locationBuilding.service';
import { QueryLocationBuildingModel } from '../../../../core/masterData/locationBuilding/querylocationBuilding.model';
import { ShiftService } from '../../../../core/masterData/shift/shift.service';
import { QueryShiftModel } from '../../../../core/masterData/shift/queryshift.model';
import moment from 'moment';
import { SelectionModel } from '@angular/cdk/collections';
import { QueryCheckpointModel } from '../../../../core/masterData/checkpoint/querycheckpoint.model';
import { CheckpointService } from '../../../../core/masterData/checkpoint/checkpoint.service';
import { SurveyTemplateService } from '../../../../core/masterData/surveyTemplate/surveyTemplate.service';
import { QuerySurveyTemplateModel } from '../../../../core/masterData/surveyTemplate/querysurveyTemplate.model';
import { MatTable } from '@angular/material';

@Component({
  selector: 'kt-view-taskManagementMaster',
  templateUrl: './view-taskManagementMaster.component.html',
  styleUrls: ['./view-taskManagementMaster.component.scss']
})
export class ViewTaskManagementMasterComponent implements OnInit, OnDestroy {
	taskManagementMaster: TaskManagementMasterModel;
	taskManagementMasterId$: Observable<string>;
	oldTaskManagementMaster: TaskManagementMasterModel;
	selectedTab = 0;
	loading$: Observable<boolean>;
	taskManagementMasterForm: FormGroup;
	hasFormErrors = false;
	codenum: any = null;
	viewDepartmentResult = new FormControl()
	viewDivisionResult = new FormControl()
	viewUserResult = new FormControl()
	viewCheckpointResult = new FormControl()
	loading : Boolean = false

	departmentList: any[] = [];
	departmentListFiltered = [];
	divisionList: any[] = [];
	divisionListFiltered = [];
	userList: any[] = [];
	userListFiltered = [];
	checkpointList: any[] = [];
	checkpointListFiltered = [];
	surveyTemplateList: any[] = [];
	surveyTemplateListFiltered = [];

	attachments: any[] = []
	daysList = [
		{label: "Senin", value: 1 } ,
		{label: "Selasa", value: 2 } ,
		{label: "Rabu", value: 3 } ,
		{label: "Kamis", value: 4 } ,
		{label: "Jumat", value: 5 } ,
		{label: "Sabtu", value: 6 } ,
		{label: "Minggu", value: 0 } ,
	  ];

	repeatOptions = [
		{ label: "Tidak ada pengulangan", value: 0 },
		{label: "Setiap 1 Minggu", value: 7},
		{label: "Setiap 2 Minggu", value: 14},
		{label: "Setiap 3 Minggu", value: 21},
		{label: "Setiap 4 Minggu", value: 28}
	]

	selectedColumns = [];
	selection = new SelectionModel<any>(true, []);

	listRemark: any[] = []

	dataSource: any = new BehaviorSubject([]);
	@ViewChild('myTable', { static: false }) table: MatTable<any>;
	displayedColumns = ["question", "actions"];
	private subscriptions: Subscription[] = [];
	constructor(
		private activatedRoute: ActivatedRoute,
		private router: Router,
		private taskManagementMasterFB: FormBuilder,
		private subheaderService: SubheaderService,
		private layoutUtilsService: LayoutUtilsService,
		private stateService: StateService,
		private taskManagementMasterService: TaskManagementMasterService,
		private locationBuildingService: LocationBuildingService,
		private store: Store<AppState>,
		private layoutConfigService: LayoutConfigService,
		private departmentService: DepartmentService,
		private divisionService: DivisionService,
		private checkpointService: CheckpointService,
		private shiftService: ShiftService,
		private cd: ChangeDetectorRef,
		private surveyTemplateService: SurveyTemplateService,
	) {

	}
	ngOnInit() {
		this.loading$ = this.store.pipe(select(selectTaskManagementMasterActionLoading));
		const routeSubscription =  this.activatedRoute.params.subscribe(params =>
			{
				const id = params.id
				if(id){
					this.store.pipe(select(selectTaskManagementMasterById(id))).subscribe(res => {
						if(res){
							this.taskManagementMaster = res
							this.oldTaskManagementMaster = Object.assign({}, this.taskManagementMaster)
							this.initTaskManagementMaster()
						}
					})
				}
			});
		this.subscriptions.push(routeSubscription);
	
	}
	initTaskManagementMaster(){
		this.createForm();
		this.loadDepartment();
		this.loadDivision();
		this.loadCheckpoint();
		this.loadSurveyTemplate();
		// this.loadProvince();
	}
	createForm() {
			this.taskManagementMasterForm = this.taskManagementMasterFB.group({
				id: [{value: this.taskManagementMaster._id, disabled: true},Validators.required],
				department: [{value: this.taskManagementMaster.department, disabled: true},Validators.required],
				division: [{value: this.taskManagementMaster.division, disabled: true},Validators.required],
				user: [{value: this.taskManagementMaster.user, disabled: true}],
				repeat: [{value: this.repeatOptions.find(obj => obj.value === this.taskManagementMaster.repeat), disabled: true},Validators.required],
				checkpoint: [{value: this.taskManagementMaster.checkpoint, disabled: true},Validators.required],
				start_date: [{value: this.taskManagementMaster.start_date, disabled: true},Validators.required],
				// end_date: [{value: "", disabled: false},Validators.required],
				start_time: [{value: this.taskManagementMaster.start_time, disabled: true},Validators.required],
				end_time: [{value: this.taskManagementMaster.end_time, disabled: true},Validators.required],
				task_desc: [{value: this.taskManagementMaster.task_desc, disabled: true},Validators.required],
				remark: this.taskManagementMasterFB.array(this.taskManagementMaster.remark.map(el => 
					this.taskManagementMasterFB.group({
						question: new FormControl(el.question),
						description: new FormControl(el.description),
						attachment: new FormControl(el.attachment),
				})))
			});

			this.viewDepartmentResult.setValue(this.taskManagementMaster.department.department_name)
			this.viewDepartmentResult.disable()
			this.viewDivisionResult.setValue(this.taskManagementMaster.division.division_name)
			this.viewDivisionResult.disable()
			this.viewUserResult.setValue(this.taskManagementMaster.user? this.taskManagementMaster.user.name : null)
			this.viewUserResult.disable()
			this.viewCheckpointResult.setValue(this.taskManagementMaster.checkpoint.name)
			this.viewCheckpointResult.disable()

			this.daysList.filter(obj => this.taskManagementMaster.selectedDays.includes(obj.value)).forEach(e => {
				this.selection.select(e)
			})
			this.listRemark = (this.taskManagementMasterForm.get("remark") as FormArray).controls
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
	loadSurveyTemplate() {

		const query = new QuerySurveyTemplateModel(
			null,
			1,
			10000
		)

		this.surveyTemplateService.getListSurveyTemplate(query).subscribe(res => {
			this.surveyTemplateList = res.data
			this.surveyTemplateListFiltered = this.surveyTemplateList.slice()
			this.cd.markForCheck()
		})
	}
	// getNumber() {
	// 	this.taskManagementMasterService.generateTaskManagementMasterCode().subscribe(
	// 		res => {
	// 			this.codenum = res.data
	// 		}
	// 	)
	// }

	goBackWithId() {
		const url = `/taskManagementMaster`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}


	onSubmit(withBack: boolean = false) {
		const _title = 'Task'
		const _description = 'Are you sure to update this Task?';
		const _waitDesciption = 'Task is creating...';
		const _deleteMessage = `Task Has been updated`;

		const dialogRef = this.layoutUtilsService.jobElement(_title, _description, _waitDesciption);
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				return;
			}
			this.hasFormErrors = false;
			const controls = this.taskManagementMasterForm.controls;
			/** check form */
			if (this.taskManagementMasterForm.invalid) {
				Object.keys(controls).forEach(controlName =>
					controls[controlName].markAsTouched()
				);
	
				this.hasFormErrors = true;
				this.selectedTab = 0;
				return;
			}
			this.loading = true;
			const editedTaskManagementMaster = this.prepareTaskManagementMaster();
			this.editTaskManagementMaster(editedTaskManagementMaster, withBack);
			});
	}
	prepareTaskManagementMaster(): TaskManagementMasterModel {
		const controls = this.taskManagementMasterForm.controls;

		//handle selected days
		let arrayDays = []
		this.selection.selected.forEach(e => {
			arrayDays.push(e.value)
		})
		arrayDays.sort((a, b) => a - b);

		const _taskManagementMaster = new TaskManagementMasterModel();
		_taskManagementMaster.clear();
		_taskManagementMaster._id = this.taskManagementMaster._id
		_taskManagementMaster.department = controls.department.value
		_taskManagementMaster.division  = controls.division.value
		_taskManagementMaster.user = controls.user.value
		_taskManagementMaster.repeat = controls.repeat.value.value
		_taskManagementMaster.remark = controls.remark.value
		_taskManagementMaster.status = "open"
		_taskManagementMaster.start_time = controls.start_time.value
		_taskManagementMaster.end_time = controls.end_time.value
		_taskManagementMaster.start_date = controls.start_date.value
		_taskManagementMaster.checkpoint = controls.checkpoint.value
		_taskManagementMaster.selectedDays = arrayDays
		_taskManagementMaster.remark = controls.remark.value
		// _taskManagementMaster.cstrmrcd = controls.cstrmrcd.value;
		
		return _taskManagementMaster;
	}
	editTaskManagementMaster( _taskManagementMaster: TaskManagementMasterModel, withBack: boolean = false) {
		const addSubscription = this.taskManagementMasterService.updateTaskManagementMaster(_taskManagementMaster).subscribe(
			res => {
				const message = `New Master Task successfully has been added.`;
				this.layoutUtilsService.showActionNotification(message, MessageType.Create, 5000, true, true);
				const url = `/taskManagementMaster`;
				this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
			},
			err => {
				console.error(err);
				const message = 'Error while adding Master Task | ' + err.statusText;
				this.layoutUtilsService.showActionNotification(message, MessageType.Create, 5000, true, false);
			}
		);
		this.subscriptions.push(addSubscription);
	}
	getComponentTitle() {
		let result = 'View Task Management Master';
		return result;
	}
	onAlertClose($event) {
		this.hasFormErrors = false;
	}
	ngOnDestroy() {
		this.subscriptions.forEach(sb => sb.unsubscribe());
	}

	_onKeyup(e: any, type) {
		this.taskManagementMasterForm.patchValue({ [type]: undefined });
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
				if (filterText.includes(text.toLocaleLowerCase()) && this.taskManagementMasterForm.controls.department.value === i.department._id) return i;
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
		this.taskManagementMasterForm.patchValue({[type] : value._id})

		//show division filtered by department
		if(type === "department"){
			this.divisionListFiltered = this.divisionList.filter(i => 
				i.department._id === value._id
			)

			//reset division
			this.taskManagementMasterForm.controls.division.setValue(undefined)
			this.viewDivisionResult.setValue("")
		}

		if(type === 'division'){
			this.taskManagementMasterService.findUser(this.taskManagementMasterForm.controls.department.value, this.taskManagementMasterForm.controls.division.value).subscribe(res => {
				this.userList = res.data
				this.userListFiltered = res.data.slice()
			})
		}
	}
	setFormTime(value, type){
		this.taskManagementMasterForm.patchValue({[type] : value})
	}
	addQuestionToList(id) {
		let questionsArray = this.taskManagementMasterForm.controls['remark'] as FormArray
		questionsArray.push(this.taskManagementMasterFB.group({
			question: new FormControl(),
		})
		)

		this.cd.markForCheck()
		this.listRemark = (this.taskManagementMasterForm.get('remark') as FormArray).controls
		this.table.dataSource = this.listRemark
		this.table.renderRows();
	}

	removeQuestionFromList(id) {
		let questionsArray = this.taskManagementMasterForm.controls['remark'] as FormArray
		questionsArray.removeAt(id)
		this.listRemark = (this.taskManagementMasterForm.get('remark') as FormArray).controls

		this.cd.markForCheck()

		this.table.dataSource = this.listRemark
		this.table.renderRows();

	}

	generateSurvey(item) {
		let temp = this.taskManagementMasterForm.get('remark') as FormArray;

		temp.clear();

		item.survey.map(el => temp.push(this.taskManagementMasterFB.group({
			question: new FormControl(el)
		})));

		this.cd.markForCheck()
		this.listRemark = (this.taskManagementMasterForm.get('remark') as FormArray).controls
		this.table.dataSource = this.listRemark
		this.table.renderRows();

	}
}
