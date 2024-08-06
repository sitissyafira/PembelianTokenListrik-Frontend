import { User } from '../../auth';
import { UomModel } from '../../masterData/asset/uom/uom.model';
import { ProductBrandModel } from '../../masterData/productBrand/productBrand.model';
import { ProductCategoryModel } from '../../masterData/productCategory/productCategory.model';
import {BaseModel} from '../../_base/crud';
import { StockProductModel } from '../stockProduct/stockProduct.model';

export class StockInModel extends BaseModel{
	_id : string;
	date: string;
	trNo : string;
    product: StockProductModel;
    product_name: String;
    current_qty: String;
    stock_in: String;
    actual_qty: String;
	available_qty: Number;
    uom: String;
    buy_price: String;
    description: String
    approval: boolean;
    created_by: User;
	poReceipt: any;

	clear(): void{
		this._id = undefined;
		this.date ="";
		this.trNo = "";
		this.product = undefined;
		this.product_name = "";
		this.current_qty = "";
		this.stock_in = "";
		this.actual_qty ="";
		this.available_qty = 0;
		this.uom = "";
		this.buy_price = "";
		this.description = "";
		this.approval = undefined;
		this.created_by = undefined;
		this.poReceipt = undefined;
	}
}
