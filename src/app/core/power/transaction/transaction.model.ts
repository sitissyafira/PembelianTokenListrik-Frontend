import { BaseModel } from '../../_base/crud';
import { PowerMeterModel } from '../meter/meter.model';

export class PowerTransactionModel extends BaseModel {
	_id: string;
	pow: PowerMeterModel;
	powname: string;
	strtpos: number;
	endpos: number;
	strtpos2: number;
	endpos2: number;
	billmnt: string;
	loss: number;
	checker: boolean;
	unit: string;
	urlmeter: string;
	consumption: any;

	clear(): void {
		this._id = undefined;
		this.pow = undefined;
		this.powname = "";
		this.strtpos = 0;
		this.endpos = 0;
		this.strtpos2 = 0;
		this.endpos2 = 0;
		this.billmnt = "";
		this.loss = 0;
		this.unit = "";
		this.checker = undefined;
		this.urlmeter = "";
		this.consumption = undefined;
	}
}
