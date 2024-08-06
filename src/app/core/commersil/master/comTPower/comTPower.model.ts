import { User } from '../../../auth';
import {BaseModel} from '../../../_base/crud';
import { ComPowerModel } from '../comPower/comPower.model';

export class ComTPowerModel extends BaseModel{
	_id : string;
    pow: ComPowerModel
    powname: String;
    unit: String;
    strtpos: String;
    endpos: String;
    strtpos2: String;
    endpos2: String;
    loss: String;
    date : string;
	isPosting : boolean

	
	created_by: User
    created_date: string;

	clear(): void{
		this._id = undefined;
		this.date = "";
		this.pow = undefined;
		this.powname = "";
		this.unit = "";
		this.strtpos = "";
		this.endpos = "";
		this.strtpos2 = "";
		this.endpos2 = "";
		this.isPosting = undefined

		this.created_by = undefined;
		this.created_date = "";
	}
}
