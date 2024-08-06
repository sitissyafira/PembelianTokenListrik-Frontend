import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import moment from 'moment';
import { ServiceFormat } from '../serviceFormat/format.service';


@Injectable({
	providedIn: 'root'
})

export class TemplatePDFWriteOff {
	constructor(private http: HttpClient, private serviceFormat: ServiceFormat) { }

	// Print 
	generatePDFTemplateJournal(downloadLabel = "", resp, data) {
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

		const dataAmount = 31 - data.length

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
			content: [
				// >start page title
				{
					columns: [
						{
							fontSize: 7,
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
					columns: ["JOURNAL VOUCHER"],
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
											text: "DESCRIPTION",
											bold: true,
										},
										{
											lineHeight: 1,
											fontSize: 5.8,
											text: resp.desc,
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
											text: resp.date,
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
						// {
						// 	margin: [0, 8, 0, 0],
						// 	table: {
						// 		widths: [53, 62],
						// 		heights: [71, 71],
						// 		body: [
						// [
						// 	{
						// 		fontSize: 5,
						// 		borderColor: [
						// 			"#000000",
						// 			"#000000",
						// 			"#ffffff",
						// 			"#000000",
						// 		],

						// 		stack: [
						// 			`Bank\n\n\n`,
						// 			`Account Code`,
						// 			` `,
						// 			`Cheque/BG`,
						// 			` `,
						// 			`Trans Date`,
						// 		],
						// 	},
						// 	{
						// 		fontSize: 5,
						// 		borderColor: [
						// 			"#ffffff",
						// 			"#000000",
						// 			"#000000",
						// 			"#000000",
						// 		],
						// 		stack: [
						// 			`${content.data.depositTo.acctName}\n\n\n`,
						// 			`${content.data.depositTo.acctNo}`,
						// 			` `,
						// 			` `,
						// 			` `,
						// 			`${content.tfDate}`,
						// 		],
						// 	},
						// ],
						// 		],
						// 	},
						// },
						{
							margin: [137.8, 8, 0, 0],
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
							margin: [137.8, -8, 0, 0],
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
											stack: [`Nama :`, `Date :`],
										},
										{
											fontSize: 5,
											borderColor: [
												"#000000",
												"#ffffff",
												"#000000",
												"#000000",
											],
											stack: [`Nama :`, `Date :`],
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
												`Nama :`,
												`Date :`,
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
												`Nama :`,
												`Date :`,
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

		let contentObj = {
			pageSize: "A4",
			pageOrientation: "portrait",
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
