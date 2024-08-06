import { Component, OnInit, ElementRef, ViewChild, ChangeDetectionStrategy, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { SelectionModel } from '@angular/cdk/collections';
import { MatPaginator, MatSort, MatSnackBar } from '@angular/material';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { debounceTime, distinctUntilChanged, tap, skip, take, delay } from 'rxjs/operators';
import { fromEvent, merge, Observable, of, Subscription } from 'rxjs';
import { Store, select } from '@ngrx/store';
import { AppState } from '../../../../core/reducers';
import { LayoutUtilsService, MessageType, QueryParamsModel } from '../../../../core/_base/crud';
import { InvoiceDeleted, InvoicePageRequested } from '../../../../core/invoice/invoice.action';
import { selectInvoiceById, } from '../../../../core/invoice/invoice.selector';
import { SubheaderService } from '../../../../core/_base/layout';

import { QueryInvoiceModel } from '../../../../core/invoice/queryinvoice.model';
import { InvoiceModel } from '../../../../core/invoice/invoice.model';
import { InvoiceService } from '../../../../core/invoice/invoice.service';
import { InvoiceDataSource } from '../../../../core/invoice/invoice.datasource';
import * as _moment from "moment";
import { default as _rollupMoment, Moment } from "moment";
import { environment } from '../../../../../environments/environment';
const moment = _rollupMoment || _moment;


@Component({
	selector: 'kt-list-invoice',
	templateUrl: './list-invoice.component.html',
	styleUrls: ['./list-invoice.component.scss']
})
export class ListAllInvoiceComponent implements OnInit, OnDestroy {
	file;
	dataSource: InvoiceDataSource;
	download_name: string;
	displayedColumns = ['prnt', 'invoiceno', 'unit', 'custname', 'total', 'invoicedte', 'invoicedteout', 'isclosed', 'actions'];
	@ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
	@ViewChild('sort1', { static: true }) sort: MatSort;
	@ViewChild('searchInput', { static: true }) searchInput: ElementRef;
	@ViewChild("pdfViewer", { static: true }) pdfViewer: ElementRef;
	lastQuery: QueryInvoiceModel;
	selection = new SelectionModel<InvoiceModel>(true, []);
	invoiceResult: InvoiceModel[] = [];
	invoice: InvoiceModel
	data = localStorage.getItem("currentUser");
	dataUser = JSON.parse(this.data)
	role = this.dataUser.role
	private subscriptions: Subscription[] = [];
	constructor(
		private activatedRoute: ActivatedRoute,
		private store: Store<AppState>,
		private router: Router,
		private service: InvoiceService,
		private layoutUtilsService: LayoutUtilsService,
		private subheaderService: SubheaderService,
		private http: HttpClient,
		private modalService: NgbModal
	) { }
	ngOnInit() {
		const sortSubscription = this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0));
		this.subscriptions.push(sortSubscription);
		const paginatorSubscriptions = merge(this.sort.sortChange, this.paginator.page).pipe(
			tap(() => {
				this.loadInvoiceList();
			})
		)
			.subscribe();
		this.subscriptions.push(paginatorSubscriptions);
		const searchSubscription = fromEvent(this.searchInput.nativeElement, 'keyup').pipe(
			debounceTime(150),
			distinctUntilChanged(),
			tap(() => {
				this.paginator.pageIndex = 0;
				this.loadInvoiceList();
			})
		).subscribe();
		this.subscriptions.push(searchSubscription);
		this.subheaderService.setTitle('Invoice');
		this.dataSource = new InvoiceDataSource(this.store);
		const entitiesSubscription = this.dataSource.entitySubject.pipe(
			skip(1),
			distinctUntilChanged()
		).subscribe(res => {
			this.invoiceResult = res;
		});
		this.subscriptions.push(entitiesSubscription);
		this.loadInvoiceList();
	}
	loadInvoiceList() {
		this.selection.clear();
		const queryParams = new QueryInvoiceModel(
			this.filterConfiguration(),
			this.sort.direction,
			this.sort.active,
			this.paginator.pageIndex + 1,
			this.paginator.pageSize
		);
		this.store.dispatch(new InvoicePageRequested({ page: queryParams }));
		this.selection.clear();
	}

	filterConfiguration(): any {
		const filter: any = {};
		const searchText: string = this.searchInput.nativeElement.value.toLowerCase();

		filter.unit2 = `${searchText}`;
		return filter;
	}

	deleteInvoice(_item: InvoiceModel) {
		const _title = 'Invoice Delete';
		const _description = 'Are you sure to permanently delete this invoice?';
		const _waitDesciption = 'Invoice is deleting...';
		const _deleteMessage = `Invoice has been deleted`;

		const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				return;
			}

			this.store.dispatch(new InvoiceDeleted({ id: _item._id }));
			this.layoutUtilsService.showActionNotification(_deleteMessage, MessageType.Delete);
			// window.location = window.location;
		});
	}

	editInvoice(id) {
		this.router.navigate(['/invoice/edit', id], { relativeTo: this.activatedRoute });
	}

	viewInvoice(id) {
		this.router.navigate(['/invoice/view', id], { relativeTo: this.activatedRoute });
	}


	ngOnDestroy() {
		this.subscriptions.forEach(sb => sb.unsubscribe());
	}
	export() {
		this.service.exportExcel();
	}

	async printInvoice(id) {
		const API_DEPOSIT_URL = `${environment.baseAPI}/api/invoice`;
		//console.log(API_DEPOSIT_URL);
		if (id) {
			this.store.pipe(select(selectInvoiceById(id))).subscribe(res => {
				if (res) {
					this.invoice = res;
				}
			});
		}
		console.log(id);

		if (this.invoice.deposittype == "Security Deposit") {
			var mediaType = "application/pdf";
			this.http
				.get(`${API_DEPOSIT_URL}/createinvoice/${id}`, {
					responseType: "arraybuffer",
				})
				.subscribe(
					(response) => {
						let blob = new Blob([response], { type: mediaType });
						var fileURL = URL.createObjectURL(blob);
						window.open(fileURL, '_blank');
					},
					(e) => {
						console.error(e);
					}
				);
		} else {
			await this.getInvoice(id)
			//await this.getInvoice2(id)
		}
	}

	async getInvoice(id) {
		const API_DEPOSIT_URL = `${environment.baseAPI}/api/invoice`;
		var mediaType = "application/pdf";
		this.http.get(`${API_DEPOSIT_URL}/createinvoice/${id}`,
			{
				responseType: "arraybuffer",
			}).subscribe((response) => {
				let blob = new Blob([response], { type: mediaType });
				var fileURL = URL.createObjectURL(blob);
				window.open(fileURL, '_blank');
			},
				(e) => {
					console.error(e);
				}
			);
	}

	async getInvoice2(id) {
		const API_DEPOSIT_URL = `${environment.baseAPI}/api/invoice`;
		var mediaType = "application/pdf";
		this.http.get(`${API_DEPOSIT_URL}/createinvoice2/${id}`, { responseType: "arraybuffer", }).subscribe(
			(response) => {
				let blob = new Blob([response], { type: mediaType });
				var fileURL = URL.createObjectURL(blob);
				window.open(fileURL, '_blank');
			},
			(e) => {
				console.error(e);
			}
		);
	}
}
