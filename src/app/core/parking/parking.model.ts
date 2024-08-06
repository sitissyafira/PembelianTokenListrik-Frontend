import {BaseModel} from '../_base/crud';
import { UnitModel } from '../unit/unit.model';
import { CustomerModel } from '../customer/customer.model';
import { VehicleTypeModel } from '../vehicletype/vehicletype.model';
import { BlockModel } from '../block/block.model';

export class ParkingModel extends BaseModel{
	_id : string;
	nmplot: string;
    vehnum: string
    vehicle: VehicleTypeModel
	vehtype : string;
    vehrate: string;
    block: BlockModel;
    space: string
    avaliablespace: string
    unit: UnitModel
	createdBy: string;


	clear(): void{
		this._id = undefined;
		this.vehicle = undefined;
		this.block = undefined;
		this.unit = undefined;
		this.nmplot = "";
		this.vehnum = "";
		this.vehtype = "";
		this.vehrate = "";
		this.space = "";
		this. avaliablespace = "";
		this.createdBy = localStorage.getItem("user");
	}
}
