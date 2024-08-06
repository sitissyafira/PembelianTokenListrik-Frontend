//import { kStringMaxLength } from 'buffer';
import { TicketModel } from '../ticket/ticket.model';
import { BaseModel } from '../_base/crud';



export class DeliveryorderModel extends BaseModel {
	_id: string;
	unitID: string;
	doId: string;
	ticket: TicketModel;
	attachment: [String];
	attachmentFixing: [String];
	description: string;
	unit: string;
	status: string;
	fixedDate: string;
	rescheduleDateSurvey: string;
	rescheduleDateFixing: string;
	rescheduleDescSurvey: string;
	rescheduleDescFixing: string;
	paymentSelection: string;


	createdDate: Date;
	updatedBy: string;
	updatedDate: Date;
	createdBy: string;


	totalCost: any
	itemReq: any
	rejectDate: any
	visitDateSurv: string
	visitDateFixing: string
	engSurvey: any
	engFixing: any
	surveyDesc: string;
	fixingDesc: string;

	engFixingDesc: string;
	handledBy: string;



	clear(): void {
		this._id = undefined;
		this.status = undefined;
		this.surveyDesc = undefined
		this.fixingDesc = undefined
		this.attachmentFixing = undefined
		this.createdBy = localStorage.getItem("user");
	}
}
