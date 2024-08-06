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
  selector: 'kt-view-bank',
  templateUrl: './view-bank.component.html',
  styleUrls: ['./view-bank.component.scss']
})
export class ViewBankComponent implements OnInit, OnDestroy {
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
			}
		});
		this.subscriptions.push(routeSubscription);
  	}

	initBank() {
		this.createForm();
	}

	createForm() {
		this.bankForm = this.bankFB.group({
			codeBank: [{value:this.bank.codeBank, disabled:true}],
			bank: [{value:this.bank.bank, disabled:true}],
			remarks: [{value:this.bank.remarks, disabled:true}],
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


	getComponentTitle() {	
		let result = `View Bank`;
		return result;
	}

	onAlertClose($event) {
		this.hasFormErrors = false;
	}

  	ngOnDestroy() {
		this.subscriptions.forEach(sb => sb.unsubscribe());
	}
	
}
