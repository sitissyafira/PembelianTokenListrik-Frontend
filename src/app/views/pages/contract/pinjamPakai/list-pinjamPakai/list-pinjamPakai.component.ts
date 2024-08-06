import { Component, OnInit, ElementRef, ViewChild, ChangeDetectionStrategy, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SelectionModel } from '@angular/cdk/collections';
import { MatPaginator, MatSort, MatSnackBar } from '@angular/material';
import { debounceTime, distinctUntilChanged, tap, skip, take, delay } from 'rxjs/operators';
import { fromEvent, merge, Observable, of, Subscription } from 'rxjs';
import { Store} from '@ngrx/store';
import { AppState } from '../../../../../core/reducers';
import { LayoutUtilsService, MessageType, QueryParamsModel } from '../../../../../core/_base/crud';

import {SubheaderService} from '../../../../../core/_base/layout';
import { HttpClient } from '@angular/common/http';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { PinjamPakaiDataSource } from '../../../../../core/contract/pinjamPakai/pinjamPakai.datasource';
import { PinjamPakaiModel } from '../../../../../core/contract/pinjamPakai/pinjamPakai.model';
import { PinjamPakaiService } from '../../../../../core/contract/pinjamPakai/pinjamPakai.service';
import { QueryPinjamPakaiModel } from '../../../../../core/contract/pinjamPakai/querypinjamPakai.model';
import { PinjamPakaiDeleted, PinjamPakaiPageRequested } from '../../../../../core/contract/pinjamPakai/pinjamPakai.action';
import { environment } from '../../../../../../environments/environment';

@Component({
  selector: 'kt-list-pinjamPakai',
  templateUrl: './list-pinjamPakai.component.html',
  styleUrls: ['./list-pinjamPakai.component.scss']
})
export class ListPinjamPakaiComponent implements OnInit, OnDestroy {
	file;
	dataSource: PinjamPakaiDataSource;
	displayedColumns = [ 
	 'unit', 'tenantName', 'isPaid', 'createdDate', 'paidDate','actions'];
	@ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
	@ViewChild('sort1', {static: true}) sort: MatSort;
	@ViewChild('searchInput', {static: true}) searchInput: ElementRef;
	lastQuery: QueryParamsModel;
	selection = new SelectionModel<PinjamPakaiModel>(true, []);
	pinjamPakaiResult: PinjamPakaiModel[] = [];
	data = localStorage.getItem("currentUser");
	dataUser = JSON.parse(this.data)
	role = this.dataUser.role
	private subscriptions: Subscription[] = [];
  	constructor(
		private activatedRoute: ActivatedRoute,
		private store: Store<AppState>,
		private router: Router,
		private service: PinjamPakaiService,
		private layoutUtilsService: LayoutUtilsService,
		private subheaderService: SubheaderService,
		private cdr: ChangeDetectorRef,
		private http : HttpClient,
		private modalService : NgbModal
	) { }

  	ngOnInit() {
		const sortSubscription = this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0));
		this.subscriptions.push(sortSubscription);
		const paginatorSubscriptions = merge(this.sort.sortChange, this.paginator.page).pipe(
			tap(() => {
				this.loadPinjamPakaiList();
			})
		)
			.subscribe();
		this.subscriptions.push(paginatorSubscriptions);
		const searchSubscription = fromEvent(this.searchInput.nativeElement, 'keyup').pipe(
			debounceTime(50), 
			distinctUntilChanged(), 
			tap(() => {
				this.paginator.pageIndex = 0;
				this.loadPinjamPakaiList();
			})
		).subscribe();
		this.subscriptions.push(searchSubscription);
		this.subheaderService.setTitle('Lease Contract');
		this.dataSource = new PinjamPakaiDataSource(this.store);
		const entitiesSubscription = this.dataSource.entitySubject.pipe(
			skip(1),
			distinctUntilChanged()
		).subscribe(res => {
			this.pinjamPakaiResult = res;
		});
		this.subscriptions.push(entitiesSubscription);
		this.loadPinjamPakaiList();
  	}

	filterConfiguration(): any {
		const filter: any = {};
		const searchText: string = this.searchInput.nativeElement.value.toLowerCase();

		filter.unit2 = `${searchText}`;
		return filter;
	}

	loadPinjamPakaiList(){
		this.selection.clear();
		const queryParams = new QueryPinjamPakaiModel(
			this.filterConfiguration(),
			this.sort.direction,
			this.sort.active,
			this.paginator.pageIndex+1,
			this.paginator.pageSize
		);
		this.store.dispatch(new PinjamPakaiPageRequested({ page: queryParams }));
		this.selection.clear();
	}

	deletePinjamPakai(_item: PinjamPakaiModel) {
		const _title = 'PinjamPakai Delete';
		const _description = 'Are you sure to permanently delete this pinjamPakai?';
		const _waitDesciption = 'PinjamPakai is deleting...';
		const _deleteMessage = `PinjamPakai has been deleted`;

		const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				return;
			}

			this.store.dispatch(new PinjamPakaiDeleted({ id: _item._id }));
			this.layoutUtilsService.showActionNotification(_deleteMessage, MessageType.Delete);
		});
	}

	isAllSelected(): boolean {
		const numSelected = this.selection.selected.length;
		const numRows = this.pinjamPakaiResult.length;
		return numSelected === numRows;
	}

	masterToggle() {
		if (this.selection.selected.length === this.pinjamPakaiResult.length) {
			this.selection.clear();
		} else {
			this.pinjamPakaiResult.forEach(row => this.selection.select(row));
		}
	}

	editPinjamPakai(id) {
		this.router.navigate(['edit', id], { relativeTo: this.activatedRoute });
	}

	viewPinjamPakai(id) {
		this.router.navigate(['view', id], { relativeTo: this.activatedRoute });
	}
  	ngOnDestroy() {
		this.subscriptions.forEach(sb => sb.unsubscribe());
	}


	export(){
		this.service.exportExcel();
	}
}
