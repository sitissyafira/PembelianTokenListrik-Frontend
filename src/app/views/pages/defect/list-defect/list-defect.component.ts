// Angular
import { Component, OnInit, ElementRef, ViewChild, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
// Material
import { SelectionModel } from '@angular/cdk/collections';
import { MatPaginator, MatSort, } from '@angular/material';
// RXJS
import { debounceTime, distinctUntilChanged, tap, skip, } from 'rxjs/operators';
import { fromEvent, merge, Subscription } from 'rxjs';
// NGRX
import { Store} from '@ngrx/store';
import { AppState } from '../../../../core/reducers';

//services
import { LayoutUtilsService, MessageType, QueryParamsModel } from '../../../../core/_base/crud';

import { DefectModel } from '../../../../core/defect/defect.model';
import { DefectDeleted, DefectPageRequested} from '../../../../core/defect/defect.action';
import {DefectDataSource} from '../../../../core/defect/defect.datasource';
import {SubheaderService} from '../../../../core/_base/layout';
import {DefectService} from '../../../../core/defect/defect.service';
import { HttpClient } from '@angular/common/http';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { QueryDefectModel } from '../../../../core/defect/querydefect.model';

@Component({
  selector: 'kt-list-defect',
  templateUrl: './list-defect.component.html',
  styleUrls: ['./list-defect.component.scss']
})
export class ListDefectComponent implements OnInit, OnDestroy {
	file;
	data = localStorage.getItem("currentUser");
	dataUser = JSON.parse(this.data)
	role = this.dataUser.role
	dataSource: DefectDataSource;
	displayedColumns = [ 'defectid', 'category', 'defect_name', 'actions'];
	@ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
	@ViewChild('sort1', {static: true}) sort: MatSort;
	@ViewChild('searchInput', {static: true}) searchInput: ElementRef;
	lastQuery: QueryParamsModel;
	selection = new SelectionModel<DefectModel>(true, []);
	defectResult: DefectModel[] = [];
	private subscriptions: Subscription[] = [];
  	constructor(
		private activatedRoute: ActivatedRoute,
		private store: Store<AppState>,
		private router: Router,
		private service: DefectService,
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
				this.loadDefectList();
			})
		)
			.subscribe();
		this.subscriptions.push(paginatorSubscriptions);

		const searchSubscription = fromEvent(this.searchInput.nativeElement, 'keyup').pipe(
			debounceTime(50), 
			tap(() => {
				this.paginator.pageIndex = 0;
				this.loadDefectList();
			})
		).subscribe();
		this.subscriptions.push(searchSubscription);
		this.subheaderService.setTitle('Detail Location');
		this.dataSource = new DefectDataSource(this.store);
		const entitiesSubscription = this.dataSource.entitySubject.pipe(
			skip(1),
			distinctUntilChanged()
		).subscribe(res => {
			this.defectResult = res;
		});
		this.subscriptions.push(entitiesSubscription);
		this.loadDefectList();
  	}

	filterConfiguration(): any {
		const filter: any = {};
		const searchText: string = this.searchInput.nativeElement.value.toLowerCase();
		filter.defect_name = `${searchText}`;
		return filter;
	}

	loadDefectList(){
		this.selection.clear();
		const queryParams = new QueryDefectModel(
			this.filterConfiguration(),
			this.sort.direction,
			this.sort.active,
			this.paginator.pageIndex+1,
			this.paginator.pageSize
		);
		this.store.dispatch(new DefectPageRequested({ page: queryParams }));
		this.selection.clear();
	}

	deleteDefect(_item: DefectModel) {
		const _title = 'Detail Location Delete';
		const _description = 'Are you sure to permanently delete this detail location?';
		const _waitDesciption = 'Detail location is deleting...';
		const _deleteMessage = `Detail location has been deleted`;

		const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				return;
			}

			this.store.dispatch(new DefectDeleted({ id: _item._id }));
			this.layoutUtilsService.showActionNotification(_deleteMessage, MessageType.Delete);
			this.ngOnInit();
		});
	}

	isAllSelected(): boolean {
		const numSelected = this.selection.selected.length;
		const numRows = this.defectResult.length;
		return numSelected === numRows;
	}

	masterToggle() {
		if (this.selection.selected.length === this.defectResult.length) {
			this.selection.clear();
		} else {
			this.defectResult.forEach(row => this.selection.select(row));
		}
	}

	editDefect(id) {
		this.router.navigate(['edit', id], { relativeTo: this.activatedRoute });
	}

	viewDefect(id) {
		this.router.navigate(['view', id], { relativeTo: this.activatedRoute });
	}
  	ngOnDestroy() {
		this.subscriptions.forEach(sb => sb.unsubscribe());
	}
	export(){
		this.service.exportExcel();
	}
}
