import {Component, OnDestroy, OnInit} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
// RxJS
import { BehaviorSubject, Observable, of, Subscription } from 'rxjs';
// NGRX
import { Store, select } from '@ngrx/store';
import { Update } from '@ngrx/entity';
import { AppState } from '../../../../../../core/reducers';
// Layout
import { SubheaderService, LayoutConfigService } from '../../../../../../core/_base/layout';
import { LayoutUtilsService, MessageType, QueryParamsModel } from '../../../../../../core/_base/crud';
import {AccountBankModel} from "../../../../../../core/masterData/bank/accountBank/accountBank.model";
import {
	selectLastCreatedAccountBankId,
	selectAccountBankActionLoading,
	selectAccountBankById
} from "../../../../../../core/masterData/bank/accountBank/accountBank.selector";
import {AccountBankService} from '../../../../../../core/masterData/bank/accountBank/accountBank.service';
import { BankService } from '../../../../../../core/masterData/bank/bank/bank.service';
import { SelectionModel } from '@angular/cdk/collections';
import { QueryBankModel } from '../../../../../../core/masterData/bank/bank/querybank.model';

@Component({
  selector: 'kt-add-accountBank',
  templateUrl: './add-accountBank.component.html',
  styleUrls: ['./add-accountBank.component.scss']
})
export class AddAccountBankComponent implements OnInit, OnDestroy {
	// Public properties
	accountBank: AccountBankModel;
	AccountBankId$: Observable<string>;
	oldAccountBank: AccountBankModel;
	selectedTab = 0;
	loading$: Observable<boolean>;
	accountBankForm: FormGroup;
	hasFormErrors = false;
	bankResult: any[] = [];	// Private properties
	selection = new SelectionModel<AccountBankModel>(true, []);
	loading : boolean = false;
	loadingForm : boolean
	private subscriptions: Subscription[] = [];
  	constructor(
		private activatedRoute: ActivatedRoute,
		private router: Router,
		private accountBankFB: FormBuilder,
		private subheaderService: SubheaderService,
		private layoutUtilsService: LayoutUtilsService,
		private store: Store<AppState>,
		private service: AccountBankService,
		private serviceBank: BankService,
		private layoutConfigService: LayoutConfigService
	) { }

  	ngOnInit() {
		this.loading$ = this.store.pipe(select(selectAccountBankActionLoading));
		const routeSubscription =  this.activatedRoute.params.subscribe(params => {
			const id = params.id;
			if (id) {
				this.store.pipe(select(selectAccountBankById(id))).subscribe(res => {
					if (res) {
						this.loadingForm = true
						this.accountBank = res;
						this.oldAccountBank = Object.assign({}, this.accountBank);
						this.initAccountBank();
					}
				});
			} else {
				this.accountBank = new AccountBankModel();
				this.accountBank.clear();
				this.initAccountBank();
			}
		});
		this.subscriptions.push(routeSubscription);
  	}

	initAccountBank() {
		this.createForm();
		this.loadBank();
	}
	
	async loadBank(){
		this.selection.clear();
		const queryParams = new QueryBankModel(
			null,
			"asc",
			null,
			1,
			1000
		);
		this.serviceBank.getListBank(queryParams).subscribe(
			res => {
				this.bankResult = res.data;	
				
				this.loadingForm = false
				document.body.style.height = "101%"
				window.scrollTo(0, 1);
				document.body.style.height = ""
			}
		);
	}

	createForm() {
		if(this.accountBank._id){
			this.loadBank();
			this.accountBankForm = this.accountBankFB.group({
			bank: [this.accountBank.bank._id, Validators.required],
			acctName: [this.accountBank.acctName, Validators.required],
			acctNum: [this.accountBank.acctNum, Validators.required],
			branch : [this.accountBank.branch, Validators.required],
			remarks: [this.accountBank.remarks],
		});
		}else{
			this.accountBankForm = this.accountBankFB.group({
			bank: ["", Validators.required],
			acctName: ["", Validators.required],
			acctNum: ["", Validators.required],
			branch : ["", Validators.required],
			remarks: [""],
			});
		}
	}

	goBackWithId() {
		const url = `/accountBank`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}

	refreshAccountBank(isNew: boolean = false, id:string = "") {
		let url = this.router.url;
		if (!isNew) {
			this.router.navigate([url], { relativeTo: this.activatedRoute });
			return;
		}

		url = `/accountBank/edit/${id}`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}

	onSubmit(withBack: boolean = false) {
		this.hasFormErrors = false;
		const controls = this.accountBankForm.controls;
		/** check form */
		if (this.accountBankForm.invalid) {
			Object.keys(controls).forEach(controlName =>
				controls[controlName].markAsTouched()
			);

			this.hasFormErrors = true;
			this.selectedTab = 0;
			return;
		}

		this.loading = true;
		const editedAccountBank = this.prepareAccountBank();

		if (editedAccountBank._id) {
			this.updateAccountBank(editedAccountBank, withBack);
			return;
		}
		this.addAccountBank(editedAccountBank, withBack);
	}
	prepareAccountBank(): AccountBankModel {
		const controls = this.accountBankForm.controls;
		const _accountBank = new AccountBankModel();
		_accountBank.clear();
		_accountBank._id = this.accountBank._id;
		_accountBank.bank = controls.bank.value;
		_accountBank.acctName = controls.acctName.value.toLowerCase();
		_accountBank.acctNum = controls.acctNum.value;
		_accountBank.branch = controls.branch.value;
		_accountBank.remarks = controls.remarks.value;
		return _accountBank;
	}

	addAccountBank( _accountBank: AccountBankModel, withBack: boolean = false) {
		const addSubscription = this.service.createAccountBank(_accountBank).subscribe(
			res => {
				const message = `New Account bank successfully has been added.`;
				this.layoutUtilsService.showActionNotification(message, MessageType.Create, 5000, true, true);
				const url = `/accountBank`;
				this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
			},
			err => {
				console.error(err);
				const message = 'Error while adding account bank| ' + err.statusText;
				this.layoutUtilsService.showActionNotification(message, MessageType.Create, 5000, true, false);
			}
		);
		this.subscriptions.push(addSubscription);
	}

	updateAccountBank(_accountBank: AccountBankModel, withBack: boolean = false) {
		// Update User
		// tslint:disable-next-line:prefer-const
		const addSubscription = this.service.updateAccountBank(_accountBank).subscribe(
			res => {
				const message = `Account Bank successfully has been saved.`;
				this.layoutUtilsService.showActionNotification(message, MessageType.Update, 5000, true, true);
				const url = `/accountBank`;
				this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
			},
			err => {
				console.error(err);
				const message = 'Error while adding account bank | ' + err.statusText;
				this.layoutUtilsService.showActionNotification(message, MessageType.Update, 5000, true, false);
			}
		);
		this.subscriptions.push(addSubscription);
	}




	getComponentTitle() {
		let result = 'Create Bank Account';
		if (!this.accountBank || !this.accountBank._id) {
			return result;
		}

		result = `Edit Bank Account`;
		return result;
	}

	onAlertClose($event) {
		this.hasFormErrors = false;
	}

  	ngOnDestroy() {
		this.subscriptions.forEach(sb => sb.unsubscribe());
	}
	
}
