import {BaseModel} from '../../_base/crud';
import {UnitModel} from "../../unit/unit.model";
import {PowerRateModel} from "../rate/rate.model";

export class PowerMeterModel extends BaseModel{
	_id : string;
	nmmtr : string;
	unt: UnitModel;
	unit : string;
	rte: PowerRateModel;


	clear(): void{
		this._id = undefined;
		this.nmmtr = "";
		this.unit = "";
		this.unt = undefined;
		this.rte = undefined;
	}
}
