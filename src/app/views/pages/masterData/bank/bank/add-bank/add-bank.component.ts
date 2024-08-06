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
import { LayoutUtilsService, MessageType } from '../../../../../../core/_base/crud';
import {BankModel} from "../../../../../../core/masterData/bank/bank/bank.model";
import {
	selectLastCreatedBankId,
	selectBankActionLoading,
	selectBankById
} from "../../../../../../core/masterData/bank/bank/bank.selector";
import {BankService} from '../../../../../../core/masterData/bank/bank/bank.service';

@Component({
  selector: 'kt-add-bank',
  templateUrl: './add-bank.component.html',
  styleUrls: ['./add-bank.component.scss']
})
export class AddBankComponent implements OnInit, OnDestroy {
	// Public properties
	bank: BankModel;
	BankId$: Observable<string>;
	oldBank: BankModel;
	selectedTab = 0;
	loading$: Observable<boolean>;
	bankForm: FormGroup;
	hasFormErrors = false;
	loading : boolean = false;
	// Private properties
	private subscriptions: Subscription[] = [];
  	constructor(
		private activatedRoute: ActivatedRoute,
		private router: Router,
		private bankFB: FormBuilder,
		private subheaderService: SubheaderService,
		private layoutUtilsService: LayoutUtilsService,
		private store: Store<AppState>,
		private service: BankService,
		private layoutConfigService: LayoutConfigService
	) { }

  	ngOnInit() {
		this.loading$ = this.store.pipe(select(selectBankActionLoading));
		const routeSubscription =  this.activatedRoute.params.subscribe(params => {
			const id = params.id;
			if (id) {
				this.store.pipe(select(selectBankById(id))).subscribe(res => {
					if (res) {
						this.bank = res;
						this.oldBank = Object.assign({}, this.bank);
						this.initBank();
					}
				});
			} else {
				this.bank = new BankModel();
				this.bank.clear();
				this.initBank();
			}
		});
		this.subscriptions.push(routeSubscription);
  	}

	initBank() {
		this.createForm();
	}

	createForm() {
		this.bankForm = this.bankFB.group({
			codeBank: [this.bank.codeBank, Validators.required],
			bank: [this.bank.bank, Validators.required],
			remarks: [this.bank.remarks],
		});
	}

	goBackWithId() {
		const url = `/bank`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}

	refreshBank(isNew: boolean = false, id:string = "") {
		let url = this.router.url;
		if (!isNew) {
			this.router.navigate([url], { relativeTo: this.activatedRoute });
			return;
		}

		url = `/bank/edit/${id}`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}

	onSubmit(withBack: boolean = false) {
		this.hasFormErrors = false;
		const controls = this.bankForm.controls;
		/** check form */
		if (this.bankForm.invalid) {
			Object.keys(controls).forEach(controlName =>
				controls[controlName].markAsTouched()
			);

			this.hasFormErrors = true;
			this.selectedTab = 0;
			return;
		}

		this.loading = true;
		const editedBank = this.prepareBank();

		if (editedBank._id) {
			this.updateBank(editedBank, withBack);
			return;
		}

		this.addBank(editedBank, withBack);
	}
	prepareBank(): BankModel {
		const controls = this.bankForm.controls;
		const _bank = new BankModel();
		_bank.clear();
		_bank._id = this.bank._id;
		_bank.codeBank = controls.codeBank.value;
		_bank.bank = controls.bank.value.toLowerCase();
		_bank.remarks = controls.remarks.value;
		return _bank;
	}

	addBank( _bank: BankModel, withBack: boolean = false) {
		const addSubscription = this.service.createBank(_bank).subscribe(
			res => {
				const message = `New Bank successfully has been added.`;
				this.layoutUtilsService.showActionNotification(message, MessageType.Create, 5000, true, true);
				const url = `/bank`;
				this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
			},
			err => {
				console.error(err);
				const message = 'Error while adding bank | ' + err.statusText;
				this.layoutUtilsService.showActionNotification(message, MessageType.Create, 5000, true, false);
			}
		);
		this.subscriptions.push(addSubscription);
	}

	updateBank(_bank: BankModel, withBack: boolean = false) {
		// Update User
		// tslint:disable-next-line:prefer-const
		const addSubscription = this.service.updateBank(_bank).subscribe(
			res => {
				const message = `Bank successfully has been saved.`;
				this.layoutUtilsService.showActionNotification(message, MessageType.Update, 5000, true, true);
				const url = `/bank`;
				this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
			},
			err => {
				console.error(err);
				const message = 'Error while adding bank | ' + err.statusText;
				this.layoutUtilsService.showActionNotification(message, MessageType.Update, 5000, true, false);
			}
		);
		this.subscriptions.push(addSubscription);
	}

	getComponentTitle() {
		let result = 'Create Bank';
		if (!this.bank || !this.bank._id) {
			return result;
		}

		result = `Edit Bank`;
		return result;
	}

	onAlertClose($event) {
		this.hasFormErrors = false;
	}

  	ngOnDestroy() {
		this.subscriptions.forEach(sb => sb.unsubscribe());
	}
	
}
