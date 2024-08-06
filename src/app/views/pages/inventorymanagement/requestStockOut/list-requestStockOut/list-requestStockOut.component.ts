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
import { RequestStockOutModel } from '../../../../../core/inventorymanagement/requestStockOut/requestStockOut.model';
import { RequestStockOutPageRequested } from '../../../../../core/inventorymanagement/requestStockOut/requestStockOut.action';
import { RequestStockOutDataSource } from '../../../../../core/inventorymanagement/requestStockOut/requestStockOut.datasource';
import { RequestStockOutService } from '../../../../../core/inventorymanagement/requestStockOut/requestStockOut.service';
import { QueryRequestStockOutModel } from '../../../../../core/inventorymanagement/requestStockOut/queryrequestStockOut.model';

@Component({
	selector: 'kt-list-requestStockOut',
	templateUrl: './list-requestStockOut.component.html',
	styleUrls: ['./list-requestStockOut.component.scss']
})

export class ListRequestStockOutComponent implements OnInit, OnDestroy {
	file;
	dataSource: RequestStockOutDataSource;
	displayedColumns = [
	'rsoNo',
	'product',
	'qtyRequest',
	'approve',
	'status',
	'created_by',
	'actions'];
	@ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
	@ViewChild('sort1', { static: true }) sort: MatSort;
	@ViewChild('searchInput', { static: true }) searchInput: ElementRef;
	lastQuery: QueryParamsModel;
	selection = new SelectionModel<RequestStockOutModel>(true, []);
	requestStockOutResult: RequestStockOutModel[] = [];
	private subscriptions: Subscription[] = [];
	constructor(
		private activatedRoute: ActivatedRoute,
		private store: Store<AppState>,
		private router: Router,
		private service: RequestStockOutService,
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
				this.loadRequestStockOutList();
			})
		)
		.subscribe();
		this.subscriptions.push(paginatorSubscriptions);
		const searchSubscription = fromEvent(this.searchInput.nativeElement, 'keyup').pipe(
			debounceTime(500),
			distinctUntilChanged(),
			tap(() => {
				this.paginator.pageIndex = 0;
				this.loadRequestStockOutList();
			})
		).subscribe();
		this.subscriptions.push(searchSubscription);
		this.subheaderService.setTitle('Request Stock Out');
		this.dataSource = new RequestStockOutDataSource(this.store);
		const entitiesSubscription = this.dataSource.entitySubject.pipe(
			skip(1),
			distinctUntilChanged()
		).subscribe(
			res => {
			this.requestStockOutResult = res;
			},
			err => {
			alert('error');
		}
		);
		this.subscriptions.push(entitiesSubscription);
		this.loadRequestStockOutList();
	}

	filterConfiguration(): any {
		const search: string = this.searchInput.nativeElement.value.toLowerCase();
		return search;
	}

	loadRequestStockOutList() {
		this.selection.clear();
		const queryParams = new QueryRequestStockOutModel(
			this.filterConfiguration(),
			this.paginator.pageIndex + 1,
			this.paginator.pageSize
		);
		this.store.dispatch(new RequestStockOutPageRequested({ page: queryParams }));
		this.selection.clear();
	}

	deleteRequestStockOut(_item: RequestStockOutModel) {
		const _title = 'Product Delete';
		const _description = 'Are you sure to permanently delete this product ?';
		const _waitDesciption = 'Product is deleting...';
		const _deleteMessage = `Product has been deleted`;
		const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				return;
			}
			const deleteFlag = this.service.deleteFlagRequestStockOut(_item).subscribe()
			this.subscriptions.push(deleteFlag);
			this.layoutUtilsService.showActionNotification(_deleteMessage, MessageType.Delete);
			this.loadRequestStockOutList();
		});
	}

	editRequestStockOut(id) {
		this.router.navigate(['edit', id], { relativeTo: this.activatedRoute });
	}
	ngOnDestroy() {
		this.subscriptions.forEach(sb => sb.unsubscribe());
	}

	export() {
		this.service.exportExcel();
	}
}
