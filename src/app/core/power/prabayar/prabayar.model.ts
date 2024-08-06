import {BaseModel} from '../../_base/crud';

export class PowerPrabayarModel extends BaseModel{
	_id : string;
	name : string;
	rate: number;
	adminRate : number;
	status : string;


	clear(): void{
		this._id = undefined;
		this.name = "";
		this.rate = 0;
		this.adminRate = 0;
		this.status = "";

	}
}
