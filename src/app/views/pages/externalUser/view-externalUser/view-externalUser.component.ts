import {ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild, ElementRef} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import {  Observable, Subscription } from 'rxjs';
import { Store, select } from '@ngrx/store';
import { AppState } from '../../../../core/reducers';
import { SubheaderService, LayoutConfigService } from '../../../../core/_base/layout';
import {LayoutUtilsService, MessageType, QueryParamsModel} from '../../../../core/_base/crud';
import {ExternalUserModel} from "../../../../core/externalUser/externalUser.model";
import {
	selectExternalUserActionLoading, selectExternalUserById,
} from "../../../../core/externalUser/externalUser.selector";
import {StateService} from '../../../../core/state/state.service';
import {ExternalUserService} from '../../../../core/externalUser/externalUser.service';
import { DepartmentService } from '../../../../core/masterData/department/department.service';
import { DivisionService } from '../../../../core/masterData/division/division.service';
import { QueryDepartmentModel } from '../../../../core/masterData/department/querydepartment.model';
import { QueryDivisionModel } from '../../../../core/masterData/division/querydivision.model'
import { LocationBuildingService } from '../../../../core/masterData/locationBuilding/locationBuilding.service';
import { QueryLocationBuildingModel } from '../../../../core/masterData/locationBuilding/querylocationBuilding.model';
import { ShiftService } from '../../../../core/masterData/shift/shift.service';
import { QueryShiftModel } from '../../../../core/masterData/shift/queryshift.model';

@Component({
  selector: 'kt-view-externalUser',
  templateUrl: './view-externalUser.component.html',
  styleUrls: ['./view-externalUser.component.scss']
})
export class ViewExternalUserComponent implements OnInit, OnDestroy {
	externalUser: ExternalUserModel;
	externalUserId$: Observable<string>;
	oldExternalUser: ExternalUserModel;
	selectedTab = 0;
	loading$: Observable<boolean>;
	externalUserForm: FormGroup;
	hasFormErrors = false;
	codenum: any = null;
	viewDepartmentResult = new FormControl()
	viewDivisionResult = new FormControl()
	viewLocationResult = new FormControl()
	viewShiftResult = new FormControl()
	loading : Boolean = false

	departmentList: any[] = [];
	departmentListFiltered = [];
	divisionList: any[] = [];
	divisionListFiltered = [];
	locationList: any[] = [];
	locationListFiltered = [];
	shiftList: any[] = [];
	shiftListFiltered = [];

	documents: any[] = []
	selectedDocument: any
	@ViewChild('documentInput', { static: false }) documentInputEl: ElementRef;


	private subscriptions: Subscription[] = [];
	constructor(
		private activatedRoute: ActivatedRoute,
		private router: Router,
		private externalUserFB: FormBuilder,
		private subheaderService: SubheaderService,
		private layoutUtilsService: LayoutUtilsService,
		private stateService: StateService,
		private externalUserService: ExternalUserService,
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
		this.loading$ = this.store.pipe(select(selectExternalUserActionLoading));
		const routeSubscription =  this.activatedRoute.params.subscribe(params =>
			{
				this.store.pipe(select(selectExternalUserById(params.id))).subscribe(res => {
					if (res) {
						this.externalUser = res;

						this.oldExternalUser = Object.assign({}, this.externalUser);
						this.initExternalUser();
					}
				});
			});
		this.subscriptions.push(routeSubscription);
	
	}

