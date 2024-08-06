import { Component, OnInit, ElementRef, ViewChild, ChangeDetectionStrategy, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SelectionModel } from '@angular/cdk/collections';
import { MatPaginator, MatSort, MatSnackBar } from '@angular/material';
import { debounceTime, distinctUntilChanged, tap, skip, take, delay } from 'rxjs/operators';
import { fromEvent, merge, Observable, of, Subscription } from 'rxjs';
import { Store, select } from '@ngrx/store';
import { AppState } from '../../../../core/reducers';
import { LayoutUtilsService, MessageType, QueryParamsModel } from '../../../../core/_base/crud';
import { PublicDeliveryorderModel } from '../../../../core/deliveryorderpublic/publicdeliveryorder.model';
import { PublicDeliveryorderDeleted, PublicDeliveryorderPageLoaded, PublicDeliveryorderPageRequested } from '../../../../core/deliveryorderpublic/publicdeliveryorder.action';
import { PublicDeliveryorderDataSource } from '../../../../core/deliveryorderpublic/publicdeliveryorder.datasource';
import { SubheaderService } from '../../../../core/_base/layout';
import { PublicDeliveryorderService } from '../../../../core/deliveryorderpublic/publicdeliveryorder.service';
import { HttpClient } from '@angular/common/http';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { QueryPublicDeliveryorderModel, QueryPublicDeliveryorderModelUpd } from '../../../../core/deliveryorderpublic/querypublicdeliveryorder.model';
import { selectPublicDeliveryorderById } from '../../../../core/deliveryorderpublic/publicdeliveryorder.selector';
import { environment } from '../../../../../environments/environment';
import { FormControl } from '@angular/forms';

import { ModuleTicketingPublic } from '../../../../core/ticketpublic/module/moduleservice';

@Component({
	selector: 'kt-list-deliveryorder',
	templateUrl: './list-deliveryorder.component.html',
	styleUrls: ['./list-deliveryorder.component.scss']
})
export class ListDoVisitComponent implements OnInit, OnDestroy {
	file;
	ticket: PublicDeliveryorderModel
	loading: boolean = false;
	data = localStorage.getItem("currentUser");
	dataUser = JSON.parse(this.data)
	role = this.dataUser.role
	do: PublicDeliveryorderModel
	dataSource: PublicDeliveryorderDataSource;
	displayedColumns = ['print', 'read', 'doId', 'ticket',
		// 'tenant_name', 
		'unit', 'date', 'status', 'actions'];
	@ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
	@ViewChild('sort1', { static: true }) sort: MatSort;
	// Filter fields
	@ViewChild('searchInput', { static: true }) searchInput: ElementRef;
	lastQuery: QueryParamsModel;
	selection = new SelectionModel<PublicDeliveryorderModel>(true, []);
	deliveryorderResult: PublicDeliveryorderModel[] = [];
	isHidden: boolean = true;
	buttonView: boolean = true;

	priorityValue: string
	paymentValue: boolean

