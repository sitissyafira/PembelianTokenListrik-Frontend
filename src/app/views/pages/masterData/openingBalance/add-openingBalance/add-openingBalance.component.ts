import {ChangeDetectorRef, Component, OnDestroy, OnInit} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
// RxJS
import { BehaviorSubject, Observable, of, Subscription } from 'rxjs';
// NGRX
import { Store, select } from '@ngrx/store';
import { Update } from '@ngrx/entity';
import { AppState } from '../../../../../core/reducers';
// Layout
import { SubheaderService, LayoutConfigService } from '../../../../../core/_base/layout';
import { LayoutUtilsService, MessageType } from '../../../../../core/_base/crud';
import {OpeningBalanceModel} from "../../../../../core/masterData/openingBalance/openingBalance.model";
import {
	selectLastCreatedOpeningBalanceId,
	selectOpeningBalanceActionLoading,
	selectOpeningBalanceById
} from "../../../../../core/masterData/openingBalance/openingBalance.selector";
import {OpeningBalanceService} from '../../../../../core/masterData/openingBalance/openingBalance.service';
import { SelectionModel } from '@angular/cdk/collections';
import { AccountTypeService } from '../../../../../core/accountType/accountType.service';
import { QueryAccountGroupModel } from '../../../../../core/accountGroup/queryag.model';
import { AccountGroupService } from '../../../../../core/accountGroup/accountGroup.service';

@Component({
  selector: 'kt-add-openingBalance',
  templateUrl: './add-openingBalance.component.html',
  styleUrls: ['./add-openingBalance.component.scss']
})
export class AddOpeningBalanceComponent implements OnInit, OnDestroy {
	// Public properties
	datauser = localStorage.getItem("user");
	openingBalance: OpeningBalanceModel;
	OpeningBalanceId$: Observable<string>;
	oldOpeningBalance: OpeningBalanceModel;
	selectedTab = 0;
	loading$: Observable<boolean>;
	openingBalanceForm: FormGroup;
	hasFormErrors = false;
	loadingData = false
	typeResult: any[] = [];
	accountResult: any[] = [];
	date1 = new FormControl(new Date());
	selection = new SelectionModel<OpeningBalanceModel>(true, []);
	// loading : boolean = false;
	// Private properties
	private loading = {
		accType: false,
		acc: false,
		submited: false
	}
	private subscriptions: Subscription[] = [];
  	constructor(
		private activatedRoute: ActivatedRoute,
		private router: Router,
		private openingBalanceFB: FormBuilder,
		private subheaderService: SubheaderService,
		private layoutUtilsService: LayoutUtilsService,
		private store: Store<AppState>,
		private service: OpeningBalanceService,
		private serviceAccount: AccountTypeService,
		private serviceAccountGroup : AccountGroupService,
		private layoutConfigService: LayoutConfigService,
		private cdr: ChangeDetectorRef
	) { }

	

  	ngOnInit() {
		this.loading$ = this.store.pipe(select(selectOpeningBalanceActionLoading));
		const routeSubscription =  this.activatedRoute.params.subscribe(params => {
			const id = params.id;
			if (id) {
				this.store.pipe(select(selectOpeningBalanceById(id))).subscribe(res => {
					if (res) {
						this.openingBalance = res;
						this.oldOpeningBalance = Object.assign({}, this.openingBalance);
						this.initOpeningBalance();
					}
				});
			} else {
				this.openingBalance = new OpeningBalanceModel();
				this.openingBalance.clear();
				this.initOpeningBalance();
			}
		});
		this.subscriptions.push(routeSubscription);
  	}

	initOpeningBalance() {
		this.createForm();
		this.loadAccount();
		this.loadParent();
	}

