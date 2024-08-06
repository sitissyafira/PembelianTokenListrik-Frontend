import { BaseModel } from '../_base/crud';
import { FloorModel } from '../floor/floor.model';
import { UnitTypeModel } from '../unittype/unittype.model';
import { UnitRateModel } from '../unitrate/unitrate.model';
import { PowerMeterModel } from '../power/meter/meter.model';
import { WaterMeterModel } from '../water/meter/meter.model';

export class UnitModel extends BaseModel {
	_id: string;
	cdunt: string;
	nmunt: string;
	untnum: string;
	unttp: UnitTypeModel;
	untrt: UnitRateModel;
	type: string;
	pwrmtr: PowerMeterModel;
	wtrmtr: WaterMeterModel;
	untsqr: number;
	flr: FloorModel;
	sinkingfund: number;
	srvcrate: number;
	ovstyrate: number;
	price: number;
	rentalPrice: number;
	crtdate: string;
	upddate: string;
	isChild: boolean;
	isSewa: boolean;
	periodeBill: string

	clear(): void {
		this._id = undefined;
		this.nmunt = "";
		this.type = "";
		this.pwrmtr = undefined;
		this.wtrmtr = undefined;
		this.cdunt = "";
		this.untnum = "";
		this.unttp = undefined;
		this.untrt = undefined;
		this.untsqr = 0;
		this.flr = undefined;
		this.srvcrate = 0;
		this.ovstyrate = 0;
		this.sinkingfund = 0;
		this.price = 0;
		this.rentalPrice = 0;
		this.crtdate = "";
		this.upddate = "";
		this.isChild = false;
		this.isSewa = false;
		this.periodeBill = undefined
	}
}
