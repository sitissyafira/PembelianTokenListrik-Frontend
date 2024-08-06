import {BaseModel} from '../_base/crud';
import { UnitModel } from '../unit/unit.model';
import { CustomerModel } from '../customer/customer.model';
import { VehicleTypeModel } from '../vehicletype/vehicletype.model';
import { BlockModel } from '../block/block.model';
import { OwnershipContractModel } from '../contract/ownership/ownership.model';



export class AddparkModel extends BaseModel{
	_id : string;
	codeAddParkLot : string;
	contract : OwnershipContractModel
	unit : UnitModel;
	unit2 : string;
	customer: string;
	vehicle: VehicleTypeModel;
	vehicleNum: string;
	avaliablespace : number;
	blockPark: BlockModel;
	space: number;
	status : string;
	parkingRate: string;
	type : string;
	avaliable : number
	createdBy : string;

	clear(): void{
		this._id = undefined;
		this.codeAddParkLot = "";
		this.contract = undefined;
		this.unit = undefined;
		this.unit2 = "";
		this.customer = "";
		this.vehicle = undefined;
		this.vehicleNum ="";
		this.avaliablespace = 0;
		this.avaliable = 0;
		this.blockPark = undefined;
		this.status = "";
		this.type = "";
		this.space = 0;
		this.parkingRate = "";
		this.createdBy = localStorage.getItem("user");

	}
}
