import { User } from '../../auth';
import { BlockModel } from '../../block/block.model';
import { FloorModel } from '../../floor/floor.model';
import {BaseModel} from '../../_base/crud';
import { CheckpointModel } from '../checkpoint/checkpoint.model';

export class SurveyTemplateModel extends BaseModel{
	_id : string;
    name : String;
    checkpoint : [CheckpointModel];
    survey : String[];
	
	clear(): void{
		this._id = undefined;
		this.name = "";
		this.checkpoint = undefined
		this.survey = undefined;
	}
}
