import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import moment from 'moment';
import { ServiceFormat } from '../serviceFormat/format.service';


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
	unitCode: string
	brand: string
	rate: string
	quantity: string
	eachTotal: string
	totalQty: number
	totalTr: string
	taxPercentage: number,
	totalTax: string
	totalTrAfterTax: string
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

	isSewa: boolean

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
	providedIn: 'root'
})

export class TemplatePDFQuotation {
	constructor(private http: HttpClient, private serviceFormat: ServiceFormat) { }

	// #Template PDF Billing IsToken
	generatePDF(content: any) {
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
					columns: ["PURCHASE REQUEST"],
					style: "headTitle",
				},
				// >end page title
                
                // >start content heading
				{
					columns: [
						{
							lineHeight: 0.55,
							stack: [
								{
									text: `KEPADA YTH.\n
										BAPAK / IBU ${content.pic.toUpperCase()}\n`,
									bold: false,
								},
								{
									lineHeight: 1,
									margin: [0, 5, 0, 0],
									text: content.address,
								},
							],
						},

						{
							width: "35%",
							lineHeight: 0.55,
							margin: [20, 0, 0, 0],
							stack: [
								`\n\nNO. Permintaan : ${content.PR_no}\n
									TGL : ${moment(content.req_date).format("DD-MM-YYYY")}\n`,
							],
						},
					],
				},
				// >end content heading

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
                            width: "7%",
							lineHeight: 1,
							stack: [
								{
									text: `To`,
									bold: false,
								},
								{
									text: `Attn.`,
									bold: false,
								},
								{
									text: `Phone`,
									bold: false,
								},
								{
									text: `Email`,
									bold: false,
								},
								{
									text: `Re`,
									bold: false,
								},
							],
						},

						{
							width: "40%",
							lineHeight: 1,
							margin: [20, 0, 0, 0],
							stack: [
                                {
                                    text: `: ${content.vendor_name.toUpperCase()}`,
									bold: false,
                                },
                                {
                                    text: `: ${content.pic}`,
									bold: false,
                                },
                                {
                                    text: `: ${content.pic_phone}`,
									bold: false,
                                },
                                {
                                    text: `: ${content.pic_email}`,
									bold: false,
                                },
                                {
                                    text: `: Permintaan Penawaran Harga Barang`,
									bold: false,
                                }
							],
						},
                        {
                            width: "14%",
							lineHeight: 1,
                            margin: [20, 0, 0, 0],
							stack: [
								{
									text: `From`,
									bold: false,
								},
								{
									text: `Date.`,
									bold: false,
								},
								{
									text: `PR.#`,
									bold: false,
								},
								{
									text: `Email`,
									bold: false,
								},
							],
						},
                        {
							width: "40%",
							lineHeight: 1,
							margin: [20, 0, 0, 0],
							stack: [
                                {
                                    text: `: ${content.project_name}`,
									bold: false,
                                },
                                {
                                    text: `: ${moment(content.req_date).format('DD-MM-YYYY')}`,
									bold: false,
                                },
                                {
                                    text: `: ${content.PR_no}`,
									bold: false,
                                },
                                {
                                    text: `: ${content.project_email}`,
									bold: false,
                                },

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
						widths: [30, '*', "*", "*", "*", "*"],
						body: [
							// Table header
							[
								tableHeader("No", true),
								tableHeader("Item Name", true),
								tableHeader("Description", true),
								tableHeader("Uom", true),
								tableHeader("Qty", true),
								tableHeader("Price", true),
							],

							// >start Water sections
							[
								{
									fontSize: 7,
									lineHeight: 1.2,
									margin: tablePadding,
									stack: [
										{
											text: `1`,
											bold: false,
											fontSize: 7,
										},
									],
								},

								{
									lineHeight: 1.2,
									margin: tablePadding,
									fontSize: 7,
									stack: [
										{
											text: `${content.product_brand.brand_name.toUpperCase()}`,
											bold: false,
										},
									],
								},
								{
									lineHeight: 1.2,
									margin: tablePadding,
									fontSize: 7,
									stack: [
										{
											text: `${content.product_brand.description}`,
											bold: false,
										},
									],
								},
								{
									lineHeight: 1.2,
									margin: tablePadding,
									fontSize: 7,
									stack: [
										{
											text: `${content.product_brand.uom.uom}`,
											bold: false,
										},
									],
								},
								{
									lineHeight: 1.2,
									margin: tablePadding,
									fontSize: 7,
									stack: [
										{
											text: `${content.qty}`,
											bold: false,
										},
									],
								},
                                {
									lineHeight: 1.2,
									margin: tablePadding,
									fontSize: 7,
									stack: [
										{
											text: `${content.product_brand.price}`,
											bold: false,
										},
									],
								},

							],
							// >end Water sections

						],
					},
				},
				// >end content table

				// >start Total terbilang
				{
					margin: [0, 5, 0, 0],
					columns: [
						{
							text: "Note: ",
							width: "auto",
							bold: true,
                            italics: true,
							margin: [0, 0, 2, 0],
						},
						{
							text: `Harap Diinformasikan mengenai`,
                            decoration: "underline",
							width: "auto",
							italics: true,
						},
					],
				},
				{
					margin: [0, 5, 0, 0],
					columns: [
						{
							text: "1. Ketersediaan Barang",
							width: "auto",
							bold: false,
							margin: [0, 0, 2, 0],
						},
					],
				},
				{
					margin: [0, 5, 0, 0],
					columns: [
						{
							text: "1. Ketersediaan Barang",
							width: "auto",
							bold: false,
							margin: [0, 0, 2, 0],
						},
					],
				},
				{
					margin: [0, 5, 0, 0],
					columns: [
						{
							text: "2. Cara Pembayaran",
							width: "auto",
							bold: false,
							margin: [0, 0, 2, 0],
						},
					],
				},
				{
					margin: [0, 5, 0, 0],
					columns: [
						{
							text: "3. Harga sudah termasuk pph bilamana jasa",
							width: "auto",
							bold: false,
							margin: [0, 0, 2, 0],
						},
					],
				},
				{
					margin: [0, 5, 0, 0],
					columns: [
						{
							text: "4. Penawaran harga apakah ada PPN atau tidak",
							width: "auto",
							bold: false,
							margin: [0, 0, 2, 0],
						},
					],
				},
				// >end Total terbilang

			],


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

		};

		const contentObj = {
			pageSize: "A4",
			pageOrientation: "portrait",
			pageMargins: [40, 40],
			...dd,
		}

		return contentObj
	}

	private handleError<T>(operation = 'operation', result?: any) {
		return (error: any): Observable<any> => {
			// TODO: send the error to remote logging infrastructure
			console.error(error); // log to console instead
			// Let the app keep running by returning an empty result.
			return of(result);
		};
	}
}