	// Filter Ticket Start
	cekFilter: boolean = false
	// Filter Ticket End

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
		{ name: "All Working Order", value: "all", tab: false },
		{ name: "Visit Survey", value: "visitSurv", tab: true },
		{ name: "Visit Fixing", value: "visitFixing", tab: false },
		{ name: "Fixed", value: "fixed", tab: false },
	]

	private subscriptions: Subscription[] = [];

	constructor(
		private activatedRoute: ActivatedRoute,
		private moduleTicketing: ModuleTicketingPublic, // services for flow ticketing systems (ex: changeStatus > to change status, etc.)
		private store: Store<AppState>,
		private router: Router,
		private service: PublicDeliveryorderService,
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
				this.loadDeliveryorderList(true);
			})
		)
			.subscribe();
		this.subscriptions.push(paginatorSubscriptions);
		const searchSubscription = fromEvent(this.searchInput.nativeElement, 'keyup').pipe(

			debounceTime(500),
			distinctUntilChanged(),
			tap(() => {
				this.paginator.pageIndex = 0;
				this.loadDeliveryorderList(true);
			})
		).subscribe();
		this.subscriptions.push(searchSubscription);
		this.subheaderService.setTitle('Working Order');
		this.dataSource = new PublicDeliveryorderDataSource(this.store);
		const entitiesSubscription = this.dataSource.entitySubject.pipe(
			skip(1),
			distinctUntilChanged()
		).subscribe(res => {
			this.deliveryorderResult = res;
		});
		this.subscriptions.push(entitiesSubscription);
		this.loadDeliveryorderList(true);
	}

	filterConfiguration(): any {
		const filter: any = {};
		const searchText: string = this.searchInput.nativeElement.value.toLowerCase();

		filter.unit = `${searchText}`;
		return filter;
	}

	loadDeliveryorderList(forSearch?: boolean) {
		this.selection.clear();
		const queryParams = new QueryPublicDeliveryorderModelUpd(
			this.filterConfiguration(),
			this.sort.direction,
			this.sort.active,
			this.paginator.pageIndex + 1,
			this.paginator.pageSize,
			this.date.start.control.value,
			this.date.end.control.value,
			["vis-for-surv"],
			"",
		);

		if (forSearch)
			this.store.dispatch(new PublicDeliveryorderPageLoaded({ publicDeliveryorder: [], totalCount: 0, page: queryParams }))

		this.store.dispatch(new PublicDeliveryorderPageRequested({ page: queryParams }));
		this.selection.clear();
	}

	deleteDeliveryorder(_item: PublicDeliveryorderModel) {
		const _title = 'Delivery order Delete';
		const _description = 'Are you sure to permanently delete this delivery order?';
		const _waitDesciption = 'Delivery order is deleting...';
		const _deleteMessage = `Delivery order has been deleted`;

		const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				return;
			}
			this.store.dispatch(new PublicDeliveryorderDeleted({ id: _item._id }));
			this.layoutUtilsService.showActionNotification(_deleteMessage, MessageType.Delete);
		});
	}

	editDeliveryorder(id) {
		this.router.navigate(['edit', id], { relativeTo: this.activatedRoute });
	}

	viewDeliveryorder(id) {
		this.router.navigate(['view', id], { relativeTo: this.activatedRoute });
	}
	ngOnDestroy() {
		this.subscriptions.forEach(sb => sb.unsubscribe());
	}
	export() {
		this.service.exportExcel();
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


	refresh() {
		this.loadDeliveryorderList()
	}

	resetFiltered() {
		this.date.start.control.setValue(undefined)
		this.date.end.control.setValue(undefined)
		this.filterBy.payment.control.setValue(undefined)
		this.filterBy.priority.control.setValue(undefined)

		this.paymentValue = undefined
		this.priorityValue = undefined

		this.cekFilter = false
		this.loadDeliveryorderList()
	}

	applyFiltered() {
		this.loading = true
		this.loadDeliveryorderList()
	}

	valueFilterStatus(e, status) {
		this.cekFilter = true
		if (status === 'payment') this.paymentValue = e;
		else if (status === 'priority') this.priorityValue = e
	}


	matTabSelection(status) {
		if (status === "all") this.router.navigateByUrl(`/publicdeliveryorder`, { relativeTo: this.activatedRoute });
		else if (status === "visitSurv") this.router.navigateByUrl(`/publicdeliveryorder/visit`, { relativeTo: this.activatedRoute });
		else if (status === "visitFixing") this.router.navigateByUrl(`/publicdeliveryorder/visitFixing`, { relativeTo: this.activatedRoute });
		else if (status === "fixed") this.router.navigateByUrl(`/publicdeliveryorder/fixed`, { relativeTo: this.activatedRoute });
	}



	printDO(id) {
		this.loading = true
		const API_BILLING_URL = `${environment.baseAPI}/api/doPublic/`;
		if (id) {
			this.store.pipe(select(selectPublicDeliveryorderById(id))).subscribe(res => {
				if (res) {
					console.log(res)
					this.ticket = res;
				}
			});
		}

		console.log(this.ticket.status)

		if (this.ticket.status === "fixed") {
			var mediaType = "application/pdf";
			this.http
				.get(`${API_BILLING_URL}/reportdone/${id}`, {
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
		else {
			var mediaType = "application/pdf";
			this.http
				.get(`${API_BILLING_URL}/report/${id}`, {
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
