import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ServiceFormat } from '../../../serviceFormat/format.service';

@Injectable({
  providedIn: 'root'
})


export class ModulePackage { 	//  FlowSystem Package
  constructor(
    private http: HttpClient,
    private serviceFormat: ServiceFormat,
  ) { }


  /** Variable, Status Package. Step By Step.
   * status > The name of the status in the package index
   * changeStatus > To rename the status to be displayed
   * Details for step by step, Link : https://bms-documentation.notion.site/Package-Management-80681260438d4998ba987df1a8a16654
   */

  statusPackage = [
    { status: "wait-confirm", changeStatus: "Waiting For Confirmation", stepByFlow: "wait-confirm" }, // Step No.1
    { status: "done-confirm", changeStatus: "Confirmed", stepByFlow: "taken" }, // Step No.2
    { status: "taken", changeStatus: "Taken", stepByFlow: "done" }, // Step No.3
    { status: "done", changeStatus: "Done", stepByFlow: "" },

    // package has exceeded 3 days!
    { status: "lost-found", changeStatus: "Lost Found", stepByFlow: "taken" },
  ]

  /**
   * The Function ChangeStatus, For Displayed.
   * @param statusValue 
   */
  changeStatus(statusValue: string) {
    const result = this.statusPackage.find(data => data.status === statusValue)
    if (result) return result.changeStatus;
    else return statusValue // Not status in flow sistem Package !!.
  }

  /** ==================== Flow ( Edit/ Update )  ==================== **/
  /**
   * @param value > the status on the package.
   */
  flowStatusPackage(value: string) {
    const result = this.statusPackage.find(data => data.status === value)
    if (result) return result.stepByFlow;
    else return value // Not status > Send No Data (undefined) value. in flow sistem Package !!.
  }
}
