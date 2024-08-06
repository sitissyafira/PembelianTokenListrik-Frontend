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

import { RentalbillingModel } from '../../../../core/rentalbilling/rentalbilling.model';
import { RentalbillingDeleted, RentalbillingPageRequested} from '../../../../core/rentalbilling/rentalbilling.action';
import {RentalbillingDataSource} from '../../../../core/rentalbilling/rentalbilling.datasource';
import {SubheaderService} from '../../../../core/_base/layout';
import {RentalbillingService} from '../../../../core/rentalbilling/rentalbilling.service';
import { HttpClient } from '@angular/common/http';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { QueryRentalbillingModel } from '../../../../core/rentalbilling/queryrentalbilling.model';
import * as _moment from "moment";
import { default as _rollupMoment, Moment } from "moment";
import { environment } from '../../../../../environments/environment';
const moment = _rollupMoment || _moment;
// import jsPDF from 'jspdf'

@Component({
  selector: 'kt-list-rentalbilling',
  templateUrl: './list-rentalbilling.component.html',
  styleUrls: ['./list-rentalbilling.component.scss']
})
export class ListUnittypeComponent implements OnInit, OnDestroy {
	file;
	download_name;
	data = localStorage.getItem("currentUser");
	dataUser = JSON.parse(this.data)
	role = this.dataUser.role
	dataSource: RentalbillingDataSource;
	displayedColumns = [ 'prnt','billingNo','rentalUnit','rentalTenant','amount', 'status','actions'];
	@ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
	@ViewChild("pdfViewer", { static: true }) pdfViewer: ElementRef;
	@ViewChild('sort1', {static: true}) sort: MatSort;
	// Filter fields
	@ViewChild('searchInput', {static: true}) searchInput: ElementRef;
	lastQuery: QueryParamsModel;
	// Selection
	selection = new SelectionModel<RentalbillingModel>(true, []);
	rentalbillingResult: RentalbillingModel[] = [];
	// Subscriptions
	private subscriptions: Subscription[] = [];
  	constructor(
		private activatedRoute: ActivatedRoute,
		private store: Store<AppState>,
		private router: Router,
		private service: RentalbillingService,
		private layoutUtilsService: LayoutUtilsService,
		private subheaderService: SubheaderService,
		private cdr: ChangeDetectorRef,
		private http : HttpClient,
		private modalService : NgbModal
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
				this.loadRentalbillingList();
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
				this.loadRentalbillingList();
			})
		).subscribe();
		this.subscriptions.push(searchSubscription);

		// Set title to page breadCrumbs
		this.subheaderService.setTitle('Rental Billing');

		// Init DataSource
		this.dataSource = new RentalbillingDataSource(this.store);
		const entitiesSubscription = this.dataSource.entitySubject.pipe(
			skip(1),
			distinctUntilChanged()
		).subscribe(res => {
			this.rentalbillingResult = res;
		});
		this.subscriptions.push(entitiesSubscription);

		// First Load
		this.loadRentalbillingList();
	  }
	  
	  

	filterConfiguration(): any {
		const filter: any = {};
		const searchText: string = this.searchInput.nativeElement.value.toLowerCase();
		filter.unit = `${searchText}`;
		return filter;
	}

	loadRentalbillingList(){
		this.selection.clear();
		const queryParams = new QueryRentalbillingModel(
			this.filterConfiguration(),
			this.sort.direction,
			this.sort.active,
			this.paginator.pageIndex+1,
			this.paginator.pageSize
		);
		this.store.dispatch(new RentalbillingPageRequested({ page: queryParams }));
		this.selection.clear();
	}

	deleteRentalbilling(_item: RentalbillingModel) {
		// tslint:disable-next-line:variable-name
		const _title = 'Rental Billing Delete';
		// tslint:disable-next-line:variable-name
		const _description = 'Are you sure to permanently delete this rental billing?';
		const _waitDesciption = 'Rental billing is deleting...';
		const _deleteMessage = `Rental billing has been deleted`;

		const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				return;
			}

			this.store.dispatch(new RentalbillingDeleted({ id: _item._id }));
			this.layoutUtilsService.showActionNotification(_deleteMessage, MessageType.Delete);
		});
	}

	isAllSelected(): boolean {
		const numSelected = this.selection.selected.length;
		const numRows = this.rentalbillingResult.length;
		return numSelected === numRows;
	}

	masterToggle() {
		if (this.selection.selected.length === this.rentalbillingResult.length) {
			this.selection.clear();
		} else {
			this.rentalbillingResult.forEach(row => this.selection.select(row));
		}
	}

	editRentalbilling(id) {
		this.router.navigate(['edit', id], { relativeTo: this.activatedRoute });
	}

	viewRentalbilling(id) {
		this.router.navigate(['view', id], { relativeTo: this.activatedRoute });
	}
	
  	ngOnDestroy() {
		this.subscriptions.forEach(sb => sb.unsubscribe());
	}


	export(){
		this.service.exportExcel();
	}

	printBilling(id) {
		const API_BILLING_URL = `${environment.baseAPI}/api/rentalbilling`;
		var data_url = this.http
			.get(`${API_BILLING_URL}/${id}`)
			.subscribe((res) => {
				const dt: any = res;
				var crtddt = moment(dt.data.created_date)
					.utc(false)
					.format("MMYY");
				this.download_name =
					crtddt +
					"-" +
					dt.data.unit.cdunt +
					"-" +
					dt.data.billing_number;
				console.log(dt.data);
			});
		var mediaType = "application/pdf";
		this.http
			.get(`${API_BILLING_URL}/create/${id}`, {
				responseType: "arraybuffer",
			})
			.subscribe(
				(response) => {
					let blob = new Blob([response], { type: mediaType });
					var fileURL = URL.createObjectURL(blob);
					var anchor = document.createElement("a");
					// anchor.download = this.download_name + ".pdf";
					// anchor.href = fileURL;
					anchor.click();
					window.open(fileURL, "_blank")
					// const src = fileURL;
					this.pdfViewer.nativeElement.data = fileURL;
				},
				(e) => {
					console.error(e);
				}
			);
	}

	// openLarge(content) {
	// 	this.modalService.open(content, {
	// 		size: 'lg'
	// 	});
	// }

	// selectFile(event) {
	// 	if(event.target.files.length > 0) {
	// 		const file = event.target.files[0];
	// 		this.file = file;
	// 	}
	// }


	onSubmit(){
		const formData = new FormData();
		formData.append('file', this.file);

		this.http.post<any>(`${environment.baseAPI}/api/excel/rentalbilling/import`, formData).subscribe(
			res =>{
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
