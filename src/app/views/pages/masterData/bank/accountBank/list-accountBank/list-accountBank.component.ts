import { Component, OnInit, ElementRef, ViewChild, ChangeDetectionStrategy, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SelectionModel } from '@angular/cdk/collections';
import { MatPaginator, MatSort, } from '@angular/material';
import { debounceTime, distinctUntilChanged, tap, skip, } from 'rxjs/operators';
import { fromEvent, merge,Subscription } from 'rxjs';
import { Store} from '@ngrx/store';
import { AppState } from '../../../../../../core/reducers';
import { LayoutUtilsService, MessageType, QueryParamsModel } from '../../../../../../core/_base/crud';
import { AccountBankModel } from '../../../../../../core/masterData/bank/accountBank/accountBank.model';
import { AccountBankDeleted, AccountBankPageRequested} from '../../../../../../core/masterData/bank/accountBank/accountBank.action';
import {AccountBankDataSource} from '../../../../../../core/masterData/bank/accountBank/accountBank.datasource';
import {SubheaderService} from '../../../../../../core/_base/layout';
import {AccountBankService} from '../../../../../../core/masterData/bank/accountBank/accountBank.service';
import { HttpClient } from '@angular/common/http';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { QueryAccountBankModel } from '../../../../../../core/masterData/bank/accountBank/queryaccountBank.model';

@Component({
  selector: 'kt-list-accountBank',
  templateUrl: './list-accountBank.component.html',
  styleUrls: ['./list-accountBank.component.scss']
})
export class ListAccountBankComponent implements OnInit, OnDestroy {
	file;
	dataSource: AccountBankDataSource;
	displayedColumns = [ 'acctName','bank','branch','acctNum','remarks','actions'];
	@ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
	@ViewChild('sort1', {static: true}) sort: MatSort;
	@ViewChild('searchInput', {static: true}) searchInput: ElementRef;
	lastQuery: QueryParamsModel;
	selection = new SelectionModel<AccountBankModel>(true, []);
	accountBankResult: AccountBankModel[] = [];
	data = localStorage.getItem("currentUser");
	dataUser = JSON.parse(this.data)
	role = this.dataUser.role


	private subscriptions: Subscription[] = [];
  	constructor(
		private activatedRoute: ActivatedRoute,
		private store: Store<AppState>,
		private router: Router,
		private service: AccountBankService,
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
				this.loadAccountBankList();
			})
		)
			.subscribe();
		this.subscriptions.push(paginatorSubscriptions);
		const searchSubscription = fromEvent(this.searchInput.nativeElement, 'keyup').pipe(
			debounceTime(50), 
			distinctUntilChanged(),
			tap(() => {
				this.paginator.pageIndex = 0;
				this.loadAccountBankList();
			})
		).subscribe();
		this.subscriptions.push(searchSubscription);

		this.subheaderService.setTitle('Bank Account');
		this.dataSource = new AccountBankDataSource(this.store);
		const entitiesSubscription = this.dataSource.entitySubject.pipe(
			skip(1),
			distinctUntilChanged()
		).subscribe(res => {
			this.accountBankResult = res;
		});
		this.subscriptions.push(entitiesSubscription);
		this.loadAccountBankList();
  	}

	filterConfiguration(): any {
		const filter: any = {};
		const searchText: string = this.searchInput.nativeElement.value.toLowerCase();

		filter.acctName = `${searchText}`;
		return filter;
	}

	loadAccountBankList(){
		this.selection.clear();
		const queryParams = new QueryAccountBankModel(
			this.filterConfiguration(),
			this.sort.direction,
			this.sort.active,
			this.paginator.pageIndex+1,
			this.paginator.pageSize
		);
		this.store.dispatch(new AccountBankPageRequested({ page: queryParams }));
		this.selection.clear();
	}

	deleteAccountBank(_item: AccountBankModel) {
		const _title = 'Account Bank Delete';
		const _description = 'Are you sure to permanently delete this account bank?';
		const _waitDesciption = 'Account bank is deleting...';
		const _deleteMessage = `Account bank has been deleted`;

		const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				return;
			}

			this.store.dispatch(new AccountBankDeleted({ id: _item._id }));
			this.layoutUtilsService.showActionNotification(_deleteMessage, MessageType.Delete);
		});
	}

	editAccountBank(id) {
		this.router.navigate(['edit', id], { relativeTo: this.activatedRoute });
	}

	viewAccountBank(id) {
		this.router.navigate(['view', id], { relativeTo: this.activatedRoute });
	}
	
  	ngOnDestroy() {
		this.subscriptions.forEach(sb => sb.unsubscribe());
	}


	
}
