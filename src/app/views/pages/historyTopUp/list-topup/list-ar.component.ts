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
import { AppState } from "../../../../core/reducers";
import {
	LayoutUtilsService,
	MessageType,
	QueryParamsModel,
} from "../../../../core/_base/crud";

import { HistoryTopUpModel } from "../../../../core/historyTopUp/ar.model";
import {
	HistoryTopUpDeleted,
	HistoryTopUpPageLoaded,
	HistoryTopUpPageRequested,
	HistoryTopUpPageToggleLoading,
} from "../../../../core/historyTopUp/ar.action";
import { HistoryTopUpDataSource } from "../../../../core/historyTopUp/ar.datasource";
import { SubheaderService } from "../../../../core/_base/layout";
import { HistoryTopUpService } from "../../../../core/historyTopUp/ar.service";
import { HttpClient } from "@angular/common/http";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { QueryHistoryTopUpModel } from "../../../../core/historyTopUp/queryar.model";
import { environment } from "../../../../../environments/environment";
import { FormControl } from "@angular/forms";

// Start Print
import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import moment from "moment";

const appHost = `${location.protocol}//${location.host}`;

(<any>pdfMake).vfs = pdfFonts.pdfMake.vfs;
(<any>pdfMake).fonts = {
	Poppins: {
		normal: `${appHost}/assets/fonts/poppins/regular.ttf`,
		bold: `${appHost}/assets/fonts/poppins/bold.ttf`,
		italics: `${appHost}/assets/fonts/poppins/italics.ttf`,
		bolditalics: `${appHost}/assets/fonts/poppins/bolditalics.ttf`
	}
}

// Start Print
interface BillingPDFContent {
	namaCust: string,
	tower: string,
	unit: string,
	adr: string,
	cdTran: string,
	tglTrans: string,
	order: string,
	mtdPay: string,
	price: string,
	admin: string,
	total: string,
	terbilang: string,
	logo: string
}
// End Print
// End Print

@Component({
	selector: "kt-list-ar",
	templateUrl: "./list-ar.component.html",
	styleUrls: ["./list-ar.component.scss"],
})
export class ListArComponent implements OnInit, OnDestroy {
	file;
	dataSource: HistoryTopUpDataSource;
	displayedColumns = [
		"print",
		"idTransaksi",
		"tglTransaksi",
		"noUnit",
		"orderan",
		"harga",
		"metodePembayaran",
		"statusPayment",
		"progressTopUp",
		"admin",
		"actions",
	];
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

	datePicker: Date = new Date()
	dateConfirm: Date = new Date(this.datePicker.getFullYear(), this.datePicker.getMonth(), 0)

	@ViewChild("searchInput", { static: true }) searchInput: ElementRef;
	lastQuery: QueryParamsModel;
	selection = new SelectionModel<HistoryTopUpModel>(true, []);
	arResult: HistoryTopUpModel[] = [];
	private subscriptions: Subscription[] = [];

	constructor(
		private activatedRoute: ActivatedRoute,
		private store: Store<AppState>,
		private router: Router,
		private service: HistoryTopUpService,
		private layoutUtilsService: LayoutUtilsService,
		private subheaderService: SubheaderService,
		private cdr: ChangeDetectorRef,
		private http: HttpClient,
		private modalService: NgbModal
	) { }

