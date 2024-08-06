import { Component, OnInit, ElementRef, ViewChild, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SelectionModel } from '@angular/cdk/collections';
import { MatPaginator, MatSort,} from '@angular/material';
import { debounceTime, distinctUntilChanged, tap, skip, } from 'rxjs/operators';
import { fromEvent, merge,Subscription } from 'rxjs';
import { Store,} from '@ngrx/store';
import { AppState } from '../../../../../../core/reducers';
import { LayoutUtilsService, MessageType, QueryParamsModel } from '../../../../../../core/_base/crud';
import { HttpClient } from '@angular/common/http';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { SubheaderService } from '../../../../../../core/_base/layout';
import { ComCustomerModel } from '../../../../../../core/commersil/master/comCustomer/comCustomer.model';
import { ComCustomerPageRequested } from '../../../../../../core/commersil/master/comCustomer/comCustomer.action';
import { ComCustomerDataSource } from '../../../../../../core/commersil/master/comCustomer/comCustomer.datasource';
import { ComCustomerService } from '../../../../../../core/commersil/master/comCustomer/comCustomer.service';
import { QueryComCustomerModel } from '../../../../../../core/commersil/master/comCustomer/querycomCustomer.model';

@Component({
	selector: 'kt-list-comCustomer',
	templateUrl: './list-comCustomer.component.html',
	styleUrls: ['./list-comCustomer.component.scss']
})

export class ListComCustomerComponent implements OnInit, OnDestroy {
	file;
	dataSource: ComCustomerDataSource;
	displayedColumns = [

	'nameDagang',
	'namaToko',
	'actions'];
	@ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
	@ViewChild('sort1', { static: true }) sort: MatSort;
	@ViewChild('searchInput', { static: true }) searchInput: ElementRef;
	lastQuery: QueryParamsModel;
	selection = new SelectionModel<ComCustomerModel>(true, []);
	comCustomerResult: ComCustomerModel[] = [];
	private subscriptions: Subscription[] = [];
	constructor(
		private activatedRoute: ActivatedRoute,
		private store: Store<AppState>,
		private router: Router,
		private service: ComCustomerService,
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
				this.loadComCustomerList();
			})
		)
		.subscribe();
		this.subscriptions.push(paginatorSubscriptions);
		const searchSubscription = fromEvent(this.searchInput.nativeElement, 'keyup').pipe(
			debounceTime(500), 
			distinctUntilChanged(),
			tap(() => {
				this.paginator.pageIndex = 0;
				this.loadComCustomerList();
			})
		).subscribe();
		this.subscriptions.push(searchSubscription);
		this.subheaderService.setTitle('Commercial Customer');
		this.dataSource = new ComCustomerDataSource(this.store);
		const entitiesSubscription = this.dataSource.entitySubject.pipe(
			skip(1),
			distinctUntilChanged()
		).subscribe(
			res => {
			this.comCustomerResult = res;
			}, 
			err => {
			alert('error');		
		}
		);
		this.subscriptions.push(entitiesSubscription);
		this.loadComCustomerList();
	}

	filterConfiguration(): any {
		const search: string = this.searchInput.nativeElement.value.toLowerCase();
		return search;
	}

	loadComCustomerList() {
		this.selection.clear();
		const queryParams = new QueryComCustomerModel(
			this.filterConfiguration(),
			this.paginator.pageIndex + 1,
			this.paginator.pageSize
		);
		this.store.dispatch(new ComCustomerPageRequested({ page: queryParams }));
		this.selection.clear();
	}

	deleteComCustomer(_item: ComCustomerModel) {
		const _title = 'Commersil Customer Delete';
		const _description = 'Are you sure to permanently delete this commersil customer ?';
		const _waitDesciption = 'Comersil Customer is deleting...';
		const _deleteMessage = `Comersil Customer has been deleted`;
		const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				return;
			}
			const deleteFlag = this.service.deleteFlagComCustomer(_item).subscribe()
			this.subscriptions.push(deleteFlag);
			this.layoutUtilsService.showActionNotification(_deleteMessage, MessageType.Delete);
			this.loadComCustomerList();
		});
	}

	editComCustomer(id) {
		this.router.navigate(['edit', id], { relativeTo: this.activatedRoute });
	}
	ngOnDestroy() {
		this.subscriptions.forEach(sb => sb.unsubscribe());
	}
	
	export() {
		this.service.exportExcel();
	}
}
