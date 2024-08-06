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

import { SetOffModel } from "../../../../../../core/finance/journal/setOff/setOff.model";
import {
	SetOffDeleted,
	SetOffPageLoaded,
	SetOffPageRequested,
	SetOffPageToggleLoading,
} from "../../../../../../core/finance/journal/setOff/setOff.action";
import { SetOffDataSource } from "../../../../../../core/finance/journal/setOff/setOff.datasource";
import { SubheaderService, KtDialogService } from "../../../../../../core/_base/layout";
import { SetOffService } from "../../../../../../core/finance/journal/setOff/setOff.service";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { QuerySetOffModel } from "../../../../../../core/finance/journal/setOff/querysetOff.model";
import { environment } from "../../../../../../../environments/environment";
import { FormControl } from "@angular/forms";

import * as pdfMake from "pdfmake/build/pdfmake";
import * as pdfFonts from "pdfmake/build/vfs_fonts";
// import { selectSetOffById } from 'src/app/core/finance/setOff/setOff.selector';
import moment from "moment";
import { TemplatePDFSetOff } from "../../../../../../core/templatePDF/setOff.service";
import { SavingDialog } from "../../../../../partials/module/saving-confirm/confirmation.dialog.component";
import { MatDialog } from "@angular/material";
import * as FileSaver from 'file-saver';
import { JourVoidDelete } from "../../../../../partials/module/void-journal/jourvoid.dialog.component";


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
	selector: "kt-list-setOff",
	templateUrl: "./list-setOff.component.html",
	styleUrls: ["./list-setOff.component.scss"],
})
export class ListSetOffComponent implements OnInit, OnDestroy {
	file;
	dataSource: SetOffDataSource;
	displayedColumns = [
		// "prnt",
		"date",
		"voucherno",
		// "depositTo",
		"amount",
		"credit",
		"status",
		"actions",
	];
	displayedColumnsTotal = [
		// "prnt",
		"date",
		"voucherno",
		// "depositTo",
		"amount",
		"credit",
		"status",
		"actions",
	];

	filterStatusValue: any = ""

	dataPrint: any = []
	filterByStatus: any = [
		{
			payment: "All Status",
			value: "",
			empty: ""
		},
		{
			payment: "Outstanding",
			value: "outstanding",
			empty: ""
		},
		{
			payment: "Full Payment",
			value: "full-payment",
			empty: ""
		},
		{
			payment: "Parsial Lebih",
			value: "parsial-lebih",
			empty: ""
		},
		{
			payment: "Parsial Kurang",
			value: "parsial-kurang",
			empty: ""
		},
	]

	totalAllDebitCredit: any
	cekValueStatus: any = ""
	startExport = new FormControl();
	endExport = new FormControl();


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
	sortField: string = "date";
	sortOrder: string = "desc";

	@ViewChild("searchInput", { static: true }) searchInput: ElementRef;
	lastQuery: QueryParamsModel;
	selection = new SelectionModel<SetOffModel>(true, []);
	setOffResult: SetOffModel[] = [];
	private subscriptions: Subscription[] = [];