	initExternalUser(){
		this.createForm();
		this.loadDepartment();
		this.loadDivision();
		this.loadLocation();
		this.loadShift();
		// this.loadProvince();
	}
	createForm() {
			
			this.externalUserForm = this.externalUserFB.group({
				// cstrmrcd: [{"value":this.codenum, "disabled":true}, Validators.required],
				_id: [{value: this.externalUser._id, disabled: true}],
				name: [{value: this.externalUser.name, disabled: true},Validators.required],
				email: [{value: this.externalUser.email, disabled: true}, Validators.required],
				birth_date: [{value: this.externalUser.birth_date, disabled: true}, Validators.required],
				join_date: [{value: this.externalUser.join_date, disabled: true}, Validators.required],
				phone: [{value: this.externalUser.phone, disabled: true}, Validators.required],
				department: [{value: this.externalUser.department._id, disabled: true}, Validators.required],
				division: [{value: this.externalUser.division._id, disabled: true}],
				location: [{value: this.externalUser.location._id, disabled: true}, Validators.required],
				shift: [{value: this.externalUser.shift? this.externalUser.shift._id: "", disabled: true}, Validators.required],
			});

			this.viewDivisionResult.setValue(this.externalUser.division.division_name)
			this.viewDepartmentResult.setValue(this.externalUser.department.department_name)
			this.viewLocationResult.setValue(this.externalUser.location.name)
			this.viewShiftResult.setValue(this.externalUser.shift? this.externalUser.shift.name: "")

			this.viewDivisionResult.disable()
			this.viewDepartmentResult.disable()
			this.viewLocationResult.disable()
			this.viewShiftResult.disable()

			this.documents = this.loadDocumentUrl('attachment')
	}
	// getNumber() {
	// 	this.externalUserService.generateExternalUserCode().subscribe(
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
	loadShift(){
		const queryshift = new QueryShiftModel(
			null,
			"asc",
			"",
			1,
			10000
		)

		this.shiftService.getListShift(queryshift).subscribe(res => {
			this.shiftList = res.data
			this.shiftListFiltered = this.shiftList.filter(i => {
				const filterText = `${i.name.toLocaleLowerCase()}`;
				if (this.externalUser.division._id === i.division._id) return i;
			});

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
			this.divisionListFiltered = this.divisionList.filter(i => {
				const filterText = `${i.division_name.toLocaleLowerCase()}`;
				if (this.externalUser.department._id === i.department._id) return i;
			});

			this.cd.markForCheck()
		})
	}

	goBackWithId() {
		const url = `/externalUser`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}
	refreshExternalUser(isNew: boolean = false, id:string = "") {
		let url = this.router.url;
		if (!isNew) {
			this.router.navigate([url], { relativeTo: this.activatedRoute });
			return;
		}

		url = `/externalUser/view/${id}`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}


