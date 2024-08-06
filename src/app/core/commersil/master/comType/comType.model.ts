import { User } from '../../../auth';
import {BaseModel} from '../../../_base/crud';

export class ComTypeModel extends BaseModel{
	_id : string;

	unitTypeMaster : string
	unitType: string
    unitPrice: string
	description: string
	service_rate : string
    sinking_fund : string
	created_by: User
    created_date: string;

	clear(): void{
		this._id = undefined;
		this.unitTypeMaster = "";
		this.unitType = "";
		this.unitPrice = "";
		this.description = "";
		this.service_rate ="";
		this.sinking_fund = "";
		this.created_by = undefined;
		this.created_date = "";
	}
}
