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
import { AppState } from "../../../../../core/reducers";
import {
	LayoutUtilsService,
	MessageType,
	QueryParamsModel,
} from "../../../../../core/_base/crud";

import { ArModel } from "../../../../../core/finance/ar/ar.model";
import {
	ArDeleted,
	ArPageLoaded,
	ArPageRequested,
	ArPageToggleLoading,
} from "../../../../../core/finance/ar/ar.action";
import { ArDataSource } from "../../../../../core/finance/ar/ar.datasource";
import { SubheaderService, KtDialogService } from "../../../../../core/_base/layout";
import { ArService } from "../../../../../core/finance/ar/ar.service";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { QueryArModel } from "../../../../../core/finance/ar/queryar.model";
import { environment } from "../../../../../../environments/environment";
import { FormControl } from "@angular/forms";

import * as pdfMake from "pdfmake/build/pdfmake";
import * as pdfFonts from "pdfmake/build/vfs_fonts";
// import { selectArById } from 'src/app/core/finance/ar/ar.selector';
import moment from "moment";
import { TemplatePDFAccountReceive } from "../../../../../core/templatePDF/ar.service";
import { SavingDialog } from "../../../../partials/module/saving-confirm/confirmation.dialog.component";
import { MatDialog } from "@angular/material";
import * as FileSaver from 'file-saver';
import { JourVoidDelete } from "../../../../partials/module/void-journal/jourvoid.dialog.component";


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

