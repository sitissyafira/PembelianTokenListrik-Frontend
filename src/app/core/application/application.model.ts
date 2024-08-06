import {BaseModel} from '../_base/crud';
export class ApplicationModel extends BaseModel{
	_id : string;
	appCode: string;
	name:string;
	appType:string;
	path: string;
	icon: String;
	parents: ApplicationModel
	startEffDate: string;
	endEffDate:string;
	active: boolean
	//delete:
	createdBy:string;

	clear(): void{
		this._id = undefined;
		this.appCode = "";
		this.name ="";
		this.appType = "";
		this.path = "";
		this.icon = "";
		this.parents = undefined;
		this.startEffDate = "";
		this.endEffDate = "";
		this.active = undefined;
		this.createdBy = localStorage.getItem("user");
	}
}
