import {BaseModel} from '../../../_base/crud';



export class FiscalModel extends BaseModel{
	_id : string;
	fiscalName : string;
    description : string;
	createdBy: string;
	updatedBy : string;

	clear(): void{
		this._id = undefined;
		this.fiscalName = "";
		this.description = "";
		this.createdBy = localStorage.getItem("user");
		this.updatedBy = localStorage.getItem("user");
	}
}
