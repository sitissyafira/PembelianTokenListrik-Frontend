import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import moment from 'moment';
import { ServiceFormat } from '../serviceFormat/format.service';


@Injectable({
	providedIn: 'root'
})

export class TemplatePDFAccountPayable {
	constructor(private http: HttpClient, private serviceFormat: ServiceFormat) { }

	// Print AP
	generatePDFTemplateAP(resp, data) {
		const tablePadding = [2, 2];
		const tabblePaddingTitle = [2, 2];

		var body = [];

		data.map(item => {
			var row =
				[
					{
						margin: tablePadding,
						fontSize: 5.6,
						alignment: "center",
						text: item.acctNo,
					},
					{
						fontSize: 5.6,
						margin: tablePadding,
						text: `${item.acctName} - ${item.memo}`,

					},
					{
						fontSize: 5.6,
						alignment: "center",
						margin: tablePadding,
						text: item.cur.toUpperCase(),

					},
					{
						margin: tablePadding,
						fontSize: 5.6,
						alignment: "right",
						text: item.debit
					},
					{
						fontSize: 5.6,
						alignment: "right",
						margin: tablePadding,
						text: item.credit,
					},
				]
			body.push(row);
		})


		const bodyEmpty = []

		const dataAmount = 11 - data.length

		for (let i = 1; i <= dataAmount; i++) {
			var row =
				[
					{
						margin: tablePadding,
						fontSize: 5.6,
						alignment: "center",
						text: ' ',
					},
					{
						fontSize: 5.6,
						margin: tablePadding,
						text: ' ',

					},
					{
						fontSize: 5.6,
						alignment: "center",
						margin: tablePadding,
						text: ' ',

					},
					{
						margin: tablePadding,
						fontSize: 5.6,
						alignment: "right",
						text: ' '
					},
					{
						fontSize: 5.6,
						alignment: "right",
						margin: tablePadding,
						text: ' ',
					},
				]
			bodyEmpty.push(row)
		}



		const dd: any = {
			watermark: { text: resp.paidDate? 'PAID' : "", fontSize: 200, opacity: 0.1 },
			content: [
				// >start page title
				{
					columns: [
						{
							fontSize: 7,
							bold: true,
							text: "Apartatech",
						},
						{
							alignment: "right",
							image: "logo",
							fit: [75, 60],
						},
					],
				},
				{
					alignment: "center",
					fontSize: 12.5,
					columns: ["PAYMENT VOUCHER"],
					margin: [0, -20, 0, 4],
					style: "headTitle",
				},
				{
					alignment: "center",
					fontSize: 8.5,
					columns: [`VOUCHER NO : ${resp.voucherNo}\n\n\n`],
				},
				// >end page title

				{
					columns: [
						{
							margin: [0, 0, 0, 10],
							alignment: "left",
							table: {
								headerRows: 1,
								widths: [45, 100],
								body: [
									// >start sections
									[
										{
											lineHeight: 1,
											fontSize: 5.8,
											alignment: "center",
											fillColor: "#9593A4",
											color: "#ffffff",
											text: "PAY TO",
											bold: true,
										},
										{
											lineHeight: 1,
											fontSize: 5.8,
											text: resp.payTo,
										},
									],
									// >end  sections
								],
							},
						},
						{
							margin: [182, 0, 0, 10],
							alignment: "right",
							table: {
								headerRows: 1,
								widths: [35, 50],
								body: [
									// >start sections
									[
										{
											lineHeight: 1,
											fontSize: 6,
											alignment: "center",
											fillColor: "#9593A4",
											color: "#ffffff",
											text: "DATE",
											bold: true,
										},
										{
											lineHeight: 1,
											fontSize: 6,
											alignment: "center",
											text: resp.date,
										},
									],
									[
										{
											lineHeight: 1,
											fontSize: 6,
											alignment: "center",
											fillColor: "#9593A4",
											color: "#ffffff",
											text: "PAID DATE",
											bold: true,
										},
										{
											lineHeight: 1,
											fontSize: 6,
											alignment: "center",
											text: resp.paidDate,
										},
									],
									// >end  sections
								],
							},
						},
					],
				},

				{
					columns: [
						{
							margin: [0, 0, 0, 0],
							// alignment: "left",
							table: {
								headerRows: 1,
								widths: [65, "*", 30, 75, 75],
								borderColor: [
									"#000000",
									"#000000",
									"#ffffff",
									"#000000",
								],
								body:
									[
										[

											{
												text: 'ACCOUNT CODE',
												alignment: "center",
												bold: true,
												color: "#FFFFFF",
												fontSize: 6,
												fillColor: "#9593A4",
												margin: [0, 0, 0, -5],
												borderColor: [
													"#000000",
													"#000000",
													"#000000",
													"#9593A4",
												],
											},
											{
												text: 'DESCRIPTION',
												alignment: "center",
												bold: true,
												color: "#FFFFFF",
												fontSize: 6,
												fillColor: "#9593A4",
												borderColor: [
													"#000000",
													"#000000",
													"#000000",
													"#9593A4",
												],
											},
											{
												text: 'CUR',
												alignment: "center",
												bold: true,
												color: "#FFFFFF",
												fontSize: 6,
												fillColor: "#9593A4",
												borderColor: [
													"#000000",
													"#000000",
													"#000000",
													"#9593A4",
												],
											},
											{
												text: 'DEBIT',
												alignment: "center",
												bold: true,
												color: "#FFFFFF",
												fontSize: 6,
												fillColor: "#9593A4",
												borderColor: [
													"#000000",
													"#000000",
													"#000000",
													"#9593A4",
												],
											},
											{
												text: 'CREDIT',
												alignment: "center",
												bold: true,
												color: "#FFFFFF",
												fontSize: 6,
												fillColor: "#9593A4",
												borderColor: [
													"#000000",
													"#000000",
													"#000000",
													"#9593A4",
												],
											}
										]
									]

							},
						},
					],
				},
				{
					columns: [
						{
							margin: [0, 0, 0, 0],
							// alignment: "left",
							table: {
								headerRows: 1,
								widths: [65, "*", 30, 75, 75],
								body: body
							},
						},
					],
				},
				{
					columns: [
						{
							margin: [0, -1, 0, 0],
							// alignment: "left",
							table: {
								headerRows: 1,
								widths: [65, "*", 30, 75, 75],
								body: bodyEmpty
							},
						},
					],
				},
				{
					columns: [
						{
							margin: [0, 0, 0, 0],
							// alignment: "left",
							table: {
								headerRows: 1,
								widths: [65, "*", 30, 75, 75],
								body:
									[
										[
											{
												margin: tablePadding,
												fontSize: 5,
												alignment: "center",
												// fillColor: "#9593A4",
												// color: "#ffffff",
												borderColor: [
													"#ffffff",
													"#ffffff",
													"#ffffff",
													"#ffffff",
												],
												text: "",
												bold: true,
											},
											{
												fontSize: 5,
												margin: tablePadding,
												borderColor: [
													"#ffffff",
													"#ffffff",
													"#ffffff",
													"#ffffff",
												],
												stack: [
													{
														text: ``,
														fontSize: 5,
													},
												],
											},
											{
												fontSize: 5,
												alignment: "center",
												borderColor: [
													"#ffffff",
													"#ffffff",
													"#000000",
													"#ffffff",
												],
												margin: tablePadding,
												stack: [
													{
														text: ``,
														fontSize: 5,
													},
												],
											},
											{
												margin: tablePadding,
												fontSize: 5,
												alignment: "right",
												borderColor: [
													"#000000",
													"#ffffff",
													"#000000",
													"#000000",
												],
												text: resp.totalDebCred.debit,
											},
											{
												fontSize: 5,
												alignment: "right",
												margin: tablePadding,
												borderColor: [
													"#000000",
													"#ffffff",
													"#000000",
													"#000000",
												],
												stack: [
													{
														text: resp.totalDebCred.credit,
														fontSize: 5,
													},
												],
											},
										],
									]
							},
						},
					],
				},

				{
					columns: [
						{
							margin: [0, 8, 0, 0],
							table: {
								widths: [53, 62],
								heights: [71, 71],
								body: [
									[
										{
											fontSize: 5,
											borderColor: [
												"#000000",
												"#000000",
												"#ffffff",
												"#000000",
											],

											stack: [
												`Bank\n\n\n`,
												`Account Code`,
												` `,
												`Cheque/BG`,
												` `,
												`Trans Date`,
											],
										},
										{
											fontSize: 5,
											borderColor: [
												"#ffffff",
												"#000000",
												"#000000",
												"#000000",
											],
											stack: [
												`${resp.paidFrom.acctName}\n\n\n`,
												`${resp.paidFrom.acctNo}`,
												` `,
												` `,
												` `,
												`${resp.date}`,
											],
										},
									],
								],
							},
						},
						{
							margin: [-140, 8, 0, 0],
							table: {
								widths: [95, 95, 95, 95],
								heights: [50, 50, 50, 50],

								body: [
									[
										{
											fontSize: 5.8,
											borderColor: [
												"#000000",
												"#000000",
												"#000000",
												"#ffffff",
											],
											stack: [`Request By`],
										},
										{
											fontSize: 5.8,
											borderColor: [
												"#000000",
												"#000000",
												"#000000",
												"#ffffff",
											],
											stack: [`Posted By`],
										},
										{
											fontSize: 5.8,
											borderColor: [
												"#000000",
												"#000000",
												"#000000",
												"#ffffff",
											],
											stack: [`Checked By`],
										},
										{
											fontSize: 5.8,
											borderColor: [
												"#000000",
												"#000000",
												"#000000",
												"#ffffff",
											],
											stack: [`Approved By`],
										},
									],
								],
							},
						},
					],
				},
				{
					columns: [
						{
							margin: [137.8, -22, 0, 0],
							table: {
								widths: [95, 95, 95, 95],
								heights: [15, 15, 15, 15],
								body: [
									[
										{
											fontSize: 5,
											borderColor: [
												"#000000",
												"#ffffff",
												"#000000",
												"#000000",
											],
											stack: [` `, `Date`],
										},
										{
											fontSize: 5,
											borderColor: [
												"#000000",
												"#ffffff",
												"#000000",
												"#000000",
											],
											stack: [` `, `Date`],
										},
										{
											fontSize: 5,
											borderColor: [
												"#000000",
												"#ffffff",
												"#000000",
												"#000000",
											],
											stack: [
												` `,
												`Date`,
											],
										},
										{
											fontSize: 5,
											borderColor: [
												"#000000",
												"#ffffff",
												"#000000",
												"#000000",
											],
											stack: [
												` `,
												`Date`,
											],
										},
									],
								],
							},
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
					margin: [0, 10, 0, 5],
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
				logo: resp.logo,
			},
		};

		const contentObj = {
			pageSize: "A4",
			pageOrientation: "portrait",
			pageMargins: [20, 20],
			...dd,
		}

		return contentObj


	}

	// Print AP A4
	generatePDFTemplateAPSizeA4(content) {
		const tablePadding = [4, 4];
		const tabblePaddingTitle = [4, 4];

		const tableHeader = (text = "", center = false) => ({
			text,
			alignment: center ? "center" : "left",
			bold: true,
			color: "#FFFFFF",
			fontSize: 6,
			fillColor: "#9593A4",
			margin: tabblePaddingTitle,
		});

		const dd: any = {
			content: [
				// >start page title
				{
					columns: [
						{
							fontSize: 8.5,
							bold: true,
							text: "MEDINA APARTMENT KARAWACI",
						},
						{
							alignment: "right",
							image: "logo",
							fit: [75, 60],
						},
					],
				},
				{
					alignment: "center",
					fontSize: 12.5,
					columns: ["PAYMENT VOUCHER"],
					margin: [0, -20, 0, 4],
					style: "headTitle",
				},
				{
					alignment: "center",
					fontSize: 8.5,
					columns: [`VOUCHER NO : ${content.data.voucherno}\n\n\n`],
				},
				// >end page title

				{
					columns: [
						{
							margin: [0, 0, 0, 0],
							alignment: "left",
							table: {
								headerRows: 1,
								widths: [45, 100],
								body: [
									// >start sections
									[
										{
											lineHeight: 1,
											fontSize: 5.8,
											alignment: "center",
											fillColor: "#9593A4",
											color: "#ffffff",
											text: "PAY TO",
											bold: true,
										},
										{
											lineHeight: 1,
											fontSize: 5.8,
											text: content.payTo,
										},
									],
									// >end  sections
								],
							},
						},
						{
							margin: [302, 0, 0, 0],
							alignment: "right",
							table: {
								headerRows: 1,
								widths: [25, 50],
								body: [
									// >start sections
									[
										{
											lineHeight: 1,
											fontSize: 6,
											alignment: "center",
											fillColor: "#9593A4",
											color: "#ffffff",
											text: "DATE",
											bold: true,
										},
										{
											lineHeight: 1,
											fontSize: 6,
											alignment: "center",
											text: content.tfDate,
										},
									],
									// >end  sections
								],
							},
						},
					],
				},

				// >start content table
				{
					margin: [0, 10, 0, 0],
					table: {
						headerRows: 1,
						widths: [65, "*", 30, 75, 75],
						body: [
							// Table header
							[
								tableHeader("ACCOUNT CODE", true),
								tableHeader("DESCRIPTION", true),
								tableHeader("CUR", true),
								tableHeader("DEBIT", true),
								tableHeader("CREDIT", true),
							],
							// Table content

							// >start Water sections
							[
								{
									margin: tablePadding,
									fontSize: 6.8,
									alignment: "center",
									stack: [
										content.data.glaccount == null
											? "No Data"
											: content.data.glaccount.acctNo,
									],
								},
								{
									fontSize: 6.8,

									margin: tablePadding,
									stack: [
										{
											text: content.data.glaccount == null
												? "COA Not Found"
												: content.data.memo == null ? content.data.glaccount
													.acctName : content.data.glaccount
														.acctName
													+ " - " + content.data.memo.toUpperCase(),
											fontSize: 6.8,
										},
									],
								},
								{
									fontSize: 6.8,
									alignment: "center",
									margin: tablePadding,
									stack: [
										{
											text: content.cur.toUpperCase(),
											fontSize: 6.8,
										},
									],
								},
								{
									fontSize: 6.8,
									margin: tablePadding,
									alignment: "right",

									stack: [
										{
											text:
												content.dataDebit
													.isDebitAmount1 == undefined
													? "0.00"
													: content.dataDebit.isDebitAmount1.slice(
														2
													),
											fontSize: 6.8,
										},
									],
								},
								{
									margin: tablePadding,
									fontSize: 6.8,
									alignment: "right",
									text:
										content.dataCredit.creditAmount1 ==
											undefined
											? "0.00"
											: content.dataCredit.creditAmount1.slice(
												2
											),
									// text: `total ipl`
								},
							],
							[
								{
									margin: tablePadding,
									fontSize: 6.8,
									alignment: "center",
									text:
										content.acc2 == null
											? " "
											: content.acc2.acctNo,
								},
								{
									fontSize: 6.8,

									margin: tablePadding,
									stack: [
										{
											text:
												content.acc2 == null
													? " "
													: content.data.multiGLAccount.memo2 == null ? content.acc2.acctName : content.acc2.acctName +
														" - " +
														content.data.multiGLAccount.memo2.toUpperCase(),
											fontSize: 6.8,
										},
									],
								},
								{
									fontSize: 6.8,
									alignment: "center",
									margin: tablePadding,
									stack: [
										{
											text:
												content.data.multiGLAccount ==
													undefined ||
													content.data.multiGLAccount
														.amount2 == null
													? " "
													: content.cur.toUpperCase(),
											fontSize: 6.8,
										},
									],
								},
								{
									fontSize: 6.8,
									margin: tablePadding,
									alignment: "right",

									stack: [
										{
											text:
												content.data.multiGLAccount ==
													undefined ||
													content.data.multiGLAccount
														.amount2 == null
													? " "
													: content.dataDebit
														.isDebitAmount2 ==
														undefined
														? "0.00"
														: content.dataDebit.isDebitAmount2.slice(
															2
														),
											fontSize: 6.8,
										},
									],
								},
								{
									margin: tablePadding,
									fontSize: 6.8,
									alignment: "right",
									text:
										content.data.multiGLAccount ==
											undefined ||
											content.data.multiGLAccount.amount2 ==
											null
											? " "
											: content.dataCredit
												.creditAmount2 == undefined
												? "0.00"
												: content.dataCredit.creditAmount2.slice(
													2
												),
									// text: `total ipl`
								},
							],
							[
								{
									margin: tablePadding,
									fontSize: 6.8,
									alignment: "center",
									text:
										content.acc3 == null
											? " "
											: content.acc3.acctNo,
								},
								{
									fontSize: 6.8,
									margin: tablePadding,
									stack: [
										{
											text:
												content.acc3 == null
													? " "
													: content.data.multiGLAccount.memo3 == null ? content.acc3.acctName : content.acc3.acctName +
														" - " +
														content.data.multiGLAccount.memo3.toUpperCase(),
											fontSize: 6.8,
										},
									],
								},
								{
									fontSize: 6.8,
									alignment: "center",
									margin: tablePadding,
									stack: [
										{
											text:
												content.data.multiGLAccount ==
													undefined ||
													content.data.multiGLAccount
														.amount3 == null
													? " "
													: content.cur.toUpperCase(),
											fontSize: 6.8,
										},
									],
								},
								{
									fontSize: 6.8,
									margin: tablePadding,
									alignment: "right",

									stack: [
										{
											text:
												content.data.multiGLAccount ==
													undefined ||
													content.data.multiGLAccount
														.amount3 == null
													? " "
													: content.dataDebit
														.isDebitAmount3 ==
														undefined
														? "0.00"
														: content.dataDebit.isDebitAmount3.slice(
															2
														),
											fontSize: 6.8,
										},
									],
								},
								{
									margin: tablePadding,
									fontSize: 6.8,
									alignment: "right",
									text:
										content.data.multiGLAccount ==
											undefined ||
											content.data.multiGLAccount.amount3 ==
											null
											? " "
											: content.dataCredit
												.creditAmount3 == undefined
												? "0.00"
												: content.dataCredit.creditAmount3.slice(
													2
												),
								},
							],
							[
								{
									margin: tablePadding,
									fontSize: 6.8,
									alignment: "center",
									text:
										content.acc4 == null
											? " "
											: content.acc4.acctNo,
								},
								{
									fontSize: 6.8,
									margin: tablePadding,
									stack: [
										{
											text:
												content.acc4 == null
													? " "
													: content.data.multiGLAccount.memo4 == null ? content.acc4.acctName : content.acc4.acctName +
														" - " +
														content.data.multiGLAccount.memo4.toUpperCase(),
											fontSize: 6.8,
										},
									],
								},
								{
									fontSize: 6.8,
									alignment: "center",
									margin: tablePadding,
									stack: [
										{
											text:
												content.data.multiGLAccount ==
													undefined ||
													content.data.multiGLAccount
														.amount4 == null
													? " "
													: content.cur.toUpperCase(),
											fontSize: 6.8,
										},
									],
								},
								{
									fontSize: 6.8,
									alignment: "right",

									margin: tablePadding,
									stack: [
										{
											text:
												content.data.multiGLAccount ==
													undefined ||
													content.data.multiGLAccount
														.amount4 == null
													? " "
													: content.dataDebit
														.isDebitAmount4 ==
														undefined
														? "0.00"
														: content.dataDebit.isDebitAmount4.slice(
															2
														),
											fontSize: 6.8,
										},
									],
								},
								{
									margin: tablePadding,
									fontSize: 6.8,
									alignment: "right",
									text:
										content.data.multiGLAccount ==
											undefined ||
											content.data.multiGLAccount.amount4 ==
											null
											? " "
											: content.dataCredit
												.creditAmount4 == undefined
												? "0.00"
												: content.dataCredit.creditAmount4.slice(
													2
												),
								},
							],
							[
								{
									margin: tablePadding,
									fontSize: 6.8,
									alignment: "center",
									text:
										content.acc5 == null
											? " "
											: content.acc5.acctNo,
								},
								{
									fontSize: 6.8,
									margin: tablePadding,
									stack: [
										{
											text:
												content.acc5 == null
													? " "
													: content.data.multiGLAccount.memo5 == null ? content.acc5.acctName : content.acc5.acctName +
														" - " +
														content.data.multiGLAccount.memo5.toUpperCase(),
											fontSize: 6.8,
										},
									],
								},
								{
									fontSize: 6.8,
									alignment: "center",
									margin: tablePadding,
									stack: [
										{
											text:
												content.data.multiGLAccount ==
													undefined ||
													content.data.multiGLAccount
														.amount5 == null
													? " "
													: content.cur.toUpperCase(),
											fontSize: 6.8,
										},
									],
								},
								{
									fontSize: 6.8,
									alignment: "right",

									margin: tablePadding,
									stack: [
										{
											text:
												content.data.multiGLAccount ==
													undefined ||
													content.data.multiGLAccount
														.amount5 == null
													? " "
													: content.dataDebit
														.isDebitAmount5 ==
														undefined
														? "0.00"
														: content.dataDebit.isDebitAmount5.slice(
															2
														),
											fontSize: 6.8,
										},
									],
								},
								{
									margin: tablePadding,
									fontSize: 6.8,
									alignment: "right",
									text:
										content.data.multiGLAccount ==
											undefined ||
											content.data.multiGLAccount.amount5 ==
											null
											? " "
											: content.dataCredit
												.creditAmount5 == undefined
												? "0.00"
												: content.dataCredit.creditAmount5.slice(
													2
												),
								},
							],
							// FIELD SIX
							[
								{
									margin: tablePadding,
									fontSize: 6.8,
									alignment: "center",
									text:
										content.acc6 == null
											? " "
											: content.acc6.acctNo,
								},
								{
									fontSize: 6.8,
									margin: tablePadding,
									stack: [
										{
											text:
												content.acc6 == null
													? " "
													: content.data.multiGLAccount.memo6 == null ? content.acc6.acctName : content.acc6.acctName +
														" - " +
														content.data.multiGLAccount.memo6.toUpperCase(),
											fontSize: 6.8,
										},
									],
								},
								{
									fontSize: 6.8,
									alignment: "center",
									margin: tablePadding,
									stack: [
										{
											text:
												content.data.multiGLAccount ==
													undefined ||
													content.data.multiGLAccount
														.amount6 == null
													? " "
													: content.cur.toUpperCase(),
											fontSize: 6.8,
										},
									],
								},
								{
									fontSize: 6.8,
									alignment: "right",

									margin: tablePadding,
									stack: [
										{
											text:
												content.data.multiGLAccount ==
													undefined ||
													content.data.multiGLAccount
														.amount6 == null
													? " "
													: content.dataDebit
														.isDebitAmount6 ==
														undefined
														? "0.00"
														: content.dataDebit.isDebitAmount6.slice(
															2
														),
											fontSize: 6.8,
										},
									],
								},
								{
									margin: tablePadding,
									fontSize: 6.8,
									alignment: "right",
									text:
										content.data.multiGLAccount ==
											undefined ||
											content.data.multiGLAccount.amount6 ==
											null
											? " "
											: content.dataCredit
												.creditAmount6 == undefined
												? "0.00"
												: content.dataCredit.creditAmount6.slice(
													2
												),
								},
							],
							[
								{
									margin: tablePadding,
									fontSize: 6.8,
									// alignment: "center",
									// fillColor: "#9593A4",
									// color: "#ffffff",

									borderColor: [
										"#ffffff",
										"#000000",
										"#ffffff",
										"#ffffff",
									],
									text: " ",
									bold: true,
								},
								{
									fontSize: 6.8,
									margin: tablePadding,
									borderColor: [
										"#ffffff",
										"#000000",
										"#ffffff",
										"#ffffff",
									],
									stack: [
										{
											text: " ",
											fontSize: 6.8,
										},
									],
								},
								{
									fontSize: 6.8,
									alignment: "center",
									margin: tablePadding,
									borderColor: [
										"#ffffff",
										"#000000",
										"#000000",
										"#ffffff",
									],
									stack: [
										{
											text: ` `,
											fontSize: 6.8,
										},
									],
								},
								{
									fontSize: 6.8,
									alignment: "right",

									margin: tablePadding,
									stack: [
										{
											text: content.totalDebit.slice(2),
											fontSize: 6.8,
										},
									],
								},
								{
									margin: tablePadding,
									fontSize: 6.8,
									alignment: "right",
									text: content.totalCredit.slice(2),
								},
							],
							// >end Water sections
						],
					},
				},

				{
					columns: [
						{
							margin: [0, 8, 0, 0],
							table: {
								widths: [53, 130],
								heights: [71, 71],
								body: [
									[
										{
											fontSize: 6.4,
											borderColor: [
												"#000000",
												"#000000",
												"#ffffff",
												"#000000",
											],

											stack: [
												`Bank\n\n\n`,
												`Account Code`,
												` `,
												`Cheque/BG`,
												` `,
												`Trans Date`,
											],
										},
										{
											fontSize: 6.4,
											borderColor: [
												"#ffffff",
												"#000000",
												"#000000",
												"#000000",
											],
											stack: [
												`${content.data.paidFrom.acctName}\n\n\n`,
												`${content.data.paidFrom.acctNo}`,
												` `,
												` `,
												` `,
												`${content.tfDate}`,
											],
										},
									],
								],
							},
						},
						{
							margin: [-15, 8, 0, 0],
							table: {
								widths: [95, 95, 95, 95],
								heights: [50, 50, 50, 50],
								body: [
									[
										{
											fontSize: 6.4,
											stack: [`Request By`],
										},
										{
											fontSize: 6.4,
											stack: [`Posted By`],
										},
										{
											fontSize: 6.4,
											stack: [`Checked By`],
										},
										{
											fontSize: 6.4,
											stack: [`Approved By`],
										},
									],
								],
							},
						},
					],
				},
				{
					columns: [
						{
							margin: [387.2, -21, 0, 0],
							table: {
								widths: [95, 95, 95, 95],
								heights: [15, 15, 15, 15],
								body: [
									[
										{
											fontSize: 6.4,
											borderColor: [
												"#000000",
												"#ffffff",
												"#000000",
												"#000000",
											],
											stack: [` `, `Date`],
										},
										{
											fontSize: 6.4,
											borderColor: [
												"#000000",
												"#ffffff",
												"#000000",
												"#000000",
											],
											stack: [` `, `Date`],
										},
										{
											fontSize: 6.4,
											borderColor: [
												"#000000",
												"#ffffff",
												"#000000",
												"#000000",
											],
											stack: [
												` `,
												`Date`,
											],
										},
										{
											fontSize: 6.4,
											borderColor: [
												"#000000",
												"#ffffff",
												"#000000",
												"#000000",
											],
											stack: [
												` `,
												`Date`,
											],
										},
									],
								],
							},
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
					margin: [0, 10, 0, 5],
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
			pageOrientation: "landscape",
			pageMargins: [20, 20],
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
