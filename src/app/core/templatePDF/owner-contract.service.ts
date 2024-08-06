import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { ServiceFormat } from '../serviceFormat/format.service';

interface UnitObj {
  tower: string
  floor: string,
  block: string
  unitName: string
  unitType: string
}

interface ContractObj {
  contact_name: string;
  contact_address: string;
  contact_email: string;
  contact_phone: string;
  receipt: any;
  contract_date: string;
  contact_name_ttd: string;
}

interface ContractPDFContent {
  unit: UnitObj;
  contract: ContractObj;
  logo: string;
}

@Injectable({
  providedIn: 'root'
})

export class TemplateOwnerContract {
  constructor(private http: HttpClient, private serviceFormat: ServiceFormat) { }

  // Print
  // PDF OBJ Template
  generatePDFTemplate(content: ContractPDFContent) {
    const tablePadding = [5, 6];

    const tableHeader = (text = "", center = false) => ({ // function to create header
      text,
      alignment: center ? "center" : "left",
      bold: true,
      color: "#FFFFFF",
      fontSize: 7,
      fillColor: "#92D050",
      margin: [5, 7.5],
    });

    let dataLoop: any = [ // as the first index/header
      [
        tableHeader("NO", true),
        tableHeader("DESCRIPTION", true),
        tableHeader("BM CHECK", true),
        tableHeader("TENANT CHECK", true)
      ]
    ]

    // looping data that is in the receipt index, and entered as pdf content
    for (let i = 0; i < content.contract.receipt.length; i++) {
      dataLoop.push(
        [
          // Column Number Start
          {
            fontSize: 7,
            lineHeight: 1.2,
            style: i % 2 === 0 ? "strippedTable" : "",
            margin: [5, 5],
            alignment: 'center',
            stack: [
              {
                text: `${i + 1}`,
              },
            ],
          },
          // Column Number End

          // Column Description Start
          {
            lineHeight: 1.2,
            style: i % 2 === 0 ? "strippedTable" : "",
            margin: [5, 5],
            fontSize: 7,
            text: content.contract.receipt[i].desc,
          },
          // Column Description End

          // Column BM CHECK Start
          {
            lineHeight: 1.2,
            style: i % 2 === 0 ? "strippedTable" : "",
            bold: true,
            alignment: 'center',
            margin: [5, 5],
            fontSize: 8,
            text: content.contract.receipt[i].value ? " √ " : " X ",
          },
          // Column BM CHECK End

          // Column TENANT CHECK Start
          {
            lineHeight: 1.2,
            style: i % 2 === 0 ? "strippedTable" : "",
            margin: [5, 5],
            fontSize: 7,
            text: '',
          },
          // Column TENANT CHECK End
        ],
      )
    }

    // Object to base template
    const dd: any = {
      content: [
        // >start page title
        {
          alignment: "center",
          columns: [
            {
              text: 'TANDA TERIMA',
              bold: true,
              fontSize: 16
            }
          ],
        },
        // Header name for tower
        {
          alignment: "center",
          columns: [
            {
              text: content.unit.tower,
              bold: true,
              fontSize: 16
            }
          ],
        },

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
              fontSize: 7.5,
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
              fontSize: 7.5,
              stack: [
                {
                  text: `TENANT INFO`,
                  bold: true,
                },
                {
                  lineHeight: 1,
                  margin: [0, 8, 0, 0],
                  stack: [
                    `Name : ${content.contract.contact_name}`,
                    `Address : ${content.contract.contact_address}`,
                    `Email : ${content.contract.contact_email}`,
                    `Phone : ${content.contract.contact_phone}`,
                  ]
                },
              ],
            },

            {
              width: "22%",
              lineHeight: 0.55,
              fontSize: 7.5,
              stack: [
                {
                  text: `UNIT INFO`,
                  bold: true,
                },
                {
                  lineHeight: 1,
                  margin: [0, 8, 0, 0],
                  stack: [
                    `Floor : ${content.unit.floor}`,
                    `Blok : ${content.unit.block}`,
                    `Unit : ${content.unit.unitName}`,
                    `Unit Type : ${content.unit.unitType}`,
                  ]
                },
              ],
            },
          ],
        },
        {
          margin: [0, 10, 0, 0],
          table: {
            headerRows: 1,
            widths: [25, "*", 70, 70],
            body: dataLoop // Data Loop from index receipt
          },
        },

        {
          columns: [
            {
              margin: [0, 25],
              alignment: "left",
              bold: true,
              fontSize: 7.5,
              table: {
                headerRows: 1,
                widths: [240],
                body: [
                  [
                    {
                      text: "Catatan : ",
                      color: "#000",
                      fontSize: 7,
                      margin: [5, 7.5, 50, 40],
                    },

                  ],
                ],
              },
            },
            {
              alignment: "right",
              fontSize: 7.5,
              stack: [
                `\n\nJakarta, ${content.contract.contract_date}`, // Static Domisili
                "\n\n\n\n\n",
                {
                  text: `${content.contract.contact_name_ttd}\t\t\t\t\t\t\t\t\t\t\t\t\t Apartment\t\t\t`, // Static Naming Apartment
                },
              ],
            },
          ],
        },
      ],

      footer: {
        alignment: 'center',
        italics: true,
        columns: [
          {
            stack: [

              {
                text: 'Support by Apartatech System',
                fontSize: 7,
                color: '#808080'
              }
            ]
          }

        ]
      },

      defaultStyle: {
        font: "Poppins",
        fontSize: 8,
      },

      styles: {
        headTitle: {
          fontSize: 16,
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
        logo: content.logo,
      },
    };

    let contentObj = {
      pageSize: "A4",
      pageOrientation: "portrait",
      pageMargins: [40, 40],
      ...dd,
    }

    return contentObj // For the result templatePdfContract
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
