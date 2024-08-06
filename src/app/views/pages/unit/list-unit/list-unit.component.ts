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
import { UnitDeleted, UnitPageRequested} from '../../../../core/unit/unit.action';
import { selectUnitById, } from '../../../../core/unit/unit.selector';
import { SubheaderService } from '../../../../core/_base/layout';
import {UnitDataSource} from '../../../../core/unit/unit.datasource';
import {QueryUnitModel} from '../../../../core/unit/queryunit.model';
import {UnitModel} from '../../../../core/unit/unit.model';
import {UnitService} from '../../../../core/unit/unit.service';
import {BuildingService} from '../../../../core/building/building.service';
import {FloorDataSource} from '../../../../core/floor/floor.datasource';
import {QueryFloorModel} from '../../../../core/floor/queryfloor.model';
import {FloorDeleted, FloorPageRequested} from '../../../../core/floor/floor.action';
import {FloorModel} from '../../../../core/floor/floor.model';
import { environment } from '../../../../../environments/environment';
import Filesaver from 'file-saver';

@Component({
  selector: 'kt-list-unit',
  templateUrl: './list-unit.component.html',
  styleUrls: ['./list-unit.component.scss']
})
export class ListUnitComponent implements OnInit, OnDestroy {
	file;
	dataSource: UnitDataSource;
	displayedColumns = ['cdunt', 'floor', 'unitType', 'unitSize','actions'];
	@ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
	@ViewChild('sort1', {static: true}) sort: MatSort;
	// Filter fields
	@ViewChild('searchInput', {static: true}) searchInput: ElementRef;
	lastQuery: QueryUnitModel;
	// Selection
	selection = new SelectionModel<UnitModel>(true, []);
	unitResult: UnitModel[] = [];
	bldRes: BuildingModel;

	data = localStorage.getItem("currentUser");
	dataUser = JSON.parse(this.data);
	role = this.dataUser.role;

	isButtonActive: boolean = true;
	// Subscriptions
	private subscriptions: Subscription[] = [];
	constructor(
		private activatedRoute: ActivatedRoute,
		private store: Store<AppState>,
		private router: Router,
		private service: UnitService,
		private serviceBuilding: BuildingService,
		private layoutUtilsService: LayoutUtilsService,
		private subheaderService: SubheaderService,
		private cdr: ChangeDetectorRef,
		private http: HttpClient,
		private modalService: NgbModal,
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
				this.loadUnitList();
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
				this.loadUnitList();
			})
		).subscribe();
		this.subscriptions.push(searchSubscription);

		// Set title to page breadCrumbs
		this.subheaderService.setTitle('Unit');

		// Init DataSource
		this.dataSource = new UnitDataSource(this.store);
		const entitiesSubscription = this.dataSource.entitySubject.pipe(
			skip(1),
			distinctUntilChanged()
		).subscribe(res => {
			this.unitResult = res;
		});
		this.subscriptions.push(entitiesSubscription);
		this.loadUnitList();
	}

	loadUnitList() {
		this.selection.clear();
		const queryParams = new QueryUnitModel(
			this.filterConfiguration(),
			this.sort.direction,
			this.sort.active,
			this.paginator.pageIndex+1,
			this.paginator.pageSize
		);
		this.store.dispatch(new UnitPageRequested({ page: queryParams }));
		this.selection.clear();
	}
	filterConfiguration(): any {
		const filter: any = {};
		const searchText: string = this.searchInput.nativeElement.value.toUpperCase();

		filter.cdunt = `${searchText}`;
		return filter;
	}

	deleteUnit(_item: UnitModel) {
		// tslint:disable-next-line:variable-name
		const _title = 'Unit Delete';
		// tslint:disable-next-line:variable-name
		const _description = 'Are you sure to permanently delete this unit?';
		const _waitDesciption = 'Unit is deleting...';
		const _deleteMessage = `Unit has been deleted`;

		const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				return;
			}

			this.store.dispatch(new UnitDeleted({ id: _item._id }));
			this.layoutUtilsService.showActionNotification(_deleteMessage, MessageType.Delete);
		});
	}
	
	editUnit(id) {
		this.router.navigate(['edit', id], { relativeTo: this.activatedRoute });
	}
	viewUnit(id) {
		this.router.navigate(['view', id], { relativeTo: this.activatedRoute });
	}
	ngOnDestroy() {
		this.subscriptions.forEach(sb => sb.unsubscribe());
	}
	export(){
		this.service.exportExcel();
		// const url = `${environment.baseAPI}/api/excel/project/export`;
		// return url;
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

  downloadTemplate() {
		const _exportMsg = 'File import template unit has been downloaded';
   	const _msgType = MessageType.Read;

    this.isButtonActive = false;

		this.service.downloadTemplate().subscribe(
			resp => {
				Filesaver.saveAs(resp, `import-unit.xlsx`);
				this.layoutUtilsService.showActionNotification(_exportMsg, _msgType, 5000, true, true);

        this.isButtonActive = true;
        this.cdr.markForCheck();

			},
			err => {

        this.isButtonActive = true;
        this.cdr.markForCheck();
			}
		);
		// this.layoutUtilsService.showActionNotification(_exportMsg, _msgType);
		// this.isButtonActive = true;
		// this.cdr.markForCheck();
  }

	onSubmit(){
		const formData = new FormData();
		formData.append('file', this.file);
		this.http.post<any>(`${environment.baseAPI}/api/excel/unit/import`, formData).subscribe(
			res =>{
				const message = `file successfully has been import.`;
	 			this.layoutUtilsService.showActionNotification(message, MessageType.Create, 5000, true, true);
				this.loadUnitList();
			},
			err => {
				console.error(err);
				const message = 'Error while importing File | ' + err.statusText;
				this.layoutUtilsService.showActionNotification(message, MessageType.Create, 5000, true, false);
				}
		)
	}

}