	onSubmit(withBack: boolean = false) {
		const _title = 'External User'
		const _description = 'Are you sure to create this User?';
		const _waitDesciption = 'User is creating...';
		const _deleteMessage = `User Has been create`;
		
		const dialogRef = this.layoutUtilsService.jobElement(_title, _description, _waitDesciption);
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				return;
			}
			this.hasFormErrors = false;
			const controls = this.externalUserForm.controls;
			/** check form */
			if (this.externalUserForm.invalid) {
				Object.keys(controls).forEach(controlName =>
					controls[controlName].markAsTouched()
				);
	
				this.hasFormErrors = true;
				this.selectedTab = 0;
				return;
			}
			this.loading = true;
			//const editedExternalUser = this.prepareExternalUser();
			const editedExternalUser = this.prepareExternalUserFormData();
			this.addExternalUser(editedExternalUser, withBack);
			});
	}
	prepareExternalUser(): ExternalUserModel {
		const controls = this.externalUserForm.controls;
		const _externalUser = new ExternalUserModel();
		_externalUser.clear();
		_externalUser._id = this.externalUser._id;
		_externalUser.name = controls.name.value;
		_externalUser.email = controls.email.value;
		_externalUser.phone = controls.phone.value;
		_externalUser.department = controls.department.value;
		_externalUser.division = controls.division.value;
		_externalUser.shift = controls.shift.value;
		_externalUser.location = controls.location.value;
		
		// _externalUser.cstrmrcd = controls.cstrmrcd.value;
		
		return _externalUser;
	}
	prepareExternalUserFormData() {
		const controls = this.externalUserForm.controls;
		const _externalUser = new FormData();

		_externalUser.append("name", controls.name.value)
		_externalUser.append("email", controls.email.value)
		_externalUser.append("phone", controls.phone.value)
		_externalUser.append("department", controls.department.value)
		_externalUser.append("division", controls.division.value)
		_externalUser.append("shift", controls.shift.value)
		_externalUser.append("location", controls.location.value)
		if(this.selectedDocument){
			_externalUser.append("attachment", this.selectedDocument[0])
		}
		
		// _externalUser.cstrmrcd = controls.cstrmrcd.value;
		
		return _externalUser;
	}
	addExternalUser( _externalUser, withBack: boolean = false) {
		const addSubscription = this.externalUserService.createExternalUser(_externalUser).subscribe(
			res => {
				const message = `New external User successfully has been added.`;
				this.layoutUtilsService.showActionNotification(message, MessageType.Create, 5000, true, true);
				const url = `/externalUser`;
				this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
			},
			err => {
				console.error(err);
				const message = 'Error while adding external User | ' + err.statusText;
				this.layoutUtilsService.showActionNotification(message, MessageType.Create, 5000, true, false);
			}
		);
		this.subscriptions.push(addSubscription);
	}
	getComponentTitle() {
		let result = 'Create External User';
		return result;
	}
	onAlertClose($event) {
		this.hasFormErrors = false;
	}
	ngOnDestroy() {
		this.subscriptions.forEach(sb => sb.unsubscribe());
	}

	_onKeyup(e: any, type) {
		this.externalUserForm.patchValue({ [type]: undefined });
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
				if (filterText.includes(text.toLocaleLowerCase()) && this.externalUserForm.controls.department.value === i.department._id) return i;
			});
		}
		else if(type === "location"){
			this.locationListFiltered = this.locationList.filter(i => {
				const filterText = `${i.name.toLocaleLowerCase()}`;
				if (filterText.includes(text.toLocaleLowerCase())) return i;
			});
		}
		else if(type === "shift"){
			this.locationListFiltered = this.shiftList.filter(i => {
				const filterText = `${i.name.toLocaleLowerCase()}`;
				if (filterText.includes(text.toLocaleLowerCase()) && this.externalUserForm.controls.division.value === i.division._id) return i;
			});
		}
	}

	_setFormValue(value, type) {
		this.externalUserForm.patchValue({[type] : value._id})

		//show division filtered by department
		if(type === "department"){
			this.divisionListFiltered = this.divisionList.filter(i => 
				i.department._id === value._id
			)

			//reset division
			this.externalUserForm.controls.division.setValue(undefined)
			this.viewDivisionResult.setValue("")

			//reset shift
			this.externalUserForm.controls.shift.setValue(undefined)
			this.viewShiftResult.setValue("")

			//reset list shift filter
			this.shiftListFiltered = []
		}

		//show shift filtered by division
		if(type === "division"){
			this.shiftListFiltered = this.shiftList.filter(i => 
				i.division._id === value._id
			)

			//reset shift
			this.externalUserForm.controls.shift.setValue(undefined)
			this.viewShiftResult.setValue("")
		}
	}

	removeSelectedDocument(item) {
		this.documents = this.documents.filter(i => i.name !== item.name);
		this.documents = this.documents.filter(i => i.url !== item.url);
		this.documentInputEl.nativeElement.value = "";
		this.selectedDocument = undefined;

		this.cd.markForCheck();
	}

	selectDocument(e) {
		this.cd.markForCheck()
		const files = (e.target as HTMLInputElement).files;
		this.selectedDocument = files
		for (let i = 0; i < files.length; i++) {
			// Skip uploading if file is already selected
			const alreadyIn = this.documents.filter(tFile => tFile.name === files[i].name).length > 0;
			if (alreadyIn) continue;

			this.documents.push(files[i]);
			let fileType = files[i].name.split(".").pop();

			const reader = new FileReader();
			reader.onload = () => {
				this.documents = [{ name: files[i].name, url: reader.result }];
				this.cd.markForCheck();
			}
			reader.readAsDataURL(files[i]);
		}
		

	}

	loadDocumentUrl(doc) {
		if(this.externalUser[doc]){
			let fileName = this.externalUser[doc].split("/").pop()
			return [{ name: fileName, url: this.externalUser[doc] }]
		}

		return []
	}
}