	constructor(
		private activatedRoute: ActivatedRoute,
		private templatePDFSetOff: TemplatePDFSetOff,
		private store: Store<AppState>,
		private router: Router,
		private service: SetOffService,
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
			.pipe(tap(() => this.loadSetOffList()))
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
							new SetOffPageToggleLoading({ isLoading: true })
						);
						this.paginator.pageIndex = 0;
						this.loadSetOffList();
					}
				})
			)
			.subscribe();
		this.subscriptions.push(searchSubscription);
		this.subheaderService.setTitle("Journal Set Off");
		this.dataSource = new SetOffDataSource(this.store);
		const entitiesSubscription = this.dataSource.entitySubject
			.pipe(skip(1), distinctUntilChanged())
			.subscribe((res) => {
				this.setOffResult = res;
			});
		this.subscriptions.push(entitiesSubscription);
		this.loadSetOffList();
		this.loadTotalSetOff()
	}


	valueFilterStatus(e) {
		this.filterStatusValue = e
		this.checkDateValidation()
		this.loadTotalSetOff()
		this.loadSetOffList()
	}

	loadSetOffList() {
		try {
			this.selection.clear();
			const queryParams = new QuerySetOffModel(
				this.filterConfiguration(),
				this.date.valid ? this.date.start.val : undefined,
				this.date.valid ? this.date.end.val : undefined,
				this.sortOrder,
				this.sortField,
				this.paginator.pageIndex + 1,
				this.paginator.pageSize,
				this.filterStatusValue
			);

			// if (forSesetOffch)
			// this.store.dispatch(new SetOffPageLoaded({ setOff: [], totalCount: 0, page: queryParams }));
			this.store.dispatch(new SetOffPageRequested({ page: queryParams }));
			this.selection.clear();

		} catch (error) {
			console.log(error);
		}
	}

	filterStatus(e) {
		console.log(e);
	}

	formatVoucherno(item) {
		if (typeof item == "string") return item

		let result;
		if (item.length == 1) return result = item[0];
		else if (item.length > 1) return result = item[0] + " & " + (item.length - 1) + " more";
	}
	loadTotalSetOff() {

		const queryParams = new QuerySetOffModel(
			this.filterConfiguration(),
			this.date.valid ? this.date.start.val : undefined,
			this.date.valid ? this.date.end.val : undefined,
			this.sortOrder,
			this.sortField,
			this.paginator.pageIndex + 1,
			this.paginator.pageSize,
			this.filterStatusValue
		);
		this.service.getListSetOffTotal(queryParams).subscribe((res) => {
			this.totalAllDebitCredit = res;
		})
		this.cdr.markForCheck()
	}

	_getStatusClass(status) {
		if (status == 'full-payment') return 'chip chip--success';
		else if (status == 'parsial-lebih') return 'chip';
		else if (status == 'parsial-kurang') return 'chip chip--warning';
		else return 'chip chip--danger'
	}
	filterConfiguration(): any {
		const filter: any = {};
		const searchText: string = this.searchInput.nativeElement.value;
		filter.search = `${searchText}`;
		return filter;
	}
	deleteSetOff(_item: SetOffModel) {
		// Call the Pop Up
		this.PopUpBillingDelete(_item, "so")
	}
	// get PDF 
	getPDFReceipt(id) {
		const API_JOURNAL = `${environment.baseAPI}/api/jousetoff`;

		this.http.get(`${API_JOURNAL}/print/${id}`).subscribe(
			(resp: any) => {

				let label
				const result = this.templatePDFSetOff.generatePDFTemplateJournal(label, resp, resp.data);

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
		const numRows = this.setOffResult.length;
		return numSelected === numRows;
	}

	masterToggle() {
		if (this.selection.selected.length === this.setOffResult.length) {
			this.selection.clear();
		} else {
			this.setOffResult.forEach((row) => this.selection.select(row));
		}
	}

	editSetOff(id) {
		this.router.navigate(["edit", id], { relativeTo: this.activatedRoute });
	}

	viewSetOff(id) {
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
		const _setOff = new SetOffModel();

		let startExport = moment(this.startExport.value).format('L');
		let endExport = moment(this.endExport.value).format('L');

		_setOff.startDate = startExport
		_setOff.endDate = endExport

		this.service.exportExcel(_setOff);
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
			this.loadTotalSetOff()
			this.loadSetOffList();
		}
	}



	checkDateValidation() {
		if (this.filterStatusValue !== "") this.date.valid = true;
		else if (this.date.start.val && this.date.end.val) this.date.valid = true;
		else {
			this.date.valid = false;
		}
	}

	clearAllFilter() {
		this.date.valid = false;
		this.searchInput.nativeElement.value = "";
		this.date.start.val = undefined;
		this.date.end.val = undefined;
		this.date.start.control.setValue(undefined);
		this.date.end.control.setValue(undefined);
		this.filterStatusValue = ""
		this.date.filter.control.setValue(undefined);

		this.loadTotalSetOff()
		this.loadSetOffList();
	}

	getDebitPerPage() {
		return this.setOffResult.map(t => t.totalAll.debit).reduce((acc, value) => acc + value, 0);
	}

	getCreditPerPage() {
		return this.setOffResult.map(t => t.totalAll.credit).reduce((acc, value) => acc + value, 0);
	}

	refresh() {
		this.loadSetOffList()
		this.loadTotalSetOff()
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
			this.loadSetOffList()
			this.loadTotalSetOff()
		})
		this.cdr.markForCheck();

	}
}
