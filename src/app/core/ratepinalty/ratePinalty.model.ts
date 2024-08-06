import {BaseModel} from '../_base/crud';



export class RatePinaltyModel extends BaseModel{
	_id : string;
	rateName : string;
	rate : string;
	periode :string;
	remarks: string;
	createdBy: string;




	clear(): void{
		this._id = undefined;
		this.rateName = "";
		this.rate = "";
		this.periode = "";
		this.remarks = "";
		this.createdBy = localStorage.getItem("user");
	}
}
