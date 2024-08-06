import { Component, OnInit, ElementRef, ViewChild, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SelectionModel } from '@angular/cdk/collections';
import { MatPaginator, MatSort, } from '@angular/material';
import { debounceTime, distinctUntilChanged, tap, skip, } from 'rxjs/operators';
import { fromEvent, merge, Subscription } from 'rxjs';
import { Store, } from '@ngrx/store';
import { AppState } from '../../../../core/reducers';
import { LayoutUtilsService, MessageType, QueryParamsModel } from '../../../../core/_base/crud';
import { AccountCategoryModel } from '../../../../core/accountCategory/accountCategory.model';
import { AccountCategoryDeleted, AccountCategoryPageRequested } from '../../../../core/accountCategory/accountCategory.action';
import { AccountCategoryDataSource } from '../../../../core/accountCategory/accountCategory.datasource';
import { SubheaderService } from '../../../../core/_base/layout';
import { AccountCategoryService } from '../../../../core/accountCategory/accountCategory.service';
import { HttpClient } from '@angular/common/http';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { QueryAccountCategoryModel } from '../../../../core/accountCategory/queryaccountcategory.model';
import { environment } from '../../../../../environments/environment';

@Component({
	selector: 'kt-list-pl-accountCategory',
	templateUrl: './list-pl-accountCategory.component.html',
	styleUrls: ['./list-pl-accountCategory.component.scss']
})
export class ListAccountCategoryPLComponent implements OnInit, OnDestroy {
	file;
	dataSource: AccountCategoryDataSource;
	displayedColumns = ['no', 'name', 'actions'];
	@ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
	@ViewChild('sort1', { static: true }) sort: MatSort;
	@ViewChild('searchInput', { static: true }) searchInput: ElementRef;
	lastQuery: QueryParamsModel;
	selection = new SelectionModel<AccountCategoryModel>(true, []);
	accountCategoryResult: AccountCategoryModel[] = [];

	// Navigate Route
	navMatTab: any[] = [
		{ name: "Balance Sheet", value: "bs", tab: false },
		{ name: "Profit & Loss", value: "pl", tab: true },
	]


	private subscriptions: Subscription[] = [];
	constructor(
		private activatedRoute: ActivatedRoute,
		private store: Store<AppState>,
		private router: Router,
		private service: AccountCategoryService,
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
				this.loadAccountCategoryList();
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
				this.loadAccountCategoryList();
			})
		).subscribe();
		this.subscriptions.push(searchSubscription);

		// Set title to page breadCrumbs
		this.subheaderService.setTitle('Account Category');

		// Init DataSource
		this.dataSource = new AccountCategoryDataSource(this.store);
		const entitiesSubscription = this.dataSource.entitySubject.pipe(
			skip(1),
			distinctUntilChanged()
		).subscribe(
			res => {
				this.accountCategoryResult = res;
			},
			err => {
				alert('error');
			}
		);
		this.subscriptions.push(entitiesSubscription);

		// First Load
		this.loadAccountCategoryList();
	}

	filterConfiguration(): any {
		const filter: any = {};
		filter.name = this.searchInput.nativeElement.value;
		// const searchNumber: string = this.searchInput.nativeElement.value.toLowerCase();
		return filter;
	}

	loadAccountCategoryList() {
		this.selection.clear();
		const queryParams = new QueryAccountCategoryModel(
			this.filterConfiguration(),
			this.paginator.pageIndex + 1,
			this.paginator.pageSize,
			"pl"
		);
		this.store.dispatch(new AccountCategoryPageRequested({ page: queryParams }));
		this.selection.clear();
	}

	deleteAccountCategory(_item: AccountCategoryModel) {
		// tslint:disable-next-line:variable-name
		const _title = 'Account Category Delete';
		// tslint:disable-next-line:variable-name
		const _description = 'Are you sure to permanently delete this account category?';
		const _waitDesciption = 'Account category is deleting...';
		const _deleteMessage = `Account category has been deleted`;
		const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				return;
			}
			this.store.dispatch(new AccountCategoryDeleted({ id: _item._id }));
			this.layoutUtilsService.showActionNotification(_deleteMessage, MessageType.Delete);
			this.loadAccountCategoryList();
		});
	}

	editAccountCategory(id) {
		this.router.navigate(['edit', id], { relativeTo: this.activatedRoute });
	}

	editItem(id: string) {
		const url = `/accountCategory/pl/edit/${id}`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
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

		this.http.post<any>(`${environment.baseAPI}/api/excel/accountCategory/import`, formData).subscribe(
			res => {
				const message = `file successfully has been import.`;
				this.layoutUtilsService.showActionNotification(message, MessageType.Create, 5000, true, true);
				this.loadAccountCategoryList();
			},
			err => {
				console.error(err);
				const message = 'Error while importing File | ' + err.statusText;
				this.layoutUtilsService.showActionNotification(message, MessageType.Create, 5000, true, false);
			}
		)
	}

	/**
	 * @param status 
	 */
	matTabSelection(status) {
		if (status === "bs") this.router.navigateByUrl(`/accountCategory`, { relativeTo: this.activatedRoute });
		else if (status === "pl") this.router.navigateByUrl(`/accountCategory/pl`, { relativeTo: this.activatedRoute });
	}

}
