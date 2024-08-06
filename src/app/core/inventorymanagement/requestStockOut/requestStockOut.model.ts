import { User } from '../../auth';
import { UomModel } from '../../masterData/asset/uom/uom.model';
import { ProductBrandModel } from '../../masterData/productBrand/productBrand.model';
import { ProductCategoryModel } from '../../masterData/productCategory/productCategory.model';
import {BaseModel} from '../../_base/crud';
import { StockProductModel } from '../stockProduct/stockProduct.model';

export class RequestStockOutModel extends BaseModel{
	_id : string;
	rsoNo : String;
    approve : Boolean;
    status : Boolean;
    product: StockProductModel ;
    qtyRequest : String;
	description: String;
    created_by: User
	created_date : string;

	clear(): void{
		this._id = undefined;
		this.rsoNo  = "";
		this.approve  = undefined;
		this.status  = undefined;
		this.product = undefined;
		this.qtyRequest = "";
		this.description = "";
		this.created_by = undefined;
		this.created_date ="";
	}
}
