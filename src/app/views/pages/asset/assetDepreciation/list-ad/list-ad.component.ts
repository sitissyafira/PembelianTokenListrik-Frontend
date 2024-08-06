
import { Component, OnInit, ElementRef, ViewChild, ChangeDetectionStrategy, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SelectionModel } from '@angular/cdk/collections';
import { MatPaginator, MatSort, MatSnackBar } from '@angular/material';
import { debounceTime, distinctUntilChanged, tap, skip, take, delay } from 'rxjs/operators';
import { fromEvent, merge, Observable, of, Subscription } from 'rxjs';
import { Store, select } from '@ngrx/store';
import { AppState } from '../../../../../core/reducers';
import { LayoutUtilsService, MessageType, QueryParamsModel } from '../../../../../core/_base/crud';

import { AdDeleted, AdPageRequested} from '../../../../../core/asset/assetDepreciation/ad.action';
import {AdDataSource} from '../../../../../core/asset/assetDepreciation/ad.datasource';
import {SubheaderService} from '../../../../../core/_base/layout';
import {AdService} from '../../../../../core/asset/assetDepreciation/ad.service';
import { HttpClient } from '@angular/common/http';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { QueryAdModel } from '../../../../../core/asset/assetDepreciation/queryad.model';
import { AdModel } from '../../../../../core/asset/assetDepreciation/ad.model';
import { environment } from '../../../../../../environments/environment';

@Component({
  selector: 'kt-list-ad',
  templateUrl: './list-ad.component.html',
  styleUrls: ['./list-ad.component.scss']
})
export class ListAdComponent implements OnInit, OnDestroy {
	file;
	dataSource: AdDataSource;
	displayedColumns = [ 'assetName', 
	// 'assetType',
	'actions'];
	@ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
	@ViewChild('sort1', {static: true}) sort: MatSort;
	@ViewChild('searchInput', {static: true}) searchInput: ElementRef;
	lastQuery: QueryParamsModel;
	selection = new SelectionModel<AdModel>(true, []);
	adResult: AdModel[] = [];
	data = localStorage.getItem("currentUser");
	dataUser = JSON.parse(this.data)
	role = this.dataUser.role
	private subscriptions: Subscription[] = [];
  	constructor(
		private activatedRoute: ActivatedRoute,
		private store: Store<AppState>,
		private router: Router,
		private service: AdService,
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
				this.loadAdList();
			})
		)
			.subscribe();
		this.subscriptions.push(paginatorSubscriptions);

		const searchSubscription = fromEvent(this.searchInput.nativeElement, 'keyup').pipe(
			
			debounceTime(500), 
			distinctUntilChanged(),
			tap(() => {
				this.paginator.pageIndex = 0;
				this.loadAdList();
			})
		).subscribe();
		this.subscriptions.push(searchSubscription);
		this.subheaderService.setTitle('Asset Depreciation');
		this.dataSource = new AdDataSource(this.store);
		const entitiesSubscription = this.dataSource.entitySubject.pipe(
			skip(1),
			distinctUntilChanged()
		).subscribe(res => {
			this.adResult = res;
		});
		this.subscriptions.push(entitiesSubscription);
		this.loadAdList();
  	}

	filterConfiguration(): any {
		const searchText: string = this.searchInput.nativeElement.value.toLowerCase();
		return searchText;
	}

	loadAdList(){
		this.selection.clear();
		const queryParads = new QueryAdModel(
			this.filterConfiguration(),
			this.paginator.pageIndex+1,
			this.paginator.pageSize
		);
		this.store.dispatch(new AdPageRequested({ page: queryParads }));
		this.selection.clear();
	}

	deleteAd(_item: AdModel) {
		const _title = 'Asset Depreciation Delete';
		const _description = 'Are you sure to permanently delete this Asset Depreciation?';
		const _waitDesciption = 'Asset Depreciation is deleting...';
		const _deleteMessage = `Asset Depreciation has been deleted`;

		const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				return;
			}

			this.store.dispatch(new AdDeleted({ id: _item._id }));
			this.layoutUtilsService.showActionNotification(_deleteMessage, MessageType.Delete);
			this.ngOnInit();
		});
	}


	editAd(id) {
		this.router.navigate(['edit', id], { relativeTo: this.activatedRoute });
	}
  	ngOnDestroy() {
		this.subscriptions.forEach(sb => sb.unsubscribe());
	}
	export(){
		this.service.exportExcel();
	}

}
