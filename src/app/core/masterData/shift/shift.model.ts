import {BaseModel} from '../../_base/crud';
import {VillageModel} from '../../state/village.model';
import { DepartmentModel } from '../department/department.model';
import { DivisionModel } from '../division/division.model';

export class ShiftModel extends BaseModel{
	_id : string;
	// cstrmrcd : string;
	name: String;
	status: Boolean;
	start_schedule: String;
	end_schedule: String;
	department: DepartmentModel;
	division: DivisionModel;

	clear(): void{
		this._id = undefined;
		// this.cstrmrcd = "";
		this.name = "";
		this.status = undefined;
		this.start_schedule = "";
		this.end_schedule = "";
		this.department = undefined;
		this.division = undefined;		
	}
}
