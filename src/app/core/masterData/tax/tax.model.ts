import { User } from '../../auth';
import {BaseModel} from '../../_base/crud';

export class TaxModel extends BaseModel{
	_id : string;
	tax_code : String;
    tax_name : String;
    nominal : String;
    remarks : String;
    created_by: User;
	isActive: any

	clear(): void{
		this._id = undefined;
		this.tax_code = "";
		this.tax_name = "";
		this.nominal = "";
		this.remarks = "";
		this.created_by = undefined;
	}
}
