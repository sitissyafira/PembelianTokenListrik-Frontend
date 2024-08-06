import { Component, OnInit, ElementRef, ViewChild, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SelectionModel } from '@angular/cdk/collections';
import { MatPaginator, MatSort,} from '@angular/material';
import { debounceTime, distinctUntilChanged, tap, skip, } from 'rxjs/operators';
import { fromEvent, merge,Subscription } from 'rxjs';
import { Store,} from '@ngrx/store';
import { AppState } from '../../../../core/reducers';
import { LayoutUtilsService, MessageType, QueryParamsModel } from '../../../../core/_base/crud';
import { HttpClient } from '@angular/common/http';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { SubheaderService } from '../../../../core/_base/layout';
import { RequestInvoiceModel } from '../../../../core/requestInvoice/requestInvoice.model';
import { RequestInvoicePageRequested } from '../../../../core/requestInvoice/requestInvoice.action';
import { RequestInvoiceDataSource } from '../../../../core/requestInvoice/requestInvoice.datasource';
import { RequestInvoiceService } from '../../../../core/requestInvoice/requestInvoice.service';
import { QueryRequestInvoiceModel } from '../../../../core/requestInvoice/queryrequestInvoice.model';

@Component({
	selector: 'kt-list-requestInvoice',
	templateUrl: './list-requestInvoice.component.html',
	styleUrls: ['./list-requestInvoice.component.scss']
})

export class ListRequestInvoiceComponent implements OnInit, OnDestroy {
	file;
	dataSource: RequestInvoiceDataSource;
	displayedColumns = [
	'request_no',
	'name',
	'type_deposit',
	// 'created_by',
	'actions'];
	@ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
	@ViewChild('sort1', { static: true }) sort: MatSort;
	@ViewChild('searchInput', { static: true }) searchInput: ElementRef;
	lastQuery: QueryParamsModel;
	selection = new SelectionModel<RequestInvoiceModel>(true, []);
	requestInvoiceResult: RequestInvoiceModel[] = [];
	private subscriptions: Subscription[] = [];
	constructor(
		private activatedRoute: ActivatedRoute,
		private store: Store<AppState>,
		private router: Router,
		private service: RequestInvoiceService,
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
				this.loadRequestInvoiceList();
			})
		)
		.subscribe();
		this.subscriptions.push(paginatorSubscriptions);
		const searchSubscription = fromEvent(this.searchInput.nativeElement, 'keyup').pipe(
			debounceTime(500), 
			distinctUntilChanged(),
			tap(() => {
				this.paginator.pageIndex = 0;
				this.loadRequestInvoiceList();
			})
		).subscribe();
		this.subscriptions.push(searchSubscription);
		this.subheaderService.setTitle('Request Invoice');
		this.dataSource = new RequestInvoiceDataSource(this.store);
		const entitiesSubscription = this.dataSource.entitySubject.pipe(
			skip(1),
			distinctUntilChanged()
		).subscribe(
			res => {
			this.requestInvoiceResult = res;
			}, 
			err => {
			alert('error');		
		}
		);
		this.subscriptions.push(entitiesSubscription);
		this.loadRequestInvoiceList();
	}

	filterConfiguration(): any {
		const search: string = this.searchInput.nativeElement.value.toLowerCase();
		return search;
	}

	loadRequestInvoiceList() {
		this.selection.clear();
		const queryParams = new QueryRequestInvoiceModel(
			this.filterConfiguration(),
			this.paginator.pageIndex + 1,
			this.paginator.pageSize
		);
		this.store.dispatch(new RequestInvoicePageRequested({ page: queryParams }));
		this.selection.clear();
	}

	deleteRequestInvoice(_item: RequestInvoiceModel) {
		const _title = 'Product Delete';
		const _description = 'Are you sure to permanently delete this product ?';
		const _waitDesciption = 'Product is deleting...';
		const _deleteMessage = `Product has been deleted`;
		const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				return;
			}
			const deleteFlag = this.service.deleteFlagRequestInvoice(_item).subscribe()
			this.subscriptions.push(deleteFlag);
			this.layoutUtilsService.showActionNotification(_deleteMessage, MessageType.Delete);
			this.loadRequestInvoiceList();
		});
	}

	viewRequestInvoice(id) {
		this.router.navigate(['view', id], { relativeTo: this.activatedRoute });
	}

	editRequestInvoice(id) {
		this.router.navigate(['edit', id], { relativeTo: this.activatedRoute });
	}

	ngOnDestroy() {
		this.subscriptions.forEach(sb => sb.unsubscribe());
	}
	
	export() {
		this.service.exportExcel();
	}
}
