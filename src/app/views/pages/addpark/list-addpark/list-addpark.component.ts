import { Component, OnInit, ElementRef, ViewChild, ChangeDetectionStrategy, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SelectionModel } from '@angular/cdk/collections';
import { MatPaginator, MatSort} from '@angular/material';
import { debounceTime, distinctUntilChanged, tap, skip} from 'rxjs/operators';
import { fromEvent, merge,Subscription } from 'rxjs';
import { Store} from '@ngrx/store';
import { AppState } from '../../../../core/reducers';
import { LayoutUtilsService, MessageType, QueryParamsModel } from '../../../../core/_base/crud';
import { AddparkModel } from '../../../../core/addpark/addpark.model';
import { AddparkDeleted, AddparkPageRequested} from '../../../../core/addpark/addpark.action';
import {AddparkDataSource} from '../../../../core/addpark/addpark.datasource';
import {SubheaderService} from '../../../../core/_base/layout';
import {AddparkService} from '../../../../core/addpark/addpark.service';
import { HttpClient } from '@angular/common/http';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { QueryAddparkModel } from '../../../../core/addpark/queryaddpark.model';

@Component({
  selector: 'kt-list-addpark',
  templateUrl: './list-addpark.component.html',
  styleUrls: ['./list-addpark.component.scss']
})
export class ListAddParkComponent implements OnInit, OnDestroy {
	file;
	dataSource: AddparkDataSource;
	displayedColumns = [ 'block', 'unit', 'customer', 'vehicle', 'parkingRate','status','actions'];
	@ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
	@ViewChild('sort1', {static: true}) sort: MatSort;
	@ViewChild('searchInput', {static: true}) searchInput: ElementRef;
	lastQuery: QueryParamsModel;
	selection = new SelectionModel<AddparkModel>(true, []);
	addparkResult: AddparkModel[] = [];
	data = localStorage.getItem("currentUser");
	dataUser = JSON.parse(this.data)
	role = this.dataUser.role

	private subscriptions: Subscription[] = [];
  	constructor(
		private activatedRoute: ActivatedRoute,
		private store: Store<AppState>,
		private router: Router,
		private service: AddparkService,
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
				this.loadAddparkList();
			})
		)
			.subscribe();
		this.subscriptions.push(paginatorSubscriptions);
		const searchSubscription = fromEvent(this.searchInput.nativeElement, 'keyup').pipe(
			
			debounceTime(50), 
			distinctUntilChanged(),
			tap(() => {
				this.paginator.pageIndex = 0;
				this.loadAddparkList();
			})
		).subscribe();
		this.subscriptions.push(searchSubscription);
		this.subheaderService.setTitle('Parking');
		this.dataSource = new AddparkDataSource(this.store);
		const entitiesSubscription = this.dataSource.entitySubject.pipe(
			skip(1),
			distinctUntilChanged()
		).subscribe(res => {
			this.addparkResult = res;
		});
		this.subscriptions.push(entitiesSubscription);
		this.loadAddparkList();
  	}

	filterConfiguration(): any {
		// const filter: any = {};
		const searchText: string = this.searchInput.nativeElement.value.toLowerCase();

		// filter.unit2 = `${searchText}`;
		return searchText;
	}

	loadAddparkList(){
		this.selection.clear();
		const queryParams = new QueryAddparkModel(
			this.filterConfiguration(),
			this.sort.direction,
			this.sort.active,
			this.paginator.pageIndex+1,
			this.paginator.pageSize
		);
		this.store.dispatch(new AddparkPageRequested({ page: queryParams }));
		this.selection.clear();
	}

	deleteAddpark(_item: AddparkModel) {
		const _title = 'Parking Delete';
		const _description = 'Are you sure to permanently delete this parking?';
		const _waitDesciption = 'Parking is deleting...';
		const _deleteMessage = `Parking has been deleted`;

		const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				return;
				
			}
			this.store.dispatch(new AddparkDeleted({ id: _item._id }));
			this.layoutUtilsService.showActionNotification(_deleteMessage, MessageType.Delete);
			
		});
	}

	isAllSelected(): boolean {
		const numSelected = this.selection.selected.length;
		const numRows = this.addparkResult.length;
		return numSelected === numRows;
	}

	masterToggle() {
		if (this.selection.selected.length === this.addparkResult.length) {
			this.selection.clear();
		} else {
			this.addparkResult.forEach(row => this.selection.select(row));
		}
	}

	editAddpark(id) {
		this.router.navigate(['edit', id], { relativeTo: this.activatedRoute });
	}
	viewAddpark(id) {
		this.router.navigate(['view', id], { relativeTo: this.activatedRoute });
	}
	
  	ngOnDestroy() {
		this.subscriptions.forEach(sb => sb.unsubscribe());
	}

	export(){
		this.service.exportExcel();
	}
}
