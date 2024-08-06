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

export class TemplatePDFPO {
	constructor(private http: HttpClient, private serviceFormat: ServiceFormat) { }

	// #Template PDF Billing IsToken
	generatePDF(content: any) {
		const tablePadding = [5, 5];

		const tableHeader = (text = "", center = false) => ({
			text,
			alignment: center ? "center" : "left",
			bold: true,
			color: "#FFFFFF",
			fontSize: 7,
			fillColor: "#9593A4",
			margin: tablePadding,
		});

        var bodyTableRow: any = [
            [
                tableHeader("No", true),
                tableHeader("Product Name", true),
                tableHeader("Qty", true),
                tableHeader("Uom", true),
                tableHeader("Price (Rp)", true),
                tableHeader("Amount (Rp)", true),
            ],
        ]

        content.product.map((item, idx) => {
            var row = [

                {
                    lineHeight: 1.2,
                    margin: tablePadding,
                    fontSize: 7,
                    stack: [
                        {
                            text: `${idx + 1}`,
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
                            text: `${item.product.brand_name.toUpperCase()}`,
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
                            text: `${item.qty}`,
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
                            text: `${item.uom.uom}`,
                            bold: false,
                        },
                    ],
                },
                {
                    lineHeight: 1.2,
                    margin: tablePadding,
                    fontSize: 7,
                    style: {
                        alignment: 'right'
                    },
                    stack: [
                        {
                            text: `${this.serviceFormat.rupiahFormatImprovement(item.price)}`,
                            bold: false,
                        },
                    ],
                },
                {
                    lineHeight: 1.2,
                    margin: tablePadding,
                    fontSize: 7,
                    style: {
                        alignment: 'right'
                    },
                    stack: [
                        {
                            text: `${this.serviceFormat.rupiahFormatImprovement(item.subTotal)}`,
                            bold: false,
                        },
                    ],
                },

            ]
            bodyTableRow.push(row)
        })

        var subTotal = [
            {
              colSpan: 4,
              margin: tablePadding,
              border: [true, true, true, false],
              fontSize: 7,
              stack: [
                {
                    text: 'Notes : ',
                    bold: true,
                }
              ],  
            },
            
            {
                lineHeight: 1.2,
                margin: tablePadding,
                border: [false, true, false, false],
                fontSize: 7,
                stack: [
                    {
                        text: ``,
                        bold: false,
                    },
                ],
            },
            {
                lineHeight: 1.2,
                margin: tablePadding,
                border: [false, true, false, false],
                fontSize: 7,
                stack: [
                    {
                        text: ``,
                        bold: false,
                    },
                ],
            },
            {
                lineHeight: 1.2,
                margin: tablePadding,
                border: [false, true, true, false],
                fontSize: 7,
                stack: [
                    {
                        text: ``,
                        bold: false,
                    },
                ],
            },
            {
                lineHeight: 1.2,
                margin: tablePadding,
                border: [true, true, true, true],
                fontSize: 7,
                stack: [
                    {
                        text: `Sub Total`,
                        bold: true,
                    },
                ],
            },
            {
                lineHeight: 1.2,
                margin: tablePadding,
                border: [true, true, true, true],
                fontSize: 7,
                style: {
                    alignment: 'right'
                },
                stack: [
                    {
                        text: `${this.serviceFormat.rupiahFormatImprovement(content.subTotal)}`,
                        bold: false,
                    },
                ],
            },

        ]
        bodyTableRow.push(subTotal)

        var ppn = [
            {
                colSpan: 4,
                margin: tablePadding,
                border: [true, false, true, true],
                fontSize: 7,
                stack: 
                [
                    {
                        text: `${content.note}`,
                        bold: false,
                    },  
                ]
            },
            {
                lineHeight: 1.2,
                margin: tablePadding,
                border: [false, false, false, false],
                fontSize: 7,
                stack: [
                    {
                        text: ``,
                        bold: false,
                    },
                ],
            },
            {
                lineHeight: 1.2,
                margin: tablePadding,
                border: [false, false, false, false],
                fontSize: 7,
                stack: [
                    {
                        text: ``,
                        bold: false,
                    },
                ],
            },
            {
                lineHeight: 1.2,
                margin: tablePadding,
                border: [false, false, true, false],
                fontSize: 7,
                stack: [
                    {
                        text: ``,
                        bold: false,
                    },
                ],
            },
            {
                lineHeight: 1.2,
                margin: tablePadding,
                border: [true, true, true, true],
                fontSize: 7,
                stack: [
                    {
                        text: `Shipping Cost (Rp)`,
                        bold: true,
                    },
                    {
                        text: `PPN (Rp)`,
                        bold: true,
                    },
                    {
                        text: `PPH (Rp)`,
                        bold: true,
                    },
                    {
                        text: `Discount ${content.payment.discountType === "fixed"? '': `(${content.payment.discountNominal} %)` }`,
                        bold: true,
                    },
                ],
            },
            {
                lineHeight: 1.2,
                margin: tablePadding,
                border: [true, true, true, true],
                fontSize: 7,
                style: {
                    alignment: 'right'
                },
                stack: [
                    {
                        text: `${this.serviceFormat.rupiahFormatImprovement(content.payment.shippingCost)}`,
                        bold: false,
                    },
                    {
                        text: `${this.serviceFormat.rupiahFormatImprovement(content.payment.ppn)}`,
                        bold: false,
                    },
                    {
                        text: `${this.serviceFormat.rupiahFormatImprovement(content.payment.pph)}`,
                        bold: false,
                    },
                    {
                        text: `${this.serviceFormat.rupiahFormatImprovement(content.payment.discountValue)}`,
                        bold: false,
                    },
                ],
            },

        ]
        bodyTableRow.push(ppn)

        
        var totalRow = [
            {
                colSpan: 4,
                margin: tablePadding,
                fontSize: 7,
                stack: [
                    {
                        columns: [
                            {
                                width: 40,
                                text: `In words :`,
                                bold: true,
                            },
                            {
                                text: `${this.serviceFormat.terbilang(content.grand_total)}`,
                                bold: false,
                            }
                        ]
                    }, 
                ] 
            },
            {
                lineHeight: 1.2,
                border: [false, false, false, false],
                margin: tablePadding,
                fontSize: 7,
                stack: [
                    {
                        text: ``,
                        bold: false,
                    },
                ],
            },
            {
                lineHeight: 1.2,
                border: [false, false, false, false],
                margin: tablePadding,
                fontSize: 7,
                stack: [
                    {
                        text: ``,
                        bold: false,
                    },
                ],
            },
            {
                lineHeight: 1.2,
                border: [false, false, true, false],
                margin: tablePadding,
                fontSize: 7,
                stack: [
                    {
                        text: ``,
                        bold: false,
                    },
                ],
            },
            {
                lineHeight: 1.2,
                margin: tablePadding,
                border: [true, true, true, true],
                fontSize: 7,
                stack: [
                    {
                        text: `Grand Total`,
                        bold: true,
                    },
                ],
            },
            {
                lineHeight: 1.2,
                margin: tablePadding,
                border: [true, true, true, true],
                fontSize: 7,
                style: {
                    alignment: 'right'
                },
                stack: [
                    {
                        text: `${this.serviceFormat.rupiahFormatImprovement(content.grand_total)}`,
                        bold: false,
                    },
                ],
            },

        ]
        bodyTableRow.push(totalRow)


		const dd: any = {
			content: [
				// >start page title
				{
					alignment: "center",
					columns: ["PURCHASE ORDER"],
					style: "headTitle",
				},
                // >start Line between cop and content
				{
					margin: [0, 10, 0, 20],
					canvas: [
						{
                            lineColor: '#009933',
							type: "line",
							x1: 1,
							y1: 1,
							// A4 size - left + right page margin
							x2: 595.28 - 80,
							y2: 1,
							lineWidth: 3,
							lineCap: "round",
						},
					],
				},
				// >end Line between cop and contenti
				// >end page title
                
                // >start content heading
                
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
				// >end content heading

				// >start Line between cop and content
				{
					margin: [0, 10, 0, 20],
					canvas: [
						{
                            lineColor: '#009933',
							type: "line",
							x1: 1,
							y1: 1,
							// A4 size - left + right page margin
							x2: 595.28 - 80,
							y2: 1,
							lineWidth: 3,
							lineCap: "round",
						},
					],
				},
				// >end Line between cop and contenti

				// >start content heading
				{
					columns: [
						{
							lineHeight: 1,
                            width: "10%",
							stack: [
								{
									text: `To`,
									bold: true,
								},
								{
									text: `Address`,
									bold: true,
								},
								{
									text: `No Telp`,
									bold: true,
								},
							],
						},
                        {
							lineHeight: 1,
                            width: "50%",
							stack: [
								{
									text: `: ${content.vendor_name.vendor_name.toUpperCase()}`,
									bold: false,
								},
								{
									text: `: ${content.vendor_name.address}`,
									bold: false,
								},
								{
									text: `: ${content.vendor_name.phone}`,
									bold: false,
								},
							],
						},
                        
                        {
                            margin: [20, 0, 0, 0],
                            width: "14%",
                            style: [
								{
									alignment: "left",
                                    lineHeight: 1,
								},
							],
							stack: [
								{
									text: `PO NO`,
									bold: true,
								},
								{
									text: `PO Date.`,
									bold: true,
								},
								{
									text: `Term`,
									bold: true,
								},
							],
						},
                        {
                            margin: [20, 0, 0, 0],
                            width: "2%",
                            style: [
								{
									alignment: "left",
                                    lineHeight: 1,
								},
							],
							stack: [
								{
									text: `:`,
									bold: false,
								},
								{
									text: `:`,
									bold: false,
								},
								{
									text: `:`,
									bold: false,
								},
							],
						},
                        {
                            style: [
								{
									alignment: "right",
                                    lineHeight: 1,
								},
							],
                            width: '24%',
							margin: [20, 0, 0, 0],
							stack: [
                                {
                                    text: `${content.po_no}`,
									bold: false,
                                },
                                {
                                    text: `${moment(content.date).format('DD-MM-YYYY')}`,
									bold: false,
                                },
                                {
                                    text: `${content.term.term} ${content.term.termPeriod}`,
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
						widths: [20,'*', 40, 50, 90, 70],
						body: bodyTableRow
					},
				},
				//>end content table
                {
					margin: [0, 20, 0, 20],
					table: {
                        headerRows: 1,
                        widths: ['*', 100],
                        body: [
                            [{
                                text: `•	Harga di atas adalah franco Jakarta.
                            •	Nomor PO harus dicantumkan di kemasan barang, surat jalan, dan invoice.
                            •	Cara pembayaran : Transfer.
                            •	Pembayaran akan diproses setelah dokumen tagihan diterima dengan lengkap dan benar oleh bagian keuangan dengan melampirkan dokumen sebagai berikut :
                                a.	Invoice / Kwitansi asli bermaterai
                                b.	Faktur pajak asli
                                c.	Copy PO
                                d.	Surat Jalan / Berita Acara Serah Terima asli
                            •	Rekanan menjamin barang yang diterima adalah sesuai dengan spesifikasi dan contoh yang diberikan. Apabila tidak sesuai dengan spesifikasi dan contoh, maka rekanan wajib mengganti barang tersebut dan semua biaya yang timbul merupakan tanggung jawab Rekanan.
                            •	Apabila terjadi perselisihan atas PO Ini, maka akan diselesaikan secara musyawarah oleh kedua belah pihak.
                            `,
                            },
                            {
                                alignment: "center",
                                stack: [
                                    {
                                        text: "\n",
                                        bold: true,
                                    },
                                    {
                                        text: "\n",
                                        bold: true,
                                    },
                                    {
                                        text: "\n",
                                        bold: true,
                                    },
                                    {
                                        text: "Dipesan Oleh",
                                        bold: true,
                                    },
                                    {
                                        text: "\n",
                                        bold: true,
                                    },
                                    {
                                        text: "\n",
                                        bold: true,
                                    },
                                    {
                                        text: "\n",
                                        bold: true,
                                    },
                                    {
                                        text: "\n",
                                        bold: true,
                                    },
                                    {
                                        text: "\n",
                                        bold: true,
                                    },
                                    {
                                        text: "\n",
                                        bold: true,
                                    },
                                    {
                                        text: "....................",
                                        bold: false,
                                    },
                                    {
                                        text: "\n",
                                        bold: true,
                                    },
                                    {
                                        text: "\n",
                                        bold: true,
                                    },
                                    {
                                        text: "\n",
                                        bold: true,
                                    },
                                    {
                                        text: "\n",
                                        bold: true,
                                    },
                                ],
                            }],
                        ]
                    }
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
            images: {
				logo: content.logo,
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
