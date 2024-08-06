// Angular
import { Component, OnInit, ElementRef, ViewChild, ChangeDetectionStrategy, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
// Material
import { SelectionModel } from '@angular/cdk/collections';
import { MatPaginator, MatSort, MatSnackBar, MatDialog } from '@angular/material';
// RXJS
import { debounceTime, distinctUntilChanged, tap, skip, take, delay } from 'rxjs/operators';
import { fromEvent, merge, Observable, of, Subscription } from 'rxjs';
// LODASH
import { each, find } from 'lodash';
// NGRX
import { Store, select } from '@ngrx/store';
import { AppState } from '../../../../../core/reducers';

//services
import { LayoutUtilsService, MessageType, QueryParamsModel } from '../../../../../core/_base/crud';

import { LogactionModel } from '../../../../../core/logaction/logaction.model';
import { LogactionDeleted, LogactionPageRequested } from '../../../../../core/logaction/logaction.action';
import { LogactionDataSource } from '../../../../../core/logaction/logaction.datasource';
import { SubheaderService } from '../../../../../core/_base/layout';
import { LogactionService } from '../../../../../core/logaction/logaction.service';
import { HttpClient } from '@angular/common/http';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { QueryLogactionModel } from '../../../../../core/logaction/querylogaction.model';
import { environment } from '../../../../../../environments/environment';
import { AccountGroupService } from '../../../../../core/accountGroup/accountGroup.service';
import { FormControl } from '@angular/forms';
import { DetailLogactionDialogComponent } from '../detail-logaction/detail-logaction.dialog.component';

@Component({
	selector: 'kt-list-logaction',
	templateUrl: './list-logaction.component.html',
	styleUrls: ['./list-logaction.component.scss']
})

export class ListLogactionComponent implements OnInit {
	file;
	dataSource: LogactionDataSource;
	displayedColumns = ['log_date', 'log_number', 'log_category', 'log_task', 'log_status','updated_by','actions'];
	@ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
	@ViewChild('sort1', { static: true }) sort: MatSort;
	@ViewChild('searchInput', { static: true }) searchInput: ElementRef;

	acct = {
		val: undefined,
		control: new FormControl()
	};
	date = {
		valid: false,
		start: {
			control: new FormControl(),
			val: undefined
		},
		end: {
			control: new FormControl(),
			val: undefined
		}
	};

	accountList = [];
	loading = {
		account: false
	};

	// Filter fields
	lastQuery: QueryParamsModel;
	filter = {
		account: undefined,
		date: {
			from: undefined,
			to: undefined
		}
	};

	fromDate : Date;
	toDate : Date;
	listCategory = [];
	selectedSearchField: any;
	selectedStatus: any;

	// Selection
	selection = new SelectionModel<LogactionModel>(true, []);
	logactionResult: LogactionModel[] = [];
	// Subscriptions
	private subscriptions: Subscription[] = [];
	constructor(
		public dialog: MatDialog,
		private activatedRoute: ActivatedRoute,
		private store: Store<AppState>,
		private router: Router,
		private service: LogactionService,
		private accService: AccountGroupService,
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
				this.loadLogactionList();
			})
		)
			.subscribe();
		this.subscriptions.push(paginatorSubscriptions);

		// const searchSubscription = fromEvent(this.searchInput.nativeElement, 'keyup').pipe(
		// 	debounceTime(500),
		// 	distinctUntilChanged(),
		// 	tap(() => {
		// 	  this.paginator.pageIndex = 0;
		// 	  this.loadLogactionList();
		// 	})
		// ).subscribe();

		// this.subscriptions.push(searchSubscription);

		// Set title to page breadCrumbs
		this.subheaderService.setTitle('Log Action');

		// Init DataSource
		this.dataSource = new LogactionDataSource(this.store);
		const entitiesSubscription = this.dataSource.entitySubject.pipe(
			skip(1),
			distinctUntilChanged()
		).subscribe(res => {
			this.logactionResult = res;
		});
		this.subscriptions.push(entitiesSubscription);

		// First Load
		this.loadLogactionList();
		this.FLoadCategoryList();

		// Acct dropdown
		this.acct.control.valueChanges.subscribe(i => {
			if(i !== 'all') this.acct.val = i;
			else this.acct.val = undefined;

			this.loadLogactionList();
		})
	}

	filterConfiguration(): any {
		const filter: any = {};
		const searchText: string = this.searchInput.nativeElement.value.toLowerCase();

		if (this.selectedSearchField) {
			filter[this.selectedSearchField] = searchText;
    	}

		filter.status = this.selectedStatus;
		// filter.sourceno = `${searchText}`;
		// filter.datefrom = this.fromDate;
		// filter.dateto = this.toDate;

		return filter;
	}

	loadLogactionList() {
		this.selection.clear();
		const queryParams = new QueryLogactionModel(
			this.filterConfiguration(),
			this.fromDate,
			this.toDate,
			this.paginator.pageIndex + 1,
			this.paginator.pageSize
		);
		this.store.dispatch(new LogactionPageRequested({ page: queryParams }));
		this.selection.clear();
	}

	searchclick() {
		this.paginator.pageIndex = 0;
		this.loadLogactionList();
	}

	/** UI */
	/**
	 * Retursn CSS Class Name by status
	 *
	 * @param status: string
	 */
	 getItemCssClassByStatus(status: string = ""): string {
		switch (status) {
			case "D":
				return 'danger';
			case "C":
				return 'success';
			case "U":
				return 'metal';
		}
		return '';
	}

	/**
	 * Returns Item Status in string
	 * @param status: string
	 */
	getItemStatusString(status: string = ""): string {
		switch (status) {
			case "D":
				return 'Delete';
			case "C":
				return 'Create';
			case "U":
				return 'Update';
		}
		return '';
	}

	detailItem(_item: LogactionModel) {
		this.dialog.open(DetailLogactionDialogComponent,
			{
			  data: { logaction: _item },
			  width: '700px'
			}
		)
	}

	FLoadCategoryList() {
		this.service.getGroupByLogCategory().subscribe(resp => {
			if (resp.status == 'success') {
				this.listCategory = resp.data;
			}

		});
	}

	export(){
		var searchAPI;
		const API_LOGACTION_URL = `${environment.baseAPI}/api/logaction`;
		let searchText: string = this.searchInput.nativeElement.value.toLowerCase();

		if (this.fromDate && this.toDate) {
			if (searchText === "") searchText = undefined;

			// 	searchAPI = `${API_LOGACTION_URL}/createexcel/null/null/null/null/null`;
			// } else if (this.fromDate &&  this.toDate && !searchText) {
			// 	searchAPI = `${API_LOGACTION_URL}/createexcel/${this.fromDate.toISOString()}/${this.toDate.toISOString()}/null/null/null`;
			// } else if (this.fromDate &&  this.toDate && searchText) {
			// 	searchAPI = `${API_LOGACTION_URL}/createexcel/${this.fromDate.toISOString()}/${this.toDate.toISOString()}/${this.selectedSearchField}/${searchText}/${this.selectedStatus}`;
			searchAPI = `${API_LOGACTION_URL}/createexcel/${this.fromDate.toISOString()}/${this.toDate.toISOString()}/${this.selectedSearchField}/${searchText}/${this.selectedStatus}`;

			var mediaType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
			this.http
				.get(searchAPI, {
					responseType: "arraybuffer",
				})
				.subscribe(
					(response) => {
						//console.log(response);
						let blob = new Blob([response], { type: mediaType });
						var fileURL = URL.createObjectURL(blob);
						var anchor = document.createElement("a");
						//anchor.download = this.download_name + ".xlsx";
						//anchor.href = fileURL;
						anchor.click();
						window.open(fileURL, "_blank")
						//const src = fileURL;
						//this.pdfViewer.nativeElement.data = fileURL;
					},
					(e) => {
						console.error(e);
					}
				);
			}
		}
}
