import {BaseModel} from '../../_base/crud';

export class WaterRateModel extends BaseModel{
	_id : string;
	nmrtewtr : string;
	rte: number;
	pemeliharaan: number;
	administrasi: number;


	clear(): void{
		this._id = undefined;
		this.nmrtewtr = "";
		this.rte = 0;
		this.pemeliharaan = 0;
		this.administrasi = 0;
		
	}
}
