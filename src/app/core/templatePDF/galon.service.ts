import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import moment from 'moment';
import { ServiceFormat } from '../serviceFormat/format.service';


interface TrGalonPDFContent {
	logo: string,
	trDate: string,
	cstmr: string,
	unt: string,
	address: string,
	brand: string,
	qty: number,
	rate: string,
	totalTr: string;
	totalInWord: string
}

@Injectable({
	providedIn: 'root'
})

export class TemplatePDFGalon {
	constructor(private http: HttpClient, private serviceFormat: ServiceFormat) { }
	// PDF OBJ Template
	generatePDFTemplate(downloadLabel = "", content: TrGalonPDFContent) {
		const tablePadding = [5, 7.5];

		const tableHeader = (text = "") => ({
			text,
			// alignment: center ? "center" : "left",
			bold: true,
			color: "#000000",
			fontSize: 7,
			fillColor: "#92D050",
			margin: tablePadding,
		});

		const dd: any = {
			content: [
				// >start page title
				{
					alignment: "center",
					columns: ['INVOICE TRANSACTION GALON'],
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
										BAPAK / IBU \n
										${content.cstmr}\n
										UNIT : ${content.unt}\n
										`,
									bold: true,
								},
								{
									lineHeight: 1,
									margin: [0, -5, 0, 0],
									text: `${content.address}`,
								},
							],
						},

						{
							width: "35%",
							lineHeight: 0.55,
							margin: [50, 0, 0, 0],
							stack: [
								`\n\nTGL TRANSAKSI : ${content.trDate}\n
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
						widths: ["*", 55, 80, 80],
						body: [
							// Table header
							[
								tableHeader("DESCRIPTION"),
								tableHeader("QTY"),
								tableHeader("PRICE"),
								tableHeader("AMOUNT"),
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
											text: `Transaction Galon`,
											bold: true
										},
										`${content.brand}`,
									],
								},

								// Usage (kWh)
								{
									lineHeight: 1.2,
									style: "strippedTable",
									margin: tablePadding,
									fontSize: 7,
									text: `\n${content.qty}`,
								},
								// Usage (kWh)
								{
									lineHeight: 1.2,
									style: "strippedTable",
									margin: tablePadding,
									fontSize: 7,
									text: `\n${content.rate}`,
								},

								// kWh Price used
								{
									lineHeight: 1.2,
									style: "strippedTable",
									margin: tablePadding,
									fontSize: 7,
									stack: [
										`\n${content.totalTr}`
									],
								},
							],
							// >end Electricity sections
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
									text: `${content.totalTr}`,
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
							text: `${content.totalInWord}`,
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

						// >end terms

						// >start Signature
						{
							alignment: "right",
							bold: true,
							fontSize: 9,
							stack: [
								"\n\nHormat kami,",
								"Building Management",
								"Apartemen Pasar Baru Mansion",
								"Cc. Finance & Accounting Dept.\n\n\n\n\n\n",
								{
									text: "Note: Invoice ini sah tanpa cap dan tanda tangan",
									decoration: "underline",
								},
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
					fontSize: 14,
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
				logo: `${content.logo}`,
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