	createForm() {
	if (this.openingBalance._id){
		this.openingBalanceForm = this.openingBalanceFB.group({
			typeAccount : [this.openingBalance.typeAccount._id],
			coa : [this.openingBalance.coa],
			opening_balance : [this.openingBalance.opening_balance],
			remark : [this.openingBalance.remark],
			createdBy: [this.datauser],
			createdDate: [this.date1.value],
		});
		}else{
			this.openingBalanceForm = this.openingBalanceFB.group({
				typeAccount : [""],
				coa : [""],
				opening_balance : [""],
				remark : [""],
				createdBy: [this.datauser],
				createdDate: [this.date1.value],
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

	blkChange(id){
		this.selection.clear();
		const queryParams = new QueryAccountGroupModel(
			null,
			1,
			10
		)
		this.serviceAccountGroup.getListAccountByType(id).subscribe(
			res => {
				this.accountResult = res.data;
			}
		)
	}

	loadParent() {
		
	}

	setLoading(type, val) {
		this.loading = {
			...this.loading,
			[type]: val
		}
	}

	goBackWithId() {
		const url = `/openingBalance`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}

	refreshOpeningBalance(isNew: boolean = false, id:string = "") {
		let url = this.router.url;
		if (!isNew) {
			this.router.navigate([url], { relativeTo: this.activatedRoute });
			return;
		}

		url = `/openingBalance/edit/${id}`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}


	onSubmit(withBack: boolean = false) {
		this.hasFormErrors = false;
		const controls = this.openingBalanceForm.controls;
		/** check form */
		if (this.openingBalanceForm.invalid) {
			Object.keys(controls).forEach(controlName =>
				controls[controlName].markAsTouched()
			);

			this.hasFormErrors = true;
			this.selectedTab = 0;
			return;
		}


		this.loadingData = true;
		const editedOpeningBalance = this.prepareOpeningBalance();
		if (editedOpeningBalance._id) {
			this.updateOpeningBalance(editedOpeningBalance, withBack);
			return;
		}

		this.addOpeningBalance(editedOpeningBalance, withBack);
	}
	prepareOpeningBalance(): OpeningBalanceModel {
		const controls = this.openingBalanceForm.controls;
		const _openingBalance = new OpeningBalanceModel();
		_openingBalance.clear();
		_openingBalance._id = this.openingBalance._id;
		_openingBalance.typeAccount = controls.typeAccount.value;
		_openingBalance.coa = controls.coa.value;
		_openingBalance.opening_balance = controls.opening_balance.value;
		_openingBalance.remark = controls.remark.value;
		_openingBalance.createdBy = controls.createdBy.value;
		_openingBalance.createdDate = controls.createdDate.value;
		return _openingBalance;
	}

	addOpeningBalance( _openingBalance: OpeningBalanceModel, withBack: boolean = false) {
		const addSubscription = this.service.createOpeningBalance(_openingBalance).subscribe(
			res => {
				const message = `New opening balance successfully has been added.`;
				this.layoutUtilsService.showActionNotification(message, MessageType.Create, 5000, true, true);
				const url = `/openingBalance`;
				this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
			},
			err => {
				console.error(err);
				const message = 'Error while adding opening balance | ' + err.statusText;
				this.layoutUtilsService.showActionNotification(message, MessageType.Create, 5000, true, false);
			}
		);
		this.subscriptions.push(addSubscription);
	}

	updateOpeningBalance(_openingBalance: OpeningBalanceModel, withBack: boolean = false) {
		const addSubscription = this.service.updateOpeningBalance(_openingBalance).subscribe(
			res => {
				const message = `Opening Balance successfully has been saved.`;
				this.layoutUtilsService.showActionNotification(message, MessageType.Update, 5000, true, true);
				const url = `/openingBalance`;
				this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
			},
			err => {
				console.error(err);
				const message = 'Error while adding opening balance | ' + err.statusText;
				this.layoutUtilsService.showActionNotification(message, MessageType.Update, 5000, true, false);
			}
		);
		this.subscriptions.push(addSubscription);
	}

	getComponentTitle() {
		let result = 'Create Opening Balance';
		if (!this.openingBalance || !this.openingBalance._id) {
			return result;
		}

		result = `Edit Opening Balance`;
		return result;
	}

	onAlertClose($event) {
		this.hasFormErrors = false;
	}

  	ngOnDestroy() {
		this.subscriptions.forEach(sb => sb.unsubscribe());
	}
	
	inputKeydownHandler(event) {
		return event.keyCode === 8 || event.keyCode === 46 ? true : !isNaN(Number(event.key)) || event.key === '.';
	}
}
