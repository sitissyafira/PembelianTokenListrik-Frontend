import {BaseModel} from '../_base/crud';
import {VillageModel} from '../state/village.model';
import { DepartmentModel } from '../masterData/department/department.model';
import { DivisionModel } from '../masterData/division/division.model';
import { ShiftModel } from '../masterData/shift/shift.model';
import { LocationBuildingModel } from '../masterData/locationBuilding/locationBuilding.model';
import { User } from '../auth';
import { CheckpointModel } from '../masterData/checkpoint/checkpoint.model';
import { TaskManagementMasterModel } from '../taskManagementMaster/taskManagementMaster.model';

export class ManagementTaskModel extends BaseModel{
	_id : string;
	// cstrmrcd : string;
	department: DepartmentModel;
	division: DivisionModel;
	user: any;
	userCollection: String;
	created_date: Date;
	type: String;
	remark: any[];
	status: String;
	checkpoint: CheckpointModel;
	start_time: Date;
	end_time: Date;
	master_ref: TaskManagementMasterModel
	

	clear(): void{
		this._id = undefined;
		this.user = "";
		this.userCollection = "";
		this.created_date = undefined;
		this.type = "";
		this.remark = undefined;
		this.status = "";
		this.checkpoint = undefined;
		this.start_time = undefined;
		this.end_time = undefined;
		this.master_ref = undefined
		
	}
}
