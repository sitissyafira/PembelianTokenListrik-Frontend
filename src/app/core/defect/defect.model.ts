import {BaseModel} from '../_base/crud';
import { CategoryModel } from '../category/category.model';



export class DefectModel extends BaseModel{
	_id : string;
	defectid : string;
	category : CategoryModel;
	// id_category: string;
	// name : string;
	defect_name : string;
	createdBy: string;

	clear(): void{
		this._id = undefined;
		this.defectid = "";
		this.category = undefined;
		// this.id_category = "";
		// this.name ="";
		this.defect_name="";
		this.createdBy = localStorage.getItem("user");
	}
}
