// Angular
import { Component, OnInit, ElementRef, ViewChild, ChangeDetectionStrategy, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
// Material
import { SelectionModel } from '@angular/cdk/collections';
import { MatPaginator, MatSort, MatSnackBar } from '@angular/material';
// RXJS
import { debounceTime, distinctUntilChanged, tap, skip, take, delay } from 'rxjs/operators';
import { fromEvent, merge, Observable, of, Subscription } from 'rxjs';
// LODASH
import { each, find } from 'lodash';
// NGRX
import { Store, select } from '@ngrx/store';
import { AppState } from '../../../../core/reducers';

//services
import { LayoutUtilsService, MessageType, QueryParamsModel } from '../../../../core/_base/crud';

import { RevenueModel } from '../../../../core/revenue/revenue.model';
import { RevenueDeleted, RevenuePageRequested} from '../../../../core/revenue/revenue.action';
import {RevenueDataSource} from '../../../../core/revenue/revenue.datasource';
import {SubheaderService} from '../../../../core/_base/layout';
import {RevenueService} from '../../../../core/revenue/revenue.service';
import { HttpClient } from '@angular/common/http';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { QueryRevenueModel } from '../../../../core/revenue/queryrevenue.model';

@Component({
  selector: 'kt-list-revenue',
  templateUrl: './list-revenue.component.html',
  styleUrls: ['./list-revenue.component.scss']
})
export class ListRevenueComponent implements OnInit, OnDestroy {
	file;
	data = localStorage.getItem("currentUser");
	dataUser = JSON.parse(this.data)
	role = this.dataUser.role
	dataSource: RevenueDataSource;
	displayedColumns = [ 'revenueName', 'serviceFee', 'administration','actions'];
	@ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
	@ViewChild('sort1', {static: true}) sort: MatSort;
	// Filter fields
	@ViewChild('searchInput', {static: true}) searchInput: ElementRef;
	lastQuery: QueryParamsModel;
	// Selection
	selection = new SelectionModel<RevenueModel>(true, []);
	revenueResult: RevenueModel[] = [];
	// Subscriptions
	private subscriptions: Subscription[] = [];
  	constructor(
		private activatedRoute: ActivatedRoute,
		private store: Store<AppState>,
		private router: Router,
		private service: RevenueService,
		private layoutUtilsService: LayoutUtilsService,
		private subheaderService: SubheaderService,
		private cdr: ChangeDetectorRef,
		private http : HttpClient,
		private modalService : NgbModal
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
				this.loadRevenueList();
			})
		)
			.subscribe();
		this.subscriptions.push(paginatorSubscriptions);


		// Filtration, bind to searchInput
		const searchSubscription = fromEvent(this.searchInput.nativeElement, 'keyup').pipe(
			// tslint:disable-next-line:max-line-length
			debounceTime(50), // The user can type quite quickly in the input box, and that could trigger a lot of server requests. With this operator, we are limiting the amount of server requests emitted to a maximum of one every 150ms
			distinctUntilChanged(), // This operator will eliminate duplicate values
			tap(() => {
				this.paginator.pageIndex = 0;
				this.loadRevenueList();
			})
		).subscribe();
		this.subscriptions.push(searchSubscription);

		// Set title to page breadCrumbs
		this.subheaderService.setTitle('Revenue');

		// Init DataSource
		this.dataSource = new RevenueDataSource(this.store);
		const entitiesSubscription = this.dataSource.entitySubject.pipe(
			skip(1),
			distinctUntilChanged()
		).subscribe(res => {
			this.revenueResult = res;
		});
		this.subscriptions.push(entitiesSubscription);

		// First Load
		this.loadRevenueList();
  	}

	filterConfiguration(): any {
		const filter: any = {};
		const searchText: string = this.searchInput.nativeElement.value.toLowerCase();
		filter.revenueName = `${searchText}`;
		return filter;
	}

	loadRevenueList(){
		this.selection.clear();
		const queryParams = new QueryRevenueModel(
			this.filterConfiguration(),
			this.sort.direction,
			this.sort.active,
			this.paginator.pageIndex+1,
			this.paginator.pageSize
		);
		this.store.dispatch(new RevenuePageRequested({ page: queryParams }));
		this.selection.clear();
	}

	deleteRevenue(_item: RevenueModel) {
		// tslint:disable-next-line:variable-name
		const _title = 'Revenue Delete';
		// tslint:disable-next-line:variable-name
		const _description = 'Are you sure to permanently delete this revenue?';
		const _waitDesciption = 'Revenue is deleting...';
		const _deleteMessage = `Revenue has been deleted`;

		const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				return;
			}

			this.store.dispatch(new RevenueDeleted({ id: _item._id }));
			this.layoutUtilsService.showActionNotification(_deleteMessage, MessageType.Delete);
		});
	}

	editRevenue(id) {
		this.router.navigate(['edit', id], { relativeTo: this.activatedRoute });
	}

	viewRevenue(id) {
		this.router.navigate(['view', id], { relativeTo: this.activatedRoute });
	}

  	ngOnDestroy() {
		this.subscriptions.forEach(sb => sb.unsubscribe());
	}


}
