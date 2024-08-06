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

import { AdjustmentModel } from "../../../../../../core/finance/journal/adjustment/adjustment.model";
import {
	AdjustmentDeleted,
	AdjustmentPageLoaded,
	AdjustmentPageRequested,
	AdjustmentPageToggleLoading,
} from "../../../../../../core/finance/journal/adjustment/adjustment.action";
import { AdjustmentDataSource } from "../../../../../../core/finance/journal/adjustment/adjustment.datasource";
import { SubheaderService, KtDialogService } from "../../../../../../core/_base/layout";
import { AdjustmentService } from "../../../../../../core/finance/journal/adjustment/adjustment.service";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { QueryAdjustmentModel } from "../../../../../../core/finance/journal/adjustment/queryadjustment.model";
import { environment } from "../../../../../../../environments/environment";
import { FormControl } from "@angular/forms";

import * as pdfMake from "pdfmake/build/pdfmake";
import * as pdfFonts from "pdfmake/build/vfs_fonts";
// import { selectAdjustmentById } from 'src/app/core/finance/adjustment/adjustment.selector';
import moment from "moment";
import { TemplatePDFAdjustment } from "../../../../../../core/templatePDF/adjustment.service";
import { SavingDialog } from "../../../../../partials/module/saving-confirm/confirmation.dialog.component";
import { MatDialog } from "@angular/material";
import * as FileSave from 'file-saver';
const appHost = `${location.protocol}//${location.host}`;
import { JourVoidDelete } from "../../../../../partials/module/void-journal/jourvoid.dialog.component";


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
	selector: "kt-list-adjustment",
	templateUrl: "./list-adjustment.component.html",
	styleUrls: ["./list-adjustment.component.scss"],
})
export class ListAdjustmentComponent implements OnInit, OnDestroy {
	file;
	dataSource: AdjustmentDataSource;
	displayedColumns = [
		"prnt",
		"date",
		"voucherno",
		// "depositTo",
		"amount",
		"credit",
		"status",
		"actions",
	];

	dataPrint: any = []

	@ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
	@ViewChild("sort1", { static: true }) sort: MatSort;
	data = localStorage.getItem("currentUser");
	dataUser = JSON.parse(this.data);
	role = this.dataUser.role;
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

	// Processing downloads
	downloadInProcess: number = 0;
	failedQueue: string[] = [];

	@ViewChild("searchInput", { static: true }) searchInput: ElementRef;
	lastQuery: QueryParamsModel;
	selection = new SelectionModel<AdjustmentModel>(true, []);
	adjustmentResult: AdjustmentModel[] = [];
	private subscriptions: Subscription[] = [];

	startExport = new FormControl();
	endExport = new FormControl();
	totalAllDebitCredit: any;
	sortField: string = "date";
	sortOrder: string = "desc";

