import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import moment from 'moment';
import { ServiceFormat } from '../serviceFormat/format.service';


@Injectable({
	providedIn: 'root'
})

export class TemplatePDFPurchaseRequest {
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
                tableHeader("Description", true),
                tableHeader("Qty", true),
                tableHeader("Uom", true),
                tableHeader("Unit Cost (Rp)", true),
                tableHeader("Total (Rp)", true),
            ],
        ]

        content.product_name.map((item, idx) => {
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
                            text: `${item.brand_name.toUpperCase()}`,
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
                            text: `${item.description}`,
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
                            text: `${item.uom2}`,
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
                            text: `${this.serviceFormat.rupiahFormatImprovement(parseInt(item.buy_price))}`,
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
                            text: `${this.serviceFormat.rupiahFormatImprovement(item.subtotal)}`,
                            bold: false,
                        },
                    ],
                },

            ]
            bodyTableRow.push(row)
        })


		const dd: any = {
			content: [
				// >start page title
				{
					alignment: "center",
					columns: ["PURCHASE REQUEST"],
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
                            width: "25%",
							stack: [
								{
									text: `Purchase Request Number`,
									bold: true,
								},
								{
									text: `Date`,
									bold: true,
								},
								{
									text: `Estimated Date`,
									bold: true,
								},
								{
									text: `PIC`,
									bold: true,
								},
							],
						},
                        {
							lineHeight: 1,
							stack: [
								{
									text: `: ${content.purchase_request_no.toUpperCase()}`,
									bold: false,
								},
								{
									text: `: ${moment(content.request_date).format("DD MMMM YYYY")}`,
									bold: false,
								},
								{
									text: `: ${moment(content.estimated_date).format("DD MMMM YYYY")}`,
									bold: false,
								},
								{
									text: `: ${content.created_by.first_name}`,
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
						widths: [20,'*', 40, 40, 50, 90, 70],
						body: bodyTableRow
					},
				},
				{
					margin: [0, 10, 0, 0],
					stack: [
						{
							text: "Notes: "
						},
						{
							text: `${content.description}`
						}
					]
				},
				//>end content table
                {
					margin: [0, 20, 0, 20],
                    alignment: 'right',
					stack: [
                        {
                            columns: [
                                {
                                    text: "Approve by",
                                    bold: true,
                                    style: {
                                        width: 100
                                    }
                                },
                                {
                                    canvas: [
                                        {
                                            lineColor: '#000000',
                                            type: "line",
                                            x1: 0,
                                            y1: 10,
                                            // A4 size/2 - left + right page margin
                                            x2: (595.28/2) - 80,
                                            y2: 10,
                                            lineWidth: 0.5,
                                        },
                                    ],
                                }
                            ]
                        }
                    ]
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

	// private handleError<T>(operation = 'operation', result?: any) {
	// 	return (error: any): Observable<any> => {
	// 		// TODO: send the error to remote logging infrastructure
	// 		console.error(error); // log to console instead
	// 		// Let the app keep running by returning an empty result.
	// 		return of(result);
	// 	};
	// }
}
