import {
	Component,
	OnInit,
	ElementRef,
	ViewChild,
	ChangeDetectionStrategy,
	OnDestroy,
	ChangeDetectorRef,
} from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { SelectionModel } from "@angular/cdk/collections";
import { MatPaginator, MatSort, MatSnackBar } from "@angular/material";
import {
	debounceTime,
	distinctUntilChanged,
	tap,
	skip,
	take,
	delay,
} from "rxjs/operators";
import { fromEvent, merge, Observable, of, Subscription } from "rxjs";

import { Store, select } from "@ngrx/store";
import { AppState } from "../../../../../../core/reducers";
import {
	LayoutUtilsService,
	MessageType,
	QueryParamsModel,
} from "../../../../../../core/_base/crud";

import { DebitNoteModel } from "../../../../../../core/finance/journal/debitNote/debitNote.model";
import {
	DebitNoteDeleted,
	DebitNotePageLoaded,
	DebitNotePageRequested,
	DebitNotePageToggleLoading,
} from "../../../../../../core/finance/journal/debitNote/debitNote.action";
import { DebitNoteDataSource } from "../../../../../../core/finance/journal/debitNote/debitNote.datasource";
import { SubheaderService, KtDialogService } from "../../../../../../core/_base/layout";
import { DebitNoteService } from "../../../../../../core/finance/journal/debitNote/debitNote.service";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { QueryDebitNoteModel } from "../../../../../../core/finance/journal/debitNote/querydebitNote.model";
import { environment } from "../../../../../../../environments/environment";
import { FormControl } from "@angular/forms";
import { JourVoidDelete } from "../../../../../partials/module/void-journal/jourvoid.dialog.component";

import * as pdfMake from "pdfmake/build/pdfmake";
import * as pdfFonts from "pdfmake/build/vfs_fonts";
// import { selectDebitNoteById } from 'src/app/core/finance/debitNote/debitNote.selector';
import moment from "moment";
import { TemplatePDFDebitNote } from "../.././../../../../core/templatePDF/debitNote.service";
import { SavingDialog } from "../../../../../partials/module/saving-confirm/confirmation.dialog.component";
import { MatDialog } from "@angular/material";
import * as FileSaver from 'file-saver';

const appHost = `${location.protocol}//${location.host}`;

(<any>pdfMake).vfs = pdfFonts.pdfMake.vfs;
(<any>pdfMake).fonts = {
	Poppins: {
		normal: `${appHost}/assets/fonts/poppins/regular.ttf`,
		bold: `${appHost}/assets/fonts/poppins/bold.ttf`,
		italics: `${appHost}/assets/fonts/poppins/italics.ttf`,
		bolditalics: `${appHost}/assets/fonts/poppins/bolditalics.ttf`,
	},
};

// interface TotalDebCred {
// 	debit: any
// 	credit: any
// }


// interface BillingPDFContent {
// 	totalDebCred: TotalDebCred
// }

@Component({
	selector: "kt-list-debitNote",
	templateUrl: "./list-debitNote.component.html",
	styleUrls: ["./list-debitNote.component.scss"],
})
export class ListDebitNoteComponent implements OnInit, OnDestroy {
	file;
	dataSource: DebitNoteDataSource;
	checkClear: boolean
	displayedColumns = [
		// "prnt",
		"date",
		"voucherno",
		// "depositTo",
		"amount",
		"credit",
		// "status",
		"actions",
	];
	displayedColumnsTotal = [
		// "prnt",
		"date",
		"voucherno",
		// "depositTo",
		"amount",
		"credit",
		// "status",
		"actions",
	];

	dataPrint: any = []

	filterCategoryValue: any = ""

	filterByCategory: any = [
		{
			payment: "All Category",
			value: "",
		},
		{
			payment: "Parking",
			value: "parking",
		},
		{
			payment: "Top Up",
			value: "top-up",
		},
		{
			payment: "Billing",
			value: "ar",
		},
	]
	@ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
	@ViewChild("sort1", { static: true }) sort: MatSort;
	data = localStorage.getItem("currentUser");
	dataUser = JSON.parse(this.data);
	role = this.dataUser.role;
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

	// Processing downloads
	downloadInProcess: number = 0;
	failedQueue: string[] = [];

	startExport = new FormControl();
	endExport = new FormControl();

	@ViewChild("searchInput", { static: true }) searchInput: ElementRef;
	lastQuery: QueryParamsModel;
	selection = new SelectionModel<DebitNoteModel>(true, []);
	debitNoteResult: DebitNoteModel[] = [];
	private subscriptions: Subscription[] = [];

	totalAllDebitCredit: any;
	sortField: string = "date";
	sortOrder: string = "desc";


