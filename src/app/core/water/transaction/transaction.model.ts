import {BaseModel} from '../../_base/crud';
import {WaterMeterModel} from '../meter/meter.model';

export class WaterTransactionModel extends BaseModel{
	_id : string;
	wat : WaterMeterModel;
	watname : string;
	strtpos : number;
	strtpos2 : number;
	unit : string;
	endpos : number;
	endpos2 : number;
	billmnt : string;
	air_kotor: number;
	checker : boolean;
	urlmeter : string;

	clear(): void{
		this._id = undefined;
		this.wat = undefined;
		this.watname = "";
		this.strtpos = 0;
		this.strtpos2 = 0;
		this.endpos = 0;
		this.unit = "";
		this.endpos2 = 0;
		this.billmnt = "";
		this.air_kotor = 0;
		this.checker = undefined;
		this.urlmeter = "";
	}
}
