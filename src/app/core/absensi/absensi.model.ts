import {BaseModel} from '../_base/crud';
import {VillageModel} from '../state/village.model';
import { DepartmentModel } from '../masterData/department/department.model';
import { DivisionModel } from '../masterData/division/division.model';
import { ShiftModel } from '../masterData/shift/shift.model';
import { LocationBuildingModel } from '../masterData/locationBuilding/locationBuilding.model';
import { User } from '../auth';

export class AbsensiModel extends BaseModel{
	_id : string;
	// cstrmrcd : string;
	user: any;
	userCollection: String;
	date: Date;
	type: String;
	clockIn: Date;
	clockOut: Date;
	location: LocationBuildingModel;
	location_in: String;
	location_out: String;
	shift: ShiftModel;
	attachment: String[];
	isClosed: Boolean;

	clear(): void{
		this._id = undefined;
		this.user = "";
		this.userCollection = "";
		this.date = undefined;
		this.type = "";
		this.clockIn = undefined;
		this.clockOut = undefined;
		this.location = undefined;
		this.location_in = undefined;
		this.location_out = undefined;
		this.shift = undefined;
		this.attachment = undefined;
		this.isClosed = undefined;
		
	}
}
