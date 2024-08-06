import { User } from '../../../auth';
import {BaseModel} from '../../../_base/crud';
import { ComCustomerModel } from '../comCustomer/comCustomer.model';
import { ComTypeModel } from '../comType/comType.model';

export class ComUnitModel extends BaseModel{
	_id : string;

	cdunt : String
    nmunt : String
	type : String
    unitType : ComTypeModel
    customer : ComCustomerModel
    untsqr: string;
	description : string;
	created_by: User
    created_date: string;

	clear(): void{
		this._id = undefined;
		this.cdunt = "";
		this.nmunt = "";
		this.type ="";
		this.unitType = undefined;
		this.customer = undefined;
		this.untsqr = "";
		this.description = "";
		this.created_by = undefined;
		this.created_date = "";
	}
}
