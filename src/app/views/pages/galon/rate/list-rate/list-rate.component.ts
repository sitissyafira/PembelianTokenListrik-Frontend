import { Component, OnInit, OnDestroy, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
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
import { Store, select, createFeatureSelector } from '@ngrx/store';
import { AppState } from '../../../../../core/reducers';

// Services
import { LayoutUtilsService, MessageType, QueryParamsModel } from '../../../../../core/_base/crud';
import { GalonRateDataSource } from '../../../../../core/galon/rate/rate.datasource';
import { QueryGalonRateModel } from '../../../../../core/galon/rate/queryrate.model';
import { GalonRateModel } from '../../../../../core/galon/rate/rate.model';
import { SubheaderService } from '../../../../../core/_base/layout';
import { GalonRateService } from '../../../../../core/galon/rate/rate.service';
import { GalonRateDeleted, GalonRatePageRequested } from "../../../../../core/galon/rate/rate.action";

@Component({
	selector: 'kt-list-rate',
	templateUrl: './list-rate.component.html',
	styleUrls: ['./list-rate.component.scss']
})
export class ListRateComponent implements OnInit, OnDestroy {
	data = localStorage.getItem("currentUser");
	dataUser = JSON.parse(this.data)
	role = this.dataUser.role
	dataSource: GalonRateDataSource;
	// displayedColumns = ['nmrtepow', 'rte', 'ppju', 'srvc', 'actions'];
	displayedColumns = ['nmrtepow', 'rte', 'actions'];
	@ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
	@ViewChild('sort1', { static: true }) sort: MatSort;
	// Filter fields
	@ViewChild('searchInput', { static: true }) searchInput: ElementRef;
	lastQuery: QueryGalonRateModel;
	// Selection
	selection = new SelectionModel<GalonRateModel>(true, []);
	galonRateResult: GalonRateModel[] = [];
	// Subscriptions
	private subscriptions: Subscription[] = [];

	constructor(
		private activatedRoute: ActivatedRoute,
		private store: Store<AppState>,
		private router: Router,
		private service: GalonRateService,
		private layoutUtilsService: LayoutUtilsService,
		private subheaderService: SubheaderService,
		private cdr: ChangeDetectorRef
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
				this.loadGalonRateList();
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
				this.loadGalonRateList();
			})
		).subscribe();
		this.subscriptions.push(searchSubscription);

		// Set title to page breadCrumbs
		this.subheaderService.setTitle('Galon Rate');

		// Init DataSource
		this.dataSource = new GalonRateDataSource(this.store);
		const entitiesSubscription = this.dataSource.entitySubject.pipe(
			skip(1),
			distinctUntilChanged()
		).subscribe(res => {
			this.galonRateResult = res;
		});
		this.subscriptions.push(entitiesSubscription);

		// First Load
		// of(undefined).pipe(take(1), delay(1000)).subscribe(() => { // Remove this line, just loading imitation
		// 	this.loadGalonRateList();
		// });
		this.loadGalonRateList();
	}
	filterConfiguration(): any {
		const filter: any = {};
		const searchText: string = this.searchInput.nativeElement.value;

		filter.nmrtepow = `${searchText}`;
		return filter;
	}
	loadGalonRateList() {
		this.selection.clear();
		const queryParams = new QueryGalonRateModel(
			this.filterConfiguration(),
			this.sort.direction,
			this.sort.active,
			this.paginator.pageIndex + 1,
			this.paginator.pageSize
		);
		this.store.dispatch(new GalonRatePageRequested({ page: queryParams }));
		this.selection.clear();
	}
	deleteGalonRate(_item: GalonRateModel) {
		// tslint:disable-next-line:variable-name
		const _title = 'Galon Rate Delete';
		// tslint:disable-next-line:variable-name
		const _description = 'Are you sure to permanently delete this electricity rate?';
		const _waitDesciption = 'Galon rate is deleting...';
		const _deleteMessage = `Galon rate has been deleted`;

		const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				return;
			}

			this.store.dispatch(new GalonRateDeleted({ id: _item._id }));
			this.layoutUtilsService.showActionNotification(_deleteMessage, MessageType.Delete);
		});
	}

	editGalonRate(id) {
		this.router.navigate(['edit', id], { relativeTo: this.activatedRoute });
	}

	viewGalonRate(id) {
		this.router.navigate(['view', id], { relativeTo: this.activatedRoute });
	}
	ngOnDestroy() {
		this.subscriptions.forEach(sb => sb.unsubscribe());
	}

}
