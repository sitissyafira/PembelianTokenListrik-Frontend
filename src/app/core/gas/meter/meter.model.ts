import {BaseModel} from '../../_base/crud';
import {UnitModel} from "../../unit/unit.model";
import {GasRateModel} from "../rate/rate.model";

export class GasMeterModel extends BaseModel{
	_id : string;
	nmmtr : string;
	unt: UnitModel;
	rte: GasRateModel;


	clear(): void{
		this._id = undefined;
		this.nmmtr = "";
		this.unt = undefined;
		this.rte = undefined;
	}
}
