import {BaseModel} from '../../../_base/crud';



export class UomModel extends BaseModel{
	_id : string;
	uom: string;
	remarks: string;
	createdBy: string;




	clear(): void{
		this._id = undefined;
		this.uom = "";
		this.remarks = "";
		this.createdBy = localStorage.getItem("user");
	}
}
