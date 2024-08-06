import { ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
// RxJS
import { BehaviorSubject, Observable, of, Subscription } from 'rxjs';
// NGRX
import { Store, select } from '@ngrx/store';
import { Update } from '@ngrx/entity';
import { AppState } from '../../../../core/reducers';
// Layout
import { SubheaderService, LayoutConfigService } from '../../../../core/_base/layout';
import { LayoutUtilsService, MessageType } from '../../../../core/_base/crud';
import { EngineerModel } from "../../../../core/engineer/engineer.model";
import {
	selectLastCreatedEngineerId,
	selectEngineerActionLoading,
	selectEngineerById
} from "../../../../core/engineer/engineer.selector";
import { EngineerOnServerCreated, EngineerUpdated } from "../../../../core/engineer/engineer.action";
import { EngineerService } from '../../../../core/engineer/engineer.service';
import { DepartmentService } from '../../../../core/masterData/department/department.service';
import { DivisionService } from '../../../../core/masterData/division/division.service';
import { QueryDepartmentModel } from '../../../../core/masterData/department/querydepartment.model';
import { QueryDivisionModel } from '../../../../core/masterData/division/querydivision.model';
import { QueryShiftModel } from '../../../../core/masterData/shift/queryshift.model';
import { ShiftService } from '../../../../core/masterData/shift/shift.service';

@Component({
	selector: 'kt-add-engineer',
	templateUrl: './add-engineer.component.html',
	styleUrls: ['./add-engineer.component.scss']
})
export class AddEngineerComponent implements OnInit, OnDestroy {
	// Public properties
	engineer: EngineerModel;
	engineerId$: Observable<string>;
	oldEngineer: EngineerModel;
	selectedTab = 0;
	loading$: Observable<boolean>;
	engineerForm: FormGroup;
	hasFormErrors = false;
	loading: boolean = false;
	// Private properties
	private subscriptions: Subscription[] = [];

	viewDepartmentResult = new FormControl()
	viewDivisionResult = new FormControl()
	viewShiftResult = new FormControl()

	departmentList: any[] = [];
	departmentListFiltered = [];
	divisionList: any[] = [];
	divisionListFiltered = [];
	shiftList: any[] = [];
	shiftListFiltered = [];

	valueChoose: boolean = false
	contentEditable: boolean = false

	documents: any[] = []
	selectedDocument: any
	@ViewChild('documentInput', { static: false }) documentInputEl: ElementRef;

	constructor(
		private activatedRoute: ActivatedRoute,
		private router: Router,
		private engineerFB: FormBuilder,
		private subheaderService: SubheaderService,
		private layoutUtilsService: LayoutUtilsService,
		private store: Store<AppState>,
		private layoutConfigService: LayoutConfigService,
		private service: EngineerService,
		private departmentService: DepartmentService,
		private divisionService: DivisionService,
		private shiftService: ShiftService,
		private cd: ChangeDetectorRef,
	) { }
	ngOnInit() {
		this.loading$ = this.store.pipe(select(selectEngineerActionLoading));
		const routeSubscription = this.activatedRoute.params.subscribe(params => {
			const id = params.id;
			if (id) {
				this.store.pipe(select(selectEngineerById(id))).subscribe(res => {
					if (res) {
						this.engineer = res;
						this.oldEngineer = Object.assign({}, this.engineer);
						this.initEngineer();
					}
				});
			} else {
				this.engineer = new EngineerModel();
				this.engineer.clear();
				this.initEngineer();
			}
		});
		this.subscriptions.push(routeSubscription);
	}
	initEngineer() {
		this.createForm();
		this.loadDepartment();
		this.loadDivision();
		this.loadShift();
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
			// this.divisionListFiltered = this.divisionList.slice()

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
			// this.shiftListFiltered = this.shiftList.slice()

			this.cd.markForCheck()
		})
	}

	// start checked
	hideInputChecked() {
		if (this.contentEditable === true) {
			return 'd-none col-lg-6 kt-margin-bottom-20-mobile'
		} else if (this.contentEditable === false) {
			return 'col-lg-6 kt-margin-bottom-20-mobile'
		}
	}
	toggleEditable(event) {
		if (event.target.checked === true) {
			this.valueChoose = true
			this.contentEditable = true;
			this.hideInputChecked
		} else this.contentEditable = false
	}
	toggleEditableAbonemen(event) {
		this.valueChoose = false
		if (event.target.checked === true) {
			this.contentEditable = false;
			this.hideInputChecked
		} else this.contentEditable = false
	}

	createForm() {
		this.engineerForm = this.engineerFB.group({
			engnrid: ["", Validators.required],
			name: ["", Validators.required],
			status: ["", Validators.required],
			phone: ["", Validators.required],
			email: ["", Validators.required],
			birth_date: ["", Validators.required],
			join_date: ["", Validators.required],
			department: ["", Validators.required],
			division: ["", Validators.required],
			shift: [""],
		});
	}
	goBackWithId() {
		const url = `/engineer`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}
	refreshEngineer(isNew: boolean = false, id: string = "") {
		let url = this.router.url;
		if (!isNew) {
			this.router.navigate([url], { relativeTo: this.activatedRoute });
			return;
		}

		url = `/engineer/edit/${id}`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}
	reset() {
		this.engineer = Object.assign({}, this.oldEngineer);
		this.createForm();
		this.hasFormErrors = false;
		this.engineerForm.markAsPristine();
		this.engineerForm.markAsUntouched();
		this.engineerForm.updateValueAndValidity();
	}

	onSubmit(withBack: boolean = false) {
		const _title = 'Engineer';
		// tslint:disable-next-line:variable-name
		const _description = 'Are you sure to create this Engineer?';
		const _waitDesciption = 'Engineer is creating...';

		const dialogRef = this.layoutUtilsService.jobElement(_title, _description, _waitDesciption);
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				return;
			}

			this.hasFormErrors = false;
			const controls = this.engineerForm.controls;
			/** check form */
			if (this.engineerForm.invalid) {
				Object.keys(controls).forEach(controlName =>
					controls[controlName].markAsTouched()
				);

				this.hasFormErrors = true;
				this.selectedTab = 0;
				return;
			}

			this.loading = true;
			const editedEngineer = this.prepareEngineerFormData();
			this.addEngineer(editedEngineer, withBack);
		});
	}
	prepareEngineer(): EngineerModel {
		const controls = this.engineerForm.controls;
		const _engineer = new EngineerModel();
		_engineer.clear();
		_engineer._id = this.engineer._id;
		_engineer.engnrid = controls.engnrid.value;
		_engineer.name = controls.name.value.toLowerCase();
		_engineer.status = controls.status.value;
		_engineer.phone = controls.phone.value;
		_engineer.email = controls.email.value;
		_engineer.isToken = this.contentEditable
		console.log(_engineer.isToken);

		return _engineer;
	}

	prepareEngineerFormData() {
		const controls = this.engineerForm.controls;
		const _engineer = new FormData();
		
		_engineer.append("engnrid", controls.engnrid.value)
		_engineer.append("name", controls.name.value.toLowerCase())
		_engineer.append("status", controls.status.value)
		_engineer.append("phone", controls.phone.value)
		_engineer.append("email", controls.email.value)
		_engineer.append("birth_date", controls.birth_date.value)
		_engineer.append("join_date", controls.join_date.value)
		_engineer.append("department", controls.department.value._id)
		_engineer.append("division", controls.division.value._id)
		if(controls.shift.value){
			_engineer.append("shift", controls.shift.value._id)
		}
		_engineer.append("isToken", JSON.stringify(this.contentEditable))
		if(this.selectedDocument){
			_engineer.append("attachment", this.selectedDocument[0])
		}

		return _engineer;
	}

	addEngineer(_engineer, withBack: boolean = false) {
		const addSubscription = this.service.createEngineer(_engineer).subscribe(
			res => {
				const message = `New engineer successfully has been added.`;
				this.layoutUtilsService.showActionNotification(message, MessageType.Create, 5000, true, true);
				const url = `/engineer`;
				this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
			},
			err => {
				console.error(err);
				const message = 'Error while adding engineer | ' + err.statusText;
				this.layoutUtilsService.showActionNotification(message, MessageType.Create, 5000, true, false);
			}
		);
		this.subscriptions.push(addSubscription);
	}

	getComponentTitle() {
		let result = 'Create Engineer';
		return result;
	}
	onAlertClose($event) {
		this.hasFormErrors = false;
	}
	ngOnDestroy() {
		this.subscriptions.forEach(sb => sb.unsubscribe());
	}

	_onKeyup(e: any, type) {
		this.engineerForm.patchValue({ [type]: undefined });
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
				if (filterText.includes(text.toLocaleLowerCase()) && this.engineerForm.controls.department.value === i.department._id) return i;
			});
		}
		else if(type === "shift"){
			this.shiftListFiltered = this.shiftList.filter(i => {
				const filterText = `${i.name.toLocaleLowerCase()}`;
				if (filterText.includes(text.toLocaleLowerCase()) && this.engineerForm.controls.division.value === i.division._id) return i;
			});
		}
	}

	_setFormValue(value, type) {
		this.engineerForm.patchValue({[type] : value})

		//show division filtered by department
		if(type === "department"){
			this.divisionListFiltered = this.divisionList.filter(i => 
				i.department._id === value._id
			)

			//reset division
			this.engineerForm.controls.division.setValue(undefined)
			this.viewDivisionResult.setValue("")

			//reset shift
			this.engineerForm.controls.shift.setValue(undefined)
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
			this.engineerForm.controls.shift.setValue(undefined)
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

}
