import { Component, OnInit, OnDestroy, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SelectionModel } from '@angular/cdk/collections';
import { MatPaginator, MatSort, } from '@angular/material';
import { debounceTime, distinctUntilChanged, tap, skip, } from 'rxjs/operators';
import { fromEvent, merge, Subscription } from 'rxjs';
import { Store, } from '@ngrx/store';
import { AppState } from '../../../../../core/reducers';
import { LayoutUtilsService, MessageType, QueryParamsModel } from '../../../../../core/_base/crud';
import { WaterTransactionDataSource } from "../../../../../core/water/transaction/transcation.datasource";
import { WaterTransactionModel } from "../../../../../core/water/transaction/transaction.model";
import { SubheaderService } from "../../../../../core/_base/layout";
import { WaterTransactionService } from "../../../../../core/water/transaction/transaction.service";
import { WaterTransactionDeleted, WaterTransactionPageUnpost, WaterTransactionPageRequested } from "../../../../../core/water/transaction/transaction.action";
import { QueryWaterTransactionModel } from '../../../../../core/water/transaction/querytransaction.model';
import { HttpClient } from '@angular/common/http';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { environment } from '../../../../../../environments/environment';
import { FormControl } from '@angular/forms';

@Component({
	selector: 'kt-list-transaction',
	templateUrl: './list-new.component.html',
	styleUrls: ['./list-new.component.scss']
})
export class ListNew implements OnInit, OnDestroy {
	file;
	dataSource: WaterTransactionDataSource;
	displayedColumns = ['select', 'watname', 'unit', 'startpos', 'endpos', 'cons', 'billmonth', 'actions'];
	@ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
	@ViewChild('sort1', { static: true }) sort: MatSort;
	@ViewChild('searchInput', { static: true }) searchInput: ElementRef;
	lastQuery: QueryParamsModel;
	selection = new SelectionModel<WaterTransactionModel>(true, []);
	waterTransactionResult: WaterTransactionModel[] = [];
	data = localStorage.getItem("currentUser");
	dataUser = JSON.parse(this.data)
	role = this.dataUser.role

	// Navigate Route
	navMatTab: any[] = [
		{ name: "All Water Consumption", value: "all", tab: false },
		{ name: "New Water Consumption", value: "new", tab: true },
	]

	date = {
		valid: false,
		start: {
			control: new FormControl(),
			val: undefined,
		},
		end: {
			control: new FormControl(),
			val: undefined,
		},
	};

	valPayDate: string


	datePicker: Date = new Date()
	dateConfirm: Date = new Date(this.datePicker.getFullYear(), this.datePicker.getMonth(), 0)


	private subscriptions: Subscription[] = [];
	constructor(
		private activatedRoute: ActivatedRoute,
		private store: Store<AppState>,
		private router: Router,
		private service: WaterTransactionService,
		private layoutUtilsService: LayoutUtilsService,
		private subheaderService: SubheaderService,
		private cdr: ChangeDetectorRef,
		private http: HttpClient,
		private modalService: NgbModal,
	) { }

