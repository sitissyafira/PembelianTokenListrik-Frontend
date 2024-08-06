import { User } from '../../../auth';
import { OwnershipContractModel } from '../../../contract/ownership/ownership.model';
import { UnitModel } from '../../../unit/unit.model';
import { BaseModel } from '../../../_base/crud';


// Setup Master Tipe (Master)
export class FacilityModelMaster extends BaseModel {
	_id: string;
	facilityID: string
	addMaster: string
	scheduleDay: string
	hourBeforeStartTime: any

	// Detail Reservation
	scheduleDetail: any
	isActive: boolean
	maxPeople: number


	clear(): void {
		this._id = undefined;
		this.facilityID = undefined
		this.addMaster = undefined
		this.scheduleDay = undefined

		// Detail Reservation
		this.scheduleDetail = undefined
		this.isActive = undefined
		this.maxPeople = undefined
	}
}

// Setup Master Tipe (Data Customer)
export class MasterModel extends BaseModel {
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
