// Angular
import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
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
import { LayoutUtilsService, MessageType } from '../../../../../core/_base/crud';
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
import { QueryRoleModel } from '../../../../../core/role/queryrole.model';
import { RoleService } from '../../../../../core/role/role.service';

@Component({
	selector: 'kt-user-view',
	templateUrl: './user-view.component.html',
	styleUrls: ['./user-view.component.scss']
})
export class UserViewComponent implements OnInit, OnDestroy {
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
	roleResult: any[] = []
	hasFormErrors = false;
	selectedUnit: any[] = [];
	isCustomer: boolean = false
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
		private roleService: RoleService,
		private store: Store<AppState>,
		private service: AuthService,
		private layoutConfigService: LayoutConfigService,
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
					}
				});
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
		this.loadRoleList()
		this.getUserUnitList();
		this.userRoleValidation()
	}

	/**
	 * Create form
	 */
	createForm() {
		this.userForm = this.userFB.group({
			username: [{ value: this.user.username, disabled: true }],
			first_name: [{ value: this.user.first_name, disabled: true }],
			last_name: [{ value: this.user.last_name, disabled: true }],
			// password: [this.user.password, [Validators.required, Validators.minLength(8)]],
			role: [{ value: this.user.role._id, disabled: true }],
		});
	}

	loadRoleList() {
		const queryParams = new QueryRoleModel(
			null,
			"asc",
			null,
			1,
			10
		);
		this.roleService.getListRole(queryParams).subscribe(
			res => {
				this.roleResult = res.data;
				this.cdr.markForCheck()
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

	/**
	 * Returns component title
	 */
	getComponentTitle() {
		let result = `View User Management`;
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

	getUserUnitList() {
		let notUserUnit = [this.user.unit] // if there is no "userUnits" enter the array index "unit" in the variable
		let cond = false
		if (this.user.userUnits) {
			if (this.user.userUnits.length) cond = true
		}
		this.service.getUserUnitList({ unit: cond ? this.user.userUnits : notUserUnit }).subscribe(res => {
			this.selectedUnit = res.data
			this.cdr.markForCheck()
		})
		this.cdr.markForCheck()
	}
	userRoleValidation() {
		if (this.user.role.role == "customer") {
			this.isCustomer = true
		} else {
			this.isCustomer = false
		}

		this.cdr.markForCheck()
	}
}
