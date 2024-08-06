import { Component, OnInit, ElementRef, ViewChild, ChangeDetectionStrategy, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SelectionModel } from '@angular/cdk/collections';
import { MatPaginator, MatSort } from '@angular/material';
import { debounceTime, distinctUntilChanged, tap, skip,} from 'rxjs/operators';
import { fromEvent, merge, Subscription } from 'rxjs';
import { Store } from '@ngrx/store';
import { AppState } from '../../../../../core/reducers';
import { LayoutUtilsService, MessageType, QueryParamsModel } from '../../../../../core/_base/crud';

import { LogFinanceModel } from '../../../../../core/log/logFinance/logFinance.model';
import { LogFinanceDeleted, LogFinancePageRequested, LogFinancePageRequestedAP, LogFinancePageRequestedPR, LogFinancePageRequestedQU } from '../../../../../core/log/logFinance/logFinance.action';
import { LogFinanceDataSource } from '../../../../../core/log/logFinance/logFinance.datasource';
import { SubheaderService } from '../../../../../core/_base/layout';
import { LogFinanceService } from '../../../../../core/log/logFinance/logFinance.service';
import { HttpClient } from '@angular/common/http';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { QueryLogFinanceModel } from '../../../../../core/log/logFinance/querylogFinance.model';

@Component({
	selector: 'kt-list-logFinanceQU',
	templateUrl: './list-logFinanceQU.component.html',
	styleUrls: ['./list-logFinanceQU.component.scss']
})
export class ListLogFinanceComponentQU implements OnInit, OnDestroy {
	file;
	dataSource: LogFinanceDataSource;
	displayedColumns = [
		'quotation_no',
		// 'type',
		'isApproved',
		'created_date',
		'actions'];
	@ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
	@ViewChild('sort1', { static: true }) sort: MatSort;
	@ViewChild('searchInput', { static: true }) searchInput: ElementRef;
	lastQuery: QueryParamsModel;
	selection = new SelectionModel<LogFinanceModel>(true, []);
	logFinanceResult: LogFinanceModel[] = [];
	private subscriptions: Subscription[] = [];
	constructor(
		private activatedRoute: ActivatedRoute,
		private store: Store<AppState>,
		private router: Router,
		private service: LogFinanceService,
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
				this.loadLogFinanceList();
			})
		)
		.subscribe();
		this.subscriptions.push(paginatorSubscriptions);

		const searchSubscription = fromEvent(this.searchInput.nativeElement, 'keyup').pipe(
			debounceTime(500), 
			distinctUntilChanged(),
			tap(() => {
				this.paginator.pageIndex = 0;
				this.loadLogFinanceList();
			})
		).subscribe();
		this.subscriptions.push(searchSubscription);


		this.subheaderService.setTitle('Log Quotation');


		this.dataSource = new LogFinanceDataSource(this.store);
		const entitiesSubscription = this.dataSource.entitySubject.pipe(
			skip(1),
			distinctUntilChanged()
		).subscribe(
			res => {
			this.logFinanceResult = res;
			}, 
			err => {
			alert('error');		
		}
		);
		this.subscriptions.push(entitiesSubscription);
		this.loadLogFinanceList();
	}

	filterConfiguration(): any {
		const search: string = this.searchInput.nativeElement.value.toLowerCase();
		return search;
	}

	loadLogFinanceList() {
		this.selection.clear();
		const queryParams = new QueryLogFinanceModel(
			this.filterConfiguration(),
			this.paginator.pageIndex + 1,
			this.paginator.pageSize
		);
		this.store.dispatch(new LogFinancePageRequestedQU({ page: queryParams }));
		this.selection.clear();
	}

	deleteLogFinance(_item: LogFinanceModel) {
		const _title = 'Log AR Delete';
		const _description = 'Are you sure to permanently delete this log ar?';
		const _waitDesciption = 'Log AR is deleting...';
		const _deleteMessage = `Log AR has been deleted`;
		const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				return;
			}
			this.store.dispatch(new LogFinanceDeleted({ id: _item._id }));
			this.layoutUtilsService.showActionNotification(_deleteMessage, MessageType.Delete);
			this.loadLogFinanceList();
		});
	}

	editLogFinance(id) {
		this.router.navigate(['edit', id], { relativeTo: this.activatedRoute });
	}
	ngOnDestroy() {
		this.subscriptions.forEach(sb => sb.unsubscribe());
	}

	export() {
		this.service.exportExcel();
	}
}