	ngOnInit() {
		const sortSubscription = this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0));
		this.subscriptions.push(sortSubscription);
		const paginatorSubscriptions = merge(this.sort.sortChange, this.paginator.page).pipe(
			tap(() => {
				this.loadWaterTransactionList();
			})
		)
			.subscribe();
		this.subscriptions.push(paginatorSubscriptions);
		const searchSubscription = fromEvent(this.searchInput.nativeElement, 'keyup').pipe(
			debounceTime(150),
			distinctUntilChanged(),
			tap(() => {
				this.paginator.pageIndex = 0;
				this.loadWaterTransactionList();
			})
		).subscribe();
		this.subscriptions.push(searchSubscription);
		this.subheaderService.setTitle('Water Consumption');

		this.dataSource = new WaterTransactionDataSource(this.store);
		const entitiesSubscription = this.dataSource.entitySubject.pipe(
			skip(1),
			distinctUntilChanged()
		).subscribe(res => {
			this.waterTransactionResult = res;
		});
		this.subscriptions.push(entitiesSubscription);
		this.loadWaterTransactionList();

	}

	filterConfiguration(): any {
		const filter: any = {};
		const searchText: string = this.searchInput.nativeElement.value.toLowerCase();

		filter.unit = `${searchText}`;
		return filter;
	}

	loadWaterTransactionList() {
		this.selection.clear();
		const queryParams = new QueryWaterTransactionModel(
			// this.searchInput.nativeElement.value,
			this.filterConfiguration(),
			this.date.valid ? this.date.start.val : 0,
			this.date.valid ? this.date.end.val : 0,
			this.valPayDate,
			this.sort.direction,
			this.sort.active,
			this.paginator.pageIndex + 1,
			this.paginator.pageSize
		);
		this.store.dispatch(new WaterTransactionPageUnpost({ page: queryParams }));
		this.selection.clear();
	}

	deleteWaterTransaction(_item: WaterTransactionModel) {
		const _title = 'Water Consumption Delete';
		const _description = 'Are you sure to permanently delete this water consumption?';
		const _waitDesciption = 'Water consumption is deleting...';
		const _deleteMessage = `Water consumption has been deleted`;

		const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				return;
			}
			this.store.dispatch(new WaterTransactionDeleted({ id: _item._id }));
			this.ngOnInit();
			this.layoutUtilsService.showActionNotification(_deleteMessage, MessageType.Delete);
		});
	}


	fetchPowerTransaction() {
		const messages = [];
		this.selection.selected.forEach(elem => {
			messages.push({
				text: `${elem.wat.nmmtr} , Rate: Rp. ${elem.wat.rte.rte}, Unit: ${elem.wat.unt.nmunt}`,
				id: elem._id.toString(),
				status: elem.wat.nmmtr
			});
		});
		this.layoutUtilsService.fetchElements(messages);
	}
	isAllSelected(): boolean {
		const numSelected = this.selection.selected.length;
		const numRows = this.waterTransactionResult.length;
		return numSelected === numRows;
	}

	masterToggle() {
		if (this.selection.selected.length === this.waterTransactionResult.length) {
			this.selection.clear();
		} else {
			this.waterTransactionResult.forEach(row => this.selection.select(row));
		}
	}
	editWaterTransaction(id) {
		this.router.navigate(['/water-management/water/transaction/edit', id], { relativeTo: this.activatedRoute });
	}

	postingAll(WaterTransactionModel) {
		this.service.postingAll(WaterTransactionModel);
	}

	ngOnDestroy() {
		this.subscriptions.forEach(sb => sb.unsubscribe());
	}

	auto() {
		const API_WATER_TRANSACTION_URL = `${environment.baseAPI}/api/water/transaksi/posting`;
		var data_url = this.http.patch(`${API_WATER_TRANSACTION_URL}`, {
		})
			.subscribe(
				res => {
					const message = `Auto Posting successfully has been successfully.`;
					this.layoutUtilsService.showActionNotification(message, MessageType.Create, 5000, true, true);
					const url = `/water-management/water/transaction/new`;
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
			this.loadWaterTransactionList()
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
		this.date.start.val = "";
		this.date.start.control.setValue("");
		this.date.end.val = "";
		this.date.end.control.setValue("");

		this.loadWaterTransactionList();
	}


	export() {
		const queryParams = new QueryWaterTransactionModel(
			this.searchInput.nativeElement.value,
			this.valPayDate,
			this.date.valid ? this.date.start.val : 0,
			this.date.valid ? this.date.end.val : 0,
			this.sort.direction,
			this.sort.active,
			this.paginator.pageIndex + 1,
			this.paginator.pageSize
		);
		this.service.exportExcel(queryParams);
		this.clearAllFilter();
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
		const strtposResult = strtpos.toFixed(3)
		const resultStrt = parseFloat(strtposResult)

		const endpos = end / 10
		const endposResult = endpos.toFixed(3)
		const resultEnd = parseFloat(endposResult)



		const data = (resultEnd - resultStrt).toFixed(3)
		const result = parseFloat(data)

		return result
	}
	// For Consumption END
	// Fungsi untuk kondisi strtpos2 tidak ada dan endpos2 tidak ada #END

	// Refresh Start
	refresh() {
		this.loadWaterTransactionList()
	}
	// Refresh End



	checkConsumption(strt, end) { // fungsi untuk menentukan nilai consumption (last meter dikurangi Start Meter)
		const start2 = strt
		const end2 = end

		const data = (end2 - start2).toFixed(3)
		const result = parseFloat(data)

		return result
	}

	matTabSelection(status) {
		if (status === "all") this.router.navigateByUrl('/water-management/water/transaction', { relativeTo: this.activatedRoute });
		else if (status === "new") this.router.navigateByUrl('/water-management/water/transaction/new', { relativeTo: this.activatedRoute });
	}



}

