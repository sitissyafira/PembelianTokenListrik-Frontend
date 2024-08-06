import {Component, OnDestroy, OnInit, ViewChild, ElementRef, ChangeDetectorRef} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
// Material
import { SelectionModel } from '@angular/cdk/collections';
import { MatPaginator, MatSort, MatSnackBar } from '@angular/material';
import {NgbModal, ModalDismissReasons} from '@ng-bootstrap/ng-bootstrap';
// RXJS
import { debounceTime, distinctUntilChanged, tap, skip, take, delay } from 'rxjs/operators';
import { fromEvent, merge, Observable, of, Subscription } from 'rxjs';
// LODASH
import { each, find } from 'lodash';
// NGRX
import {Store, select, createFeatureSelector} from '@ngrx/store';
import { AppState } from '../../../../core/reducers';
import { MatDatepicker } from "@angular/material/datepicker";
import { MomentDateAdapter } from "@angular/material-moment-adapter";

// Services
import { LayoutUtilsService, MessageType } from '../../../../core/_base/crud';
import {ManagementTaskDataSource} from '../../../../core/managementTask/managementTask.datasource';
import {ManagementTaskModel} from '../../../../core/managementTask/managementTask.model';
import {SubheaderService} from '../../../../core/_base/layout';
import {ManagementTaskService} from '../../../../core/managementTask/managementTask.service';
import {ManagementTaskDeleted, ManagementTaskPageRequested} from "../../../../core/managementTask/managementTask.action";
import { environment } from '../../../../../environments/environment';
import { QueryManagementTaskModel } from '../../../../core/managementTask/querymanagementTask.model';
import * as _moment from "moment";
import { default as _rollupMoment, Moment } from 'moment';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { QueryDepartmentModel } from '../../../../core/masterData/department/querydepartment.model';
import { DepartmentService } from '../../../../core/masterData/department/department.service';


const moment = _rollupMoment || _moment;

const MY_FORMATS = {
	parse: {
		dateInput: "MM-YYYY",
	},
	display: {
		dateInput: "MM-YYYY",
		monthYearLabel: "YYYY",
		dateA11yLabel: "LL",
		monthYearA11yLabel: "YYYY",
	},
};
@Component({
  selector: 'kt-list-managementTask',
  templateUrl: './list-managementTask.component.html',
  styleUrls: ['./list-managementTask.component.scss'],

})
export class ListManagementTaskComponent implements OnInit, OnDestroy {
	file;
	dataSource: ManagementTaskDataSource;
	displayedColumns = [
		// 'cstrmrcd', 
	
	'user', 'date', 'time', 'remark', 'actions'];
	@ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
	@ViewChild('sort1', {static: true}) sort: MatSort;
	// Filter fields
	@ViewChild('searchInput', {static: true}) searchInput: ElementRef;
	lastQuery: QueryManagementTaskModel;
	// Selection
	selection = new SelectionModel<ManagementTaskModel>(true, []);
	managementTaskResult: ManagementTaskModel[] = [];
	data = localStorage.getItem("currentUser");
	dataUser = JSON.parse(this.data)
	role = this.dataUser.role

	departmentList: any[] = []
	departmentListFiltered: any[] = []

	viewDepartmentResult = new FormControl()

	loading : boolean = false
	attendanceExport: FormGroup;

