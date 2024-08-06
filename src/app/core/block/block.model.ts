import {BaseModel} from '../_base/crud';
import {BlockgroupModel} from '../blockgroup/blockgroup.model';

export class BlockModel extends BaseModel{
	_id : string;
	cdblk : string;
	nmblk : string;
	addrblk: string;
	phnblk: string;
	grpnm : string;
	grpid: BlockgroupModel;
	availspace : string;
	month : string;
	rt : string;
    rw : string;
	crtdate : string;
	upddate : string;
	space: string;
    dtss: string;

	clear(): void{
		this._id = undefined;
		this.grpid = undefined;
		this.grpnm = "";
		this.cdblk = "";
		this.nmblk = "";
		this.addrblk = "";
		this.phnblk = "";
		this.month ="";
		this.rt="";
		this.rw="";
		this.space="";
		this.availspace="";
		this.dtss="";
		this.crtdate = "";
		this.upddate = "";
	}
}
