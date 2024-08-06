import { User } from '../auth/_models/user.model';
import {BaseModel} from '../_base/crud';



export class LogactionModel extends BaseModel{
	_id : string;
	log_date : Date;
	log_number : string;
	log_category : string;
	log_task : string;
	log_status : string;
	log_before : object;
	log_after : object;
	updated_by : User;

	clear(): void{
		this._id = undefined;
		this.log_number = "";
		this.log_category = "";
		this.log_task = "";
		this.log_status = "";
		this.log_before = undefined;
		this.log_after = undefined;
	}
}
