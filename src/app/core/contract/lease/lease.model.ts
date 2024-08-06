import { BaseModel } from '../../_base/crud';
import { CustomerModel } from '../../customer/customer.model';
import { UnitModel } from '../../unit/unit.model';

export class LeaseContractModel extends BaseModel {
	_id: string;
	cstmr: CustomerModel;
	contact_name: string;
	contact_address: string;
	contact_phone: string;
	contact_email: string;
	contact_city: string;
	contact_zip: string;
	ktp: string;
	npwp: string;
	rentalAmount: number;
	checkIn: any
	checkOut: any

	unit: UnitModel;
	unit2: string;
	regency: string;
	contract_number: string;
	contract_date: string;
	expiry_date: string;
	typeLease: string;


	paymentType: string;
	paymentTerm: number;
	start_electricity_stand: number;
	start_water_stand: number;
	virtualAccount: string;
	isPKP: boolean;
	tax_id: string;
	norek: string;

	billstatus: number;
	createdDate: string;



	receipt: any


	clear(): void {
		this._id = undefined;
		this.cstmr = undefined;
		this.contact_name = "";
		this.contact_address = "";
		this.contact_phone = "";
		this.contact_email = "";
		this.contact_city = "";
		this.contact_zip = "";
		this.ktp = "";
		this.npwp = "";

		this.unit = undefined;
		this.unit2 = "";
		this.regency = "";
		this.contract_number = "";
		this.contract_date = "";
		this.expiry_date = "";
		this.rentalAmount = 0;
		this.start_electricity_stand = 0;
		this.start_water_stand = 0;
		this.typeLease = "";

		this.paymentType = "";
		this.paymentTerm = 0;
		this.virtualAccount = "";
		this.isPKP = undefined;
		this.tax_id = "";
		this.norek = "";

		this.billstatus = 0;
		this.createdDate = "";

		this.receipt = undefined;

	}
}
