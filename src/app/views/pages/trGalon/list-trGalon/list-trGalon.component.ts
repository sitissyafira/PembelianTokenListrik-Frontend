import { HttpClient, HttpHeaders } from "@angular/common/http";
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
import { MatPaginator, MatSort } from "@angular/material";
import { NgbModal, ModalDismissReasons } from "@ng-bootstrap/ng-bootstrap";
import { debounceTime, distinctUntilChanged, tap, skip } from "rxjs/operators";
import { fromEvent, merge, Subscription } from "rxjs";
import { Store, select } from "@ngrx/store";
import { AppState } from "../../../../core/reducers";
import { LayoutUtilsService, MessageType } from "../../../../core/_base/crud";
import { TrGalonModel } from "../../../../core/trGalon/trGalon.model";
import { TrGalonDatasource } from "../../../../core/trGalon/trGalon.datasource";
import {
	TrGalonDeleted,
	TrGalonPageRequested,
} from "../../../../core/trGalon/trGalon.action";
import { SubheaderService } from "../../../../core/_base/layout";
import { TrGalonService } from "../../../../core/trGalon/trGalon.service";
import { MomentDateAdapter } from "@angular/material-moment-adapter";
import {
	DateAdapter,
	MAT_DATE_FORMATS,
	MAT_DATE_LOCALE,
} from "@angular/material";
import * as _moment from "moment";
import { default as _rollupMoment } from "moment";
import { selectTrGalonById } from "../../../../core/trGalon/trGalon.selector";
import { environment } from "../../../../../environments/environment";
import { QueryTrGalonModel } from "../../../../core/trGalon/querytrGalon.model";

import * as pdfMake from "pdfmake/build/pdfmake";
import * as pdfFonts from "pdfmake/build/vfs_fonts";
import { FormControl } from "@angular/forms";
import { TemplatePDFGalon } from "../../../../core/templatePDF/galon.service";

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

const moment = _rollupMoment || _moment;

const MY_FORMATS = {
	parse: {
		dateInput: "LL",
	},
	display: {
		dateInput: "YYYY-MM-DD",
		monthYearLabel: "YYYY",
		dateA11yLabel: "LL",
		monthYearA11yLabel: "YYYY",
	},
};


