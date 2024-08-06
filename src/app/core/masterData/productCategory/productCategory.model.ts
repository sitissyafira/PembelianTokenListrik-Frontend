import { User } from '../../auth';
import {BaseModel} from '../../_base/crud';

export class ProductCategoryModel extends BaseModel{
	_id : string;
	category_code: String;
    category_name: String;
    description:  String;
	isDelete : boolean
    createdBy: User

	clear(): void{
		this._id = undefined;
		this.category_code = "";
		this.category_name = "";
		this.description = "";
		this.isDelete = undefined;
		this.createdBy = undefined;
	}
}
