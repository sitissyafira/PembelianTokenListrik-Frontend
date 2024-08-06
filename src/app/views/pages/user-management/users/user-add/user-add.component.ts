// Angular
import { Component, OnInit, OnDestroy, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
// RxJS
import { BehaviorSubject, Observable, of, Subscription } from 'rxjs';
// NGRX
import { Store, select } from '@ngrx/store';
import { Update } from '@ngrx/entity';
import { AppState } from '../../../../../core/reducers';

import {
	currentUser,
	currentUserRoleIds,
	isLoggedIn,
} from "../../../../../core/auth/_selectors/auth.selectors";
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
import { RoleService } from '../../../../../core/role/role.service';
import { QueryRoleModel } from '../../../../../core/role/queryrole.model';
import { ComCustomerService } from '../../../../../core/commersil/master/comCustomer/comCustomer.service';
import { QueryComCustomerModel } from '../../../../../core/commersil/master/comCustomer/querycomCustomer.model';

import { UnitService } from '../../../../../core/unit/unit.service'
import { QueryUnitModel } from '../../../../../core/unit/queryunit.model';
import { QueryExternalUserModel } from '../../../../../core/externalUser/queryexternalUser.model';
import { QueryInternalUserModel } from '../../../../../core/internalUser/queryinternalUser.model';
import { InternalUserService } from '../../../../../core/internalUser/internalUser.service';
import { ExternalUserService } from '../../../../../core/externalUser/externalUser.service';
@Component({
	selector: 'kt-user-edit',
	templateUrl: './user-add.component.html',
	styleUrls: ['./user-add.component.scss']
})
export class UserAddComponent implements OnInit, OnDestroy {
	// Public properties
	user: User;
	userId$: Observable<string>;
	oldUser: User;
	selectedTab = 0;
	loading$: Observable<boolean>;
	rolesSubject = new BehaviorSubject<number[]>([]);
	addressSubject = new BehaviorSubject<Address>(new Address());
	soicialNetworksSubject = new BehaviorSubject<SocialNetworks>(new SocialNetworks());
	selection = new SelectionModel<User>(true, []);
	userForm: FormGroup;
	hasFormErrors = false;
	customerResult: any[] = []
	customerResultFiltered: any[] = []
	commercialResult: any[] = []
	roleResult: any[] = []
	engineerResult: any[] = []
	isCustomer: boolean = true;
	isEngineer: boolean = true;
	isCommercial: boolean = true;
	isExternalUser: boolean = true;
	isInternalUser: boolean = true;
	viewCustomerResult = new FormControl();

	currentRole: string;
	// engineerResult: any[] = [];
	loadingData = {
		block: false,
		user: false,
	}
	EngineerResultFiltered = [];
	viewBlockResult = new FormControl();

	//user
	internalUserResult: any[] = []
	internalUserResultFiltered = [];
	externalUserResult: any[] = []
	externalUserResultFiltered = [];


	//unit list
	showUnitSelect: boolean = false;
	unitSelection = new SelectionModel<any>(true, []);
	unitRes: any
	unit: any[] = []; // array of unit
	selectedUnit: any[] = []; // array of id unit
	@ViewChild('searchInput', { static: true }) searchInput: ElementRef;
	search = new FormControl()
	page = 0
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
		private internalUserService: InternalUserService,
		private externalUserService: ExternalUserService,
		private roleService: RoleService,
		private rservice: RoleService,
		private layoutConfigService: LayoutConfigService,
		private unitService: UnitService,
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
						// this.rolesSubject.next(this.user.roles);
						// this.addressSubject.next(this.user.address);
						// this.soicialNetworksSubject.next(this.user.socialNetworks);
						this.oldUser = Object.assign({}, this.user);
						this.initUser();
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
		this.loadCustomerList();
		this.loadUnitList();
		this.loadRoleList();
		this.loadEngineerList();
		this.loadExternalUserList();
		this.loadInternalUserList();
		this.loadCommercialList();
	}

	/**
	 * Create form
	 */
	createForm() {
		this.userForm = this.userFB.group({
			username: [this.user.username, Validators.required],
			first_name: [this.user.first_name, Validators.required],
			last_name: [this.user.last_name, Validators.required],
			password: [this.user.password, [Validators.required, Validators.minLength(8)]],
			role: [this.user.role, Validators.required],
			engineer: [this.user.engineer],
			internalUser: [this.user.internalUser],
			externalUser: [this.user.externalUser],
			commersil: [this.user.commersil],
			tenant: [this.user.tenant],
		});
	}
	getdatauser(id) {
		const controls = this.userForm.controls;
		this.roleService.findRoleById(id).subscribe(data => {
			const datarole = data.data.role;

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
			this.cdr.markForCheck()
		});
	}

	getSingleCustomer(id) {
		//add rehan. fixing tenant null when add customer and tenant name
		this.userForm.patchValue({ tenant: id });

		const controls = this.userForm.controls;
		this.cservice.getCustomerById(id).subscribe(data => {
			controls.first_name.setValue(data.data.cstrmrnm);
			this.cdr.markForCheck()
		});
	}

	getSingleEngineer(id) {
		this.userForm.patchValue({ engineer: id });

		const controls = this.userForm.controls;
		this.eservice.getEngineerById(id).subscribe(data => {
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

	getSingleCommercial(id) {
		this.userForm.patchValue({ commersil: id });

		const controls = this.userForm.controls;
		this.comervice.findComCustomerById(id).subscribe(data => {
			controls.first_name.setValue(data.data.name);
		});
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
	// reset() {
	// 	this.user = Object.assign({}, this.oldUser);
	// 	this.createForm();
	// 	this.hasFormErrors = false;
	// 	this.userForm.markAsPristine();
	// 	this.userForm.markAsUntouched();
	// 	this.userForm.updateValueAndValidity();
	// }

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

		const editedUser = this.prepareUser();
		this.addUser(editedUser, withBack);
	}

	/**
	 * Returns prepared data for save
	 */
	prepareUser(): User {
		const controls = this.userForm.controls;
		const _user = new User();
		_user.clear();
		_user._id = this.user._id;
		_user.username = controls.username.value.toLowerCase();
		_user.first_name = controls.first_name.value;
		_user.last_name = controls.last_name.value;
		_user.role = controls.role.value;
		_user.tenant = controls.tenant.value;
		_user.engineer = controls.engineer.value;
		_user.internalUser = controls.internalUser.value;
		_user.externalUser = controls.externalUser.value;
		_user.commersil = controls.commersil.value;
		if (!this.isCustomer) { // if the role is custumer, note : why the variable is !this.customer because this. variable used to be hidden indicator
			let unitList = []
			this.selectedUnit.map(unit => {
				unitList.push(unit._id)
			})
			if (unitList.length === 1) { // Changes Request Back-end (Nouval) Validate send to API, If Selected unit one input to index unit
				_user.unit = unitList[0];
				//add rehan. pilih satu unit atau lebih tetap masukkan ke field userUnits
				_user.userUnits = unitList;
			} else { // if select more than one push to index userUnits
				_user.userUnits = unitList
			}
		} else {
			_user.userUnits = []
		}
		if (controls.password.value !== "") {
			_user.password = controls.password.value;
		}
		return _user;
	}


	loadRoleList() {
		//update privilage spv-engineer to manage user with role contain engineer
		this.store.pipe(select(currentUser)).subscribe((user) => {
			if (user) {
				this.currentRole = user.role;
				if (this.currentRole === "spv-engineer") {
					this.selection.clear();
					const queryParams = new QueryRoleModel(
						null,
						"asc",
						null,
						1,
						100000
					);
					this.rservice.getListRole(queryParams).subscribe(
						res => {
							this.roleResult = res.data.filter((i) => {
								const filterText = `${i.role.toLocaleLowerCase()}`;
								if (filterText.includes("engineer".toLocaleLowerCase())) return i;
							});

						}
					);
				} else {
					this.selection.clear();
					const queryParams = new QueryRoleModel(null, "asc", null, 1, 100000);
					this.rservice.getListRole(queryParams).subscribe(
						res => {
							this.roleResult = res.data;
						}
					);
				}
			}
		});

		// this.selection.clear();
		// const queryParams = new QueryRoleModel(
		// 	null,
		// 	"asc",
		// 	null,
		// 	1,
		// 	100000
		// );
		// this.rservice.getListRole(queryParams).subscribe(
		// 	res => {
		// 		this.roleResult = res.data;
		// 	}
		// );
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
				this.customerResultFiltered = res.data;
				this.cdr.markForCheck()
			}
		);
	}
	_setBlockValue(value, type) {
		this.userForm.patchValue({ [type]: value._id });

		if(type === 'engineer'){
			this.getSingleEngineer(value._id);
		}
		if(type === 'internalUser'){
			this.getInternalUserById(value._id);
		}
		if(type === 'externalUser'){
			this.getExternalUserById(value._id);
		}
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
			}
		);
	}
	_onKeyup(e: any, type) {
		this.userForm.patchValue({ unit: undefined });
		if(type === "engineer"){
			this._filterEngrList(e.target.value);
		}
		if(type === "internalUser"){
			this._filterInternalUserList(e.target.value);
		}
		if(type === "externalUser"){
			this._filterExternalUserList(e.target.value);
		}
	}

	_onKeyupCstmr(e: any) {
		//add rehan. fixing tenant null when add customer and tenant name
		this.userForm.patchValue({ tenant: undefined });

		let text = e.target.value
		this.customerResultFiltered = this.customerResult.filter((i) => {
			const filterText = `${i.cstrmrnm.toLocaleLowerCase()}`;
			if (filterText.includes(text.toLocaleLowerCase())) return i;
		});
	}

	_filterEngrList(text: string) {
		this.EngineerResultFiltered = this.engineerResult.filter(i => {
			const filterText = `${i.name.toLocaleLowerCase()}`;
			if (filterText.includes(text.toLocaleLowerCase())) return i;
		});
	}
	_filterInternalUserList(text: string) {
		this.internalUserResultFiltered = this.internalUserResult.filter(i => {
			const filterText = `${i.name.toLocaleLowerCase()}`;
			if (filterText.includes(text.toLocaleLowerCase())) return i;
		});
	}
	_filterExternalUserList(text: string) {
		this.externalUserResultFiltered = this.externalUserResult.filter(i => {
			const filterText = `${i.name.toLocaleLowerCase()}`;
			if (filterText.includes(text.toLocaleLowerCase())) return i;
		});
	}


	loadEngineerList() {
		this.selection.clear();
		const queryParams = new QueryExternalUserModel(
			null,
			"asc",
			null,
			1,
			100000
		);
		this.eservice.getListEngineer(queryParams).subscribe(
			res => {
				this.engineerResult = res.data;
				this.EngineerResultFiltered = this.engineerResult.slice();
				this.cdr.markForCheck();
				this.viewBlockResult.enable();
				this.loadingData.user = false
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
				this.viewBlockResult.enable();
				this.loadingData.user = false
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
				this.viewBlockResult.enable();
				this.loadingData.user = false
			}
		);
	}




	/**
	 * Add User
	 *
	 * @param _user: User
	 * @param withBack: boolean
	 */

	addUser(_user: User, withBack: boolean = false) {
		const addSubscription = this.service.createUser(_user).subscribe(
			res => {
				const message = `New user successfully has been added.`;
				this.layoutUtilsService.showActionNotification(message, MessageType.Create, 5000, true, true);
				const url = `/user-management/users`;
				this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
			},
			err => {
				console.error(err);
				const message = 'Error while adding user | ' + err.statusText;
				this.layoutUtilsService.showActionNotification(message, MessageType.Create, 5000, true, false);
			}
		);
		this.subscriptions.push(addSubscription);
	}

	/**
	 * Update user
	 *
	 * @param _user: User
	 * @param withBack: boolean
	 */


	/**
	 * Returns component title
	 */
	getComponentTitle() {
		let result = 'Create User Management';
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
				this.unitRes = res.data
				this.unit = res.data
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
		this.selectedUnit.push(unit)
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
