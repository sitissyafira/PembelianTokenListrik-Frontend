import { User } from '../../auth';
import {BaseModel} from '../../_base/crud';

export class CurrencyModel extends BaseModel{
	_id : string;
	currency : String;
    region : String;
    value : String;
    created_by: User


	clear(): void{
		this._id = undefined;
		this.currency = "";
		this.region = "";
		this.value = "";
		this.created_by = undefined;
	}
}
