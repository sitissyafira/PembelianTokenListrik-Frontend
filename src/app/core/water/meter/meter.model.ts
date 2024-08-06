import {BaseModel} from '../../_base/crud';
import {UnitModel} from "../../unit/unit.model";
import {WaterRateModel} from "../rate/rate.model";

export class WaterMeterModel extends BaseModel{
	_id : string;
	nmmtr : string;
	unt: UnitModel;
	rte: WaterRateModel;
	unit : string;

	clear(): void{
		this._id = undefined;
		this.nmmtr = "";
		this.unit = "";
		this.unt = undefined;
		this.rte = undefined;
	}
}
