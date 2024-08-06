import { User } from '../../auth';
import {BaseModel} from '../../_base/crud';

export class VndrCategoryModel extends BaseModel{
	_id : string;
	category_name: String;
	description: String;
    created_by: User

	clear(): void{
		this._id = undefined;
		this.category_name = "";
		this.description = "";
		this.created_by = undefined;
	}
}
