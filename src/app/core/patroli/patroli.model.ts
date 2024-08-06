import {BaseModel} from '../_base/crud';
import {VillageModel} from '../state/village.model';
import { DepartmentModel } from '../masterData/department/department.model';
import { DivisionModel } from '../masterData/division/division.model';
import { ShiftModel } from '../masterData/shift/shift.model';
import { LocationBuildingModel } from '../masterData/locationBuilding/locationBuilding.model';
import { User } from '../auth';
import { CheckpointModel } from '../masterData/checkpoint/checkpoint.model';

export class PatroliModel extends BaseModel{
	_id : string;
	// cstrmrcd : string;
	user: any;
	userCollection: String;
	created_date: Date;
	remark: String;
	checkpoint: CheckpointModel;
	attachment: String[];

	clear(): void{
		this._id = undefined;
		this.user = "";
		this.userCollection = "";
		this.created_date = undefined;
		
		this.attachment = undefined;
		this.checkpoint = undefined;
		
	}
}
