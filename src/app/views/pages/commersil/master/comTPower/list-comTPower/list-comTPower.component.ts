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
import { ComTPowerModel } from '../../../../../../core/commersil/master/comTPower/comTPower.model';
import { ComTPowerPageRequested } from '../../../../../../core/commersil/master/comTPower/comTPower.action';
import { ComTPowerDataSource } from '../../../../../../core/commersil/master/comTPower/comTPower.datasource';
import { ComTPowerService } from '../../../../../../core/commersil/master/comTPower/comTPower.service';
import { QueryComTPowerModel } from '../../../../../../core/commersil/master/comTPower/querycomTPower.model';

@Component({
	selector: 'kt-list-comTPower',
	templateUrl: './list-comTPower.component.html',
	styleUrls: ['./list-comTPower.component.scss']
})

export class ListComTPowerComponent implements OnInit, OnDestroy {
	title = "Power Transaction Commercial";
	file;
	dataSource: ComTPowerDataSource;
	displayedColumns = 
	[

	'powname',
	'unit',
	'strtpos2',
	'endpos2',
	'isPosting',
	'isBilling',
	'create',
	'actions'
	];
	@ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
	@ViewChild('sort1', { static: true }) sort: MatSort;
	@ViewChild('searchInput', { static: true }) searchInput: ElementRef;
	lastQuery: QueryParamsModel;
	selection = new SelectionModel<ComTPowerModel>(true, []);
	comTPowerResult: ComTPowerModel[] = [];
	private subscriptions: Subscription[] = [];
	constructor(
		private activatedRoute: ActivatedRoute,
		private store: Store<AppState>,
		private router: Router,
		private service: ComTPowerService,
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
				this.loadComTPowerList();
			})
		)
		.subscribe();
		this.subscriptions.push(paginatorSubscriptions);
		const searchSubscription = fromEvent(this.searchInput.nativeElement, 'keyup').pipe(
			debounceTime(500), 
			distinctUntilChanged(),
			tap(() => {
				this.paginator.pageIndex = 0;
				this.loadComTPowerList();
			})
		).subscribe();
		this.subscriptions.push(searchSubscription);
		this.subheaderService.setTitle(this.title);
		this.dataSource = new ComTPowerDataSource(this.store);
		const entitiesSubscription = this.dataSource.entitySubject.pipe(
			skip(1),
			distinctUntilChanged()
		).subscribe(
			res => {
			this.comTPowerResult = res;
			}, 
			err => {
			alert('error');		
		}
		);
		this.subscriptions.push(entitiesSubscription);
		this.loadComTPowerList();
	}

	filterConfiguration(): any {
		const search: string = this.searchInput.nativeElement.value.toLowerCase();
		return search;
	}

	loadComTPowerList() {
		this.selection.clear();
		const queryParams = new QueryComTPowerModel(
			this.filterConfiguration(),
			this.paginator.pageIndex + 1,
			this.paginator.pageSize
		);
		this.store.dispatch(new ComTPowerPageRequested({ page: queryParams }));
		this.selection.clear();
	}

	deleteComTPower(_item: ComTPowerModel) {
		let data = this.title
		
		const _title = data + ' ' + 'Delete';
		const _description = 'Are you sure to permanently delete this' + ' ' + data + ' ? ';
		const _waitDesciption = data + ' ' + 'is deleting...';
		const _deleteMessage = data + ' ' + 'has been deleted';
		const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				return;
			}
			const deleteFlag = this.service.deleteFlagComTPower(_item).subscribe()
			if (deleteFlag){
				this.loadComTPowerList();
			}
			this.subscriptions.push(deleteFlag);
			this.layoutUtilsService.showActionNotification(_deleteMessage, MessageType.Delete);
		});
	}

	editComTPower(id) {
		this.router.navigate(['edit', id], { relativeTo: this.activatedRoute });
	}
	ngOnDestroy() {
		this.subscriptions.forEach(sb => sb.unsubscribe());
	}
	
	export() {
		this.service.exportExcel();
	}
}
