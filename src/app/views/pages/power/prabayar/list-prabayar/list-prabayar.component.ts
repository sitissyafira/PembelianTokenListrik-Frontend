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
import { PowerPrabayarDataSource } from '../../../../../core/power/prabayar/prabayar.datasource';
import { QueryPowerPrabayarModel } from '../../../../../core/power/prabayar/queryprabayar.model';
import { PowerPrabayarModel } from '../../../../../core/power/prabayar/prabayar.model';
import { SubheaderService } from '../../../../../core/_base/layout';
import { PowerPrabayarService } from '../../../../../core/power/prabayar/prabayar.service';
import { PowerPrabayarDeleted, PowerPrabayarPageRequested } from "../../../../../core/power/prabayar/prabayar.action";

@Component({
	selector: 'kt-list-prabayar',
	templateUrl: './list-prabayar.component.html',
	styleUrls: ['./list-prabayar.component.scss']
})
export class ListPrabayarComponent implements OnInit, OnDestroy {
	data = localStorage.getItem("currentUser");
	dataUser = JSON.parse(this.data)
	role = this.dataUser.role
	dataSource: PowerPrabayarDataSource;
	displayedColumns = ['name', 'rate', 'adminRate', 'status', 'actions'];
	@ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
	@ViewChild('sort1', { static: true }) sort: MatSort;
	// Filter fields
	@ViewChild('searchInput', { static: true }) searchInput: ElementRef;
	lastQuery: QueryPowerPrabayarModel;
	// Selection
	selection = new SelectionModel<PowerPrabayarModel>(true, []);
	powerPrabayarResult: PowerPrabayarModel[] = [];
	// Subscriptions
	private subscriptions: Subscription[] = [];

	constructor(
		private activatedRoute: ActivatedRoute,
		private store: Store<AppState>,
		private router: Router,
		private service: PowerPrabayarService,
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
				this.loadPowerPrabayarList();
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
				this.loadPowerPrabayarList();
			})
		).subscribe();
		this.subscriptions.push(searchSubscription);

		// Set title to page breadCrumbs
		this.subheaderService.setTitle('Rate Prabayar');

		// Init DataSource
		this.dataSource = new PowerPrabayarDataSource(this.store);
		const entitiesSubscription = this.dataSource.entitySubject.pipe(
			skip(1),
			distinctUntilChanged()
		).subscribe(res => {
			this.powerPrabayarResult = res;
			console.log(res);

		});
		this.subscriptions.push(entitiesSubscription);

		// First Load
		// of(undefined).pipe(take(1), delay(1000)).subscribe(() => { // Remove this line, just loading imitation
		// 	this.loadPowerPrabayarList();
		// });
		this.loadPowerPrabayarList();
	}

	_getPaymentClass(status: string) {
		return {
			'chip': true,
			"chip--success": status === "active" ? true : false,
			"chip--danger": status === "no active" ? true : false,
		};
	}

	filterConfiguration(): any {
		const filter: any = {};
		const searchText: string = this.searchInput.nativeElement.value;

		filter.name = `${searchText}`;
		return filter;
	}
	loadPowerPrabayarList() {
		this.selection.clear();
		const queryParams = new QueryPowerPrabayarModel(
			this.filterConfiguration(),
			this.sort.direction,
			this.sort.active,
			this.paginator.pageIndex + 1,
			this.paginator.pageSize
		);
		this.store.dispatch(new PowerPrabayarPageRequested({ page: queryParams }));
		this.selection.clear();
	}
	deletePowerPrabayar(_item: PowerPrabayarModel) {
		// tslint:disable-next-line:variable-name
		const _title = 'Electricity Prabayar Delete';
		// tslint:disable-next-line:variable-name
		const _description = 'Are you sure to permanently delete this electricity prabayar?';
		const _waitDesciption = 'Electricity prabayar is deleting...';
		const _deleteMessage = `Electricity prabayar has been deleted`;

		const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				return;
			}

			this.store.dispatch(new PowerPrabayarDeleted({ id: _item._id }));
			this.layoutUtilsService.showActionNotification(_deleteMessage, MessageType.Delete);
		});
	}

	editPowerPrabayar(id) {
		this.router.navigate(['edit', id], { relativeTo: this.activatedRoute });
	}

	viewPowerPrabayar(id) {
		this.router.navigate(['view', id], { relativeTo: this.activatedRoute });
	}
	ngOnDestroy() {
		this.subscriptions.forEach(sb => sb.unsubscribe());
	}

}
