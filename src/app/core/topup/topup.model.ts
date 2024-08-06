import { BaseModel } from '../_base/crud';
import { UnitModel } from '../unit/unit.model';
import { OwnershipContractModel } from '../contract/ownership/ownership.model';
import { BankModel } from '../masterData/bank/bank/bank.model';

export class TopUpModel extends BaseModel {
	// START
	_id: string;
	namePrabayar: string;
	totalBiaya: Number;
	idRate: string;
	idUnit: string;
	topup_number: string;
	bank_tf: string;
	account_no: Number;
	account_name: string;
	card_no: Number;
	name_card: string;
	tglTransaksi: string;
	cdTransaksi: string;
	rate: Number;
	adminRate: Number;
	nameUnit: string;
	companyBank: string;
	nameCompany: string;
	accountNumberCompany: Number;
	mtdPembayaran: string;
	// END

	contract: OwnershipContractModel;
	unit: UnitModel;
	topup: any;
	power: any;
	water: any;
	ipl: any;
	created_date: string;
	unit2: string;
	topup_date: string;
	due_date: string;
	totalTopUp: Number;
	isFreeIpl: boolean
	isFreeAbodement: boolean;

	bank: BankModel;
	customerBankNo: String;
	customerBank: String;
	desc: String;
	paidDate: String;
	isPaid: boolean;
	transferAmount: string;
	paymentType: string;
	accountOwner: string;
	attachment: [string];
	paymentStatus: boolean;
	pinalty: number;


	clear(): void {
		// START
		this._id = undefined;
		this.namePrabayar = undefined;
		this.totalBiaya = undefined;
		this.idRate = undefined;
		this.idUnit = undefined;
		this.topup_number = undefined;
		this.bank_tf = undefined;
		this.account_no = undefined;
		this.account_name = undefined;
		this.card_no = undefined;
		this.name_card = undefined;
		this.tglTransaksi = undefined;
		this.cdTransaksi = undefined;
		this.rate = undefined;
		this.adminRate = undefined;
		this.nameUnit = undefined;
		this.companyBank = undefined;
		this.nameCompany = undefined;
		this.accountNumberCompany = undefined;
		this.mtdPembayaran = undefined;
		// END

		this.topup = undefined;
		this.power = undefined;
		this.water = undefined;
		this.ipl = undefined;
		this.unit = undefined;
		this.contract = undefined;
		this.isFreeAbodement = undefined;
		this.isFreeIpl = undefined;

		this.unit2 = "";
		this.created_date = "";
		this.topup_date = "";
		this.due_date = "";
		this.totalTopUp = 0;

		this.bank = undefined;
		this.customerBankNo = "";
		this.customerBank = "";
		this.desc = "";
		this.paidDate = "";
		this.isPaid = undefined;
		this.paymentType = "";
		this.transferAmount = "";
		this.accountOwner = "";
		this.attachment = undefined;
		this.paymentStatus = undefined;

		this.pinalty = 0;
	}
}
