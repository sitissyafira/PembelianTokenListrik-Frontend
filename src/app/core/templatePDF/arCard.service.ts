import { Injectable } from "@angular/core";
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import moment from 'moment';
import { ServiceFormat } from '../serviceFormat/format.service';
@Injectable({
	providedIn: 'root'
})


export class TemplatePDFARCard {
	constructor(private http: HttpClient, private serviceFormat: ServiceFormat) { }
	generatePDFTemplateARCard(arCardBio, data) {
		const tablePadding = [2, 2];
		const tabblePaddingTitle = [2, 2];

		const tableHeader = (text = "", center = false) => ({
			text: text,
			bold: true,
			fontSize: 7.5,
			margin: [3, 3],
			alignment: center
		});

		var bodyTableRow: any = [
			[
				tableHeader("Date", true),
				tableHeader("Account", true),
				tableHeader("Description", true),
				tableHeader("No Ref", true),
				tableHeader("Debit", true),
				tableHeader("Credit", true),
				tableHeader("Balance", true),
			]
		]

		data.map((item, i) => {
			var row = [
				{
					fontSize: 6.5,
					lineHeight: 1.2,
					margin: [2, 2],
					fillColor: i % 2 === 0 ? "#E8E8E8" : "",
					stack: [
						{
							text: `${moment(item.created_date).format('L')}`,
							bold: true
						},
					],
				},

				{
					lineHeight: 1.2,
					margin: [2, 2],
					fillColor: i % 2 === 0 ? "#E8E8E8" : "",
					fontSize: 6.5,
					text: `${item.accountDesc}`,
				},
				{
					lineHeight: 1.2,
					margin: [2, 2],
					fillColor: i % 2 === 0 ? "#E8E8E8" : "",
					fontSize: 6.5,
					text: `${item.description}`,
				},
				{
					lineHeight: 1.2,
					margin: [2, 2],
					fillColor: i % 2 === 0 ? "#E8E8E8" : "",
					fontSize: 6.5,
					text: `${item.noRef == "balance" ? " " : item.noRef}`,
				},

				{
					lineHeight: 1.2,
					style: "strippedTable",
					margin: [2, 2],
					fillColor: i % 2 === 0 ? "#E8E8E8" : "",
					fontSize: 6.5,
					alignment: "right",
					stack: [
						`${item.debitToBill ? this.serviceFormat.rupiahFormatImprovement(item.debitToBill) : " "}`
					],
				},
				{
					lineHeight: 1.2,
					style: "strippedTable",
					margin: [2, 2],
					fillColor: i % 2 === 0 ? "#E8E8E8" : "",
					fontSize: 6.5,
					alignment: "right",
					stack: [
						`${item.creditToBill ? this.serviceFormat.rupiahFormatImprovement(item.creditToBill) : " "}`
					],
				},
				{
					lineHeight: 1.2,
					style: "strippedTable",
					margin: [2, 2],
					fillColor: i % 2 === 0 ? "#E8E8E8" : "",
					fontSize: 6.5,
					alignment: "right",
					stack: [
						`${this.serviceFormat.rupiahFormatImprovement(item.balance)}`
					],
				}
			]
			bodyTableRow.push(row);
		})


		const dd: any = {
			content: [
				// >start page title
				{
					alignment: "center",
					columns: [
						{
							text: `Unit ${arCardBio.unitName}`,
							bold: true,
							fontSize: 17
						}
					],
					// 			style: "headTitle",
				},
				{
					alignment: "center",
					columns: [
						{
							text: 'AR CARD',
							bold: true,
							fontSize: 17,
							color: "red"
						}
					],
					// 			style: "headTitle",
				},
				// >end page title

				// >start cop header
				{
					columns: [
						{
							stack: [
								{
									text: `\n\n\nCurrency : Rupiah`,
									fontSize: 7
								},

							],
							style: {
								alignment: "left",
							},
						},
						{
							// *Static Company address
							stack: [
								{
									text: `
											Nama Penghuni : ${arCardBio.cstmr}
											\n Periode : ${arCardBio.startDate} - ${arCardBio.endDate}`,
									fontSize: 7.5
								}
							],
							fontSize: 10,
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
							x2: 595.28 - 23,
							y2: 1,
							lineWidth: 0.5,
							lineCap: "round",
						},
					],
				},
				// >end Line between cop and contenti

				{
					margin: [0, 10, 0, 0],
					table: {
						headerRows: 1,
						widths: [45, "*", 108, 60, 55, 55, 55],
						body: bodyTableRow
					},
				},


			],

			footer: {
				columns: [
					{ text: 'Support By System Apartatech', alignment: 'center', fontSize: 8, italics: true }
				]
			},


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
			pageMargins: [10, 20],
			...dd,
		}

		return contentObj
	}
}