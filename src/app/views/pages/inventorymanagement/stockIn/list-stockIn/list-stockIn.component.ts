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
import { StockInModel } from '../../../../../core/inventorymanagement/stockIn/stockIn.model';
import { StockInPageRequested } from '../../../../../core/inventorymanagement/stockIn/stockIn.action';
import { StockInDataSource } from '../../../../../core/inventorymanagement/stockIn/stockIn.datasource';
import { StockInService } from '../../../../../core/inventorymanagement/stockIn/stockIn.service';
import { QueryStockInModel } from '../../../../../core/inventorymanagement/stockIn/querystockIn.model';

@Component({
	selector: 'kt-list-stockIn',
	templateUrl: './list-stockIn.component.html',
	styleUrls: ['./list-stockIn.component.scss']
})

export class ListStockInComponent implements OnInit, OnDestroy {
	file;
	dataSource: StockInDataSource;
	displayedColumns = [
	'date',
	'trNo',
	'product_name',
	'stock_in',
	'PO Receipt',
	'status',
	'createdDate',
	'actions'];
	@ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
	@ViewChild('sort1', { static: true }) sort: MatSort;
	@ViewChild('searchInput', { static: true }) searchInput: ElementRef;
	lastQuery: QueryParamsModel;
	selection = new SelectionModel<StockInModel>(true, []);
	stockInResult: StockInModel[] = [];
	private subscriptions: Subscription[] = [];
	constructor(
		private activatedRoute: ActivatedRoute,
		private store: Store<AppState>,
		private router: Router,
		private service: StockInService,
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
				this.loadStockInList();
			})
		)
		.subscribe();
		this.subscriptions.push(paginatorSubscriptions);
		const searchSubscription = fromEvent(this.searchInput.nativeElement, 'keyup').pipe(
			debounceTime(500), 
			distinctUntilChanged(),
			tap(() => {
				this.paginator.pageIndex = 0;
				this.loadStockInList();
			})
		).subscribe();
		this.subscriptions.push(searchSubscription);
		this.subheaderService.setTitle('Stock In');
		this.dataSource = new StockInDataSource(this.store);
		const entitiesSubscription = this.dataSource.entitySubject.pipe(
			skip(1),
			distinctUntilChanged()
		).subscribe(
			res => {
			this.stockInResult = res;
			}, 
			err => {
			alert('error');		
		}
		);
		this.subscriptions.push(entitiesSubscription);
		this.loadStockInList();
	}

	filterConfiguration(): any {
		const search: string = this.searchInput.nativeElement.value.toLowerCase();
		return search;
	}

	loadStockInList() {
		this.selection.clear();
		const queryParams = new QueryStockInModel(
			this.filterConfiguration(),
			this.paginator.pageIndex + 1,
			this.paginator.pageSize
		);
		this.store.dispatch(new StockInPageRequested({ page: queryParams }));
		this.selection.clear();
	}

	deleteStockIn(_item: StockInModel) {
		const _title = 'Stock In Delete';
		const _description = 'Are you sure to permanently delete this product ?';
		const _waitDesciption = 'Stock In is deleting...';
		const _deleteMessage = `Stock In has been deleted`;
		const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				return;
			}
			const deleteFlag = this.service.deleteFlagStockIn(_item).subscribe()
			this.subscriptions.push(deleteFlag);
			this.layoutUtilsService.showActionNotification(_deleteMessage, MessageType.Delete);
			this.loadStockInList();
		});
	}

	editStockIn(id) {
		this.router.navigate(['edit', id], { relativeTo: this.activatedRoute });
	}
	ngOnDestroy() {
		this.subscriptions.forEach(sb => sb.unsubscribe());
	}


	export() {
		this.service.exportExcel();
	}
}
