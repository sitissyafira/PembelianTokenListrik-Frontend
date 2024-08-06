import { User } from '../../auth';
import {BaseModel} from '../../_base/crud';

export class DepartmentModel extends BaseModel{
	_id : string;
	department_id : String;
    department_name : String;
    description : String;
    created_by: User
	
	clear(): void{
		this._id = undefined;
		this.department_id = "";
		this.department_name = "";
		this.description = "";
		this.created_by = undefined;
	}
}
