import { BaseModel } from '../../_base/crud';

export class GalonRateModel extends BaseModel {
	_id: string;
	nmrtepow: string;
	brand: string;
	rte: number;
	rate: number;
	ppju: number;
	srvc: number;


	clear(): void {
		this._id = undefined;
		this.nmrtepow = "";
		this.brand = ";"
		this.rte = 0;
		this.rate = 0;
		this.ppju = 0;
		this.srvc = 0;

	}
}
