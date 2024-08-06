import { LeaseContractModel } from '../contract/lease/lease.model';
import { OwnershipContractModel } from '../contract/ownership/ownership.model';
import { AccountBankModel } from '../masterData/bank/accountBank/accountBank.model';
import {BaseModel} from '../_base/crud';



export class RentalbillingModel extends BaseModel{
	_id : string;
	billingNo : string;
	lease : LeaseContractModel;
	notes: string;
	unit : string;
	createdDate : string;
	billingDate : string;
	dueDate: string;
	// isApproved : boolean;
	createdBy: string;
	

	paymentType : string;
	bank : AccountBankModel;
	isPaid : boolean;
	customerBank : String;
	customerBankNo : String;
	desc :  string;
	paidDate : String;

	
	clear(): void{
		this._id = undefined;
		this.billingNo = "";
		this.lease = undefined;
		this.unit = "";
		this.notes = "",
		this.createdDate = "",
		this.billingDate ="";
		this.dueDate = "";
		// this.isApproved = undefined;
		this.bank = undefined;
		this.isPaid = undefined;
		this.customerBank = "";
		this.customerBankNo ="";
		this.desc = "";
		this.paidDate= "";
		this.paymentType ="";
		this.createdBy = localStorage.getItem("user");
	}
}
