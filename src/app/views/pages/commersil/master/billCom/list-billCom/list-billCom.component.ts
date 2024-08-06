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
import { debounceTime, distinctUntilChanged, tap, skip } from "rxjs/operators";
import { fromEvent, merge, Subscription } from "rxjs";
import { select, Store } from "@ngrx/store";
import { AppState } from "../../../../../../core/reducers";
import {
	LayoutUtilsService,
	MessageType,
	QueryParamsModel,
} from "../../../../../../core/_base/crud";
import { HttpClient } from "@angular/common/http";
import { SubheaderService } from "../../../../../../core/_base/layout";
import { BillComModel } from "../../../../../../core/commersil/master/billCom/billCom.model";
import { BillComPageRequested } from "../../../../../../core/commersil/master/billCom/billCom.action";
import { BillComDataSource } from "../../../../../../core/commersil/master/billCom/billCom.datasource";
import { BillComService } from "../../../../../../core/commersil/master/billCom/billCom.service";
import { QueryBillComModel } from "../../../../../../core/commersil/master/billCom/querybillCom.model";
import { environment } from "../../../../../../../environments/environment";
import { NgbModal, ModalDismissReasons } from "@ng-bootstrap/ng-bootstrap";
import { selectBillComById } from "../../../../../../core/commersil/master/billCom/billCom.selector";
import moment from "moment";

import * as pdfMake from "pdfmake/build/pdfmake";
import * as pdfFonts from "pdfmake/build/vfs_fonts";

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

interface ElectricityBillingModel {
	usage: {
		start: number;
		end: number;
		used: number;
	};
	price: {
		used: string;
		amount: string;
		serviceCharge: string;
		PJU: string;
		loss: string;
		total: string;
	};
	serviceCharge: number;
	PJU: number;
	loss: number;
}

interface WaterBillingModel {
	dirty: number;
	usage: {
		start: number;
		end: number;
		used: number;
	};
	price: {
		used: string;
		amount: string;
		admin: string;
		maintenance: string;
		dirty: string;
		abodemen: string;
		admBank: string;
		total: string;
	};
}

interface IPLBillingModel {
	period: string;
	usage: number;
	price: {
		used: {
			serviceCharge: string;
			sinkingFund: string;
		};
		admBank: string;
		ipl: string;
		total: string;
	};
}

interface PaymentBank {
	acctNo: string;
	acctName: string;
}

interface FeeAmount {
	acctNo: string;
	acctName: string;
}

interface IncFrmCollect {
	acctNo: string;
	acctName: string;
}
interface DataUnitObj {
	block: string;
	nmunit: string;
	floor: string;
}

interface BillingPDFContent {
	logo: string;
	logo2: string;
	startMonth: string;
	endMonth: string;

	name: string;
	unit: string;
	block: string;
	address: string;
	invoiceNo: string;
	invoiceDate: string;
	invoiceDue: string;
	period: string;

	va_ipl: string;
	va_water: string;
	va_power: string;

	totalAllGrandTotal: string;
	isReceipt: string;

	allIplInWord: string;
	allWaterInWord: string;

	totalIpl: string;

	dateReceipt: string;

	paidDateBilling: string;

	dataUnitObj: DataUnitObj;

	paymentBankObj: PaymentBank;
	feeAmountObj: FeeAmount;
	incFrmCollectObj: IncFrmCollect;

	feeAmountPriceWTR: string;

	electricity: ElectricityBillingModel;
	water: WaterBillingModel;
	IPL: IPLBillingModel;

	grandTotal: string;
	totalInWord: string;
}

@Component({
	selector: "kt-list-billCom",
	templateUrl: "./list-billCom.component.html",
	styleUrls: ["./list-billCom.component.scss"],
})
export class ListBillComComponent implements OnInit, OnDestroy {
	title = "Billing Commercial";
	periode_date = new Date();
	closeResult: string;
	file;
	dataSource: BillComDataSource;
	billCom: BillComModel;
	hari = new Date();
	year;
	unit;
	displayedColumns = [
		"print",
		"bill_no",
		"unit",
		"bill_date",
		"due_date",
		"nominal",
		// 'Payment Progress',
		"status",
		"actions",
	];
	@ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
	@ViewChild("sort1", { static: true }) sort: MatSort;
	@ViewChild("searchInput", { static: true }) searchInput: ElementRef;
	lastQuery: QueryParamsModel;
	selection = new SelectionModel<BillComModel>(true, []);
	billComResult: BillComModel[] = [];

