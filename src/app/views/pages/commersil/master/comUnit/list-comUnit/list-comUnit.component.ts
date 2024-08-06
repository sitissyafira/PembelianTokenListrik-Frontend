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
import { ComUnitModel } from '../../../../../../core/commersil/master/comUnit/comUnit.model';
import { ComUnitPageRequested } from '../../../../../../core/commersil/master/comUnit/comUnit.action';
import { ComUnitDataSource } from '../../../../../../core/commersil/master/comUnit/comUnit.datasource';
import { ComUnitService } from '../../../../../../core/commersil/master/comUnit/comUnit.service';
import { QueryComUnitModel } from '../../../../../../core/commersil/master/comUnit/querycomUnit.model';

@Component({
	selector: 'kt-list-comUnit',
	templateUrl: './list-comUnit.component.html',
	styleUrls: ['./list-comUnit.component.scss']
})

export class ListComUnitComponent implements OnInit, OnDestroy {
	file;
	dataSource: ComUnitDataSource;
	displayedColumns = [
	'cdunt',
	'type',
	'customer',
	'untsqr',
	'actions'];
	@ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
	@ViewChild('sort1', { static: true }) sort: MatSort;
	@ViewChild('searchInput', { static: true }) searchInput: ElementRef;
	lastQuery: QueryParamsModel;
	selection = new SelectionModel<ComUnitModel>(true, []);
	comUnitResult: ComUnitModel[] = [];
	private subscriptions: Subscription[] = [];
	constructor(
		private activatedRoute: ActivatedRoute,
		private store: Store<AppState>,
		private router: Router,
		private service: ComUnitService,
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
				this.loadComUnitList();
			})
		)
		.subscribe();
		this.subscriptions.push(paginatorSubscriptions);
		const searchSubscription = fromEvent(this.searchInput.nativeElement, 'keyup').pipe(
			debounceTime(500), 
			distinctUntilChanged(),
			tap(() => {
				this.paginator.pageIndex = 0;
				this.loadComUnitList();
			})
		).subscribe();
		this.subscriptions.push(searchSubscription);
		this.subheaderService.setTitle('Commercial Unit');
		this.dataSource = new ComUnitDataSource(this.store);
		const entitiesSubscription = this.dataSource.entitySubject.pipe(
			skip(1),
			distinctUntilChanged()
		).subscribe(
			res => {
			this.comUnitResult = res;
			}, 
			err => {
			alert('error');		
		}
		);
		this.subscriptions.push(entitiesSubscription);
		this.loadComUnitList();
	}

	filterConfiguration(): any {
		const search: string = this.searchInput.nativeElement.value.toLowerCase();
		return search;
	}

	loadComUnitList() {
		this.selection.clear();
		const queryParams = new QueryComUnitModel(
			this.filterConfiguration(),
			this.paginator.pageIndex + 1,
			this.paginator.pageSize
		);
		this.store.dispatch(new ComUnitPageRequested({ page: queryParams }));
		this.selection.clear();
	}

	deleteComUnit(_item: ComUnitModel) {
		let data = 'Unit Commersial'
		const _title = data + ' ' + 'Delete';
		const _description = 'Are you sure to permanently delete this' + ' ' + data + ' ? ';
		const _waitDesciption = data + ' ' + 'is deleting...';
		const _deleteMessage = data + ' ' + 'has been deleted';
		const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				return;
			}
			const deleteFlag = this.service.deleteFlagComUnit(_item).subscribe()
			this.subscriptions.push(deleteFlag);
			this.layoutUtilsService.showActionNotification(_deleteMessage, MessageType.Delete);
			this.loadComUnitList();
		});
	}

	editcomUnit(id) {
		this.router.navigate(['edit', id], { relativeTo: this.activatedRoute });
	}

	viewcomUnit(id) {
		this.router.navigate(['view', id], { relativeTo: this.activatedRoute });
	}

	ngOnDestroy() {
		this.subscriptions.forEach(sb => sb.unsubscribe());
	}
	
	export() {
		this.service.exportExcel();
	}
}