@Component({
	selector: "kt-list-trGalon",
	templateUrl: "./list-trGalon.component.html",
	styleUrls: ["./list-trGalon.component.scss"],
	providers: [
		{
			provide: DateAdapter,
			useClass: MomentDateAdapter,
			deps: [MAT_DATE_LOCALE],
		},
		{ provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
	],
})
export class ListTrGalonComponent implements OnInit, OnDestroy {
	file;
	periode_date = new Date();
	closeResult: string;
	download_name: string;
	@ViewChild("pdfViewer", { static: true }) pdfViewer: ElementRef;
	dataSource: TrGalonDatasource;
	displayedColumns = [
		"prnt", 'read', "Unit", "trGalon_tname", "trGalon_date", "galon", "qty", "totalTrGalon", "payCond", "deliveryStatus", "actions",
	];

	data = localStorage.getItem("currentUser");
	dataUser = JSON.parse(this.data);
	role = this.dataUser.role;
	@ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
	@ViewChild("sort1", { static: true }) sort: MatSort;
	@ViewChild("searchInput", { static: true }) searchInput: ElementRef;
	lastQuery: QueryTrGalonModel;
	selection = new SelectionModel<TrGalonModel>(true, []);
	trGalonResult: TrGalonModel[] = [];

	trGalon: TrGalonModel;
	hari = new Date();
	year;
	unit;
	loadingtrGalon: boolean = false;
	loadinggenerate: boolean = false;
	private subscriptions: Subscription[] = [];
	isButtonVisible: boolean = true;

	receiptTrGalon: string = "";

	isToken: boolean = false;

	// date Start 

	priorityValue: string
	paymentValue: boolean

	filterBy = {
		control: new FormControl(),
		val: undefined
	}
	filterByStatus = {
		control: new FormControl(),
		val: undefined
	}

	isClearFilter: boolean = false

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
	// date End
	filterCategory: any = [
		{ name: "Unit No.", value: "unit", },
		{ name: "Customer", value: "customer", }
	]

	filterStatusDelivery: any = [
		{ name: "Open", value: "open", },
		{ name: "On Progress", value: "progress", },
		{ name: "On Delivery", value: "delivery", },
		{ name: "Done", value: "done", },
	]

	isSearch: boolean = false
	placeHolderSearch = "*choose category"

	valueFiltered = { category: new FormControl(), status: new FormControl() }

	// Processing downloads
	downloadInProcess: number = 0;
	failedQueue: string[] = [];

	/**
	 *
	 * @param activatedRoute: ActivatedRoute
	 * @param store: Store<AppState>
	 * @param router: Router
	 * @param layoutUtilsService: LayoutUtilsService
	 * @param subheaderService: SubheaderService
	 */
	constructor(
		private activatedRoute: ActivatedRoute,
		private templatePDFGalon: TemplatePDFGalon,
		private store: Store<AppState>,
		private router: Router,
		private service: TrGalonService,
		private layoutUtilsService: LayoutUtilsService,
		private subheaderService: SubheaderService,
		private http: HttpClient,
		private modalService: NgbModal,
		private cdr: ChangeDetectorRef
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
					this.loadTrGalonList();
				})
			)
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
					this.paginator.pageIndex = 0;
					this.loadTrGalonList();
				})
			)
			.subscribe();
		this.subscriptions.push(searchSubscription);
		this.subheaderService.setTitle("Transaction Galon");
		this.dataSource = new TrGalonDatasource(this.store);
		const entitiesSubscription = this.dataSource.entitySubject
			.pipe(skip(1), distinctUntilChanged())
			.subscribe((res) => {
				this.trGalonResult = res;
			});
		this.subscriptions.push(entitiesSubscription);
		this.loadTrGalonList();
	}

	ngOnDestroy() {
		this.subscriptions.forEach((sb) => sb.unsubscribe());
	}

	loadTrGalonList() {
		this.selection.clear();
		const queryParams = new QueryTrGalonModel(
			this.filterConfiguration(),
			// this.sort.direction,
			"asc",
			this.sort.active === "id" ? "id" : "id",
			this.paginator.pageIndex + 1,
			this.paginator.pageSize
		);

		this.store.dispatch(new TrGalonPageRequested({ page: queryParams }));
		this.selection.clear();
	}

	filterConfiguration(): any {
		const filter: any = {};
		const searchText: string =
			this.searchInput.nativeElement.value.toLowerCase();
		// filter.unit2 = `${searchText}`;
		filter.category = this.valueFiltered.category.value ? this.valueFiltered.category.value : "";
		filter.input = `${searchText}`;
		filter.startDate = this.date.start.control.value ? this.date.start.control.value : "";
		filter.endDate = this.date.end.control.value ? this.date.end.control.value : "";
		filter.status = this.valueFiltered.status.value ? this.valueFiltered.status.value : "";
		return filter;
	}

	deleteTrGalon(_item: TrGalonModel) {
		const _title = "TrGalon Delete";
		const _description = "Are you sure to permanently delete this trGalon?";
		const _waitDesciption = "TrGalon is deleting...";
		const _deleteMessage = `TrGalon has been deleted`;

		const dialogRef = this.layoutUtilsService.deleteElement(
			_title,
			_description,
			_waitDesciption
		);
		dialogRef.afterClosed().subscribe((res) => {
			if (!res) {
				return;
			}

			this.store.dispatch(new TrGalonDeleted({ id: _item._id }));
			this.layoutUtilsService.showActionNotification(
				_deleteMessage,
				MessageType.Delete
			);
		});
	}

	// selected start
	powerMeterResult: TrGalonModel[] = [];


	isAllSelected(): boolean {
		const numSelected = this.selection.selected.length;
		const numRows = this.powerMeterResult.length;
		return numSelected === numRows;
	}
	// selected end

	masterToggle() {
		if (this.selection.selected.length === this.trGalonResult.length) {
			this.selection.clear();
		} else {
			this.trGalonResult.forEach((row) => this.selection.select(row));
		}
	}

	editTrGalon(id) {
		this.router.navigate(["edit", id], { relativeTo: this.activatedRoute });
	}

	viewTrGalon(id) {
		this.router.navigate(["view", id], { relativeTo: this.activatedRoute });
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

	cekBeforePrint(id) {
		const httpHeaders = new HttpHeaders();
		httpHeaders.set("Content-Type", "application/json");
		this.getPDF(id)
	}

	// Generate PDF trGalon with front-end
	getPDF(id) {
		const API_GALON = `${environment.baseAPI}/api/galon/transaction/send-galon/${id}`;

		this.http.get(`${API_GALON}`).subscribe(
			(resp: { status: string; data }) => {
				const label = `${resp.data.unt} - ${resp.data.brand}`

				const result = this.templatePDFGalon.generatePDFTemplate(label, resp.data);
				pdfMake.createPdf(result).download(`${label}.pdf`);
			})


		// let bill: undefined | TrGalonModel;
		// this.store.pipe(select(selectTrGalonById(id))).subscribe((res) => {
		// 	if (res) {
		// 		bill = res; 
		// 	}
		// });

		// // Increse download process
		// this.downloadInProcess += 1;
		// this.layoutUtilsService.showActionNotification(
		// 	`Processing download for ${this.downloadInProcess} ${this.downloadInProcess > 1 ? "item" : "items"
		// 	}.`,
		// 	MessageType.Create,
		// 	15000,
		// 	true,
		// 	false
		// );

		// this.http.get(`${API_BILLING}/send-trGalon/${id}`).subscribe(
		// 	(resp: { status: string; data: TrGalonPDFContent }) => {
		// 		const label = `${resp.data.unit}-${moment(new Date()).format(
		// 			"YYYY"
		// 		)}-${resp.data.invoiceNo}`;
		// 		this.generatePDFTemplate(label, resp.data);


		// 		this.setPDFProcessNotification();
		// 	},
		// 	(err) => {
		// 		this.downloadInProcess -= 1;

		// 		// Push failed file name
		// 		console.error(err);
		// 		this.failedQueue.push(bill.unit2);

		// 		this.setPDFProcessNotification();
		// 	}
		// );
	}

	// Value choose category START
	valueChooseCategory(e: string) {
		this.isClearFilter = true
		if (e === "unit") {
			this.placeHolderSearch = "Unit No.";
			this.valueFiltered.category.setValue(e)
			this.isSearch = true
		} else if (e === "customer") {
			this.placeHolderSearch = "Customer"
			this.valueFiltered.category.setValue(e)
			this.isSearch = true
		}
		this.loadTrGalonList()
	}
	valueChooseStatus(e: string) {
		this.valueFiltered.status.setValue(e)
		this.isClearFilter = true
		this.loadTrGalonList()
	}
	// Value choose category END



	addDate(type, e) {
		this.date[type].val = e.target.value;
		if (this.date.start.val && this.date.end.val) {
			this.isClearFilter = true
			this.loadTrGalonList()
		}
	}

	refresh() {
		this.loadTrGalonList()
		this.filterBy.control.setValue(undefined)
		this.filterByStatus.control.setValue(undefined)
		this.date.start.control.setValue(undefined)
		this.date.end.control.setValue(undefined)
		this.searchInput.nativeElement.value = "";
		this.placeHolderSearch = "*choose category"
		this.valueFiltered.category.setValue(undefined)
		this.valueFiltered.status.setValue(undefined)
		this.isClearFilter = false
		this.isSearch = false

	}

	open(content) {
		this.modalService.open(content).result.then(
			(result) => {
				this.closeResult = `Closed with: ${result}`;
			},
			(reason) => {
				this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
			}
		);
	}

	private getDismissReason(reason: any): string {
		if (reason === ModalDismissReasons.ESC) {
			return "by pressing ESC";
		} else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
			return "by clicking on a backdrop";
		} else {
			return `with: ${reason}`;
		}
	}

	openLarge(content) {
		this.modalService.open(content, {
			size: "lg",
			backdrop: "static",
		});
	}

	changeDeliveryStatus(value: string) {
		if (value === "open") return "Open"
		else if (value === "progress") return "On Progress"
		else if (value === "delivery") return "On Delivery"
		else if (value === "done") return "Done"
	}

	changePeriode(event) {
		this.periode_date = event.value;
	}

	selectFile(event) {
		if (event.target.files.length > 0) {
			const file = event.target.files[0];
			this.file = file;
		}
	}

	export() {
		this.service.exportExcel();
	}

	clearAllFilter() {
		this.filterBy.control.setValue(undefined)
		this.filterByStatus.control.setValue(undefined)
		this.date.start.control.setValue(undefined)
		this.date.end.control.setValue(undefined)
		this.searchInput.nativeElement.value = "";
		this.placeHolderSearch = "*choose category"
		this.valueFiltered.category.setValue(undefined)
		this.valueFiltered.status.setValue(undefined)
		this.isSearch = false
		this.isClearFilter = false
		this.loadTrGalonList()
		this.cdr.markForCheck()
	}

	_getPaymentClass(status: boolean) {
		return {
			chip: true,
			"chip--success": status,
			"chip--danger": !status,
		};
	}

	// Class list for list by status
	_getStatusClass(status: boolean, date: string) {
		const diff = this.calculateDay(new Date(date));

		return {
			chip: true,
			"chip--success": status,
			"chip--danger": !status && diff <= -7,
			"chip--warning": !status && diff <= 0 && diff > -7,
		};
	}
	_getStatusPayCond(status: string) {
		if (status) return "chip chip--parsial-lebih";
		else return "chip chip--outstanding";
	}

	// testerBTN() {
	// 	const dateStart = this.date.start.control.value
	// 	const dateEnd = this.date.end.control.value
	// 	const category = this.valueFiltered.category.value
	// 	const statusDelivery = this.valueFiltered.status.value
	// 	const valueSearch = this.searchInput.nativeElement.value 
	// }

	calculateDay(date: Date): number {
		const now = new Date().getTime();
		const due = date.getTime();

		const diffInTime = due - now;
		const diffInDay = diffInTime / (1000 * 3600 * 24);

		return parseInt(diffInDay.toFixed());
	}
}
