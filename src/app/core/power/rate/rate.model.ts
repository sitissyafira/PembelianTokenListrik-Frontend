import {BaseModel} from '../../_base/crud';

export class PowerRateModel extends BaseModel{
	_id : string;
	nmrtepow : string;
	rte: number;
	ppju : number;
	srvc : number;


	clear(): void{
		this._id = undefined;
		this.nmrtepow = "";
		this.rte = 0;
		this.ppju = 0;
		this.srvc = 0;

	}
}
