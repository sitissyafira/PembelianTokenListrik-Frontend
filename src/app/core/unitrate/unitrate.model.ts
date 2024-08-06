import {BaseModel} from '../_base/crud';

export class UnitRateModel extends BaseModel{
	_id : string;
	unit_rate_name : string
	service_rate : number;
	sinking_fund : number;
	overstay_rate : number;
	rentPrice : number;
	isRent : boolean
	data: any;

	clear(): void{
		this._id = undefined;
		this.unit_rate_name = "";
		this.service_rate = 0;
		this.sinking_fund = 0;
		this.overstay_rate = 0;
		this.rentPrice = 0;
		this.isRent = undefined;
		this.data = undefined;
	}
}
