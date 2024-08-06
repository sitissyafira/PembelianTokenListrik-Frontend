import { User } from '../../auth';
import { OwnershipContractModel } from '../../contract/ownership/ownership.model';
import { UnitModel } from '../../unit/unit.model';
import {BaseModel} from '../../_base/crud';



export class LogFinanceModel extends BaseModel{
	_id : string;
	menu: string;
    status: string;
    service: string;
    data: [];
    year: string;

    //'in', 'out', 'confirmed', 'confirmed by system'],
	clear(): void{
		this._id = undefined;
		this.menu = "";
		this.status ="";
		this.service = "";
		this.data = undefined;
		this.year = "";
	}
}
