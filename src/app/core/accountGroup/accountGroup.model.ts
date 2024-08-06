import { BaseModel } from '../_base/crud';
import { AccountTypeModel } from '../accountType/accountType.model';

export class AccountGroupModel extends BaseModel {
	_id: string;
	depth: number;
	isChild: boolean;
	acctNo: string;
	acctName: string;
	openingBalance: number;
	balance: number;
	AccType: AccountTypeModel;
	AccId: string;
	status: any;
	parent: any;
	parentId: any;
	parentName: any;
	parentOrHeader: any;

	clear(): void {
		this._id = undefined;
		this.isChild = false;
		this.acctNo = "";
		this.acctName = "";
		this.openingBalance = 0;
		this.balance = 0;
		this.AccType = undefined;
	}
}
