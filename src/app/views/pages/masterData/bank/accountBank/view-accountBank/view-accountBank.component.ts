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
  selector: 'kt-view-accountBank',
  templateUrl: './view-accountBank.component.html',
  styleUrls: ['./view-accountBank.component.scss']
})
export class ViewAccountBankComponent implements OnInit, OnDestroy {
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
			bank: [{value:this.accountBank.bank._id, disabled:true}],
			acctName: [{value:this.accountBank.acctName, disabled:true}],
			acctNum: [{value:this.accountBank.acctNum, disabled:true}],
			branch : [{value:this.accountBank.branch, disabled:true}],
			remarks: [{value:this.accountBank.remarks, disabled:true}],
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

	getComponentTitle() {
		let result = `View Bank Account`;
		return result;
	}

	onAlertClose($event) {
		this.hasFormErrors = false;
	}

  	ngOnDestroy() {
		this.subscriptions.forEach(sb => sb.unsubscribe());
	}
	
}
