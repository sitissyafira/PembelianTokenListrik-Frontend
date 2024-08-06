import { User } from '../../auth';
import {BaseModel} from '../../_base/crud';
import { ProductCategoryModel } from '../productCategory/productCategory.model';

export class ProductBrandModel extends BaseModel{
	_id : string;
	brand_code: String;
    brand_name: String;
    product_category: ProductCategoryModel;
    description: String;
    created_by: User

	clear(): void{
		this._id = undefined;
		this.brand_code = "";
		this.brand_name = "";
		this.product_category = undefined;
		this.description = "";
		this.created_by = undefined;
	}
}
