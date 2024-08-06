import {ChangeDetectorRef, Component, OnDestroy, OnInit,} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import {  Observable, Subscription } from 'rxjs';
import { Store, select } from '@ngrx/store';
import { AppState } from '../../../../../core/reducers';
import { SubheaderService, LayoutConfigService } from '../../../../../core/_base/layout';
import {LayoutUtilsService, MessageType, QueryParamsModel} from '../../../../../core/_base/crud';
import {ShiftModel} from "../../../../../core/masterData/shift/shift.model";
import {
	selectShiftActionLoading, selectShiftById,
} from "../../../../../core/masterData/shift/shift.selector";
import {StateService} from '../../../../../core/state/state.service';
import {ShiftService} from '../../../../../core/masterData/shift/shift.service';
import { DepartmentService } from '../../../../../core/masterData/department/department.service';
import { DivisionService } from '../../../../../core/masterData/division/division.service';
import { QueryDepartmentModel } from '../../../../../core/masterData/department/querydepartment.model';
import { QueryDivisionModel } from '../../../../../core/masterData/division/querydivision.model'
import { LocationBuildingService } from '../../../../../core/masterData/locationBuilding/locationBuilding.service';
import { QueryLocationBuildingModel } from '../../../../../core/masterData/locationBuilding/querylocationBuilding.model';

@Component({
  selector: 'kt-edit-shift',
  templateUrl: './edit-shift.component.html',
  styleUrls: ['./edit-shift.component.scss']
})
export class EditShiftComponent implements OnInit, OnDestroy {
	shift: ShiftModel;
	shiftId$: Observable<string>;
	oldShift: ShiftModel;
	selectedTab = 0;
	loading$: Observable<boolean>;
	shiftForm: FormGroup;
	hasFormErrors = false;
	codenum: any = null;
	viewDepartmentResult = new FormControl()
	viewDivisionResult = new FormControl()
	viewLocationResult = new FormControl()
	loading : Boolean = false

	departmentList: any[] = [];
	departmentListFiltered = [];
	divisionList: any[] = [];
	divisionListFiltered = [];
	locationList: any[] = [];
	locationListFiltered = [];

	private subscriptions: Subscription[] = [];
	constructor(
		private activatedRoute: ActivatedRoute,
		private router: Router,
		private shiftFB: FormBuilder,
		private subheaderService: SubheaderService,
		private layoutUtilsService: LayoutUtilsService,
		private stateService: StateService,
		private shiftService: ShiftService,
		private locationBuildingService: LocationBuildingService,
		private store: Store<AppState>,
		private layoutConfigService: LayoutConfigService,
		private departmentService: DepartmentService,
		private divisionService: DivisionService,
		private cd: ChangeDetectorRef,
	) {

	}
	ngOnInit() {
		this.loading$ = this.store.pipe(select(selectShiftActionLoading));
		const routeSubscription =  this.activatedRoute.params.subscribe(params =>
			{
				this.store.pipe(select(selectShiftById(params.id))).subscribe(res => {
					if (res) {
						this.shift = res;

						this.oldShift = Object.assign({}, this.shift);
						this.initShift();
					}
				});
			});
		this.subscriptions.push(routeSubscription);
	
	}
	initShift(){
		this.createForm();
		this.loadDepartment();
		this.loadDivision();
		this.loadLocation();
		// this.loadProvince();
	}
	createForm() {
			this.shiftForm = this.shiftFB.group({
				// cstrmrcd: [{"value":this.codenum, "disabled":true}, Validators.required],
				_id: [{value: this.shift._id, disabled: true}],
				name: [{value: this.shift.name, disabled: true},Validators.required],
				department: [{value: this.shift.department._id, disabled: false},Validators.required],
				division: [{value: this.shift.division._id, disabled: false},Validators.required],
				startTime: [{value: this.shift.start_schedule, disabled: false}, Validators.required],
				endTime: [{value: this.shift.end_schedule, disabled: false}, Validators.required],

			});

			//show on html
			this.viewDepartmentResult.setValue(this.shift.department.department_name)
			this.viewDivisionResult.setValue(this.shift.division.division_name)
	}
	// getNumber() {
	// 	this.shiftService.generateShiftCode().subscribe(
	// 		res => {
	// 			this.codenum = res.data
	// 		}
	// 	)
	// }

	loadLocation(){
		const querylocation = new QueryLocationBuildingModel(
			null,
			1,
			10000
		)

		this.locationBuildingService.getListLocationBuilding(querylocation).subscribe(res => {
			this.locationList = res.data
			this.locationListFiltered = this.locationList.slice()

			this.cd.markForCheck()
		})
	}

