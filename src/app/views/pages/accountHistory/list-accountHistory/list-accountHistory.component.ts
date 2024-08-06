import { Component, OnInit, ElementRef, ViewChild, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SelectionModel } from '@angular/cdk/collections';
import { MatPaginator, MatSort, } from '@angular/material';
import { FormControl } from '@angular/forms';
import { debounceTime, distinctUntilChanged, tap, skip, } from 'rxjs/operators';
import { fromEvent, merge, Subscription } from 'rxjs';
import { Store, } from '@ngrx/store';
import { AppState } from '../../../../core/reducers';
import { LayoutUtilsService, MessageType, QueryParamsModel } from '../../../../core/_base/crud';
import { AccountHistoryModel } from '../../../../core/accountHistory/accountHistory.model';
import { AccountHistoryDeleted, AccountHistoryPageRequested } from '../../../../core/accountHistory/accountHistory.action';
import { AccountHistoryDataSource } from '../../../../core/accountHistory/accountHistory.datasource';
import { SubheaderService } from '../../../../core/_base/layout';
import { AccountHistoryService } from '../../../../core/accountHistory/accountHistory.service';
import { HttpClient } from '@angular/common/http';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { QueryAccountHistoryModel } from '../../../../core/accountHistory/queryaccountHistory.model';
import { environment } from '../../../../../environments/environment';
import { AccountTypeModel } from "../../../../core/accountType/accountType.model";
import { AccountTypeService } from '../../../../core/accountType/accountType.service';
import { I } from '@angular/cdk/keycodes';
import { AccountHistoryGenerateDialogComponent } from './generate-accountHistory/generate-accountHistory.dialog.component';
import { MatDialog } from '@angular/material';

@Component({
	selector: 'kt-list-accountHistory',
	templateUrl: './list-accountHistory.component.html',
	styleUrls: ['./list-accountHistory.component.scss']
})
export class ListAccountHistoryComponent implements OnInit, OnDestroy {
	file;
	dataSource: AccountHistoryDataSource;
	displayedColumns = ['no', 'createdDate', 'code', 'menu', 'accountType', 'accountNo', 'accountName', 'total', 'actions'];
	@ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
	@ViewChild('sort1', { static: true }) sort: MatSort;
	// Filter fields
	@ViewChild('searchInputName', { static: true }) searchInputName: ElementRef;
	@ViewChild('searchInputCode', { static: true }) searchInputCode: ElementRef;
	@ViewChild('menuList', { static: true }) menuList: ElementRef;
	lastQuery: QueryParamsModel;
	selection = new SelectionModel<AccountHistoryModel>(true, []);
	accountHistoryResult: AccountHistoryModel[] = [];

	// Filtering
	menuFilterList = [
		{ value: 'Account Payable' },
		{ value: 'Account Receivable' },
		{ value: 'Journal Set Off' },
		{ value: 'Journal Memorial' },
		{ value: 'Journal Amortization' },
		{ value: 'Debit Note' },
		// {value: 'Other Income'},
		// {value: 'Journal Voucher'},
		// {value: 'Fixed Asset'},
	];

	filterMenuControl = new FormControl();
	filterStartDateControl = new FormControl();
	filterEndDateControl = new FormControl();
	filterAccountTypeControl = new FormControl();
	accountTypeList: AccountTypeModel[] = [];
	dateFilter: any;
	fromDate: string;
	toDate: string;
	menu: any;
	isGenerate: boolean = false;

	showPageSizeOptions = true;
	pageSizeOptions = [5, 10, 25];

	sortField: string = "code"
	sortOrder: string = "desc"


	private subscriptions: Subscription[] = [];

