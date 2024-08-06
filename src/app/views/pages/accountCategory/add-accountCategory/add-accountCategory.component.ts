import { Component, OnDestroy, OnInit, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FormControl } from '@angular/forms';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
// RxJS
import { BehaviorSubject, Observable, of, Subscription } from 'rxjs';
// NGRX
import { Store, select } from '@ngrx/store';
import { Update } from '@ngrx/entity';
import { AppState } from '../../../../core/reducers';
import { MatTable, MatDialog } from '@angular/material';
// Layout
import { SubheaderService, LayoutConfigService } from '../../../../core/_base/layout';
import { LayoutUtilsService, MessageType } from '../../../../core/_base/crud';
import { AccountCategoryModel } from "../../../../core/accountCategory/accountCategory.model";
import {
	selectLastCreatedAccountCategoryId,
	selectAccountCategoryActionLoading,
	selectAccountCategoryById
} from "../../../../core/accountCategory/accountCategory.selector";
import { AccountCategoryService } from '../../../../core/accountCategory/accountCategory.service';
import { AccountGroupService } from '../../../../core/accountGroup/accountGroup.service';
import { AddAccountListDialogComponent } from './add-account-list/add-account-list.dialog.component';

@Component({
	selector: 'kt-add-accountCategory',
	templateUrl: './add-accountCategory.component.html',
	styleUrls: ['./add-accountCategory.component.scss']
})
export class AddAccountCategoryComponent implements OnInit, OnDestroy {
	// Public properties
	accountCategory: AccountCategoryModel;
	AccountCategoryId$: Observable<string>;
	oldAccountCategory: AccountCategoryModel;
	selectedTab = 0;
	loading$: Observable<boolean>;
	loadingSubject = new BehaviorSubject<boolean>(true);
	accountCategoryForm: FormGroup;
	hasFormErrors = false;
	loading: boolean = false;

	dataLoading = false;
	accountList = [];

	name: string = ""

	// Mat Chips
	separatorKeysCodes: number[] = [ENTER, COMMA];
	selectedAccount = [];
	accountForm = new FormControl();
	@ViewChild('accountInput', { static: true }) accountInput: ElementRef;

	//Mat Table
	@ViewChild('myTable', { static: false }) table: MatTable<any>;

	displayedColumns = ['acctNo', 'acctName', 'accType', 'balance', 'action'];

	// Private properties
	private subscriptions: Subscription[] = [];
	constructor(
		private activatedRoute: ActivatedRoute,
		private router: Router,
		private accountCategoryFB: FormBuilder,
		private subheaderService: SubheaderService,
		private layoutUtilsService: LayoutUtilsService,
		private store: Store<AppState>,
		private service: AccountCategoryService,
		private accountService: AccountGroupService,
		private layoutConfigService: LayoutConfigService,
		private cdr: ChangeDetectorRef,
		private dialog: MatDialog,
	) { }

	ngOnInit() {
		this.loading$ = this.store.pipe(select(selectAccountCategoryActionLoading));

		const routeSubscription = this.activatedRoute.params.subscribe(params => {
			this.loadingSubject.next(true);
			const id = params.id;

			this.activatedRoute.data.subscribe(data => {
				this.name = data.name
			})

			if (id) {
				this.loadItemFromService(id);
				this.loadingSubject.next(false);
			} else {
				this.loadingSubject.next(false);
				this.accountCategory = new AccountCategoryModel();
				this.accountCategory.clear();
				this.initAccountCategory();
			}
		});

		this.subscriptions.push(routeSubscription);
	}

	initAccountCategory() {
		// this.createForm();
		this.cdr.markForCheck();
	}

	loadItem(_item) {
		if (!_item.data) this.goBack();

		this.accountCategory = _item.data;
		this.loadSelectedAccount(_item.data);
		// this.initAccountCategory();
	}

	loadSelectedAccount(_item) {
		if (_item && _item.includeCategory) {
			this.selectedAccount = _item.includeCategory;
		} else {
			this.selectedAccount = [];
		}
	}

