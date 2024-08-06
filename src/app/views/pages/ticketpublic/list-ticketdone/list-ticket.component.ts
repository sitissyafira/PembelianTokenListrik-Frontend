
import { Component, OnInit, ElementRef, ViewChild, ChangeDetectionStrategy, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SelectionModel } from '@angular/cdk/collections';
import { MatPaginator, MatSort, MatSnackBar } from '@angular/material';
import { debounceTime, distinctUntilChanged, tap, skip, take, delay } from 'rxjs/operators';
import { fromEvent, merge, Observable, of, Subscription } from 'rxjs';
import { Store, select } from '@ngrx/store';
import { AppState } from '../../../../core/reducers';

import { LayoutUtilsService, MessageType, QueryParamsModel } from '../../../../core/_base/crud';

import { PublicTicketModel } from '../../../../core/ticketpublic/publicticket.model';
import { PublicTicketDeleted, PublicTicketPageLoaded, PublicTicketPageRequested, PublicTicketPageRequestedWfs } from '../../../../core/ticketpublic/publicticket.action';
import { PublicTicketDataSource } from '../../../../core/ticketpublic/publicticket.datasource';
import { SubheaderService } from '../../../../core/_base/layout';
import { PublicTicketService } from '../../../../core/ticketpublic/publicticket.service';
import { HttpClient } from '@angular/common/http';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { QueryPublicTicketModel, QueryPublicTicketModelUpd } from '../../../../core/ticketpublic/querypublicticket.model';
import { environment } from '../../../../../environments/environment';
import { selectPublicTicketById } from '../../../../core/ticketpublic/publicticket.selector';
import { FormControl } from '@angular/forms';

import { ModuleTicketingPublic } from '../../../../core/ticketpublic/module/moduleservice';

@Component({
	selector: 'kt-list-ticket',
	templateUrl: './list-ticket.component.html',
	styleUrls: ['./list-ticket.component.scss']
})
export class ListTicketDoneComponent implements OnInit, OnDestroy {
	file;
	dataSource: PublicTicketDataSource;
	ticket: PublicTicketModel
	loading: boolean = false;
	displayedColumns = ['prnt', 'read', 'ticketId', 'unit', 'subject', 'priority', 'handledBy', 'status', 'statusPayment', 'date_scheduled', 'actions'];
	@ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
	@ViewChild('sort1', { static: true }) sort: MatSort;
	@ViewChild('searchInput', { static: true }) searchInput: ElementRef;
	lastQuery: QueryPublicTicketModel;
	data = localStorage.getItem("currentUser");
	dataUser = JSON.parse(this.data)
	role = this.dataUser.role
	selection = new SelectionModel<PublicTicketModel>(true, []);
	ticketResult: PublicTicketModel[] = [];

	// Filter Ticket Start
	cekFilter: boolean = false
	// Filter Ticket End

	datePicker: Date = new Date()
	dateConfirm: Date = new Date(this.datePicker.getFullYear(), this.datePicker.getMonth(), 0)
	date = {
		valid: false,
		start: {
			control: new FormControl(),
			val: undefined,
		},
		end: {
			control: new FormControl(),
			val: undefined,
		},
	};
	priorityValue: string
	paymentValue: boolean

	filterBy = {
		payment: {
			control: new FormControl(),
			val: undefined
		},
		priority: {
			control: new FormControl(),
			val: undefined
		}
	}

	filterByStatusPayment: any = [
		{
			payment: "Paid",
			value: true,
		},
		{
			payment: "Unpaid",
			value: false,
		}
	]
	filterByStatus: any = [
		{
			status: "Low",
			value: 'low',
		},
		{
			status: "Medium",
			value: 'medium',
		},
		{
			status: "High",
			value: 'high',
		}
	]

	// Navigate Route
	navMatTab: any[] = [
		{ name: "All Ticket", value: "all", tab: false },
		{ name: "Open", value: "open", tab: false },
		{ name: "Waiting for Schedule Survey", value: "waitSurvey", tab: false },
		{ name: "Waiting for Confirmation", value: "waitConfirm", tab: false },
		{ name: "Schedule Survey", value: "schSurvey", tab: false },
		{ name: "Survey Done", value: "svyDone", tab: false },
		{ name: "Waiting for Schedule", value: "waitSch", tab: false },
		{ name: "Reschedule", value: "reschedule", tab: false },
		{ name: "Reject", value: "reject", tab: false },
		{ name: "Scheduled", value: "scheduled", tab: false },
		{ name: "Done", value: "done", tab: true },
	]

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

