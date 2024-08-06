import { User } from '../../auth';
import {BaseModel} from '../../_base/crud';
import { DepartmentModel } from '../department/department.model';

export class DivisionModel extends BaseModel{
	_id : string;
	division_code : String;
    division_name : String;
    department : DepartmentModel;
    description : String;
    created_by: User
	

	clear(): void{
		this._id = undefined;
		this.division_code = "";
		this.division_name = "";
		this.department = undefined;
		this.description = "";
		this.created_by = undefined;
	}
}
