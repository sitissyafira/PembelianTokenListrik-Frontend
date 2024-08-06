// Angular
import { Component, OnInit, ElementRef, ViewChild, ChangeDetectionStrategy, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
// Material
import { SelectionModel } from '@angular/cdk/collections';
import { MatPaginator, MatSort,} from '@angular/material';
// RXJS
import { debounceTime, distinctUntilChanged, tap, skip, } from 'rxjs/operators';
import { fromEvent, merge, Subscription } from 'rxjs';

// NGRX
import { Store, select } from '@ngrx/store';
import { AppState } from '../../../../../../core/reducers';

//services
import { LayoutUtilsService, MessageType, QueryParamsModel } from '../../../../../../core/_base/crud';

import { FiscalModel } from '../../../../../../core/masterData/asset/fiscal/fiscal.model';
import { FiscalDeleted, FiscalPageRequested} from '../../../../../../core/masterData/asset/fiscal/fiscal.action';
import {FiscalDataSource} from '../../../../../../core/masterData/asset/fiscal/fiscal.datasource';
import {SubheaderService} from '../../../../../../core/_base/layout';
import {FiscalService} from '../../../../../../core/masterData/asset/fiscal/fiscal.service';
import { HttpClient } from '@angular/common/http';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { QueryFiscalModel } from '../../../../../../core/masterData/asset/fiscal/queryfiscal.model';

@Component({
  selector: 'kt-list-fiscal',
  templateUrl: './list-fiscal.component.html',
  styleUrls: ['./list-fiscal.component.scss']
})
export class ListFiscalComponent implements OnInit, OnDestroy {
	file;
	dataSource: FiscalDataSource;
	displayedColumns = [ 'fiscalName', 'description','actions'];
	@ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
	@ViewChild('sort1', {static: true}) sort: MatSort;
	// Filter fields
	@ViewChild('searchInput', {static: true}) searchInput: ElementRef;
	lastQuery: QueryParamsModel;
	// Selection
	selection = new SelectionModel<FiscalModel>(true, []);
	fiscalResult: FiscalModel[] = [];
	// Subscriptions
	data = localStorage.getItem("currentUser");
	dataUser = JSON.parse(this.data)
	role = this.dataUser.role
	private subscriptions: Subscription[] = [];
  	constructor(
		private activatedRoute: ActivatedRoute,
		private store: Store<AppState>,
		private router: Router,
		private service: FiscalService,
		private layoutUtilsService: LayoutUtilsService,
		private subheaderService: SubheaderService,
		private cdr: ChangeDetectorRef,
		private http : HttpClient,
		private modalService : NgbModal
	) { }

  	ngOnInit() {
		const sortSubscription = this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0));
		this.subscriptions.push(sortSubscription);

		/* Data load will be triggered in two cases:
		- when a pagination event occurs => this.paginator.page
		- when a sort event occurs => this.sort.sortChange
		**/
		const paginatorSubscriptions = merge(this.sort.sortChange, this.paginator.page).pipe(
			tap(() => {
				this.loadFiscalList();
			})
		)
			.subscribe();
		this.subscriptions.push(paginatorSubscriptions);


		// Filtration, bind to searchInput
		const searchSubscription = fromEvent(this.searchInput.nativeElement, 'keyup').pipe(
			// tslint:disable-next-line:max-line-length
			debounceTime(50), // The user can type quite quickly in the input box, and that could trigger a lot of server requests. With this operator, we are limiting the amount of server requests emitted to a maximum of one every 150ms
			distinctUntilChanged(), // This operator will eliminate duplicate values
			tap(() => {
				this.paginator.pageIndex = 0;
				this.loadFiscalList();
			})
		).subscribe();
		this.subscriptions.push(searchSubscription);

		// Set title to page breadCrumbs
		this.subheaderService.setTitle('Fiscal Asset');

		// Init DataSource
		this.dataSource = new FiscalDataSource(this.store);
		const entitiesSubscription = this.dataSource.entitySubject.pipe(
			skip(1),
			distinctUntilChanged()
		).subscribe(res => {
			this.fiscalResult = res;
		});
		this.subscriptions.push(entitiesSubscription);

		// First Load
		this.loadFiscalList();
  	}

	filterConfiguration(): any {
		const filter: any = {};
		const searchText: string = this.searchInput.nativeElement.value.toLowerCase();

		filter.fiscalName = `${searchText}`;
		// filter.fiscalDepMethod = `${searchText}`;
		return filter;
	}

	loadFiscalList(){
		this.selection.clear();
		const queryParams = new QueryFiscalModel(
			this.filterConfiguration(),
			this.sort.direction,
			this.sort.active,
			this.paginator.pageIndex+1,
			this.paginator.pageSize
		);
		this.store.dispatch(new FiscalPageRequested({ page: queryParams }));
		this.selection.clear();
	}

	deleteFiscal(_item: FiscalModel) {
		// tslint:disable-next-line:variable-name
		const _title = 'Fiscal Delete';
		// tslint:disable-next-line:variable-name
		const _description = 'Are you sure to permanently delete this fiscal?';
		const _waitDesciption = 'Fiscal is deleting...';
		const _deleteMessage = `Fiscal has been deleted`;

		const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				return;
			}

			this.store.dispatch(new FiscalDeleted({ id: _item._id }));
			this.ngOnInit();
			this.layoutUtilsService.showActionNotification(_deleteMessage, MessageType.Delete);
		});
	}
	
	editFiscal(id) {
		this.router.navigate(['edit', id], { relativeTo: this.activatedRoute });
	}
	viewFiscal(id) {
		this.router.navigate(['view', id], { relativeTo: this.activatedRoute });
	}
  	ngOnDestroy() {
		this.subscriptions.forEach(sb => sb.unsubscribe());
	}
	export(){
		this.service.exportExcel();
	}

}
