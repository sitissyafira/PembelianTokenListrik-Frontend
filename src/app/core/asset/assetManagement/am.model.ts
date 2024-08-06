import { FixedModel } from '../../masterData/asset/fixed/fixed.model';
import { UomModel } from '../../masterData/asset/uom/uom.model';
import {BaseModel} from '../../_base/crud';



export class AmModel extends BaseModel{
	_id : string;
	assetCode: string;
	assetType: FixedModel;
	assetName: string;
	description: string;
	qty: string; //number, true
	status : string;
	location: string;
	uom: UomModel; 
	purchasePrice: string; //number
	


	createdDate: string;
	updateBy: string;
	updateDate: string;
	createdBy: string;




	clear(): void{
		this._id = undefined;
		this.assetCode = "";
		this.assetType = undefined;
		this.assetName = "";
		this.description = "";
		this.qty = "";
		this.status = "";
		this.location = "";
		this.uom = undefined;
		this.purchasePrice ="";

		this.createdBy = localStorage.getItem("user");
	}
}
