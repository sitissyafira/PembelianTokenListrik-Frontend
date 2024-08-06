import { Component, OnInit, ElementRef, ViewChild, ChangeDetectionStrategy, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SelectionModel } from '@angular/cdk/collections';
import { MatPaginator, MatSort, MatSnackBar } from '@angular/material';
import { debounceTime, distinctUntilChanged, tap, skip, take, delay } from 'rxjs/operators';
import { fromEvent, merge, Observable, of, Subscription } from 'rxjs';
import { Store, select } from '@ngrx/store';
import { AppState } from '../../../../../core/reducers';
import { LayoutUtilsService, MessageType, QueryParamsModel } from '../../../../../core/_base/crud';

import { AmDeleted, AmPageRequested} from '../../../../../core/asset/assetManagement/am.action';
import {AmDataSource} from '../../../../../core/asset/assetManagement/am.datasource';
import {SubheaderService} from '../../../../../core/_base/layout';
import {AmService} from '../../../../../core/asset/assetManagement/am.service';
import { HttpClient } from '@angular/common/http';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { QueryAmModel } from '../../../../../core/asset/assetManagement/queryam.model';
import { AmModel } from '../../../../../core/asset/assetManagement/am.model';
import { environment } from '../../../../../../environments/environment';

@Component({
  selector: 'kt-list-am',
  templateUrl: './list-am.component.html',
  styleUrls: ['./list-am.component.scss']
})
export class ListAmComponent implements OnInit, OnDestroy {
	file;
	dataSource: AmDataSource;
	displayedColumns = [ 'select','assetCode', 'assetName', 'qty', 'assetType','createdDate','actions'];
	@ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
	@ViewChild('sort1', {static: true}) sort: MatSort;
	@ViewChild('searchInput', {static: true}) searchInput: ElementRef;
	lastQuery: QueryParamsModel;
	selection = new SelectionModel<AmModel>(true, []);
	amResult: AmModel[] = [];
	private subscriptions: Subscription[] = [];
	data = localStorage.getItem("currentUser");
	dataUser = JSON.parse(this.data)
	role = this.dataUser.role
  	constructor(
		private activatedRoute: ActivatedRoute,
		private store: Store<AppState>,
		private router: Router,
		private service: AmService,
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
				this.loadAmList();
			})
		)
			.subscribe();
		this.subscriptions.push(paginatorSubscriptions);

		const searchSubscription = fromEvent(this.searchInput.nativeElement, 'keyup').pipe(
			debounceTime(500), 
			distinctUntilChanged(),
			tap(() => {
				this.paginator.pageIndex = 0;
				this.loadAmList();
			})
		).subscribe();
		this.subscriptions.push(searchSubscription);
		this.subheaderService.setTitle('Asset Management');
		this.dataSource = new AmDataSource(this.store);
		const entitiesSubscription = this.dataSource.entitySubject.pipe(
			skip(1),
			distinctUntilChanged()
		).subscribe(res => {
			this.amResult = res;
		});
		this.subscriptions.push(entitiesSubscription);
		this.loadAmList();
  	}
	filterConfiguration(): any {
		const filter: any = {};
		const searchText: string = this.searchInput.nativeElement.value.toLowerCase();

		filter.assetName = `${searchText}`;
		return filter;
	}
	loadAmList(){
		this.selection.clear();
		const queryParams = new QueryAmModel(
			this.filterConfiguration(),
			this.sort.direction,
			this.sort.active,
			this.paginator.pageIndex+1,
			this.paginator.pageSize
		);
		this.store.dispatch(new AmPageRequested({ page: queryParams }));
		this.selection.clear();
	}
	deleteAm(_item: AmModel) {
		const _title = 'Asset Management Delete';
		const _description = 'Are you sure to permanently delete this asset management?';
		const _waitDesciption = 'Asset management is deleting...';
		const _deleteMessage = `Asset management has been deleted`;

		const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				return;
			}

			this.store.dispatch(new AmDeleted({ id: _item._id }));
			this.layoutUtilsService.showActionNotification(_deleteMessage, MessageType.Delete);
			this.loadAmList();
		});
	}
	editAm(id) {
		this.router.navigate(['edit', id], { relativeTo: this.activatedRoute });
	}
	viewAm(id) {
		this.router.navigate(['view', id], { relativeTo: this.activatedRoute });
	}
  	ngOnDestroy() {
		this.subscriptions.forEach(sb => sb.unsubscribe());
	}
	export(){
		this.service.exportExcel();
	}


	isAllSelected(): boolean {
		const numSelected = this.selection.selected.length;
		const numRows = this.amResult.length;
		return numSelected === numRows;
	}

	masterToggle() {
		if (this.selection.selected.length === this.amResult.length) {
			this.selection.clear();
		} else {
			this.amResult.forEach(row => this.selection.select(row));
		}
	}

	printAsset() {
		const id = [];
		var mediaType = 'application/pdf';
		this.selection.selected.forEach(elem => {
			id.push(elem._id);
		});
		this.http.post(`${environment.baseAPI}/api/asset/management/qrcode`, id, { responseType: 'arraybuffer' }).subscribe(
			(res) => {
				let blob = new Blob([res], { type: mediaType });
				var fileURL = URL.createObjectURL(blob);
				window.open(fileURL, "_blank")
			},
			(err) => console.log(err)
		);
	}

}
