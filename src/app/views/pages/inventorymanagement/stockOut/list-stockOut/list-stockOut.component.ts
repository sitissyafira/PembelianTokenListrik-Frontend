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
import { StockOutModel } from '../../../../../core/inventorymanagement/stockOut/stockOut.model';
import { StockOutPageRequested } from '../../../../../core/inventorymanagement/stockOut/stockOut.action';
import { StockOutDataSource } from '../../../../../core/inventorymanagement/stockOut/stockOut.datasource';
import { StockOutService } from '../../../../../core/inventorymanagement/stockOut/stockOut.service';
import { QueryStockOutModel } from '../../../../../core/inventorymanagement/stockOut/querystockOut.model';

@Component({
	selector: 'kt-list-stockOut',
	templateUrl: './list-stockOut.component.html',
	styleUrls: ['./list-stockOut.component.scss']
})

export class ListStockOutComponent implements OnInit, OnDestroy {
	file;
	dataSource: StockOutDataSource;
	displayedColumns = [
	'stockOutNo',
	'product_name',
	'stock_out',
	'created_date',
	'actions']
	@ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
	@ViewChild('sort1', { static: true }) sort: MatSort;
	@ViewChild('searchInput', { static: true }) searchInput: ElementRef;
	lastQuery: QueryParamsModel;
	selection = new SelectionModel<StockOutModel>(true, []);
	stockOutResult: StockOutModel[] = [];
	private subscriptions: Subscription[] = [];
	constructor(
		private activatedRoute: ActivatedRoute,
		private store: Store<AppState>,
		private router: Router,
		private service: StockOutService,
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
				this.loadStockOutList();
			})
		)
		.subscribe();
		this.subscriptions.push(paginatorSubscriptions);
		const searchSubscription = fromEvent(this.searchInput.nativeElement, 'keyup').pipe(
			debounceTime(500), 
			distinctUntilChanged(),
			tap(() => {
				this.paginator.pageIndex = 0;
				this.loadStockOutList();
			})
		).subscribe();
		this.subscriptions.push(searchSubscription);
		this.subheaderService.setTitle('Stock Out Product');
		this.dataSource = new StockOutDataSource(this.store);
		const entitiesSubscription = this.dataSource.entitySubject.pipe(
			skip(1),
			distinctUntilChanged()
		).subscribe(
			res => {
			this.stockOutResult = res;
			}, 
			err => {
			alert('error');		
		}
		);
		this.subscriptions.push(entitiesSubscription);
		this.loadStockOutList();
	}

	filterConfiguration(): any {
		const search: string = this.searchInput.nativeElement.value.toLowerCase();
		return search;
	}

	loadStockOutList() {
		this.selection.clear();
		const queryParams = new QueryStockOutModel(
			this.filterConfiguration(),
			this.paginator.pageIndex + 1,
			this.paginator.pageSize
		);
		this.store.dispatch(new StockOutPageRequested({ page: queryParams }));
		this.selection.clear();
	}

	deleteStockOut(_item: StockOutModel) {
		const _title = 'Product Delete';
		const _description = 'Are you sure to permanently delete this product ?';
		const _waitDesciption = 'Product is deleting...';
		const _deleteMessage = `Product has been deleted`;
		const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				return;
			}
			const deleteFlag = this.service.deleteFlagStockOut(_item).subscribe()
			this.subscriptions.push(deleteFlag);
			this.layoutUtilsService.showActionNotification(_deleteMessage, MessageType.Delete);
			this.loadStockOutList();
		});
	}

	view(id) {
		this.router.navigate(['view', id], { relativeTo: this.activatedRoute });
	}

	ngOnDestroy() {
		this.subscriptions.forEach(sb => sb.unsubscribe());
	}
	
	export() {
		this.service.exportExcel();
	}
}
