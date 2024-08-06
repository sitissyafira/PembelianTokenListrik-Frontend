import { BaseModel } from '../_base/crud';
import { UnitModel } from '../unit/unit.model';
import { OwnershipContractModel } from '../contract/ownership/ownership.model';
import { BankModel } from '../masterData/bank/bank/bank.model';

export class TrGalonModel extends BaseModel {
	_id: string;
	trGalon_number: string;
	contract: OwnershipContractModel;
	unit: UnitModel;
	trGalon: any;
	power: any;
	water: any;
	ipl: any;
	billed_to: string;
	created_date: string;
	unit2: string;
	trGalon_date: string;
	due_date: string;
	totalTrGalon: Number;
	isFreeIpl: boolean
	isFreeAbodement: boolean
	isToken: boolean
	va_water: number;
	va_ipl: number;
	dataCustomer: any
	bankORcoa_id: any
	// iplBulanan: any
	cstmr: any
	trDate: any
	qty: any
	brand: any
	totalTr: any
	totalTrAfterPPN: any
	totalPlusTax: any
	payment: any
	delivery: any
	isMobile: boolean
	imageTrGalon: any
	imageDelivery: any

	taxPercent: any
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

	// new
	deliveryStatus: string
	isRead: boolean

	clear(): void {
		this._id = undefined;
		this.trGalon_number = "";
		this.trGalon = undefined;
		this.power = undefined;
		this.water = undefined;
		this.ipl = undefined;
		this.unit = undefined;
		this.contract = undefined;
		this.isFreeAbodement = undefined;
		this.isFreeIpl = undefined;
		this.isToken = undefined;
		this.va_water = undefined
		this.va_ipl = undefined

		this.unit2 = "";
		this.billed_to = "";
		this.created_date = "";
		this.trGalon_date = "";
		this.due_date = "";
		this.totalTrGalon = 0;

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
