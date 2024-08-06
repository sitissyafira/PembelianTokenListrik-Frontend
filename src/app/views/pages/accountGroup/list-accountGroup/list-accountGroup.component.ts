// Angular
import { Component, OnInit, ElementRef, ViewChild, ChangeDetectionStrategy, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SelectionModel } from '@angular/cdk/collections';
import { MatPaginator, MatSort } from '@angular/material';
import { debounceTime, distinctUntilChanged, tap, skip } from 'rxjs/operators';
import { fromEvent, merge, Subscription } from 'rxjs';
import { Store } from '@ngrx/store';
import { AppState } from '../../../../core/reducers';
import { LayoutUtilsService, MessageType, QueryParamsModel } from '../../../../core/_base/crud';

import { AccountGroupModel } from '../../../../core/accountGroup/accountGroup.model';
import { AccountGroupPageRequested } from '../../../../core/accountGroup/accountGroup.action';
import { AccountGroupDataSource } from '../../../../core/accountGroup/accountGroup.datasource';
import { SubheaderService } from '../../../../core/_base/layout';
import { AccountGroupService } from '../../../../core/accountGroup/accountGroup.service';
import { HttpClient } from '@angular/common/http';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { QueryAccountGroupModel } from '../../../../core/accountGroup/queryag.model';
import { environment } from '../../../../../environments/environment';
// import { AccountGroupGenerateDialogComponent } from './generate-accountGroup/generate-accountGroup.dialog.component';
import { MatTable, MatDialog } from '@angular/material';
@Component({
	selector: 'kt-list-accountGroup',
	templateUrl: './list-accountGroup.component.html',
	styleUrls: ['./list-accountGroup.component.scss']
})
export class ListAccountGroupComponent implements OnInit, OnDestroy {
	file;
	dataSource: AccountGroupDataSource;
	displayedColumns = ['acctNo', 'acctName', 'accType', 'openingBalance',  'balance', 'actions'];
	@ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
	@ViewChild('sort1', { static: true }) sort: MatSort;
	// Filter fields
	@ViewChild('searchInput', { static: true }) searchInput: ElementRef;
	lastQuery: QueryParamsModel;
	// Selection
	selection = new SelectionModel<AccountGroupModel>(true, []);
	accountGroupResult: AccountGroupModel[] = [];
	// Subscriptions
	private subscriptions: Subscription[] = [];
	constructor(
		private activatedRoute: ActivatedRoute,
		private store: Store<AppState>,
		private router: Router,
		private service: AccountGroupService,
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
				this.loadAccountGroupList();
			})
		)
		.subscribe();
		this.subscriptions.push(paginatorSubscriptions);


		// Filtration, bind to searchInput
		const searchSubscription = fromEvent(this.searchInput.nativeElement, 'keyup').pipe(
			// tslint:disable-next-line:max-line-length
			debounceTime(250), // The user can type quite quickly in the input box, and that could trigger a lot of server requests. With this operator, we are limiting the amount of server requests emitted to a maximum of one every 150ms
			distinctUntilChanged(), // This operator will eliminate duplicate values
			tap(() => {
				this.paginator.pageIndex = 0;
				this.loadAccountGroupList();
			})
		).subscribe();
		this.subscriptions.push(searchSubscription);

		// Set title to page breadCrumbs
		this.subheaderService.setTitle('Account');

		// Init DataSource
		this.dataSource = new AccountGroupDataSource(this.store);
		const entitiesSubscription = this.dataSource.entitySubject.pipe(
			skip(1),
			distinctUntilChanged()
		).subscribe(
			res => {
				this.accountGroupResult = res;
			},
			err => {
				alert('yah err')
			}
		);
		this.subscriptions.push(entitiesSubscription);

		// First Load
		this.loadAccountGroupList();
	}

	filterConfiguration(): any {
		const searchNo: number = this.searchInput.nativeElement.value;
		return searchNo;
	}

	loadAccountGroupList() {
		this.selection.clear();
		const queryParams = new QueryAccountGroupModel(
			this.filterConfiguration(),
			this.paginator.pageIndex + 1,
			this.paginator.pageSize
		);
		this.store.dispatch(new AccountGroupPageRequested({ page: queryParams }));
		this.selection.clear();
	}

	isAllSelected(): boolean {
		const numSelected = this.selection.selected.length;
		const numRows = this.accountGroupResult.length;
		return numSelected === numRows;
	}

	masterToggle() {
		if (this.selection.selected.length === this.accountGroupResult.length) {
			this.selection.clear();
		} else {
			this.accountGroupResult.forEach(row => this.selection.select(row));
		}
	}

	editAccountGroup(id) {
		this.router.navigate(['edit', id], { relativeTo: this.activatedRoute });
	}
	ngOnDestroy() {
		this.subscriptions.forEach(sb => sb.unsubscribe());
	}


	export(){
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

		this.http.post<any>(`${environment.baseAPI}/api/excel/import/accountGroup/`, formData).subscribe(
			res => {
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
}
