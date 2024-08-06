import {BaseModel} from '../_base/crud';

export class BlockgroupModel extends BaseModel{
	_id : string;
	grpnm : string;
	// prntid: string;
	crtdate : string;
	upddate : string;

	clear(): void{
		this._id = undefined;
		this.grpnm = "";
		// this.prntid = "";
		this.crtdate = "";
		this.upddate = "";
	}
}
