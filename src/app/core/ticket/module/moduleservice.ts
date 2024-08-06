import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ServiceFormat } from '../../serviceFormat/format.service';

@Injectable({
  providedIn: 'root'
})


export class ModuleTicketing { 	//  FlowSystem ticketing
  constructor(
    private http: HttpClient,
    private serviceFormat: ServiceFormat,
  ) { }


  /** Variable, Status Ticketing. Step By Step.
   * status > The name of the status in the ticketing index
   * changeStatus > To rename the status to be displayed
   * Details for step by step, Link : https://bms-documentation.notion.site/Ticketing-78c9e9da37dd4698bae368fc6e56b150
   */

  statusTicketing = [
    // # Handled By "TRO"
    { status: "open", changeStatus: "Open", stepByFlow: "wait-sched-surv" }, // Step No.1
    { status: "wait-sched-surv", changeStatus: "Waiting For Schedule Survey", stepByFlow: "wait-confirm-surv" }, // Step No.2
    { status: "wait-confirm-surv", changeStatus: "Waiting For Confirmation", stepByFlow: "sched-for-surv" }, // Step No.3
    { status: "sched-for-surv", changeStatus: "Scheduled Survey", stepByFlow: "vis-for-surv" }, // Step No.4
    { status: "resched-for-surv", changeStatus: "Rescheduled Survey", stepByFlow: "vis-for-surv" }, // Step No.4

    // # Handled By "MOB" > Mobile Engineer
    { status: "surv-work-done", changeStatus: "Survey Done", stepByFlow: 'wait-cust-approve' }, // Step No.6
    { status: "vis-for-surv", changeStatus: "Visit Survey", stepByFlow: "surv-work-done" }, // Step No.5
    { status: "visit-for-surv", changeStatus: "Visit Survey", stepByFlow: "" },
    { status: "vis-for-fix", changeStatus: "Visit Fixing", stepByFlow: "fix-work-done" }, // Step No.12
    { status: "fix-work-done", changeStatus: "Fixed", stepByFlow: "tick-work-done" },  // Step No.13

    // # Handled By "TRO"
    { status: "fix-admin-reject", changeStatus: "Reject by Admin", stepByFlow: "" },
    { status: "wait-cust-approve", changeStatus: "Waiting Approve Customer", stepByFlow: "tick-cust-approve" }, // Step No.7

    // # Handled By "MOB" > Mobile User
    { status: "tick-cust-approve", changeStatus: "Customer Approve", stepByFlow: "wait-sched-wo" },   // Step No.8
    { status: "fix-cust-reject", changeStatus: "Reject by Customer", stepByFlow: "" },

    // Handled By "TRO"
    { status: "wait-sched-wo", changeStatus: "Waiting For Schedule WO", stepByFlow: "wait-confirm-wo" },   // Step No.9

    // Handled By "SPV"
    { status: "wait-confirm-wo", changeStatus: "Waiting For Confirmation WO", stepByFlow: "sched-for-fix" },  // Step No.10
    { status: "tick-work-done", changeStatus: "Done", stepByFlow: "tick-work-done" },
    { status: "wo-work-done", changeStatus: "Done", stepByFlow: "" },

    // Handled By "TRO"
    { status: "sched-for-fix", changeStatus: "Schedule Fixing", stepByFlow: "vis-for-fix" }, // Step No.11
    { status: "resched-for-fix", changeStatus: "Reschedule Fixing", stepByFlow: "sched-for-fix" },
  ]

  /**
   * The Function ChangeStatus, For Displayed.
   * @param statusValue 
   */
  changeStatus(statusValue: string) {
    const result = this.statusTicketing.find(data => data.status === statusValue)
    if (result) return result.changeStatus;
    else return statusValue // Not status in flow sistem Ticketing !!.
  }

