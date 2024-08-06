import { User } from '../auth';
import { OwnershipContractModel } from '../contract/ownership/ownership.model';
import { CustomerModel } from '../customer/customer.model';
import { UnitModel } from '../unit/unit.model';
import {BaseModel} from '../_base/crud';


export class RequestInvoiceModel extends BaseModel{
	_id : string;
	request_no: string;
    contract : OwnershipContractModel
    tenant: CustomerModel;
    name: string;
    type_deposit: string;
    desc: string;
    status: string;
    unit: UnitModel;

	
    created_by: User
	created_date : string;

	clear(): void{
		this._id = undefined;
		this.request_no = "";
		this.contract = undefined;
		this.tenant = undefined;
		this.unit = undefined;
		this.name = "";
		this.type_deposit = "";
		this.desc = "";
		this.status = "";
		
		this.created_by = undefined;
		this.created_date ="";
	}
}
