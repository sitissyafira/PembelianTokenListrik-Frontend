import {BaseModel} from '../_base/crud';
import {DistrictModel} from './district.model';

export class VillageModel extends BaseModel{
	_id : string;
	code : string;
	district_code: string;
	district: DistrictModel;
	name: string;

	clear(): void{
		this._id = undefined;
		this.code = "";
		this.district_code = "";
		this.district = undefined;
		this.name = "";
	}
}