	constructor(
		private activatedRoute: ActivatedRoute,
		private templatePDFAdjustment: TemplatePDFAdjustment,
		private store: Store<AppState>,
		private router: Router,
		private service: AdjustmentService,
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
			.pipe(tap(() => this.loadAdjustmentList()))
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
							new AdjustmentPageToggleLoading({ isLoading: true })
						);
						this.paginator.pageIndex = 0;
						this.loadAdjustmentList();
					}
				})
			)
			.subscribe();
		this.subscriptions.push(searchSubscription);
		this.subheaderService.setTitle("Journal Memorial");
		this.dataSource = new AdjustmentDataSource(this.store);
		const entitiesSubscription = this.dataSource.entitySubject
			.pipe(skip(1), distinctUntilChanged())
			.subscribe((res) => {
				this.adjustmentResult = res;
			});
		this.subscriptions.push(entitiesSubscription);
		this.loadAdjustmentList();
		this.loadTotalAdjustment();
	}

	loadAdjustmentList() {
		try {
			this.selection.clear();
			const queryPadjustmentams = new QueryAdjustmentModel(
				this.filterConfiguration(),
				this.date.valid ? this.date.start.val : undefined,
				this.date.valid ? this.date.end.val : undefined,
				this.sortOrder,
				this.sortField,
				this.paginator.pageIndex + 1,
				this.paginator.pageSize
			);

			// if (forSeadjustmentch)
			// this.store.dispatch(new AdjustmentPageLoaded({ adjustment: [], totalCount: 0, page: queryPadjustmentams }));
			this.store.dispatch(new AdjustmentPageRequested({ page: queryPadjustmentams }));
			this.selection.clear();
		} catch (error) {
			console.log(error);
		}
	}
	filterConfiguration(): any {
		const filter: any = {};
		const searchText: string = this.searchInput.nativeElement.value;
		filter.search = `${searchText}`;
		return filter;
	}
	loadTotalAdjustment() {
		const queryParams = new QueryAdjustmentModel(
			this.filterConfiguration(),
			this.date.valid ? this.date.start.val : undefined,
			this.date.valid ? this.date.end.val : undefined,
			this.sortOrder,
			this.sortField,
			this.paginator.pageIndex + 1,
			this.paginator.pageSize,
		);
		this.service.getListAdjustmentTotal(queryParams).subscribe((res) => {
			this.totalAllDebitCredit = res;
		});

		this.cdr.markForCheck()
	}
	deleteAdjustment(_item: AdjustmentModel) {
		// Call the Pop Up
		this.PopUpBillingDelete(_item, "memo")
	}
	// get PDF isToken
	getPDFReceipt(id) {
		const API_JOURNAL = `${environment.baseAPI}/api/joupen`;

		this.http.get(`${API_JOURNAL}/print/${id}`).subscribe(
			(resp: any) => {
				let label
				const result = this.templatePDFAdjustment.generatePDFTemplateJournal(label, resp, resp.data);
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
		const numRows = this.adjustmentResult.length;
		return numSelected === numRows;
	}

	masterToggle() {
		if (this.selection.selected.length === this.adjustmentResult.length) {
			this.selection.clear();
		} else {
			this.adjustmentResult.forEach((row) => this.selection.select(row));
		}
	}

	editAdjustment(id) {
		this.router.navigate(["edit", id], { relativeTo: this.activatedRoute });
	}

	viewAdjustment(id) {
		this.router.navigate(["view", id], { relativeTo: this.activatedRoute });
	}

	ngOnDestroy() {
		this.subscriptions.forEach((sb) => sb.unsubscribe());
	}

	openLarge(content) {
		this.modalService.open(content, {
			size: 'lg'
		});
	}

	export() {
		const _adjustment = new AdjustmentModel();

		let startExport = moment(this.startExport.value).format('L');
		let endExport = moment(this.endExport.value).format('L');

		_adjustment.startDate = startExport
		_adjustment.endDate = endExport

		this.service.exportExcel(_adjustment);
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
			this.loadAdjustmentList();
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

		this.loadAdjustmentList();
	}

	getDebitPerPage() {
		return this.adjustmentResult.map(t => t.totalAll.debit).reduce((acc, value) => acc + value, 0);
	}

	getCreditPerPage() {
		return this.adjustmentResult.map(t => t.totalAll.credit).reduce((acc, value) => acc + value, 0);
	}
	refresh() {
		this.loadAdjustmentList()
		this.loadTotalAdjustment()
	}
	// sortField
	announceSortChange(sortState) {
		this.sortField = sortState.active
		this.sortOrder = sortState.direction

		if (this.sortField === 'amount') this.sortField = 'totalAll.debit'
		else if (this.sortField === 'credit') this.sortField = 'totalAll.credit'

		this.loadAdjustmentList()
		this.loadTotalAdjustment()
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
			this.loadAdjustmentList()
			this.loadTotalAdjustment()
		})
		this.cdr.markForCheck();

	}
}
