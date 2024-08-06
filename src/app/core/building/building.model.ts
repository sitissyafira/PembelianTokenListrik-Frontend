import {BaseModel} from '../_base/crud';
import {BlockModel} from '../block/block.model';

export class BuildingModel extends BaseModel{
	_id : string;
	nmbld : string;
	addrbld: string;
	blk: BlockModel;
	crtdate : string;
	upddate : string;

	clear(): void{
		this._id = undefined;
		this.nmbld = "";
		this.addrbld = "";
		this.blk = undefined;
		this.crtdate = "";
		this.upddate = "";
	}
}