	loadDepartment(){
		const querydepartment = new QueryDepartmentModel(
			null,
			1,
			10000
		)

		this.departmentService.getListDepartment(querydepartment).subscribe(res => {
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
			this.divisionListFiltered = this.divisionList.slice()

			this.cd.markForCheck()
		})
	}

	goBackWithId() {
		const url = `/shift`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}
	refreshShift(isNew: boolean = false, id:string = "") {
		let url = this.router.url;
		if (!isNew) {
			this.router.navigate([url], { relativeTo: this.activatedRoute });
			return;
		}

		url = `/shift/edit/${id}`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}


	onSubmit(withBack: boolean = false) {
		const _title = 'Shift'
		const _description = 'Are you sure to save?';
		const _waitDesciption = 'saving...';
		const _deleteMessage = `Shift Has been updated`;
		
		const dialogRef = this.layoutUtilsService.jobElement(_title, _description, _waitDesciption);
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				return;
			}
			this.hasFormErrors = false;
			const controls = this.shiftForm.controls;
			/** check form */
			if (this.shiftForm.invalid) {
				Object.keys(controls).forEach(controlName =>
					controls[controlName].markAsTouched()
				);
	
				this.hasFormErrors = true;
				this.selectedTab = 0;
				return;
			}
			this.loading = true;
			const editedShift = this.prepareShift();
			this.updateShift(editedShift, withBack);
			});
	}
	prepareShift(): ShiftModel {
		const controls = this.shiftForm.controls;
		const _shift = new ShiftModel();
		_shift.clear();
		_shift._id = this.shift._id;
		_shift.name = controls.name.value;
		_shift.start_schedule = controls.startTime.value;
		_shift.end_schedule = controls.endTime.value;
		_shift.department = controls.department.value;
		_shift.division = controls.division.value;
		_shift.status = true;
		
		
		return _shift;
	}
	addShift( _shift: ShiftModel, withBack: boolean = false) {
		const addSubscription = this.shiftService.createShift(_shift).subscribe(
			res => {
				const message = `New shift successfully has been added.`;
				this.layoutUtilsService.showActionNotification(message, MessageType.Create, 5000, true, true);
				const url = `/shift`;
				this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
			},
			err => {
				console.error(err);
				const message = 'Error while adding shift | ' + err.statusText;
				this.layoutUtilsService.showActionNotification(message, MessageType.Create, 5000, true, false);
			}
		);
		this.subscriptions.push(addSubscription);
	}
	updateShift( _shift: ShiftModel, withBack: boolean = false) {
		const addSubscription = this.shiftService.updateShift(_shift).subscribe(
			res => {
				const message = `Shift successfully updated.`;
				this.layoutUtilsService.showActionNotification(message, MessageType.Create, 5000, true, true);
				const url = `/shift`;
				this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
			},
			err => {
				console.error(err);
				const message = 'Error while saving shift | ' + err.statusText;
				this.layoutUtilsService.showActionNotification(message, MessageType.Create, 5000, true, false);
			}
		);
		this.subscriptions.push(addSubscription);
	}
	getComponentTitle() {
		let result = 'Create Shift';
		return result;
	}
	onAlertClose($event) {
		this.hasFormErrors = false;
	}
	ngOnDestroy() {
		this.subscriptions.forEach(sb => sb.unsubscribe());
	}

	_onKeyup(e: any, type) {
		this.shiftForm.patchValue({ [type]: undefined });
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
				if (filterText.includes(text.toLocaleLowerCase())) return i;
			});
		}
		else if(type === "location"){
			this.locationListFiltered = this.locationList.filter(i => {
				const filterText = `${i.name.toLocaleLowerCase()}`;
				if (filterText.includes(text.toLocaleLowerCase())) return i;
			});
		}
	}

	_setFormValue(value, type) {
		this.shiftForm.patchValue({[type] : value._id})

		//show division filtered by department
		if(type === "department"){
			this.divisionListFiltered = this.divisionList.filter(i => 
				i.department._id === value._id
			)

			//reset division
			this.shiftForm.controls.division.setValue(undefined)
			this.viewDivisionResult.setValue("")
		}
	}

	// Change value to input data in variabel arr (timeList)
	changeValue(property, event) {
		const controls = this.shiftForm.controls

		controls[property].setValue(event)
		this.cd.markForCheck()
	}
}
