import {ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild, ElementRef} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import {  Observable, Subscription } from 'rxjs';
import { Store, select } from '@ngrx/store';
import { AppState } from '../../../../core/reducers';
import { SubheaderService, LayoutConfigService } from '../../../../core/_base/layout';
import {LayoutUtilsService, MessageType, QueryParamsModel} from '../../../../core/_base/crud';
import {InternalUserModel} from "../../../../core/internalUser/internalUser.model";
import {
	selectInternalUserActionLoading, selectInternalUserById,
} from "../../../../core/internalUser/internalUser.selector";
import {StateService} from '../../../../core/state/state.service';
import {InternalUserService} from '../../../../core/internalUser/internalUser.service';
import { DepartmentService } from '../../../../core/masterData/department/department.service';
import { DivisionService } from '../../../../core/masterData/division/division.service';
import { QueryDepartmentModel } from '../../../../core/masterData/department/querydepartment.model';
import { QueryDivisionModel } from '../../../../core/masterData/division/querydivision.model'
import { LocationBuildingService } from '../../../../core/masterData/locationBuilding/locationBuilding.service';
import { QueryLocationBuildingModel } from '../../../../core/masterData/locationBuilding/querylocationBuilding.model';
import { ShiftService } from '../../../../core/masterData/shift/shift.service';
import { QueryShiftModel } from '../../../../core/masterData/shift/queryshift.model';

