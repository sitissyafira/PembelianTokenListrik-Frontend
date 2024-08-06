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
import { AppState } from '../../../../../../core/reducers';

//services
import { LayoutUtilsService, MessageType, QueryParamsModel } from '../../../../../../core/_base/crud';

import { FixedModel } from '../../../../../../core/masterData/asset/fixed/fixed.model';
import { FixedDeleted, FixedPageRequested} from '../../../../../../core/masterData/asset/fixed/fixed.action';
import {FixedDataSource} from '../../../../../../core/masterData/asset/fixed/fixed.datasource';
import {SubheaderService} from '../../../../../../core/_base/layout';
import {FixedService} from '../../../../../../core/masterData/asset/fixed/fixed.service';
import { HttpClient } from '@angular/common/http';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { QueryFixedModel } from '../../../../../../core/masterData/asset/fixed/queryfixed.model';

@Component({
  selector: 'kt-list-fixed',
  templateUrl: './list-fixed.component.html',
  styleUrls: ['./list-fixed.component.scss']
})
export class ListFixedComponent implements OnInit, OnDestroy {
	file;
	dataSource: FixedDataSource;
	displayedColumns = [ 'fiscalFixedType', 'fixedAssetTypeName', 'actions'];
	@ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
	@ViewChild('sort1', {static: true}) sort: MatSort;
	// Filter fields
	@ViewChild('searchInput', {static: true}) searchInput: ElementRef;
	lastQuery: QueryParamsModel;
	// Selection
	selection = new SelectionModel<FixedModel>(true, []);
	fixedResult: FixedModel[] = [];
	data = localStorage.getItem("currentUser");
	dataUser = JSON.parse(this.data)
	role = this.dataUser.role
	// Subscriptions
	private subscriptions: Subscription[] = [];
  	constructor(
		private activatedRoute: ActivatedRoute,
		private store: Store<AppState>,
		private router: Router,
		private service: FixedService,
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
				this.loadFixedList();
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
				this.loadFixedList();
			})
		).subscribe();
		this.subscriptions.push(searchSubscription);

		// Set title to page breadCrumbs
		this.subheaderService.setTitle('Fixed Asset');

		// Init DataSource
		this.dataSource = new FixedDataSource(this.store);
		const entitiesSubscription = this.dataSource.entitySubject.pipe(
			skip(1),
			distinctUntilChanged()
		).subscribe(res => {
			this.fixedResult = res;
		});
		this.subscriptions.push(entitiesSubscription);

		// First Load
		this.loadFixedList();
  	}

	filterConfiguration(): any {
		const filter: any = {};
		const searchText: string = this.searchInput.nativeElement.value.toLowerCase();

		filter.fixedAssetTypeName = `${searchText}`;
		return filter;
	}

	loadFixedList(){
		this.selection.clear();
		const queryParams = new QueryFixedModel(
			this.filterConfiguration(),
			this.sort.direction,
			this.sort.active,
			this.paginator.pageIndex+1,
			this.paginator.pageSize
		);
		this.store.dispatch(new FixedPageRequested({ page: queryParams }));
		this.selection.clear();
	}

	deleteFixed(_item: FixedModel) {
		// tslint:disable-next-line:variable-name
		const _title = 'Fixed Delete';
		// tslint:disable-next-line:variable-name
		const _description = 'Are you sure to permanently delete this fixed?';
		const _waitDesciption = 'Fixed is deleting...';
		const _deleteMessage = `Fixed has been deleted`;

		const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				return;
			}

			this.store.dispatch(new FixedDeleted({ id: _item._id }));
			this.layoutUtilsService.showActionNotification(_deleteMessage, MessageType.Delete);
		});
	}

	isAllSelected(): boolean {
		const numSelected = this.selection.selected.length;
		const numRows = this.fixedResult.length;
		return numSelected === numRows;
	}

	masterToggle() {
		if (this.selection.selected.length === this.fixedResult.length) {
			this.selection.clear();
		} else {
			this.fixedResult.forEach(row => this.selection.select(row));
		}
	}

	editFixed(id) {
		this.router.navigate(['edit', id], { relativeTo: this.activatedRoute });
	}

	viewFixed(id) {
		this.router.navigate(['view', id], { relativeTo: this.activatedRoute });
	}
	
  	ngOnDestroy() {
		this.subscriptions.forEach(sb => sb.unsubscribe());
	}


	export(){
		this.service.exportExcel();
	}

}