	ngOnInit() {
		console.log(this.dateConfirm);

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
							new HistoryTopUpPageToggleLoading({ isLoading: true })
						);
						this.paginator.pageIndex = 0;
						this.loadArList();
					}
				})
			)
			.subscribe();
		this.subscriptions.push(searchSubscription);
		this.subheaderService.setTitle("History Transaksi Top Up Listrik");
		this.dataSource = new HistoryTopUpDataSource(this.store);
		const entitiesSubscription = this.dataSource.entitySubject
			.pipe(skip(1), distinctUntilChanged())
			.subscribe((res) => {
				this.arResult = res;
				console.log(res);


			});
		this.subscriptions.push(entitiesSubscription);
		this.loadArList();
	}

	// btn
	_getPaymentClass(status: string) {
		if (status === 'in process') {
			return "chip chip--warning"
		} else if (status === 'done') {
			return "chip chip--success"
		} else {
			return "chip chip--danger"
		}
	}

	_getProgressClass(status: string) {
		if (status === 'done') {
			return "chip chip--success"
		} else if (status === 'in progress') {
			return "chip chip--warning"
		} else {
			return "chip chip--danger"
		}
	}


	loadArList() {
		try {
			this.selection.clear();
			const queryParams = new QueryHistoryTopUpModel(
				this.searchInput.nativeElement.value,
				this.date.valid ? this.date.start.val : 0,
				this.date.valid ? this.date.end.val : 0,
				this.sort.direction,
				this.sort.active,
				this.paginator.pageIndex + 1,
				this.paginator.pageSize
			);

			// if (forSearch)
			// this.store.dispatch(new HistoryTopUpPageLoaded({ ar: [], totalCount: 0, page: queryParams }));
			this.store.dispatch(new HistoryTopUpPageRequested({ page: queryParams }));
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
	deleteTopUp(_item: HistoryTopUpModel) {
		const _title = "Transaction Top Up Delete";
		const _description =
			"Are you sure to permanently delete this Transaction Top Up?";
		const _waitDesciption = "Transaction Top Up is deleting...";
		const _deleteMessage = `Transaction Top Up has been deleted`;

		const dialogRef = this.layoutUtilsService.deleteElement(
			_title,
			_description,
			_waitDesciption
		);
		dialogRef.afterClosed().subscribe((res) => {
			if (!res) {
				return;
			}

			this.store.dispatch(new HistoryTopUpDeleted({ id: _item._id }));
			this.layoutUtilsService.showActionNotification(
				_deleteMessage,
				MessageType.Delete
			);
			// this.loadArList();
		});
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
	export() {
		this.service.exportExcel();
	}

	// Event handlers and checkers
	addDate(type, e) {
		this.date[type].val = e.target.value;
		this.checkDateValidation();

		// Fetch list if date is filled
		if (this.date.valid) {
			this.loadArList();
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
		this.date.start.val = "";
		this.date.start.control.setValue("");
		this.date.end.val = "";
		this.date.end.control.setValue("");

		this.loadArList();
	}

	// Show download in process
	setPDFProcessNotification() {
		this.downloadInProcess -= 1;
		console.log(this.failedQueue);

		if (this.downloadInProcess <= 0) {
			// Reset in process value
			this.downloadInProcess = 0;
			this.layoutUtilsService.showActionNotification(
				'Waiting for download...',
				MessageType.Create,
				3500,
				true,
				false
			);

			// Show alert when encountered error in process
			if (this.failedQueue.length > 0) {
				let msg = 'Invoice unit yang gagal di unduh:';
				this.failedQueue.forEach((item, index) => {
					msg += `\n${index + 1}. ${item}`;
				});

				// Show and clear the listed failed unit invoices
				alert(msg);
				this.failedQueue = [];
			}
		} else {
			this.layoutUtilsService.showActionNotification(
				`Processing download for ${this.downloadInProcess} ${this.downloadInProcess > 1 ? 'items' : 'item'}.`,
				MessageType.Create,
				15000,
				true,
				false
			);
		}
	}

	// Start Print
	getPDF(id: string) {

		console.log(id);

		this.service.getPrintTransaksi(id).subscribe(
			res => {
				console.log("helo");

				console.log(res);
				let data = {
					namaCust: res.data.namaCust,
					tower: res.data.tower,
					unit: res.data.unit,
					adr: res.data.adr,
					cdTran: res.data.cdTran,
					tglTrans: res.data.tglTrans,
					order: res.data.order,
					mtdPay: res.data.mtdPay,
					price: res.data.price,
					admin: res.data.admin,
					total: res.data.total,
					terbilang: res.data.terbilang,
					logo: res.data.logo
				}
				const label = `${res.data.unit}-${moment(new Date()).format('YYYY')}-${res.data.cdTran}`
				console.log(label);
				console.log(data.logo);

				this.generatePDFTemplate(label, data);

				this.setPDFProcessNotification()
			},
			err => {
				console.log(err);
				this.setPDFProcessNotification()

			}
		);

	}

	// End Print

	// Start Print
	generatePDFTemplate(downloadLabel = '', content: BillingPDFContent) {

		const tablePadding = [5, 7.5];

		const tableHeader = (text = '', center = false) => ({
			text,
			alignment: center ? 'center' : 'left',
			bold: true,
			color: '#FFFFFF',
			fontSize: 7,
			fillColor: '#4caf50',
			margin: tablePadding
		});

		const dd: any = {
			content: [
				// >start page title
				{
					alignment: 'center',
					columns: [
						'INVOICE'
					],
					style: 'headTitle'
				},
				// >end page title

				// >start cop header
				{
					columns: [
						{
							stack: [
								{
									image: 'logo',
									fit: [85, 70]
								}
							],
							style: {
								alignment: 'left',
							}
						},
						{
							// *Static Company address
							stack: [
								` Jl. Kelapa Dua Raya No.93, Klp. Dua\n
                Kec. Klp. Dua, Tangerang, Banten\n
                15810\n
                Phone : 0856-9770-9636 (Hotline)
                `
							],
							margin: [0, 10, 0, 0],
							style: [
								'txtSm',
								{
									alignment: 'right',
									lineHeight: 0.5
								}
							]
						}
					]
				},
				// >end cop header

				// >start Line between cop and content
				{
					margin: [0, 10, 0, 20],
					canvas: [
						{
							type: 'line',
							x1: 1, y1: 1,
							// A4 size - left + right page margin
							x2: 595.28 - 80, y2: 1,
							lineWidth: .5,
							lineCap: 'round'
						},
					]
				},
				// >end Line between cop and contenti

				// >start content heading
				{
					columns: [
						{
							lineHeight: 0.55,
							stack: [
								{
									text: `KEPADA YTH.\n
                  BAPAK / IBU ${content.namaCust}\n
                  ${content.tower}\n
                  UNIT : ${content.unit}\n
                  `,
									bold: true,

								},
								{
									lineHeight: 1,
									margin: [0, -5, 0, 0],
									text: `Alamat : ${content.adr}`
								}
							]
						},

						{
							width: '35%',
							lineHeight: 0.55,
							margin: [20, 0, 0, 0],
							stack: [
								`NO. TRANSAKSI : ${content.cdTran}\n
                 TGL. TRANSAKSI : ${content.tglTrans}\n
                `
							]
						}
					]
				},
				// >end content heading

				// >start content table
				{
					margin: [0, 10, 0, 0],
					table: {
						headerRows: 1,
						widths: ['*', 60, 75, 75, 75],
						body: [
							// Table header
							[
								tableHeader('Orderan'),
								tableHeader('Metode Pembayaran', true),
								tableHeader('Harga', true),
								tableHeader('Biaya Admin', true),
								tableHeader('Total', true),
							],
							// Table content

							// >start Electricity sections
							[
								{
									fontSize: 7,
									lineHeight: 1.2,
									style: 'strippedTable',
									margin: tablePadding,
									stack: [
										{
											text: `${content.order}`,
											bold: true,
											fontSize: 9
										},

									]
								},

								// Usage (kWh)
								{
									lineHeight: 1.2,
									style: 'strippedTable',
									margin: tablePadding,
									fontSize: 7,
									text: `\n${content.mtdPay}`
								},
								{
									lineHeight: 1.2,
									style: 'strippedTable',
									margin: tablePadding,
									fontSize: 7,
									text: `\n${content.price}`
								},
								{
									lineHeight: 1.2,
									style: 'strippedTable',
									margin: tablePadding,
									fontSize: 7,
									text: `\n${content.admin}`
								},
								{
									lineHeight: 1.2,
									style: 'strippedTable',
									margin: tablePadding,
									fontSize: 7,
									text: `\n${content.total}`
								},

							],
							// >end Electricity sections

							// >start Total
							[
								{
									fontSize: 7,
									lineHeight: 1.2,
									margin: tablePadding,
									text: 'Total : ',
									bold: true
								},

								{
									lineHeight: 1.2,
									margin: tablePadding,
									fontSize: 7,
									text: ''
								},
								{
									lineHeight: 1.2,
									margin: tablePadding,
									fontSize: 7,
									text: ''
								},

								{
									lineHeight: 1.2,
									margin: tablePadding,
									fontSize: 7,
									text: '',
									bold: true
								},
								{
									lineHeight: 1.2,
									margin: tablePadding,
									fontSize: 7,
									text: `${content.total}`,
									bold: true
								}
							]
							// >end Total
						]
					}
				},
				// >end content table

				// >start Total terbilang
				{
					margin: [0, 5, 0, 0],
					columns: [
						{
							text: 'Terbilang: \n',
							width: 'auto',
							bold: true,
							margin: [0, 0, 2, 0]
						},
						{
							text: `${content.terbilang}`,
							width: 'auto',
							italics: true
						}
					]
				},
				// >end Total terbilang

				// >start bottom content
				{
					columns: [

						// >start Signature
						{
							alignment: 'right',
							bold: true,
							fontSize: 9,
							stack: [
								'\n\n\n\nAUTHORIZED SIGNATURE\n\n\n\n\n\n\n',
								{
									text: 'INVOICE INI DITERBITKAN OLEH SISTEM',
									decoration: 'underline'
								},
								'SAH TANPA TANDA TANGAN'
							]
						}
						// >end Signature
					]
				}
				// >end bottom content

			],

			footer: {
				alignment: 'center',
				italics: true,
				columns: [
					{
						text: 'Support by Apartatech System',
						fontSize: 7,
						color: '#808080'
					}
				]
			},

			defaultStyle: {
				font: 'Poppins',
				fontSize: 8
			},

			styles: {
				headTitle: {
					fontSize: 20,
					bold: true,
					margin: [0, 10, 0, 10]
				},
				strippedTable: {
					fillColor: '#F1F1F1'
				},
				txtSm: {
					fontSize: 7
				}
			},

			// Provided images
			images: {
				logo: `${environment.baseAPI}${content.logo}`
			}
		};

		pdfMake.createPdf({
			pageSize: 'A4',
			pageOrientation: 'portrait',
			pageMargins: [40, 40],
			...dd
		}).download(`${downloadLabel}.pdf`);
	}
	// End Print
}