@Component({
  selector: 'kt-edit-internalUser',
  templateUrl: './edit-internalUser.component.html',
  styleUrls: ['./edit-internalUser.component.scss']
})
export class EditInternalUserComponent implements OnInit, OnDestroy {
	internalUser: InternalUserModel;
	internalUserId$: Observable<string>;
	oldInternalUser: InternalUserModel;
	selectedTab = 0;
	loading$: Observable<boolean>;
	internalUserForm: FormGroup;
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
		private internalUserFB: FormBuilder,
		private subheaderService: SubheaderService,
		private layoutUtilsService: LayoutUtilsService,
		private stateService: StateService,
		private internalUserService: InternalUserService,
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
		this.loading$ = this.store.pipe(select(selectInternalUserActionLoading));
		const routeSubscription =  this.activatedRoute.params.subscribe(params =>
			{
				this.store.pipe(select(selectInternalUserById(params.id))).subscribe(res => {
					if (res) {
						this.internalUser = res;

						this.oldInternalUser = Object.assign({}, this.internalUser);
						this.initInternalUser();
					}
				});
			});
		this.subscriptions.push(routeSubscription);
	
	}

	initInternalUser(){
		this.createForm();
		this.loadDepartment();
		this.loadDivision();
		this.loadLocation();
		this.loadShift();
		// this.loadProvince();
	}
	createForm() {
			
			this.internalUserForm = this.internalUserFB.group({
				// cstrmrcd: [{"value":this.codenum, "disabled":true}, Validators.required],
				_id: [{value: this.internalUser._id, disabled: true}],
				name: [{value: this.internalUser.name, disabled: false},Validators.required],
				email: [{value: this.internalUser.email, disabled: false}, Validators.required],
				birth_date: [{value: this.internalUser.birth_date, disabled: false}, Validators.required],
				join_date: [{value: this.internalUser.join_date, disabled: false}, Validators.required],
				phone: [{value: this.internalUser.phone, disabled: false}, Validators.required],
				department: [{value: this.internalUser.department._id, disabled: false}, Validators.required],
				division: [{value: this.internalUser.division._id, disabled: false}],
				location: [{value: this.internalUser.location._id, disabled: false}, Validators.required],
				shift: [{value: this.internalUser.shift? this.internalUser.shift._id: "", disabled: false}, Validators.required],
			});

			this.viewDivisionResult.setValue(this.internalUser.division.division_name)
			this.viewDepartmentResult.setValue(this.internalUser.department.department_name)
			this.viewLocationResult.setValue(this.internalUser.location.name)
			this.viewShiftResult.setValue(this.internalUser.shift? this.internalUser.shift.name: "")

			this.documents = this.loadDocumentUrl('attachment')
	}
	// getNumber() {
	// 	this.internalUserService.generateInternalUserCode().subscribe(
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
				if (this.internalUser.division._id === i.division._id) return i;
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
				if (this.internalUser.department._id === i.department._id) return i;
			});

			this.cd.markForCheck()
		})
	}

	goBackWithId() {
		const url = `/internalUser`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}
	refreshInternalUser(isNew: boolean = false, id:string = "") {
		let url = this.router.url;
		if (!isNew) {
			this.router.navigate([url], { relativeTo: this.activatedRoute });
			return;
		}

		url = `/internalUser/edit/${id}`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}


	onSubmit(withBack: boolean = false) {
		const _title = 'Internal User'
		const _description = 'Are you sure to save?';
		const _waitDesciption = 'Saving...';
		const _deleteMessage = `User Has been updated`;
		
		const dialogRef = this.layoutUtilsService.jobElement(_title, _description, _waitDesciption);
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				return;
			}
			this.hasFormErrors = false;
			const controls = this.internalUserForm.controls;
			/** check form */
			if (this.internalUserForm.invalid) {
				Object.keys(controls).forEach(controlName =>
					controls[controlName].markAsTouched()
				);
	
				this.hasFormErrors = true;
				this.selectedTab = 0;
				return;
			}
			this.loading = true;
			//const editedInternalUser = this.prepareInternalUser();
			const editedInternalUser = this.prepareInternalUserFormData();
			this.updateInternalUser(editedInternalUser, withBack);
			});
	}
	prepareInternalUser(): InternalUserModel {
		const controls = this.internalUserForm.controls;
		const _internalUser = new InternalUserModel();
		_internalUser.clear();
		_internalUser._id = this.internalUser._id;
		_internalUser.name = controls.name.value;
		_internalUser.email = controls.email.value;
		_internalUser.phone = controls.phone.value;
		_internalUser.department = controls.department.value;
		_internalUser.division = controls.division.value;
		_internalUser.shift = controls.shift.value;
		_internalUser.location = controls.location.value;
		
		// _internalUser.cstrmrcd = controls.cstrmrcd.value;
		
		return _internalUser;
	}
	prepareInternalUserFormData() {
		const controls = this.internalUserForm.controls;
		const _internalUser = new FormData();

		_internalUser.append("name", controls.name.value)
		_internalUser.append("email", controls.email.value)
		_internalUser.append("birth_date", controls.birth_date.value)
		_internalUser.append("join_date", controls.join_date.value)
		_internalUser.append("phone", controls.phone.value)
		_internalUser.append("department", controls.department.value)
		_internalUser.append("division", controls.division.value)
		_internalUser.append("shift", controls.shift.value)
		_internalUser.append("location", controls.location.value)
		if(this.selectedDocument){
			_internalUser.append("attachment", this.selectedDocument[0])
		}
		
		// _internalUser.cstrmrcd = controls.cstrmrcd.value;
		
		return _internalUser;
	}
	updateInternalUser( _internalUser, withBack: boolean = false) {
		const addSubscription = this.internalUserService.updateInternalUser(this.internalUser._id, _internalUser).subscribe(
			res => {
				const message = `New internal User successfully has been added.`;
				this.layoutUtilsService.showActionNotification(message, MessageType.Create, 5000, true, true);
				const url = `/internalUser`;
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
		let result = 'Edit Internal User';
		return result;
	}
	onAlertClose($event) {
		this.hasFormErrors = false;
	}
	ngOnDestroy() {
		this.subscriptions.forEach(sb => sb.unsubscribe());
	}

	_onKeyup(e: any, type) {
		this.internalUserForm.patchValue({ [type]: undefined });
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
				if (filterText.includes(text.toLocaleLowerCase()) && this.internalUserForm.controls.department.value === i.department._id) return i;
			});
		}
		else if(type === "location"){
			this.locationListFiltered = this.locationList.filter(i => {
				const filterText = `${i.name.toLocaleLowerCase()}`;
				if (filterText.includes(text.toLocaleLowerCase())) return i;
			});
		}
		else if(type === "shift"){
			this.shiftListFiltered = this.shiftList.filter(i => {
				const filterText = `${i.name.toLocaleLowerCase()}`;
				if (filterText.includes(text.toLocaleLowerCase()) && this.internalUserForm.controls.division.value === i.division._id) return i;
			});
		}
	}

	_setFormValue(value, type) {
		this.internalUserForm.patchValue({[type] : value._id})

		//show division filtered by department
		if(type === "department"){
			this.divisionListFiltered = this.divisionList.filter(i => 
				i.department._id === value._id
			)

			//reset division
			this.internalUserForm.controls.division.setValue(undefined)
			this.viewDivisionResult.setValue("")

			//reset shift
			this.internalUserForm.controls.shift.setValue(undefined)
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
			this.internalUserForm.controls.shift.setValue(undefined)
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

		if(this.internalUser[doc]){
			let fileName = this.internalUser[doc].split("/").pop()
			return [{ name: fileName, url: this.internalUser[doc] }]
		}
		else return []
	}
}
