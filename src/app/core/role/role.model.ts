import {BaseModel} from '../_base/crud';


export class RoleModel extends BaseModel{
	_id : string;
	roleCode: string;
	role: string;
	active: boolean;


	max_login: number;
	createdDate : string;
	
	updatedDate: string;
	updatedBy: string;

	clear(): void{
		this._id = undefined;
		this.roleCode = "";
		this.role ="";
		this.active = undefined;

		this.max_login = 0;
		this.createdDate = "";
		this.updatedBy = "";
		this.updatedDate = "";
		
	}
}
