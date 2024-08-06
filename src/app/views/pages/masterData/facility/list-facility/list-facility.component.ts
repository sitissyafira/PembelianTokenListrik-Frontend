import { Component, OnInit, ElementRef, ViewChild,OnDestroy, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SelectionModel } from '@angular/cdk/collections';
import { MatPaginator, MatSort, } from '@angular/material';
import { debounceTime, distinctUntilChanged, tap, skip,} from 'rxjs/operators';
import { fromEvent, merge, Subscription } from 'rxjs';

import { Store} from '@ngrx/store';
import { AppState } from '../../../../../core/reducers';
import { LayoutUtilsService, MessageType, QueryParamsModel } from '../../../../../core/_base/crud';
import { SubheaderService } from '../../../../../core/_base/layout';
import { HttpClient } from '@angular/common/http';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FacilityDataSource } from '../../../../../core/masterData/facility/facility.datasource';
import { FacilityModel } from '../../../../../core/masterData/facility/facility.model';
import { FacilityService } from '../../../../../core/masterData/facility/facility.service';
import { QueryFacilityModel } from '../../../../../core/masterData/facility/queryfacility.model';
import { FacilityPageRequested } from '../../../../../core/masterData/facility/facility.action';

@Component({
	selector: 'kt-list-facility',
	templateUrl: './list-facility.component.html',
	styleUrls: ['./list-facility.component.scss']
})

export class ListFacilityComponent implements OnInit, OnDestroy {
	file;
	dataSource: FacilityDataSource;
	displayedColumns = [
		'facilityCode',
		'facilityName',
		'facilityNo',
	'actions'];
	@ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
	@ViewChild('sort1', { static: true }) sort: MatSort;
	@ViewChild('searchInput', { static: true }) searchInput: ElementRef;
	lastQuery: QueryParamsModel;
	selection = new SelectionModel<FacilityModel>(true, []);
	facilityResult: FacilityModel[] = [];
	data = localStorage.getItem("currentUser");
	dataUser = JSON.parse(this.data)
	role = this.dataUser.role
	private subscriptions: Subscription[] = [];
	constructor(
		private activatedRoute: ActivatedRoute,
		private store: Store<AppState>,
		private router: Router,
		private service: FacilityService,
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
				this.loadFacilityList();
			})
		)
		.subscribe();
		this.subscriptions.push(paginatorSubscriptions);
		const searchSubscription = fromEvent(this.searchInput.nativeElement, 'keyup').pipe(
			debounceTime(500), 
			distinctUntilChanged(), 
			tap(() => {
				this.paginator.pageIndex = 0;
				this.loadFacilityList();
			})
		).subscribe();
		this.subscriptions.push(searchSubscription);

		this.subheaderService.setTitle('Facility');

		this.dataSource = new FacilityDataSource(this.store);
		const entitiesSubscription = this.dataSource.entitySubject.pipe(
			skip(1),
			distinctUntilChanged()
		).subscribe(
			res => {
			this.facilityResult = res;
			}, 
			err => {
			alert('error');		
		}
		);
		this.subscriptions.push(entitiesSubscription);
		this.loadFacilityList();
	}

	filterConfiguration(): any {
		const searchNumber: string = this.searchInput.nativeElement.value.toLowerCase();
		return searchNumber;
	}

	loadFacilityList() {
		this.selection.clear();
		const queryParams = new QueryFacilityModel(
			this.filterConfiguration(),
			this.paginator.pageIndex + 1,
			this.paginator.pageSize
		);
		this.store.dispatch(new FacilityPageRequested({ page: queryParams }));
		this.selection.clear();
	}

	deleteFacility(_item: FacilityModel) {
		const _title = 'Facility Delete';
		const _description = 'Are you sure to permanently delete this facility?';
		const _waitDesciption = 'Facility is deleting...';
		const _deleteMessage = `Facility has been deleted`;
		const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				return;
			}
			
			const deleteFlag = this.service.deleteFacilityFlag(_item).subscribe()
			this.subscriptions.push(deleteFlag);
			this.layoutUtilsService.showActionNotification(_deleteMessage, MessageType.Delete);
			this.loadFacilityList();
		});
	}

	editFacility(id) {
		this.router.navigate(['edit', id], { relativeTo: this.activatedRoute });
	}

	viewFacility(id) {
		this.router.navigate(['view', id], { relativeTo: this.activatedRoute });
	}

	ngOnDestroy() {
		this.subscriptions.forEach(sb => sb.unsubscribe());
	}


	export() {
		this.service.exportExcel();
	}

}
