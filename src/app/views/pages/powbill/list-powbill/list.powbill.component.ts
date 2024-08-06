
import { Component, OnInit, ElementRef, ViewChild, ChangeDetectionStrategy, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SelectionModel } from '@angular/cdk/collections';
import { MatPaginator, MatSort, MatSnackBar } from '@angular/material';
import { debounceTime, distinctUntilChanged, tap, skip, take, delay } from 'rxjs/operators';
import { fromEvent, merge, Observable, of, Subscription } from 'rxjs';
import { Store, select } from '@ngrx/store';
import { AppState } from '../../../../core/reducers';
import { LayoutUtilsService, MessageType, QueryParamsModel } from '../../../../core/_base/crud';
import { PowbillModel } from '../../../../core/powbill/powbill.model';
import { PowbillDeleted, PowbillPageRequested} from '../../../../core/powbill/powbill.action';
import {PowbillDataSource} from '../../../../core/powbill/powbill.datasource';
import {SubheaderService} from '../../../../core/_base/layout';
import {PowbillService} from '../../../../core/powbill/powbill.service';
import { HttpClient } from '@angular/common/http';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { QueryPowbillModel } from '../../../../core/powbill/querypowbill.model';
import * as _moment from "moment";
import { default as _rollupMoment, Moment } from "moment";
import { environment } from '../../../../../environments/environment';
const moment = _rollupMoment || _moment;


@Component({
  selector: 'kt-list-powbill',
  templateUrl: './list-powbill.component.html',
  styleUrls: ['./list-powbill.component.scss']
})
export class ListPowbillComponent implements OnInit, OnDestroy {
	file;
	download_name;
	dataSource: PowbillDataSource;
	displayedColumns = [ 'prnt','billingno',
	'unit',
	//'tenantName',
	'rate',
	'updatedrate',
	'amount',
	// 'date',
	'status',
	'actions'];
	@ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
	@ViewChild('sort1', {static: true}) sort: MatSort;
	@ViewChild('searchInput', {static: true}) searchInput: ElementRef;
	@ViewChild("pdfViewer", { static: true }) pdfViewer: ElementRef;
	lastQuery: QueryParamsModel;
	selection = new SelectionModel<PowbillModel>(true, []);
	powbillResult: PowbillModel[] = [];
	data = localStorage.getItem("currentUser");
	dataUser = JSON.parse(this.data)
	role = this.dataUser.role
	private subscriptions: Subscription[] = [];
  	constructor(
		private activatedRoute: ActivatedRoute,
		private store: Store<AppState>,
		private router: Router,
		private service: PowbillService,
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
				this.loadPowbillList();
			})
		)
			.subscribe();
		this.subscriptions.push(paginatorSubscriptions);

		const searchSubscription = fromEvent(this.searchInput.nativeElement, 'keyup').pipe(
			debounceTime(500), 
			distinctUntilChanged(), 
			tap(() => {
				this.paginator.pageIndex = 0;
				this.loadPowbillList();
			})
		).subscribe();
		this.subscriptions.push(searchSubscription);
		this.subheaderService.setTitle('Power Billing');

		this.dataSource = new PowbillDataSource(this.store);
		const entitiesSubscription = this.dataSource.entitySubject.pipe(
			skip(1),
			distinctUntilChanged()
		).subscribe(res => {
			this.powbillResult = res;
		});
		this.subscriptions.push(entitiesSubscription);
		this.loadPowbillList();
  	}

	filterConfiguration(): any {
		const filter: any = {};
		const searchText: string = this.searchInput.nativeElement.value.toLowerCase();

		filter.unit = `${searchText}`;
		return filter;
	}

	loadPowbillList(){
		this.selection.clear();
		const queryParams = new QueryPowbillModel(
			this.filterConfiguration(),
			this.sort.direction,
			this.sort.active,
			this.paginator.pageIndex+1,
			this.paginator.pageSize
		);
		this.store.dispatch(new PowbillPageRequested({ page: queryParams }));
		this.selection.clear();
	}

	deletePowbill(_item: PowbillModel) {
		const _title = 'Power Billing Delete';
		const _description = 'Are you sure to permanently delete this power billing?';
		const _waitDesciption = 'Power billing is deleting...';
		const _deleteMessage = `Power billing has been deleted`;

		const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				return;
			}

			this.store.dispatch(new PowbillDeleted({ id: _item._id }));
			this.layoutUtilsService.showActionNotification(_deleteMessage, MessageType.Delete);
		});
	}

	isAllSelected(): boolean {
		const numSelected = this.selection.selected.length;
		const numRows = this.powbillResult.length;
		return numSelected === numRows;
	}

	masterToggle() {
		if (this.selection.selected.length === this.powbillResult.length) {
			this.selection.clear();
		} else {
			this.powbillResult.forEach(row => this.selection.select(row));
		}
	}

	editPowbill(id) {
		this.router.navigate(['edit', id], { relativeTo: this.activatedRoute });
	}

	viewPowbill(id) {
		this.router.navigate(['view', id], { relativeTo: this.activatedRoute });
	}


  	ngOnDestroy() {
		this.subscriptions.forEach(sb => sb.unsubscribe());
	}


	export(){
		this.service.exportExcel();
	}

	printBilling(id) {
		const API_BILLING_URL = `${environment.baseAPI}/api/powbill`;
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
}
