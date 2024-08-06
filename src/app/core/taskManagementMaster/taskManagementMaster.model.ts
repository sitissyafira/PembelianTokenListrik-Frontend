import {BaseModel} from '../_base/crud';
import {VillageModel} from '../state/village.model';
import { DepartmentModel } from '../masterData/department/department.model';
import { DivisionModel } from '../masterData/division/division.model';
import { ShiftModel } from '../masterData/shift/shift.model';
import { LocationBuildingModel } from '../masterData/locationBuilding/locationBuilding.model';
import { User } from '../auth';
import { CheckpointModel } from '../masterData/checkpoint/checkpoint.model';
import { InternalUserModel } from '../internalUser/internalUser.model';
import { ExternalUserModel } from '../externalUser/externalUser.model';
import { EngineerModel } from '../engineer/engineer.model';

export class TaskManagementMasterModel extends BaseModel{
	_id : string;
	// cstrmrcd : string;
	department: DepartmentModel;
	division: DivisionModel;
	user: (InternalUserModel | ExternalUserModel | EngineerModel);
	created_date: Date;
	start_date: Date;
	start_time: String;
	end_time: String;
	repeat: Number;
	status: String;
	remark: any[];
	task_desc: String;
	checkpoint: CheckpointModel;
	selectedDays: Number[];

	clear(): void{
		this._id = undefined;
		this.department = undefined;
		this.division = undefined;
		this.created_date = undefined;
		this.repeat = undefined;
		this.remark = undefined;
		this.status = ""
		this.selectedDays = []
		this.user = undefined
		
	}
}
