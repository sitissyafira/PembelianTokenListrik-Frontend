import {BaseModel} from '../../_base/crud';

export class GasRateModel extends BaseModel{
	_id : string;
	nmrtegas : string;
	rte: string;
	administrasi: string;
	maintenance: string;


	clear(): void{
		this._id = undefined;
		this.nmrtegas = "";
		this.rte = "";
		this.maintenance ="";
		this.administrasi = "";
		
	}
}