	loadItemFromService(id: string) {
		this.service.findAccountCategoryById(id).subscribe(
			res => {
				this.loadItem(res);
			},
			err => {
				console.log('not found')
			},
			() => {
				this.loadingSubject.next(false);
			}
		);
	}

	createForm() {
		if (this.accountCategory && this.accountCategory._id) {
			this.accountCategoryForm = this.accountCategoryFB.group({
				_id: [{ value: this.accountCategory._id, disabled: true }],
				category: [this.accountCategory._id],
			});
		} else {
			this.accountCategoryForm = this.accountCategoryFB.group({
				_id: [""],
				category: [""],

			});
		}
	}

	refreshAccountCategory(isNew: boolean = false, id: string = "") {
		let url = this.router.url;
		if (!isNew) {
			this.router.navigate([url], { relativeTo: this.activatedRoute });
			return;
		}

		url = `/accountCategory/edit/${id}`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}

	goBack() {
		let url = '/accountCategory'; // if name == bs (balance sheet)
		if (this.name == 'pl') {
			url = '/accountCategory/pl'
		}
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}


	onSubmit() {
		this.loading = true;
		const editedAccountCategory = this.prepareAccountCategory();
		if (this.accountCategory._id) {
			this.updateAccountCategory(editedAccountCategory);
		} else {
			this.addAccountCategory(editedAccountCategory);
		}

	}
	prepareAccountCategory(): AccountCategoryModel {
		const _accountCategory = new AccountCategoryModel();
		_accountCategory.category = this.accountCategory._id;

		if (this.selectedAccount.length) {
			const selected = [];
			if (this.selectedAccount.length) {
				this.selectedAccount.map((item) => {
					selected.push(item._id);
				});
			}
			_accountCategory.account = selected;
		}

		return _accountCategory;
	}

	addAccountCategory(_accountCategory: AccountCategoryModel) {
		const addSubscription = this.service.createAccountCategory(_accountCategory).subscribe(
			res => {
				const message = `New account category successfully has been added.`;
				this.layoutUtilsService.showActionNotification(message, MessageType.Create, 5000, true, true);

				this.goBack();
			},
			err => {
				console.error(err);
				const message = 'Error while adding account category | ' + err.statusText;
				this.layoutUtilsService.showActionNotification(message, MessageType.Create, 5000, true, false);
			}
		);
		this.subscriptions.push(addSubscription);
	}

	updateAccountCategory(formValue: AccountCategoryModel) {
		// Update User
		// tslint:disable-next-line:prefer-const
		const addSubscription = this.service.updateAccountCategory(formValue).subscribe(
			res => {
				const message = `Account Category successfully has been saved.`
				this.layoutUtilsService.showActionNotification(message, MessageType.Update, 5000, true, true)

				this.goBack();
			},
			err => {
				console.error(err)
				const message = 'Error while adding account category | ' + err.statusText
				this.layoutUtilsService.showActionNotification(message, MessageType.Update, 5000, true, false)
			}
		);
		this.subscriptions.push(addSubscription);
	}

	getComponentTitle() {
		let result = 'Account Category';
		if (!this.accountCategory || !this.accountCategory._id) {
			return result;
		}

		result = `Account Category`;
		return result;
	}

	onAlertClose($event) {
		this.hasFormErrors = false;
	}

	ngOnDestroy() {
		this.subscriptions.forEach(sb => sb.unsubscribe());
	}

	addAccount() {
		this.dataLoading = true;
		const dialogRef = this.dialog.open(
			AddAccountListDialogComponent,
			{
				data: { selectedAccount: this.selectedAccount, accountCategory: this.accountCategory.excludeCategory },
				width: '1350px',
				height: '90%'
			}
		);

		dialogRef.afterClosed().subscribe(resp => {
			if (resp) {
				if (resp.formValue && resp.formValue.length) {
					resp.formValue.map(item => {
						this.selectedAccount.push(item);
					})
				}
			}

			this.dataLoading = false;
			this.table.renderRows();
		});

	}

	deleteItem(index) {
		this.selectedAccount.splice(index, 1);
		this.cdr.markForCheck();

		this.table.renderRows();
	}

	optionalChecking(value) {
		return value ? value : '-';
	}

}
