import { DepartmentModel } from '../masterData/department/department.model';
import { DivisionModel } from '../masterData/division/division.model';
import { ShiftModel } from '../masterData/shift/shift.model';
import { BaseModel } from '../_base/crud';

export class EngineerModel extends BaseModel {
	_id: string;
	engnrid: string
	name: string;
	status: string;
	phone: string;
	email: string;
	isToken: boolean;
	birth_date: Date;
	join_date: Date;
	department: DepartmentModel;
	division: DivisionModel;
	shift: ShiftModel;

	clear(): void {
		this._id = undefined;
		this.engnrid = "";
		this.name = "";
		this.status = "";
		this.phone = "";
		this.email = "";
		this.isToken = undefined
	}
}
