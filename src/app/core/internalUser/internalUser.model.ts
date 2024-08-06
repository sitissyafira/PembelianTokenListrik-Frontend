import {BaseModel} from '../_base/crud';
import {VillageModel} from '../state/village.model';
import { DepartmentModel } from '../masterData/department/department.model';
import { DivisionModel } from '../masterData/division/division.model';
import { ShiftModel } from '../masterData/shift/shift.model';
import { LocationBuildingModel } from '../masterData/locationBuilding/locationBuilding.model';
import { User } from '../auth';

export class InternalUserModel extends BaseModel{
	_id : string;
	// cstrmrcd : string;
	name: String;
	email: String;
	phone: String;
	department: DepartmentModel;
	division: DivisionModel;
	location: LocationBuildingModel;
	shift: ShiftModel;
	created_by: User
	created_date: Date;
	attachment: String;
	birth_date: Date;
	join_date: Date;

	clear(): void{
		this._id = undefined;
		// this.cstrmrcd = "";
		this.name = "";
		this.email = "";
		this.phone = "";
		this.birth_date = undefined;
		this.join_date = undefined;
		this.department = undefined;
		this.division = undefined;
		this.location = undefined;
		this.shift = undefined;
		this.created_by = undefined;
		this.created_date = undefined;
		
	}
}
