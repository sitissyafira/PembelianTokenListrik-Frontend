import { User } from '../../auth';
import { BlockModel } from '../../block/block.model';
import { FloorModel } from '../../floor/floor.model';
import {BaseModel} from '../../_base/crud';

export class CheckpointModel extends BaseModel{
	_id : string;
	code : String;
    name : String;
    twr : BlockModel;
    flr: FloorModel;
	type: String;
	record: Object;
	
	clear(): void{
		this._id = undefined;
		this.code = "";
		this.name = "";
		this.twr = undefined
		this.flr = undefined;
		this.type = "";
		this.record = undefined;
	}
}
