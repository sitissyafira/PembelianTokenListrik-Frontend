import { User } from "../../../auth";
import { BaseModel } from "../../../_base/crud";
import { ComUnitModel } from "../comUnit/comUnit.model";

export class BillComModel extends BaseModel {
	_id: string;

	billing_number: String;
	unit: ComUnitModel;
	unitType: String;
	unit2: String;
	billing: Object;
	power: any;
	water: any;
	ipl: any;
	billed_to: String;
	totalBilling: String;
	billing_date: String;
	due_date: String;
	desc: String;
	isPaid: boolean;
	created_by: User;
	created_date: string;
	admBank: number;
	abodemen: number;

	clear(): void {
		this._id = undefined;
		this.billing_number = "";
		this.unit = undefined;
		this.unit2 = "";
		this.unitType = "";
		this.billing = undefined;
		this.power = undefined;
		this.water = undefined;
		this.ipl = undefined;
		this.billed_to = "";
		this.totalBilling = "";
		this.billing_date = "";
		this.due_date = "";
		this.desc = "";
		this.isPaid = false;
		this.created_by = undefined;
		this.created_date = "";
		this.admBank = undefined;
		this.abodemen = undefined;
	}
}
