import {Component, OnDestroy, OnInit} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
// RxJS
import { BehaviorSubject, Observable, of, Subscription } from 'rxjs';
// NGRX
import { Store, select } from '@ngrx/store';
import { Update } from '@ngrx/entity';
import { AppState } from '../../../../core/reducers';
// Layout
import { SubheaderService, LayoutConfigService } from '../../../../core/_base/layout';
import { LayoutUtilsService, MessageType } from '../../../../core/_base/crud';
import {AccountTypeModel} from "../../../../core/accountType/accountType.model";
import {
	selectLastCreatedAccountTypeId,
	selectAccountTypeActionLoading,
	selectAccountTypeById
} from "../../../../core/accountType/accountType.selector";
import {AccountTypeService} from '../../../../core/accountType/accountType.service';

@Component({
  selector: 'kt-add-accountType',
  templateUrl: './add-accountType.component.html',
  styleUrls: ['./add-accountType.component.scss']
})
export class AddAccountTypeComponent implements OnInit, OnDestroy {
	// Public properties
	accountType: AccountTypeModel;
	AccountTypeId$: Observable<string>;
	oldAccountType: AccountTypeModel;
	selectedTab = 0;
	loading$: Observable<boolean>;
	accountTypeForm: FormGroup;
	hasFormErrors = false;
	loading : boolean = false;
	// Private properties
	private subscriptions: Subscription[] = [];
  	constructor(
		private activatedRoute: ActivatedRoute,
		private router: Router,
		private accountTypeFB: FormBuilder,
		private subheaderService: SubheaderService,
		private layoutUtilsService: LayoutUtilsService,
		private store: Store<AppState>,
		private service: AccountTypeService,
		private layoutConfigService: LayoutConfigService
	) { }

  	ngOnInit() {
		this.loading$ = this.store.pipe(select(selectAccountTypeActionLoading));
		const routeSubscription =  this.activatedRoute.params.subscribe(params => {
			const id = params.id;
			if (id) {
				this.store.pipe(select(selectAccountTypeById(id))).subscribe(res => {
					if (res) {
						this.accountType = res;
						this.oldAccountType = Object.assign({}, this.accountType);
						this.initAccountType();
					}
				});
			} else {
				this.accountType = new AccountTypeModel();
				this.accountType.clear();
				this.initAccountType();
			}
		});
		this.subscriptions.push(routeSubscription);
  	}

	initAccountType() {
		this.createForm();
	}

	createForm() {
		this.accountTypeForm = this.accountTypeFB.group({
			acctypeno: [this.accountType.acctypeno, Validators.required],
			status: [this.accountType.status, Validators.required],
			acctype: [this.accountType.acctype, Validators.required],
		});
	}

	goBackWithId() {
		const url = `/accountType`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}

	refreshAccountType(isNew: boolean = false, id:string = "") {
		let url = this.router.url;
		if (!isNew) {
			this.router.navigate([url], { relativeTo: this.activatedRoute });
			return;
		}

		url = `/accountType/edit/${id}`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}


	onSubmit(withBack: boolean = false) {
		this.hasFormErrors = false;
		const controls = this.accountTypeForm.controls;
		/** check form */
		if (this.accountTypeForm.invalid) {
			Object.keys(controls).forEach(controlName =>
				controls[controlName].markAsTouched()
			);

			this.hasFormErrors = true;
			this.selectedTab = 0;
			return;
		}


		this.loading = true;
		const editedAccountType = this.prepareAccountType();
		if (editedAccountType._id) {
			this.updateAccountType(editedAccountType, withBack);
			return;
		}

		this.addAccountType(editedAccountType, withBack);
	}
	prepareAccountType(): AccountTypeModel {
		const controls = this.accountTypeForm.controls;
		const _accountType = new AccountTypeModel();
		_accountType.clear();
		_accountType._id = this.accountType._id;
		_accountType.acctypeno = controls.acctypeno.value;
		_accountType.status = controls.status.value;
		_accountType.acctype = controls.acctype.value.toLowerCase();
		return _accountType;
	}

	addAccountType( _accountType: AccountTypeModel, withBack: boolean = false) {
		const addSubscription = this.service.createAccountType(_accountType).subscribe(
			res => {
				const message = `New account type successfully has been added.`;
				this.layoutUtilsService.showActionNotification(message, MessageType.Create, 5000, true, true);
				const url = `/accountType`;
				this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
			},
			err => {
				console.error(err);
				const message = 'Error while adding account type | ' + err.statusText;
				this.layoutUtilsService.showActionNotification(message, MessageType.Create, 5000, true, false);
			}
		);
		this.subscriptions.push(addSubscription);
	}

	updateAccountType(_accountType: AccountTypeModel, withBack: boolean = false) {
		// Update User
		// tslint:disable-next-line:prefer-const
		const addSubscription = this.service.updateAccountType(_accountType).subscribe(
			res => {
				const message = `Account type successfully has been saved.`;
				this.layoutUtilsService.showActionNotification(message, MessageType.Update, 5000, true, true);
				const url = `/accountType`;
				this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
			},
			err => {
				console.error(err);
				const message = 'Error while adding account yype | ' + err.statusText;
				this.layoutUtilsService.showActionNotification(message, MessageType.Update, 5000, true, false);
			}
		);
		this.subscriptions.push(addSubscription);
	}

	getComponentTitle() {
		let result = 'Create Account Type';
		if (!this.accountType || !this.accountType._id) {
			return result;
		}

		result = `Edit Account Type`;
		return result;
	}

	onAlertClose($event) {
		this.hasFormErrors = false;
	}

  	ngOnDestroy() {
		this.subscriptions.forEach(sb => sb.unsubscribe());
	}
	
}
