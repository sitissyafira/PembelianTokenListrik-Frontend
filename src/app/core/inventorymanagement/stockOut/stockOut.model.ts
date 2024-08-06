import { User } from '../../auth';
import { UomModel } from '../../masterData/asset/uom/uom.model';
import { ProductBrandModel } from '../../masterData/productBrand/productBrand.model';
import { ProductCategoryModel } from '../../masterData/productCategory/productCategory.model';
import { PurchaseRequestModel } from '../../purchaseManagement/purchaseRequest/purchaseRequest.model';
import {BaseModel} from '../../_base/crud';
import { RequestStockOutModel } from '../requestStockOut/requestStockOut.model';
import { StockProductModel } from '../stockProduct/stockProduct.model';

export class StockOutModel extends BaseModel{
	_id : string;
	stockOutNo : string;
    request_no: RequestStockOutModel
	product : StockProductModel
	product_name : string;
	uom: string;
    current_qty: string;
	stock_out: string;
	actual_qty : string;
	available_qty : Number;
    description: string;

	created_date : string;
    created_by: User


	clear(): void{
		this._id = undefined;
		this.stockOutNo = "";
		this.request_no = undefined;
		this.product = undefined;
		this.product_name = "";
		this.uom = "";
		this.current_qty = "";
		this.stock_out = "";
		this.actual_qty = "";
		this.available_qty = 0;
		this.description = "";
		this.created_by = undefined;
		this.created_date = "";
	}
}
