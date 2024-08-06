import { User } from '../../auth';
import { TaxModel } from '../../masterData/tax/tax.model';
import { VendorModel } from '../../masterData/vendor/vendor.model';
import {BaseModel} from '../../_base/crud';
import { PurchaseRequestModel } from '../purchaseRequest/purchaseRequest.model';

export class TabulationModel extends BaseModel{
	_id : string;
	tabulation_no : String;
    date : String;
    select_pr_no : PurchaseRequestModel;
    //select_product : String;
	//select_product : [];
	vendor: [];
	product : any;
    tabulation_subject : String;
    created_by: User;
	qty: any;

	clear(): void{
		this._id = undefined;
		this.tabulation_no = "";
		this.vendor = [];
		this.date = "";
		this.select_pr_no = undefined;
		//this.select_product = "";
		//this.select_product = undefined;
		this.product = undefined;
		this.tabulation_subject = "";
		this.created_by = undefined;
		this.qty = undefined;
	}
}
