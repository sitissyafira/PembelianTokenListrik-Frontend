import {BaseModel} from '../_base/crud';
import {VillageModel} from '../state/village.model';

export class CustomerModel extends BaseModel{
	_id : string;
	// cstrmrcd : string;
	cstrmrpid : string;
	npwp : string;
	cstrmrnm : string;
	addrcstmr : string;
	phncstmr : string;
	emailcstmr : string;
	gndcstmr : string;
	idvllg : VillageModel;
	postcode : string;
	type : string;
	bankname : string;
	bankaccnt : string;

	clear(): void{
		this._id = undefined;
		// this.cstrmrcd = "";
		this.cstrmrpid = "";
		this.cstrmrnm = "";
		this.addrcstmr = "";
		this.phncstmr = "";
		this.emailcstmr = "";
		this.gndcstmr = "";
		this.idvllg = undefined;
		this.postcode = "";
		this.type = "";
		this.bankname = "";
		this.bankaccnt = "";
	}
}
