import { ApModel } from '../finance/ap/ap.model';
import { ArModel } from '../finance/ar/ar.model';
import {BaseModel} from '../_base/crud';



export class CashbModel extends BaseModel{
	_id : string;
	date : string;
	sourceno : string;
	description : string;
	deposit : ArModel;
	withdrawal : ApModel;
	balance : number;

	clear(): void{
		this._id = undefined;
		this.date  = "";
		this.sourceno = "";
		this.description = "";
		this.deposit = undefined;
		this.withdrawal = undefined;
		this.balance = 0;
	}
}
