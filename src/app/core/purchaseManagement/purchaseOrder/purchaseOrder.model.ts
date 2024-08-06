import { User } from '../../auth';
import { TaxModel } from '../../masterData/tax/tax.model';
import { VendorModel } from '../../masterData/vendor/vendor.model';
import {BaseModel} from '../../_base/crud';
import { QuotationModel } from '../quotation/quotation.model';
import { PurchaseRequestModel } from '../purchaseRequest/purchaseRequest.model';

export class PurchaseOrderModel extends BaseModel{
	_id : string;
	po_no : String;
    product_name : [];
    //quotation_no : String;
    // quo : QuotationModel;
    date : String;
    term_payment : String;
	vendor_name: VendorModel;
	discount: String;
	type_discount: String;
	total: String;
	grand_total: String;
	isApproved: boolean;
    description : String;
    created_by: User;
	type_po: any;
	uom: any;
	pr: PurchaseRequestModel;
	note: String;
	payment: any;
	term: any;
	product: any;
	document: any;
	paymentStatus: boolean;

	clear(): void{
		this._id = undefined;
		this.po_no = "";
		//this.quotation_no = "";
		// this.quo = undefined;
		this.date = "";
		this.product_name = [];
		this.term_payment = "";
		this.vendor_name = undefined;
		this.discount = ""
		this.type_discount = ""
		this.total = ""
		this.grand_total = ""
		this.isApproved = false;
		this.description = "";
		this.created_by = undefined;
		this.type_po = "";
		this.uom = undefined;
		this.pr = undefined
		this.note = ""
		this.payment = undefined;
		this.term = undefined;
		this.product = [];
		this.document = undefined;
		this.paymentStatus = undefined;
	}
}
