import { User } from '../../auth';
import { TaxModel } from '../../masterData/tax/tax.model';
import { VendorModel } from '../../masterData/vendor/vendor.model';
import {BaseModel} from '../../_base/crud';
import { QuotationModel } from '../quotation/quotation.model';
import { PurchaseRequestModel } from '../purchaseRequest/purchaseRequest.model';
import { PurchaseOrderModel } from '../purchaseOrder/purchaseOrder.model';

export class PoReceiptModel extends BaseModel{
	_id : string;
	receipt_number : String;
    po : PurchaseOrderModel;
    date : String;
	product : any;
	type_receipt : any;
	type_po : any;
	status: String;
	DO_number : String;
	courier_name : String;
	attachmenDO: any;
	attachmenReturn: any;
	description : String;
	vendorAddress : String;

	clear(): void{
		this._id = "";
		this.receipt_number = ""
		this.po = undefined;
		this.date = "";
		this.product = [];
		this.type_receipt = "";
		this.type_po = "";
		this.status = "";
		this.DO_number = "";
		this.courier_name = "";
		this.attachmenDO = "";
		this.attachmenReturn = "";
		this.description = "";
		this.vendorAddress = "";
	}
}
