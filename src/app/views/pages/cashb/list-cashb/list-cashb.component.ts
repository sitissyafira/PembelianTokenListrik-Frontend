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
import { AppState } from '../../../../core/reducers';

//services
import { LayoutUtilsService, MessageType, QueryParamsModel } from '../../../../core/_base/crud';

import { CashbModel } from '../../../../core/cashb/cashb.model';
import { CashbDeleted, CashbPageRequested } from '../../../../core/cashb/cashb.action';
import { CashbDataSource } from '../../../../core/cashb/cashb.datasource';
import { SubheaderService } from '../../../../core/_base/layout';
import { CashbService } from '../../../../core/cashb/cashb.service';
import { HttpClient } from '@angular/common/http';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { QueryCashbModel } from '../../../../core/cashb/queryb.model';
import { environment } from '../../../../../environments/environment';
import { AccountGroupService } from '../../../../core/accountGroup/accountGroup.service';
import { FormControl } from '@angular/forms';

@Component({
	selector: 'kt-list-cashb',
	templateUrl: './list-cashb.component.html',
	styleUrls: ['./list-cashb.component.scss']
})

export class ListCashBankComponent implements OnInit {
	file;
	dataSource: CashbDataSource;
	displayedColumns = ['date', 'sourceno', 'description', 'deposit', 'withdrawal', 
	// 'balance', 
	'actions'];
	@ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
	@ViewChild('sort1', { static: true }) sort: MatSort;
	
	acct = {
		val: undefined,
		control: new FormControl()
	};
	date = {
		valid: false,
		start: {
			control: new FormControl(),
			val: undefined
		},
		end: {
			control: new FormControl(),
			val: undefined
		}
	};
	
	accountList = [];
	loading = {
		account: false
	};

	// Filter fields
	lastQuery: QueryParamsModel;
	filter = {
		account: undefined,
		date: {
			from: undefined,
			to: undefined
		}
	};
	
	// Selection
	selection = new SelectionModel<CashbModel>(true, []);
	cashbResult: CashbModel[] = [];
	// Subscriptions
	private subscriptions: Subscription[] = [];
	constructor(
		private activatedRoute: ActivatedRoute,
		private store: Store<AppState>,
		private router: Router,
		private service: CashbService,
		private accService: AccountGroupService,
		private layoutUtilsService: LayoutUtilsService,
		private subheaderService: SubheaderService,
		private cdr: ChangeDetectorRef,
		private http: HttpClient,
		private modalService: NgbModal
	) { }

	ngOnInit() {
		this.loadAcc();
		
		const sortSubscription = this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0));
		this.subscriptions.push(sortSubscription);

		/* Data load will be triggered in two cases:
		- when a pagination event occurs => this.paginator.page
		- when a sort event occurs => this.sort.sortChange
		**/
		const paginatorSubscriptions = merge(this.sort.sortChange, this.paginator.page).pipe(
			tap(() => {
				this.loadCashbList();
			})
		)
			.subscribe();
		this.subscriptions.push(paginatorSubscriptions);

		// Set title to page breadCrumbs
		this.subheaderService.setTitle('Cash Bank');

		// Init DataSource
		this.dataSource = new CashbDataSource(this.store);
		const entitiesSubscription = this.dataSource.entitySubject.pipe(
			skip(1),
			distinctUntilChanged()
		).subscribe(res => {
			this.cashbResult = res;
		});
		this.subscriptions.push(entitiesSubscription);

		// First Load
		this.loadCashbList();

		// Acct dropdown
		this.acct.control.valueChanges.subscribe(i => {
			if(i !== 'all') this.acct.val = i;
			else this.acct.val = undefined;

			this.loadCashbList();
		})
	}

	filterConfiguration(): any {
		// const filter: any = {};
		// const searchText: string = this.searchInput.nativeElement.value.toLowerCase();

		// filter.sourceno = `${searchText}`;
		// return filter;
	}

	loadCashbList() {
		this.selection.clear();
		const queryParams = new QueryCashbModel(
			this.acct.val && this.acct.val !== 'all' ? this.acct.val : undefined,
			this.date.valid ? this.date.start.val : undefined,
			this.date.valid ? this.date.end.val : undefined,
			this.paginator.pageIndex + 1,
			this.paginator.pageSize
		);
		this.store.dispatch(new CashbPageRequested({ page: queryParams }));
		this.selection.clear();
	}

	loadAcc() {
		this.loading.account = true;

		const qparam = new QueryParamsModel(
			null,
			"asc",
			null,
			1,
			2000
		)
		
		const accListSub = this.accService.getListCashBank(qparam).subscribe(
			resp => {
				this.accountList = resp.data;
			},
			err => {
				console.error('Something went wrong!', err);
			},
			() => {
				this.loading.account = false;
			}
		);
		this.subscriptions.push(accListSub);
	}

	deleteCashb(_item: CashbModel) {
		// tslint:disable-next-line:variable-name
		const _title = 'Cashb Delete';
		// tslint:disable-next-line:variable-name
		const _description = 'Are you sure to permanently delete this cashb?';
		const _waitDesciption = 'Cashb is deleting...';
		const _deleteMessage = `Cashb has been deleted`;

		const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				return;
			}

			this.store.dispatch(new CashbDeleted({ id: _item._id }));
			this.ngOnInit();
			this.layoutUtilsService.showActionNotification(_deleteMessage, MessageType.Delete);
		});
	}

	isAllSelected(): boolean {
		const numSelected = this.selection.selected.length;
		const numRows = this.cashbResult.length;
		return numSelected === numRows;
	}

	masterToggle() {
		if (this.selection.selected.length === this.cashbResult.length) {
			this.selection.clear();
		} else {
			this.cashbResult.forEach(row => this.selection.select(row));
		}
	}

	editCashb(id) {
		this.router.navigate(['view', id], { relativeTo: this.activatedRoute });
	}



	export(){
		this.service.exportExcel();
	}



	addDate(type, e) {
		this.date[type].val = e.target.value;
		this.checkDateValidation();
		
		// Fetch list if date is filled
		if(this.date.valid) {
			this.loadCashbList();
		}
	}
	
	checkDateValidation() {
		if(this.date.start.val && this.date.end.val) this.date.valid = true;
		else {
			this.date.valid = false;
		}
	}
}