	// Processing downloads
	downloadInProcess: number = 0;
	failedQueue: string[] = [];

	loadingbilling: boolean = false;
	private subscriptions: Subscription[] = [];
	constructor(
		private activatedRoute: ActivatedRoute,
		private store: Store<AppState>,
		private router: Router,
		private service: BillComService,
		private layoutUtilsService: LayoutUtilsService,
		private subheaderService: SubheaderService,
		private cdr: ChangeDetectorRef,
		private http: HttpClient,
		private modalService: NgbModal
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
					this.loadBillComList();
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
					this.loadBillComList();
				})
			)
			.subscribe();
		this.subscriptions.push(searchSubscription);
		this.subheaderService.setTitle(this.title);
		this.dataSource = new BillComDataSource(this.store);
		const entitiesSubscription = this.dataSource.entitySubject
			.pipe(skip(1), distinctUntilChanged())
			.subscribe(
				(res) => {
					this.billComResult = res;
				},
				(err) => {
					alert("error");
				}
			);
		this.subscriptions.push(entitiesSubscription);
		this.loadBillComList();
	}

	filterConfiguration(): any {
		const search: string =
			this.searchInput.nativeElement.value.toLowerCase();
		return search;
	}

	loadBillComList() {
		this.selection.clear();
		const queryParams = new QueryBillComModel(
			this.filterConfiguration(),
			this.paginator.pageIndex + 1,
			this.paginator.pageSize
		);
		this.store.dispatch(new BillComPageRequested({ page: queryParams }));
		this.selection.clear();
	}

	deleteBillCom(_item: BillComModel) {
		let data = this.title;

		const _title = data + " " + "Delete";
		const _description =
			"Are you sure to permanently delete this" + " " + data + " ? ";
		const _waitDesciption = data + " " + "is deleting...";
		const _deleteMessage = data + " " + "has been deleted";
		const dialogRef = this.layoutUtilsService.deleteElement(
			_title,
			_description,
			_waitDesciption
		);
		dialogRef.afterClosed().subscribe((res) => {
			if (!res) {
				return;
			}
			const deleteFlag = this.service
				.deleteFlagBillCom(_item)
				.subscribe();
			this.subscriptions.push(deleteFlag);
			this.layoutUtilsService.showActionNotification(
				_deleteMessage,
				MessageType.Delete
			);
			this.loadBillComList();
		});
	}

	editBillCom(id) {
		this.router.navigate(["edit", id], { relativeTo: this.activatedRoute });
	}

	viewBillCom(id) {
		this.router.navigate(["view", id], { relativeTo: this.activatedRoute });
	}

	ngOnDestroy() {
		this.subscriptions.forEach((sb) => sb.unsubscribe());
	}

	export() {
		this.service.exportExcel();
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
		});
	}

	auto() {
		const API_BILLING_URL = `${environment.baseAPI}/api/commersil/billcom/autocreate`;
		var data_url = this.http
			.post(`${API_BILLING_URL}`, {
				date: this.periode_date,
			})
			.subscribe(
				(res) => {
					if (res) {
						const message = `Auto Generate successfully has been added.`;
						this.layoutUtilsService.showActionNotification(
							message,
							MessageType.Create,
							1000,
							true,
							true
						);
						setTimeout(() => {
							this.loadBillComList();
						}, 5000);
					}
				},
				(err) => {
					console.error(err);
					const message =
						"Error while adding billing | " + err.statusText;
					this.layoutUtilsService.showActionNotification(
						message,
						MessageType.Create,
						1000,
						true,
						false
					);
				}
			);
	}

	changePeriode(event) {
		this.periode_date = event.value;
		console.log(event.value);
	}

	// Show download in process
	setPDFProcessNotification() {
		this.downloadInProcess -= 1;
		console.log(this.failedQueue);

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

	// printBilling(id) {
	// 	this.loadingbilling = true
	// 	const API_BILLING_URL = `${environment.baseAPI}/api/commersil/billcom`;
	// 	if (id) {
	// 		this.store.pipe(select(selectBillComById(id))).subscribe(res => {
	// 			if (res) {
	// 				this.billCom = res;
	// 				console.log(res)
	// 				this.hari = new Date(this.billCom.created_date)
	// 				this.year  = this.hari.getFullYear();
	// 				this.unit = this.billCom.unit2
	// 				console.log(typeof this.unit)
	// 			}
	// 		});
	// 	}

	// 	var mediaType = "application/pdf";
	// 	this.http
	// 		.get(`${API_BILLING_URL}/export/pdf/${id}`, {
	// 			responseType: "arraybuffer",
	// 		})
	// 		.subscribe(
	// 			(response) => {
	// 				let blob = new Blob([response], { type: mediaType });
	// 				var fileURL = URL.createObjectURL(blob);
	// 				var anchor = document.createElement("a");
	// 				anchor.download =  this.unit + "_" + this.year + "_" + this.billCom.billing_number  + ".pdf";
	// 				anchor.href = fileURL;
	// 				anchor.click();

	// 				// window.open(fileURL, "_blank")
	// 				// const src = fileURL;
	// 				// this.pdfViewer.nativeElement.data = fileURL;

	// 				if (fileURL){
	// 					this.loadingbilling = false
	// 					this.cdr.markForCheck();
	// 				}
	// 			},
	// 			(e) => {
	// 				console.error(e);
	// 				this.loadingbilling = false
	// 				this.cdr.markForCheck();
	// 			}
	// 		);
	// 	}

	// Generate PDF billing with front-end

	getPDF(id) {
		let bill: undefined | BillComModel;
		// this.store.pipe(select(selectBillingById(id))).subscribe((res) => {
		// 	if (res) {
		// 		bill = res;
		// 		console.log(res);
		// 	}
		// });

		const API_BILLCOM = `${environment.baseAPI}/api/commersil/billcom`;
		// Increse download process
		this.downloadInProcess += 1;
		this.layoutUtilsService.showActionNotification(
			`Processing download for ${this.downloadInProcess} ${this.downloadInProcess > 1 ? "item" : "items"
			}.`,
			MessageType.Create,
			15000,
			true,
			false
		);

		// this.http.get(`${API_BILLCOM}/send-billing/${id}`).subscribe(
		this.http.get(`${API_BILLCOM}/send-billing/${id}`).subscribe(
			(resp: { status: string; data: BillingPDFContent }) => {
				const label = `${resp.data.unit}-${moment(new Date()).format(
					"YYYY"
				)}-${resp.data.invoiceNo}`;
				this.generatePDFTemplate(label, resp.data);

				console.log(resp, "response");

				this.setPDFProcessNotification();
			},
			(err) => {
				this.downloadInProcess -= 1;

				// Push failed file name
				console.error(err);
				// this.failedQueue.push(bill.unit2);

				this.setPDFProcessNotification();
			}
		);
	}

	// PDF OBJ Template
	generatePDFTemplate(downloadLabel = "", content: BillingPDFContent) {
		const tablePadding = [5, 7.5];

		const tableHeader = (text = "", center = false) => ({
			text,
			alignment: center ? "center" : "left",
			bold: true,
			color: "#FFFFFF",
			fontSize: 7,
			fillColor: "#9593A4",
			margin: tablePadding,
		});

		const dd: any = {
			content: [
				// >start page title
				{
					alignment: "center",
					columns: [content.isReceipt],
					style: "headTitle",
				},
				// >end page title

				// >start cop header
				{
					columns: [
						{
							stack: [
								{
									image: "logo",
									fit: [85, 70],
								},
							],
							style: {
								alignment: "left",
							},
						},
						{
							// *Static Company address
							stack: [
								`
                	Jl. Pintu Air V No.53, RT.5/RW.2\n
                Jakarta Pusat 10710\n
                Telp. (021) 50880000\n
                `,
							],
							margin: [0, 10, 0, 0],
							style: [
								"txtSm",
								{
									alignment: "right",
									lineHeight: 0.5,
								},
							],
						},
					],
				},
				// >end cop header

				// >start Line between cop and content
				{
					margin: [0, 10, 0, 20],
					canvas: [
						{
							type: "line",
							x1: 1,
							y1: 1,
							// A4 size - left + right page margin
							x2: 595.28 - 80,
							y2: 1,
							lineWidth: 0.5,
							lineCap: "round",
						},
					],
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
                  BAPAK / IBU ${content.name}\n
                  ${content.block}\n
                  UNIT : ${content.unit}\n
                  `,
									bold: true,
								},
								{
									lineHeight: 1,
									margin: [0, -5, 0, 0],
									text: content.address,
								},
							],
						},

						{
							width: "35%",
							lineHeight: 0.55,
							margin: [20, 0, 0, 0],
							stack: [
								`\n\nNO. INVOICE : ${content.invoiceNo}\n
                TGL. INVOICE : ${content.invoiceDate}\n
                TGL. JATUH TEMPO : ${content.invoiceDue}\n
                PERIODE : ${content.period}
                `,
							],
						},
					],
				},
				// >end content heading

				// >start content table
				{
					margin: [0, 10, 0, 0],
					table: {
						headerRows: 1,
						widths: ["*", 80, 55, 60, 75],
						body: [
							// Table header
							[
								tableHeader("DESCRIPTION"),
								tableHeader("VIRTUAL ACCOUNT"),
								tableHeader("USAGE", true),
								tableHeader("PRICE", true),
								tableHeader("AMOUNT", true),
							],
							// Table content

							// >start Electricity sections
							[
								{
									fontSize: 7,
									lineHeight: 1.2,
									style: "strippedTable",
									margin: tablePadding,
									stack: [
										{
											text: `Electricity Consumption (20 ${content.startMonth} - 19 ${content.endMonth})`,
											bold: true,
											fontSize: 9,
										},
										[
											`Pemakaian (${content.electricity.usage.start} kWh - ${content.electricity.usage.end} kWh)`,
											`Service Charge (${content.electricity.serviceCharge}%)`,
											`PJU (${content.electricity.PJU}%)`,
											`Loss (${content.electricity.loss}%)`,
										],
									],
								},

								// Usage (kWh)
								{
									lineHeight: 1.2,
									style: "strippedTable",
									margin: tablePadding,
									fontSize: 7,
									text: `\n${content.va_power}`,
								},
								{
									lineHeight: 1.2,
									style: "strippedTable",
									margin: tablePadding,
									fontSize: 7,
									text: `\n${content.electricity.usage.used} kWh`,
								},

								// kWh Price used
								{
									lineHeight: 1.2,
									style: "strippedTable",
									margin: tablePadding,
									fontSize: 7,
									stack: [
										`\n${content.electricity.price.used}\n\n\n`,
										{
											text: "\nTotal",
											bold: true,
										},
									],
								},

								// All electricity prices
								{
									lineHeight: 1.2,
									style: "strippedTable",
									margin: tablePadding,
									fontSize: 7,
									stack: [
										`\n${content.electricity.price.amount}`,
										content.electricity.price.serviceCharge,
										content.electricity.price.PJU,
										content.electricity.price.loss,
										{
											text: content.electricity.price
												.total,
											bold: true,
										},
									],
								},
							],
							// >end Electricity sections

							// >start Water sections
							[
								{
									fontSize: 7,
									lineHeight: 1.2,
									margin: tablePadding,
									stack: [
										{
											text: `Water Consumption (20 ${content.startMonth} - 19 ${content.endMonth})`,
											bold: true,
											fontSize: 9,
										},
										[
											{
												columns: [
													{
														text: `Total Penggunaan (${content.water.usage.start} m`,
														width: "auto",
													},
													{
														text: "3",
														fontSize: 5,
														width: "auto",
													},
													{
														text: ` - ${content.water.usage.end} m`,
														width: "auto",
													},
													{
														text: "3",
														fontSize: 5,
														width: "auto",
													},
													{
														text: ")",
														width: "auto",
													},
												],
											},
											`Adm. Bank`,
											`Abodemen`,
											`Air Kotor (${content.water.dirty}%)`,
										],
									],
								},

								{
									lineHeight: 1.2,
									style: "strippedTable",
									margin: tablePadding,
									fontSize: 7,
									text: `\n${content.va_water}`,
								},

								{
									lineHeight: 1.2,
									margin: tablePadding,
									fontSize: 7,
									stack: [
										"\n",
										{
											columns: [
												{
													text: `${content.water.usage.used} m`,
													width: "auto",
												},
												{
													text: "3",
													fontSize: 5,
													width: "auto",
												},
											],
										},
									],
								},
								{
									lineHeight: 1.2,
									margin: tablePadding,
									fontSize: 7,
									stack: [
										`\n${content.water.price.used}\n\n\n`,
										{
											text: "\nTotal",
											bold: true,
										},
									],
								},
								{
									lineHeight: 1.2,
									margin: tablePadding,
									fontSize: 7,
									stack: [
										`\n${content.water.price.amount}`,
										content.water.price.admBank,
										content.water.price.abodemen,
										content.water.price.dirty,
										{
											text: content.water.price.total,
											bold: true,
										},
									],
								},
							],
							// >end Water sections

							// >start IPL
							[
								{
									fontSize: 7,
									lineHeight: 1.2,
									style: "strippedTable",
									margin: tablePadding,
									stack: [
										{
											text: `IPL (${content.IPL.period})`,
											bold: true,
										},
										`Service Charge`,
										`Sinking Fund`,
										`Adm. Bank`,
									],
								},

								{
									lineHeight: 1.2,
									style: "strippedTable",
									margin: tablePadding,
									fontSize: 7,
									text: `\n${content.va_ipl}`,
								},

								{
									lineHeight: 1.2,
									style: "strippedTable",
									margin: tablePadding,
									fontSize: 7,
									stack: [
										"\n",
										{
											columns: [
												{
													text: `${content.IPL.usage} m`,
													width: "auto",
												},
												{
													text: "2",
													fontSize: 5,
													width: "auto",
												},
											],
										},
									],
								},
								{
									lineHeight: 1.2,
									style: "strippedTable",
									margin: tablePadding,
									fontSize: 7,
									stack: [
										`\n${content.IPL.price.used.serviceCharge}`,
										content.IPL.price.used.sinkingFund,
										` `,
										{
											text: "Total",
											bold: true,
										},
									],
								},
								{
									lineHeight: 1.2,
									style: "strippedTable",
									margin: tablePadding,
									fontSize: 7,
									stack: [
										`\n${content.IPL.price.ipl}`,
										`-`,
										content.IPL.price.admBank,
										content.IPL.price.total,
									],
								},
							],
							// >end IPL

							// >start Total
							[
								{
									fontSize: 7,
									lineHeight: 1.2,
									margin: tablePadding,
									text: "Grand Total",
									bold: true,
								},

								{
									lineHeight: 1.2,
									style: "strippedTable",
									margin: tablePadding,
									fontSize: 7,
									text: ` `,
								},

								{
									lineHeight: 1.2,
									margin: tablePadding,
									fontSize: 7,
									text: `-`,
								},
								{
									lineHeight: 1.2,
									margin: tablePadding,
									fontSize: 7,
									text: `-`,
								},

								{
									lineHeight: 1.2,
									margin: tablePadding,
									fontSize: 7,
									text: content.grandTotal,
									bold: true,
								},
							],
							// >end Total
						],
					},
				},
				// >end content table

				// >start Total terbilang
				{
					margin: [0, 5, 0, 0],
					columns: [
						{
							text: "Terbilang: \n",
							width: "auto",
							bold: true,
							margin: [0, 0, 2, 0],
						},
						{
							text: content.totalInWord,
							width: "auto",
							italics: true,
						},
					],
				},
				// >end Total terbilang

				// >start bottom content
				{
					columns: [
						// >start terms
						{
							fontSize: 7,
							stack: [
								"Hormat Kami,",
								{
									margin: [0, 0, 0, 2],
									text: "Keuangan AR",
								},
								{
									ol: [
										// 1
										`Apabila terjadi keterlambatan pembayaran akan dikenakan sanksi berupa denda 1 ‰ (1 permil) per hari`,
										// 2
										`Pembayaran hanya melalui transfer ke Nomor Virtual Account yang ada di setiap billing`,
										// 3
										`Mohon cantumkan Nomor Unit dan Nomor Invoice pada slip setoran`,
										// 4
										`Konfirmasi pembayaran bisa dilakukan melalui mobile apps Be Medina`,
									],
								},
							],
						},
						// >end terms

						// >start Signature
						{
							alignment: "right",
							bold: true,
							fontSize: 9,
							stack: [
								"\n\n\n\nAUTHORIZED SIGNATURE\n\n\n\n\n\n\n",
								{
									text: "INVOICE INI DITERBITKAN OLEH SISTEM",
									decoration: "underline",
								},
								"SAH TANPA TANDA TANGAN",
							],
						},
						// >end Signature
					],
				},
				// >end bottom content
			],

			footer: {
				alignment: "center",
				italics: true,
				columns: [
					{
						text: "Support by Apartatech System",
						fontSize: 7,
						color: "#808080",
					},
				],
			},

			defaultStyle: {
				font: "Poppins",
				fontSize: 8,
			},

			styles: {
				headTitle: {
					fontSize: 20,
					bold: true,
					margin: [0, 10, 0, 10],
				},
				strippedTable: {
					fillColor: "#F1F1F1",
				},
				txtSm: {
					fontSize: 7,
				},
			},

			// Provided images
			images: {
				logo: content.logo,
			},
		};

		pdfMake
			.createPdf({
				pageSize: "A4",
				pageOrientation: "portrait",
				pageMargins: [40, 40],
				...dd,
			})
			.download(`${downloadLabel}.pdf`);
	}
}
