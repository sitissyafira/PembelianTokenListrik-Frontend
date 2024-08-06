import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import moment from 'moment';
import { ServiceFormat } from '../serviceFormat/format.service';

@Injectable({
	providedIn: 'root'
})

export class TemplatePDFCashierPayment {
	constructor(private http: HttpClient, private serviceFormat: ServiceFormat) { }

	// Template Billing
	generatePDFTemplate(content: any) {
		const tablePadding = [5, 7.5];

		const tableHeader = (text = "", center = false) => ({
			text,
			alignment: center ? "center" : "left",
			bold: true,
			color: "#FFFFFF",
			fontSize: 8,
			fillColor: "#9593A4",
			margin: tablePadding,
		});

		const billingID = []
		content.billingID.map((item, i) => {
			let row = [
				{
					fontSize: 8,
					lineHeight: 1.2,
					fillColor: (i + 1) % 2 == 0 ? "#F1F1F1" : "#FFFFFF",
					borderColor: ["#000000", "#ffffff", "#000000", "#000000"],
					margin: [4, 3],
					stack: [
						{
							text: `${i + 1}`,
							bold: false,
							fontSize: 8,
							alignment: 'center'
						},
					],
				},

				{
					lineHeight: 1.2,
					fillColor: (i + 1) % 2 == 0 ? "#F1F1F1" : "#FFFFFF",
					margin: [4, 3],
					borderColor: ["#000000", "#ffffff", "#000000", "#000000"],

					fontSize: 8,
					text: `${moment(item.billing_date).format('LL')}`,
				},

				{
					lineHeight: 1.2,
					fillColor: (i + 1) % 2 == 0 ? "#F1F1F1" : "#FFFFFF",
					margin: [4, 3],
					borderColor: ["#000000", "#ffffff", "#000000", "#000000"],

					fontSize: 8,
					text: `${item.billing_number}`,
				},

				{
					lineHeight: 1.2,
					fillColor: (i + 1) % 2 == 0 ? "#F1F1F1" : "#FFFFFF",
					margin: [4, 3],
					borderColor: ["#000000", "#ffffff", "#000000", "#000000"],

					fontSize: 8,
					text: `Rp. ${this.serviceFormat.rupiahFormatImprovement(item.totalBilling)}`,
				}
			]

			billingID.push(row)
		})

		const detailBilling = []
		content.detailBilling.map((item, i) => {
			let row = [
				{
					fontSize: 8,
					lineHeight: 1.2,
					fillColor: (i + 1) % 2 == 0 ? "#F1F1F1" : "#FFFFFF",
					margin: [4, 3],
					borderColor: ["#000000", "#ffffff", "#000000", "#000000"],
					stack: [
						{
							text: `${i + 1}`,
							bold: false,
							fontSize: 8,
							alignment: 'center'
						},
					],
				},
				{
					lineHeight: 1.2,
					fillColor: (i + 1) % 2 == 0 ? "#F1F1F1" : "#FFFFFF",
					margin: [4, 3],
					borderColor: ["#000000", "#ffffff", "#000000", "#000000"],
					fontSize: 8,
					text: `${item.name ? item.name.toUpperCase() : "-"}`,
				},
				{
					lineHeight: 1.2,
					fillColor: (i + 1) % 2 == 0 ? "#F1F1F1" : "#FFFFFF",
					margin: [4, 3],
					borderColor: ["#000000", "#ffffff", "#000000", "#000000"],
					fontSize: 8,
					text: `Rp. ${this.serviceFormat.rupiahFormatImprovement(item.total)}`,
				}
			]
			detailBilling.push(row)
		})




		const dd: any = {
			content: [
				{
					margin: [0, 0, 0, 30],
					columns: [
						{
							alignment: "left",
							image: "logo",
							fit: [85, 85],
						},
						{
							fontSize: 16,
							bold: true,
							text: "RECEIPT",
							alignment: 'right'
						},
					],
				},
				{
					columns: [
						{
							fontSize: 8,
							bold: false,
							stack: [
								`Customer Name : ${content.cstmr}`,
								`Unit : ${content.unit}`,
							]
						},
						{
							fontSize: 8,
							bold: false,
							alignment: 'right',
							stack: [
								`Transaction ID : ${content.cashierNo}`,
								`Transaction Date : ${moment(content.crtDate).format('L')}`,
								`Cashier Name : ${content.admName}`,
							]
						},
					],
				},
				// >start content table
				{
					margin: [0, 10, 0, 0],
					table: {
						headerRows: 1,
						widths: [35, '*', '*', '*'],
						body: [
							// Table header
							[
								tableHeader("NO", true),
								tableHeader("BILLING PERIODE", true),
								tableHeader("INVOICE", true),
								tableHeader("AMOUNT", true),
							]
						],
					},
				},
				// >end content table
				// >start content table
				{
					margin: [0, 0],
					table: {
						headerRows: 1,
						widths: [35, '*', '*', '*'],
						body: billingID //Looping

					},
				},
				// >end content table
				// >start content table
				{
					margin: [0, 0],
					table: {
						headerRows: 1,
						widths: [35, '*', '*', '*'],
						body: [
							[
								{
									fontSize: 8,
									lineHeight: 1.2,
									fillColor: content.billingID.length % 2 === 0 ? "#FFFFFF" : "#F1F1F1",
									margin: [4, 3],
									borderColor: ["#000000", "#ffffff"],
									text: " ",
									bold: true,
								},

								{
									lineHeight: 1.2,
									fillColor: content.billingID.length % 2 === 0 ? "#FFFFFF" : "#F1F1F1",
									margin: [4, 3],
									borderColor: ["#000000", "#ffffff"],
									fontSize: 8,
									text: ` `,
								},
								{
									lineHeight: 1.2,
									fillColor: content.billingID.length % 2 === 0 ? "#FFFFFF" : "#F1F1F1",
									margin: [4, 3],
									borderColor: ["#000000", "#ffffff"],
									fontSize: 8,
									bold: true,
									stack: [
										`Sub Total`,
										`Printed Fee`,
										`Total`,
									]
								},

								{
									lineHeight: 1.2,
									fillColor: content.billingID.length % 2 === 0 ? "#FFFFFF" : "#F1F1F1",
									margin: [4, 3],
									borderColor: ["#000000", "#ffffff"],
									fontSize: 8,
									bold: true,
									stack: [
										`Rp. ${this.serviceFormat.rupiahFormatImprovement(content.subTotalPOS)}`,
										`Rp. ${this.serviceFormat.rupiahFormatImprovement(content.printFee)}`,
										`Rp. ${this.serviceFormat.rupiahFormatImprovement(content.totalPOS)}`,
									]
								},
							]
						],

					},
				},
				// >end content table
				// 			Terbilan
				{
					columns: [
						{
							fontSize: 9,
							bold: false,
							margin: [0, 10],
							italics: true,
							text: `Terbilang : ${content.inWords}`
						},
					],
				},
				{
					columns: [
						{
							fontSize: 9,
							bold: false,
							margin: [0, 10],
							stack: [
								`Payment Method : ${content.payMtd === "CASH" ? content.payMtd : (content.payMtd + " - " + content.bankMtd)}`,
								`${content.cardNo ? ('Card Number :' + content.cardNo) : ' '}`,
							]
						},
					],
				},
				{
					pageBreak: 'after',
					columns: [
						{
							alignment: "right",
							bold: true,
							fontSize: 8,
							stack: [
								"\n\nAUTHORIZED SIGNATURE\n\n\n\n\n\n\n",
								{
									text: "INVOICE INI DITERBITKAN OLEH SISTEM",
									decoration: "underline",
								},
								"SAH TANPA TANDA TANGAN",
							],
						},
					],
				},

				// PAGE 2 START
				{
					margin: [0, 20, 0, 5],
					columns: [
						{
							fontSize: 16,
							bold: true,
							text: "RECEIPT DETAIL",
						},
						{
							fontSize: 8,
							bold: false,
							alignment: 'right',
							stack: [
								`Transaction ID : ${content.cashierNo}`,
								`Customer Name : ${content.cstmr}`,
								`Unit : ${content.unit}`,
							]
						},
					],
				},
				// >start content table
				{
					margin: [0, 0],
					table: {
						headerRows: 1,
						widths: [35, '*', '*'],
						body: [
							// Table header
							[
								tableHeader("NO", true),
								tableHeader("DESCRIPTION", true),
								tableHeader("AMOUNT", true),
							],
						],
					},
				},
				// >end content table 
				// >start content table
				{
					margin: [0, 0],
					table: {
						headerRows: 1,
						widths: [35, '*', '*'],
						body: detailBilling //looping
					},
				},
				// >end content table 
				// >start content table
				{
					margin: [0, 0],
					table: {
						headerRows: 1,
						widths: [35, '*', '*'],
						body: [
							[
								{
									fontSize: 8,
									lineHeight: 1.2,
									fillColor: content.detailBilling.length % 2 === 0 ? "#FFFFFF" : "#F1F1F1",
									margin: [4, 3],
									borderColor: ["#000000", "#ffffff"],
									text: " ",
									bold: true,
								},

								{
									lineHeight: 1.2,
									fillColor: content.detailBilling.length % 2 === 0 ? "#FFFFFF" : "#F1F1F1",
									margin: [4, 3],
									borderColor: ["#000000", "#ffffff"],
									fontSize: 8,
									bold: true,
									stack: [
										`Total`,
									]
								},

								{
									lineHeight: 1.2,
									fillColor: content.detailBilling.length % 2 === 0 ? "#FFFFFF" : "#F1F1F1",
									margin: [4, 3],
									borderColor: ["#000000", "#ffffff"],
									fontSize: 8,
									bold: true,
									stack: [
										`Rp. ${this.serviceFormat.rupiahFormatImprovement(content.subTotalPOS)}`,
									]
								},
							]
						],
					},
				},
				// >end content table 
				{
					columns: [
						{
							alignment: "right",
							bold: true,
							fontSize: 8,
							stack: [
								"\n\nAUTHORIZED SIGNATURE\n\n\n\n\n\n\n",
								{
									text: "INVOICE INI DITERBITKAN OLEH SISTEM",
									decoration: "underline",
								},
								"SAH TANPA TANDA TANGAN",
							],
						},
					],
				},
			],

			footer: {
				alignment: "center",
				italics: true,
				columns: [
					{
						text: "Support by Apartatech System",
						fontSize: 8,
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
					fontSize: 8,
				},
			},

			// Provided images
			images: {
				logo: content.logo,
			},
		};


		let contentObj = {
			pageSize: "A4",
			pageOrientation: "portrait",
			pageMargins: [20, 20],
			info: { title: content.cashierNo },
			...dd,
		}
		return contentObj

	}

	// Template Galon 
	generatePDFTemplateGalon(content: any) {
		const tablePadding = [5, 7.5];

		const tableHeader = (text = "", center = false) => ({
			text,
			alignment: center ? "center" : "left",
			bold: true,
			color: "#FFFFFF",
			fontSize: 8,
			fillColor: "#9593A4",
			margin: tablePadding,
		});

		const billingID = []
		content.billingID.map((item, i) => {
			let row = [
				{
					fontSize: 8,
					lineHeight: 1.2,
					fillColor: (i + 1) % 2 == 0 ? "#F1F1F1" : "#FFFFFF",
					borderColor: ["#000000", "#ffffff", "#000000", "#000000"],
					margin: [4, 3],
					stack: [
						{
							text: `${i + 1}`,
							bold: false,
							fontSize: 8,
							alignment: 'center'
						},
					],
				},

				{
					lineHeight: 1.2,
					fillColor: (i + 1) % 2 == 0 ? "#F1F1F1" : "#FFFFFF",
					margin: [4, 3],
					borderColor: ["#000000", "#ffffff", "#000000", "#000000"],
					fontSize: 8,
					text: `${item.tgl}`,
				},

				{
					lineHeight: 1.2,
					fillColor: (i + 1) % 2 == 0 ? "#F1F1F1" : "#FFFFFF",
					margin: [4, 3],
					borderColor: ["#000000", "#ffffff", "#000000", "#000000"],
					fontSize: 8,
					text: `${item.qty}`,
				},

				{
					lineHeight: 1.2,
					fillColor: (i + 1) % 2 == 0 ? "#F1F1F1" : "#FFFFFF",
					margin: [4, 3],
					borderColor: ["#000000", "#ffffff", "#000000", "#000000"],

					fontSize: 8,
					text: `Rp. ${item.totalCost ? this.serviceFormat.rupiahFormatImprovement(item.totalCost) : 0}`,
				}
			]

			billingID.push(row)
		})

		const detailBilling = []
		content.detailBilling.map((item, i) => {
			let row = [
				{
					fontSize: 8,
					lineHeight: 1.2,
					fillColor: (i + 1) % 2 == 0 ? "#F1F1F1" : "#FFFFFF",
					margin: [4, 3],
					borderColor: ["#000000", "#ffffff", "#000000", "#000000"],
					stack: [
						{
							text: `${i + 1}`,
							bold: false,
							fontSize: 8,
							alignment: 'center'
						},
					],
				},
				{
					lineHeight: 1.2,
					fillColor: (i + 1) % 2 == 0 ? "#F1F1F1" : "#FFFFFF",
					margin: [4, 3],
					borderColor: ["#000000", "#ffffff", "#000000", "#000000"],
					fontSize: 8,
					text: `${item.name ? item.name.toUpperCase() : "-"}`,
				},
				{
					lineHeight: 1.2,
					fillColor: (i + 1) % 2 == 0 ? "#F1F1F1" : "#FFFFFF",
					margin: [4, 3],
					borderColor: ["#000000", "#ffffff", "#000000", "#000000"],
					fontSize: 8,
					text: `Rp. ${this.serviceFormat.rupiahFormatImprovement(item.total)}`,
				}
			]
			detailBilling.push(row)
		})




		const dd: any = {
			content: [
				{
					margin: [0, 0, 0, 30],
					columns: [
						{
							alignment: "left",
							image: "logo",
							fit: [85, 85],
						},
						{
							fontSize: 16,
							bold: true,
							text: "RECEIPT",
							alignment: 'right'
						},
					],
				},
				{
					columns: [
						{
							fontSize: 8,
							bold: false,
							stack: [
								`Customer Name : ${content.cstmr}`,
								`Unit : ${content.unit}`,
							]
						},
						{
							fontSize: 8,
							bold: false,
							alignment: 'right',
							stack: [
								`Transaction ID : ${content.cashierNo}`,
								`Transaction Date : ${moment(content.crtDate).format('L')}`,
								`Cashier Name : ${content.admName}`,
							]
						},
					],
				},
				// >start content table
				{
					margin: [0, 10, 0, 0],
					table: {
						headerRows: 1,
						widths: [35, '*', '*', '*'],
						body: [
							// Table header
							[
								tableHeader("NO", true),
								tableHeader("GALON PERIODE", true),
								tableHeader("QTY", true),
								tableHeader("AMOUNT", true),
							]
						],
					},
				},
				// >end content table
				// >start content table
				{
					margin: [0, 0],
					table: {
						headerRows: 1,
						widths: [35, '*', '*', '*'],
						body: billingID //Looping

					},
				},
				// >end content table
				// >start content table
				{
					margin: [0, 0],
					table: {
						headerRows: 1,
						widths: [35, '*', '*', '*'],
						body: [
							[
								{
									fontSize: 8,
									lineHeight: 1.2,
									fillColor: content.billingID.length % 2 === 0 ? "#FFFFFF" : "#F1F1F1",
									margin: [4, 3],
									borderColor: ["#000000", "#ffffff"],
									text: " ",
									bold: true,
								},

								{
									lineHeight: 1.2,
									fillColor: content.billingID.length % 2 === 0 ? "#FFFFFF" : "#F1F1F1",
									margin: [4, 3],
									borderColor: ["#000000", "#ffffff"],
									fontSize: 8,
									text: ` `,
								},
								{
									lineHeight: 1.2,
									fillColor: content.billingID.length % 2 === 0 ? "#FFFFFF" : "#F1F1F1",
									margin: [4, 3],
									borderColor: ["#000000", "#ffffff"],
									fontSize: 8,
									bold: true,
									stack: [
										`Sub Total`,
										`Printed Fee`,
										`Total`,
									]
								},

								{
									lineHeight: 1.2,
									fillColor: content.billingID.length % 2 === 0 ? "#FFFFFF" : "#F1F1F1",
									margin: [4, 3],
									borderColor: ["#000000", "#ffffff"],
									fontSize: 8,
									bold: true,
									stack: [
										`Rp. ${this.serviceFormat.rupiahFormatImprovement(content.subTotalPOS)}`,
										`Rp. ${this.serviceFormat.rupiahFormatImprovement(content.printFee)}`,
										`Rp. ${this.serviceFormat.rupiahFormatImprovement(content.totalPOS)}`,
									]
								},
							]
						],

					},
				},
				// >end content table
				// 			Terbilan
				{
					columns: [
						{
							fontSize: 9,
							bold: false,
							margin: [0, 10],
							italics: true,
							text: `Terbilang : ${content.inWords}`
						},
					],
				},
				{
					columns: [
						{
							fontSize: 9,
							bold: false,
							margin: [0, 10],
							stack: [
								`Payment Method : ${content.payMtd === "CASH" ? content.payMtd : (content.payMtd + " - " + content.bankMtd)}`,
								`${content.cardNo ? ('Card Number :' + content.cardNo) : ' '}`,
							]
						},
					],
				},
				{
					pageBreak: 'after',
					columns: [
						{
							alignment: "right",
							bold: true,
							fontSize: 8,
							stack: [
								"\n\nAUTHORIZED SIGNATURE\n\n\n\n\n\n\n",
								{
									text: "INVOICE INI DITERBITKAN OLEH SISTEM",
									decoration: "underline",
								},
								"SAH TANPA TANDA TANGAN",
							],
						},
					],
				},

				// PAGE 2 START
				{
					margin: [0, 20, 0, 5],
					columns: [
						{
							fontSize: 16,
							bold: true,
							text: "RECEIPT DETAIL",
						},
						{
							fontSize: 8,
							bold: false,
							alignment: 'right',
							stack: [
								`Transaction ID : ${content.cashierNo}`,
								`Customer Name : ${content.cstmr}`,
								`Unit : ${content.unit}`,
							]
						},
					],
				},
				// >start content table
				{
					margin: [0, 0],
					table: {
						headerRows: 1,
						widths: [35, '*', '*'],
						body: [
							// Table header
							[
								tableHeader("NO", true),
								tableHeader("DESCRIPTION", true),
								tableHeader("AMOUNT", true),
							],
						],
					},
				},
				// >end content table 
				// >start content table
				{
					margin: [0, 0],
					table: {
						headerRows: 1,
						widths: [35, '*', '*'],
						body: detailBilling //looping
					},
				},
				// >end content table 
				// >start content table
				{
					margin: [0, 0],
					table: {
						headerRows: 1,
						widths: [35, '*', '*'],
						body: [
							[
								{
									fontSize: 8,
									lineHeight: 1.2,
									fillColor: content.detailBilling.length % 2 === 0 ? "#FFFFFF" : "#F1F1F1",
									margin: [4, 3],
									borderColor: ["#000000", "#ffffff"],
									text: " ",
									bold: true,
								},

								{
									lineHeight: 1.2,
									fillColor: content.detailBilling.length % 2 === 0 ? "#FFFFFF" : "#F1F1F1",
									margin: [4, 3],
									borderColor: ["#000000", "#ffffff"],
									fontSize: 8,
									bold: true,
									stack: [
										`Total`,
									]
								},

								{
									lineHeight: 1.2,
									fillColor: content.detailBilling.length % 2 === 0 ? "#FFFFFF" : "#F1F1F1",
									margin: [4, 3],
									borderColor: ["#000000", "#ffffff"],
									fontSize: 8,
									bold: true,
									stack: [
										`Rp. ${this.serviceFormat.rupiahFormatImprovement(content.subTotalPOS)}`,
									]
								},
							]
						],
					},
				},
				// >end content table 
				{
					columns: [
						{
							alignment: "right",
							bold: true,
							fontSize: 8,
							stack: [
								"\n\nAUTHORIZED SIGNATURE\n\n\n\n\n\n\n",
								{
									text: "INVOICE INI DITERBITKAN OLEH SISTEM",
									decoration: "underline",
								},
								"SAH TANPA TANDA TANGAN",
							],
						},
					],
				},
			],

			footer: {
				alignment: "center",
				italics: true,
				columns: [
					{
						text: "Support by Apartatech System",
						fontSize: 8,
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
					fontSize: 8,
				},
			},

			// Provided images
			images: {
				logo: content.logo,
			},
		};


		let contentObj = {
			pageSize: "A4",
			pageOrientation: "portrait",
			pageMargins: [20, 20],
			info: { title: content.cashierNo },
			...dd,
		}
		return contentObj

	}

	// Template Ticket 
	generatePDFTemplateTicket(content: any) {
		const tablePadding = [5, 7.5];

		const tableHeader = (text = "", center = false) => ({
			text,
			alignment: center ? "center" : "left",
			bold: true,
			color: "#FFFFFF",
			fontSize: 8,
			fillColor: "#9593A4",
			margin: tablePadding,
		});

		const billingID = []
		content.billingID.map((item, i) => {
			let row = [
				{
					fontSize: 8,
					lineHeight: 1.2,
					fillColor: (i + 1) % 2 == 0 ? "#F1F1F1" : "#FFFFFF",
					borderColor: ["#000000", "#ffffff", "#000000", "#000000"],
					margin: [4, 3],
					stack: [
						{
							text: `${i + 1}`,
							bold: false,
							fontSize: 8,
							alignment: 'center'
						},
					],
				},

				{
					lineHeight: 1.2,
					fillColor: (i + 1) % 2 == 0 ? "#F1F1F1" : "#FFFFFF",
					margin: [4, 3],
					borderColor: ["#000000", "#ffffff", "#000000", "#000000"],

					fontSize: 8,
					text: `${item.ticketId}`,
				},

				{
					lineHeight: 1.2,
					fillColor: (i + 1) % 2 == 0 ? "#F1F1F1" : "#FFFFFF",
					margin: [4, 3],
					borderColor: ["#000000", "#ffffff", "#000000", "#000000"],

					fontSize: 8,
					text: `${moment(item.createdDate).format('LL')}`,
				},

				{
					lineHeight: 1.2,
					fillColor: (i + 1) % 2 == 0 ? "#F1F1F1" : "#FFFFFF",
					margin: [4, 3],
					borderColor: ["#000000", "#ffffff", "#000000", "#000000"],

					fontSize: 8,
					text: `Rp. ${item.totalCost ? this.serviceFormat.rupiahFormatImprovement(item.totalCost) : 0}`,
				}
			]

			billingID.push(row)
		})

		const detailBilling = []
		content.detailBilling.map((item, i) => {
			let row = [
				{
					fontSize: 8,
					lineHeight: 1.2,
					fillColor: (i + 1) % 2 == 0 ? "#F1F1F1" : "#FFFFFF",
					margin: [4, 3],
					borderColor: ["#000000", "#ffffff", "#000000", "#000000"],
					stack: [
						{
							text: `${i + 1}`,
							bold: false,
							fontSize: 8,
							alignment: 'center'
						},
					],
				},
				{
					lineHeight: 1.2,
					fillColor: (i + 1) % 2 == 0 ? "#F1F1F1" : "#FFFFFF",
					margin: [4, 3],
					borderColor: ["#000000", "#ffffff", "#000000", "#000000"],
					fontSize: 8,
					text: `${item.name ? item.name.toUpperCase() : "-"}`,
				},
				{
					lineHeight: 1.2,
					fillColor: (i + 1) % 2 == 0 ? "#F1F1F1" : "#FFFFFF",
					margin: [4, 3],
					borderColor: ["#000000", "#ffffff", "#000000", "#000000"],
					fontSize: 8,
					text: `Rp. ${this.serviceFormat.rupiahFormatImprovement(item.total)}`,
				}
			]
			detailBilling.push(row)
		})




		const dd: any = {
			content: [
				{
					margin: [0, 0, 0, 30],
					columns: [
						{
							alignment: "left",
							image: "logo",
							fit: [85, 85],
						},
						{
							fontSize: 16,
							bold: true,
							text: "RECEIPT",
							alignment: 'right'
						},
					],
				},
				{
					columns: [
						{
							fontSize: 8,
							bold: false,
							stack: [
								`Customer Name : ${content.cstmr}`,
								`Unit : ${content.unit}`,
							]
						},
						{
							fontSize: 8,
							bold: false,
							alignment: 'right',
							stack: [
								`Transaction ID : ${content.cashierNo}`,
								`Transaction Date : ${moment(content.crtDate).format('L')}`,
								`Cashier Name : ${content.admName}`,
							]
						},
					],
				},
				// >start content table
				{
					margin: [0, 10, 0, 0],
					table: {
						headerRows: 1,
						widths: [35, '*', '*', '*'],
						body: [
							// Table header
							[
								tableHeader("NO", true),
								tableHeader("TICKET ID", true),
								tableHeader("DATE", true),
								tableHeader("AMOUNT", true),
							]
						],
					},
				},
				// >end content table
				// >start content table
				{
					margin: [0, 0],
					table: {
						headerRows: 1,
						widths: [35, '*', '*', '*'],
						body: billingID //Looping

					},
				},
				// >end content table
				// >start content table
				{
					margin: [0, 0],
					table: {
						headerRows: 1,
						widths: [35, '*', '*', '*'],
						body: [
							[
								{
									fontSize: 8,
									lineHeight: 1.2,
									fillColor: content.billingID.length % 2 === 0 ? "#FFFFFF" : "#F1F1F1",
									margin: [4, 3],
									borderColor: ["#000000", "#ffffff"],
									text: " ",
									bold: true,
								},

								{
									lineHeight: 1.2,
									fillColor: content.billingID.length % 2 === 0 ? "#FFFFFF" : "#F1F1F1",
									margin: [4, 3],
									borderColor: ["#000000", "#ffffff"],
									fontSize: 8,
									text: ` `,
								},
								{
									lineHeight: 1.2,
									fillColor: content.billingID.length % 2 === 0 ? "#FFFFFF" : "#F1F1F1",
									margin: [4, 3],
									borderColor: ["#000000", "#ffffff"],
									fontSize: 8,
									bold: true,
									stack: [
										`Sub Total`,
										`Printed Fee`,
										`Total`,
									]
								},

								{
									lineHeight: 1.2,
									fillColor: content.billingID.length % 2 === 0 ? "#FFFFFF" : "#F1F1F1",
									margin: [4, 3],
									borderColor: ["#000000", "#ffffff"],
									fontSize: 8,
									bold: true,
									stack: [
										`Rp. ${this.serviceFormat.rupiahFormatImprovement(content.subTotalPOS)}`,
										`Rp. ${this.serviceFormat.rupiahFormatImprovement(content.printFee)}`,
										`Rp. ${this.serviceFormat.rupiahFormatImprovement(content.totalPOS)}`,
									]
								},
							]
						],

					},
				},
				// >end content table
				// 			Terbilan
				{
					columns: [
						{
							fontSize: 9,
							bold: false,
							margin: [0, 10],
							italics: true,
							text: `Terbilang : ${content.inWords}`
						},
					],
				},
				{
					columns: [
						{
							fontSize: 9,
							bold: false,
							margin: [0, 10],
							stack: [
								`Payment Method : ${content.payMtd === "CASH" ? content.payMtd : (content.payMtd + " - " + content.bankMtd)}`,
								`${content.cardNo ? ('Card Number :' + content.cardNo) : ' '}`,
							]
						},
					],
				},
				{
					pageBreak: 'after',
					columns: [
						{
							alignment: "right",
							bold: true,
							fontSize: 8,
							stack: [
								"\n\nAUTHORIZED SIGNATURE\n\n\n\n\n\n\n",
								{
									text: "INVOICE INI DITERBITKAN OLEH SISTEM",
									decoration: "underline",
								},
								"SAH TANPA TANDA TANGAN",
							],
						},
					],
				},

				// PAGE 2 START
				{
					margin: [0, 20, 0, 5],
					columns: [
						{
							fontSize: 16,
							bold: true,
							text: "RECEIPT DETAIL",
						},
						{
							fontSize: 8,
							bold: false,
							alignment: 'right',
							stack: [
								`Transaction ID : ${content.cashierNo}`,
								`Customer Name : ${content.cstmr}`,
								`Unit : ${content.unit}`,
							]
						},
					],
				},
				// >start content table
				{
					margin: [0, 0],
					table: {
						headerRows: 1,
						widths: [35, '*', '*'],
						body: [
							// Table header
							[
								tableHeader("NO", true),
								tableHeader("DESCRIPTION", true),
								tableHeader("AMOUNT", true),
							],
						],
					},
				},
				// >end content table 
				// >start content table
				{
					margin: [0, 0],
					table: {
						headerRows: 1,
						widths: [35, '*', '*'],
						body: detailBilling //looping
					},
				},
				// >end content table 
				// >start content table
				{
					margin: [0, 0],
					table: {
						headerRows: 1,
						widths: [35, '*', '*'],
						body: [
							[
								{
									fontSize: 8,
									lineHeight: 1.2,
									fillColor: content.detailBilling.length % 2 === 0 ? "#FFFFFF" : "#F1F1F1",
									margin: [4, 3],
									borderColor: ["#000000", "#ffffff"],
									text: " ",
									bold: true,
								},

								{
									lineHeight: 1.2,
									fillColor: content.detailBilling.length % 2 === 0 ? "#FFFFFF" : "#F1F1F1",
									margin: [4, 3],
									borderColor: ["#000000", "#ffffff"],
									fontSize: 8,
									bold: true,
									stack: [
										`Total`,
									]
								},

								{
									lineHeight: 1.2,
									fillColor: content.detailBilling.length % 2 === 0 ? "#FFFFFF" : "#F1F1F1",
									margin: [4, 3],
									borderColor: ["#000000", "#ffffff"],
									fontSize: 8,
									bold: true,
									stack: [
										`Rp. ${this.serviceFormat.rupiahFormatImprovement(content.subTotalPOS)}`,
									]
								},
							]
						],
					},
				},
				// >end content table 
				{
					columns: [
						{
							alignment: "right",
							bold: true,
							fontSize: 8,
							stack: [
								"\n\nAUTHORIZED SIGNATURE\n\n\n\n\n\n\n",
								{
									text: "INVOICE INI DITERBITKAN OLEH SISTEM",
									decoration: "underline",
								},
								"SAH TANPA TANDA TANGAN",
							],
						},
					],
				},
			],

			footer: {
				alignment: "center",
				italics: true,
				columns: [
					{
						text: "Support by Apartatech System",
						fontSize: 8,
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
					fontSize: 8,
				},
			},

			// Provided images
			images: {
				logo: content.logo,
			},
		};


		let contentObj = {
			pageSize: "A4",
			pageOrientation: "portrait",
			pageMargins: [20, 20],
			info: { title: content.cashierNo },
			...dd,
		}
		return contentObj

	}

	// Template Parking 
	generatePDFTemplateParking(content: any) {
		const tablePadding = [5, 7.5];

		const tableHeader = (text = "", center = false) => ({
			text,
			alignment: center ? "center" : "left",
			bold: true,
			color: "#FFFFFF",
			fontSize: 8,
			fillColor: "#9593A4",
			margin: tablePadding,
		});

		const billingID = []
		content.billingID.map((item, i) => {
			let row = [
				{
					fontSize: 8,
					lineHeight: 1.2,
					fillColor: (i + 1) % 2 == 0 ? "#F1F1F1" : "#FFFFFF",
					borderColor: ["#000000", "#ffffff", "#000000", "#000000"],
					margin: [4, 3],
					stack: [
						{
							text: `${i + 1}`,
							bold: false,
							fontSize: 8,
							alignment: 'center'
						},
					],
				},

				{
					lineHeight: 1.2,
					fillColor: (i + 1) % 2 == 0 ? "#F1F1F1" : "#FFFFFF",
					margin: [4, 3],
					borderColor: ["#000000", "#ffffff", "#000000", "#000000"],

					fontSize: 8,
					text: `${item.billing_number}`,
				},

				{
					lineHeight: 1.2,
					fillColor: (i + 1) % 2 == 0 ? "#F1F1F1" : "#FFFFFF",
					margin: [4, 3],
					borderColor: ["#000000", "#ffffff", "#000000", "#000000"],

					fontSize: 8,
					text: `${moment(item.date).format('LL')}`,
				},

				{
					lineHeight: 1.2,
					fillColor: (i + 1) % 2 == 0 ? "#F1F1F1" : "#FFFFFF",
					margin: [4, 3],
					borderColor: ["#000000", "#ffffff", "#000000", "#000000"],

					fontSize: 8,
					text: `Rp. ${item.totalBilling ? this.serviceFormat.rupiahFormatImprovement(item.totalBilling) : 0}`,
				}
			]

			billingID.push(row)
		})

		const detailBilling = []
		content.detailBilling.map((item, i) => {
			let row = [
				{
					fontSize: 8,
					lineHeight: 1.2,
					fillColor: (i + 1) % 2 == 0 ? "#F1F1F1" : "#FFFFFF",
					margin: [4, 3],
					borderColor: ["#000000", "#ffffff", "#000000", "#000000"],
					stack: [
						{
							text: `${i + 1}`,
							bold: false,
							fontSize: 8,
							alignment: 'center'
						},
					],
				},
				{
					lineHeight: 1.2,
					fillColor: (i + 1) % 2 == 0 ? "#F1F1F1" : "#FFFFFF",
					margin: [4, 3],
					borderColor: ["#000000", "#ffffff", "#000000", "#000000"],
					fontSize: 8,
					text: `${item.name ? item.name.toUpperCase() : "-"}`,
				},
				{
					lineHeight: 1.2,
					fillColor: (i + 1) % 2 == 0 ? "#F1F1F1" : "#FFFFFF",
					margin: [4, 3],
					borderColor: ["#000000", "#ffffff", "#000000", "#000000"],
					fontSize: 8,
					text: `Rp. ${this.serviceFormat.rupiahFormatImprovement(item.total)}`,
				}
			]
			detailBilling.push(row)
		})




		const dd: any = {
			content: [
				{
					margin: [0, 0, 0, 30],
					columns: [
						{
							alignment: "left",
							image: "logo",
							fit: [85, 85],
						},
						{
							fontSize: 16,
							bold: true,
							text: "RECEIPT",
							alignment: 'right'
						},
					],
				},
				{
					columns: [
						{
							fontSize: 8,
							bold: false,
							stack: [
								`Customer Name : ${content.cstmr}`,
								`Unit : ${content.unit}`,
							]
						},
						{
							fontSize: 8,
							bold: false,
							alignment: 'right',
							stack: [
								`Transaction ID : ${content.cashierNo}`,
								`Transaction Date : ${moment(content.crtDate).format('L')}`,
								`Cashier Name : ${content.admName}`,
							]
						},
					],
				},
				// >start content table
				{
					margin: [0, 10, 0, 0],
					table: {
						headerRows: 1,
						widths: [35, '*', '*', '*'],
						body: [
							// Table header
							[
								tableHeader("NO", true),
								tableHeader("INVOICE", true),
								tableHeader("DATE", true),
								tableHeader("AMOUNT", true),
							]
						],
					},
				},
				// >end content table
				// >start content table
				{
					margin: [0, 0],
					table: {
						headerRows: 1,
						widths: [35, '*', '*', '*'],
						body: billingID //Looping

					},
				},
				// >end content table
				// >start content table
				{
					margin: [0, 0],
					table: {
						headerRows: 1,
						widths: [35, '*', '*', '*'],
						body: [
							[
								{
									fontSize: 8,
									lineHeight: 1.2,
									fillColor: content.billingID.length % 2 === 0 ? "#FFFFFF" : "#F1F1F1",
									margin: [4, 3],
									borderColor: ["#000000", "#ffffff"],
									text: " ",
									bold: true,
								},

								{
									lineHeight: 1.2,
									fillColor: content.billingID.length % 2 === 0 ? "#FFFFFF" : "#F1F1F1",
									margin: [4, 3],
									borderColor: ["#000000", "#ffffff"],
									fontSize: 8,
									text: ` `,
								},
								{
									lineHeight: 1.2,
									fillColor: content.billingID.length % 2 === 0 ? "#FFFFFF" : "#F1F1F1",
									margin: [4, 3],
									borderColor: ["#000000", "#ffffff"],
									fontSize: 8,
									bold: true,
									stack: [
										`Sub Total`,
										`Printed Fee`,
										`Total`,
									]
								},

								{
									lineHeight: 1.2,
									fillColor: content.billingID.length % 2 === 0 ? "#FFFFFF" : "#F1F1F1",
									margin: [4, 3],
									borderColor: ["#000000", "#ffffff"],
									fontSize: 8,
									bold: true,
									stack: [
										`Rp. ${this.serviceFormat.rupiahFormatImprovement(content.subTotalPOS)}`,
										`Rp. ${this.serviceFormat.rupiahFormatImprovement(content.printFee)}`,
										`Rp. ${this.serviceFormat.rupiahFormatImprovement(content.totalPOS)}`,
									]
								},
							]
						],

					},
				},
				// >end content table
				// 			Terbilan
				{
					columns: [
						{
							fontSize: 9,
							bold: false,
							margin: [0, 10],
							italics: true,
							text: `Terbilang : ${content.inWords}`
						},
					],
				},
				{
					columns: [
						{
							fontSize: 9,
							bold: false,
							margin: [0, 10],
							stack: [
								`Payment Method : ${content.payMtd === "CASH" ? content.payMtd : (content.payMtd + " - " + content.bankMtd)}`,
								`${content.cardNo ? ('Card Number :' + content.cardNo) : ' '}`,
							]
						},
					],
				},
				{
					pageBreak: 'after',
					columns: [
						{
							alignment: "right",
							bold: true,
							fontSize: 8,
							stack: [
								"\n\nAUTHORIZED SIGNATURE\n\n\n\n\n\n\n",
								{
									text: "INVOICE INI DITERBITKAN OLEH SISTEM",
									decoration: "underline",
								},
								"SAH TANPA TANDA TANGAN",
							],
						},
					],
				},

				// PAGE 2 START
				{
					margin: [0, 20, 0, 5],
					columns: [
						{
							fontSize: 16,
							bold: true,
							text: "RECEIPT DETAIL",
						},
						{
							fontSize: 8,
							bold: false,
							alignment: 'right',
							stack: [
								`Transaction ID : ${content.cashierNo}`,
								`Customer Name : ${content.cstmr}`,
								`Unit : ${content.unit}`,
							]
						},
					],
				},
				// >start content table
				{
					margin: [0, 0],
					table: {
						headerRows: 1,
						widths: [35, '*', '*'],
						body: [
							// Table header
							[
								tableHeader("NO", true),
								tableHeader("DESCRIPTION", true),
								tableHeader("AMOUNT", true),
							],
						],
					},
				},
				// >end content table 
				// >start content table
				{
					margin: [0, 0],
					table: {
						headerRows: 1,
						widths: [35, '*', '*'],
						body: detailBilling //looping
					},
				},
				// >end content table 
				// >start content table
				{
					margin: [0, 0],
					table: {
						headerRows: 1,
						widths: [35, '*', '*'],
						body: [
							[
								{
									fontSize: 8,
									lineHeight: 1.2,
									fillColor: content.detailBilling.length % 2 === 0 ? "#FFFFFF" : "#F1F1F1",
									margin: [4, 3],
									borderColor: ["#000000", "#ffffff"],
									text: " ",
									bold: true,
								},

								{
									lineHeight: 1.2,
									fillColor: content.detailBilling.length % 2 === 0 ? "#FFFFFF" : "#F1F1F1",
									margin: [4, 3],
									borderColor: ["#000000", "#ffffff"],
									fontSize: 8,
									bold: true,
									stack: [
										`Total`,
									]
								},

								{
									lineHeight: 1.2,
									fillColor: content.detailBilling.length % 2 === 0 ? "#FFFFFF" : "#F1F1F1",
									margin: [4, 3],
									borderColor: ["#000000", "#ffffff"],
									fontSize: 8,
									bold: true,
									stack: [
										`Rp. ${this.serviceFormat.rupiahFormatImprovement(content.subTotalPOS)}`,
									]
								},
							]
						],
					},
				},
				// >end content table 
				{
					columns: [
						{
							alignment: "right",
							bold: true,
							fontSize: 8,
							stack: [
								"\n\nAUTHORIZED SIGNATURE\n\n\n\n\n\n\n",
								{
									text: "INVOICE INI DITERBITKAN OLEH SISTEM",
									decoration: "underline",
								},
								"SAH TANPA TANDA TANGAN",
							],
						},
					],
				},
			],

			footer: {
				alignment: "center",
				italics: true,
				columns: [
					{
						text: "Support by Apartatech System",
						fontSize: 8,
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
					fontSize: 8,
				},
			},

			// Provided images
			images: {
				logo: content.logo,
			},
		};


		let contentObj = {
			pageSize: "A4",
			pageOrientation: "portrait",
			pageMargins: [20, 20],
			info: { title: content.cashierNo },
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
