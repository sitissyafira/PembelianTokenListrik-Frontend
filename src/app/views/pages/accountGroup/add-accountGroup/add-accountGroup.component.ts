import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
// RxJS
import { BehaviorSubject, Observable, of, Subscription } from 'rxjs';
// NGRX
import { Store, select } from '@ngrx/store';
import { Update } from '@ngrx/entity';
import { AppState } from '../../../../core/reducers';
// Layout
import { SubheaderService, LayoutConfigService } from '../../../../core/_base/layout';
import { LayoutUtilsService, MessageType } from '../../../../core/_base/crud';
import { AccountGroupModel } from "../../../../core/accountGroup/accountGroup.model";
import {
	selectLastCreatedAccountGroupId,
	selectAccountGroupActionLoading,
	selectAccountGroupById
} from "../../../../core/accountGroup/accountGroup.selector";
import { AccountGroupService } from '../../../../core/accountGroup/accountGroup.service';
import { SelectionModel } from '@angular/cdk/collections';
import { QueryAccountTypeModel } from '../../../../core/accountType/queryaccounttype.model';
import { AccountTypeService } from '../../../../core/accountType/accountType.service';
import { QueryAccountGroupModel } from '../../../../core/accountGroup/queryag.model';

@Component({
	selector: 'kt-add-accountGroup',
	templateUrl: './add-accountGroup.component.html',
	styleUrls: ['./add-accountGroup.component.scss']
})
export class AddAccountGroupComponent implements OnInit, OnDestroy {
	// Public properties
	accountGroup: AccountGroupModel;
	AccountGroupId$: Observable<string>;
	oldAccountGroup: AccountGroupModel;
	selectedTab = 0;
	loading$: Observable<boolean>;
	accountGroupForm: FormGroup;
	hasFormErrors = false;
	subAcc: boolean = false;
	editMode: boolean = false;
	ceklist: boolean = true;

	// Data list parent
	parentResult: any[] = [];

	// Condition is Parent
	isParent: boolean = true

	// Form Data Parent Or Child
	formParentOrChild: any = new FormControl()

	// Private properties
	private subscriptions: Subscription[] = [];
	private depth = 0;
	loading = {
		accType: false,
		acc: false,
		submited: false
	}
	typeResult: any[] = [];
	accountResult: any[] = [];
	selection = new SelectionModel<AccountGroupModel>(true, []);
	constructor(
		private activatedRoute: ActivatedRoute,
		private router: Router,
		private accountGroupFB: FormBuilder,
		private layoutUtilsService: LayoutUtilsService,
		private store: Store<AppState>,
		private service: AccountGroupService,
		private serviceAccount: AccountTypeService,
		private layoutConfigService: LayoutConfigService,
		private cdr: ChangeDetectorRef
	) { }

	ngOnInit() {
		this.loading$ = this.store.pipe(select(selectAccountGroupActionLoading));
		const routeSubscription = this.activatedRoute.params.subscribe(params => {
			const id = params.id;
			if (id) {
				this.store.pipe(select(selectAccountGroupById(id))).subscribe(res => {
					if (res) {
						this.accountGroup = res;
						this.oldAccountGroup = Object.assign({}, this.accountGroup);
						this.initAccountGroup();
						this.editMode = true;
					}
				});
			} else {
				this.accountGroup = new AccountGroupModel();
				this.accountGroup.clear();
				this.initAccountGroup();
			}
		});
		this.subscriptions.push(routeSubscription);
		this.subAcc = this.accountGroup && this.accountGroup.AccId ? true : false;

		// set loading for subAcc to true in editMode
		if (this.editMode) this.setLoading('acc', true);
	}

	initAccountGroup() {
		this.createForm();
		this.loadAccount();
		this.loadParent("");
	}


	createForm() {
		if (this.accountGroup._id) {
			const isChildCond = this.accountGroup.isChild === true ? "child" : "parent"
			this.formParentOrChild.setValue(isChildCond)
			this.isParent = this.accountGroup.isChild === true ? false : true

			this.loadAccount();
			this.accountGroupForm = this.accountGroupFB.group({
				AccType: [{ value: this.accountGroup.AccType._id, disabled: false }, Validators.required],
				acctNo: [this.accountGroup.acctNo, Validators.required],
				acctName: [{ value: this.accountGroup.acctName, disabled: false }, Validators.required],
				AccId: [{ value: this.accountGroup.AccId, disabled: true }],
				openingBalance: [{ value: this.accountGroup.openingBalance, disabled: false }],
				balance: [{ value: this.accountGroup.balance, disabled: false }],
				// New Form
				parentId: [{ value: this.accountGroup.parent ? this.accountGroup.parent._id : "", disabled: false }],
				parentName: [{ value: this.accountGroup.parent ? (this.accountGroup.parent.acctNo + " - " + this.accountGroup.parent.acctName) : "", disabled: false }],
				parentOrHeader: [{ value: this.accountGroup.isChild === true ? "child" : "parent", disabled: true }],
			});
		} else {
			this.accountGroupForm = this.accountGroupFB.group({
				AccType: ["", Validators.required],
				acctNo: ["", Validators.required],
				acctName: ["", Validators.required],
				AccId: [this.accountGroup.AccId],
				openingBalance: [{ value: this.accountGroup.openingBalance, disabled: false }],
				balance: [{ value: this.accountGroup.balance, disabled: false }],
				// New Form
				parentId: [{ value: "", disabled: false }],
				parentName: [{ value: "", disabled: false }],
				parentOrHeader: [{ value: "", disabled: false }, Validators.required],
			});
		}
	}