		const sortSubscription = this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0));
		this.subscriptions.push(sortSubscription);

		/* Data load will be triggered in two cases:
		- when a pagination event occurs => this.paginator.page
		- when a sort event occurs => this.sort.sortChange
		**/
		const paginatorSubscriptions = merge(this.sort.sortChange, this.paginator.page).pipe(
			tap(() => {
				this.loadTicketList(true);
			})
		)
			.subscribe();
		this.subscriptions.push(paginatorSubscriptions);

		// Filtration, bind to searchInput
		const searchSubscription = fromEvent(this.searchInput.nativeElement, 'keyup').pipe(
			// tslint:disable-next-line:max-line-length
			debounceTime(500), // The user can type quite quickly in the input box, and that could trigger a lot of server requests. With this operator, we are limiting the amount of server requests emitted to a maximum of one every 150ms
			distinctUntilChanged(), // This operator will eliminate duplicate values
			tap(() => {
				this.paginator.pageIndex = 0;
				this.loadTicketList(true);
			})
		).subscribe();
		this.subscriptions.push(searchSubscription);

		// Set title to page breadCrumbss
		this.subheaderService.setTitle('Ticketing');


	}

	matTabSelection(status) {
		if (status === "all") this.router.navigateByUrl(`/publicticket`, { relativeTo: this.activatedRoute });
		else if (status === "open") this.router.navigateByUrl(`/publicticket/open`, { relativeTo: this.activatedRoute });
		else if (status === "done") this.router.navigateByUrl(`/publicticket/done`, { relativeTo: this.activatedRoute });
		else if (status === "waitConfirm") this.router.navigateByUrl(`/publicticket/wfc`, { relativeTo: this.activatedRoute });
		else if (status === "waitSurvey") this.router.navigateByUrl(`/publicticket/wfsurvey`, { relativeTo: this.activatedRoute });
		else if (status === "scheduled") this.router.navigateByUrl(`/publicticket/sch`, { relativeTo: this.activatedRoute });
		else if (status === "reschedule") this.router.navigateByUrl(`/publicticket/rsh`, { relativeTo: this.activatedRoute });
		else if (status === "waitSch") this.router.navigateByUrl(`/publicticket/wfs`, { relativeTo: this.activatedRoute });
		else if (status === "schSurvey") this.router.navigateByUrl(`/publicticket/schSurvey`, { relativeTo: this.activatedRoute });
		else if (status === "reject") this.router.navigateByUrl(`/publicticket/reject`, { relativeTo: this.activatedRoute });
		else if (status === "svyDone") this.router.navigateByUrl(`/publicticket/svyDone`, { relativeTo: this.activatedRoute });
		else if (status === "scheduled") this.router.navigateByUrl(`/publicticket/sch`, { relativeTo: this.activatedRoute });
	}
	refresh() {
		this.loadTicketList()
	}

	resetFiltered() {
		this.date.start.control.setValue(undefined)
		this.date.end.control.setValue(undefined)
		this.filterBy.payment.control.setValue(undefined)
		this.filterBy.priority.control.setValue(undefined)

		this.paymentValue = undefined
		this.priorityValue = undefined

		this.cekFilter = false
		this.loadTicketList()
	}

	applyFiltered() {
		this.loading = true
		this.loadTicketList()
	}

	valueFilterStatus(e, status) {
		this.cekFilter = true
		if (status === 'payment') this.paymentValue = e;
		else if (status === 'priority') this.priorityValue = e
	}

	matTabValidate(event) {
		console.log(event);
	}

	filterConfiguration(): any {
		const filter: any = {};
		const searchText: string = this.searchInput.nativeElement.value.toLowerCase();

		filter.unit2 = `${searchText}`;
		return filter;
	}

	addDate(type, e) {
		this.date[type].val = e.target.value;
		this.checkDateValidation();
	}

	checkDateValidation() {
		if (this.date.start.val && this.date.end.val) this.cekFilter = true;
		else {
			this.cekFilter = false;
		}
	}

	loadTicketList(forSearch?: boolean) {
		this.selection.clear();
		const queryParams = new QueryPublicTicketModelUpd(
			this.filterConfiguration(),
			this.sort.direction,
			this.sort.active,
			this.paginator.pageIndex + 1,
			this.paginator.pageSize,
			this.date.start.control.value,
			this.date.end.control.value,
			this.paymentValue,
			["tick-work-done"],
			"tro",
			this.priorityValue
		);

		if (forSearch)
			this.store.dispatch(new PublicTicketPageLoaded({ publicTicket: [], totalCount: 0, page: queryParams }))

		this.store.dispatch(new PublicTicketPageRequested({ page: queryParams }));
		this.loading = false
		this.selection.clear();
	}



	deleteTicket(_item: PublicTicketModel) {
		// tslint:disable-next-line:variable-name
		const _title = 'Ticketing Delete';
		// tslint:disable-next-line:variable-name
		const _description = 'Are you sure to permanently delete this ticket?';
		const _waitDesciption = 'Ticket is deleting...';
		const _deleteMessage = `Ticket has been deleted`;

		const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				return;
			}

			this.store.dispatch(new PublicTicketDeleted({ id: _item._id }));
			this.layoutUtilsService.showActionNotification(_deleteMessage, MessageType.Delete);
			this.loadTicketList(true);
		});
	}

	editTicket(id) {
		const url = `/publicticket/edit/${id}`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}

	viewTicket(id) {
		const url = `/publicticket/view/${id}`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}

	ngOnDestroy() {
		this.subscriptions.forEach(sb => sb.unsubscribe());
	}

	export() {
		this.service.exportExcel();
	}


	printTicket(id) {
		this.loading = true
		const API_BILLING_URL = `${environment.baseAPI}/api/ticketPublic`;
		if (id) {
			this.store.pipe(select(selectPublicTicketById(id))).subscribe(res => {
				if (res) {
					this.ticket = res;
				}
			});
		}

		if ((this.ticket.status === "fixed") || (this.ticket.status === "done")) {
			var mediaType = "application/pdf";
			this.http
				.get(`${API_BILLING_URL}/exportpdfDone/${id}`, {
					responseType: "arraybuffer",
				})
				.subscribe(
					(response) => {
						let blob = new Blob([response], { type: mediaType });
						var fileURL = URL.createObjectURL(blob);
						window.open(fileURL, "_blank")
						// const src = fileURL;
						this.loading = false;
					},
					(e) => {
						console.error(e);
					}
				);
		} else {
			var mediaType = "application/pdf";
			this.http
				.get(`${API_BILLING_URL}/exportpdf/${id}`, {
					responseType: "arraybuffer",
				})
				.subscribe(
					(response) => {
						let blob = new Blob([response], { type: mediaType });
						var fileURL = URL.createObjectURL(blob);
						window.open(fileURL, "_blank")
						// const src = fileURL;
						this.loading = false;
					},
					(e) => {
						console.error(e);
					}
				);
		}
	}
}
