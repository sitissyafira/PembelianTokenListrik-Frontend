import {BaseModel} from '../../../_base/crud';



export class BankModel extends BaseModel{
	_id : string;
	codeBank : string;
	bank : string;
	remarks: string;
	createdBy: string;




	clear(): void{
		this._id = undefined;
		this.codeBank = "";
		this.bank = "";
		this.remarks = "";
		this.createdBy = localStorage.getItem("user");
	}
}
