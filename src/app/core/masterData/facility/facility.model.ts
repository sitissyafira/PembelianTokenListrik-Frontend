import {BaseModel} from '../../_base/crud';
import { User } from '../../../core/auth';
import { BlockModel } from '../../block/block.model';
import { BlockgroupModel } from '../../blockgroup/blockgroup.model';
import { FloorModel } from '../../floor/floor.model';

export class FacilityModel extends BaseModel{
	_id : string;
	project_name : BlockgroupModel;
	blockCode : BlockModel;
	floorName: FloorModel;
	facilityName : string;
	facilityNo : string;
	facilityCode: string;
	remarks: string;
	createdBy: User;
	createdDate: string;
	updateBy : User;
	isDelete : boolean;
	updateDate: string;
	
	clear(): void{
		this._id = undefined;
		this.project_name = undefined;
		this.blockCode = undefined;
		this.floorName = undefined;
		this.facilityCode = "";
		this.facilityName = "";
		this.facilityNo = "";
		this.remarks = "";
		this.createdBy = undefined;
		this.createdDate = "";
		this.updateBy = undefined;
		this.updateDate = "";
		this.isDelete = undefined;
		
	}
}
