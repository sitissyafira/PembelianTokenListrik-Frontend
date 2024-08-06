// Angular
import { Component, OnInit, OnDestroy, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
// RxJS
import { BehaviorSubject, Observable, of, Subscription } from 'rxjs';
// NGRX
import { Store, select } from '@ngrx/store';
import { Update } from '@ngrx/entity';
import { AppState } from '../../../../../core/reducers';
// Layout
import { SubheaderService, LayoutConfigService } from '../../../../../core/_base/layout';
import { LayoutUtilsService, MessageType, QueryParamsModel } from '../../../../../core/_base/crud';
// Services and Models
import {
	User,
	UserUpdated,
	Address,
	SocialNetworks,
	selectHasUsersInStore,
	selectUserById,
	UserOnServerCreated,
	selectLastCreatedUserId,
	selectUsersActionLoading, AuthService
} from '../../../../../core/auth';
import { SelectionModel } from '@angular/cdk/collections';
import { CustomerService } from '../../../../../core/customer/customer.service';
import { EngineerService } from '../../../../../core/engineer/engineer.service';
import { QueryEngineerModel } from '../../../../../core/engineer/queryengineer.model';
import { QueryRoleModel } from '../../../../../core/role/queryrole.model';
import { RoleService } from '../../../../../core/role/role.service';
import { ComCustomerService } from '../../../../../core/commersil/master/comCustomer/comCustomer.service';
import { QueryComCustomerModel } from '../../../../../core/commersil/master/comCustomer/querycomCustomer.model';

import { UnitService } from '../../../../../core/unit/unit.service'
import { QueryUnitModel } from '../../../../../core/unit/queryunit.model';
import { FormControl } from '@angular/forms';
import { QueryExternalUserModel } from '../../../../../core/externalUser/queryexternalUser.model';
import { QueryInternalUserModel } from '../../../../../core/internalUser/queryinternalUser.model';
import { InternalUserService } from '../../../../../core/internalUser/internalUser.service';
import { ExternalUserService } from '../../../../../core/externalUser/externalUser.service';
@Component({
	selector: 'kt-user-edit',
	templateUrl: './user-edit.component.html',
	styleUrls: ['./user-edit.component.scss']
})
export class UserEditComponent implements OnInit, OnDestroy {
	// Public properties
	user: User;
	userId$: Observable<string>;
	oldUser: User;
	selectedTab = 0;
	loading$: Observable<boolean>;
	rolesSubject = new BehaviorSubject<number[]>([]);
	addressSubject = new BehaviorSubject<Address>(new Address());
	soicialNetworksSubject = new BehaviorSubject<SocialNetworks>(new SocialNetworks());
	userForm: FormGroup;
	hasFormErrors = false;
	isCustomer: boolean = true;
	isEngineer: boolean = true;
	isCommercial: boolean = true;
	isExternalUser: boolean = true;
	isInternalUser: boolean = true;
	customerResult: any[] = [];
	engineerResult: any[] = [];
	commercialResult: any[] = []
	roleResult: any[] = []
	selection = new SelectionModel<User>(true, []);
	loading: boolean = false;

	//user
	internalUserResult: any[] = []
	internalUserResultFiltered = [];
	externalUserResult: any[] = []
	externalUserResultFiltered = [];

	//unit list
	unitSelection = new SelectionModel<any>(true, []);
	unitRes: any
	unit: any[] = []; // array of unit
	selectedUnit: any[] = []; // array of id unit
	@ViewChild('searchInput', { static: true }) searchInput: ElementRef;
	search = new FormControl()
	page = 0
	passwordValid: boolean = false
	// Private properties
	private subscriptions: Subscription[] = [];

	/**
	 * Component constructor
	 *
	 * @param activatedRoute: ActivatedRoute
	 * @param router: Router
	 * @param userFB: FormBuilder
	 * @param subheaderService: SubheaderService
	 * @param layoutUtilsService: LayoutUtilsService
	 * @param store: Store<AppState>
	 * @param layoutConfigService: LayoutConfigService
	 */
	constructor(private activatedRoute: ActivatedRoute,
		private router: Router,
		private userFB: FormBuilder,
		private subheaderService: SubheaderService,
		private layoutUtilsService: LayoutUtilsService,
		private store: Store<AppState>,
		private service: AuthService,
		private cservice: CustomerService,
		private comervice: ComCustomerService,
		private eservice: EngineerService,
		private roleService: RoleService,
		private layoutConfigService: LayoutConfigService,
		private unitService: UnitService,
		private internalUserService: InternalUserService,
		private externalUserService: ExternalUserService,
		private cdr: ChangeDetectorRef
	) { }

	/**
	 * @ Lifecycle sequences => https://angular.io/guide/lifecycle-hooks
	 */

	/**
	 * On init
	 */
	ngOnInit() {
		this.loading$ = this.store.pipe(select(selectUsersActionLoading));
		const routeSubscription = this.activatedRoute.params.subscribe(params => {
			const id = params.id;
			if (id) {
				this.store.pipe(select(selectUserById(id))).subscribe(res => {
					if (res) {
						this.user = res;
						this.rolesSubject.next(this.user.roles);
						this.addressSubject.next(this.user.address);
						this.soicialNetworksSubject.next(this.user.socialNetworks);
						this.oldUser = Object.assign({}, this.user);
						this.initUser();
						// this.loadUnitList();
					}
				});
			} else {
				this.user = new User();
				this.user.clear();
				this.initUser();
			}
		});
		this.subscriptions.push(routeSubscription);
	}

	ngOnDestroy() {
		this.subscriptions.forEach(sb => sb.unsubscribe());
	}

	/**
	 * Init user
	 */
	initUser() {
		this.createForm();
		this.loadRoleList();
		this.loadCustomerList();
		this.loadEngineerList();
		this.loadCommercialList();
		this.getdatauser(this.user.role._id);
		this.getUserUnitList()
		this.loadUnitList()
		this.loadExternalUserList();
		this.loadInternalUserList();

	}

	/**
	 * Create form
	 */
	createForm() {
		console.log(this.user, 'this user')
		this.userForm = this.userFB.group({
			username: [{ value: this.user.username, disabled: false }, Validators.required],
			first_name: [{ value: this.user.first_name, disabled: false }, Validators.required],
			last_name: [{ value: this.user.last_name, disabled: false }, Validators.required],
			// password: [this.user.password, [Validators.required, Validators.minLength(8)]],
			password: [this.user.password],
			role: [{ value: this.user.role, disabled: true }, Validators.required],
			tenant: [{ value: this.user.tenant, disabled: true }],
			engineer: [{ value: this.user.engineer, disabled: true }],
			internalUser: [{ value: this.user.internalUser, disabled: true }],
			externalUser: [{ value: this.user.externalUser, disabled: true }],
			commersil: [{ value: this.user.commersil, disabled: true }]
		});
	}

	loadRoleList() {
		this.selection.clear();
		const queryParams = new QueryRoleModel(
			null,
			"asc",
			null,
			1,
			1000
		);
		this.roleService.getListRole(queryParams).subscribe(
			res => {
				this.roleResult = res.data;
				this.cdr.markForCheck()
			}
		);
	}


	getdatauser(id) {
		this.roleService.findRoleById(id).subscribe(data => {
			const datarole = data.data.role;
			const controls = this.userForm.controls;
			controls.role.setValue(id)

			if (datarole == "customer") {
				this.isCustomer = false;
				this.isEngineer = true;
				this.isCommercial = true;
				this.isExternalUser = true;
				this.isInternalUser = true;
			} else if (datarole == "engineer") {
				this.isEngineer = false;
				this.isCustomer = true;
				this.isCommercial = true;
				this.isExternalUser = true;
				this.isInternalUser = true;
			} else if (datarole == "commersil") {
				this.isEngineer = true;
				this.isCustomer = true;
				this.isCommercial = false;
				this.isExternalUser = true;
				this.isInternalUser = true;
			} else if (datarole == "security" || datarole == "housekeeping") {
				this.isEngineer = true;
				this.isCustomer = true;
				this.isCommercial = true;
				this.isExternalUser = false;
				this.isInternalUser = true;
			} else {
				this.isCustomer = true;
				this.isEngineer = true;
				this.isCommercial = true;
				this.isExternalUser = true;
				this.isInternalUser = false;
			}
		});

		this.cdr.markForCheck()
	}
	getSingleCustomer(id) {
		const controls = this.userForm.controls;
		this.cservice.getCustomerById(id).subscribe(data => {
			controls.first_name.setValue(data.data.cstrmrnm);
		});
	}
	getSingleEngineer(id) {
		const controls = this.userForm.controls;
		this.eservice.getEngineerById(id).subscribe(data => {
			controls.first_name.setValue(data.data.name);
		});
	}
	getSingleCommercial(id) {
		const controls = this.userForm.controls;
		this.comervice.findComCustomerById(id).subscribe(data => {
			controls.first_name.setValue(data.data.name);
		});
	}

	getInternalUserById(id) {

		const controls = this.userForm.controls;
		this.internalUserService.getInternalUserById(id).subscribe(data => {
			controls.first_name.setValue(data.data.name);
		});
	}
	getExternalUserById(id) {

		const controls = this.userForm.controls;
		this.externalUserService.getExternalUserById(id).subscribe(data => {
			console.log(data, 'data')
			controls.first_name.setValue(data.data.name);
		});
	}

	loadCustomerList() {
		this.selection.clear();
		const queryParams = new QueryParamsModel(
			null,
			"asc",
			null,
			1,
			100000
		);
		this.cservice.getListCustomer(queryParams).subscribe(
			res => {
				this.customerResult = res.data;
				this.cdr.markForCheck()
			}
		);
	}

	loadCommercialList() {
		this.selection.clear();
		const queryParams = new QueryComCustomerModel(
			null,
			1,
			100000
		);
		this.comervice.getListComCustomer(queryParams).subscribe(
			res => {
				this.commercialResult = res.data;
				this.cdr.markForCheck()
			}
		);
	}


	loadEngineerList() {
		this.selection.clear();
		const queryParams = new QueryEngineerModel(
			null,
			"asc",
			null,
			1,
			10000
		);
		this.eservice.getListEngineer(queryParams).subscribe(
			res => {
				this.engineerResult = res.data;
				this.cdr.markForCheck()
			}
		);
	}
	loadExternalUserList() {
		this.selection.clear();
		const queryParams = new QueryInternalUserModel(
			null,
			"asc",
			null,
			1,
			100000
		);
		this.externalUserService.getListExternalUser(queryParams).subscribe(
			res => {
				this.externalUserResult = res.data;
				this.externalUserResultFiltered = this.externalUserResult.slice();
				this.cdr.markForCheck();
			}
		);
	}
	loadInternalUserList() {
		this.selection.clear();
		const queryParams = new QueryEngineerModel(
			null,
			"asc",
			null,
			1,
			100000
		);
		this.internalUserService.getListInternalUser(queryParams).subscribe(
			res => {
				this.internalUserResult = res.data;
				this.internalUserResultFiltered = this.internalUserResult.slice();
				this.cdr.markForCheck();
			}
		);
	}
	/**
	 * Redirect to list
	 *
	 */
	goBackWithId() {
		const url = `/user-management/users`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}
	/**
	 * Refresh user
	 *
	 * @param isNew: boolean
	 * @param id: number
	 */
	refreshUser(isNew: boolean = false, id: string = "") {
		let url = this.router.url;
		if (!isNew) {
			this.router.navigate([url], { relativeTo: this.activatedRoute });
			return;
		}

		url = `/user-management/users/edit/${id}`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}

	/**
	 * Reset
	 */
	reset() {
		this.user = Object.assign({}, this.oldUser);
		this.createForm();
		this.hasFormErrors = false;
		this.userForm.markAsPristine();
		this.userForm.markAsUntouched();
		this.userForm.updateValueAndValidity();
	}

	/**
	 * Save data
	 *
	 * @param withBack: boolean
	 */
	onSumbit(withBack: boolean = false) {
		this.hasFormErrors = false;
		const controls = this.userForm.controls;
		/** check form */
		if (this.userForm.invalid) {
			Object.keys(controls).forEach(controlName =>
				controls[controlName].markAsTouched()
			);

			this.hasFormErrors = true;
			this.selectedTab = 0;
			return;
		}

		this.loading = true;
		//checking password is not equal empty string or null, the data will contain password
		if (controls.password.value != "" && controls.password.value != null) {
			let psw = controls.password.value
			//if the password length less than 8, will show alert.
			if (controls.password.value.length < 8) {
				const message = `password must be 8 digit.`;
				this.layoutUtilsService.showActionNotification(message, MessageType.Update, 5000, true, true);
			} else {
				//else (the password length equal or more than 8. data will be submited)
				this.passwordValid = true
				const editedUser = this.prepareUser();
				this.updateUser(editedUser, withBack)
			}
		} else {
			//else the data will not contain password
			this.passwordValid = false
			const editedUser = this.prepareUser();
			this.updateUser(editedUser, withBack)
		}
	}

	/**
	 * Returns prepared data for save
	 */
	// prepareUser(): User {
	prepareUser(): any {
		const controls = this.userForm.controls;
		// if passwordValid is true. data will contain password
		if (this.passwordValid == true) {
			console.log("masuk if");

			let user = {
				_id: this.user._id,
				username: controls.username.value.toLowerCase(),
				first_name: controls.first_name.value,
				last_name: controls.last_name.value,
				role: controls.role.value,
				tenant: controls.tenant.value,
				engineer: controls.engineer.value,
				password: controls.password.value,
				userUnits: [],
			}
			if (!this.isCustomer) { // if the role is custumer, note : why the variable is !this.customer because this. variable used to be hidden indicator
				let unitList = []
				this.selectedUnit.map(unit => {
					unitList.push(unit._id)
				})
				user.userUnits = unitList
			} else {
				user.userUnits = []
			}
			return user;

		} else {
			let user = {
				_id: this.user._id,
				username: controls.username.value.toLowerCase(),
				first_name: controls.first_name.value,
				last_name: controls.last_name.value,
				role: controls.role.value,
				tenant: controls.tenant.value,
				engineer: controls.engineer.value,
				userUnits: [],
			}
			if (!this.isCustomer) { // if the role is custumer, note : why the variable is !this.customer because this. variable used to be hidden indicator
				let unitList = []
				this.selectedUnit.map(unit => {
					unitList.push(unit._id)
				})
				user.userUnits = unitList
			} else {
				user.userUnits = []
			}
			return user;
		}
	}

	/**
	 * Update user
	 *
	 * @param _user: User
	 * @param withBack: boolean
	 */
	// updateUser(_user: User, withBack: boolean = false) {
	updateUser(_user: any, withBack: boolean = false) {


		// Update User
		// tslint:disable-next-line:prefer-const
		const addSubscription = this.service.updateUser(_user).subscribe(
			res => {
				const message = `User successfully has been saved.`;
				this.layoutUtilsService.showActionNotification(message, MessageType.Update, 5000, true, true);
				const url = `/user-management/users`;
				this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
			},
			err => {
				console.error(err);
				const message = 'Error while saving user | ' + err.statusText;
				this.layoutUtilsService.showActionNotification(message, MessageType.Update, 5000, true, false);
			}
		);
		this.subscriptions.push(addSubscription);
	}

	/**
	 * Returns component title
	 */
	getComponentTitle() {
		let result = `Edit User Management`;
		return result;
	}

	/**
	 * Close Alert
	 *
	 * @param $event: Event
	 */
	onAlertClose($event) {
		this.hasFormErrors = false;
	}
	filterConfiguration(): any {
		const filter: any = {};

		let searchText = this.search.value
		if (this.search.value == undefined) {
			searchText = ""
		}
		filter.cdunt = `${searchText}`;
		return filter;
	}
	getUserUnitList() {
		let notUserUnit = [this.user.unit] // if there is no "userUnits" enter the array index "unit" in the variable
		let cond = false
		if (this.user.userUnits) {
			if (this.user.userUnits.length) cond = true
		}

		this.service.getUserUnitList({ unit: cond ? this.user.userUnits : notUserUnit }).subscribe(res => {
			this.selectedUnit = res.data
		})
		this.cdr.markForCheck()
	}

	loadUnitList() {
		const queryParams = new QueryUnitModel(
			this.filterConfiguration(),
			'asc',
			null,
			this.page + 1,
			20
		);
		this.unitService.getListUnitByName(queryParams).subscribe(
			res => {
				this.unit = res.data
				this.unitRes = res.data
				this._filterUntList()
				this.cdr.markForCheck()
			}
		)

	}
	isAllSelected() {
		const numSelected = this.unitSelection.selected.length;
		const numRows = this.unit.length;
		// return numSelected === numRows;
		return false;
	}

	masterToggle() {

		if (this.isAllSelected()) {
			this.unitSelection.clear()
			// this.selectedUnit.map(unit => {
			// 	this.unitRes.push(unit)
			// })
			this.unitRes = this.selectedUnit
			this.selectedUnit = []

			this.cdr.markForCheck()
		} else {
			this.unitSelection.clear()
			this.unitRes.forEach((col) => {
				// this.unitSelection.select(col);
				this.selectedUnit.push(col)
			});

			this.page++
			this.loadUnitList()
			this.unitRes = []
			this.cdr.markForCheck()
		}
	}


	selectUnit(unit, e) {
		e.stopPropagation()
		let unitPush = {
			_id: unit._id,
			cdunt: unit.nmunt
		}
		this.selectedUnit.push(unitPush)
		this._removeUntList(unit._id)
		this.cdr.markForCheck()
	}
	clearAllSelection(e) {
		e.preventDefault();
		this.unitSelection.clear()
		this.page = 0
		this.selectedUnit = []
		this.loadUnitList()
		this.cdr.markForCheck()
	}
	onChange(e) {
		this.search.setValue(e.target.value)
		this.loadUnitList()
	}

	_filterUntList() {
		let unt = []
		if (this.selectedUnit.length > 0) {
			this.selectedUnit.map((i, index) => {
				let tempUnt = this.unitRes.filter(unit => {
					if (i._id != unit._id) {
						return unit
					}
				})
				this.unitRes = tempUnt
			})
			this.cdr.markForCheck()

		} else {
			this.unitRes = this.unit
			this.cdr.markForCheck()
		}
	}
	_deleteUntList(unit) {
		this.selectedUnit = this.selectedUnit.filter(i => {
			if (i._id != unit._id) return i;
		})
		this.unitRes.push(unit)
		this.unitRes.sort()
		this.cdr.markForCheck()
	}
	_removeUntList(id) {
		this.unitRes = this.unitRes.filter(i => {
			if (i._id != id) return i;
		})
	}

}
