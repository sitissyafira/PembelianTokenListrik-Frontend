import {BaseModel} from '../_base/crud';

export class ProvinceModel extends BaseModel{
	_id : string;
	code : string;
	name: string;

	clear(): void{
		this._id = undefined;
		this.code = "";
		this.name = "";
	}
}
