import { PowerRateModel } from '../../../../core/power/rate/rate.model';
import { User } from '../../../auth';
import {BaseModel} from '../../../_base/crud';
import { ComUnitModel } from '../comUnit/comUnit.model';

export class ComPowerModel extends BaseModel{
	_id : string;

	nmmtr : String;
    unitCommersil : ComUnitModel
    unitCode : String
    rte : PowerRateModel
	remark : String;

	created_by: User
    created_date: string;

	clear(): void{
		this._id = undefined;

		this.nmmtr = "";
		this.unitCommersil = undefined;
		this.unitCode = "";
		this.rte = undefined;
		this.remark = "";

		this.created_by = undefined;
		this.created_date = "";
	}
}
