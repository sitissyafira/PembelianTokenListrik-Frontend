import { User } from '../../../auth';
import { BaseModel } from '../../../_base/crud';

export class ComCustomerModel extends BaseModel {
	_id: string;

	nameDagang: string;
	namaToko: string;
	name: string;
	npwp: string;
	address: string;
	phone: string;
	email: string;
	bankname: string;
	bankaccnt: string;
	description: String;
	created_by: User
	created_date: string;
	va_ipl: Number
	va_water: Number
	va_power: Number
	va_utility: Number
	va_gas: Number
	va_parking: Number
	cstmrId: string
	cstmr: string
	isToken: boolean
	isTenant: boolean
	data: any

	clear(): void {
		this._id = undefined;
		this.nameDagang = "";
		this.namaToko = "";
		this.name = "";
		this.npwp = "";
		this.address = "";
		this.phone = "";
		this.email = "";
		this.bankname = "";
		this.bankaccnt = "";
		this.description = "";
		this.created_by = undefined;
		this.created_date = "";
		this.va_ipl = undefined
		this.va_water = undefined
		this.va_power = undefined
		this.va_utility = undefined
		this.va_gas = undefined
		this.va_parking = undefined
		this.cstmrId = undefined
		this.cstmr = undefined
		this.isToken = undefined
		this.isTenant = undefined
	}
}