	constructor(
		private activatedRoute: ActivatedRoute,
		private templatePDFDebitNote: TemplatePDFDebitNote,
		private store: Store<AppState>,
		private router: Router,
		private service: DebitNoteService,
		private layoutUtilsService: LayoutUtilsService,
		private subheaderService: SubheaderService,
		private cdr: ChangeDetectorRef,
		private http: HttpClient,
		private modalService: NgbModal,
		private dialog: MatDialog,
		private dialogueService: KtDialogService
	) { }

	ngOnInit() {
		const sortSubscription = this.sort.sortChange.subscribe(
			() => (this.paginator.pageIndex = 0)
		);
		this.subscriptions.push(sortSubscription);
		const paginatorSubscriptions = merge(
			this.sort.sortChange,
			this.paginator.page
		)
			.pipe(tap(() => this.loadDebitNoteList()))
			.subscribe();
		this.subscriptions.push(paginatorSubscriptions);

		const searchSubscription = fromEvent(
			this.searchInput.nativeElement,
			"keyup"
		)
			.pipe(
				debounceTime(150),
				distinctUntilChanged(),
				tap(() => {
					if (
						this.searchInput.nativeElement.value.length > 2 ||
						!this.searchInput.nativeElement.value
					) {
						this.store.dispatch(
							new DebitNotePageToggleLoading({ isLoading: true })
						);
						this.paginator.pageIndex = 0;
						this.loadDebitNoteList();
					}
				})
			)
			.subscribe();
		this.subscriptions.push(searchSubscription);
		this.subheaderService.setTitle("Journal Debit Note");
		this.dataSource = new DebitNoteDataSource(this.store);
		const entitiesSubscription = this.dataSource.entitySubject
			.pipe(skip(1), distinctUntilChanged())
			.subscribe((res) => {
				this.debitNoteResult = res;

			});
		this.subscriptions.push(entitiesSubscription);
		this.loadDebitNoteList();
		this.loadTotalDebitNote()
	}

	loadTotalDebitNote() {

		const queryPdebitNoteams = new QueryDebitNoteModel(
			this.filterConfiguration(),
			this.date.valid ? this.date.start.val : undefined,
			this.date.valid ? this.date.end.val : undefined,
			this.sortOrder,
			this.sortField,
			this.paginator.pageIndex + 1,
			this.paginator.pageSize
		);
		this.service.getListDebitNoteTotal(queryPdebitNoteams).subscribe((res) => {
			this.totalAllDebitCredit = res
		})
		this.cdr.markForCheck()
	}

	valueFilterCategory(e) {
		this.filterCategoryValue = e
		this.checkClear = true
		this.checkDateValidation()
		this.loadTotalDebitNote()
		this.loadDebitNoteList()
	}
	loadDebitNoteList() {
		try {
			this.selection.clear();
			const queryPdebitNoteams = new QueryDebitNoteModel(
				this.filterConfiguration(),
				this.date.valid ? this.date.start.val : undefined,
				this.date.valid ? this.date.end.val : undefined,
				this.sortOrder,
				this.sortField,
				this.paginator.pageIndex + 1,
				this.paginator.pageSize,
				this.filterCategoryValue
			);


			// if (forSedebitNotech)
			// this.store.dispatch(new DebitNotePageLoaded({ debitNote: [], totalCount: 0, page: queryPdebitNoteams }));
			this.store.dispatch(new DebitNotePageRequested({ page: queryPdebitNoteams }));
			this.selection.clear();
		} catch (error) {
			console.log(error);
		}
	}
	announceSortChange(sortState) {
		// console.log(sortState, 'sortState');
		this.sortField = sortState.active
		this.sortOrder = sortState.direction

		if (this.sortField === 'amount') this.sortField = 'totalAll.debit'
		else if (this.sortField === 'credit') this.sortField = 'totalAll.credit'

		this.loadDebitNoteList()
		this.loadTotalDebitNote()
	}

	filterConfiguration(): any {
		const filter: any = {};
		const searchText: string = this.searchInput.nativeElement.value;
		filter.search = `${searchText}`;
		return filter;
	}
	deleteDebitNote(_item: DebitNoteModel) {
		//  Check Apakah yang diapus billing
		const value = _item.voucherno.includes("Bill/")

		if (value) {
			const url = `/billing/voidbillview/${_item.generateFrom}`;
			this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
		} else {
			// Call the Pop Up
			this.PopUpBillingDelete(_item, "dn")
		}
	}

