import { AccountGroupModel } from "../../../accountGroup/accountGroup.model";
import { User } from "../../../auth";
import { BaseModel } from "../../../_base/crud";

export class SetOffModel extends BaseModel {
	_id: string;
	depositTo: AccountGroupModel;
	glaccount: any;
	// glaccount: string;
	// voucherno: string;
	voucherno: any;
	rate: string; //number
	memo: string; // number
	date: string;
	amount: Number;
	createdBy: User;
	crtdate: string;
	status: boolean;
	payFrom: string;
	multiGLAccount: any;
	data: any;
	isDebit: any;
	totalAll: any;
	printSize: any
	maxField: any;
	totalField: any;
	JS: any;
	multiGLID: any;
	statusAR: any
	payCond: any;
	payDate: any
	ARID: any;
	arSaldoID: any
	totalTagihan: any;
	voucherID: any;
	startDate: any;
	endDate: any;

	// generateFrom:

	clear(): void {
		this._id = undefined;
		this.depositTo = undefined;
		this.glaccount = undefined;
		this.voucherno = "";
		this.rate = "";
		this.memo = "";
		this.date = "";
		this.amount = 0;
		this.createdBy = undefined;
		this.crtdate = "";
		this.status = undefined;
		this.payFrom = undefined;
		this.multiGLAccount = undefined;
		this.isDebit = undefined;
		this.totalAll = undefined;
		this.printSize = undefined;
		this.startDate = undefined;
		this.endDate = undefined;

	}
}
