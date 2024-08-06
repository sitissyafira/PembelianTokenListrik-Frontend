import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ServiceFormat } from '../../../serviceFormat/format.service';

@Injectable({
  providedIn: 'root'
})


export class ModuleVisitor { 	//  FlowSystem Visitor
  constructor(
    private http: HttpClient,
    private serviceFormat: ServiceFormat,
  ) { }


  /** Variable, Status Visitor. Step By Step.
   * status > The name of the status in the visitor index
   * changeStatus > To rename the status to be displayed
   * Details for step by step, Link : https://bms-documentation.notion.site/Visitor-Management-cc957e4db4a84dd48e7afb8c4c11d771
   */

  statusVisitor = [
    { status: "wait-confirm-web", changeStatus: "Wait For Confirmation Admin" },
    { status: "wait-confirm-mob", changeStatus: "Wait For Confirmation Customer" },
    { status: "approve-by-web", changeStatus: "Approve" },
    { status: "approve-by-mob", changeStatus: "Approve" },
    { status: "check-in", changeStatus: "Check In" },
    { status: "check-out", changeStatus: "Check Out" },
    { status: "cancel-by-mob", changeStatus: "Cancel By Customer" },
    { status: "cancel-by-web", changeStatus: "Cancel By Admin" },
    { status: "reject-by-mob", changeStatus: "Reject By Customer" },
  ]

  /**
   * The Function ChangeStatus, For Displayed.
   * @param statusValue 
   */
  changeStatus(statusValue: string) {
    const result = this.statusVisitor.find(data => data.status === statusValue)
    if (result) return result.changeStatus;
    else return statusValue // Not status in flow sistem Visitor !!.
  }

  /** ==================== Flow ( Edit/ Update )  ==================== **/
  /**
   * @param value > the status on the visitor.
   */
  flowStatusVisitor(value: string) {
    const result = value === 'approve-by-mob' ? 'check-in' :
      value === 'check-in' ? 'check-out' :
        value === 'wait-confirm-web' ? 'approve-by-web' :
          value === 'approve-by-web' ? 'check-in' : value

    return result
  }
}
