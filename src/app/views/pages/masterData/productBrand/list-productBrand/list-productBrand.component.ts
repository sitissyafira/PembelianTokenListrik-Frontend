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
import { ProductBrandModel } from '../../../../../core/masterData/productBrand/productBrand.model';
import { ProductBrandPageRequested } from '../../../../../core/masterData/productBrand/productBrand.action';
import { ProductBrandDataSource } from '../../../../../core/masterData/productBrand/productBrand.datasource';
import { ProductBrandService } from '../../../../../core/masterData/productBrand/productBrand.service';
import { QueryProductBrandModel } from '../../../../../core/masterData/productBrand/queryproductBrand.model';
import { environment } from '../../../../../../environments/environment';

@Component({
	selector: 'kt-list-productBrand',
	templateUrl: './list-productBrand.component.html',
	styleUrls: ['./list-productBrand.component.scss']
})

export class ListProductBrandComponent implements OnInit, OnDestroy {
	file;
	data = localStorage.getItem("currentUser");
	dataUser = JSON.parse(this.data)
	dataID = this.dataUser.roleId
	dataSource: ProductBrandDataSource;
	displayedColumns = [
	'product_category',
	'brand_code',
	'brand_name',
	'actions'];
	@ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
	@ViewChild('sort1', { static: true }) sort: MatSort;
	@ViewChild('searchInput', { static: true }) searchInput: ElementRef;
	lastQuery: QueryParamsModel;
	selection = new SelectionModel<ProductBrandModel>(true, []);
	productBrandResult: ProductBrandModel[] = [];
	private subscriptions: Subscription[] = [];
	constructor(
		private activatedRoute: ActivatedRoute,
		private store: Store<AppState>,
		private router: Router,
		private service: ProductBrandService,
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
				this.loadProductBrandList();
			})
		)
		.subscribe();
		this.subscriptions.push(paginatorSubscriptions);
		const searchSubscription = fromEvent(this.searchInput.nativeElement, 'keyup').pipe(
			debounceTime(500), 
			distinctUntilChanged(),
			tap(() => {
				this.paginator.pageIndex = 0;
				this.loadProductBrandList();
			})
		).subscribe();
		this.subscriptions.push(searchSubscription);
		this.subheaderService.setTitle('Product Brand');
		this.dataSource = new ProductBrandDataSource(this.store);
		const entitiesSubscription = this.dataSource.entitySubject.pipe(
			skip(1),
			distinctUntilChanged()
		).subscribe(
			res => {
			this.productBrandResult = res;
			}, 
			err => {
			alert('error');		
		}
		);
		this.subscriptions.push(entitiesSubscription);
		this.loadProductBrandList();
	}

	filterConfiguration(): any {
		const search: string = this.searchInput.nativeElement.value.toLowerCase();
		return search;
	}

	loadProductBrandList() {
		this.selection.clear();
		const queryParams = new QueryProductBrandModel(
			this.filterConfiguration(),
			this.paginator.pageIndex + 1,
			this.paginator.pageSize
		);
		this.store.dispatch(new ProductBrandPageRequested({ page: queryParams }));
		this.selection.clear();
	}

	deleteProductBrand(_item: ProductBrandModel) {
		const _title = 'Product Category Delete';
		const _description = 'Are you sure to permanently delete this product category?';
		const _waitDesciption = 'Product category is deleting...';
		const _deleteMessage = `Product category has been deleted`;
		const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				return;
			}
			const deleteFlag = this.service.deleteFlagProductBrand(_item).subscribe()
			this.subscriptions.push(deleteFlag);
			this.layoutUtilsService.showActionNotification(_deleteMessage, MessageType.Delete);
			this.loadProductBrandList();
		});
	}

	editProductBrand(id) {
		this.router.navigate(['edit', id], { relativeTo: this.activatedRoute });
	}
	ngOnDestroy() {
		this.subscriptions.forEach(sb => sb.unsubscribe());
	}
	export() {
		this.service.exportExcel();
	}


	openLarge(content) {
		this.modalService.open(content, {
			size: 'lg'
		});
	}

	selectFile(event) {
		if(event.target.files.length > 0) {
			const file = event.target.files[0];
			this.file = file;
		}
	}

	onSubmit(){
		const formData = new FormData();
		formData.append('file', this.file);
		formData.append('created_by', this.dataID)

		this.http.post<any>(`${environment.baseAPI}/api/masterproductbrand/excel/import`, formData).subscribe(
			res =>{
				const message = res.status;
	 			this.layoutUtilsService.showActionNotification(message, MessageType.Create, 2000, true, true);
				this.file = undefined;
				if (res){
					this.ngOnInit();
				}
			},
			err => {
				console.error(err);
				const message = 'Error while importing File | ' + err.error.message;
				this.layoutUtilsService.showActionNotification(message, MessageType.Create, 2000, true, false);
				}
		)
	}
}
