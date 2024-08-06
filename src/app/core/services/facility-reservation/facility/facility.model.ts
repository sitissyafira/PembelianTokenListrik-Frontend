import { User } from '../../../auth';
import { OwnershipContractModel } from '../../../contract/ownership/ownership.model';
import { UnitModel } from '../../../unit/unit.model';
import { BaseModel } from '../../../_base/crud';


// Setup Facility Tipe (Master)
export class FacilityModelFacility extends BaseModel {
	// _id: string;
	// facilityID: string
	addFacility: string
	scheduleDay: string

	// Detail Reservation
	scheduleDetail: any
	isActive: boolean
	maxPeople: number

	// Facilty Reservation Customer
	_id: string;
	facilityID: string

	unit: string
	customer: string
	phone: string
	reservationDate: string
	status: string
	people_qty: number
	reservationTime: any
	codeReservation: string


	clear(): void {
		this._id = undefined;
		this.facilityID = undefined
		// this.addFacility = undefined
		// this.scheduleDay = undefined

		// // Detail Reservation
		// this.scheduleDetail = undefined
		// this.isActive = undefined
		// this.maxPeople = undefined

		// Facility Reservation Customer
		this.unit = undefined
		this.customer = undefined
		this.phone = undefined
		this.reservationDate = undefined
		this.status = undefined
		this.people_qty = undefined
		this.reservationTime = undefined
		this.codeReservation = undefined
	}
}

// Setup Facility Tipe (Data Customer)
export class FacilityModel extends BaseModel {
	_id: string;
	contract: OwnershipContractModel;
	contract_name: string;
	unit: UnitModel;
	deliver_date: string;
	confirmed_date: any;
	package_from: string;
	pic_name: string;
	created_by: User;
	created_date: string;
	updated_by: User
	updated_date: string;
	isDelete: boolean;
	package_status: string;
	receipient_name: string;
	cdunt: string;
	remarks: string;

	isTenant: boolean;
	pic_number: string;
	description: string;

	data: any;

	// new flow
	handoverAttachment: any
	receivedAttachment: any
	attachment: any
	packageDetail: any
	receiveDetail: any
	packageId: string


	//'in', 'out', 'confirmed', 'confirmed by system'],


	clear(): void {
		this._id = undefined;
		this.contract = undefined;
		this.contract_name = "";
		this.unit = undefined;
		this.receipient_name = "";
		this.created_by = undefined;
		this.created_date = "";
		this.cdunt = "";
		this.remarks = "";
		this.package_status = ''
	}
}
