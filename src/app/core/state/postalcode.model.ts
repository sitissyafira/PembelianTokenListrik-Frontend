import {BaseModel} from '../_base/crud';

export class PostalcodeModel extends BaseModel{
	_id : string;
	kelurahan : string;
	kodepos: string;

	clear(): void{
		this._id = undefined;
		this.kelurahan = "";
		this.kodepos = "";
	}
}