	loadAccount() {
		this.setLoading('accType', true);
		this.selection.clear();

		this.serviceAccount.getListAccountTypeNoParam().subscribe(
			res => {
				this.typeResult = res.data;
				this.setLoading('accType', false);
				this.cdr.markForCheck();
			}
		);
	}

	/**
	 * searchParent
	 * @param event 
	 */
	searchParent(event) {
		this.loadParent(event.target.value)
	}

	/**
	 * loadParent
	 * @param text 
	 */
	loadParent(text: string) { // Flow Baru
		this.selection.clear();
		const queryParams = text
		this.service.getParent(queryParams).subscribe(
			res => {
				this.parentResult = res.data;
				this.cdr.markForCheck()
			}
		);
	}

	/**
	 * parentOnChange
	 * @param id 
	 */
	parentOnChange(id) {
		const controls = this.accountGroupForm.controls;
		controls.parentId.setValue(id)
	}

	/**
	 * onClickParentOrChild
	 * @param event 
	 */
	onClickParentOrChild(event) {
		// this.formParentOrChild = event
		const controls = this.accountGroupForm.controls;
		const resultForParent = event.value === "parent" ? true : event.value === "child" ? false : false
		const resultForChild = event.value === "parent" ? false : event.value === "child" ? true : true
		this.isParent = resultForParent
		controls.parentOrHeader.setValue(resultForChild)
	}

	// loadParent() {
	// 	this.selection.clear();
	// 	const queryParams = new QueryAccountGroupModel(
	// 		null,
	// 		1,
	// 		10
	// 	);
	// }

	goBackWithId() {
		const url = `/accountGroup`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}

	refreshAccountGroup(isNew: boolean = false, id: string = "") {
		let url = this.router.url;
		if (!isNew) {
			this.router.navigate([url], { relativeTo: this.activatedRoute });
			return;
		}

		url = `/accountGroup/edit/${id}`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}

	onSubmit(withBack: boolean = false) {
		this.hasFormErrors = false;
		const controls = this.accountGroupForm.controls;

		// Condition If Child True and no choose parent #START
		if (this.isParent == false) {
			if (!controls.parentId.value) {
				const message = `Choose parent account!`;
				this.layoutUtilsService.showActionNotification(message, MessageType.Create, 5000, true, true);
				return
			}
		}
		// Condition If Child True and no choose parent #END 

		/** check form */
		if (this.accountGroupForm.invalid) {
			Object.keys(controls).forEach(controlName =>
				controls[controlName].markAsTouched()
			);

			this.hasFormErrors = true;
			this.selectedTab = 0;
			return;
		}

		this.setLoading('submited', true);

		const editedAccountGroup = this.prepareAccountGroup();
		editedAccountGroup.depth = this.depth;

		if (editedAccountGroup._id) {
			this.updateAccountGroup(editedAccountGroup, withBack);
			return;
		}
		this.addAccountGroup(editedAccountGroup, withBack);
	}

	prepareAccountGroup(): AccountGroupModel {
		const controls = this.accountGroupForm.controls;
		const _accountGroup = new AccountGroupModel();
		_accountGroup.clear();
		_accountGroup._id = this.accountGroup._id;
		_accountGroup.AccType = controls.AccType.value;
		_accountGroup.acctNo = controls.acctNo.value;
		_accountGroup.acctName = controls.acctName.value;
		_accountGroup.balance = controls.balance.value;
		_accountGroup.openingBalance = controls.openingBalance.value;
		_accountGroup.AccId = controls.AccId.value;
		return _accountGroup;
	}

