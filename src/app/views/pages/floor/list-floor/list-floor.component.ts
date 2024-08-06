// Angular
import { Component, OnInit, ElementRef, ViewChild, ChangeDetectionStrategy, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
// Material
import { SelectionModel } from '@angular/cdk/collections';
import { MatPaginator, MatSort, MatSnackBar } from '@angular/material';
import {NgbModal, ModalDismissReasons} from '@ng-bootstrap/ng-bootstrap';
// RXJS
import { debounceTime, distinctUntilChanged, tap, skip, take, delay } from 'rxjs/operators';
import { fromEvent, merge, Observable, of, Subscription } from 'rxjs';
// LODASH
import { each, find } from 'lodash';
// NGRX
import { Store, select } from '@ngrx/store';
import { AppState } from '../../../../core/reducers';

// Services
import { LayoutUtilsService, MessageType, QueryParamsModel } from '../../../../core/_base/crud';

import { BuildingModel} from '../../../../core/building/building.model';
import { FloorDeleted, FloorPageRequested} from '../../../../core/floor/floor.action';
import { selectFloorById, } from '../../../../core/floor/floor.selector';
import { SubheaderService } from '../../../../core/_base/layout';
import {FloorDataSource} from '../../../../core/floor/floor.datasource';
import {QueryFloorModel} from '../../../../core/floor/queryfloor.model';
import {FloorModel} from '../../../../core/floor/floor.model';
import {FloorService} from '../../../../core/floor/floor.service';
import {BuildingService} from '../../../../core/building/building.service';
import {BuildingDataSource} from '../../../../core/building/building.datasource';
import {QueryBuildingModel} from '../../../../core/building/querybuilding.model';
import {BuildingDeleted, BuildingPageRequested} from '../../../../core/building/building.action';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'kt-list-floor',
  templateUrl: './list-floor.component.html',
  styleUrls: ['./list-floor.component.scss']
})
export class ListFloorComponent implements OnInit, OnDestroy {
	file;
	dataSource: FloorDataSource;
	displayedColumns = ['nmblk', 'cdblk', 'cdflr', 'nmflr', 'actions'];
	@ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
	@ViewChild('sort1', {static: true}) sort: MatSort;
	@ViewChild('searchInput', {static: true}) searchInput: ElementRef;
	lastQuery: QueryFloorModel;
	selection = new SelectionModel<FloorModel>(true, []);
	floorResult: FloorModel[] = [];
	bldRes: BuildingModel;
	data = localStorage.getItem("currentUser");
	dataUser = JSON.parse(this.data)
	role = this.dataUser.role

	private subscriptions: Subscription[] = [];
	constructor(
		private activatedRoute: ActivatedRoute,
		private store: Store<AppState>,
		private router: Router,
		private service: FloorService,
		private serviceBuilding: BuildingService,
		private layoutUtilsService: LayoutUtilsService,
		private subheaderService: SubheaderService,
		private cdr: ChangeDetectorRef,
		private http: HttpClient,
		private modalService: NgbModal
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
				this.loadFloorList();
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
				this.loadFloorList();
			})
		).subscribe();
		this.subscriptions.push(searchSubscription);
		// Set title to page breadCrumbs
		this.subheaderService.setTitle('Floor');
		// Init DataSource
		this.dataSource = new FloorDataSource(this.store);
		const entitiesSubscription = this.dataSource.entitySubject.pipe(
			skip(1),
			distinctUntilChanged()
		).subscribe(res => {
			this.floorResult = res;
		});
		this.subscriptions.push(entitiesSubscription);
		this.loadFloorList();
	}

	loadFloorList() {
		this.selection.clear();
		const queryParams = new QueryFloorModel(
			this.filterConfiguration(),
			this.sort.direction,
			this.sort.active,
			this.paginator.pageIndex + 1,
			this.paginator.pageSize
		);
		this.store.dispatch(new FloorPageRequested({ page: queryParams }));
		this.selection.clear();
	}
	/** FILTRATION */
	filterConfiguration(): any {
		const filter: any = {};
		const searchText: string = this.searchInput.nativeElement.value.toLowerCase();

		filter.cdflr = `${searchText}`;
		return filter;
	}

	deleteFloor(_item: FloorModel) {
		// tslint:disable-next-line:variable-name
		const _title = 'Floor Delete';
		// tslint:disable-next-line:variable-name
		const _description = 'Are you sure to permanently delete this floor?';
		const _waitDesciption = 'Floor is deleting...';
		const _deleteMessage = `Floor has been deleted`;

		const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				return;
			}

			this.store.dispatch(new FloorDeleted({ id: _item._id }));
			this.layoutUtilsService.showActionNotification(_deleteMessage, MessageType.Delete);
		});
	}
	

	editFloor(id) {
		this.router.navigate(['edit', id], { relativeTo: this.activatedRoute });
	}

	viewFloor(id) {
		this.router.navigate(['view', id], { relativeTo: this.activatedRoute });
	}
	ngOnDestroy() {
		this.subscriptions.forEach(sb => sb.unsubscribe());
	}
	export(){
		this.service.exportExcel();
	}

	openLarge(content) {
		this.modalService.open(content, {
			size: 'lg'
		});
	}

	selectFile(event) {
		if(event.target.files.length > 0) {
			const file = event.target.files[0];
			this.file = file;
		}
	}

	onSubmit(){
		const formData = new FormData();
		formData.append('file', this.file);

		this.http.post<any>(`${environment.baseAPI}/api/excel/floor/import`, formData).subscribe(
			res =>{
				const message = `file successfully has been import.`;
	 			this.layoutUtilsService.showActionNotification(message, MessageType.Create, 2000, true, true);
				this.ngOnInit();
			},
			err => {
				console.error(err);
				const message = 'Error while importing File | ' + err.statusText;
				this.layoutUtilsService.showActionNotification(message, MessageType.Create, 2000, true, false);
				}
		)
	}
}
