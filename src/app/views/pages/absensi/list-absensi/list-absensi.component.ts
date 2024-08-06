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
import {
	DateAdapter,
	MAT_DATE_FORMATS,
	MAT_DATE_LOCALE,
} from "@angular/material";
// Services
import { LayoutUtilsService, MessageType } from '../../../../core/_base/crud';
import {AbsensiDataSource} from '../../../../core/absensi/absensi.datasource';
import {AbsensiModel} from '../../../../core/absensi/absensi.model';
import {SubheaderService} from '../../../../core/_base/layout';
import {AbsensiService} from '../../../../core/absensi/absensi.service';
import {AbsensiDeleted, AbsensiPageRequested} from "../../../../core/absensi/absensi.action";
import { environment } from '../../../../../environments/environment';
import { QueryAbsensiModel } from '../../../../core/absensi/queryabsensi.model';
import * as _moment from "moment";
import { default as _rollupMoment, Moment } from 'moment';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';


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
  selector: 'kt-list-absensi',
  templateUrl: './list-absensi.component.html',
  styleUrls: ['./list-absensi.component.scss'],
  providers: [
	{
		provide: DateAdapter,
		useClass: MomentDateAdapter,
		deps: [MAT_DATE_LOCALE],
	},
	{ provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
],
})
export class ListAbsensiComponent implements OnInit, OnDestroy {
	file;
	dataSource: AbsensiDataSource;
	displayedColumns = [
		// 'cstrmrcd', 
	
	'user', 'date', 'type', 'clock_in', 'clock_out', 'location_in', 'location_out', 'schedule', 'actions'];
	@ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
	@ViewChild('sort1', {static: true}) sort: MatSort;
	// Filter fields
	@ViewChild('searchInput', {static: true}) searchInput: ElementRef;
	lastQuery: QueryAbsensiModel;
	// Selection
	selection = new SelectionModel<AbsensiModel>(true, []);
	absensiResult: AbsensiModel[] = [];
	data = localStorage.getItem("currentUser");
	dataUser = JSON.parse(this.data)
	role = this.dataUser.role

	loading : boolean = false
	attendanceExport: FormGroup;

	dateMonth = new FormControl(moment());
	testdate = new FormControl(moment())
	// Subscriptions
	private subscriptions: Subscription[] = [];
	constructor(
		private activatedRoute: ActivatedRoute,
		private store: Store<AppState>,
		private attendanceExportFB: FormBuilder,
		private router: Router,
		private service: AbsensiService,
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
				this.loadAbsensiList();
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
				this.loadAbsensiList();
			})
		).subscribe();
		this.subscriptions.push(searchSubscription);

		// Set title to page breadCrumbs
		this.subheaderService.setTitle('Clockin/Clockout');

		// Init DataSource
		this.dataSource = new AbsensiDataSource(this.store);
		const entitiesSubscription = this.dataSource.entitySubject.pipe(
			skip(1),
			distinctUntilChanged()
		).subscribe(res => {
			this.absensiResult = res;
		});
		this.subscriptions.push(entitiesSubscription);

		// First Load
		of(undefined).pipe(take(1), delay(1000)).subscribe(() => { // Remove this line, just loading imitation
			this.loadAbsensiList();
		});
		this.createForm()
		this.loadAbsensiList();
	}

	createForm() {
		this.attendanceExport = this.attendanceExportFB.group({
			period: [{ value: "", disabled: false }],
		});
	}
	refresh() {
		this.loadAbsensiList();
	}
	filterConfiguration(): any {
		const filter: any = {};
		const searchText: string = this.searchInput.nativeElement.value;
		filter.name = `${searchText}`;
		filter.date = this.dateMonth.value
		return filter;
	}
	
	loadAbsensiList() {
		this.selection.clear();
		const queryParams = new QueryAbsensiModel(
			this.filterConfiguration(),
			this.sort.direction,
			this.sort.active,
			this.paginator.pageIndex+1,
			this.paginator.pageSize
		);
		this.store.dispatch(new AbsensiPageRequested({ page: queryParams }));
		this.selection.clear();
		console.log(this.dateMonth.value, 'value date mon')
	}
	deleteAbsensi(_item: AbsensiModel) {
		// tslint:disable-next-line:variable-name
		const _title = 'Absensi Delete';
		// tslint:disable-next-line:variable-name
		const _description = 'Are you sure to permanently delete this absensi?';
		const _waitDesciption = 'Absensi is deleting...';
		const _deleteMessage = `Absensi has been deleted`;

		const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				return;
			}

			this.store.dispatch(new AbsensiDeleted({ id: _item._id }));
			this.ngOnInit();
			this.layoutUtilsService.showActionNotification(_deleteMessage, MessageType.Delete);
		});
	}
	
	isAllSelected(): boolean {
		const numSelected = this.selection.selected.length;
		const numRows = this.absensiResult.length;
		return numSelected === numRows;
	}

	masterToggle() {
		if (this.selection.selected.length === this.absensiResult.length) {
			this.selection.clear();
		} else {
			this.absensiResult.forEach(row => this.selection.select(row));
		}
	}

	editAbsensia(id) {
		this.router.navigate(['edit', id], { relativeTo: this.activatedRoute });
	}

	viewAbsensia(id) {
		this.router.navigate(['view', id], { relativeTo: this.activatedRoute });
	}
	ngOnDestroy() {
		this.subscriptions.forEach(sb => sb.unsubscribe());
	}
	export(){
		this.loading = true
		const queryParams = new QueryAbsensiModel(
			{
				date: this.attendanceExport.controls.period.value
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
		this.http.post<any>(`${environment.baseAPI}/api/excel/absensi/import`, formData).subscribe(
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

	checkIsDue(shift, clock, type){
		let est = "";
		
		if(clock){
			est = moment(clock).format("HH:mm")
		} 

		if(type === 'in'){
			if(shift < est) return true
			else return false
		}
		if(type === 'out'){
			if(shift > est) return true
			else return false
		}
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
		this.loadAbsensiList();
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
}
