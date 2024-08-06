import { Component, OnInit, ElementRef, ViewChild, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SelectionModel } from '@angular/cdk/collections';
import { MatPaginator, MatSort,} from '@angular/material';
import { debounceTime, distinctUntilChanged, tap, skip, } from 'rxjs/operators';
import { fromEvent, merge,Subscription } from 'rxjs';
import { Store,} from '@ngrx/store';
import { AppState } from '../../../../../core/reducers';
import { LayoutUtilsService, MessageType, QueryParamsModel } from '../../../../../core/_base/crud';
import { HttpClient } from '@angular/common/http';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { SubheaderService } from '../../../../../core/_base/layout';
import { LocationBuildingModel } from '../../../../../core/masterData/locationBuilding/locationBuilding.model';
import { LocationBuildingPageRequested } from '../../../../../core/masterData/locationBuilding/locationBuilding.action';
import { LocationBuildingDataSource } from '../../../../../core/masterData/locationBuilding/locationBuilding.datasource';
import { LocationBuildingService } from '../../../../../core/masterData/locationBuilding/locationBuilding.service';
import { QueryLocationBuildingModel } from '../../../../../core/masterData/locationBuilding/querylocationBuilding.model';
import { environment } from '../../../../../../environments/environment';


@Component({
	selector: 'kt-list-locationBuilding',
	templateUrl: './list-locationBuilding.component.html',
	styleUrls: ['./list-locationBuilding.component.scss']
})

export class ListLocationBuildingComponent implements OnInit, OnDestroy {
	data = localStorage.getItem("currentUser");
	dataUser = JSON.parse(this.data)
	dataID = this.dataUser.roleId
	file;
	dataSource: LocationBuildingDataSource;
	displayedColumns = [
	'name',
	'address',
	'coordinates',
	'radius',
	'actions'];
	@ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
	@ViewChild('sort1', { static: true }) sort: MatSort;
	@ViewChild('searchInput', { static: true }) searchInput: ElementRef;
	lastQuery: QueryParamsModel;
	selection = new SelectionModel<LocationBuildingModel>(true, []);
	locationBuildingResult: LocationBuildingModel[] = [];
	private subscriptions: Subscription[] = [];
	constructor(
		private activatedRoute: ActivatedRoute,
		private store: Store<AppState>,
		private router: Router,
		private service: LocationBuildingService,
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
				this.loadLocationBuildingList();
			})
		)
		.subscribe();
		this.subscriptions.push(paginatorSubscriptions);
		const searchSubscription = fromEvent(this.searchInput.nativeElement, 'keyup').pipe(
			debounceTime(500), 
			distinctUntilChanged(),
			tap(() => {
				this.paginator.pageIndex = 0;
				this.loadLocationBuildingList();
			})
		).subscribe();
		this.subscriptions.push(searchSubscription);
		this.subheaderService.setTitle('Location Building');
		this.dataSource = new LocationBuildingDataSource(this.store);
		const entitiesSubscription = this.dataSource.entitySubject.pipe(
			skip(1),
			distinctUntilChanged()
		).subscribe(
			res => {
			this.locationBuildingResult = res;
			}, 
			err => {
			alert('error');		
		}
		);
		this.subscriptions.push(entitiesSubscription);
		this.loadLocationBuildingList();
	}

	filterConfiguration(): any {
		const search: string = this.searchInput.nativeElement.value.toLowerCase();
		return search;
	}

	loadLocationBuildingList() {
		this.selection.clear();
		const queryParams = new QueryLocationBuildingModel(
			this.filterConfiguration(),
			this.paginator.pageIndex + 1,
			this.paginator.pageSize
		);
		this.store.dispatch(new LocationBuildingPageRequested({ page: queryParams }));
		this.selection.clear();
	}

	refresh(){
		this.loadLocationBuildingList();
	}

	deleteLocationBuilding(_item: LocationBuildingModel) {
		const _title = 'LocationBuilding Delete';
		const _description = 'Are you sure to permanently delete this locationBuilding?';
		const _waitDesciption = 'LocationBuilding is deleting...';
		const _deleteMessage = `LocationBuilding has been deleted`;
		const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				return;
			}
			const deleteFlag = this.service.deleteFlagLocationBuilding(_item).subscribe()
			this.subscriptions.push(deleteFlag);
			this.layoutUtilsService.showActionNotification(_deleteMessage, MessageType.Delete);
			this.loadLocationBuildingList();
		});
	}

	editLocationBuilding(id) {
		this.router.navigate(['edit', id], { relativeTo: this.activatedRoute });
	}
	ngOnDestroy() {
		this.subscriptions.forEach(sb => sb.unsubscribe());
	}
	export() {
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
		formData.append('created_by', this.dataID)
		
		this.http.post<any>(`${environment.baseAPI}/api/locationBuilding/upload/xlsx`, formData).subscribe(
			res =>{
				const message = res.status;
	 			this.layoutUtilsService.showActionNotification(message, MessageType.Create, 2000, true, true);
				this.file = undefined;
				if (message){
					this.ngOnInit();
				}
			},
			err => {
				console.error(err);
				const message = 'Error while importing File | ' + err.error.message;
				this.layoutUtilsService.showActionNotification(message, MessageType.Create, 2000, true, false);
				}
		)
	}
}
