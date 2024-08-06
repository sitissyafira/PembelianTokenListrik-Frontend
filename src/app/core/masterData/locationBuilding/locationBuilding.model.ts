import { User } from '../../auth';
import {BaseModel} from '../../_base/crud';
import { DepartmentModel } from '../department/department.model';

export class LocationBuildingModel extends BaseModel{
	_id : string;
	name: String;
	address: String;
	latitude: Number;
	longitude: Number;
	radius: Number;
	status: Boolean;
    created_by: User;
	created_date: Date;
	location: String;
	

	clear(): void{
		this._id = undefined;
		this.name = "";
		this.address = "";
		this.latitude = undefined;
		this.longitude = undefined;
		this.radius = undefined;
		this.status = undefined;
		this.created_by = undefined;
		this.created_date = undefined;
		this.location = ""
	}
}
