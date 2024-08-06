import { User } from '../../auth';
import { UnitModel } from '../../unit/unit.model';
import { BaseModel } from '../../_base/crud';



export class VisitorModel extends BaseModel {
	_id: string;
	unit: UnitModel;

	nama: string;
	jenisKelamin: string;
	keperluan: string;
	tanggal: string;
	jam: string;
	noTelp: string;
	remark: string;
	createdBy: User
	createdDate: string;
	updateBy: User;
	updateDate: string;
	isDelete: boolean;

	// New Flow
	customerId: any
	checkIn: string
	checkIn_jam: string
	guestId: string
	company: string
	address: string
	city: any
	guestQty: number
	idCardType: string
	idCardNo: string
	isRead: boolean
	statusVisitor: string
	rejectReason: string
	contract_name: any
	attachment: any
	visitorAttachment: any



	clear(): void {
		this._id = undefined;
		this.unit = undefined;

		this.nama = "";
		this.jenisKelamin = "";
		this.keperluan = "";
		this.tanggal = "";
		this.jam = "";
		this.noTelp = "";
		this.remark = "";

		this.createdBy = undefined;
		this.createdDate = "";
		this.updateBy = undefined;
		this.updateDate = "";
		this.isDelete = undefined;

	}
}
