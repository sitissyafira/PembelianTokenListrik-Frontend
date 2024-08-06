import { analyzeAndValidateNgModules } from '@angular/compiler';
import { AccountGroupModel } from '../../accountGroup/accountGroup.model';
import { User } from '../../auth';
import {BaseModel} from '../../_base/crud';

export class PettyCastModel extends BaseModel{
	_id : string;
	pettyCashNo : string;
	paidFrom: AccountGroupModel
    glaccount : AccountGroupModel
    memo : string;
    amount : string;



	created_by: User;
	created_date : string;

	clear(): void{
		this._id = undefined;
		this.pettyCashNo = "";
		this.paidFrom = undefined;
		this.glaccount = undefined;
		this.memo = "";
		this.amount = "";

		this.created_date = "";;
		this.created_by = undefined;
	}
}
