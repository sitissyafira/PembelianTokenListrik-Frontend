import {BaseModel} from '../../_base/crud';
import { RevenueModel } from '../../revenue/revenue.model';
import { LeaseContractModel } from '../../contract/lease/lease.model';



export class RentalModel extends BaseModel{
	_id : string;
	revenueCode: string;
	lease: LeaseContractModel;
	rate: number;
	unit : string;
	total : number;
	admin : number;
	service: number;
	revenueRental: RevenueModel;
	createdBy: string;

	clear(): void{
		this._id = undefined;
		this.revenueCode = "";
		this.lease = undefined;
		this.unit = "";
		this.rate  = 0;
		this.admin  = 0;
		this.service = 0;
		this.total = 0;
		this.revenueRental = undefined;		
		this.createdBy = localStorage.getItem("user");
	}
}
