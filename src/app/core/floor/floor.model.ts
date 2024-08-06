import {BaseModel} from '../_base/crud';
import {BlockModel} from '../block/block.model';

export class FloorModel extends BaseModel{
	_id : string;
	cdflr : string;
	nmflr : string;
	blk: BlockModel;
	crtdate : string;
	upddate : string;

	clear(): void{
		this._id = undefined;
		this.cdflr = "";
		this.nmflr = "";
		this.blk = undefined;
		this.crtdate = "";
		this.upddate = "";
	}
}
