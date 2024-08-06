import { AccountGroupModel } from '../../accountGroup/accountGroup.model';
import { AccountTypeModel } from '../../accountType/accountType.model';
import { User } from '../../auth';
import {BaseModel} from '../../_base/crud';



export class OpeningBalanceModel extends BaseModel{
	_id : string;
	typeAccount  : AccountTypeModel;
	coa : AccountGroupModel;
	opening_balance : string;
	remark : string;
	createdBy: User;
	createdDate: string;
	updateBy: User;
	updateDate: string;
	isDelete :boolean;


	clear(): void{
		this._id = undefined;
		this.typeAccount = undefined;
		this.coa = undefined;
		this.opening_balance = "";
		this.remark = "";
		this.createdBy = undefined;
		this.createdDate = "";
		this.updateBy = undefined;
		this.updateDate = "";
		this.isDelete = undefined
	}
}
