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
	selector: 'kt-view-engineer',
	templateUrl: './view-engineer.component.html',
	styleUrls: ['./view-engineer.component.scss']
})
export class ViewEngineerComponent implements OnInit, OnDestroy {
	// Public properties
	engineer: EngineerModel;
	engineerId$: Observable<string>;
	oldEngineer: EngineerModel;
	selectedTab = 0;
	loading$: Observable<boolean>;
	engineerForm: FormGroup;
	hasFormErrors = false;
	loading: boolean;
	// Private properties
	isToken: boolean = false
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
						this.isToken = res.isToken
					}
				});
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

	loadDocumentUrl(doc) {

		let fileName = this.engineer[doc].split("/").pop()
		return [{ name: fileName, url: this.engineer[doc] }]
	}

	createForm() {
		this.engineerForm = this.engineerFB.group({
			engnrid: [{ value: this.engineer.engnrid, disabled: true }],
			name: [{ value: this.engineer.name, disabled: true }],
			status: [{ value: this.engineer.status, disabled: true }],
			phone: [{ value: this.engineer.phone, disabled: true }],
			email: [{ value: this.engineer.email, disabled: true }],
			birth_date: [{ value: this.engineer.birth_date, disabled: true }],
			join_date: [{ value: this.engineer.join_date, disabled: true }],
			department: [{value: this.engineer.department, disabled: true }],
			division: [{value: this.engineer.division, disabled: true}],
			shift: [{value: this.engineer.shift, disabled: true}],
		});

		this.viewDivisionResult.setValue(this.engineer.division.division_name)
		this.viewDivisionResult.disable()
		this.viewDepartmentResult.setValue(this.engineer.department.department_name)
		this.viewDepartmentResult.disable()
		this.viewShiftResult.setValue(this.engineer.shift.name)
		this.viewShiftResult.disable()

		this.documents = this.loadDocumentUrl('attachment')
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

	getComponentTitle() {
		let result = 'View Engineer';
		return result;
	}
	onAlertClose($event) {
		this.hasFormErrors = false;
	}
	ngOnDestroy() {
		this.subscriptions.forEach(sb => sb.unsubscribe());
	}

}
