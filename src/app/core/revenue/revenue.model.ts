import {BaseModel} from '../_base/crud';



export class RevenueModel extends BaseModel{
	_id : string;
	revenueName : string;
	serviceFee : string;
	administration : string;
	remarks : string;
	createdDate : string
	updatedBy : string;
	updatedDate : string;
	createdBy: string;

	clear(): void{
		this._id = undefined;
		this.revenueName = "";
		this.serviceFee = "";
		this.administration = "";
		this.remarks = "";
		
		this.createdBy = localStorage.getItem("user");
	}
}