	addAccountGroup(_accountGroup: AccountGroupModel, withBack: boolean = false) {
		// Remove parent id when subAccount unchecked and change isChild to true if checked
		// if (!this.subAcc)
		// 	_accountGroup.AccId = "";
		// else if (this.subAcc && _accountGroup.AccId)
		// 	_accountGroup.isChild = true;

		const controls = this.accountGroupForm.controls
		_accountGroup.isChild = controls.parentOrHeader.value

		if (controls.parentId.value) {
			_accountGroup.parent = controls.parentId.value
			_accountGroup.AccId = controls.parentId.value
			_accountGroup.depth = 1
		} else _accountGroup.depth = 0

		console.log(_accountGroup, "_accountGroup")


		const addSubscription = this.service.createAccountGroup(_accountGroup).subscribe(
			res => {
				const url = `/accountGroup`;
				if (res.status === "validate") {
					// this.loading.submited = false
					// this.loading.acc = false
					// this.editMode = false
					const message = `Account COA exists`;
					this.layoutUtilsService.showActionNotification(message, MessageType.Create, 5000, true, true);
					this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
					return
				}

				const message = `New Account Group successfully has been added.`;
				this.layoutUtilsService.showActionNotification(message, MessageType.Create, 5000, true, true);
				this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
			},
			err => {
				console.error(err);
				const message = 'Error while adding account group | ' + err.statusText;
				this.layoutUtilsService.showActionNotification(message, MessageType.Create, 5000, true, false);
			},
			() => {
				this.setLoading('submited', false);
			}
		);
		this.subscriptions.push(addSubscription);
	}

	updateAccountGroup(_accountGroup: AccountGroupModel, withBack: boolean = false) {
		if (this.subAcc && _accountGroup.AccId) delete _accountGroup.isChild;
		else _accountGroup.isChild = true;

		// Send data start ==========>
		const controls = this.accountGroupForm.controls

		_accountGroup.AccType = controls.AccType.value
		_accountGroup.acctNo = controls.acctNo.value
		_accountGroup.acctName = controls.acctName.value
		_accountGroup.openingBalance = controls.openingBalance.value
		_accountGroup.balance = controls.balance.value
		// _accountGroup.parent = controls.parentId.value

		if (controls.parentId.value) {
			_accountGroup.parent = controls.parentId.value
			_accountGroup.AccId = controls.parentId.value
		}

		if (controls.parentOrHeader.value === "child") _accountGroup.isChild = true;
		else if (controls.parentOrHeader.value === "parent") _accountGroup.isChild = false;
		else {
			_accountGroup.isChild = controls.parentOrHeader.value
			if (controls.parentOrHeader.value === true) _accountGroup.depth = 1;
			else if (controls.parentOrHeader.value === false) {
				_accountGroup.depth = 0;
				_accountGroup.parent = null
			}
		}


		// Send data end ==========>


		const addSubscription = this.service.updateAccountGroup(_accountGroup).subscribe(
			res => {
				const message = `Account successfully has been saved.`;
				this.layoutUtilsService.showActionNotification(message, MessageType.Update, 5000, true, true);
				const url = `/accountGroup`;
				this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
			},
			err => {
				console.error(err);
				const message = 'Error while adding account | ' + err.statusText;
				this.layoutUtilsService.showActionNotification(message, MessageType.Update, 5000, true, false);
			},
			() => {
				this.setLoading('submited', false);
			}
		);
		this.subscriptions.push(addSubscription);
	}

	getComponentTitle() {
		let result = 'Create Account';
		if (!this.accountGroup || !this.accountGroup._id) {
			return result;
		}

		result = `Edit Account`;
		return result;
	}

	onAlertClose($event) {
		this.hasFormErrors = false;
	}

	ngOnDestroy() {
		this.subscriptions.forEach(sb => sb.unsubscribe());
	}

	toggleSubAcc() {
		this.subAcc = !this.subAcc;

		// make depth to 0 if subAcc is false
		if (!this.subAcc) this.depth = 0;
	}

	setLoading(type, val) {
		this.loading = {
			...this.loading,
			[type]: val
		}
	}

	// Fetch accList after type selected
	selectTypeChange(e, id) {
		if (e.isUserInput) {
			this.setLoading('acc', true);
			if (!this.editMode) {
				this.subAcc = false;
				this.depth = 0;
			}

			this.service.getListByType(id).subscribe(res => {
				this.accountResult = res.data;

				this.setLoading('acc', false);
				this.cdr.markForCheck();
			});
		}
	}

	// Update depth after selection
	selectFormChange(event, depth) {
		if (event.isUserInput) this.depth = parseInt(depth) + 1;
	}

	charIsLetter(char) {
		if (typeof char !== 'string') {
			return false;
		}
		if (/^[a-zA-Z]+$/.test(char)) {
			return char;
		}
	}

	// onkeydown handler input
	inputKeydownHandler(event) {
		// return event.keyCode === 8 || event.keyCode === 46  ? true : !isNaN(Number(event.key)) || event.key === '.';
		return event.keyCode === 8 || event.keyCode === 46 || this.charIsLetter(event.key) ? true : !isNaN(Number(event.key)) || event.key === '.';
	}

	// disabled account No COA on Edit and add
	ceklis(e) {
		console.log(e)
		let abc = this.accountGroupForm.controls
		if (e == true) {
			abc.acctNo.disable();
		} else {
			abc.acctNo.enable();
		}
	}
}
