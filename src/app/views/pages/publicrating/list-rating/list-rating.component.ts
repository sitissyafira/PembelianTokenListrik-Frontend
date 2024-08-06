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

import { PublicTicketModel } from '../../../../core/ticketpublic/publicticket.model';
import { PublicTicketDeleted, PublicTicketPageRequested, PublicTicketPageRating, RatingDeleted } from '../../../../core/ticketpublic/publicticket.action';
import { PublicTicketDataSource } from '../../../../core/ticketpublic/publicticket.datasource';
import { SubheaderService } from '../../../../core/_base/layout';
import { PublicTicketService } from '../../../../core/ticketpublic/publicticket.service';
import { HttpClient } from '@angular/common/http';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { QueryPublicTicketModel, QueryPublicTicketModelUpd } from '../../../../core/ticketpublic/querypublicticket.model';
import { environment } from '../../../../../environments/environment';
import { ModuleTicketingPublic } from '../../../../core/ticketpublic/module/moduleservice';

@Component({
	selector: 'kt-list-rating',
	templateUrl: './list-rating.component.html',
	styleUrls: ['./list-rating.component.scss']
})
export class ListRatingComponent implements OnInit, OnDestroy {
	file;
	ticket: PublicTicketModel
	dataSource: PublicTicketDataSource;
	displayedColumns = ['prnt', 'ticketId', 'woId', 'rating', 'unit', 'createdDate', 'actions'];
	@ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
	@ViewChild('sort1', { static: true }) sort: MatSort;
	// Filter fields
	@ViewChild('searchInput', { static: true }) searchInput: ElementRef;
	lastQuery: QueryParamsModel;
	// Selection
	selection = new SelectionModel<PublicTicketModel>(true, []);
	ticketResult: PublicTicketModel[] = [];

	isHidden: boolean = true;
	buttonReshedule: boolean = true;
	// Subscriptions
	private subscriptions: Subscription[] = [];
	constructor(
		private activatedRoute: ActivatedRoute,
		private moduleTicketing: ModuleTicketingPublic, // services for flow ticketing systems (ex: changeStatus > to change status, etc.)
		private store: Store<AppState>,
		private router: Router,
		private service: PublicTicketService,
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
				this.loadTicketList();
			})
		)
			.subscribe();
		this.subscriptions.push(paginatorSubscriptions);


		// Filtration, bind to searchInput
		const searchSubscription = fromEvent(this.searchInput.nativeElement, 'keyup').pipe(
			// tslint:disable-next-line:max-line-length
			debounceTime(50), // The user can type quite quickly in the input box, and that could trigger a lot of server requests. With this operator, we are limiting the amount of server requests emitted to a maximum of one every 150ms
			distinctUntilChanged(), // This operator will eliminate duplicate values
			tap(() => {
				this.paginator.pageIndex = 0;
				this.loadTicketList();
			})
		).subscribe();
		this.subscriptions.push(searchSubscription);

		// Set title to page breadCrumbs
		this.subheaderService.setTitle('Rating');

		// Init DataSource
		this.dataSource = new PublicTicketDataSource(this.store);
		const entitiesSubscription = this.dataSource.entitySubject.pipe(
			skip(1),
			distinctUntilChanged()
		).subscribe(res => {
			this.ticketResult = res;
		});
		this.subscriptions.push(entitiesSubscription);

		// First Load
		this.loadTicketList();
	}

	showHidden() {
		this.isHidden = true;
	}

	filterConfiguration(): any {
		const filter: any = {};
		const searchText: string = this.searchInput.nativeElement.value.toLowerCase();
		filter.unit = `${searchText}`;
		return filter;
	}

	loadTicketList() {
		this.selection.clear();
		const queryParams = new QueryPublicTicketModel(
			this.filterConfiguration(),
			this.sort.direction,
			this.sort.active,
			this.paginator.pageIndex + 1,
			this.paginator.pageSize
		);
		this.store.dispatch(new PublicTicketPageRating({ page: queryParams }));
		this.selection.clear();
	}

	printRating(id) {
		var mediaType = "application/pdf";
		const API_RATING_URL = `${environment.baseAPI}/api/ratingPublic`;

		this.http
			.get(`${API_RATING_URL}/exppdfrate/${id}`, {
				responseType: "arraybuffer",
			})
			.subscribe(
				(response) => {
					let blob = new Blob([response], { type: mediaType });
					var fileURL = URL.createObjectURL(blob);
					window.open(fileURL, "_blank")
					// const src = fileURL;
					// this.loading = false;
				},
				(e) => {
					console.error(e);
				}
			);
	}

	deleteTicket(_item: PublicTicketModel) {
		// tslint:disable-next-line:variable-name
		const _title = 'Rating Delete';
		// tslint:disable-next-line:variable-name
		const _description = 'Are you sure to permanently delete this rating?';
		const _waitDesciption = 'Rating is deleting...';
		const _deleteMessage = `Rating has been deleted`;

		const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				return;
			}
			// this.store.dispatch(new PublicTicketDeleted({ id: _item._id }));
			// this.store.dispatch(new RatingDeleted({ id: _item._id }));
			this.service.deleteRating(_item._id).subscribe(res => {
				if (res) this.loadTicketList()
			})
			this.layoutUtilsService.showActionNotification(_deleteMessage, MessageType.Delete);
		});
	}

	isAllSelected(): boolean {
		const numSelected = this.selection.selected.length;
		const numRows = this.ticketResult.length;
		return numSelected === numRows;
	}

	masterToggle() {
		if (this.selection.selected.length === this.ticketResult.length) {
			this.selection.clear();
		} else {
			this.ticketResult.forEach(row => this.selection.select(row));
		}
	}

	viewTicket(id) {
		const url = `/publicRating/view/${id}`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}

	editTicket(id) {
		const url = `/publicticket/edit/${id}`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}


	ngOnDestroy() {
		this.subscriptions.forEach(sb => sb.unsubscribe());
	}


	export() {
		this.service.exportExcelRating();
	}

	refresh() {
		this.loadTicketList()
	}

	openLarge(content) {
		this.modalService.open(content, {
			size: 'lg'
		});
	}

	selectFile(event) {
		if (event.target.files.length > 0) {
			const file = event.target.files[0];
			this.file = file;
		}
	}


	onSubmit() {
		const formData = new FormData();
		formData.append('file', this.file);

		this.http.post<any>(`${environment.baseAPI}/api/excel/ticket/import`, formData).subscribe(
			res => {
				const message = `file successfully has been import.`;
				this.layoutUtilsService.showActionNotification(message, MessageType.Create, 5000, true, true);
				this.ngOnInit();
			},
			err => {
				console.error(err);
				const message = 'Error while importing File | ' + err.statusText;
				this.layoutUtilsService.showActionNotification(message, MessageType.Create, 5000, true, false);
			}
		)
	}
}
