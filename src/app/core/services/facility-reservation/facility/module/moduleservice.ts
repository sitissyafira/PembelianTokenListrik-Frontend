import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})


export class ModuleFacility { 	//  FlowSystem Facility
  constructor(
    private http: HttpClient,
  ) { }


  /** Variable, Status Facility. Step By Step.
   * status > The name of the status in the facility index
   * changeStatus > To rename the status to be displayed
   * Details for step by step, Link : https://bms-documentation.notion.site/Facility-Reservation-78baf092a97f450398ea11c0fb5ee598
   */

  statusFacility = [
    { status: "open", changeStatus: "Open", stepByFlow: "closed" }, // Step No.1
    { status: "closed", changeStatus: "Closed", stepByFlow: "" } // Step No.2
  ]

  /**
   * The Function ChangeStatus, For Displayed.
   * @param statusValue 
   */
  changeStatus(statusValue: string) {
    const result = this.statusFacility.find(data => data.status === statusValue)
    if (result) return result.changeStatus;
    else return statusValue // Not status in flow sistem Facility !!.
  }

  /** ==================== Flow ( Edit/ Update )  ==================== **/
  /**
   * @param value > the status on the facility.
   */
  flowStatusFacility(value: string) {
    return value
  }

}
