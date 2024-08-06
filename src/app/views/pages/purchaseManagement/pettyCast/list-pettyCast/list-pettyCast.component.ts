import { Component, OnInit, ElementRef, ViewChild, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SelectionModel } from '@angular/cdk/collections';
import { MatPaginator, MatSort,} from '@angular/material';
import { debounceTime, distinctUntilChanged, tap, skip, } from 'rxjs/operators';
import { fromEvent, merge,Subscription } from 'rxjs';
import { Store,} from '@ngrx/store';
import { AppState } from '../../../../../core/reducers';
import { LayoutUtilsService, MessageType, QueryParamsModel } from '../../../../../core/_base/crud';
import { HttpClient } from '@angular/common/http';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { SubheaderService } from '../../../../../core/_base/layout';
import { PettyCastModel } from '../../../../../core/purchaseManagement/pettyCast/pettyCast.model';
import { PettyCastPageRequested } from '../../../../../core/purchaseManagement/pettyCast/pettyCast.action';
import { PettyCastDataSource } from '../../../../../core/purchaseManagement/pettyCast/pettyCast.datasource';
import { PettyCastService } from '../../../../../core/purchaseManagement/pettyCast/pettyCast.service';
import { QueryPettyCastModel } from '../../../../../core/purchaseManagement/pettyCast/querypettyCast.model';

@Component({
	selector: 'kt-list-pettyCast',
	templateUrl: './list-pettyCast.component.html',
	styleUrls: ['./list-pettyCast.component.scss']
})

export class ListPettyCastComponent implements OnInit, OnDestroy {
	file;
	dataSource: PettyCastDataSource;
	displayedColumns = [
	'pettyCashNo',
	// 'paidFrom',
	// 'glaccount',
	'memo',
	'created_date',
	'actions'];
	@ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
	@ViewChild('sort1', { static: true }) sort: MatSort;
	@ViewChild('searchInput', { static: true }) searchInput: ElementRef;
	lastQuery: QueryParamsModel;
	selection = new SelectionModel<PettyCastModel>(true, []);
	pettyCastResult: PettyCastModel[] = [];
	private subscriptions: Subscription[] = [];
	constructor(
		private activatedRoute: ActivatedRoute,
		private store: Store<AppState>,
		private router: Router,
		private service: PettyCastService,
		private layoutUtilsService: LayoutUtilsService,
		private subheaderService: SubheaderService,
		private cdr: ChangeDetectorRef,
		private http: HttpClient,
		private modalService: NgbModal
	) { }

	ngOnInit() {
		const sortSubscription = this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0));
		this.subscriptions.push(sortSubscription);
		const paginatorSubscriptions = merge(this.sort.sortChange, this.paginator.page).pipe(
			tap(() => {
				this.loadPettyCastList();
			})
		)
		.subscribe();
		this.subscriptions.push(paginatorSubscriptions);
		const searchSubscription = fromEvent(this.searchInput.nativeElement, 'keyup').pipe(
			debounceTime(500), 
			distinctUntilChanged(),
			tap(() => {
				this.paginator.pageIndex = 0;
				this.loadPettyCastList();
			})
		).subscribe();
		this.subscriptions.push(searchSubscription);
		this.subheaderService.setTitle('Petty Cash');
		this.dataSource = new PettyCastDataSource(this.store);
		const entitiesSubscription = this.dataSource.entitySubject.pipe(
			skip(1),
			distinctUntilChanged()
		).subscribe(
			res => {
			this.pettyCastResult = res;
			}, 
			err => {
			alert('error');		
		}
		);
		this.subscriptions.push(entitiesSubscription);
		this.loadPettyCastList();
	}

	filterConfiguration(): any {
		const search: string = this.searchInput.nativeElement.value.toLowerCase();
		return search;
	}

	loadPettyCastList() {
		this.selection.clear();
		const queryParams = new QueryPettyCastModel(
			this.filterConfiguration(),
			this.paginator.pageIndex + 1,
			this.paginator.pageSize
		);
		this.store.dispatch(new PettyCastPageRequested({ page: queryParams }));
		this.selection.clear();
	}

	deletePettyCast(_item: PettyCastModel) {
		const _title = 'Petty Cast Delete';
		const _description = 'Are you sure to permanently delete this petty cast ?';
		const _waitDesciption = 'Petty Cast is deleting...';
		const _deleteMessage = `Petty Cast has been deleted`;
		const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				return;
			}
			const deleteFlag = this.service.deleteFlagPettyCast(_item).subscribe()
			this.subscriptions.push(deleteFlag);
			this.layoutUtilsService.showActionNotification(_deleteMessage, MessageType.Delete);
			this.loadPettyCastList();
		});
	}

	
	editPettyCast(id) {
		this.router.navigate(['edit', id], { relativeTo: this.activatedRoute });
	}
	ngOnDestroy() {
		this.subscriptions.forEach(sb => sb.unsubscribe());
	}
	// export() {
	// 	this.service.exportExcel();
	// }
}
