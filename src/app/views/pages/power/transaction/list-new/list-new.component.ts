import { Component, OnInit, OnDestroy, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SelectionModel } from '@angular/cdk/collections';
import { MatPaginator, MatSort, MatSnackBar } from '@angular/material';
import { debounceTime, distinctUntilChanged, tap, skip, take, delay } from 'rxjs/operators';
import { fromEvent, merge, Observable, of, Subscription } from 'rxjs';
import { Store, select } from '@ngrx/store';
import { AppState } from '../../../../../core/reducers';
import { LayoutUtilsService, MessageType } from '../../../../../core/_base/crud';
import { PowerTransactionDataSource } from "../../../../../core/power/transaction/transaction.datasource";
import { PowerTransactionModel } from "../../../../../core/power/transaction/transaction.model";
import { SubheaderService } from "../../../../../core/_base/layout";
import { PowerTransactionService } from "../../../../../core/power/transaction/transaction.service";
import { PowerTransactionDeleted, PowerTransactionPageRequested, PowerTransactionPageRequestedUnpost } from "../../../../../core/power/transaction/transaction.action";
import { QueryPowerTransactionModel } from '../../../../../core/power/transaction/querytransaction.model';
import { HttpClient } from '@angular/common/http';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { environment } from '../../../../../../environments/environment';
import { FormControl } from '@angular/forms';
import { MatDatepicker } from '@angular/material/datepicker';
import { default as _rollupMoment, Moment } from "moment";
import * as _moment from "moment";

const moment = _rollupMoment || _moment;


@Component({
	selector: 'kt-list-transaction',
	templateUrl: './list-new.component.html',
	styleUrls: ['./list-new.component.scss']
})
export class ListNew implements OnInit, OnDestroy {
	file;
	dataSource: PowerTransactionDataSource;
	displayedColumns = ['select', 'powname', 'unit', 'strtpos', 'endpos', 'cons', 'billmnt', 'actions'];
	@ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
	@ViewChild('sort1', { static: true }) sort: MatSort;
	@ViewChild('searchInput', { static: true }) searchInput: ElementRef;
	lastQuery: QueryPowerTransactionModel;
	selection = new SelectionModel<PowerTransactionModel>(true, []);
	powerTransactionResult: PowerTransactionModel[] = [];

	data = localStorage.getItem("currentUser");
	dataUser = JSON.parse(this.data)
	role = this.dataUser.role

	valPayDate: string
	checkClearDate: boolean
	checkClear: boolean

	dateMonth = new FormControl(moment());


	datePicker: Date = new Date()
	dateConfirm: Date = new Date(this.datePicker.getFullYear(), this.datePicker.getMonth(), 0)

	// Navigate Route
	navMatTab: any[] = [
		{ name: "All Electricity Consumption", value: "all", tab: false },
		{ name: "New Electricity Consumption", value: "new", tab: true },
	]

	date = {
		valid: false,
		filter: {
			control: new FormControl(),
			val: undefined,
		},
		start: {
			control: new FormControl(),
			val: undefined,
		},
		end: {
			control: new FormControl(),
			val: undefined,
		},
	};



