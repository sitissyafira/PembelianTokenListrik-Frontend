
import { Component, OnInit, ElementRef, ViewChild, ChangeDetectionStrategy, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SelectionModel } from '@angular/cdk/collections';
import { MatPaginator, MatSort, MatSnackBar } from '@angular/material';
import { debounceTime, distinctUntilChanged, tap, skip, take, delay } from 'rxjs/operators';
import { fromEvent, merge, Observable, of, Subscription } from 'rxjs';
import { Store, select } from '@ngrx/store';
import { AppState } from '../../../../core/reducers';
import { LayoutUtilsService, MessageType, QueryParamsModel } from '../../../../core/_base/crud';

import { PrkbillingModel } from '../../../../core/prkbilling/prkbilling.model';
import { PrkbillingDeleted, PrkbillingPageRequested } from '../../../../core/prkbilling/prkbilling.action';
import { PrkbillingDataSource } from '../../../../core/prkbilling/prkbilling.datasource';
import { KtDialogService, SubheaderService } from '../../../../core/_base/layout';
import { PrkbillingService } from '../../../../core/prkbilling/prkbilling.service';
import { HttpClient } from '@angular/common/http';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { QueryPrkbillingModel } from '../../../../core/prkbilling/queryprkbilling.model';
import * as _moment from "moment";
import { default as _rollupMoment, Moment } from "moment";
import { environment } from '../../../../../environments/environment';
import { MatDatepicker } from '@angular/material/datepicker';
import { FormControl } from '@angular/forms';
const moment = _rollupMoment || _moment;

@Component({
	selector: 'kt-list-prkbilling',
	templateUrl: './list-prkbilling.component.html',
	styleUrls: ['./list-prkbilling.component.scss']
})
export class ListPrkbillingComponent implements OnInit, OnDestroy {
	file;
	download_name;
	data = localStorage.getItem("currentUser");
	dataUser = JSON.parse(this.data)
	role = this.dataUser.role
	dataSource: PrkbillingDataSource;
	displayedColumns = [
		"prnt",
		"billingNo",
		"unit",
		"billedTo",
		"amount",
		"ispaid",
		"actions",
	];

	loading = {
		msg: '',
		status: false
	};
	preview = {
		src: undefined,
		blobURL: '',
		status: false
	};
	date = {
		start: undefined,
		end: undefined
	};
	// Activator for button
	valid: boolean = false;

	@ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
	@ViewChild('sort1', { static: true }) sort: MatSort;
	// Filter fields
	@ViewChild('searchInput', { static: true }) searchInput: ElementRef;
	lastQuery: QueryParamsModel;
	// Selection
	selection = new SelectionModel<PrkbillingModel>(true, []);
	prkbillingResult: PrkbillingModel[] = [];
	monthDate = new FormControl(moment());
	selectedAccount: any[] = [];
	// Subscriptions
	private subscriptions: Subscription[] = [];

	constructor(
		private activatedRoute: ActivatedRoute,
		private store: Store<AppState>,
		private dialogueService: KtDialogService,
		private router: Router,
		private service: PrkbillingService,
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
				this.loadPrkbillingList();
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
				this.loadPrkbillingList();
			})
		).subscribe();
		this.subscriptions.push(searchSubscription);

		// Set title to page breadCrumbs
		this.subheaderService.setTitle('Parking Billing');

		// Init DataSource
		this.dataSource = new PrkbillingDataSource(this.store);
		const entitiesSubscription = this.dataSource.entitySubject.pipe(
			skip(1),
			distinctUntilChanged()
		).subscribe(res => {
			this.prkbillingResult = res;
		});
		this.subscriptions.push(entitiesSubscription);

		// First Load
		this.loadPrkbillingList();
	}

	// Disable the input when value is undefined
	dateCheck() {
		if (this.date.start && this.date.end) {
			this.valid = true;
		}
		else this.valid = false;
	}


	filterConfiguration(): any {
		const filter: any = {};
		const searchText: string = this.searchInput.nativeElement.value.toLowerCase();

		filter.unit = `${searchText}`;
		return filter;
	}

	loadPrkbillingList() {
		this.selection.clear();
		const queryParams = new QueryPrkbillingModel(
			this.filterConfiguration(),
			this.sort.direction,
			this.sort.active,
			this.paginator.pageIndex + 1,
			this.paginator.pageSize
		);
		this.store.dispatch(new PrkbillingPageRequested({ page: queryParams }));
		this.selection.clear();
	}

	deletePrkbilling(_item: PrkbillingModel) {
		// tslint:disable-next-line:variable-name
		const _title = 'Parking billing Delete';
		// tslint:disable-next-line:variable-name
		const _description = 'Are you sure to permanently delete this parking billing?';
		const _waitDesciption = 'Parking billing is deleting...';
		const _deleteMessage = `Parking billing has been deleted`;

		const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				return;
			}

			this.store.dispatch(new PrkbillingDeleted({ id: _item._id }));
			this.layoutUtilsService.showActionNotification(_deleteMessage, MessageType.Delete);
		});
	}

	isAllSelected(): boolean {
		const numSelected = this.selection.selected.length;
		const numRows = this.prkbillingResult.length;
		return numSelected === numRows;
	}

	masterToggle() {
		if (this.selection.selected.length === this.prkbillingResult.length) {
			this.selection.clear();
		} else {
			this.prkbillingResult.forEach(row => this.selection.select(row));
		}
	}

	editPrkbilling(id) {
		this.router.navigate(['edit', id], { relativeTo: this.activatedRoute });
	}
	viewPrkbilling(id) {
		this.router.navigate(['view', id], { relativeTo: this.activatedRoute });
	}
	ngOnDestroy() {
		this.subscriptions.forEach(sb => sb.unsubscribe());
	}


	printBilling(id) {
		const API_BILLING_URL = `${environment.baseAPI}/api/parkingbilling`;
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
				},
				(e) => {
					console.error(e);
				}
			);
	}

	openLarge(content) {
		this.modalService.open(content, {
			size: "lg",
		});
	}

	setMonthAndYear(normalizedMonthAndYear: Moment, datepicker: MatDatepicker<Moment>) {
		const ctrlValue = this.monthDate.value!;
		ctrlValue.month(normalizedMonthAndYear.month());
		ctrlValue.year(normalizedMonthAndYear.year());
		this.date.start = moment(ctrlValue).clone().startOf('month').format('YYYY-MM-DD hh:mm');
		this.date.end = moment(ctrlValue).clone().endOf('month').format('YYYY-MM-DD hh:mm');
		this.monthDate.setValue(ctrlValue);

		this.dateCheck();
		datepicker.close();
	}

	generatePrk() {
		this.dialogueService.show();
		this.service
			.generatePrkBilling({ start: this.date.start, end: this.date.end, column: this.selection.selected }).subscribe(res => {
			}, err => {
				this.dialogueService.hide()
				console.error(err)
			})
	}

	export() {
		this.dialogueService.show();
		this.service
			.generateExcel({ ...this.date, column: this.selection.selected }).subscribe(res => {
				this.dialogueService.hide()
			}, err => {
				this.dialogueService.hide()
				console.error(err)
			})
	}



}
