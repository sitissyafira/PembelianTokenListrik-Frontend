import {BaseModel} from '../_base/crud';
import {VillageModel} from '../state/village.model';
import { DepartmentModel } from '../masterData/department/department.model';
import { DivisionModel } from '../masterData/division/division.model';
import { ShiftModel } from '../masterData/shift/shift.model';
import { LocationBuildingModel } from '../masterData/locationBuilding/locationBuilding.model';
import { User } from '../auth';

export class InspeksiModel extends BaseModel{
	_id : string;
	// cstrmrcd : string;
	user: any;
	userCollection: String;
	created_date: Date;
	remark: String;
	attachment: String;

	clear(): void{
		this._id = undefined;
		this.user = "";
		this.userCollection = "";
		this.created_date = undefined;
		this.remark = ""
		this.attachment = ""
		
	}
}
