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
import { AppState } from '../../../../core/reducers';


//services
import { LayoutUtilsService, MessageType, QueryParamsModel } from '../../../../core/_base/crud';

import { ImportpaymentModel } from '../../../../core/importpayment/importpayment.model';
import { ImportpaymentDeleted, ImportpaymentPageRequested } from '../../../../core/importpayment/importpayment.action';
import { ImportpaymentDataSource } from '../../../../core/importpayment/importpayment.datasource';
import { SubheaderService } from '../../../../core/_base/layout';
import { ImportpaymentService } from '../../../../core/importpayment/importpayment.service';
import { HttpClient } from '@angular/common/http';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { QueryImportpaymentModel } from '../../../../core/importpayment/queryimportpayment.model';
import * as _moment from "moment";
import { default as _rollupMoment, Moment } from "moment";
import { environment } from '../../../../../environments/environment';
import { FormControl } from '@angular/forms';
import { MatDatepicker } from '@angular/material/datepicker';
import { ServiceFormat } from "../../../../core/serviceFormat/format.service";


import { SavingDialog } from "../../../partials/module/saving-confirm/confirmation.dialog.component";

const moment = _rollupMoment || _moment;
// import jsPDF from 'jspdf'

@Component({
	selector: 'kt-list-importpayment',
	templateUrl: './list-importpayment.component.html',
	styleUrls: ['./list-importpayment.component.scss']
})
export class ListImportpaymentComponent implements OnInit, OnDestroy {
	file;
	download_name;
	data = localStorage.getItem("currentUser");
	dataUser = JSON.parse(this.data)
	role = this.dataUser.role
	dataSource: ImportpaymentDataSource;
	displayedColumns = ['billNo', 'unitNo', 'nominalRp', 'paidDate', 'paymentMethod', 'paidTo', 'paymentStatus', 'updateBy', 'actions'];
	@ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
	@ViewChild("pdfViewer", { static: true }) pdfViewer: ElementRef;
	@ViewChild('sort1', { static: true }) sort: MatSort;
	// Filter fields
	@ViewChild('searchInput', { static: true }) searchInput: ElementRef;
	lastQuery: QueryParamsModel;
	// Selection
	selection = new SelectionModel<ImportpaymentModel>(true, []);
	importpaymentResult: ImportpaymentModel[] = [];

	monthDate = new FormControl(moment())
	isSearch: boolean = false
	isClearFilter: boolean = false
	placeHolderSearch = "*select filter"
	valPayDate: string
	defaultFilter: boolean = true;
	checkClear: boolean
	sortField: string = "billNo"
	sortOrder: string = "desc"

	idExportImportPayment: string

	valueTotalCount: any = 0
	valueTotalAmount: any = 0

	generateImport: any

	// Activator for button
	valid: boolean = false;

	dateFilter = {
		start: undefined,
		end: undefined
	};

	date = {
		valid: false,
		filter: {
			control: new FormControl(),
			val: undefined,
		},
		start: {
			control: new FormControl(),
			val: undefined,
		},
		end: {
			control: new FormControl(),
			val: undefined,
		},
	};
	loading = false;

	filterBy = {
		control: new FormControl(),
		val: undefined
	}
	filterByStatus = {
		control: new FormControl(),
		val: undefined
	}
	// valueFiltered = { category: new FormControl(), status: new FormControl() }
	valueFiltered = { category: new FormControl() }


	filterCategory: any = [
		{ name: "Billing No", value: "billing_number", },
		{ name: "Unit No", value: "unit", },
		{ name: "Update By", value: "updateby" }
	]

	// Subscriptions
	private subscriptions: Subscription[] = [];
	constructor(
		private activatedRoute: ActivatedRoute,
		private serviceFormat: ServiceFormat,
		private store: Store<AppState>,
		private router: Router,
		private service: ImportpaymentService,
		private layoutUtilsService: LayoutUtilsService,
		private subheaderService: SubheaderService,
		private cdr: ChangeDetectorRef,
		private http: HttpClient,
		private modalService: NgbModal,
		private dialog: MatDialog,

	) { }

