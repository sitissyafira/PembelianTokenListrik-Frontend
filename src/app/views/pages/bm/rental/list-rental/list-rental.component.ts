import { Component, OnInit, ElementRef, ViewChild, ChangeDetectionStrategy, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SelectionModel } from '@angular/cdk/collections';
import { MatPaginator, MatSort, MatSnackBar } from '@angular/material';
import { debounceTime, distinctUntilChanged, tap, skip, take, delay } from 'rxjs/operators';
import { fromEvent, merge, Observable, of, Subscription } from 'rxjs';
import { Store, select } from '@ngrx/store';
import { AppState } from '../../../../../core/reducers';
import { LayoutUtilsService, MessageType, QueryParamsModel } from '../../../../../core/_base/crud';
import { RentalModel } from '../../../../../core/bm/rental/rental.model';
import { RentalDeleted, RentalPageRequested} from '../../../../../core/bm/rental/rental.action';
import {RentalDataSource} from '../../../../../core/bm/rental/rental.datasource';
import {SubheaderService} from '../../../../../core/_base/layout';
import {RentalService} from '../../../../../core/bm/rental/rental.service';
import { HttpClient } from '@angular/common/http';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { QueryRentalModel } from '../../../../../core/bm/rental/queryrental.model';

@Component({
  selector: 'kt-list-rental',
  templateUrl: './list-rental.component.html',
  styleUrls: ['./list-rental.component.scss']
})
export class ListRentalComponent implements OnInit, OnDestroy {
	file;
	dataSource: RentalDataSource;
	displayedColumns = [ 'revenueCode', 'unit', 'tenant', 'revenue','actions'];
	@ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
	@ViewChild('sort1', {static: true}) sort: MatSort;
	@ViewChild('searchInput', {static: true}) searchInput: ElementRef;
	lastQuery: QueryParamsModel;
	selection = new SelectionModel<RentalModel>(true, []);
	rentalResult: RentalModel[] = [];
	data = localStorage.getItem("currentUser");
	dataUser = JSON.parse(this.data)
	role = this.dataUser.role
	private subscriptions: Subscription[] = [];
  	constructor(
		private activatedRoute: ActivatedRoute,
		private store: Store<AppState>,
		private router: Router,
		private service: RentalService,
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
				this.loadRentalList();
			})
		)
			.subscribe();
		this.subscriptions.push(paginatorSubscriptions);
		const searchSubscription = fromEvent(this.searchInput.nativeElement, 'keyup').pipe(
			
			debounceTime(50),
			distinctUntilChanged(), 
			tap(() => {
				this.paginator.pageIndex = 0;
				this.loadRentalList();
			})
		).subscribe();
		this.subscriptions.push(searchSubscription);
		this.subheaderService.setTitle('Revenue');
		this.dataSource = new RentalDataSource(this.store);
		const entitiesSubscription = this.dataSource.entitySubject.pipe(
			skip(1),
			distinctUntilChanged()
		).subscribe(res => {
			this.rentalResult = res;
		});
		this.subscriptions.push(entitiesSubscription);
		this.loadRentalList();
  	}

	filterConfiguration(): any {
		const filter: any = {};
		const searchText: string = this.searchInput.nativeElement.value.toLowerCase();

		filter.unit = `${searchText}`;
		return filter;
	}

	loadRentalList(){
		this.selection.clear();
		const queryParams = new QueryRentalModel(
			this.filterConfiguration(),
			this.sort.direction,
			this.sort.active,
			this.paginator.pageIndex+1,
			this.paginator.pageSize
		);
		this.store.dispatch(new RentalPageRequested({ page: queryParams }));
		this.selection.clear();
	}

	deleteRental(_item: RentalModel) {
		const _title = 'Revenue Delete';
		const _description = 'Are you sure to permanently delete this revenue?';
		const _waitDesciption = 'Revenue is deleting...';
		const _deleteMessage = `Revenue has been deleted`;

		const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				return;
			}

			this.store.dispatch(new RentalDeleted({ id: _item._id }));
			this.ngOnInit();
			this.layoutUtilsService.showActionNotification(_deleteMessage, MessageType.Delete);
		});
	}

	isAllSelected(): boolean {
		const numSelected = this.selection.selected.length;
		const numRows = this.rentalResult.length;
		return numSelected === numRows;
	}

	masterToggle() {
		if (this.selection.selected.length === this.rentalResult.length) {
			this.selection.clear();
		} else {
			this.rentalResult.forEach(row => this.selection.select(row));
		}
	}

	editRental(id) {
		this.router.navigate(['edit', id], { relativeTo: this.activatedRoute });
	}

	viewRental(id) {
		this.router.navigate(['view', id], { relativeTo: this.activatedRoute });
	}
	
  	ngOnDestroy() {
		this.subscriptions.forEach(sb => sb.unsubscribe());
	}


	export(){
		this.service.exportExcel();
	}
	
}
