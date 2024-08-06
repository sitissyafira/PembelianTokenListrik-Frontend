import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable, of } from "rxjs";
import moment from "moment";
import { ServiceFormat } from "../serviceFormat/format.service";

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
	taxPercent: number;
	totalTax: string;
	adminFee: string;
	adminFeeAfterTax: string;
	allPowerAmountAfterFeeAndTax: string;
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
	taxPercent: number;
	totalTax: string;
	adminFee: string;
	adminFeeAfterTax: string;
	allWaterAmountAfterFeeAndTax: string;
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
	taxPercent: number;
	totalTax: string;
	allIplAfterTax: string;
}

interface GalonBillingModel {
	unitCode: string;
	brand: string;
	rate: string;
	quantity: string;
	eachTotal: string;
	totalQty: number;
	totalTr: string;
	taxPercentage: number;
	totalTax: string;
	totalTrAfterTax: string;
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
	va_gas: string;
	va_parking: string;
	va_utility: string;

	isSewa: boolean;

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
	galon: GalonBillingModel;

	grandTotal: string;
	totalInWord: string;
}

@Injectable({
	providedIn: "root",
})
export class TemplatePDFBilling {
	constructor(private http: HttpClient, private serviceFormat: ServiceFormat) {}

	//  #Template Is Token Receipt
	generatePDFTemplateIsTokenReceipt(content: any) {
		const tablePadding = [5, 5];
		const tabblePaddingTitle = [3, 3];

		const tableHeader = (text = "", center = false) => ({
			text,
			alignment: center ? "center" : "left",
			bold: true,
			color: "#FFFFFF",
			fontSize: 8,
			fillColor: "#9593A4",
			margin: tabblePaddingTitle,
		});
		const receiveTablePadding = [2, 2];
		const receiveTablePaddingTitle = [2, 2];

		const receiveTableHeader = (text = "", center = false) => ({
			text,
			alignment: center ? "center" : "left",
			bold: true,
			color: "#FFFFFF",
			fontSize: 5,
			fillColor: "#9593A4",
			margin: receiveTablePaddingTitle,
		});

		let receiveVoucherHeader = [receiveTableHeader("ACCOUNT CODE", true), receiveTableHeader("DESCRIPTION", true), receiveTableHeader("AMOUNT", true)];
		let powerBody = [];
		let waterBody = [];
		let iplBody = [];
		let receiveVoucherBody = [];

		receiveVoucherBody.push(receiveVoucherHeader);

		let receiveVoucherFooter = [
			{
				margin: receiveTablePadding,
				fontSize: 6,
				alignment: "center",
				fillColor: "#9593A4",
				color: "#ffffff",
				text: "IN WORD",
				bold: true,
			},
			{
				fontSize: 6,
				margin: receiveTablePadding,
				stack: [
					{
						text: content.totalInWord,
						fontSize: 5,
					},
				],
			},
			{
				margin: receiveTablePadding,
				fontSize: 6,
				alignment: "right",
				text: content.grandTotal,
			},
		];

		if (content.account_list) {
			content.account_list.account_ipl.map((item) => {
				let isPayment = "";
				if (item.isDebit === true) {
					isPayment = "Debit";
				} else {
					isPayment = "Credit";
				}

				let row = [
					{
						margin: receiveTablePadding,
						fontSize: 6,
						alignment: "center",
						text: item.acctNo,
					},
					{
						margin: receiveTablePadding,
						fontSize: 6,
						text: `${item.acctName} - ${isPayment}`,
					},
					{
						margin: receiveTablePadding,
						fontSize: 6,
						alignment: "right",
						text: item.amount_format,
					},
				];
				receiveVoucherBody.push(row);
			});
		}

		if (content.account_list) {
			content.account_list.account_power.map((item) => {
				let isPayment = "";
				if (item.isDebit === true) {
					isPayment = "Debit";
				} else {
					isPayment = "Credit";
				}

				let row = [
					{
						margin: receiveTablePadding,
						fontSize: 6,
						alignment: "center",
						text: item.acctNo,
					},
					{
						margin: receiveTablePadding,
						fontSize: 6,
						text: `${item.acctName} - ${isPayment}`,
					},
					{
						margin: receiveTablePadding,
						fontSize: 6,
						alignment: "right",
						text: item.amount_format,
					},
				];
				//   powerBody.push(row)
				receiveVoucherBody.push(row);
			});
		}

		if (content.account_list) {
			content.account_list.account_water.map((item) => {
				let isPayment = "";
				if (item.isDebit === true) {
					isPayment = "Debit";
				} else {
					isPayment = "Credit";
				}
				let row = [
					{
						margin: receiveTablePadding,
						fontSize: 6,
						alignment: "center",
						text: item.acctNo,
					},
					{
						margin: receiveTablePadding,
						fontSize: 6,
						text: `${item.acctName} - ${isPayment}`,
					},
					{
						margin: receiveTablePadding,
						fontSize: 6,
						alignment: "right",
						text: item.amount_format,
					},
				];
				receiveVoucherBody.push(row);
			});
		}

		let additionalMessage = "";
		let listMessage = "";

		if (content.checkPinalty) {
			// if (content.isPinalty === true) {
			additionalMessage = " ";
			// content.pinalty.map((data) => {
			// 	if (listMessage == "") {
			// 		listMessage = data
			// 	} else {
			// 		listMessage = listMessage + ", " + data
			// 	}
			// })
		}

		receiveVoucherBody.push(receiveVoucherFooter);

		let receiptTemplate: any = {
			content: [
				// >start page title
				{
					columns: [
						{
							alignment: "left",
							image: "logo",
							fit: [80, 80],
						},
						{
							alignment: "right",
							fontSize: 18,
							stack: [
								{
									text: "RECEIPT",
									style: "receiptHeadTitle",

									margin: [0, 10, 105, 0],
								},
								{
									alignment: "right",
									fontSize: 6.5,
									margin: [125, 0, 0, 0],
									columns: [
										{
											alignment: "left",
											width: 40,
											stack: ["Receipt No", "Receipt", "Period", "Unit No"],
										},
										{
											width: 1,
											stack: [":", ":", ":", ":"],
										},
										{
											alignment: "left",
											margin: [2, 0, 0, 0],
											width: 120,
											stack: [content.invoiceNo, content.paidDateBilling, content.receiptPeriod ? content.receiptPeriod : content.period, content.unit],
										},
									],
								},
							],
							margin: [0, 0, 0, 0],
						},
					],
				},
				// >start content table
				{
					margin: [0, 40, 0, 0],
					table: {
						widths: ["*"],
						heights: [20, 20],
						body: [
							[
								{
									margin: [2, 2],
									fontSize: 8,
									stack: [`Received From          :    ${content.name}`],
								},
							],
							[
								{
									margin: [2, 2],
									fontSize: 8,
									stack: [
										// `Amount Received     :    ${content.grandTotal} `,
										`Amount Received     :    ${content.totalNominal} `,
									],
								},
							],
						],
					},
				},
				// >end content table

				// >start Total terbilang
				{
					margin: [0, 10, 0, 0],
					columns: [
						{
							text: `In Words  `,
							fontSize: 8,
							width: 90,
							bold: true,
							margin: [0, 0, 2, 0],
						},
						{
							// text: `${content.totalInWord}`,
							text: `: ${content.totalNominalInWord}`,
							fontSize: 8,
							width: "auto",
							italics: true,
						},
					],
				},
				{
					margin: [0, 5, 0, 0],
					columns: [
						{
							// text: "In Payment Of   :   \n",
							text: "Payment Type ",
							fontSize: 8,
							width: 90,
							bold: true,
							margin: [0, 0, 2, 0],
						},
						{
							// text:"PEMBAYARAN BILLING IPL",
							text: `: ${content.paymentSelection}`,
							fontSize: 8,
							width: "auto",
						},
					],
				},
				{
					margin: [0, 5, 0, 0],
					columns: [
						{
							text: "Outstanding Amount  ",
							fontSize: 8,
							width: 90,
							bold: true,
							margin: [0, 0, 2, 0],
						},
						{
							text: `: ${content.totalBillLeft}`,
							fontSize: 8,
							width: "auto",
						},
					],
				},
				{
					margin: [0, 5, 0, 5],
					columns: [
						{
							text: "Payment Method  ",
							fontSize: 8,
							width: 90,
							bold: true,
							margin: [0, 0, 2, 0],
						},
						{
							text: `: ${content.paymentType}                                                  Reff No`,
							fontSize: 8,
							width: "auto",
						},
					],
				},

				{
					margin: [0, 0, 0, 0],
					columns: [
						{
							text: "The Receipt is valid only after the cheque (s) / Giro \nhas been cleared.",
							fontSize: 8,
						},
					],
				},
				{
					margin: [0, 8, 0, 0],
					fontSize: 8,
					width: "auto",
					bold: true,
					style: { color: "red" },
					text: ` ${additionalMessage}\n`,
				},
				{
					fontSize: 6,
					style: { color: "red" },
					text: ` ${listMessage}\n`,
				},
				// >end Total terbilang
				// >start bottom content
				{
					columns: [
						// >start Signature
						{
							margin: [0, -45, 0, 35],
							alignment: "right",
							bold: true,
							fontSize: 8,
							stack: [
								"AUTHORIZED SIGNATURE\n\n\n\n\n",
								{
									text: "RECEIPT INI DITERBITKAN OLEH SISTEM",
									decoration: "underline",
								},
								{
									text: "SAH TANPA TANDA TANGAN",
									margin: [0, 0, 20, 20],
								},
							],
						},
						// >end Signature
					],
				},
			],
			footer: {
				alignment: "center",
				italics: true,
				margin: [0, -15, 0, 0],
				columns: [
					{
						stack: [
							{
								text: `printed by: ${content.printed.printed_by}, printed date: ${content.printed.printed_date}, printed count: ${content.printed.count}`,
								fontSize: 5,
								color: "#808080",
							},
							{
								text: "Support by Apartatech System",
								fontSize: 6,
								color: "#808080",
							},
						],
					},
				],
			},
			pageOrientation: "landscape",
			defaultStyle: {
				font: "Poppins",
				fontSize: 8,
			},

			styles: {
				headTitle: {
					fontSize: 20,
					bold: true,
					margin: [0, 10, 0, 5],
				},
				receiptHeadTitle: {
					fontSize: 14,
					bold: true,
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
				// logo2: content.logo2,
			},
		};

		const contentObj = {
			pageSize: "A5",
			pageOrientation: "portrait",
			pageMargins: [20, 20],
			...receiptTemplate,
		};
		return contentObj;
	}

	// #Template PDF Billing IsToken
	generatePDFTemplateisToken(content: any) {
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
					columns: ["INVOICE"],
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
								` 	Jl. Pintu Air V No.53, RT.5/RW.2\n
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
							[tableHeader("DESCRIPTION", true), tableHeader("VIRTUAL ACCOUNT", true), tableHeader("USAGE", true), tableHeader("PRICE", true), tableHeader("AMOUNT", true)],

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
											fontSize: 7,
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
											`Abodemen`,
											`Adm. Bank`,
											`Air Kotor (${content.water.dirty}%)`,
										],
									],
								},

								{
									lineHeight: 1.2,
									margin: tablePadding,
									fontSize: 7,
									stack: [
										{
											text: `Bank BCA`,
											width: "auto",
											bold: true,
										},
										{
											columns: [
												{
													text: `${content.va_water}`,
													width: "auto",
												},
												// { text: '3', fontSize: 5, width: 'auto' },
											],
										},
									],
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
											text: " ",
										},
									],
								},
								{
									lineHeight: 1.2,
									margin: tablePadding,
									fontSize: 7,
									stack: [
										`\n${content.water.price.amount}`,
										content.water.price.abodemen,
										content.water.price.admBank,
										content.water.price.dirty,
										{
											text: ` `,
										},
									],
								},
							],
							// >end Water sections

							// >start Total
							[
								{
									fontSize: 7,
									lineHeight: 1.2,
									margin: tablePadding,
									text: "Total",
									bold: true,
								},

								{
									lineHeight: 1.2,
									margin: tablePadding,
									fontSize: 7,
									text: ` `,
								},
								{
									lineHeight: 1.2,
									margin: tablePadding,
									fontSize: 7,
									text: ` `,
								},
								{
									lineHeight: 1.2,
									margin: tablePadding,
									fontSize: 7,
									text: ` `,
								},

								{
									lineHeight: 1.2,
									margin: tablePadding,
									fontSize: 7,
									text: content.water.price.total,
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
							text: `${content.allWaterInWord}`,

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
									text: "",
									decoration: "underline",
								},
								"Building Manager",
							],
						},
						// >end Signature
					],
				},
				{
					alignment: "center",
					columns: [`\n\n\n\n\n\n\n${content.isReceipt}`],
					style: "headTitle",
				},
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
								` 	Jl. Pintu Air V No.53, RT.5/RW.2\n
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
							[tableHeader("DESCRIPTION", true), tableHeader("VIRTUAL ACCOUNT", true), tableHeader("USAGE", true), tableHeader("PRICE", true), tableHeader("AMOUNT", true)],

							// >start IPL
							[
								{
									fontSize: 7,
									lineHeight: 1.2,
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
									stack: [
										{
											text: `Bank BCA`,
											width: "auto",
											bold: true,
										},
										{
											columns: [
												{
													text: `${content.va_ipl}`,
													width: "auto",
												},
												// { text: '2', fontSize: 5, width: 'auto' },
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
											text: " ",
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
										{
											text: ` `,
										},
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
									text: "Total",
									bold: true,
								},

								{
									lineHeight: 1.2,
									margin: tablePadding,
									fontSize: 7,
									text: ` `,
								},
								{
									lineHeight: 1.2,
									margin: tablePadding,
									fontSize: 7,
									text: ` `,
								},
								{
									lineHeight: 1.2,
									margin: tablePadding,
									fontSize: 7,
									text: ` `,
								},

								{
									lineHeight: 1.2,
									margin: tablePadding,
									fontSize: 7,
									text: content.IPL.price.total,
									bold: true,
								},
							],
							// >end Total
						],
					},
				},
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
							text: `${content.allIplInWord}`,

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
									text: "",
									decoration: "underline",
								},
								"Building Manager",
							],
						},
						// >end Signature
					],
				},
				// >end content table
				// >end bottom content

				/** HALAMAN UNTUK MENAMPILKAN PENCATATAN AIR DAN LISTRIK START */
				// // >start page title
				// {
				// 	alignment: "center",
				// 	columns: [""],
				// 	style: "headTitle",
				// 	pageBreak: "before",
				// },
				// // >end page title

				// // >start cop header
				// {
				// 	columns: [
				// 		{
				// 			stack: [
				// 				{
				// 					image: "logo",
				// 					fit: [85, 70],
				// 				},
				// 			],
				// 			style: {
				// 				alignment: "left",
				// 			},
				// 		},
				// 		{
				// 			// *Static Company address
				// 			stack: [
				// 				` 	Jl. Pintu Air V No.53, RT.5/RW.2\n
				// 									Jakarta Pusat 10710\n
				// 									Telp. (021) 50880000\n
				// 									`,
				// 			],
				// 			margin: [0, 10, 0, 0],
				// 			style: [
				// 				"txtSm",
				// 				{
				// 					alignment: "right",
				// 					lineHeight: 0.5,
				// 				},
				// 			],
				// 		},
				// 	],
				// },
				// // >end cop header

				// // >start Line between cop and content
				// {
				// 	margin: [0, 10, 0, 20],
				// 	canvas: [
				// 		{
				// 			type: "line",
				// 			x1: 1,
				// 			y1: 1,
				// 			// A4 size - left + right page margin
				// 			x2: 595.28 - 80,
				// 			y2: 1,
				// 			lineWidth: 0.5,
				// 			lineCap: "round",
				// 		},
				// 	],
				// },
				// // >end Line between cop and contenti
				/** HALAMAN UNTUK MENAMPILKAN PENCATATAN AIR DAN LISTRIK END */
			],

			footer: {
				alignment: "center",
				italics: true,
				columns: [
					{
						text: `printed by: ${content.printed.printed_by}, printed date: ${content.printed.printed_date}, printed count: ${content.printed.count}`,
						fontSize: 5,
						color: "#808080",
					},
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

		const contentObj = {
			pageSize: "A4",
			pageOrientation: "portrait",
			pageMargins: [40, 40],
			...dd,
		};

		return contentObj;
	}

	// #Template PDF Billing
	generatePDFTemplate(content: any) {
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

		// Kondisi  Meteran Start
		const stackBodyMeteranNewDate = [];

		if (content.imagePowerNewDate) {
			stackBodyMeteranNewDate.push(
				{
					text: "Foto Meteran Listrik Bulan Ini",
					alignment: "center",
				},
				{
					image: "imagePowerNewDate",
					fit: [185, 170],
					alignment: "center",
				}
			);
		}
		if (content.imageWaterNewDate) {
			stackBodyMeteranNewDate.push(
				{
					text: "Foto Meteran Air Bulan Ini",
					alignment: "center",
				},
				{
					image: "imageWaterNewDate",
					fit: [185, 170],
					alignment: "center",
				}
			);
		}

		const bodyMeteranNewDate = [
			{
				alignment: "left",
				bold: true,
				fontSize: 7,
				margin: tablePadding,
				stack: stackBodyMeteranNewDate,
			},
		];

		const stackBodyMeteranBulanLalu = [];

		if (content.imagePowerPrevious) {
			stackBodyMeteranBulanLalu.push(
				{
					text: "Foto Meteran Listrik Bulan Lalu",
					alignment: "center",
				},
				{
					image: "imagePowerPrevious",
					fit: [185, 170],
					alignment: "center",
				}
			);
		}
		if (content.imageWaterPrevious) {
			stackBodyMeteranBulanLalu.push(
				{
					text: "Foto Meteran Air Bulan Lalu",
					alignment: "center",
				},
				{
					image: "imageWaterPrevious",
					fit: [185, 170],
					alignment: "center",
				}
			);
		}

		const bodyMeteranBulanLalu = [
			{
				alignment: "center",
				bold: true,
				fontSize: 7,
				margin: tablePadding,
				stack: stackBodyMeteranBulanLalu,
			},
		];
		// Kondisi  Meteran End

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
							stack: [
								{
									text: "INVOICE",
									bold: true,
									fontSize: 16,
								},
							],
							style: {
								alignment: "center",
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
						widths: ["*", 80, 55, 75],
						body: [
							// Table header
							[
								tableHeader("DESCRIPTION", true),
								// tableHeader("VIRTUAL ACCOUNT", true),
								tableHeader("USAGE", true),
								tableHeader("PRICE", true),
								tableHeader("AMOUNT", true),
							],
							// Table content

							// >start Electricity sections
							[
								{
									fontSize: 6.5,
									lineHeight: 1.2,
									style: "strippedTable",
									margin: tablePadding,
									stack: [
										{
											text: content.isSewa ? `Electricity Consumption (${content.startMonth} - ${content.endMonth})` : `Electricity Consumption (20 ${content.startMonth} - 19 ${content.endMonth})`,
											bold: true,
											fontSize: 6.5,
										},
										[`Pemakaian (${content.electricity.usage.start} kWh - ${content.electricity.usage.end} kWh)`, `Service Charge (${content.electricity.serviceCharge}%)`, `PJU (${content.electricity.PJU}%)`, `Loss (${content.electricity.loss}%)`, `Admin (+ PPN ${content.electricity.taxPercent}%)`, `PPN (${content.electricity.taxPercent}%)`],
									],
								},

								// Usage (kWh)
								// {
								// 	lineHeight: 1.2,
								// 	style: "strippedTable",
								// 	margin: tablePadding,
								// 	fontSize: 6.5,
								// 	text: `\n${content.va_ipl}`,
								// },
								// Usage (kWh)
								{
									lineHeight: 1.2,
									style: "strippedTable",
									margin: tablePadding,
									fontSize: 6.5,
									text: `\n${content.electricity.usage.used} kWh`,
								},

								// kWh Price used
								{
									lineHeight: 1.2,
									style: "strippedTable",
									margin: tablePadding,
									fontSize: 6.5,
									stack: [
										`\n${content.electricity.price.used}\n\n\n`,
										` `,
										`${content.electricity.adminFee}`,
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
									fontSize: 6.5,
									stack: [
										`\n${content.electricity.price.amount}`,
										content.electricity.price.serviceCharge,
										content.electricity.price.PJU,
										content.electricity.price.loss,
										`${content.electricity.adminFeeAfterTax}`,
										`${content.electricity.totalTax}`,
										{
											text: content.electricity.allPowerAmountAfterFeeAndTax,
											bold: true,
										},
									],
								},
							],
							// >end Electricity sections

							// >start Water sections
							[
								{
									fontSize: 6.5,
									lineHeight: 1.2,
									margin: tablePadding,
									stack: [
										{
											text: content.isSewa ? `Water Consumption (${content.startMonth} - ${content.endMonth})` : `Water Consumption (20 ${content.startMonth} - 19 ${content.endMonth})`,
											bold: true,
											fontSize: 6.5,
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
											`Air Kotor (${content.water.dirty}%)`,
											`Admin (+ PPN ${content.water.taxPercent}%)`,
											`PPN (${content.water.taxPercent}%)`,
										],
									],
								},

								// {
								// 	lineHeight: 1.2,
								// 	style: "strippedTable",
								// 	margin: tablePadding,
								// 	fontSize: 6.5,
								// 	text: `\n${content.va_water}`,
								// },
								{
									lineHeight: 1.2,
									margin: tablePadding,
									fontSize: 6.5,
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
									fontSize: 6.5,
									stack: [
										`\n${content.water.price.used}\n`,
										` `,
										`${content.water.adminFee}`,
										` `,
										{
											text: "Total",
											bold: true,
										},
									],
								},
								{
									lineHeight: 1.2,
									margin: tablePadding,
									fontSize: 6.5,
									stack: [
										`\n${content.water.price.amount}`,
										content.water.price.dirty,
										`${content.water.adminFeeAfterTax}`,
										`${content.water.totalTax}`,
										{
											text: content.water.allWaterAmountAfterFeeAndTax,
											bold: true,
										},
									],
								},
							],
							// >end Water sections

							// >start IPL
							[
								{
									fontSize: 6.5,
									lineHeight: 1.2,
									style: "strippedTable",
									margin: tablePadding,
									stack: [
										{
											text: `IPL (${content.IPL.period})`,
											fontSize: 6.5,
											bold: true,
										},
										`Service Charge`,
										`Sinking Fund`,
										`PPN (${content.IPL.taxPercent}%)`,
									],
								},

								// {
								// 	lineHeight: 1.2,
								// 	style: "strippedTable",
								// 	margin: tablePadding,
								// 	fontSize: 6.5,
								// 	text: `\n${content.va_ipl}`,
								// },

								{
									lineHeight: 1.2,
									style: "strippedTable",
									margin: tablePadding,
									fontSize: 6.5,
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
									fontSize: 6.5,
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
									fontSize: 6.5,
									stack: [
										`\n${content.IPL.price.ipl}`,
										`-`,
										`${content.IPL.totalTax}`,
										{
											text: content.IPL.allIplAfterTax,
											bold: true,
										},
									],
								},
							],
							// >end IPL

							// >start Total Galon
							// [
							// 	{
							// 		fontSize: 6.5,
							// 		lineHeight: 1.2,
							// 		margin: tablePadding,
							// 		stack: [
							// 			{
							// 				text: "Galon Transaction",
							// 				bold: true,
							// 			},
							// 			`Brand : ${content.galon.brand}`,
							// 			`Rate : ${content.galon.rate}`,
							// 			`Total Quantity : ${content.galon.totalQty}`,
							// 			`PPN (${content.galon.taxPercentage}%)`
							// 		]
							// 	},

							// 	// {
							// 	// 	lineHeight: 1.2,
							// 	// 	style: "strippedTable",
							// 	// 	margin: tablePadding,
							// 	// 	fontSize: 6.5,
							// 	// 	text: ` `,
							// 	// },

							// 	{
							// 		lineHeight: 1.2,
							// 		margin: tablePadding,
							// 		fontSize: 6.5,
							// 		text: ` `,
							// 	},
							// 	{
							// 		lineHeight: 1.2,
							// 		margin: tablePadding,
							// 		fontSize: 6.5,
							// 		stack: [
							// 			` `,
							// 			` `,
							// 			` `,
							// 			` `,
							// 			` `,
							// 			{
							// 				text: 'Total',
							// 				bold: true
							// 			}
							// 		],
							// 	},

							// 	{
							// 		lineHeight: 1.2,
							// 		margin: tablePadding,
							// 		fontSize: 6.5,
							// 		stack: [
							// 			` `,
							// 			`${content.galon.totalTr}`,
							// 			` `,
							// 			` `,
							// 			`${content.galon.totalTax}`,
							// 			{
							// 				text: content.galon.totalTrAfterTax,
							// 				bold: true,
							// 			},
							// 		]
							// 	},
							// ],
							// >end Total Galon
							// >Galon Total
							[
								{
									fontSize: 6.5,
									lineHeight: 1.2,
									style: "strippedTable",
									margin: tablePadding,
									text: "Grand Total",
									bold: true,
								},

								// {
								// 	lineHeight: 1.2,
								// 	style: "strippedTable",
								// 	margin: tablePadding,
								// 	fontSize: 6.5,
								// 	text: ` `,
								// },

								{
									lineHeight: 1.2,
									style: "strippedTable",
									margin: tablePadding,
									fontSize: 6.5,
									text: ` `,
								},
								{
									lineHeight: 1.2,
									style: "strippedTable",
									margin: tablePadding,
									fontSize: 6.5,
									text: ` `,
								},

								{
									lineHeight: 1.2,
									style: "strippedTable",
									margin: tablePadding,
									fontSize: 6.5,
									text: content.grandTotal,
									bold: true,
								},
							],
							// >Galon Total
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
							fontSize: 6.5,
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
							fontSize: 7,
							stack: [
								"\n\nAUTHORIZED SIGNATURE\n\n\n\n\n\n\n",
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

				/** HALAMAN UNTUK MENAMPILKAN PENCATATAN AIR DAN LISTRIK START */
				// // >start page title
				// {
				// 	alignment: "center",
				// 	columns: [""],
				// 	style: "headTitle",
				// 	pageBreak: 'before'
				// },
				// // >end page title

				// // >start cop header
				// {
				// 	columns: [
				// 		{
				// 			stack: [
				// 				{
				// 					image: "logo",
				// 					fit: [85, 70],
				// 				},
				// 			],
				// 			style: {
				// 				alignment: "left",
				// 			},
				// 		},
				// 		{
				// 			// *Static Company address
				// 			stack: [
				// 				` 	Jl. Pintu Air V No.53, RT.5/RW.2\n
				// 									Jakarta Pusat 10710\n
				// 									Telp. (021) 50880000\n
				// 									`,
				// 			],
				// 			margin: [0, 10, 0, 0],
				// 			style: [
				// 				"txtSm",
				// 				{
				// 					alignment: "right",
				// 					lineHeight: 0.5,
				// 				},
				// 			],
				// 		},
				// 	],
				// },
				// // >end cop header

				// // >start Line between cop and content
				// {
				// 	margin: [0, 10, 0, 20],
				// 	canvas: [
				// 		{
				// 			type: "line",
				// 			x1: 1,
				// 			y1: 1,
				// 			// A4 size - left + right page margin
				// 			x2: 595.28 - 80,
				// 			y2: 1,
				// 			lineWidth: 0.5,
				// 			lineCap: "round",
				// 		},
				// 	],
				// },
				// // >end Line between cop and contenti

				// {
				// 	alignment: "center",
				// 	columns: ["Permudah pembayaran menggunakan aplikasi Apartatech, Download aplikasi menggunakan QR Code berikut :"],
				// },
				// // >start cop header
				// {
				// 	columns: [
				// 		{
				// 			stack: [
				// 				{
				// 					image: "logoQrAppstore",
				// 					fit: [185, 170],
				// 					margin: [50, 20, 0, 0]
				// 				},
				// 			],
				// 			style: {
				// 				alignment: "left",
				// 			},
				// 		},
				// 		{
				// 			stack: [
				// 				{
				// 					image: "newLogoBms",
				// 					fit: [75, 75],
				// 					margin: [0, 50, 0, 0]
				// 				},
				// 			],
				// 			style: {
				// 				alignment: "center",
				// 			},
				// 		},
				// 		{
				// 			stack: [
				// 				{
				// 					image: "logoQrPlayStore",
				// 					fit: [185, 170],
				// 					margin: [0, 20, 30, 0]
				// 				},
				// 			],
				// 			style: {
				// 				alignment: "right",
				// 			},
				// 		},
				// 	],
				// },

				// {
				// 	alignment: "center",
				// 	stack: [
				// 		"Kemudahan semua kebutuhan hunian dalam aplikasi Apartatech",
				// 		"Download aplikasinya hanya di Playstore dan Apps Store"
				// 	]
				// },

				// // >end cop header

				// {
				// 	columns: [
				// 		{
				// 			margin: [0, 10, 15, 0],
				// 			table: {
				// 				headerRows: 1,
				// 				widths: ["*"],
				// 				body: [bodyMeteranNewDate],
				// 			},
				// 		},
				// 		{
				// 			margin: [0, 10, 15, 0],
				// 			table: {
				// 				headerRows: 1,
				// 				widths: ["*"],
				// 				body: [bodyMeteranBulanLalu],
				// 			},
				// 		},
				// 	],
				// },

				/** HALAMAN UNTUK MENAMPILKAN PENCATATAN AIR DAN LISTRIK END */
			],

			footer: {
				alignment: "center",
				italics: true,
				columns: [
					{
						stack: [
							{
								text: `printed by: ${content.printed.printed_by}, printed date: ${content.printed.printed_date}, printed count: ${content.printed.count}`,
								fontSize: 5,
								color: "#808080",
							},
							{
								text: "Support by Apartatech System",
								fontSize: 6,
								color: "#808080",
							},
						],
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
				logoQrPlayStore: content.logoQrPlayStore,
				logoQrAppstore: content.logoQrAppstore,
				newLogoBms: content.newLogoBms,
				imagePowerNewDate: content.imagePowerNewDate,
				imageWaterNewDate: content.imageWaterNewDate,
				imagePowerPrevious: content.imagePowerPrevious,
				imageWaterPrevious: content.imageWaterPrevious,
			},
		};

		const contentObj = {
			pageSize: "A4",
			pageOrientation: "portrait",
			pageMargins: [40, 40],
			...dd,
		};

		return contentObj;
	}

	private handleError<T>(operation = "operation", result?: any) {
		return (error: any): Observable<any> => {
			// TODO: send the error to remote logging infrastructure
			console.error(error); // log to console instead
			// Let the app keep running by returning an empty result.
			return of(result);
		};
	}
}
