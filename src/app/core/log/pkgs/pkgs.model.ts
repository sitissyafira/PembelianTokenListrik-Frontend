import { User } from '../../auth';
import { OwnershipContractModel } from '../../contract/ownership/ownership.model';
import { UnitModel } from '../../unit/unit.model';
import {BaseModel} from '../../_base/crud';



export class PkgsModel extends BaseModel{
	_id : string;
	contract: OwnershipContractModel;
	contract_name: string;
	unit: UnitModel;
	deliver_date: string;
	confirmed_date: string;
	package_from: string;
	received_by: string;
	created_by: User;
	created_date: string;
	updated_by: User
	updated_date: string;
	isDelete: boolean;
	package_status: string;
	receipent_name : string;
	cdunt : string;
	remarks : string;
	
	isTenant : boolean;
	pic_number: string;
	description : string;


    //'in', 'out', 'confirmed', 'confirmed by system'],
		

	clear(): void{
		this._id = undefined;
		this.contract = undefined;
		this.contract_name = "";
		this.unit = undefined;
		this.deliver_date = "";
		this.confirmed_date = "";
		this.package_from = "";
		this.received_by = "";
		this.receipent_name = "";
		this.created_by = undefined;
		this.created_date ="";
		this.updated_by = undefined;
		this.updated_date = "";
		this.isDelete = undefined;
		this.package_status = "";
		this.cdunt = "";
		this.remarks = "";

		this.isTenant = undefined;
		this.pic_number = "";
		this.description= "";

	}
}