	constructor(
		private activatedRoute: ActivatedRoute,
		private store: Store<AppState>,
		private router: Router,
		private service: AccountHistoryService,
		private accountTypeService: AccountTypeService,
		private layoutUtilsService: LayoutUtilsService,
		private subheaderService: SubheaderService,
		private cdr: ChangeDetectorRef,
		private http: HttpClient,
		private modalService: NgbModal,
		private dialog: MatDialog,
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
				this.loadAccountHistoryList();
			})
		)
			.subscribe();
		this.subscriptions.push(paginatorSubscriptions);

		// Filtration, bind to searchInput
		const searchSubscription = fromEvent(this.searchInputName.nativeElement, 'keyup').pipe(
			// tslint:disable-next-line:max-line-length
			debounceTime(100),
			distinctUntilChanged(), // Will elminate duplicate values
			tap(() => {
				this.paginator.pageIndex = 0;
				this.loadAccountHistoryList();
			})
		).subscribe();
		this.subscriptions.push(searchSubscription);

		// Filtration, bind to searchInput
		const searchCodeSubscription = fromEvent(this.searchInputCode.nativeElement, 'keyup').pipe(
			// tslint:disable-next-line:max-line-length
			debounceTime(100),
			distinctUntilChanged(), // Will elminate duplicate values
			tap(() => {
				this.paginator.pageIndex = 0;
				this.loadAccountHistoryList();
			})
		).subscribe();
		this.subscriptions.push(searchCodeSubscription);

		// Filter menu
		const filterMenuControlSub = this.filterMenuControl.valueChanges.subscribe(() => {
			this.loadAccountHistoryList();
		});
		this.subscriptions.push(filterMenuControlSub);

		// Filter start date
		const filterStartDateControlSub = this.filterStartDateControl.valueChanges.subscribe(() => {
			this.loadAccountHistoryList();
		});
		this.subscriptions.push(filterStartDateControlSub);

		// Filter end date
		const filterEndDateControlSub = this.filterEndDateControl.valueChanges.subscribe(() => {
			this.loadAccountHistoryList();
		});
		this.subscriptions.push(filterEndDateControlSub);

		// Filter account history
		const filterAccountTypeControlSub = this.filterAccountTypeControl.valueChanges.subscribe(() => {
			this.loadAccountHistoryList();
		});
		this.subscriptions.push(filterAccountTypeControlSub);

		// Set title to page breadCrumbs
		this.subheaderService.setTitle('Account History');

		// Init DataSource
		this.dataSource = new AccountHistoryDataSource(this.store);
		const entitiesSubscription = this.dataSource.entitySubject.pipe(
			skip(1),
			distinctUntilChanged()
		).subscribe(
			res => {
				this.accountHistoryResult = res;
			},
			err => {
				alert('error');
			}
		);
		this.subscriptions.push(entitiesSubscription);

		// First Load
		this.loadAccountHistoryList();
		this.loadAccountTypeList();
	}

	loadAccountHistoryList() {
		this.selection.clear();
		const queryParams = new QueryAccountHistoryModel(
			this.filterConfiguration(),
			this.paginator.pageIndex + 1,
			this.paginator.pageSize,
			this.sortOrder,
			this.sortField,
			this.filterStartDateControl.value,
			this.filterEndDateControl.value,
		);
		this.store.dispatch(new AccountHistoryPageRequested({ page: { ...queryParams, fromDate: this.filterStartDateControl.value, toDate: this.filterEndDateControl.value, sortOrder: this.sortOrder, sortField: this.sortField } }));
		this.selection.clear();
	}

	filterConfiguration(): any {
		const filter: any = {};
		const searchName: string = this.searchInputName.nativeElement.value;
		const searchCode: string = this.searchInputCode.nativeElement.value;
		const menu = this.filterMenuControl.value;
		const accountType = this.filterAccountTypeControl.value;

		filter.account_name = searchName;
		filter.code = searchCode;
		filter.menu = menu;
		filter.account_type = accountType;

		return filter;
	}

	loadAccountTypeList() {
		const qParams = {
			search: undefined,
			page: 1,
			limit: 10000
		}
		this.accountTypeService.getListAccountType(qParams).subscribe((resp: any) => {
			this.accountTypeList = resp.data;
		});
	}

	clearAllFilter() {
		this.filterAccountTypeControl.reset();
		this.filterMenuControl.reset();
		this.searchInputName.nativeElement.value = "";
		this.searchInputCode.nativeElement.value = "";
		this.filterStartDateControl.reset();
		this.filterEndDateControl.reset();

		this.loadAccountHistoryList();
		this.cdr.markForCheck();
	}

	deleteAccountHistory(_item: AccountHistoryModel) {
		// tslint:disable-next-line:variable-name
		const _title = 'Account History Delete';
		// tslint:disable-next-line:variable-name
		const _description = 'Are you sure to permanently delete this account history?';
		const _waitDesciption = 'Account history is deleting...';
		const _deleteMessage = `Account history has been deleted`;
		const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				return;
			}
			this.store.dispatch(new AccountHistoryDeleted({ id: _item._id }));
			this.layoutUtilsService.showActionNotification(_deleteMessage, MessageType.Delete);
			this.loadAccountHistoryList();
		});
	}

	isNumberNegatif(value) {
		if (value < 0) {
			let result = value.toString().split('');
			result.shift();
			let number = result.join('');
			return `(${this.idrFormat(Number(number))})`;
		} else {
			return this.idrFormat(value);
		}
	}

	optionalChecking(value) {
		return value ? value : '-';
	}

	idrFormat(val) {
		// Using ES6
		return new Intl.NumberFormat('id-ID',
			{ style: 'currency', currency: 'IDR', minimumFractionDigits: 2 }
		).format(val);
	}

	isAllSelected(): boolean {
		const numSelected = this.selection.selected.length;
		const numRows = this.accountHistoryResult.length;
		return numSelected === numRows;
	}

	masterToggle() {
		if (this.selection.selected.length === this.accountHistoryResult.length) {
			this.selection.clear();
		} else {
			this.accountHistoryResult.forEach(row => this.selection.select(row));
		}
	}

	editAccountHistory(id) {
		this.router.navigate(['edit', id], { relativeTo: this.activatedRoute });
	}
	ngOnDestroy() {
		this.subscriptions.forEach(sb => sb.unsubscribe());
	}

	export() {
		this.service.exportExcel();
	}

	// Generate List
	generateList() {
		const _generateMsg = 'Account History has been generated';
		const _loadingMsg = 'Generating account history...';
		const _errorMsg = 'Failed to generated';
		const _msgType = MessageType.Read;

		this.isGenerate = true;
		this.service.generateAccountHistory().subscribe(
			resp => {
				this.isGenerate = false;
				this.layoutUtilsService.showActionNotification(_generateMsg, _msgType, 5000);
				this.cdr.markForCheck();
			},
			err => {
				this.isGenerate = false;
				this.layoutUtilsService.showActionNotification(_errorMsg, _msgType, 5000);
				this.cdr.markForCheck();
			}
		)
	}

	generateAccount() {
		const dialogRef = this.dialog.open(
			AccountHistoryGenerateDialogComponent,
			{
				data: { event: 'generate' },
				width: '600px',
				minHeight: '380px',
				disableClose: true
			}
		);
		dialogRef.afterClosed().subscribe((result) => {
			this.loadAccountHistoryList()
		});


	}

	detailItem(id: string) {
		const url = `/accountHistory/detail/${id}`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}

	openLarge(content) {
		this.modalService.open(content, {
			size: 'lg'
		});
	}

	selectFile(event) {
		if (event.target.files.length > 0) {
			const file = event.target.files[0];
			this.file = file;
		}
	}

	onSubmit() {
		const formData = new FormData();
		formData.append('file', this.file);

		this.http.post<any>(`${environment.baseAPI}/api/excel/accountHistory/import`, formData).subscribe(
			res => {
				const message = `file successfully has been import.`;
				this.layoutUtilsService.showActionNotification(message, MessageType.Create, 5000, true, true);
				this.loadAccountHistoryList();
			},
			err => {
				console.error(err);
				const message = 'Error while importing File | ' + err.statusText;
				this.layoutUtilsService.showActionNotification(message, MessageType.Create, 5000, true, false);
			}
		)
	}

	isClearActive() {
		const searchName: string = this.searchInputName.nativeElement.value;
		const searchCode: string = this.searchInputCode.nativeElement.value;
		const menu = this.filterMenuControl.value;
		const accountType = this.filterAccountTypeControl.value;
		const startDate = this.filterStartDateControl.value;
		const endDate = this.filterEndDateControl.value;
		return searchName || searchCode || (menu && menu.length) || (accountType && accountType.length) || startDate || endDate ? true : false;
	}

	refresh() {
		this.loadAccountHistoryList()
	}
	announceSortChange(sortState) {
		console.log(sortState, 'sortState');
		this.sortField = sortState.active
		this.sortOrder = sortState.direction
		this.loadAccountHistoryList()
	}

}
