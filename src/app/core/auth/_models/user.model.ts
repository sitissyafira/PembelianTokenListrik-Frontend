import { BaseModel } from '../../_base/crud';
import { Address } from './address.model';
import { SocialNetworks } from './social-networks.model';
import { Permission } from './permission.model';
import { Role } from './role.model';
import { CustomerModel } from '../../customer/customer.model';
import { EngineerModel } from '../../engineer/engineer.model';
import { RoleModel } from '../../role/role.model';
import { UnitModel } from '../../unit/unit.model';
import { ComCustomerModel } from '../../commersil/master/comCustomer/comCustomer.model';
import { InternalUserModel } from '../../internalUser/internalUser.model';
import { ExternalUserModel } from '../../externalUser/externalUser.model';

export class User extends BaseModel {
	_id: string;
	id: string;
	first_name: string;
	last_name: string;
	username: string;
	password: string;
	engineer: EngineerModel;
	internalUser: InternalUserModel;
	externalUser: ExternalUserModel;
	commersil: ComCustomerModel;
	tenant: CustomerModel;
	unit: UnitModel;
	role: RoleModel;

	email: string;
	token: string;
	accessToken: string;
	refreshToken: string;
	// //role: string;
	roles: number[];
	pic: string;


	fullname: string;
	// occupation: string;
	// companyName: string;
	// phone: string;
	address: Address;
	socialNetworks: SocialNetworks;
	userUnits: any[]


	clear(): void {
		this._id = undefined;
		this.id = undefined;
		this.first_name = '';
		this.last_name = '';
		this.username = '';
		this.password = '';
		this.unit = undefined;
		this.role = undefined;
		this.engineer = undefined;
		this.internalUser = undefined;
		this.externalUser = undefined;
		this.commersil = undefined;
		this.tenant = undefined;


		this.email = '';
		this.roles = [];
		// this.fullname = '';
		this.token = '';
		this.accessToken = 'access-token-' + Math.random();
		this.refreshToken = 'access-token-' + Math.random();
		this.userUnits = []
		// this.pic = './assets/media/users/default.jpg';
		// this.occupation = '';
		// this.companyName = '';
		// this.phone = '';
		// this.address = new Address();
		// this.address.clear();
		// this.socialNetworks = new SocialNetworks();
		// this.socialNetworks.clear();
	}
}
