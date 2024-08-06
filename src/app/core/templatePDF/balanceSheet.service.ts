import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable, of } from "rxjs";
import moment from "moment";
import { ServiceFormat } from "../serviceFormat/format.service";
@Injectable({
	providedIn: "root",
})
export class TemplatePDFBalanceSheet {
	constructor(private http: HttpClient, private serviceFormat: ServiceFormat) { }
	generatePDFTemplateBalanceSheet(dataResponse: any) {
		const tablePadding = [2, 2];
		const tabblePaddingTitle = [2, 2];

		const tableHeader = (text = "", center = false) => ({
			text: text,
			bold: true,
			fontSize: 7.5,
			margin: [3, 3],
			alignment: center,
		});

		const currency = (number) => {
			return number.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, "$&,");
		};

		const checkMinusPlus = (num) => {
			if (num < 0) return `(${currency(Math.abs(num))})`;
			else return currency(num);
		};

		const checkItem = (dataItem) => {
			return dataItem ? checkMinusPlus(dataItem) : dataItem === 0 ? checkMinusPlus(0) : ""
		}

		let bodyTableRow: any = [[tableHeader("Description", true), tableHeader("Last Balance", true), tableHeader("Current Periode", true), tableHeader("Balance Actual", true)]];

		dataResponse.data.map((item, i) => {
			let row = [
				{
					fontSize: 6.5,
					lineHeight: 1.2,
					fillColor: i % 2 === 0 ? "#E8E8E8" : "",
					margin: item.level === 1 ? [2, 2] : item.level === 2 ? [8, 2, 2, 2] : item.level === 3 ? [14, 2, 2, 2] : item.level === 4 ? [18, 2, 2, 2] : [22, 2, 2, 2],
					stack: [
						{
							text: item.desc,
							bold: item.isParent
						},
					],
				},
				{
					lineHeight: 1.2,
					fillColor: i % 2 === 0 ? "#E8E8E8" : "",
					margin: [2, 2],
					fontSize: 6.5,
					text: checkItem(item.last_balance),
					alignment: "right"
				},
				{
					lineHeight: 1.2,
					fillColor: i % 2 === 0 ? "#E8E8E8" : "",
					margin: [2, 2],
					fontSize: 6.5,
					text: checkItem(item.current_period),
					alignment: "right"
				},
				{
					lineHeight: 1.2,
					fillColor: i % 2 === 0 ? "#E8E8E8" : "",
					margin: [2, 2],
					fontSize: 6.5,
					text: checkItem(item.balance_actual),
					alignment: "right"
				}
			]

			bodyTableRow.push(row);
		});

		var dd = {
			pageSize: "A4",
			pageOrientation: "portrait",
			pageMargins: [9, 20],
			content: [
				// >start page title
				{
					alignment: "center",
					margin: [0, 10, 0, 0],
					columns: [
						{
							text: dataResponse.projectName,
							bold: true,
							fontSize: 17,
						},
					],
					// 			style: "headTitle",
				},
				{
					alignment: "center",
					margin: [0, 8, 0, 0],
					columns: [
						{
							text: "Balance Sheet",
							bold: true,
							fontSize: 17,
							color: "red",
						},
					],
					// 			style: "headTitle",
				},
				{
					alignment: "center",
					margin: [0, 8, 0, 0],
					columns: [
						{
							text: dataResponse.dateTitle,
							bold: true,
							fontSize: 15,
						},
					],
					// 			style: "headTitle",
				},
				// >end page title

				{
					margin: [0, 30, 0, 0],
					table: {
						headerRows: 1,
						widths: ["*", "*", "*", "*"],
						body: bodyTableRow,
					},
				},
			],

			footer: {
				columns: [{ text: "Support By System Apartatech", alignment: "center", fontSize: 8, italics: true }],
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
		};

		return contentObj;
	}
}
