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

// Services
import { LayoutUtilsService, MessageType, QueryParamsModel } from '../../../../core/_base/crud';

import { BuildingModel} from '../../../../core/building/building.model';
import { BuildingDataSource } from '../../../../core/building/building.datasource';
import { BuildingDeleted, BuildingPageRequested} from '../../../../core/building/building.action';
import { selectBuildingById, } from '../../../../core/building/building.selector';
import { SubheaderService } from '../../../../core/_base/layout';
import {QueryBuildingModel} from '../../../../core/building/querybuilding.model';
import {BlockService} from '../../../../core/block/block.service';
import {BlockModel} from '../../../../core/block/block.model';
import {BlockDataSource} from '../../../../core/block/block.datasource';
import {QueryBlockModel} from '../../../../core/block/queryblock.model';
import {BlockDeleted, BlockPageRequested} from '../../../../core/block/block.action';

@Component({
  selector: 'kt-list-building',
  templateUrl: './list-building.component.html'
})
export class ListBuildingComponent implements OnInit, OnDestroy {
	dataSource: BuildingDataSource;
	displayedColumns = ['select', 'buildingname', 'buildingaddress', 'buildingblock', 'actions'];
	@ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
	@ViewChild('sort1', {static: true}) sort: MatSort;
	// Filter fields
	@ViewChild('searchInput', {static: true}) searchInput: ElementRef;
	lastQuery: QueryBuildingModel;
	// Selection
	selection = new SelectionModel<BuildingModel>(true, []);
	buildingResult: BuildingModel[] = [];
	blkRes: BlockModel;

	// Subscriptions
	private subscriptions: Subscription[] = [];
	constructor(
		private activatedRoute: ActivatedRoute,
		private store: Store<AppState>,
		private router: Router,
		private service: BlockService,
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
				this.loadBuildingList();
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
				this.loadBuildingList();
			})
		).subscribe();
		this.subscriptions.push(searchSubscription);

		// Set title to page breadCrumbs
		this.subheaderService.setTitle('User management');

		// Init DataSource
		this.dataSource = new BuildingDataSource(this.store);
		const entitiesSubscription = this.dataSource.entitySubject.pipe(
			skip(1),
			distinctUntilChanged()
		).subscribe(res => {
			this.buildingResult = res;
		});
		this.subscriptions.push(entitiesSubscription);

		// First Load
		of(undefined).pipe(take(1), delay(1000)).subscribe(() => { // Remove this line, just loading imitation
			this.loadBuildingList();
		});
		this.loadBuildingList();
	}
	loadBuildingList() {
		this.selection.clear();
		const queryParams = new QueryBuildingModel(
			this.filterConfiguration(),
			this.sort.direction,
			this.sort.active,
			this.paginator.pageIndex+1,
			this.paginator.pageSize
		);
		this.store.dispatch(new BuildingPageRequested({ page: queryParams }));
		this.selection.clear();
	}
	/** FILTRATION */
	filterConfiguration(): any {
		const filter: any = {};
		const searchText: string = this.searchInput.nativeElement.value;

		filter.nmbld = searchText;
		filter.grpid = searchText;

		return filter;
	}

	deleteBuilding(_item: BuildingModel) {
		// tslint:disable-next-line:variable-name
		const _title = 'Building Delete';
		// tslint:disable-next-line:variable-name
		const _description = 'Are you sure to permanently delete this building?';
		const _waitDesciption = 'Building is deleting...';
		const _deleteMessage = `Building has been deleted`;

		const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				return;
			}

			this.store.dispatch(new BuildingDeleted({ id: _item._id }));
			this.layoutUtilsService.showActionNotification(_deleteMessage, MessageType.Delete);
		});
	}
	fetchBlock() {
		const messages = [];
		this.selection.selected.forEach(elem => {
			messages.push({
				text: `${elem.nmbld}, ${elem.addrbld} , Part of ${elem.blk.nmblk}`,
				id: elem._id.toString(),
				status: elem.nmbld
			});
		});
		this.layoutUtilsService.fetchElements(messages);
	}
	isAllSelected(): boolean {
		const numSelected = this.selection.selected.length;
		const numRows = this.buildingResult.length;
		return numSelected === numRows;
	}

	masterToggle() {
		if (this.selection.selected.length === this.buildingResult.length) {
			this.selection.clear();
		} else {
			this.buildingResult.forEach(row => this.selection.select(row));
		}
	}

	editBuilding(id) {
		this.router.navigate(['edit', id], { relativeTo: this.activatedRoute });
	}
	ngOnDestroy() {
		this.subscriptions.forEach(sb => sb.unsubscribe());
	}

}
