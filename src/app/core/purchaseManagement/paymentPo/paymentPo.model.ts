import { User } from '../../auth';
import { TaxModel } from '../../masterData/tax/tax.model';
import { VendorModel } from '../../masterData/vendor/vendor.model';
import {BaseModel} from '../../_base/crud';
import { QuotationModel } from '../quotation/quotation.model';
import { PurchaseRequestModel } from '../purchaseRequest/purchaseRequest.model';
import { PoReceiptModel } from '../poReceipt/poReceipt.model';
import { ApModel } from '../../finance/ap/ap.model';

export class PaymentPoModel extends BaseModel{
	_id : string;
	purchase_invoice_no : String;
    po_receipt : PoReceiptModel[];
    date : String;
	planned_payment_date: String;
	note: String;
    createdBy: String;
	payment: any;
	//AP
	ap: ApModel;

	clear(): void{
		this._id = undefined;
		this.purchase_invoice_no = "";
		//this.quotation_no = "";
		// this.quo = undefined;
		this.date = "";
		this.po_receipt = undefined;
		this.planned_payment_date = "";
		this.note = "";
		this.createdBy = ""
		this.ap = undefined
		this.payment = undefined
	}
}
