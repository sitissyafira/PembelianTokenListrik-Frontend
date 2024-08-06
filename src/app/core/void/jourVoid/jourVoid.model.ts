import { BaseModel } from '../../_base/crud';
import { UnitModel } from '../../unit/unit.model';
import { OwnershipContractModel } from '../../contract/ownership/ownership.model';

export class JourVoidModel extends BaseModel {
	_id: string;
	jourVoidno: string;
	custname: string;
	unit2: string;
	unittype: string;
	address: string;
	unit: string;
	contract: OwnershipContractModel;
	desc: string;
	jourVoiddte: string;
	jourVoiddteout: string;
	total: number;
	admin: number;
	amount: number;
	request: any;
	deposittype: string;
	typerate: string;
	crtdate: string;
	upddate: string;
	isclosed: boolean;



	clear(): void {
		this._id = undefined;
		this.jourVoidno = "";
		this.custname = "";
		this.unit2 = "";
		this.unittype = "";
		this.address = "";
		this.unit = undefined
		this.contract = undefined;
		this.desc = "";
		this.jourVoiddte = "";
		this.jourVoiddteout = "";
		this.request = undefined;
		this.total = 0;
		this.admin = 0;
		this.amount = 0;
		this.deposittype = "";
		this.typerate = "";
		this.isclosed = undefined;
		this.crtdate = "";
		this.upddate = "";
	}
}
