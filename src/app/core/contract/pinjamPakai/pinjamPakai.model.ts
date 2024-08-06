import { UnitModel } from '../../unit/unit.model';
import {BaseModel} from '../../_base/crud';
import { OwnershipContractModel } from '../ownership/ownership.model';



export class PinjamPakaiModel extends BaseModel{
	_id : string;
	owner : OwnershipContractModel;
	unit : UnitModel;
	desc : string;
	createdDate : string;
	paidDate: string;
	unit2 : string;
	
	isPaid : boolean;
	closeDate : string;
    closeDescription : string;




	clear(): void{
		this._id = undefined;
		this.owner = undefined;
		this.unit = undefined;
		this.isPaid = undefined;
		this.unit2 = "";
		this.createdDate = "";
		this.desc = "";

		this.closeDate = "";
		this.closeDescription = "";


	}
}
