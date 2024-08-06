import {BaseModel} from '../_base/crud';
import { DefectModel } from '../defect/defect.model';
import { CategoryModel } from '../category/category.model';

export class SubdefectModel extends BaseModel{
	_id : string;
	subdefectid: string;
    subtype: string;
    defect: DefectModel;
    category: CategoryModel;
    priority: string;
    createdBy: string;

	clear(): void{
		this._id = undefined;
		this.category = undefined;
		this.defect = undefined;
		this.subdefectid = "";
		this.subtype = "";
		this.priority = "";
		this.createdBy = localStorage.getItem("user");
	}
}
