import {ChangeDetectorRef, Component, OnDestroy, OnInit,} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import {  Observable, Subscription } from 'rxjs';
import { Store, select } from '@ngrx/store';
import { AppState } from '../../../../core/reducers';
import { SubheaderService, LayoutConfigService } from '../../../../core/_base/layout';
import {LayoutUtilsService, MessageType, QueryParamsModel} from '../../../../core/_base/crud';
import {AbsensiModel} from "../../../../core/absensi/absensi.model";
import {
	selectAbsensiActionLoading, selectAbsensiById,
} from "../../../../core/absensi/absensi.selector";
import {StateService} from '../../../../core/state/state.service';
import {AbsensiService} from '../../../../core/absensi/absensi.service';
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
  selector: 'kt-edit-absensi',
  templateUrl: './edit-absensi.component.html',
  styleUrls: ['./edit-absensi.component.scss']
})
export class EditAbsensiComponent implements OnInit, OnDestroy {
	absensi: AbsensiModel;
	absensiId$: Observable<string>;
	oldAbsensi: AbsensiModel;
	selectedTab = 0;
	loading$: Observable<boolean>;
	absensiForm: FormGroup;
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
		private absensiFB: FormBuilder,
		private subheaderService: SubheaderService,
		private layoutUtilsService: LayoutUtilsService,
		private stateService: StateService,
		private absensiService: AbsensiService,
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
		this.loading$ = this.store.pipe(select(selectAbsensiActionLoading));
		const routeSubscription =  this.activatedRoute.params.subscribe(params =>
			{
				this.store.pipe(select(selectAbsensiById(params.id))).subscribe(res => {
					if(res){
						this.absensi = res
						this.oldAbsensi = Object.assign({}, this.absensi)
						this.initAbsensi()
					}
				})
			});
		this.subscriptions.push(routeSubscription);
	
	}
	initAbsensi(){
		this.createForm();
		// this.loadProvince();
	}
	createForm() {
			this.absensiForm = this.absensiFB.group({
				// cstrmrcd: [{"value":this.codenum, "disabled":true}, Validators.required],
				_id: [this.absensi._id],
				user: [{value: this.absensi.user.name, disabled: true},Validators.required],
				userId: [{value: this.absensi.user._id, disabled: true},Validators.required],
				date: [{value: this.absensi.date, disabled: true},Validators.required],
				clockIn: [{value: this.absensi.clockIn? moment(this.absensi.clockIn).format("HH:mm"): "", disabled: true},Validators.required],
				clockOut: [{value: this.absensi.clockOut? moment(this.absensi.clockOut).format("HH:mm"): "", disabled: true},Validators.required],
				location_in: [{value: this.absensi.location_in, disabled: true},Validators.required],
				location_out: [{value: this.absensi.location_out, disabled: true},Validators.required],
				type: [{value: this.absensi.type, disabled: true},Validators.required],
				shift: [{value: `${this.absensi.shift.start_schedule} - ${this.absensi.shift.end_schedule}`, disabled: true},Validators.required],
				attachment: [{value: this.absensi.attachment, disabled: true},Validators.required],
			});

			this.attachments = this.absensi.attachment
	}
	// getNumber() {
	// 	this.absensiService.generateAbsensiCode().subscribe(
	// 		res => {
	// 			this.codenum = res.data
	// 		}
	// 	)
	// }

	goBackWithId() {
		const url = `/absensi`;
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
			const controls = this.absensiForm.controls;
			/** check form */
			if (this.absensiForm.invalid) {
				Object.keys(controls).forEach(controlName =>
					controls[controlName].markAsTouched()
				);
	
				this.hasFormErrors = true;
				this.selectedTab = 0;
				return;
			}
			this.loading = true;
			const editedAbsensi = this.prepareAbsensi();
			this.addAbsensi(editedAbsensi, withBack);
			});
	}
	prepareAbsensi(): AbsensiModel {
		const controls = this.absensiForm.controls;
		const _absensi = new AbsensiModel();
		_absensi.clear();
		_absensi._id = this.absensi._id;
		
		// _absensi.cstrmrcd = controls.cstrmrcd.value;
		
		return _absensi;
	}
	addAbsensi( _absensi: AbsensiModel, withBack: boolean = false) {
		const addSubscription = this.absensiService.createAbsensi(_absensi).subscribe(
			res => {
				const message = `New internal User successfully has been added.`;
				this.layoutUtilsService.showActionNotification(message, MessageType.Create, 5000, true, true);
				const url = `/absensi`;
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
		let result = 'Clockin/Clockout';
		return result;
	}
	onAlertClose($event) {
		this.hasFormErrors = false;
	}
	ngOnDestroy() {
		this.subscriptions.forEach(sb => sb.unsubscribe());
	}

	_setFormValue(value, type) {
		this.absensiForm.patchValue({[type] : value._id})
	}
}
