
import { LeaseContractModel } from '../contract/lease/lease.model';
import { AccountBankModel } from '../masterData/bank/accountBank/accountBank.model';
import {BaseModel} from '../_base/crud';



export class LsebillingModel extends BaseModel{
	_id : string;
	billingNo : string;
	lease : LeaseContractModel;
	notes: string;
	price: number;
	createdDate : string;
	billingDate : string;
	dueDate: string;
	unit : string;
	// isApproved : boolean;
	createdBy: string;


	bank : AccountBankModel;
	isPaid : boolean;
	customerBankNo : String;
	customerBank : String;
	desc :  string;
	paidDate : String;
	paymentType : string;
	

	


	clear(): void{
		this._id = undefined;
		this.billingNo = "";
		this.lease = undefined;
		this.price = 0;
		this.unit = "";
		this.notes = "",
		this.createdDate = "",
		this.billingDate ="";
		this.dueDate = "";
		// this.isApproved = undefined;

		this.bank = undefined;
		this.isPaid = undefined;
		this.customerBank = "";
		this.customerBankNo="";
		this.desc = "";
		this.paidDate= "";
		this.paymentType ="";
		this.createdBy = localStorage.getItem("user");
	}
}