	dateMonth = new FormControl();
	isClearFilter: boolean = false;
	// Subscriptions
	private subscriptions: Subscription[] = [];
	constructor(
		private activatedRoute: ActivatedRoute,
		private store: Store<AppState>,
		private attendanceExportFB: FormBuilder,
		private router: Router,
		private service: ManagementTaskService,
		private departmentService: DepartmentService,
		private layoutUtilsService: LayoutUtilsService,
		private subheaderService: SubheaderService,
		private cdr: ChangeDetectorRef,
		private http: HttpClient,
		private modalService: NgbModal,
	) { }
	ngOnInit() {
		const sortSubscription = this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0));
		this.subscriptions.push(sortSubscription);

		/* Data load will be triggered in two cases:
		- when a pagination event occurs => this.paginator.page
		- when a sort event occurs => this.sort.sortChange
		**/
		const paginatorSubscriptions = merge(this.sort.sortChange, this.paginator.page).pipe(
			tap(() => {
				this.loadManagementTaskList();
			})
		)
			.subscribe();
		this.subscriptions.push(paginatorSubscriptions);


		// Filtration, bind to searchInput
		const searchSubscription = fromEvent(this.searchInput.nativeElement, 'keyup').pipe(
			// tslint:disable-next-line:max-line-length
			debounceTime(150), // The user can type quite quickly in the input box, and that could trigger a lot of server requests. With this operator, we are limiting the amount of server requests emitted to a maximum of one every 150ms
			distinctUntilChanged(), // This operator will eliminate duplicate values
			tap(() => {
				this.paginator.pageIndex = 0;
				this.loadManagementTaskList();
			})
		).subscribe();
		this.subscriptions.push(searchSubscription);

		// Set title to page breadCrumbs
		this.subheaderService.setTitle('Task Management');

		// Init DataSource
		this.dataSource = new ManagementTaskDataSource(this.store);
		const entitiesSubscription = this.dataSource.entitySubject.pipe(
			skip(1),
			distinctUntilChanged()
		).subscribe(res => {
			this.managementTaskResult = res;
		});
		this.subscriptions.push(entitiesSubscription);

		// First Load
		of(undefined).pipe(take(1), delay(1000)).subscribe(() => { // Remove this line, just loading imitation
			this.loadManagementTaskList();
		});
		this.createForm()
		this.loadDepartment();
		this.loadManagementTaskList();
	}

	createForm() {
		this.attendanceExport = this.attendanceExportFB.group({
			// period: [{ value: "", disabled: false }],
			department: [{value: "", disabled: false}]
		});
	}
	refresh() {
		this.loadManagementTaskList();
	}
	filterConfiguration(): any {
		const filter: any = {};
		const searchText: string = this.searchInput.nativeElement.value;
		filter.name = `${searchText}`;
		filter.date = this.dateMonth.value
		return filter;
	}

	loadDepartment(){
		const querydepartment = new QueryDepartmentModel(
			null,
			1,
			10000
		)

		this.departmentService.getListDepartment(querydepartment).subscribe(res => {
			console.log(res)
			this.departmentList = res.data
			this.departmentListFiltered = this.departmentList.slice()

			this.cdr.markForCheck()
		})
	}
	
	loadManagementTaskList() {
		this.selection.clear();
		const queryParams = new QueryManagementTaskModel(
			this.filterConfiguration(),
			this.sort.direction,
			this.sort.active,
			this.paginator.pageIndex+1,
			this.paginator.pageSize
		);
		this.store.dispatch(new ManagementTaskPageRequested({ page: queryParams }));
		this.selection.clear();
	}
	deleteManagementTask(_item: ManagementTaskModel) {
		// tslint:disable-next-line:variable-name
		const _title = 'ManagementTask Delete';
		// tslint:disable-next-line:variable-name
		const _description = 'Are you sure to permanently delete this managementTask?';
		const _waitDesciption = 'ManagementTask is deleting...';
		const _deleteMessage = `ManagementTask has been deleted`;

		const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				return;
			}

			this.store.dispatch(new ManagementTaskDeleted({ id: _item._id }));
			this.ngOnInit();
			this.layoutUtilsService.showActionNotification(_deleteMessage, MessageType.Delete);
		});
	}
	
	isAllSelected(): boolean {
		const numSelected = this.selection.selected.length;
		const numRows = this.managementTaskResult.length;
		return numSelected === numRows;
	}

	masterToggle() {
		if (this.selection.selected.length === this.managementTaskResult.length) {
			this.selection.clear();
		} else {
			this.managementTaskResult.forEach(row => this.selection.select(row));
		}
	}

	editManagementTaska(id) {
		this.router.navigate(['edit', id], { relativeTo: this.activatedRoute });
	}

	viewManagementTaska(id) {
		this.router.navigate(['view', id], { relativeTo: this.activatedRoute });
	}
	ngOnDestroy() {
		this.subscriptions.forEach(sb => sb.unsubscribe());
	}
	export(){
		this.loading = true
		const queryParams = new QueryManagementTaskModel(
			{
				department: this.attendanceExport.controls.department.value
			},
			this.sort.direction,
			this.sort.active,
			this.paginator.pageIndex+1,
			this.paginator.pageSize
		);
		this.service.exportExcel(queryParams);
		this.loading = false
	}
	
	
	openLarge(content) {
		this.modalService.open(content, {
			size: 'lg'
		});
	}

	selectFile(event) {
		if(event.target.files.length > 0) {
			const file = event.target.files[0];
			this.file = file;
		}
	}

	onSubmit(){
		const formData = new FormData();
		formData.append('file', this.file);
		this.http.post<any>(`${environment.baseAPI}/api/excel/managementTask/import`, formData).subscribe(
			res =>{
				const message = `file successfully has been import.`;
	 			this.layoutUtilsService.showActionNotification(message, MessageType.Create, 5000, true, true);
				this.ngOnInit();
			},
			err => {
				console.error(err);
				const message = 'Error while importing File | ' + err.statusText;
				this.layoutUtilsService.showActionNotification(message, MessageType.Create, 5000, true, false);
				}
		)
	}

	setMonthAndYear(normalizedMonthAndYear: Moment, datepicker: MatDatepicker<Moment>) {
		let ctrlValue = this.dateMonth.value;
		let monthAndYear = moment(normalizedMonthAndYear)

		ctrlValue.month(monthAndYear.month());
		ctrlValue.year(monthAndYear.year());

		this.dateMonth.patchValue(ctrlValue);

		datepicker.close();

		this.cdr.markForCheck()
		// let datVal = moment(this.dateMonth.value).format('L').split("/")
		// let result = `${datVal[0]}/${datVal[2]}`
		// this.valPayDate = result

		// this.checkClearDate = true
		// if (this.checkClearDate) this.checkClear = true

		// this.loadBillingList(this.valPayCond, result)
		this.loadManagementTaskList();
	}

	setMonthAndYearForExport(normalizedMonthAndYear: Moment, datepicker: MatDatepicker<Moment>) {
		let controls = this.attendanceExport.controls;
		let monthAndYear = moment(normalizedMonthAndYear)

		// let month = (monthAndYear.month());
		// let year = (monthAndYear.year());

		controls.period.setValue(monthAndYear)

		datepicker.close();

		this.cdr.markForCheck()
		// let datVal = moment(this.dateMonth.value).format('L').split("/")
		// let result = `${datVal[0]}/${datVal[2]}`
		// this.valPayDate = result

		// this.checkClearDate = true
		// if (this.checkClearDate) this.checkClear = true

		// this.loadBillingList(this.valPayCond, result)
	}

	openLargeExport(content) {
		this.modalService.open(content, {
			size: 'lg'
		});
	}

	onChangeDate() {
		this.isClearFilter = true

		this.refresh()
	}

	clearAllFilter() {
		this.searchInput.nativeElement.value = ""

		this.dateMonth.setValue(undefined)

		this.isClearFilter = false
		this.refresh()
	}

	_onKeyup(e: any, type) {
		this.attendanceExport.patchValue({ [type]: undefined });
		this._filterList(e.target.value, type);
	}
	_filterList(text: string, type) {
		if(type === "department"){
			this.departmentListFiltered = this.departmentList.filter(i => {
				const filterText = `${i.department_name.toLocaleLowerCase()}`;
				if (filterText.includes(text.toLocaleLowerCase())) return i;
			});
		}
	}


	_setFormValue(value, type) {
		this.attendanceExport.patchValue({[type] : value._id})

	}
}
