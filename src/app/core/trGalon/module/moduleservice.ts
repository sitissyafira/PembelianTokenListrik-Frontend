import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})


export class ModuleGalon { 	//  FlowSystem Galon
  constructor(
    private http: HttpClient,
  ) { }


  /** Variable, Status Galon. Step By Step.
   * status > The name of the status in the galon index
   * changeStatus > To rename the status to be displayed
   * Details for step by step, Link : https://bms-documentation.notion.site/Galon-Transaction-b7bfcf31f88a45c7b1dca62793ff09c2
   */

  statusGalon = [
    { status: "open", changeStatus: "Open", stepByFlow: "progress" }, // Step No.1
    { status: "progress", changeStatus: "Progress", stepByFlow: "delivery" } // Step No.2

    // { status: "delivery", changeStatus: "Progress", stepByFlow: "done" } // Step No.3
  ]

  /**
   * The Function ChangeStatus, For Displayed.
   * @param statusValue 
   */
  changeStatus(statusValue: string) {
    const result = this.statusGalon.find(data => data.status === statusValue)
    if (result) return result.changeStatus;
    else return statusValue // Not status in flow sistem Galon !!.
  }

  /** ==================== Flow ( Edit/ Update )  ==================== **/
  /**
   * @param value > the status on the galon.
   */
  flowStatusGalon(value: string) {
    const result = this.statusGalon.find(data => data.status === value)
    if (result) return result.stepByFlow;
    else return value // Not status > Send No Data (value:string) value. in flow sistem Galon !!.
  }

}
