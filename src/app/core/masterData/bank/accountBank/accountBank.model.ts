import {BaseModel} from '../../../_base/crud';
import { BankModel } from '../bank/bank.model';

export class AccountBankModel extends BaseModel{
	_id : string;
	bank : BankModel;
	acctName : string;
	acctNum :string;
	branch : string;
	remarks: string;
	createdBy: string;
	

	clear(): void{
		this._id = undefined;
		this.acctName = "";
		this.bank = undefined;
		this.acctNum = "";
		this.branch = "";
		this.remarks = "";
		this.createdBy = localStorage.getItem("user");
	}
}
