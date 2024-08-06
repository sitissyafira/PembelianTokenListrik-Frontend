import {ChangeDetectorRef, Component, OnDestroy, OnInit,} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import {  Observable, Subscription } from 'rxjs';
import { Store, select } from '@ngrx/store';
import { AppState } from '../../../../core/reducers';
import { SubheaderService, LayoutConfigService } from '../../../../core/_base/layout';
import {LayoutUtilsService, MessageType, QueryParamsModel} from '../../../../core/_base/crud';
import {InspeksiModel} from "../../../../core/inspeksi/inspeksi.model";
import {
	selectInspeksiActionLoading, selectInspeksiById,
} from "../../../../core/inspeksi/inspeksi.selector";
import {StateService} from '../../../../core/state/state.service';
import {InspeksiService} from '../../../../core/inspeksi/inspeksi.service';
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
  selector: 'kt-add-inspeksi',
  templateUrl: './add-inspeksi.component.html',
  styleUrls: ['./add-inspeksi.component.scss']
})
export class AddInspeksiComponent implements OnInit, OnDestroy {
	inspeksi: InspeksiModel;
	inspeksiId$: Observable<string>;
	oldInspeksi: InspeksiModel;
	selectedTab = 0;
	loading$: Observable<boolean>;
	inspeksiForm: FormGroup;
	hasFormErrors = false;
	codenum: any = null;
	viewDepartmentResult = new FormControl()
	viewDivisionResult = new FormControl()
	viewLocationResult = new FormControl()
	viewShiftResult = new FormControl()
	loading : Boolean = false

	attachments: String = ""

	private subscriptions: Subscription[] = [];
	constructor(
		private activatedRoute: ActivatedRoute,
		private router: Router,
		private inspeksiFB: FormBuilder,
		private subheaderService: SubheaderService,
		private layoutUtilsService: LayoutUtilsService,
		private stateService: StateService,
		private inspeksiService: InspeksiService,
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
		this.loading$ = this.store.pipe(select(selectInspeksiActionLoading));
		const routeSubscription =  this.activatedRoute.params.subscribe(params =>
			{
				this.store.pipe(select(selectInspeksiById(params.id))).subscribe(res => {
					if(res){
						this.inspeksi = res
						this.oldInspeksi = Object.assign({}, this.inspeksi)
						this.initInspeksi()
					}
				})
			});
		this.subscriptions.push(routeSubscription);
	
	}
	initInspeksi(){
		this.createForm();
		// this.loadProvince();
	}
	createForm() {
			this.inspeksiForm = this.inspeksiFB.group({
				// cstrmrcd: [{"value":this.codenum, "disabled":true}, Validators.required],
				_id: [this.inspeksi._id],
				user: [{value: this.inspeksi.user.name, disabled: true},Validators.required],
				userId: [{value: this.inspeksi.user._id, disabled: true},Validators.required],
				created_date: [{value: moment(this.inspeksi.created_date).format("DD-MM-YYYY HH:mm"), disabled: true},Validators.required],
				remark: [{value: this.inspeksi.remark, disabled: true},Validators.required],
				attachment: [{value: this.inspeksi.attachment, disabled: true},Validators.required],
			});

			this.attachments = this.inspeksi.attachment
	}
	// getNumber() {
	// 	this.inspeksiService.generateInspeksiCode().subscribe(
	// 		res => {
	// 			this.codenum = res.data
	// 		}
	// 	)
	// }

	goBackWithId() {
		const url = `/inspeksi`;
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
			const controls = this.inspeksiForm.controls;
			/** check form */
			if (this.inspeksiForm.invalid) {
				Object.keys(controls).forEach(controlName =>
					controls[controlName].markAsTouched()
				);
	
				this.hasFormErrors = true;
				this.selectedTab = 0;
				return;
			}
			this.loading = true;
			const editedInspeksi = this.prepareInspeksi();
			this.addInspeksi(editedInspeksi, withBack);
			});
	}
	prepareInspeksi(): InspeksiModel {
		const controls = this.inspeksiForm.controls;
		const _inspeksi = new InspeksiModel();
		_inspeksi.clear();
		_inspeksi._id = this.inspeksi._id;
		
		// _inspeksi.cstrmrcd = controls.cstrmrcd.value;
		
		return _inspeksi;
	}
	addInspeksi( _inspeksi: InspeksiModel, withBack: boolean = false) {
		const addSubscription = this.inspeksiService.createInspeksi(_inspeksi).subscribe(
			res => {
				const message = `New internal User successfully has been added.`;
				this.layoutUtilsService.showActionNotification(message, MessageType.Create, 5000, true, true);
				const url = `/inspeksi`;
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
		let result = 'Inspeksi';
		return result;
	}
	onAlertClose($event) {
		this.hasFormErrors = false;
	}
	ngOnDestroy() {
		this.subscriptions.forEach(sb => sb.unsubscribe());
	}

	_setFormValue(value, type) {
		this.inspeksiForm.patchValue({[type] : value._id})
	}
}
