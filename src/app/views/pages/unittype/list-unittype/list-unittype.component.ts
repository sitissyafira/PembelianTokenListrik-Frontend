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

import { UnitTypeModel } from '../../../../core/unittype/unittype.model';
import { UnitTypeDeleted, UnitTypePageRequested} from '../../../../core/unittype/unittype.action';
import {UnitTypeDataSource} from '../../../../core/unittype/unittype.datasource';
import {SubheaderService} from '../../../../core/_base/layout';
import {UnitTypeService} from '../../../../core/unittype/unittype.service';
import { HttpClient } from '@angular/common/http';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'kt-list-unittype',
  templateUrl: './list-unittype.component.html',
  styleUrls: ['./list-unittype.component.scss']
})
export class ListUnittypeComponent implements OnInit, OnDestroy {
	file;
	dataSource: UnitTypeDataSource;
	displayedColumns = [ 'unttp', 'untsqr','actions'];
	@ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
	@ViewChild('sort1', {static: true}) sort: MatSort;
	// Filter fields
	@ViewChild('searchInput', {static: true}) searchInput: ElementRef;
	lastQuery: QueryParamsModel;
	data = localStorage.getItem("currentUser");
	dataUser = JSON.parse(this.data)
	role = this.dataUser.role
	selection = new SelectionModel<UnitTypeModel>(true, []);
	unitTypeResult: UnitTypeModel[] = [];
	// Subscriptions
	private subscriptions: Subscription[] = [];
  	constructor(
		private activatedRoute: ActivatedRoute,
		private store: Store<AppState>,
		private router: Router,
		private service: UnitTypeService,
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
				this.loadUnitTypeList();
			})
		)
			.subscribe();
		this.subscriptions.push(paginatorSubscriptions);


		// Filtration, bind to searchInput
		const searchSubscription = fromEvent(this.searchInput.nativeElement, 'keyup').pipe(
			// tslint:disable-next-line:max-line-length
			debounceTime(150), // The user can type quite quickly in the input box, and that could trigger a lot of server requests. With this operator, we are limiting the amount of server requests emitted to a maximum of one every 150ms
			distinctUntilChanged(), // This operator will eliminate duplicate values
			tap(() => {
				this.paginator.pageIndex = 0;
				this.loadUnitTypeList();
			})
		).subscribe();
		this.subscriptions.push(searchSubscription);

		// Set title to page breadCrumbs
		this.subheaderService.setTitle('Unit Type');

		// Init DataSource
		this.dataSource = new UnitTypeDataSource(this.store);
		const entitiesSubscription = this.dataSource.entitySubject.pipe(
			skip(1),
			distinctUntilChanged()
		).subscribe(res => {
			this.unitTypeResult = res;
		});
		this.subscriptions.push(entitiesSubscription);
		this.loadUnitTypeList();
  	}

	filterConfiguration(): any {
		const filter: any = {};
		const searchText: string = this.searchInput.nativeElement.value.toLowerCase();

		filter.unttp = `${searchText}`;
		return filter;
	}

	loadUnitTypeList(){
		this.selection.clear();
		const queryParams = new QueryParamsModel(
			this.filterConfiguration(),
			this.sort.direction,
			this.sort.active,
			this.paginator.pageIndex+1,
			this.paginator.pageSize
		);
		this.store.dispatch(new UnitTypePageRequested({ page: queryParams }));
		this.selection.clear();
	}

	deleteUnitType(_item: UnitTypeModel) {
		// tslint:disable-next-line:variable-name
		const _title = 'Unit Type Delete';
		// tslint:disable-next-line:variable-name
		const _description = 'Are you sure to permanently delete this unit type?';
		const _waitDesciption = 'Unit type is deleting...';
		const _deleteMessage = `Unit type has been deleted`;

		const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				return;
			}
			
			this.store.dispatch(new UnitTypeDeleted({ id: _item._id }));
			this.layoutUtilsService.showActionNotification(_deleteMessage, MessageType.Delete);
		});
	}

	editUnitType(id) {
		this.router.navigate(['edit', id], { relativeTo: this.activatedRoute });
	}
	viewUnitType(id) {
		this.router.navigate(['view', id], { relativeTo: this.activatedRoute });
	}

	export(){
		this.service.exportExcel();
	}

  	ngOnDestroy() {
		this.subscriptions.forEach(sb => sb.unsubscribe());
	}

	
}
