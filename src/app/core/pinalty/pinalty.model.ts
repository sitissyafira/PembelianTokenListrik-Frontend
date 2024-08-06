import { BillingModel } from '../billing/billing.model';
import {BaseModel} from '../_base/crud';

export class PinaltyModel extends BaseModel{
	_id : string;
	billing: BillingModel
    unit2: string;
    days: number;
    totalDenda: number;

	clear(): void{
		this._id = undefined;
		this.billing = undefined;
		this.unit2 = "";
		this.days = 0;
		this.totalDenda = 0;
	}
}
