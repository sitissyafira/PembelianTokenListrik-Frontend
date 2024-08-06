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
import { ComTWaterModel } from '../../../../../../core/commersil/master/comTWater/comTWater.model';
import { ComTWaterPageRequested } from '../../../../../../core/commersil/master/comTWater/comTWater.action';
import { ComTWaterDataSource } from '../../../../../../core/commersil/master/comTWater/comTWater.datasource';
import { ComTWaterService } from '../../../../../../core/commersil/master/comTWater/comTWater.service';
import { QueryComTWaterModel } from '../../../../../../core/commersil/master/comTWater/querycomTWater.model';

@Component({
	selector: 'kt-list-comTWater',
	templateUrl: './list-comTWater.component.html',
	styleUrls: ['./list-comTWater.component.scss']
})

export class ListComTWaterComponent implements OnInit, OnDestroy {
	title = "Water Transaction Commercial";
	file;
	dataSource: ComTWaterDataSource;
	displayedColumns = 
	[

	'watname',
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
	selection = new SelectionModel<ComTWaterModel>(true, []);
	comTWaterResult: ComTWaterModel[] = [];
	private subscriptions: Subscription[] = [];
	constructor(
		private activatedRoute: ActivatedRoute,
		private store: Store<AppState>,
		private router: Router,
		private service: ComTWaterService,
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
				this.loadComTWaterList();
			})
		)
		.subscribe();
		this.subscriptions.push(paginatorSubscriptions);
		const searchSubscription = fromEvent(this.searchInput.nativeElement, 'keyup').pipe(
			debounceTime(500), 
			distinctUntilChanged(),
			tap(() => {
				this.paginator.pageIndex = 0;
				this.loadComTWaterList();
			})
		).subscribe();
		this.subscriptions.push(searchSubscription);
		this.subheaderService.setTitle(this.title);
		this.dataSource = new ComTWaterDataSource(this.store);
		const entitiesSubscription = this.dataSource.entitySubject.pipe(
			skip(1),
			distinctUntilChanged()
		).subscribe(
			res => {
			this.comTWaterResult = res;
			}, 
			err => {
			alert('error');		
		}
		);
		this.subscriptions.push(entitiesSubscription);
		this.loadComTWaterList();
	}

	filterConfiguration(): any {
		const search: string = this.searchInput.nativeElement.value.toLowerCase();
		return search;
	}

	loadComTWaterList() {
		this.selection.clear();
		const queryParams = new QueryComTWaterModel(
			this.filterConfiguration(),
			this.paginator.pageIndex + 1,
			this.paginator.pageSize
		);
		this.store.dispatch(new ComTWaterPageRequested({ page: queryParams }));
		this.selection.clear();
	}

	deleteComTWater(_item: ComTWaterModel) {
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
			const deleteFlag = this.service.deleteFlagComTWater(_item).subscribe()
			if (deleteFlag){
				this.loadComTWaterList();
				this.subscriptions.push(deleteFlag);
				this.layoutUtilsService.showActionNotification(_deleteMessage, MessageType.Delete);
			}
		});
	}

	editComTWater(id) {
		this.router.navigate(['edit', id], { relativeTo: this.activatedRoute });
	}
	ngOnDestroy() {
		this.subscriptions.forEach(sb => sb.unsubscribe());
	}
	
	export() {
		this.service.exportExcel();
	}
}
