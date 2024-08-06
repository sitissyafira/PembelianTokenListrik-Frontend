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
import { ProductCategoryModel } from '../../../../../core/masterData/productCategory/productCategory.model';
import { ProductCategoryPageRequested } from '../../../../../core/masterData/productCategory/productCategory.action';
import { ProductCategoryDataSource } from '../../../../../core/masterData/productCategory/productCategory.datasource';
import { ProductCategoryService } from '../../../../../core/masterData/productCategory/productCategory.service';
import { QueryProductCategoryModel } from '../../../../../core/masterData/productCategory/queryproductCategory.model';

@Component({
	selector: 'kt-list-productCategory',
	templateUrl: './list-productCategory.component.html',
	styleUrls: ['./list-productCategory.component.scss']
})

export class ListProductCategoryComponent implements OnInit, OnDestroy {
	file;
	dataSource: ProductCategoryDataSource;
	displayedColumns = [
	'categoryCode',
	'categoryName',
	'actions'];
	@ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
	@ViewChild('sort1', { static: true }) sort: MatSort;
	@ViewChild('searchInput', { static: true }) searchInput: ElementRef;
	lastQuery: QueryParamsModel;
	selection = new SelectionModel<ProductCategoryModel>(true, []);
	productCategoryResult: ProductCategoryModel[] = [];
	private subscriptions: Subscription[] = [];
	constructor(
		private activatedRoute: ActivatedRoute,
		private store: Store<AppState>,
		private router: Router,
		private service: ProductCategoryService,
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
				this.loadProductCategoryList();
			})
		)
		.subscribe();
		this.subscriptions.push(paginatorSubscriptions);
		const searchSubscription = fromEvent(this.searchInput.nativeElement, 'keyup').pipe(
			debounceTime(500), 
			distinctUntilChanged(),
			tap(() => {
				this.paginator.pageIndex = 0;
				this.loadProductCategoryList();
			})
		).subscribe();
		this.subscriptions.push(searchSubscription);
		this.subheaderService.setTitle('Product Category');
		this.dataSource = new ProductCategoryDataSource(this.store);
		const entitiesSubscription = this.dataSource.entitySubject.pipe(
			skip(1),
			distinctUntilChanged()
		).subscribe(
			res => {
			this.productCategoryResult = res;
			}, 
			err => {
			alert('error');		
		}
		);
		this.subscriptions.push(entitiesSubscription);
		this.loadProductCategoryList();
	}

	filterConfiguration(): any {
		const search: string = this.searchInput.nativeElement.value.toLowerCase();
		return search;
	}

	loadProductCategoryList() {
		this.selection.clear();
		const queryParams = new QueryProductCategoryModel(
			this.filterConfiguration(),
			this.paginator.pageIndex + 1,
			this.paginator.pageSize
		);
		this.store.dispatch(new ProductCategoryPageRequested({ page: queryParams }));
		this.selection.clear();
	}

	deleteProductCategory(_item: ProductCategoryModel) {
		const _title = 'Product Category Delete';
		const _description = 'Are you sure to permanently delete this product category?';
		const _waitDesciption = 'Product category is deleting...';
		const _deleteMessage = `Product category has been deleted`;
		const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				return;
			}
			const deleteFlag = this.service.deleteFlagProductCategory(_item).subscribe()
			this.subscriptions.push(deleteFlag);
			this.layoutUtilsService.showActionNotification(_deleteMessage, MessageType.Delete);
			this.loadProductCategoryList();
		});
	}

	editProductCategory(id) {
		this.router.navigate(['edit', id], { relativeTo: this.activatedRoute });
	}
	ngOnDestroy() {
		this.subscriptions.forEach(sb => sb.unsubscribe());
	}
	// export() {
	// 	this.service.exportExcel();
	// }
}
