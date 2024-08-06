import { AccountGroupModel } from '../../accountGroup/accountGroup.model';
import { AccountTypeModel } from '../../accountType/accountType.model';
import { User } from '../../auth';
import { OwnershipContractModel } from '../../contract/ownership/ownership.model';
import { UnitModel } from '../../unit/unit.model';
import {BaseModel} from '../../_base/crud';



export class BudgetingModel extends BaseModel{
	_id : string;

	account_type: AccountTypeModel
	account: AccountGroupModel
	acctName: String;
	acctNo: String;
	year: String;
	nominal_budget:String;
	actual_budget : String;
	type_budget : String;
	remark: String;
	period1: String;
	period2: String;
	period3: String;
	period4: String;
	period5: String;
	period6: String;
	period7: String;
	period8: String;
	period9: String;
	period10: String;
	period11: String;
	period12: String;
	created_by: User;
	created_date: string;
	updated_by: User
	updated_date: string;
	isDelete: boolean;



    //'in', 'out', 'confirmed', 'confirmed by system'],
		

	clear(): void{
		this._id = undefined;
		this.account_type= undefined
		this.account= undefined
		this.acctName= "";
		this.acctNo= "";
		this.year= "";
		this.nominal_budget="";
		this.actual_budget = "";
		this.type_budget = "";
		this.remark= "";
		this.period1= "";
		this.period2= "";
		this.period3= "";
		this.period4= "";
		this.period5= "";
		this.period6= "";
		this.period7= "";
		this.period8= "";
		this.period9= "";
		this.period10= "";
		this.period11= "";
		this.period12= "";
		this.created_by = undefined;
		this.created_date ="";
		this.updated_by = undefined;
		this.updated_date = "";
		this.isDelete = undefined;
	}
}
