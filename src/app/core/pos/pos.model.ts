import { BaseModel } from '../_base/crud';
import { CategoryModel } from '../category/category.model';



export class PosModel extends BaseModel {
	_id: string;
	admName: string;
	subTotalPOS: number;
	billingID: any;
	detailBilling: any;
	totalPOS: number;
	payMtd: string
	bankMtd: any
	cardNo: any
	amount: number
	change: number
	unitID: string
	cashierRecordID: string
	loginDate: any
	category: string
	cashierNo: string

	// Payment Record
	// admName: string
	fiduMoney: any;
	coinMoney: any;
	cashAmount: number;
	noteOpening: string;
	isOpening: boolean;
	isCash: boolean;
	isCoin: boolean;

	clear(): void {
		this._id = undefined
		this.admName = undefined
		this.subTotalPOS = undefined
		this.billingID = undefined
		this.detailBilling = undefined
		this.totalPOS = undefined
		this.payMtd = undefined
		this.bankMtd = undefined
		this.cardNo = undefined
		this.amount = undefined
		this.change = undefined
		this.unitID = undefined
		this.cashierRecordID = undefined

		this.fiduMoney = undefined
		this.coinMoney = undefined
		this.cashAmount = undefined
		this.noteOpening = undefined
		this.isOpening = undefined
		this.isCash = undefined
		this.isCoin = undefined
		this.loginDate = undefined
	}
}
