import {Component, OnDestroy, OnInit, ViewChild, ElementRef, ChangeDetectorRef} from '@angular/core';
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
import {Store, select, createFeatureSelector} from '@ngrx/store';
import { AppState } from '../../../../../core/reducers';

// Services
import { LayoutUtilsService, MessageType, QueryParamsModel } from '../../../../../core/_base/crud';
import {WaterRateDataSource} from '../../../../../core/water/rate/rate.datasource';
import {QueryWaterRateModel} from '../../../../../core/water/rate/queryrate.model';
import {WaterRateModel} from '../../../../../core/water/rate/rate.model';
import {SubheaderService} from '../../../../../core/_base/layout';
import {WaterRateService} from '../../../../../core/water/rate/rate.service';
import {WaterRateDeleted, WaterRatePageRequested} from "../../../../../core/water/rate/rate.action";

@Component({
  selector: 'kt-list-rate',
  templateUrl: './list-rate.component.html',
  styleUrls: ['./list-rate.component.scss']
})
export class ListRateComponent implements OnInit, OnDestroy {
	data = localStorage.getItem("currentUser");
	dataUser = JSON.parse(this.data)
	role = this.dataUser.role
	dataSource: WaterRateDataSource;
	displayedColumns = ['nmrtewtr', 'rte','pemeliharaan', 'administrasi', 'actions'];
	@ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
	@ViewChild('sort1', {static: true}) sort: MatSort;
	// Filter fields
	@ViewChild('searchInput', {static: true}) searchInput: ElementRef;
	lastQuery: QueryWaterRateModel;
	// Selection
	selection = new SelectionModel<WaterRateModel>(true, []);
	waterRateResult: WaterRateModel[] = [];
	// Subscriptions
	private subscriptions: Subscription[] = [];

	constructor(
		private activatedRoute: ActivatedRoute,
		private store: Store<AppState>,
		private router: Router,
		private service: WaterRateService,
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
				this.loadWaterRateList();
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
				this.loadWaterRateList();
			})
		).subscribe();
		this.subscriptions.push(searchSubscription);

		// Set title to page breadCrumbs
		this.subheaderService.setTitle('Water Rate');

		// Init DataSource
		this.dataSource = new WaterRateDataSource(this.store);
		const entitiesSubscription = this.dataSource.entitySubject.pipe(
			skip(1),
			distinctUntilChanged()
		).subscribe(res => {
			this.waterRateResult = res;
		});
		this.subscriptions.push(entitiesSubscription);

		// First Load
		of(undefined).pipe(take(1), delay(1000)).subscribe(() => { // Remove this line, just loading imitation
			this.loadWaterRateList();
		});
		this.loadWaterRateList();
	}
	filterConfiguration(): any {
		const filter: any = {};
		const searchText: string = this.searchInput.nativeElement.value.toLowerCase();

		filter.nmrtewtr = `${searchText}`;
		return filter;
	}
	loadWaterRateList() {
		this.selection.clear();
		const queryParams = new QueryWaterRateModel(
			this.filterConfiguration(),
			this.sort.direction,
			this.sort.active,
			this.paginator.pageIndex+1,
			this.paginator.pageSize
		);
		this.store.dispatch(new WaterRatePageRequested({ page: queryParams }));
		this.selection.clear();
	}
	deleteWaterRate(_item: WaterRateModel) {
		// tslint:disable-next-line:variable-name
		const _title = 'Water Rate Delete';
		// tslint:disable-next-line:variable-name
		const _description = 'Are you sure to permanently delete this water rate?';
		const _waitDesciption = 'Water rate is deleting...';
		const _deleteMessage = `Water rate has been deleted`;

		const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				return;
			}

			this.store.dispatch(new WaterRateDeleted({ id: _item._id }));
			this.layoutUtilsService.showActionNotification(_deleteMessage, MessageType.Delete);
		});
	}
	fetchWaterRate() {
		const messages = [];
		this.selection.selected.forEach(elem => {
			messages.push({
				text: `${elem.nmrtewtr} , Rate: Rp. ${elem.rte}`,
				id: elem._id.toString(),
				status: elem.nmrtewtr
			});
		});
		this.layoutUtilsService.fetchElements(messages);
	}
	isAllSelected(): boolean {
		const numSelected = this.selection.selected.length;
		const numRows = this.waterRateResult.length;
		return numSelected === numRows;
	}

	masterToggle() {
		if (this.selection.selected.length === this.waterRateResult.length) {
			this.selection.clear();
		} else {
			this.waterRateResult.forEach(row => this.selection.select(row));
		}
	}

	editWaterRate(id) {
		this.router.navigate(['edit', id], { relativeTo: this.activatedRoute });
	}
	viewWaterRate(id) {
		this.router.navigate(['view', id], { relativeTo: this.activatedRoute });
	}
	ngOnDestroy(){
		this.subscriptions.forEach(sb => sb.unsubscribe());
	}

}
