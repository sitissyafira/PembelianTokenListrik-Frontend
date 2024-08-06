// Angular
import { Component, OnInit, ElementRef, ViewChild, ChangeDetectionStrategy, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
// Material
import { SelectionModel } from '@angular/cdk/collections';
import { MatPaginator, MatSort, MatSnackBar } from '@angular/material';
// RXJS
import { debounceTime, distinctUntilChanged, tap, skip, take, delay } from 'rxjs/operators';
import { fromEvent, merge, Observable, of, Subscription } from 'rxjs';
// LODASH
import { each, find } from 'lodash';
// NGRX
import { Store, select } from '@ngrx/store';
import { AppState } from '../../../../../core/reducers';

//services
import { LayoutUtilsService, MessageType, QueryParamsModel } from '../../../../../core/_base/crud';

import { OpeningBalanceModel } from '../../../../../core/masterData/openingBalance/openingBalance.model';
import { OpeningBalanceDeleted, OpeningBalancePageRequested } from '../../../../../core/masterData/openingBalance/openingBalance.action';
import { OpeningBalanceDataSource } from '../../../../../core/masterData/openingBalance/openingBalance.datasource';
import { SubheaderService } from '../../../../../core/_base/layout';
import { OpeningBalanceService } from '../../../../../core/masterData/openingBalance/openingBalance.service';
import { HttpClient } from '@angular/common/http';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { environment } from '../../../../../../environments/environment';
import { QueryOpeningBalanceModel } from '../../../../../core/masterData/openingBalance/queryaopeningBalance.model';

@Component({
	selector: 'kt-list-openingBalance',
	templateUrl: './list-openingBalance.component.html',
	styleUrls: ['./list-openingBalance.component.scss']
})
export class ListOpeningBalanceComponent implements OnInit, OnDestroy {
	file;
	dataSource: OpeningBalanceDataSource;
	displayedColumns = [
		'typeAccount',
		'coa',
		'opening_balance',
		'createdDate',
		'actions'
	];
	@ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
	@ViewChild('sort1', { static: true }) sort: MatSort;
	@ViewChild('searchInput', { static: true }) searchInput: ElementRef;
	lastQuery: QueryParamsModel;

	selection = new SelectionModel<OpeningBalanceModel>(true, []);
	openingBalanceResult: OpeningBalanceModel[] = [];

	private subscriptions: Subscription[] = [];
	constructor(
		private activatedRoute: ActivatedRoute,
		private store: Store<AppState>,
		private router: Router,
		private service: OpeningBalanceService,
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
				this.loadOpeningBalanceList();
			})
		)
		.subscribe();
		this.subscriptions.push(paginatorSubscriptions);
		const searchSubscription = fromEvent(this.searchInput.nativeElement, 'keyup').pipe(
			debounceTime(500), 
			distinctUntilChanged(), 
			tap(() => {
				this.paginator.pageIndex = 0;
				this.loadOpeningBalanceList();
			})
		).subscribe();
		this.subscriptions.push(searchSubscription);
		this.subheaderService.setTitle('Opening Balance');
		this.dataSource = new OpeningBalanceDataSource(this.store);
		const entitiesSubscription = this.dataSource.entitySubject.pipe(
			skip(1),
			distinctUntilChanged()
		).subscribe(
			res => {
			this.openingBalanceResult = res;
			}, 
			err => {
			alert('error');		
		}
		);
		this.subscriptions.push(entitiesSubscription);
		this.loadOpeningBalanceList();
	}

	filterConfiguration(): any {
		const searchNumber: string = this.searchInput.nativeElement.value.toLowerCase();
		return searchNumber;
	}

	loadOpeningBalanceList() {
		this.selection.clear();
		const queryParams = new QueryOpeningBalanceModel(
			this.filterConfiguration(),
			this.paginator.pageIndex + 1,
			this.paginator.pageSize
		);
		this.store.dispatch(new OpeningBalancePageRequested({ page: queryParams }));
		this.selection.clear();
	}

	deleteOpeningBalance(_item: OpeningBalanceModel) {
		const _title = 'Opening Balance Delete';
		const _description = 'Are you sure to permanently delete this opening balance?';
		const _waitDesciption = 'Opening balance is deleting...';
		const _deleteMessage = `Opening balance has been deleted`;
		const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				return;
			}
			this.store.dispatch(new OpeningBalanceDeleted({ id: _item._id }));
			this.layoutUtilsService.showActionNotification(_deleteMessage, MessageType.Delete);
			this.loadOpeningBalanceList();
		});
	}


	viewOpeningBalance(id) {
		this.router.navigate(['view', id], { relativeTo: this.activatedRoute });
	}
	ngOnDestroy() {
		this.subscriptions.forEach(sb => sb.unsubscribe());
	}
	export() {
		this.service.exportExcel();
	}
	
}
