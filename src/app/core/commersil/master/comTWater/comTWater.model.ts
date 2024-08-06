import { User } from '../../../auth';
import {BaseModel} from '../../../_base/crud';
import { ComWaterModel } from '../comWater/comWater.model';

export class ComTWaterModel extends BaseModel{
	_id : string;
    wat: ComWaterModel
    watname: String;
    unit: String;
    strtpos: String;
    endpos: String;
    strtpos2: String;
    endpos2: String;
    waterManagement: String;
    date : string;
	isPosting : boolean

	
	created_by: User
    created_date: string;

	clear(): void{
		this._id = undefined;
		this.date = "";
		this.wat = undefined;
		this.watname = "";
		this.unit = "";
		this.strtpos = "";
		this.endpos = "";
		this.strtpos2 = "";
		this.endpos2 = "";
		this.isPosting = undefined
		this.waterManagement = "";

		this.created_by = undefined;
		this.created_date = "";
	}
}
