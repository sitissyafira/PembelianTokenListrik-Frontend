import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable, of } from "rxjs";
import moment from "moment";
import { ServiceFormat } from "../serviceFormat/format.service";
@Injectable({
	providedIn: "root",
})
export class TemplatePDFTrialBalance {
	constructor(private http: HttpClient, private serviceFormat: ServiceFormat) {}
	generatePDFTemplateTrialBalance(dataResponse: any) {
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
			// return "Rp " + number.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, "$&,");
			return number.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, "$&,");
		};

		const checkMinusPlus = (num) => {
			if (num < 0) return `(${currency(Math.abs(num))})`;
			else return currency(num);
		};

		var bodyTableRow: any = [[tableHeader("Account No", false), tableHeader("Account Name", false), tableHeader("Beggining Balance", false), tableHeader("Change Debit", false), tableHeader("Change Credit", false), tableHeader("Net Change", false), tableHeader("Ending Balance", false)]];

		dataResponse.data.map((item: any, i: number) => {
			let row = [
				{
					fontSize: 6.5,
					lineHeight: 1.2,
					margin: item.isParent ? [2, 2] : [6, 2, 2, 2],
					fillColor: i % 2 === 0 ? "#E8E8E8" : "",
					stack: [
						{
							text: item.accountNo,
							bold: item.isParent,
						},
					],
				},
				{
					lineHeight: 1.2,
					margin: [2, 2],
					fillColor: i % 2 === 0 ? "#E8E8E8" : "",
					fontSize: 6.5,
					text: item.acctName,
					bold: item.isParent,
				},
				{
					lineHeight: 1.2,
					margin: [2, 2],
					fillColor: i % 2 === 0 ? "#E8E8E8" : "",
					fontSize: 6.5,
					stack: [
						{
							text: checkMinusPlus(item.begginingBalance),
							bold: item.isParent,
						},
					],
				},
				{
					lineHeight: 1.2,
					margin: [2, 2],
					fillColor: i % 2 === 0 ? "#E8E8E8" : "",
					fontSize: 6.5,
					stack: [
						{
							text: checkMinusPlus(item.debitAll),
							bold: item.isParent,
						},
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
						{
							text: checkMinusPlus(item.creditAll),
							bold: item.isParent,
						},
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
						{
							text: checkMinusPlus(item.netChange),
							bold: item.isParent,
						},
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
						{
							text: checkMinusPlus(item.endBalance),
							bold: item.isParent,
						},
					],
				},
			];

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
							text: "Trial Balance",
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
					margin: [0, 50, 0, 0],
					table: {
						headerRows: 1,
						widths: [50, 108, 108, "*", 55, 55, 55],
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
