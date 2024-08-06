import {BaseModel} from '../_base/crud';

export class CategoryModel extends BaseModel{
	_id : string;
	categoryid : string;
	name :string;
	createdBy: string;

	clear(): void{
		this._id = undefined;
		this.categoryid = "";
		this.name = "";
		this.createdBy = localStorage.getItem("user");
	}
}
