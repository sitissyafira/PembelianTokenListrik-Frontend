import {ChangeDetectorRef, Component, OnDestroy, OnInit,} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import {  Observable, Subscription } from 'rxjs';
import { Store, select } from '@ngrx/store';
import { AppState } from '../../../../core/reducers';
import { SubheaderService, LayoutConfigService } from '../../../../core/_base/layout';
import {LayoutUtilsService, MessageType, QueryParamsModel} from '../../../../core/_base/crud';
import {PatroliModel} from "../../../../core/patroli/patroli.model";
import {
	selectPatroliActionLoading, selectPatroliById,
} from "../../../../core/patroli/patroli.selector";
import {StateService} from '../../../../core/state/state.service';
import {PatroliService} from '../../../../core/patroli/patroli.service';
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
  selector: 'kt-add-patroli',
  templateUrl: './add-patroli.component.html',
  styleUrls: ['./add-patroli.component.scss']
})
export class AddPatroliComponent implements OnInit, OnDestroy {
	patroli: PatroliModel;
	patroliId$: Observable<string>;
	oldPatroli: PatroliModel;
	selectedTab = 0;
	loading$: Observable<boolean>;
	patroliForm: FormGroup;
	hasFormErrors = false;
	codenum: any = null;
	viewDepartmentResult = new FormControl()
	viewDivisionResult = new FormControl()
	viewLocationResult = new FormControl()
	viewShiftResult = new FormControl()
	loading : Boolean = false

	viewCheckpointForm = new FormControl()

	attachments: any[] = []

	private subscriptions: Subscription[] = [];
	constructor(
		private activatedRoute: ActivatedRoute,
		private router: Router,
		private patroliFB: FormBuilder,
		private subheaderService: SubheaderService,
		private layoutUtilsService: LayoutUtilsService,
		private stateService: StateService,
		private patroliService: PatroliService,
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
		this.loading$ = this.store.pipe(select(selectPatroliActionLoading));
		const routeSubscription =  this.activatedRoute.params.subscribe(params =>
			{
				this.store.pipe(select(selectPatroliById(params.id))).subscribe(res => {
					if(res){
						this.patroli = res
						this.oldPatroli = Object.assign({}, this.patroli)
						this.initPatroli()
					}
				})
			});
		this.subscriptions.push(routeSubscription);
	
	}
	initPatroli(){
		this.createForm();
		// this.loadProvince();
	}
	createForm() {
			this.patroliForm = this.patroliFB.group({
				// cstrmrcd: [{"value":this.codenum, "disabled":true}, Validators.required],
				_id: [this.patroli._id],
				user: [{value: this.patroli.user.name, disabled: true},Validators.required],
				userId: [{value: this.patroli.user._id, disabled: true},Validators.required],
				date: [{value: this.patroli.created_date, disabled: true},Validators.required],
				time: [{value: moment(this.patroli.created_date).format("HH:mm"), disabled: true},Validators.required],
				checkpoint: [{value: this.patroli.checkpoint, disabled: true},Validators.required],
				remark: [{value: this.patroli.remark, disabled: true},Validators.required],
				attachment: [{value: this.patroli.attachment, disabled: true},Validators.required],
			});

			this.viewCheckpointForm.disable()
			this.viewCheckpointForm.setValue(this.patroli.checkpoint.name)

			this.attachments = this.patroli.attachment
	}
	// getNumber() {
	// 	this.patroliService.generatePatroliCode().subscribe(
	// 		res => {
	// 			this.codenum = res.data
	// 		}
	// 	)
	// }

	goBackWithId() {
		const url = `/patroli`;
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
			const controls = this.patroliForm.controls;
			/** check form */
			if (this.patroliForm.invalid) {
				Object.keys(controls).forEach(controlName =>
					controls[controlName].markAsTouched()
				);
	
				this.hasFormErrors = true;
				this.selectedTab = 0;
				return;
			}
			this.loading = true;
			const editedPatroli = this.preparePatroli();
			this.addPatroli(editedPatroli, withBack);
			});
	}
	preparePatroli(): PatroliModel {
		const controls = this.patroliForm.controls;
		const _patroli = new PatroliModel();
		_patroli.clear();
		_patroli._id = this.patroli._id;
		
		// _patroli.cstrmrcd = controls.cstrmrcd.value;
		
		return _patroli;
	}
	addPatroli( _patroli: PatroliModel, withBack: boolean = false) {
		const addSubscription = this.patroliService.createPatroli(_patroli).subscribe(
			res => {
				const message = `New internal User successfully has been added.`;
				this.layoutUtilsService.showActionNotification(message, MessageType.Create, 5000, true, true);
				const url = `/patroli`;
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
		let result = 'Patroli';
		return result;
	}
	onAlertClose($event) {
		this.hasFormErrors = false;
	}
	ngOnDestroy() {
		this.subscriptions.forEach(sb => sb.unsubscribe());
	}

	_setFormValue(value, type) {
		this.patroliForm.patchValue({[type] : value._id})
	}
}
