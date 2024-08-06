import {Component, OnDestroy, OnInit, ViewChild, ElementRef, ChangeDetectorRef} from '@angular/core';
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
import {Store, select, createFeatureSelector} from '@ngrx/store';
import { AppState } from '../../../../core/reducers';

// Services
import { LayoutUtilsService, MessageType, QueryParamsModel } from '../../../../core/_base/crud';
import {VehicleTypeDataSource} from '../../../../core/vehicletype/vehicletype.datasource.js';
import {VehicleTypeModel} from '../../../../core/vehicletype/vehicletype.model';
import {SubheaderService} from '../../../../core/_base/layout';
import {VehicleTypeService} from '../../../../core/vehicletype/vehicletype.service';
import {VehicleTypeDeleted, VehicleTypePageRequested} from "../../../../core/vehicletype/vehicletype.action";

@Component({
  selector: 'kt-list-vehicletype',
  templateUrl: './list-vehicletype.component.html',
  styleUrls: ['./list-vehicletype.component.scss']
})
export class ListVehicletypeComponent implements OnInit, OnDestroy {
	dataSource: VehicleTypeDataSource;
	
	displayedColumns = ['nmvhtp', 'vhttype', 'vhtprate', 'actions'];
	@ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
	@ViewChild('sort1', {static: true}) sort: MatSort;
	// Filter fields
	@ViewChild('searchInput', {static: true}) searchInput: ElementRef;
	lastQuery: QueryParamsModel;
	// Selection
	selection = new SelectionModel<VehicleTypeModel>(true, []);
	vehicleTypeResult: VehicleTypeModel[] = [];
	// Subscriptions
	data = localStorage.getItem("currentUser");
	dataUser = JSON.parse(this.data)
	role = this.dataUser.role
	private subscriptions: Subscription[] = [];
	constructor(
		private activatedRoute: ActivatedRoute,
		private store: Store<AppState>,
		private router: Router,
		private service: VehicleTypeService,
		private layoutUtilsService: LayoutUtilsService,
		private subheaderService: SubheaderService,
		private cdr: ChangeDetectorRef
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
				this.loadVehicleTypeList();
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
				this.loadVehicleTypeList();
			})
		).subscribe();
		this.subscriptions.push(searchSubscription);

		// Set title to page breadCrumbs
		this.subheaderService.setTitle('Vehicle');

		// Init DataSource
		this.dataSource = new VehicleTypeDataSource(this.store);
		const entitiesSubscription = this.dataSource.entitySubject.pipe(
			skip(1),
			distinctUntilChanged()
		).subscribe(res => {
			this.vehicleTypeResult = res;
		});
		this.subscriptions.push(entitiesSubscription);

		// First Load
		// of(undefined).pipe(take(1), delay(1000)).subscribe(() => { // Remove this line, just loading imitation
		// 	this.loadVehicleTypeList();
		// });
		this.loadVehicleTypeList();
	}

	goBackWithId() {
		const url = `/vehicletype`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}

	filterConfiguration(): any {
		const filter: any = {};
		const searchText: string = this.searchInput.nativeElement.value.toLowerCase();

		filter.nmvhtp = searchText;
		return filter;
	}
	loadVehicleTypeList() {
		this.selection.clear();
		const queryParams = new QueryParamsModel(
			this.filterConfiguration(),
			this.sort.direction,
			this.sort.active,
			this.paginator.pageIndex+1,
			this.paginator.pageSize
		);
		this.store.dispatch(new VehicleTypePageRequested({ page: queryParams }));
		this.selection.clear();
	}
	deleteVehicleType(_item: VehicleTypeModel) {
		// tslint:disable-next-line:variable-name
		const _title = 'Vehicle Delete';
		// tslint:disable-next-line:variable-name
		const _description = 'Are you sure to permanently delete this vehicle ?';
		const _waitDesciption = 'Vehicle is deleting...';
		const _deleteMessage = `Vehicle has been deleted`;

		const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				return;
				
			}
			
			this.store.dispatch(new VehicleTypeDeleted({ id: _item._id }));
			this.loadVehicleTypeList();
			this.layoutUtilsService.showActionNotification(_deleteMessage, MessageType.Delete);
				
		});
	}

	masterToggle() {
		if (this.selection.selected.length === this.vehicleTypeResult.length) {
			this.selection.clear();
		} else {
			this.vehicleTypeResult.forEach(row => this.selection.select(row));
		}
	}

	editVehicleType(id) {
		this.router.navigate(['edit', id], { relativeTo: this.activatedRoute });
	}

	viewVehicleType(id) {
		this.router.navigate(['view', id], { relativeTo: this.activatedRoute });
	}
	ngOnDestroy() {
		this.subscriptions.forEach(sb => sb.unsubscribe());
	}

}