@Component({
	selector: "kt-list-ar",
	templateUrl: "./list-ar.component.html",
	styleUrls: ["./list-ar.component.scss"],
})
export class ListArComponent implements OnInit, OnDestroy {
	file;
	dataSource: ArDataSource;
	displayedColumns = [
		"prnt",
		"date",
		"voucherno",
		"nounit",
		"depositTo",
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
	valDateExport: boolean = false

	filterStatusValue: any = ""

	filterByStatus: any = [
		{
			payment: "All Status",
			value: "",
		},
		{
			payment: "Saldo",
			value: "saldo",
		},
		{
			payment: "Paid",
			value: "paid",
		},
		{
			payment: "Outstanding",
			value: "outstanding",
		},
		{
			payment: "Full Payment",
			value: "full-payment",
		},
		{
			payment: "Parsial Lebih",
			value: "parsial-lebih",
		},
		{
			payment: "Parsial Kurang",
			value: "parsial-kurang",
		},
		{
			payment: "Full Payment By Set Off",
			value: "full-payment-so",
		},
		{
			payment: "Parsial Lebih By Set Off",
			value: "parsial-lebih-so",
		},
		{
			payment: "Parsial Kurang By Set Off",
			value: "parsial-kurang-so",
		},
		{
			payment: "Full Payment By Write Off",
			value: "full-payment-wo",
		},
		{
			payment: "Parsial Lebih By Write Off",
			value: "parsial-lebih-wo",
		},
		{
			payment: "Parsial Kurang By Write Off",
			value: "parsial-kurang-wo",
		},
	]

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
	displayedColumnsTotal = [
		"prntTotal",
		"dateTotal",
		"vouchernoTotal",
		"depositToTotal",
		"amountTotal",
		"creditTotal",
		"statusTotal",
		"actionsTotal",
	];

	dateExport = {
		validExport: false,
		startExport: {
			control: new FormControl(),
			val: undefined,
		},
		endExport: {
			control: new FormControl(),
			val: undefined,
		},
	};
	totalAllDebitCredit: any
	sortField: string = "voucherno"
	sortOrder: string = "desc"


	// Processing downloads
	downloadInProcess: number = 0;
	failedQueue: string[] = [];

	@ViewChild("searchInput", { static: true }) searchInput: ElementRef;
	lastQuery: QueryParamsModel;
	selection = new SelectionModel<ArModel>(true, []);
	arResult: ArModel[] = [];
	private subscriptions: Subscription[] = [];

	constructor(
		private activatedRoute: ActivatedRoute,
		private templatePDFAR: TemplatePDFAccountReceive,
		private store: Store<AppState>,
		private router: Router,
		private service: ArService,
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
			.pipe(tap(() => this.loadArList()))
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
							new ArPageToggleLoading({ isLoading: true })
						);
						this.paginator.pageIndex = 0;
						this.loadArList();
					}
				})
			)
			.subscribe();
		this.subscriptions.push(searchSubscription);
		this.subheaderService.setTitle("Account Receive");
		this.dataSource = new ArDataSource(this.store);
		const entitiesSubscription = this.dataSource.entitySubject
			.pipe(skip(1), distinctUntilChanged())
			.subscribe((res) => {
				this.arResult = res;
			});
		this.subscriptions.push(entitiesSubscription);
		this.loadArList();
		this.loadTotalAR()
	}

	loadArList() {
		try {
			this.selection.clear();
			const queryParams = new QueryArModel(
				this.filterConfiguration(),
				this.date.valid ? this.date.start.val : undefined,
				this.date.valid ? this.date.end.val : undefined,
				this.sortOrder,
				this.sortField,
				this.paginator.pageIndex + 1,
				this.paginator.pageSize,
				this.filterStatusValue
			);

			// if (forSearch)
			// this.store.dispatch(new ArPageLoaded({ ar: [], totalCount: 0, page: queryParams }));
			this.store.dispatch(new ArPageRequested({ page: queryParams }));
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
	deleteAr(_item: ArModel) {
		//  Check Apakah yang diapus billing
		const value = _item.voucherno.includes("Bill/")

		if (value) {
			const url = `/billing/voidbillview/${_item.generateFrom}`;
			this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
		} else {
			// Call the Pop Up
			this.PopUpBillingDelete(_item, "ar")
		}

	}

	_getStatusClass(status) {
		let statusAR
		statusAR = status.payCond == undefined || status.payCond == "" ? status.status ?
			"Paid" : "Outstanding" : status.statusJournal == undefined ? status.payCond : status.payCond

		if (status.payCond == 'saldo') return 'chip chip--saldo';

		if (status.paidFromJournal == "so" && status.statusJournal == "parsial-kurang") return 'chip chip--parsial-kurang-so';
		else if (status.paidFromJournal == "so" && status.statusJournal == "parsial-lebih") return 'chip chip--parsial-lebih-so';
		else if (status.paidFromJournal == "so" && status.statusJournal == "full-payment") return 'chip chip--full-payment-so';
		else if (status.paidFromJournal == "so" && status.payCond == "outstanding") return 'chip chip--danger';
		else if (status.paidFromJournal == "so" && !status.status) return 'chip chip--full-payment-so';
		else if (status.paidFromJournal == "wo" && status.statusJournal == "parsial-kurang") return 'chip chip--parsial-kurang-wo';
		else if (status.paidFromJournal == "wo" && status.statusJournal == "parsial-lebih") return 'chip chip--parsial-lebih-wo';
		else if (status.paidFromJournal == "wo" && status.statusJournal == "full-payment") return 'chip chip--full-payment-wo';
		else if (status.paidFromJournal == "wo" && status.payCond == "outstanding") return 'chip chip--danger';
		else if (status.paidFromJournal == "wo" && !status.status) return 'chip chip--full-payment-wo';

		if (status.isJournal == "so" && status.statusJournal == "parsial-kurang") return 'chip chip--parsial-kurang-so';
		else if (status.isJournal == "so" && status.statusJournal == "parsial-lebih") return 'chip chip--parsial-lebih-so';
		else if (status.isJournal == "so" && status.statusJournal == "full-payment") return 'chip chip--full-payment-so';
		else if (status.isJournal == "so" && status.payCond == "outstanding") return 'chip chip--danger';
		else if (status.isJournal == "so" && !status.status) return 'chip chip--full-payment-so';
		else if (status.isJournal == "wo" && status.statusJournal == "parsial-kurang") return 'chip chip--parsial-kurang-wo';
		else if (status.isJournal == "wo" && status.statusJournal == "parsial-lebih") return 'chip chip--parsial-lebih-wo';
		else if (status.isJournal == "wo" && status.statusJournal == "full-payment") return 'chip chip--full-payment-wo';
		else if (status.isJournal == "wo" && status.payCond == "outstanding") return 'chip chip--danger';
		else if (status.isJournal == "wo" && !status.status) return 'chip chip--full-payment-wo';



		if (statusAR == 'full-payment') return 'chip chip--success';
		else if (statusAR == 'parsial-lebih') return 'chip';
		else if (statusAR == 'parsial-kurang') return 'chip chip--warning';
		else if (status.status) return 'chip chip--paid';
		else if (!status.status) return 'chip chip--danger';
		else return 'chip chip--danger'
	}

	openLarge(content) {
		this.modalService.open(content, {
			size: 'lg'
		});
	}

	regexTest(rslt) {
		const str = rslt;
		const regex = /^pbm\-[a-zA-Z]\-[0-9]\-[a-zA-Z][0-9]/g

		const result = regex.test(str)

		return result
	}

	onSubmit() {
		const _ar = new ArModel();
		let startExport = moment(this.dateExport.startExport.val).format('L');
		let endExport = moment(this.dateExport.endExport.val).format('L');

		_ar.startDate = startExport
		_ar.endDate = endExport



		this.service.exportExcel(_ar);

	}


	// get PDF isToken
	getPDFReceipt(id) {

		const API_AR = `${environment.baseAPI}/api/accreceive`;

		this.http.get(`${API_AR}/print/detail?id=${id}`).subscribe(
			(resp: any) => {
				const result = this.templatePDFAR.generatePDFTemplateAR(resp, resp.data);

				pdfMake.createPdf(result).download(`${resp.voucherNo}-${moment(new Date()).format("YYYY")}.pdf`);


				// if (resp.data.printSize == "A4") {
				// 	this.generatePDFTemplateARSizeA4(label, resp.data);
				// } else {

				// }

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

	loadTotalAR() {
		const queryParams = new QueryArModel(
			this.filterConfiguration(),
			this.date.valid ? this.date.start.val : undefined,
			this.date.valid ? this.date.end.val : undefined,
			"",
			"",
			this.paginator.pageIndex + 1,
			this.paginator.pageSize,
			this.filterStatusValue
		);
		this.service.getListARTotal(queryParams).subscribe((res) => {
			this.totalAllDebitCredit = res
		})
		this.cdr.markForCheck()
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
		const numRows = this.arResult.length;
		return numSelected === numRows;
	}

	masterToggle() {
		if (this.selection.selected.length === this.arResult.length) {
			this.selection.clear();
		} else {
			this.arResult.forEach((row) => this.selection.select(row));
		}
	}

	editAr(id) {
		this.router.navigate(["edit", id], { relativeTo: this.activatedRoute });
	}

	viewAr(id) {
		this.router.navigate(["view", id], { relativeTo: this.activatedRoute });
	}

	ngOnDestroy() {
		this.subscriptions.forEach((sb) => sb.unsubscribe());
	}


	// Event handlers and checkers
	addDate(type, e) {
		this.date[type].val = e.target.value;
		this.checkDateValidation();

		// Fetch list if date is filled
		if (this.date.valid) {
			this.loadTotalAR()
			this.loadArList();
		}
	}



	addDateExport(type, e) {
		this.dateExport[type].val = e.target.value;
		this.checkDateValidationExport();

		// Fetch list if date is filled
		// if (this.date.valid) {
		// 	this.loadArList();
		// }
	}



	checkDateValidation() {
		if (this.filterStatusValue !== "") this.date.valid = true;
		if (this.date.start.val && this.date.end.val) this.date.valid = true;
		else {
			this.date.valid = false;
		}
	}

	checkDateValidationExport() {
		if (this.dateExport.startExport.val && this.dateExport.endExport.val) {
			this.valDateExport = true
			this.dateExport.validExport = true;
		}
		else {
			this.dateExport.validExport = false;
		}
	}

	valueFilterStatus(e) {
		this.filterStatusValue = e
		this.checkDateValidation()
		this.loadTotalAR()
		this.loadArList()
	}

	clearAllFilterExport() {
		this.dateExport.validExport = false;
		this.searchInput.nativeElement.value = "";
		this.dateExport.startExport.val = undefined;
		this.dateExport.startExport.control.setValue(undefined);
		this.dateExport.endExport.val = undefined;
		this.dateExport.endExport.control.setValue(undefined);

		this.valDateExport = false

		// this.loadTotalAR()
		// this.loadArList();
	}
	clearAllFilter() {
		this.date.valid = false;
		this.searchInput.nativeElement.value = "";
		this.date.start.val = undefined;
		this.date.start.control.setValue(undefined);
		this.date.end.val = undefined;
		this.date.end.control.setValue(undefined);
		this.date.filter.control.setValue(undefined);
		this.filterStatusValue = ""
		this.loadTotalAR()
		this.loadArList();
	}

	cancel() {
		this.dateExport.validExport = false;
		this.searchInput.nativeElement.value = "";
		this.dateExport.startExport.val = undefined;
		this.dateExport.startExport.control.setValue(undefined);
		this.dateExport.endExport.val = undefined;
		this.dateExport.endExport.control.setValue(undefined);

		this.valDateExport = false
	}

	getDebitPerPage() {
		return this.arResult.map(t => t.totalAll.debit).reduce((acc, value) => acc + value, 0);
	}

	getCreditPerPage() {
		return this.arResult.map(t => t.totalAll.credit).reduce((acc, value) => acc + value, 0);
	}
	refresh() {
		this.loadArList()
		this.loadTotalAR()
	}
	// sortField
	announceSortChange(sortState) {
		this.sortField = sortState.active
		this.sortOrder = sortState.direction

		if (this.sortField === 'amount') this.sortField = 'totalAll.debit'
		else if (this.sortField === 'credit') this.sortField = 'totalAll.credit'

		this.loadArList()
		this.loadTotalAR()
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
			this.loadArList()
			this.loadTotalAR()
		})
		this.cdr.markForCheck();

	}

}
