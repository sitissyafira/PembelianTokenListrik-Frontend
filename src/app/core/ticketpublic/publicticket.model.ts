import { BaseModel } from '../_base/crud';
import { OwnershipContractModel } from '../contract/ownership/ownership.model';
import { SubdefectModel } from '../subdefect/subdefect.model';
import { EngineerModel } from '../engineer/engineer.model';
import { LeaseContractModel } from '../contract/lease/lease.model';
import { UnitModel } from '../unit/unit.model';
import { User } from '../auth';



export class PublicTicketModel extends BaseModel {
	_id: string;
	ticketId: string;
	ticketID: string;
	woID: string;
	subject: string;
	unit2: string;
	unit: UnitModel;
	contract: OwnershipContractModel;
	contract2: string;
	description: string;
	dateScheduled: string;
	dateList: [];
	reason: string;
	priority: string;
	created_date: string;

	ticket_id: any;

	attachment: [string];
	attachmentSurvey: [string];

	status: string;
	engineerId: EngineerModel;

	rating: string; //0,1,2,3,4,5
	feedback: string;
	paymentSelection: string;

	createdDate: string;
	// updatedBy: User;
	updatedBy: any;
	updatedDate: string;
	rejectDesc: string;
	createdBy: User;

	rejectDate: any
	visitDateSurv: string
	visitDateFixing: string
	engSurvey: any
	engFixing: any
	surveyDesc: string;
	fixingDesc: string;

	engFixingDesc: string;
	handledBy: string;
	isPaid: boolean;
	isRead: boolean;
	totalPlusTax: number
	taxPercent: number

	// Update add index
	nameInput: any
	phoneNumber: any
	statusCreator: any
	statusTenant: any
	tenantName: any



	clear(): void {
		this._id = undefined;
		this.ticketId = "";
		this.subject = "";
		this.contract = undefined;
		this.contract2 = "";
		this.unit = undefined;
		this.description = "";
		this.unit2 = "";
		this.dateScheduled = "";
		this.dateList = [];
		this.priority = "";
		this.attachment = undefined;
		this.reason = "";
		this.status = "";
		this.engineerId = undefined;
		this.rating = "";
		this.feedback = "";

		this.createdBy = undefined;
		this.createdDate = "";
		this.updatedBy = undefined;
		this.updatedDate = "";


	}
}
