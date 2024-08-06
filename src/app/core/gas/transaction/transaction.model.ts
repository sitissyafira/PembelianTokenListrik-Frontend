import {BaseModel} from '../../_base/crud';
import {GasMeterModel} from '../meter/meter.model';

export class GasTransactionModel extends BaseModel{
	_id : string;
	gas : GasMeterModel;
	strtpos : number;
	endpos : number;
	billmnt : string;
	billamnt : number;
	checker : boolean;


	
	clear(): void{
		this._id = undefined;
		this.gas = undefined;
		this.strtpos = 0;
		this.endpos = 0;
		this.billmnt = "";
		this.billamnt = 0;
		this.checker = undefined;
	}
}
