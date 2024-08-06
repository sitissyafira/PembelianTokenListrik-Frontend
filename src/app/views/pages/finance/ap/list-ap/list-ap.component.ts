import {
	Component,
	OnInit,
	ElementRef,
	ViewChild,
	OnDestroy,
	ChangeDetectorRef,
} from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { SelectionModel } from "@angular/cdk/collections";
import { MatDialog, MatPaginator, MatSort } from "@angular/material";
import { debounceTime, distinctUntilChanged, tap, skip } from "rxjs/operators";
import { fromEvent, merge, Subscription } from "rxjs";
import { Store } from "@ngrx/store";
import { AppState } from "../../../../../core/reducers";
import {
	LayoutUtilsService,
	MessageType,
	QueryParamsModel,
} from "../../../../../core/_base/crud";
import { HttpClient } from "@angular/common/http";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { SubheaderService, KtDialogService } from "../../../../../core/_base/layout";
import { ApModel } from "../../../../../core/finance/ap/ap.model";
import {
	ApDeleted,
	ApPageLoaded,
	ApPageRequested,
} from "../../../../../core/finance/ap/ap.action";
import { ApDataSource } from "../../../../../core/finance/ap/ap.datasource";
import { ApService } from "../../../../../core/finance/ap/ap.service";
import { QueryApModel } from "../../../../../core/finance/ap/queryap.model";
import { FormControl } from "@angular/forms";

import * as pdfMake from "pdfmake/build/pdfmake";
import * as pdfFonts from "pdfmake/build/vfs_fonts";
// import { selectArById } from 'src/app/core/finance/ar/ar.selector';
import moment from "moment";
import { environment } from "../../../../../../environments/environment";
import { TemplatePDFAccountPayable } from "../../../../../core/templatePDF/ap.service";

import { SavingDialog } from "../../../../partials/module/saving-confirm/confirmation.dialog.component";

import { JourVoidDelete } from "../../../../partials/module/void-journal/jourvoid.dialog.component";

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



