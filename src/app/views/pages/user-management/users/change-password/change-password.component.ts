import {Component, OnDestroy, OnInit} from '@angular/core';
import {Address, selectUserById, selectUsersActionLoading, SocialNetworks, User, UserUpdated} from '../../../../../core/auth';
import {BehaviorSubject, Observable, Subscription} from 'rxjs';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {select, Store} from '@ngrx/store';
import {ActivatedRoute, Router} from '@angular/router';
import {LayoutConfigService, SubheaderService} from '../../../../../core/_base/layout';
import {LayoutUtilsService, MessageType} from '../../../../../core/_base/crud';
import {AppState} from '../../../../../core/reducers';
import {Update} from '@ngrx/entity';

@Component({
  selector: 'kt-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.scss']
})
export class ChangePasswordComponent implements OnInit, OnDestroy {
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
	// Private properties
	private subscriptions: Subscription[] = [];
	constructor(private activatedRoute: ActivatedRoute,
				private router: Router,
				private userFB: FormBuilder,
				private subheaderService: SubheaderService,
				private layoutUtilsService: LayoutUtilsService,
				private store: Store<AppState>,
				private layoutConfigService: LayoutConfigService) { }

	ngOnInit() {
		this.loading$ = this.store.pipe(select(selectUsersActionLoading));
		const routeSubscription =  this.activatedRoute.params.subscribe(params => {
			const id = params.id;
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
		});
		this.subscriptions.push(routeSubscription);
	}

	ngOnDestroy(){}

	initUser() {
		this.createForm();
		this.subheaderService.setTitle('Change password user');
		this.subheaderService.setBreadcrumbs([
			{ title: 'User Management', page: `user-management` },
			{ title: 'Users',  page: `user-management/users` },
			{ title: 'Change password user', page: `user-management/users/change-password`, queryParams: { id: this.user._id } }
		]);
	}

	createForm() {
		this.userForm = this.userFB.group({
			password: ["", [Validators.required, Validators.minLength(8)]],
			password_confirm : ["", [Validators.required]]
		}, { validators: MustMatch("password", "password_confirm")});
	}
	goBackWithId() {
		const url = `/user-management/users`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}
	reset() {
		this.user = Object.assign({}, this.oldUser);
		this.createForm();
		this.hasFormErrors = false;
		this.userForm.markAsPristine();
		this.userForm.markAsUntouched();
		this.userForm.updateValueAndValidity();
	}
	prepareUser(): User {
		const controls = this.userForm.controls;
		const _user = new User();
		_user.clear();
		_user._id = this.user._id;
		_user.first_name = this.oldUser.first_name;
		_user.last_name = this.oldUser.last_name;
		_user.role = this.oldUser.role;
		_user.password = controls.password.value;
		return _user;
	}
	updateUser(_user: User, withBack: boolean = false) {
		// Update User
		// tslint:disable-next-line:prefer-const
		console.log(_user);
		const updatedUser: Update<User> = {
			id: _user.id,
			changes: _user
		};
		this.store.dispatch(new UserUpdated( { partialUser: updatedUser, user: _user }));
		const message = `User successfully has been saved.`;
		this.layoutUtilsService.showActionNotification(message, MessageType.Update, 5000, true, true);
		if (withBack) {
			this.goBackWithId();
		} else {
			this.refreshUser(false);
		}
	}
	refreshUser(isNew: boolean = false, id:string = "") {
		let url = this.router.url;
		if (!isNew) {
			this.router.navigate([url], { relativeTo: this.activatedRoute });
			return;
		}

		url = `/user-management/users/change-password/${id}`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}

	onSubmit(withBack: boolean = false) {
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
		if (editedUser._id) {
			this.updateUser(editedUser, withBack);
			return;
		}
	}
	getComponentTitle() {
		let result = '';
		result = `Change password`;
		return result;
	}
	onAlertClose($event) {
		this.hasFormErrors = false;
	}
}
export function MustMatch(controlName: string, matchingControlName: string) {
	return (formGroup: FormGroup) => {
		const control = formGroup.controls[controlName];
		const matchingControl = formGroup.controls[matchingControlName];

		if (matchingControl.errors && !matchingControl.errors.mustMatch) {
			// return if another validator has already found an error on the matchingControl
			return;
		}

		// set error on matchingControl if validation fails
		if (control.value !== matchingControl.value) {
			matchingControl.setErrors({ mustMatch: true });
		} else {
			matchingControl.setErrors(null);
		}
	}
}
