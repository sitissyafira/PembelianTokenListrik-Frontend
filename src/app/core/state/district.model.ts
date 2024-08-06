import {BaseModel} from '../_base/crud';
import {RegencyModel} from './regency.model';

export class DistrictModel extends BaseModel{
	_id : string;
	code : string;
	regency_code: string;
	regency: RegencyModel;
	name: string;

	clear(): void{
		this._id = undefined;
		this.code = "";
		this.regency_code = "";
		this.regency = undefined;
		this.name = "";
	}
}