@Component({
	selector: "kt-list-ap",
	templateUrl: "./list-ap.component.html",
	styleUrls: ["./list-ap.component.scss"],
})
export class ListApComponent implements OnInit, OnDestroy {
	file;
	dataSource: ApDataSource;
	displayedColumns = [
		"prnt",
		"date",
		"voucherno",
		"paidFrom",
		"debit",
		"amount",
		"posting",
		"actions",
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
	@ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
	@ViewChild("sort1", { static: true }) sort: MatSort;
	@ViewChild("searchInput", { static: true }) searchInput: ElementRef;
	lastQuery: QueryParamsModel;
	data = localStorage.getItem("currentUser");
	dataUser = JSON.parse(this.data);
	role = this.dataUser.role;
	valDateExport: boolean = false
	selection = new SelectionModel<ApModel>(true, []);
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
	apResult: ApModel[] = [];
	// Processing downloads
	downloadInProcess: number = 0;
	failedQueue: string[] = [];

	sortField: string = "date"
	sortOrder: string = "desc"
	isButtonActive: boolean = true;
	totalAllDebitCredit: any;
	private subscriptions: Subscription[] = [];
	constructor(
		private activatedRoute: ActivatedRoute,
		private templatePDFAP: TemplatePDFAccountPayable,
		private store: Store<AppState>,
		private router: Router,
		private service: ApService,
		private layoutUtilsService: LayoutUtilsService,
		private subheaderService: SubheaderService,
		private cdr: ChangeDetectorRef,
		private http: HttpClient,
		private modalService: NgbModal,
		private dialogueService: KtDialogService,
		private dialog: MatDialog
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
			.pipe(
				tap(() => {
					this.loadApList();
				})
			)
			.subscribe();
		this.subscriptions.push(paginatorSubscriptions);
		const searchSubscription = fromEvent(
			this.searchInput.nativeElement,
			"keyup"
		)
			.pipe(
				debounceTime(500),
				distinctUntilChanged(),
				tap(() => {
					this.paginator.pageIndex = 0;
					this.loadApList();
				})
			)
			.subscribe();
		this.subscriptions.push(searchSubscription);
		this.subheaderService.setTitle("Account Payment");
		this.dataSource = new ApDataSource(this.store);
		const entitiesSubscription = this.dataSource.entitySubject
			.pipe(skip(1), distinctUntilChanged())
			.subscribe(
				(res) => {
					this.apResult = res;
				},
				(err) => {
					alert("error");
				}
			);
		this.subscriptions.push(entitiesSubscription);
		this.loadApList();
		this.loadTotalAP()
	}

	// loadApList() {
	// 	this.selection.clear();
	// 	const queryParams = new QueryApModel(
	// 		this.filterConfiguration(),
	// 		this.paginator.pageIndex + 1,
	// 		this.paginator.pageSize
	// 	);
	// 	this.store.dispatch(new ApPageRequested({ page: queryParams }));
	// 	this.selection.clear();
	// }

	openLarge(content) {
		this.modalService.open(content, {
			size: 'lg'
		});
	}

	onSubmit() {

		const _ap = new ApModel();

		let startExport = moment(this.dateExport.startExport.val).format('L');
		let endExport = moment(this.dateExport.endExport.val).format('L');

		_ap.startDate = startExport
		_ap.endDate = endExport



		this.exportExcel(_ap)

	}
	loadApList() {
		this.selection.clear();
		const queryParams = new QueryApModel(
			this.filterConfiguration(),
			this.paginator.pageIndex + 1,
			this.paginator.pageSize,
			this.date.valid ? this.date.start.val : undefined,
			this.date.valid ? this.date.end.val : undefined,
			this.sortOrder,
			this.sortField,
		);
		this.store.dispatch(new ApPageRequested({ page: queryParams }));
		this.selection.clear();
	}

	filterConfiguration(): any {
		const filter: any = {};
		const searchText: string = this.searchInput.nativeElement.value;
		filter.search = `${searchText}`;
		return filter;
	}

	loadTotalAP() {
		const queryParams = new QueryApModel(
			this.filterConfiguration(),
			this.paginator.pageIndex + 1,
			this.paginator.pageSize,
			this.date.valid ? this.date.start.val : undefined,
			this.date.valid ? this.date.end.val : undefined,
			this.sortOrder,
			this.sortField,
		);
		this.service.getListAPTotal(queryParams).subscribe((res) => {
			this.totalAllDebitCredit = res;
		})
		this.cdr.markForCheck()
	}
	// deleteAp(_item: ApModel) {
	// 	const _title = 'Account Payment Delete';
	// 	const _description = 'Are you sure to permanently delete this account payment ?';
	// 	const _waitDesciption = 'Account Payment is deleting...';
	// 	const _deleteMessage = `Account Payment has been deleted`;
	// 	const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
	// 	dialogRef.afterClosed().subscribe(res => {
	// 		if (!res) {
	// 			return;
	// 		}
	// 		const deleteFlag = this.service.deleteFlagAp(_item).subscribe()
	// 		this.subscriptions.push(deleteFlag);
	// 		this.layoutUtilsService.showActionNotification(_deleteMessage, MessageType.Delete);
	// 		this.loadApList();
	// 	});
	// }

	editAp(id) {
		this.router.navigate(["edit", id], { relativeTo: this.activatedRoute });
	}

	deleteAp(_item: ApModel) {
		this.PopUpBillingDelete(_item, "ap")
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

	getDebitPerPage() {
		return this.apResult.map(t => t.totalAll.debit).reduce((acc, value) => acc + value, 0);
	}

	getCreditPerPage() {
		return this.apResult.map(t => t.totalAll.credit).reduce((acc, value) => acc + value, 0);
	}
	// get PDF isToken
	getPDFReceipt(id) {

		const API_AR = `${environment.baseAPI}/api/accpurchase`;

		this.http.get(`${API_AR}/print/detail?id=${id}`).subscribe(
			(resp: any) => {
				const result = this.templatePDFAP.generatePDFTemplateAP(resp, resp.data);

				pdfMake.createPdf(result).download(`${resp.voucherNo}-${moment(new Date()).format("YYYY")}.pdf`);
				// nted

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

	// Before Print
	cekBeforePrint(id) {
		this.getPDFReceipt(id);
	}



	// Event handlers and checkers
	addDate(type, e) {
		this.date[type].val = e.target.value;
		this.checkDateValidation('');

		// Fetch list if date is filled
		if (this.date.valid) {
			this.loadApList();
		}
	}
	addDateExport(type, e) {
		this.dateExport[type].val = e.target.value;
		this.checkDateValidation('export')
	}

	checkDateValidation(type) {

		if (type === 'export') {
			this.valDateExport = true
			if (this.dateExport.startExport.val && this.dateExport.endExport.val) this.dateExport.validExport = true;
			else {
				this.valDateExport = false
				this.dateExport.validExport = false;
			}
		} else {
			if (this.date.start.val && this.date.end.val) this.date.valid = true;
			else {
				this.date.valid = false;
			}
		}
	}

	clearAllFilter() {
		this.date.valid = false;
		this.searchInput.nativeElement.value = "";
		this.date.start.val = undefined;
		this.date.start.control.setValue(undefined);
		this.date.end.val = undefined;
		this.date.end.control.setValue(undefined);

		this.loadApList();
	}

	clearAllFilterExport() {
		this.dateExport.validExport = false;
		this.searchInput.nativeElement.value = "";
		this.dateExport.startExport.val = undefined;
		this.dateExport.startExport.control.setValue(undefined);
		this.dateExport.endExport.val = undefined;
		this.dateExport.endExport.control.setValue(undefined);

		this.valDateExport = false
	}
	viewAp(id) {
		this.router.navigate(["view", id], { relativeTo: this.activatedRoute });
	}
	ngOnDestroy() {
		this.subscriptions.forEach((sb) => sb.unsubscribe());
	}

	cancelAp() {
		this.dateExport.validExport = false;
		this.searchInput.nativeElement.value = "";
		this.dateExport.startExport.val = undefined;
		this.dateExport.startExport.control.setValue(undefined);
		this.dateExport.endExport.val = undefined;
		this.dateExport.endExport.control.setValue(undefined);

		this.valDateExport = false
	}

	exportExcel(data) {
		this.isButtonActive = false;
		this.service.exportExcel(data)
	}

	refresh() {
		this.loadApList()
		this.loadTotalAP()
	}
	// sortField
	announceSortChange(sortState) {
		this.sortField = sortState.active
		this.sortOrder = sortState.direction

		if (this.sortField === 'amount') this.sortField = 'totalAll.debit'
		else if (this.sortField === 'credit') this.sortField = 'totalAll.credit'

		this.loadApList()
		this.loadTotalAP()
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
			this.loadApList()
			this.loadTotalAP()
		})
		this.cdr.markForCheck();

	}

	_getStatusClass(status) {
		if (status.status === true) return 'chip chip--paid';
		else if (status.status === false) return 'chip chip--danger';
		else return 'chip chip--danger'
	}
}
