import { User } from '../../auth';
import { TaxModel } from '../../masterData/tax/tax.model';
import {BaseModel} from '../../_base/crud';

export class PurchaseRequestModel extends BaseModel{
	_id : string;
	purchase_request_no : String;
    request_date : String;
    estimated_date : String;
    product_name : [];
   	description : String;
    status : boolean;
	type_discount: string;
	type: string;
	subTotal: string;
	isApproved: boolean;
	grandTotal: string;
	tax: TaxModel;
	discount: string;
    created_by: User

	clear(): void{
		this._id = undefined;
		this.purchase_request_no = "";
		this.request_date = "";
		this.estimated_date = "";
		this.product_name = undefined;
		this.description = "";
		this.type_discount = "";
		this.type = "";
		this.subTotal = "";
		this.isApproved = false;
		this.grandTotal = "";
		this.tax = undefined;
		this.discount = "";
		this.status = false;
		this.created_by = undefined;
	}
}
