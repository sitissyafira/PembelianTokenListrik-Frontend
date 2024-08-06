import { AddparkModel } from '../addpark/addpark.model';
import { OwnershipContractModel } from '../contract/ownership/ownership.model';
import { AccountBankModel } from '../masterData/bank/accountBank/accountBank.model';
import { BankModel } from '../masterData/bank/bank/bank.model';
import { BaseModel } from '../_base/crud';



export class PrkbillingModel extends BaseModel {
	_id: string;
	parking: AddparkModel;
	billingNo: string;
	billingDate: string;
	unit: string;
	dueDate: string;
	parkingFee: Number;
	isNEW: boolean;
	notes: string;
	amountParking: Number;

	virtualAccId: string;
	account: string;

	bank: AccountBankModel;
	isPaid: boolean;
	customerBank: String;
	desc: string;
	customerBankNo: String;
	paidDate: String;
	paymentType: string;


	createdDate: string;
	createdBy: string;

	clear(): void {
		this._id = undefined;
		this.isNEW = undefined;
		this.billingNo = "";
		this.billingDate = "";
		this.dueDate = "";
		this.unit = "";
		this.notes = "";
		this.parkingFee = 0;
		this.createdDate = "";
		this.parking = undefined;
		this.amountParking = 0;


		this.bank = undefined;
		this.isPaid = undefined;
		this.customerBank = "";
		this.customerBankNo = "";
		this.desc = "";
		this.paidDate = "";
		this.paymentType = "";
		this.createdBy = localStorage.getItem("user");
	}
}
