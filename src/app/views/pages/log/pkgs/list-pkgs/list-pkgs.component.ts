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

//log
import { LayoutUtilsService, MessageType, QueryParamsModel } from '../../../../../core/_base/crud';

import { PkgsModel } from '../../../../../core/log/pkgs/pkgs.model';
import { PkgsDeleted, PkgsPageRequested } from '../../../../../core/log/pkgs/pkgs.action';
import { PkgsDataSource } from '../../../../../core/log/pkgs/pkgs.datasource';
import { SubheaderService } from '../../../../../core/_base/layout';
import { PkgsService } from '../../../../../core/log/pkgs/pkgs.service';
import { HttpClient } from '@angular/common/http';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { environment } from '../../../../../../environments/environment';
import { QueryPkgsModel } from '../../../../../core/log/pkgs/querypkgs.model';

@Component({
	selector: 'kt-list-pkgs',
	templateUrl: './list-pkgs.component.html',
	styleUrls: ['./list-pkgs.component.scss']
})
export class ListPkgsComponent implements OnInit, OnDestroy {
	file;
	dataSource: PkgsDataSource;
	displayedColumns = [
		'cdunt',
		'contract_name',
		'created_date' ,
		'status',
		'confirmed_date',
		'actions'];
	@ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
	@ViewChild('sort1', { static: true }) sort: MatSort;
	// Filter fields
	@ViewChild('searchInput', { static: true }) searchInput: ElementRef;
	lastQuery: QueryParamsModel;
	// Selection
	selection = new SelectionModel<PkgsModel>(true, []);
	pkgsResult: PkgsModel[] = [];
	// Subscriptions
	private subscriptions: Subscription[] = [];
	constructor(
		private activatedRoute: ActivatedRoute,
		private store: Store<AppState>,
		private router: Router,
		private service: PkgsService,
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
				this.loadPkgsList();
			})
		)
		.subscribe();
		this.subscriptions.push(paginatorSubscriptions);

		const searchSubscription = fromEvent(this.searchInput.nativeElement, 'keyup').pipe(
			debounceTime(500), 
			distinctUntilChanged(),
			tap(() => {
				this.paginator.pageIndex = 0;
				this.loadPkgsList();
			})
		).subscribe();
		this.subscriptions.push(searchSubscription);


		this.subheaderService.setTitle('Package');


		this.dataSource = new PkgsDataSource(this.store);
		const entitiesSubscription = this.dataSource.entitySubject.pipe(
			skip(1),
			distinctUntilChanged()
		).subscribe(
			res => {
			this.pkgsResult = res;
			}, 
			err => {
			alert('error');		
		}
		);
		this.subscriptions.push(entitiesSubscription);
		this.loadPkgsList();
	}

	filterConfiguration(): any {
		const search: string = this.searchInput.nativeElement.value.toLowerCase();
		return search;
	}

	loadPkgsList() {
		this.selection.clear();
		const queryParams = new QueryPkgsModel(
			this.filterConfiguration(),
			this.paginator.pageIndex + 1,
			this.paginator.pageSize
		);
		this.store.dispatch(new PkgsPageRequested({ page: queryParams }));
		this.selection.clear();
	}

	deletePkgs(_item: PkgsModel) {
		const _title = 'Package Delete';
		const _description = 'Are you sure to permanently delete this package?';
		const _waitDesciption = 'Account type is deleting...';
		const _deleteMessage = `Account type has been deleted`;
		const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				return;
			}
			this.store.dispatch(new PkgsDeleted({ id: _item._id }));
			this.layoutUtilsService.showActionNotification(_deleteMessage, MessageType.Delete);
			this.loadPkgsList();
		});
	}

	editPkgs(id) {
		this.router.navigate(['edit', id], { relativeTo: this.activatedRoute });
	}
	ngOnDestroy() {
		this.subscriptions.forEach(sb => sb.unsubscribe());
	}

	export() {
		this.service.exportExcel();
	}
}
