import {BaseModel} from '../_base/crud';
import {VillageModel} from '../state/village.model';
import { DepartmentModel } from '../masterData/department/department.model';
import { DivisionModel } from '../masterData/division/division.model';
import { ShiftModel } from '../masterData/shift/shift.model';
import { LocationBuildingModel } from '../masterData/locationBuilding/locationBuilding.model';
import { User } from '../auth';

export class EmergencyModel extends BaseModel{
	_id : string;
	// cstrmrcd : string;
	user: any;
	userCollection: String;
	created_date: Date;
	type: String;
	remark: String;
	status: String;
	

	clear(): void{
		this._id = undefined;
		this.user = "";
		this.userCollection = "";
		this.created_date = undefined;
		this.type = "";
		this.remark = "";
		this.status = ""
		
	}
}
