import {ChangeDetectorRef, Component, OnDestroy, OnInit,} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import {  Observable, Subscription } from 'rxjs';
import { Store, select } from '@ngrx/store';
import { AppState } from '../../../../core/reducers';
import { SubheaderService, LayoutConfigService } from '../../../../core/_base/layout';
import {LayoutUtilsService, MessageType, QueryParamsModel} from '../../../../core/_base/crud';
import {EmergencyModel} from "../../../../core/emergency/emergency.model";
import {
	selectEmergencyActionLoading, selectEmergencyById,
} from "../../../../core/emergency/emergency.selector";
import {StateService} from '../../../../core/state/state.service';
import { EmergencyService } from '../../../../core/emergency/emergency.service';
import { DepartmentService } from '../../../../core/masterData/department/department.service';
import { DivisionService } from '../../../../core/masterData/division/division.service';
import { QueryDepartmentModel } from '../../../../core/masterData/department/querydepartment.model';
import { QueryDivisionModel } from '../../../../core/masterData/division/querydivision.model'
import { LocationBuildingService } from '../../../../core/masterData/locationBuilding/locationBuilding.service';
import { QueryLocationBuildingModel } from '../../../../core/masterData/locationBuilding/querylocationBuilding.model';
import { ShiftService } from '../../../../core/masterData/shift/shift.service';
import { QueryShiftModel } from '../../../../core/masterData/shift/queryshift.model';
import moment from 'moment';

@Component({
  selector: 'kt-view-emergency',
  templateUrl: './view-emergency.component.html',
  styleUrls: ['./view-emergency.component.scss']
})
export class ViewEmergencyComponent implements OnInit, OnDestroy {
	emergency: EmergencyModel;
	emergencyId$: Observable<string>;
	oldEmergency: EmergencyModel;
	selectedTab = 0;
	loading$: Observable<boolean>;
	emergencyForm: FormGroup;
	hasFormErrors = false;
	codenum: any = null;
	viewDepartmentResult = new FormControl()
	viewDivisionResult = new FormControl()
	viewLocationResult = new FormControl()
	viewShiftResult = new FormControl()
	loading : Boolean = false

	attachments: any[] = []

	private subscriptions: Subscription[] = [];
	constructor(
		private activatedRoute: ActivatedRoute,
		private router: Router,
		private emergencyFB: FormBuilder,
		private subheaderService: SubheaderService,
		private layoutUtilsService: LayoutUtilsService,
		private stateService: StateService,
		private emergencyService: EmergencyService,
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
		this.loading$ = this.store.pipe(select(selectEmergencyActionLoading));
		const routeSubscription =  this.activatedRoute.params.subscribe(params =>
			{
				this.store.pipe(select(selectEmergencyById(params.id))).subscribe(res => {
					if(res){
						this.emergency = res
						this.oldEmergency = Object.assign({}, this.emergency)
						this.initEmergency()
					}
				})
			});
		this.subscriptions.push(routeSubscription);
	
	}
	initEmergency(){
		this.createForm();
		// this.loadProvince();
	}
	createForm() {
			this.emergencyForm = this.emergencyFB.group({
				// cstrmrcd: [{"value":this.codenum, "disabled":true}, Validators.required],
				_id: [this.emergency._id],
				user: [{value: this.emergency.user.name, disabled: true},Validators.required],
				userId: [{value: this.emergency.user._id, disabled: true},Validators.required],
				created_date: [{value: this.emergency.created_date, disabled: true},Validators.required],
				time: [{value: this.emergency.created_date? moment(this.emergency.created_date).format("HH:mm"): "", disabled: true},Validators.required],
				remark: [{value: this.emergency.remark, disabled: true},Validators.required],
				status: [{value: this.emergency.status, disabled: true},Validators.required],
			});
	}
	// getNumber() {
	// 	this.emergencyService.generateEmergencyCode().subscribe(
	// 		res => {
	// 			this.codenum = res.data
	// 		}
	// 	)
	// }

	goBackWithId() {
		const url = `/emergency`;
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
			const controls = this.emergencyForm.controls;
			/** check form */
			if (this.emergencyForm.invalid) {
				Object.keys(controls).forEach(controlName =>
					controls[controlName].markAsTouched()
				);
	
				this.hasFormErrors = true;
				this.selectedTab = 0;
				return;
			}
			this.loading = true;
			const editedEmergency = this.prepareEmergency();
			this.addEmergency(editedEmergency, withBack);
			});
	}
	prepareEmergency(): EmergencyModel {
		const controls = this.emergencyForm.controls;
		const _emergency = new EmergencyModel();
		_emergency.clear();
		_emergency._id = this.emergency._id;
		
		// _emergency.cstrmrcd = controls.cstrmrcd.value;
		
		return _emergency;
	}
	addEmergency( _emergency: EmergencyModel, withBack: boolean = false) {
		const addSubscription = this.emergencyService.createEmergency(_emergency).subscribe(
			res => {
				const message = `New internal User successfully has been added.`;
				this.layoutUtilsService.showActionNotification(message, MessageType.Create, 5000, true, true);
				const url = `/emergency`;
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
		let result = 'Emergency';
		return result;
	}
	onAlertClose($event) {
		this.hasFormErrors = false;
	}
	ngOnDestroy() {
		this.subscriptions.forEach(sb => sb.unsubscribe());
	}

	_setFormValue(value, type) {
		this.emergencyForm.patchValue({[type] : value._id})
	}
}