	// get PDF 
	getPDFReceipt(id) {

		const API_JOURNAL = `${environment.baseAPI}/api/jouamor`;

		this.http.get(`${API_JOURNAL}/print/${id}`).subscribe(
			(resp: any) => {

				let label
				const result = this.templatePDFDebitNote.generatePDFTemplateJournal(label, resp, resp.data);

				pdfMake.createPdf(result).download(`${resp.voucherNo}-${moment(new Date()).format("YYYY")}.pdf`);

				this.setPDFProcessNotification();
			}
			// (err) => {
			// 	this.downloadInProcess -= 1;

			// 	// Push failed file name
			// 	console.error(err);
			// 	this.failedQueue.push(bill.unit2);

			// 	this.setPDFProcessNotification();
			// }
		);
	}

	// Show download in process
	setPDFProcessNotification() {
		this.downloadInProcess -= 1;

		if (this.downloadInProcess <= 0) {
			// Reset in process value
			this.downloadInProcess = 0;
			this.layoutUtilsService.showActionNotification(
				"waiting for download...",
				MessageType.Create,
				3500,
				true,
				false
			);

			// Show alert when encountered error in process
			if (this.failedQueue.length > 0) {
				let msg = "Invoice unit yang gagal di unduh:";
				this.failedQueue.forEach((item, index) => {
					msg += `\n${index + 1}. ${item}`;
				});

				// Show and clear the listed failed unit invoices
				alert(msg);
				this.failedQueue = [];
			}
		} else {
			this.layoutUtilsService.showActionNotification(
				`Processing download for ${this.downloadInProcess} ${this.downloadInProcess > 1 ? "items" : "item"
				}.`,
				MessageType.Create,
				15000,
				true,
				false
			);
		}
	}

	// Before Print
	cekBeforePrint(id) {
		this.getPDFReceipt(id);
	}

	isAllSelected(): boolean {
		const numSelected = this.selection.selected.length;
		const numRows = this.debitNoteResult.length;
		return numSelected === numRows;
	}

	masterToggle() {
		if (this.selection.selected.length === this.debitNoteResult.length) {
			this.selection.clear();
		} else {
			this.debitNoteResult.forEach((row) => this.selection.select(row));
		}
	}

	editDebitNote(id) {
		this.router.navigate(["edit", id], { relativeTo: this.activatedRoute });
	}

	viewDebitNote(id) {
		this.router.navigate(["view", id], { relativeTo: this.activatedRoute });
	}

	ngOnDestroy() {
		this.subscriptions.forEach((sb) => sb.unsubscribe());
	}
	openLarge(content) {
		this.modalService.open(content, {
			size: 'lg',
			backdrop: "static",
		});
	}

	export() {
		const _debitNote = new DebitNoteModel();

		let startExport = moment(this.startExport.value).format('L');
		let endExport = moment(this.endExport.value).format('L');

		_debitNote.startDate = startExport
		_debitNote.endDate = endExport

		this.service.exportExcel(_debitNote);
	}

	clearAllFilterExport() {
		this.startExport.reset();
		this.endExport.reset();
	}

	// Event handlers and checkers
	addDate(type, e) {
		this.date[type].val = e.target.value;
		this.checkDateValidation();

		// Fetch list if date is filled
		if (this.date.valid) {
			this.loadTotalDebitNote()
			this.loadDebitNoteList();
		}
	}


	checkDateValidation() {
		if (this.date.start.val && this.date.end.val) this.date.valid = true;
		else {
			this.date.valid = false;
		}
	}

	clearAllFilter() {
		this.date.valid = false;
		this.searchInput.nativeElement.value = "";
		this.date.start.val = undefined;
		this.date.start.control.setValue(undefined);
		this.date.end.val = undefined;
		this.date.end.control.setValue(undefined);
		this.date.filter.control.setValue(undefined);

		this.filterCategoryValue = ""

		this.checkClear = false

		this.loadTotalDebitNote()
		this.loadDebitNoteList();
	}

	getDebitPerPage() {
		return this.debitNoteResult.map(t => t.totalAll.debit).reduce((acc, value) => acc + value, 0);
	}

	getCreditPerPage() {
		return this.debitNoteResult.map(t => t.totalAll.credit).reduce((acc, value) => acc + value, 0);
	}
	refresh() {
		this.loadDebitNoteList()
		this.loadTotalDebitNote()
	}
	/** Pop Up Delete Billing
 * This is a popup for the progress of generating billing
 */
	 PopUpBillingDelete(dataJournal, type) {
		let dialogRef = this.dialog.open(JourVoidDelete, {
			data: {
				dataJournal,
				type
			},
			maxWidth: "565px",
			minHeight: "375px",
			disableClose: true
		});

		// Close Modal
		dialogRef.afterClosed().subscribe((result) => {
			this.loadDebitNoteList()
			this.loadTotalDebitNote()
		})
		this.cdr.markForCheck();

	}
}
