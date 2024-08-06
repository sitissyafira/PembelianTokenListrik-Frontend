import { OwnershipContractModel } from '../contract/ownership/ownership.model';
import { AccountBankModel } from '../masterData/bank/accountBank/accountBank.model';
import { PowerMeterModel } from '../power/meter/meter.model';
import { PowerRateModel } from '../power/rate/rate.model';
import {BaseModel} from '../_base/crud';



export class PowbillModel extends BaseModel{
	_id : string;
	billingno : string;
	owner : OwnershipContractModel;
	unit: string;
	rate : string;
	powermeter : PowerMeterModel;
	powerrate : PowerRateModel;
	fee : number;
	notes : string;
	createdDate: string;
	billingDate: string;
	dueDate : string;
	isApproved : boolean;
	createdBy : string;


	paymentType : string;
	bank : AccountBankModel;
	isPaid : boolean;
	customerBank : String;
	customerBankNo : String;
	desc :  string;
	paidDate : String;

	clear(): void{
		this._id = undefined;
		this.billingno = "";
		this.owner = undefined;
		this.unit = "";
		this.rate = "";
		this.powermeter =undefined;
		this.powerrate = undefined;
		this.fee = 0;
		this.notes ="";
		this.createdDate = "";
		this.billingDate = "";
		this.dueDate = "";
		this.isApproved = undefined;

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
