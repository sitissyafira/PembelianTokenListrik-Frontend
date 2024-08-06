import {BaseModel} from '../../../_base/crud';
import {UnitModel} from '../../../unit/unit.model';
import { OwnershipContractModel } from '../../../contract/ownership/ownership.model';
import { BankModel } from '../../../masterData/bank/bank/bank.model';

export class BillLogModel extends BaseModel {
	_id : string;
	billing_number : string;
	contract : OwnershipContractModel;
	unit : UnitModel;
	billing : any;
	power : any;
	water : any;
	ipl : any;
	billed_to : string;
	created_date : string;
	unit2: string;
	billing_date : string;
	due_date : string;
	totalBilling : Number;
	isFreeIpl :boolean
	isFreeAbodement : boolean

	bank: BankModel;
	customerBankNo : String;
	customerBank: String;
	desc: String;
	paidDate: String;
	isPaid : boolean;
	transferAmount : string;
	paymentType : string;
	accountOwner : string;
	attachment: [string];
	paymentStatus : boolean;
	pinalty : number;

	clear(): void {
		this._id = undefined;
		this.billing_number = "";
		this.billing = undefined;
		this.power = undefined;
		this.water = undefined;
		this.ipl =  undefined;
		this.unit = undefined;
		this.contract = undefined;
		this.isFreeAbodement = undefined;
		this.isFreeIpl = undefined;
		
		this.unit2 = "";
		this.billed_to = "";
		this.created_date = "";
		this.billing_date = "";
		this.due_date = "";
		this.totalBilling = 0;

		this.bank =undefined;
		this.customerBankNo = "";
		this.customerBank = "";
		this.desc = "";
		this.paidDate = "";
		this.isPaid = undefined;
		this.paymentType = "";
		this.transferAmount = "";
		this.accountOwner ="";
		this.attachment = undefined;
		this.paymentStatus = undefined;

		this.pinalty = 0;
	}
}
