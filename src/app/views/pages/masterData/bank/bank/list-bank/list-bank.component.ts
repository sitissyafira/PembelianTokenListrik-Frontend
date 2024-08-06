
import { Component, OnInit, ElementRef, ViewChild, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SelectionModel } from '@angular/cdk/collections';
import { MatPaginator, MatSort,  } from '@angular/material';
import { debounceTime, distinctUntilChanged, tap, skip, } from 'rxjs/operators';
import { fromEvent, merge, Subscription } from 'rxjs';
import { Store} from '@ngrx/store';
import { AppState } from '../../../../../../core/reducers';

import { LayoutUtilsService, MessageType, QueryParamsModel } from '../../../../../../core/_base/crud';

import { BankModel } from '../../../../../../core/masterData/bank/bank/bank.model';
import { BankDeleted, BankPageRequested} from '../../../../../../core/masterData/bank/bank/bank.action';
import {BankDataSource} from '../../../../../../core/masterData/bank/bank/bank.datasource';
import {SubheaderService} from '../../../../../../core/_base/layout';
import {BankService} from '../../../../../../core/masterData/bank/bank/bank.service';
import { HttpClient } from '@angular/common/http';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { QueryBankModel } from '../../../../../../core/masterData/bank/bank/querybank.model';

@Component({
  selector: 'kt-list-bank',
  templateUrl: './list-bank.component.html',
  styleUrls: ['./list-bank.component.scss']
})
export class ListBankComponent implements OnInit, OnDestroy {
	file;
	data = localStorage.getItem("currentUser");
	dataUser = JSON.parse(this.data)
	role = this.dataUser.role
	dataSource: BankDataSource;
	displayedColumns = [ 'codeBank', 'bank', 'actions'];
	@ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
	@ViewChild('sort1', {static: true}) sort: MatSort;
	@ViewChild('searchInput', {static: true}) searchInput: ElementRef;
	lastQuery: QueryParamsModel;
	selection = new SelectionModel<BankModel>(true, []);
	bankResult: BankModel[] = [];

	private subscriptions: Subscription[] = [];
  	constructor(
		private activatedRoute: ActivatedRoute,
		private store: Store<AppState>,
		private router: Router,
		private service: BankService,
		private layoutUtilsService: LayoutUtilsService,
		private subheaderService: SubheaderService,
		private cdr: ChangeDetectorRef,
		private http : HttpClient,
		private modalService : NgbModal
	) { }

  	ngOnInit() {
		const sortSubscription = this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0));
		this.subscriptions.push(sortSubscription);
		const paginatorSubscriptions = merge(this.sort.sortChange, this.paginator.page).pipe(
			tap(() => {
				this.loadBankList();
			})
		)
			.subscribe();
		this.subscriptions.push(paginatorSubscriptions);
		const searchSubscription = fromEvent(this.searchInput.nativeElement, 'keyup').pipe(
			debounceTime(50), 
			distinctUntilChanged(),
			tap(() => {
				this.paginator.pageIndex = 0;
				this.loadBankList();
			})
		).subscribe();
		this.subscriptions.push(searchSubscription);

		this.subheaderService.setTitle('Bank');

		this.dataSource = new BankDataSource(this.store);
		const entitiesSubscription = this.dataSource.entitySubject.pipe(
			skip(1),
			distinctUntilChanged()
		).subscribe(res => {
			this.bankResult = res;
		});
		this.subscriptions.push(entitiesSubscription);
		this.loadBankList();
  	}

	filterConfiguration(): any {
		const filter: any = {};
		const searchText: string = this.searchInput.nativeElement.value.toLowerCase();

		filter.bank = `${searchText}`;
		return filter;
	}

	loadBankList(){
		this.selection.clear();
		const queryParams = new QueryBankModel(
			this.filterConfiguration(),
			this.sort.direction,
			this.sort.active,
			this.paginator.pageIndex+1,
			this.paginator.pageSize
		);
		this.store.dispatch(new BankPageRequested({ page: queryParams }));
		this.selection.clear();
	}

	deleteBank(_item: BankModel) {
		const _title = 'Bank Delete';
		const _description = 'Are you sure to permanently delete this bank?';
		const _waitDesciption = 'Bank is deleting...';
		const _deleteMessage = `Bank has been deleted`;

		const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				return;
			}

			this.store.dispatch(new BankDeleted({ id: _item._id }));
			this.layoutUtilsService.showActionNotification(_deleteMessage, MessageType.Delete);
		});
	}

	editBank(id) {
		this.router.navigate(['edit', id], { relativeTo: this.activatedRoute });
	}

	viewBank(id) {
		this.router.navigate(['view', id], { relativeTo: this.activatedRoute });
	}
  	ngOnDestroy() {
		this.subscriptions.forEach(sb => sb.unsubscribe());
	}


	export(){
		this.service.exportExcel();
	}
}
