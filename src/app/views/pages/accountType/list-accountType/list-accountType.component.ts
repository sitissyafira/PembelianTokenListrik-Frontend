import { Component, OnInit, ElementRef, ViewChild, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SelectionModel } from '@angular/cdk/collections';
import { MatPaginator, MatSort, } from '@angular/material';
import { debounceTime, distinctUntilChanged, tap, skip, } from 'rxjs/operators';
import { fromEvent, merge, Subscription } from 'rxjs';
import { Store, } from '@ngrx/store';
import { AppState } from '../../../../core/reducers';
import { LayoutUtilsService, MessageType, QueryParamsModel } from '../../../../core/_base/crud';
import { AccountTypeModel } from '../../../../core/accountType/accountType.model';
import { AccountTypeDeleted, AccountTypePageRequested } from '../../../../core/accountType/accountType.action';
import { AccountTypeDataSource } from '../../../../core/accountType/accountType.datasource';
import { SubheaderService } from '../../../../core/_base/layout';
import { AccountTypeService } from '../../../../core/accountType/accountType.service';
import { HttpClient } from '@angular/common/http';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { QueryAccountTypeModel } from '../../../../core/accountType/queryaccounttype.model';
import { environment } from '../../../../../environments/environment';

@Component({
	selector: 'kt-list-accountType',
	templateUrl: './list-accountType.component.html',
	styleUrls: ['./list-accountType.component.scss']
})
export class ListAccountTypeComponent implements OnInit, OnDestroy {
	file;
	dataSource: AccountTypeDataSource;
	displayedColumns = ['acctypeno', 'acctype', 'status','actions'];
	@ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
	@ViewChild('sort1', { static: true }) sort: MatSort;
	@ViewChild('searchInput', { static: true }) searchInput: ElementRef;
	lastQuery: QueryParamsModel;
	selection = new SelectionModel<AccountTypeModel>(true, []);
	accountTypeResult: AccountTypeModel[] = [];


	private subscriptions: Subscription[] = [];
	constructor(
		private activatedRoute: ActivatedRoute,
		private store: Store<AppState>,
		private router: Router,
		private service: AccountTypeService,
		private layoutUtilsService: LayoutUtilsService,
		private subheaderService: SubheaderService,
		private cdr: ChangeDetectorRef,
		private http: HttpClient,
		private modalService: NgbModal
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
				this.loadAccountTypeList();
			})
		)
		.subscribe();
		this.subscriptions.push(paginatorSubscriptions);


		// Filtration, bind to searchInput
		const searchSubscription = fromEvent(this.searchInput.nativeElement, 'keyup').pipe(
			// tslint:disable-next-line:max-line-length
			debounceTime(500), // The user can type quite quickly in the input box, and that could trigger a lot of server requests. With this operator, we are limiting the amount of server requests emitted to a maximum of one every 150ms
			distinctUntilChanged(), // This operator will eliminate duplicate values
			tap(() => {
				this.paginator.pageIndex = 0;
				this.loadAccountTypeList();
			})
		).subscribe();
		this.subscriptions.push(searchSubscription);

		// Set title to page breadCrumbs
		this.subheaderService.setTitle('Account Type');

		// Init DataSource
		this.dataSource = new AccountTypeDataSource(this.store);
		const entitiesSubscription = this.dataSource.entitySubject.pipe(
			skip(1),
			distinctUntilChanged()
		).subscribe(
			res => {
			this.accountTypeResult = res;
			}, 
			err => {
			alert('error');		
		}
		);
		this.subscriptions.push(entitiesSubscription);

		// First Load
		this.loadAccountTypeList();
	}

	filterConfiguration(): any {
		const searchNumber: string = this.searchInput.nativeElement.value.toLowerCase();
		return searchNumber;
	}

	loadAccountTypeList() {
		this.selection.clear();
		const queryParams = new QueryAccountTypeModel(
			this.filterConfiguration(),
			this.paginator.pageIndex + 1,
			this.paginator.pageSize
		);
		this.store.dispatch(new AccountTypePageRequested({ page: queryParams }));
		this.selection.clear();
	}

	deleteAccountType(_item: AccountTypeModel) {
		// tslint:disable-next-line:variable-name
		const _title = 'Account Type Delete';
		// tslint:disable-next-line:variable-name
		const _description = 'Are you sure to permanently delete this account type?';
		const _waitDesciption = 'Account type is deleting...';
		const _deleteMessage = `Account type has been deleted`;
		const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				return;
			}
			this.store.dispatch(new AccountTypeDeleted({ id: _item._id }));
			this.layoutUtilsService.showActionNotification(_deleteMessage, MessageType.Delete);
			this.loadAccountTypeList();
		});
	}

	isAllSelected(): boolean {
		const numSelected = this.selection.selected.length;
		const numRows = this.accountTypeResult.length;
		return numSelected === numRows;
	}

	masterToggle() {
		if (this.selection.selected.length === this.accountTypeResult.length) {
			this.selection.clear();
		} else {
			this.accountTypeResult.forEach(row => this.selection.select(row));
		}
	}

	editAccountType(id) {
		this.router.navigate(['edit', id], { relativeTo: this.activatedRoute });
	}
	ngOnDestroy() {
		this.subscriptions.forEach(sb => sb.unsubscribe());
	}

	export() {
		this.service.exportExcel();
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

		this.http.post<any>(`${environment.baseAPI}/api/excel/accountType/import`, formData).subscribe(
			res => {
				const message = `file successfully has been import.`;
				this.layoutUtilsService.showActionNotification(message, MessageType.Create, 5000, true, true);
				this.loadAccountTypeList();
			},
			err => {
				console.error(err);
				const message = 'Error while importing File | ' + err.statusText;
				this.layoutUtilsService.showActionNotification(message, MessageType.Create, 5000, true, false);
			}
		)
	}
}