  /** ==================== Flow ( Edit/ Update )  ==================== **/
  /**
   * @param value > the status on the ticket.
   */
  flowStatusTicketing(value: string) {
    const result = this.statusTicketing.find(data => data.status === value)
    if (result) return result.stepByFlow;
    else return undefined // Not status > Send No Data (undefined) value. in flow sistem Ticketing !!.
  }

  /** =================== Send Total Cost (Edit/Update) =================== */
  /**
   * @param status > the status on the ticket.
   * @param value > if the ticket already has a total cost, take it based on the index on the ticket
   * @param controlsValue > value total Cost that changes based on form Control on createForm()
   */
  sendTotalCost(status: string, value: any, controlsValue: any) {
    const result = status === "tick-cust-approve" || status === "wait-sched-wo" //Condition Total Cost Updating
      || status === "wait-confirm-wo" || status === "wait-confirm-wo" || status === "resched-for-fix"
      || status === "wait-confirm-wo" || status === "tick-work-done" || status === "fix-work-done" ? value : this.serviceFormat.formatFloat(controlsValue ? controlsValue : 0);
    return result
  }

  /** =================== Send Item Req (Edit/Update) =================== */
  /**
   * @param status > the status on the ticket.
   * @param value > if the ticket already has a itemReq, take it based on the index on the ticket
   * @param controlsValue > value Item Req that changes based on form Control on createForm()
   */
  sendItemReq(status: string, value: any, controlsValue: any) {
    const result = status === "tick-cust-approve" || //Condition Item Request Cost Name and Cost Price Updating
      status === "wait-sched-wo" || status === "wait-confirm-wo" || status === "wait-confirm-wo" || status === "resched-for-fix" ||
      status === "wait-confirm-wo" || status === "fix-work-done" ? value : controlsValue
    return result
  }

  /** =================== Send Item Req (Edit/Update) =================== */
  /**
   * @param status > the status on the ticket.
   * @param value > if the ticket already has a handledBy, take it based on the index on the ticket
   * @param controlsValue > value Handled By that changes based on form Control on createForm()
   */
  sendHandledBy(status: string, value: any, controlsValue: any) {
    const result = status === "wait-confirm-surv" || status === "surv-work-done" || status === "sched-for-fix" //Condition Handled By
      || status === "wait-confirm-wo" ? "mob" : status === "tick-cust-approve" ? "spv" : status === "wait-confirm-wo" ||
        status === "wait-sched-wo" ? "tro" : status === "wait-confirm-wo" ? value : controlsValue
    return result
  }

  /** =================== Total Cost After PPN (Edit/Update) =================== */
  /**
   * @param status > the status on the ticket.
   * @param value > if the ticket already has a TotalCostAfterPPN, take it based on the index on the ticket
   * @param controlsValue > value TotalCostAfterPPN that changes based on form Control on createForm()
   */
  sendTotalCostAfterPPN(status: string, value: any, controlsValue: any) {
    const result = status === "tick-cust-approve" || status === "wait-sched-wo" //Condition Total Cost Updating
      || status === "wait-confirm-wo" || status === "wait-confirm-wo" || status === "resched-for-fix"
      || status === "wait-confirm-wo" || status === "tick-work-done" || status === "fix-work-done" ?
      value : this.serviceFormat.formatFloat(controlsValue ? controlsValue : 0);
    return result
  }

  /** =================== Percentage PPN (Edit/Update) =================== */
  /**
   * @param status > the status on the ticket.
   * @param value > if the ticket already has a percentage, take it based on the index on the ticket
   * @param controlsValue > value percentage that changes based on form Control on createForm()
   */
  sendPercentagePPN(status: string, value: any, controlsValue: any) {
    const result = status === "tick-cust-approve" || status === "wait-sched-wo" //Condition Total Cost Updating
      || status === "wait-confirm-wo" || status === "wait-confirm-wo" || status === "resched-for-fix"
      || status === "wait-confirm-wo" || status === "tick-work-done" || status === "fix-work-done" ? value : controlsValue;
    return result
  }
}
