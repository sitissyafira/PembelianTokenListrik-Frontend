import { BaseModel } from '../_base/crud';
import { AccountTypeModel } from '../accountType/accountType.model';

export class billingNotifModel extends BaseModel {
	_id: string;
	noId: string;
	type_notif:string;
	title: string;
	description: string;
	created_date: string;
	number_of_unit: number;
	number_of_sent: number;
	status : string;
	start_period: string;
	end_period : string;
	units:any;
	

	clear(): void {
		this._id = undefined;
		this.noId = "";
		this.units = [];
		this.type_notif = undefined;
		this.title = undefined;
		this.description = undefined;
		this.created_date = undefined;
		this.number_of_unit = 0;
		this.number_of_sent = 0;
		this.status = undefined;
		this.start_period = undefined;
		this.end_period = undefined
	}
}