	private subscriptions: Subscription[] = [];
	constructor(
		private activatedRoute: ActivatedRoute,
		private store: Store<AppState>,
		private router: Router,
		private http: HttpClient,
		private service: PowerTransactionService,
		private layoutUtilsService: LayoutUtilsService,
		private subheaderService: SubheaderService,
		private cdr: ChangeDetectorRef,
		private modalService: NgbModal,
	) { }
	ngOnInit() {
		const sortSubscription = this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0));
		this.subscriptions.push(sortSubscription);
		const paginatorSubscriptions = merge(this.sort.sortChange, this.paginator.page).pipe(
			tap(() => {
				this.loadPowerTransactionList();
			})
		)
			.subscribe();
		this.subscriptions.push(paginatorSubscriptions);

		const searchSubscription = fromEvent(this.searchInput.nativeElement, 'keyup').pipe(
			debounceTime(150),
			distinctUntilChanged(),
			tap(() => {
				this.paginator.pageIndex = 0;
				this.loadPowerTransactionList();
			})
		).subscribe();
		this.subscriptions.push(searchSubscription);
		this.subheaderService.setTitle('Electricity Consumption');
		this.dataSource = new PowerTransactionDataSource(this.store);
		const entitiesSubscription = this.dataSource.entitySubject.pipe(
			skip(1),
			distinctUntilChanged()
		).subscribe(res => {
			this.powerTransactionResult = res;
		});
		this.subscriptions.push(entitiesSubscription);
		this.loadPowerTransactionList();
	}
	filterConfiguration(): any {
		const filter: any = {};
		const searchText: string = this.searchInput.nativeElement.value.toLowerCase();
		filter.unit = `${searchText}`;
		return filter;
	}
	loadPowerTransactionList() {
		this.selection.clear();
		const queryParams = new QueryPowerTransactionModel(
			this.filterConfiguration(),
			this.date.valid ? this.date.start.val : 0,
			this.date.valid ? this.date.end.val : 0,
			this.valPayDate,
			this.sort.direction,
			this.sort.active,
			this.paginator.pageIndex + 1,
			this.paginator.pageSize,
		);
		this.store.dispatch(new PowerTransactionPageRequestedUnpost({ page: queryParams }));
		this.selection.clear();
	}

	deletePowerTransaction(_item: PowerTransactionModel) {
		const _title = 'Electricity Consumption Delete';
		const _description = 'Are you sure to permanently delete this electricity consumption?';
		const _waitDesciption = 'electricity consumption is deleting...';
		const _deleteMessage = `electricity consumption has been deleted`;

		const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				return;
			}

			this.store.dispatch(new PowerTransactionDeleted({ id: _item._id }));
			this.ngOnInit();
			this.layoutUtilsService.showActionNotification(_deleteMessage, MessageType.Delete);
		});
	}


	fetchPowerTransaction() {
		const messages = [];
		this.selection.selected.forEach(elem => {
			messages.push({
				text: `${elem.pow.nmmtr} , Rate: Rp. ${elem.pow.rte.rte}, Unit: ${elem.pow.unt.nmunt}`,
				id: elem._id.toString(),
				status: elem.pow.nmmtr
			});
		});
		this.layoutUtilsService.fetchElements(messages);
	}
	isAllSelected(): boolean {
		const numSelected = this.selection.selected.length;
		const numRows = this.powerTransactionResult.length;
		return numSelected === numRows;
	}

	masterToggle() {
		if (this.selection.selected.length === this.powerTransactionResult.length) {
			this.selection.clear();
		} else {
			this.powerTransactionResult.forEach(row => this.selection.select(row));
		}
	}

	editPowerTransaction(id) {
		this.router.navigate(['/power-management/power/transaction/edit', id], { relativeTo: this.activatedRoute });
	}
	ngOnDestroy() {
		this.subscriptions.forEach(sb => sb.unsubscribe());
	}

	auto() {
		const API_WATER_TRANSACTION_URL = `${environment.baseAPI}/api/power/transaksi/posting`;
		var data_url = this.http.patch(`${API_WATER_TRANSACTION_URL}`, {
		})
			.subscribe(
				res => {
					const message = `Auto Posting successfully has been successfully.`;
					this.layoutUtilsService.showActionNotification(message, MessageType.Create, 5000, true, true);
					const url = `/power-management/power/transaction/new`;
					this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
					this.ngOnInit();
				},
				err => {
					console.error(err);
					const message = 'Error while adding billing | ' + err.statusText;
					this.layoutUtilsService.showActionNotification(message, MessageType.Create, 5000, true, false);
				}
			);
		this.ngOnInit();
	}


	matTabSelection(status) {
		if (status === "all") this.router.navigateByUrl('/power-management/power/transaction', { relativeTo: this.activatedRoute });
		else if (status === "new") this.router.navigateByUrl('/power-management/power/transaction/new', { relativeTo: this.activatedRoute });
	}

	// Fungsi untuk kondisi strtpos2 tidak ada dan endpos2 tidak ada #START
	convertStrtpos(value) { // START POS
		const strtpos = value / 10;
		return strtpos.toFixed(1)
	}
	convertEndpos(value) { // END POS
		const endpos = value / 10;
		return endpos.toFixed(1)
	}

	// For Consumption START
	checkConsumptionNotStrtEnd2(strt, end) {
		const strtpos = strt / 10
		const strtposResult = strtpos.toFixed(1)
		const resultStrt = parseFloat(strtposResult)

		const endpos = end / 10
		const endposResult = endpos.toFixed(1)
		const resultEnd = parseFloat(endposResult)



		const data = (resultEnd - resultStrt).toFixed(1)
		const result = parseFloat(data)

		return result
	}
	// For Consumption END
	// Fungsi untuk kondisi strtpos2 tidak ada dan endpos2 tidak ada #END

	// Refresh Start
	refresh() {
		this.loadPowerTransactionList()
	}
	// Refresh End


	checkConsumption(strt, end) { // fungsi untuk menentukan nilai consumption (last meter dikurangi Start Meter)
		const start2 = strt
		const end2 = end

		const dataKwh = (end2 - start2).toFixed(1)
		const kwh = parseFloat(dataKwh)

		return kwh
	}

	openLarge(content) {
		this.modalService.open(content, {
			size: "lg",
			backdrop: "static",
		});
	}

	addDate(type, e) {
		this.date[type].val = e.target.value;
		this.checkDateValidation();

		// Fetch list if date is filled
		if (this.date.valid) {
			this.loadPowerTransactionList();
		}
	}
	checkDateValidation() {
		if (this.date.start.val && this.date.end.val) {

			if (this.date.start.val > this.date.end.val) {
				this.date.valid = false
				const message = `End Date should be greater than Start Date`;
				this.layoutUtilsService.showActionNotification(
					message,
					MessageType.Create,
					5000,
					true,
					true
				);

			} else {
				this.date.valid = true;
			}
		}
		else {
			this.date.valid = false;
		}
	}

	clearAllFilter() {
		this.date.valid = false;
		this.searchInput.nativeElement.value = "";
		this.date.start.val = undefined;
		this.date.start.control.setValue(undefined);
		this.date.end.val = undefined;
		this.date.end.control.setValue(undefined);
		this.date.filter.control.setValue(undefined);

		this.dateMonth.setValue(moment())

		this.valPayDate = undefined
		this.date.filter.control.setValue(undefined)
		this.checkClear = false

		this.loadPowerTransactionList();
	}


	export() {
		const queryParams = new QueryPowerTransactionModel(
			this.searchInput.nativeElement.value,
			this.date.valid ? this.date.start.val : 0,
			this.date.valid ? this.date.end.val : 0,
			this.valPayDate,
			this.sort.direction,
			this.sort.active,
			this.paginator.pageIndex + 1,
			this.paginator.pageSize
		);
		this.service.exportExcel(queryParams);
		this.clearAllFilter();
	}

	setMonthAndYear(normalizedMonthAndYear, datepicker: MatDatepicker<Moment>) {
		let ctrlValue = this.dateMonth.value;
		console.log(normalizedMonthAndYear, "normalizedMonthAndYear");

		ctrlValue.month(normalizedMonthAndYear.month());
		ctrlValue.year(normalizedMonthAndYear.year());

		this.dateMonth.setValue(ctrlValue);

		datepicker.close();
		let datVal = moment(this.dateMonth.value).format('L').split("/")
		let result = `${datVal[0]}/${datVal[2]}`
		this.valPayDate = result

		this.checkClearDate = true
		if (this.checkClearDate) this.checkClear = true

		// this.loadBillingList(this.valPayCond, result)
		this.loadPowerTransactionList();
	}
}

