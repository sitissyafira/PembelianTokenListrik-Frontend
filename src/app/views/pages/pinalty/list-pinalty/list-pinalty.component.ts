
import { Component, OnInit, ElementRef, ViewChild, ChangeDetectionStrategy, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SelectionModel } from '@angular/cdk/collections';
import { MatPaginator, MatSort, MatSnackBar } from '@angular/material';
import { debounceTime, distinctUntilChanged, tap, skip, take, delay } from 'rxjs/operators';
import { fromEvent, merge, Observable, of, Subscription } from 'rxjs';
import { Store, select } from '@ngrx/store';
import { AppState } from '../../../../core/reducers';
import { LayoutUtilsService, MessageType, QueryParamsModel } from '../../../../core/_base/crud';

import { PinaltyModel } from '../../../../core/pinalty/pinalty.model';
import { PinaltyDeleted, PinaltyPageRequested} from '../../../../core/pinalty/pinalty.action';
import {PinaltyDataSource} from '../../../../core/pinalty/pinalty.datasource';
import {SubheaderService} from '../../../../core/_base/layout';
import {PinaltyService} from '../../../../core/pinalty/pinalty.service';
import { HttpClient } from '@angular/common/http';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
	selector: 'kt-list-pinalty',
	templateUrl: './list-pinalty.component.html',
	styleUrls: ['./list-pinalty.component.scss']
})
export class ListPinaltyComponent implements OnInit, OnDestroy {
	data = localStorage.getItem("currentUser");
	dataUser = JSON.parse(this.data)
	role = this.dataUser.role
	file;
	dataSource: PinaltyDataSource;
	displayedColumns = ['billing', 'unit2','bill fee', 'days', 'totalDenda','actions'];
	@ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
	@ViewChild('sort1', {static: true}) sort: MatSort;
	@ViewChild('searchInput', {static: true}) searchInput: ElementRef;
	lastQuery: QueryParamsModel;
	selection = new SelectionModel<PinaltyModel>(true, []);
	pinaltyResult: PinaltyModel[] = [];
	private subscriptions: Subscription[] = [];
	constructor(
		private activatedRoute: ActivatedRoute,
		private store: Store<AppState>,
		private router: Router,
		private service: PinaltyService,
		private layoutUtilsService: LayoutUtilsService,
		private subheaderService: SubheaderService,
		private cdr: ChangeDetectorRef,
		private http : HttpClient,
		private modalService: NgbModal,
	) { }

	ngOnInit() {
		const sortSubscription = this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0));
		this.subscriptions.push(sortSubscription);
		const paginatorSubscriptions = merge(this.sort.sortChange, this.paginator.page).pipe(
			tap(() => {
				this.loadPinaltyList();
			})
		)
			.subscribe();
		this.subscriptions.push(paginatorSubscriptions);
		const searchSubscription = fromEvent(this.searchInput.nativeElement, 'keyup').pipe(
			
			debounceTime(500), 
			distinctUntilChanged(), 
			tap(() => {
				this.paginator.pageIndex = 0;
				this.loadPinaltyList();
			})
		).subscribe();
		this.subscriptions.push(searchSubscription);

		this.subheaderService.setTitle('Penalty');
		this.dataSource = new PinaltyDataSource(this.store);
		const entitiesSubscription = this.dataSource.entitySubject.pipe(
			skip(1),
			distinctUntilChanged()
		).subscribe(res => {
			this.pinaltyResult = res;
		});
		this.subscriptions.push(entitiesSubscription);
		this.loadPinaltyList();
	}
	
	filterConfiguration(): any {
		const filter: any = {};
		const searchText: string = this.searchInput.nativeElement.value.toLowerCase();

		filter.unit2 = `${searchText}`;
		return filter;
	}

	loadPinaltyList(){
		this.selection.clear();
		const queryParams = new QueryParamsModel(
			this.filterConfiguration(),
			this.sort.direction,
			this.sort.active,
			this.paginator.pageIndex+1,
			this.paginator.pageSize
		);
		this.store.dispatch(new PinaltyPageRequested({ page: queryParams }));
		this.selection.clear();
	}

	deletePinalty(_item: PinaltyModel) {
		const _title = 'Pinalty Delete';
		const _description = 'Are you sure to permanently delete this unit rate?';
		const _waitDesciption = 'Pinalty is deleting...';
		const _deleteMessage = `Pinalty has been deleted`;

		const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				return;
			}

			this.store.dispatch(new PinaltyDeleted({ id: _item._id }));
			this.layoutUtilsService.showActionNotification(_deleteMessage, MessageType.Delete);
		});
	}

	
	isAllSelected(): boolean {
		const numSelected = this.selection.selected.length;
		const numRows = this.pinaltyResult.length;
		return numSelected === numRows;
	}

	masterToggle() {
		if (this.selection.selected.length === this.pinaltyResult.length) {
			this.selection.clear();
		} else {
			this.pinaltyResult.forEach(row => this.selection.select(row));
		}
	}

	export(){
		this.service.exportExcel();
	}

	editPinalty(id) {
		this.router.navigate(['edit', id], { relativeTo: this.activatedRoute });
	}

	viewPinalty(id) {
		this.router.navigate(['view', id], { relativeTo: this.activatedRoute });
	}

	ngOnDestroy() {
		this.subscriptions.forEach(sb => sb.unsubscribe());
	}

}
