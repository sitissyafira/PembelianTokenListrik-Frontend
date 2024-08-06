import {BaseModel} from '../_base/crud';

export class UnitTypeModel extends BaseModel{
	_id : string;
	unttp : string;
	untsqr : number;
	// untlen : number;
	// untwid : number;
	data: any;

	clear(): void{
		this._id = undefined;
		this.unttp = "";
		this.untsqr = 0;
		// this.untlen = 0;
		// this.untwid = 0;
		this.data = undefined;
	}
}
