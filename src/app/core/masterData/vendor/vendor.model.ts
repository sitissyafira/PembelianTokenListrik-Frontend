import { User } from '../../auth';
import {BaseModel} from '../../_base/crud';
import { VndrCategoryModel } from '../vndrCategory/vndrCategory.model';

export class VendorModel extends BaseModel{
	_id : string;
	vendor_name: String;
	address: String;
	vendor_code: String;
	npwp: String;
	phone: String;
	vendor_email: String;
	vendor_category: VndrCategoryModel
	pic: String;
	pic_phone: String;
	pic_email: String;
	
	remark: String;
	description: String;
    created_by: User;

	products: any[];

	clear(): void{
		this._id = undefined;
		this.vendor_name = "";
		this.address = "";
		this.vendor_code = "";
		this.npwp = "";
		this.phone = "";
		this.vendor_email = "";
		this.vendor_category = undefined;
		this.pic = "";
		this.pic_phone = "";
		this.pic_email = "";
		this.remark = "";
		this.description = "";
		this.created_by = undefined;
	}
}
