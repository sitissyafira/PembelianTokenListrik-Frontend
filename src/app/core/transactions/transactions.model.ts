import { BaseModel } from '../_base/crud';



export class TransactionsModel extends BaseModel {
	_id: string;
	acctypeno: string;
	acctype: string;
	status: string;
	createdBy: string;

	clear(): void {
		this._id = undefined;
		this.acctypeno = "";
		this.acctype = "";
		this.status = "";
		this.createdBy = localStorage.getItem("user");
	}
}
