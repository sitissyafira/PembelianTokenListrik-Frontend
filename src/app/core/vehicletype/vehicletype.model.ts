import {BaseModel} from '../_base/crud';

export class VehicleTypeModel extends BaseModel{
	_id : string;
	nmvhtp : string;
	vhttype : string;
	vhtprate : number;

	clear(): void{
		this._id = undefined;
		this.nmvhtp = "";
		this.vhttype ="";
		this.vhtprate = 0;
	}
}
