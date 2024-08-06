import {BaseModel} from '../_base/crud';
import {ProvinceModel} from './province.model';

export class RegencyModel extends BaseModel{
	_id : string;
	code : string;
	province_code : string;
	province: ProvinceModel;
	name: string;

	clear(): void{
		this._id = undefined;
		this.code = "";
		this.province_code = "";
		this.province = undefined;
		this.name = "";
	}
}
