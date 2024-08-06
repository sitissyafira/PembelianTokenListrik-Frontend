import {ChangeDetectorRef, Component, OnDestroy, OnInit} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable, Subscription } from 'rxjs';
import { Store, select } from '@ngrx/store';
import { AppState } from '../../../../../core/reducers';
import { SubheaderService, LayoutConfigService } from '../../../../../core/_base/layout';
import { LayoutUtilsService, MessageType } from '../../../../../core/_base/crud';
import {DivisionModel} from "../../../../../core/masterData/division/division.model";
import {
	selectDivisionActionLoading,
	selectDivisionById
} from "../../../../../core/masterData/division/division.selector";
import {DivisionService} from '../../../../../core/masterData/division/division.service';
import { QueryDepartmentModel } from '../../../../../core/masterData/department/querydepartment.model';
import { SelectionModel } from '@angular/cdk/collections';
import { DepartmentService } from '../../../../../core/masterData/department/department.service';

@Component({
  selector: 'kt-add-division',
  templateUrl: './add-division.component.html',
  styleUrls: ['./add-division.component.scss']
})
export class AddDivisionComponent implements OnInit, OnDestroy {
	datauser = localStorage.getItem("user");
	division: DivisionModel;
	DivisionId$: Observable<string>;
	selection = new SelectionModel<DivisionModel>(true, []);
	oldDivision: DivisionModel;
	selectedTab = 0;
	loading$: Observable<boolean>;
	divisionForm: FormGroup;
	departmentResult: any[] = [];
	hasFormErrors = false;
	loading : boolean = false;

	private loadingData = {
		department: false,
	}

	private subscriptions: Subscription[] = [];
  	constructor(
		private activatedRoute: ActivatedRoute,
		private router: Router,
		private divisionFB: FormBuilder,
		private subheaderService: SubheaderService,
		private layoutUtilsService: LayoutUtilsService,
		private store: Store<AppState>,
		private service: DivisionService,
		private departmentService : DepartmentService,
		private layoutConfigService: LayoutConfigService,
		private cd: ChangeDetectorRef,
	) { }

  	ngOnInit() {
		this.loading$ = this.store.pipe(select(selectDivisionActionLoading));
		const routeSubscription =  this.activatedRoute.params.subscribe(params => {
			const id = params.id;
			if (id) {
				this.store.pipe(select(selectDivisionById(id))).subscribe(res => {
					if (res) {
						this.division = res;


						
						this.oldDivision = Object.assign({}, this.division);
						this.initDivision();
					}
				});
			} else {
				this.division = new DivisionModel();
				this.division.clear();
				this.initDivision();
			}
		});
		this.subscriptions.push(routeSubscription);
  	}

	initDivision() {
		this.createForm();
		this.loadDepartment()
	}

	createForm() {
		if (this.division._id){
			this.divisionForm = this.divisionFB.group({
				division_code: [this.division.division_code, Validators.required],
				division_name: [this.division.division_name, Validators.required],
  				department : [this.division.department._id, Validators.required],
				description: [this.division.description],
				created_by: [this.division.created_by],
			});
		}else{
			this.divisionForm = this.divisionFB.group({
				division_code: ["", Validators.required],
				division_name: ["", Validators.required],
				department: ["", Validators.required],
				description: [""],
				created_by: [{value:this.datauser, disabled:true}],
			});
		}
	}


	loadDepartment() {
		this.loadingData.department = true
		this.selection.clear();
		const queryParams = new QueryDepartmentModel(
			null,
			1,
			1000
		);
		this.departmentService.getListDepartment(queryParams).subscribe(
			res => {
				this.departmentResult = res.data;
				this.loadingData.department = false
				this.cd.markForCheck()
			}
		);
	}


	goBackWithId() {
		const url = `/division`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}
	refreshDivision(isNew: boolean = false, id:string = "") {
		let url = this.router.url;
		if (!isNew) {
			this.router.navigate([url], { relativeTo: this.activatedRoute });
			return;
		}
		url = `/division/edit/${id}`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}
	onSubmit(withBack: boolean = false) {
		this.hasFormErrors = false;
		const controls = this.divisionForm.controls;
		if (this.divisionForm.invalid) {
			Object.keys(controls).forEach(controlName =>
				controls[controlName].markAsTouched()
			);

			this.hasFormErrors = true;
			this.selectedTab = 0;
			return;
		}

		this.loading = true;
		const editedDivision = this.prepareDivision();
		if (editedDivision._id) {
			this.updateDivision(editedDivision, withBack);
			return;
		}
		this.addDivision(editedDivision, withBack);
	}

	prepareDivision(): DivisionModel {
		const controls = this.divisionForm.controls;
		const _division = new DivisionModel();
		_division.clear();
		_division._id = this.division._id;
		_division.division_code = controls.division_code.value;
		_division.division_name = controls.division_name.value.toLowerCase();
		_division.department = controls.department.value;
		_division.description = controls.description.value;
		_division.created_by = controls.created_by.value;
		return _division;
	}

	addDivision( _division: DivisionModel, withBack: boolean = false) {
		const addSubscription = this.service.createDivision(_division).subscribe(
			res => {
				const message = `New division successfully has been added.`;
				this.layoutUtilsService.showActionNotification(message, MessageType.Create, 5000, true, true);
				const url = `/division`;
				this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
			},
			err => {
				console.error(err);
				const message = 'Error while adding division | ' + err.statusText;
				this.layoutUtilsService.showActionNotification(message, MessageType.Create, 5000, true, false);
			}
		);
		this.subscriptions.push(addSubscription);
	}

	updateDivision(_division: DivisionModel, withBack: boolean = false) {
		const addSubscription = this.service.updateDivision(_division).subscribe(
			res => {
				const message = `Division successfully has been saved.`;
				this.layoutUtilsService.showActionNotification(message, MessageType.Update, 5000, true, true);
				const url = `/division`;
				this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
			},
			err => {
				console.error(err);
				const message = 'Error while adding division | ' + err.statusText;
				this.layoutUtilsService.showActionNotification(message, MessageType.Update, 5000, true, false);
			}
		);
		this.subscriptions.push(addSubscription);
	}

	getComponentTitle() {
		let result = 'Create Division';
		if (!this.division || !this.division._id) {
			return result;
		}

		result = `Edit Division`;
		return result;
	}

	onAlertClose($event) {
		this.hasFormErrors = false;
	}

  	ngOnDestroy() {
		this.subscriptions.forEach(sb => sb.unsubscribe());
	}

	inputKeydownHandler(event) {
		// (e.keyCode >= 48 && e.keyCode <=57) || (e.keyCode >= 96 && e.keyCode <=105))
		return event.keyCode === 8 || event.keyCode === 46 ? true : !isNaN(Number(event.key))
	}
}
