import {BaseModel} from '../_base/crud';

export class AccountCategoryModel extends BaseModel{
	_id : string;
	category : string;
	name: string;
	account: any = [];
	includeCategory: any = [];
	excludeCategory: any = [];
	createdBy: string;

	clear(): void{
		this._id = undefined;
		this.category = undefined;
		this.name = undefined;
		this.account = undefined;
		this.includeCategory = undefined;
		this.excludeCategory = undefined;

		this.createdBy = localStorage.getItem("user");
	}
}
