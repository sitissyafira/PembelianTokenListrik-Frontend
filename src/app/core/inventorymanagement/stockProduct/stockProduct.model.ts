import { User } from '../../auth';
import { UomModel } from '../../masterData/asset/uom/uom.model';
import { ProductBrandModel } from '../../masterData/productBrand/productBrand.model';
import { ProductCategoryModel } from '../../masterData/productCategory/productCategory.model';
import {BaseModel} from '../../_base/crud';

export class StockProductModel extends BaseModel{
	_id : string;
	product_code: String;
    product_name: String;
    product_category: ProductCategoryModel;
    product_brand: ProductBrandModel;
    uom: UomModel;
	beginning_qty: String;
    stock_qty: String;
	stockin_qty: Number;
	stockout_qty: Number;
	available_qty: Number;
    buy_price: String;
    discount: String;
    description: String;
    created_by: User

	clear(): void{
		this._id = undefined;
		this.product_code = "";
		this.product_name = "";
		this.product_category = undefined;
		this.product_brand = undefined;
		this.uom = undefined;
		this.stock_qty = "";
		this.stockin_qty = 0;
		this.stockout_qty = 0;
		this.available_qty = 0;
		this.buy_price = "";
		this.discount = "";
		this.description = "";
		this.created_by = undefined;
	}
}