	ngOnInit() {
		const sortSubscription = this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0));
		this.subscriptions.push(sortSubscription);
		const paginatorSubscriptions = merge(this.sort.sortChange, this.paginator.page).pipe(
			tap(() => {
				this.loadImportpaymentList();
				this.loadBillingListTotal()
			})
		)
			.subscribe();
		this.subscriptions.push(paginatorSubscriptions);

		const searchSubscription = fromEvent(this.searchInput.nativeElement, 'keyup').pipe(
			debounceTime(500),
			distinctUntilChanged(),
			tap(() => {
				this.paginator.pageIndex = 0;
				this.loadImportpaymentList();
				this.loadBillingListTotal()
			})
		).subscribe();
		this.subscriptions.push(searchSubscription);
		this.subheaderService.setTitle('Import Paid Billing');
		this.dataSource = new ImportpaymentDataSource(this.store);
		const entitiesSubscription = this.dataSource.entitySubject.pipe(
			skip(1),
			distinctUntilChanged()
		).subscribe(
			res => {
				this.importpaymentResult = res;
			},
			err => {
				alert('error');
			}
		);
		this.subscriptions.push(entitiesSubscription);
		this.loadImportpaymentList();
		this.loadBillingListTotal()
		this.totalAmount()
		this.totalCount()
	}

	filterConfiguration(): any {
		const filter: any = {};
		const searchText: string = this.searchInput.nativeElement.value.toLowerCase();

		filter.category = this.valueFiltered.category.value ? this.valueFiltered.category.value : "";
		filter.input = `${searchText}`;

		return filter;
	}

	loadImportpaymentList() {
		this.setLoading(true);
		this.selection.clear();
		const queryParams = new QueryImportpaymentModel(
			this.filterConfiguration(),
			this.sortOrder,
			this.sortField,
			this.paginator.pageIndex + 1,
			this.paginator.pageSize,
			// Date Filter (start)
			this.dateFilter.start,
			this.dateFilter.end,
			// Date Filter (end)
		);
		this.store.dispatch(new ImportpaymentPageRequested({ page: queryParams }));
		this.selection.clear();
	}

	loadBillingListTotal() {
		const queryParams = new QueryImportpaymentModel(
			this.filterConfiguration(),
			this.sortOrder,
			this.sortField,
			this.paginator.pageIndex + 1,
			this.paginator.pageSize,

			"",
			""
		);

		this.service.getListPaidImport(queryParams).subscribe((res) => {
			this.valueTotalCount = res.totalCount
			this.valueTotalAmount = res.totalAmount
			this.totalCount()
			this.totalAmount()
			this.cdr.markForCheck()
		})
		this.cdr.markForCheck()
	}

	masterToggle() {
		if (this.selection.selected.length === this.importpaymentResult.length) {
			this.selection.clear();
		} else {
			this.importpaymentResult.forEach(row => this.selection.select(row));
		}
	}

	viewImportpayment(id) {
		this.router.navigate(['view', id], { relativeTo: this.activatedRoute });
	}

	ngOnDestroy() {
		this.subscriptions.forEach(sb => sb.unsubscribe());
	}

	export() {
		this.service.exportExcel();
	}
	onSubmit() {
		const formData = new FormData();
		let id_user = this.dataUser.id
		this.processSaving()
		formData.append('file', this.file);

		this.http.patch<any>(`${environment.baseAPI}/api/billing/paidpayment/import?idUser=${id_user}`, formData).subscribe(
			res => {
				const message = `file successfully has been import.`;
				this.layoutUtilsService.showActionNotification(message, MessageType.Create, 5000, true, true);

				this.idExportImportPayment = res.dataImportPaid._id

				this.refresh()
				this.ngOnInit();
				this.generateImport = new Date()
				this.dialog.closeAll()
			},
			err => {
				console.error(err);
				this.refresh()
				this.dialog.closeAll()
				const message = 'Error while importing File | ' + err.statusText;
				this.layoutUtilsService.showActionNotification(message, MessageType.Create, 5000, true, false);
			}
		)
	}

	refresh() {
		this.loadImportpaymentList()
		this.loadBillingListTotal()
	}

	openLarge(content) {
		this.modalService.open(content, {
			size: 'lg'
		});
	}
	openLarge2(content) {
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

	// Value choose category START
	valueChooseCategory(e: string) {
		this.isClearFilter = true
		if (e === "unit") {
			this.placeHolderSearch = "Unit No";
			this.valueFiltered.category.setValue(e)
			this.isSearch = true
		} else if (e === "billing_number") {
			this.placeHolderSearch = "Billing No"
			this.valueFiltered.category.setValue(e)
			this.isSearch = true
		} else if (e === "updateby") {
			this.placeHolderSearch = "Update By"
			this.valueFiltered.category.setValue(e)
			this.isSearch = true
		}
		this.loadImportpaymentList()
	}

	clearAllFilter() {
		this.defaultFilter = true;
		this.filterBy.control.setValue(undefined)
		this.filterByStatus.control.setValue(undefined)
		this.searchInput.nativeElement.value = "";
		this.placeHolderSearch = "*pilih kategori"
		this.valueFiltered.category.setValue(undefined)
		this.date.valid = false;
		this.date.start.val = undefined;
		this.date.start.control.setValue(undefined);
		this.date.end.val = undefined;
		this.date.end.control.setValue(undefined);
		this.date.filter.control.setValue(undefined);
		this.checkClear = false
		this.dateFilter.start = ""
		this.dateFilter.end = ""

		this.monthDate.setValue(moment())
		this.isClearFilter = false

		this.loadImportpaymentList()
		this.cdr.markForCheck()
	}
	setMonthAndYear(normalizedMonthAndYear: Moment, datepicker: MatDatepicker<Moment>) {
		this.isClearFilter = true

		const ctrlValue = this.monthDate.value!;
		ctrlValue.month(normalizedMonthAndYear.month());
		ctrlValue.year(normalizedMonthAndYear.year());
		this.dateFilter.start = moment(ctrlValue).clone().startOf('month').format('YYYY-MM-DD hh:mm');
		this.dateFilter.end = moment(ctrlValue).clone().endOf('month').format('YYYY-MM-DD hh:mm');
		this.monthDate.setValue(ctrlValue);

		this.loadImportpaymentList()
		datepicker.close();
	}


	// Disable the input when value is undefined
	dateCheck() {
		if (this.date.start && this.date.end) {
			this.valid = true;
		} else this.valid = false;
	}
	addDate(name, e) {
		if (e.target.value === null) this.date[name] = undefined;
		else this.date[name] = moment(e.target.value).format("YYYY-MM-DD");

		this.dateCheck();
	}
	exportExample() {
		this.service.exportExample();
	}
	exportSuccess() {
		this.service.exportSuccess(this.generateImport, this.idExportImportPayment);
	}
	exportFailed() {
		this.service.exportFailed(this.generateImport, this.idExportImportPayment);
	}
	setLoading(status: boolean) {
		this.loading = status;
		this.cdr.markForCheck();
	}

	totalCount() {
		return this.valueTotalCount
	}

	totalAmount() {
		let value = parseFloat(this.valueTotalAmount)
		if (value) return `RP. ${this.serviceFormat.rupiahFormatImprovement(value)}`;
		else return " - "
	}

	/**
	 * _getStatusPayCond
	 * @param status 
	 * @param bill 
	 * @returns 
	 */
	_getStatusPayCond(status: string, bill) {

		if (bill.isPaid && bill.paymentStatus && bill.payCond === undefined) return "chip chip--full-payment";
		if (bill.isPaid && bill.paymentStatus && bill.payCond ===
			'outstanding') return "chip chip--full-payment";

		if (bill.payCond == "full-payment" && bill.paymentSelection == "bayar-lebih") return "chip chip--parsial-lebih";

		if (status == 'full-payment' && bill.paymentSelection == 'bayar-lebih') return "chip chip--parsial-lebih"; //request BE handle db 


		if (status == 'full-payment' || status == 'Paid') return "chip chip--full-payment";
		else if (status == 'parsial-lebih' || status == 'bayar-lebih') return "chip chip--parsial-lebih";
		else if (status == 'parsial-kurang' || status == 'bayar-kurang') return "chip chip--parsial-kurang";
		else if (status == 'paid') return "chip chip--paid";
		else return "chip chip--outstanding";
	}

	/**
	* Load AP Process Saving.
	*/
	processSaving() {
		const dialogRef = this.dialog.open(
			SavingDialog,
			{
				data: {
					isGenerateBilling: "",
					msgErrorGenerate: ""
				},
				maxWidth: "565px",
				minHeight: "375px",
				disableClose: true
			}
		);
	}

}
