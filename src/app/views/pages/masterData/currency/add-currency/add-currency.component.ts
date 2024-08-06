import {Component, OnDestroy, OnInit} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable, Subscription } from 'rxjs';
import { Store, select } from '@ngrx/store';
import { AppState } from '../../../../../core/reducers';
import { SubheaderService, LayoutConfigService } from '../../../../../core/_base/layout';
import { LayoutUtilsService, MessageType } from '../../../../../core/_base/crud';
import {CurrencyModel} from "../../../../../core/masterData/currency/currency.model";
import {
	selectCurrencyActionLoading,
	selectCurrencyById
} from "../../../../../core/masterData/currency/currency.selector";
import {CurrencyService} from '../../../../../core/masterData/currency/currency.service';

@Component({
  selector: 'kt-add-currency',
  templateUrl: './add-currency.component.html',
  styleUrls: ['./add-currency.component.scss']
})
export class AddCurrencyComponent implements OnInit, OnDestroy {
	datauser = localStorage.getItem("user");
	currency: CurrencyModel;
	CurrencyId$: Observable<string>;
	oldCurrency: CurrencyModel;
	selectedTab = 0;
	loading$: Observable<boolean>;
	currencyForm: FormGroup;
	hasFormErrors = false;
	loading : boolean = false;

	private subscriptions: Subscription[] = [];
  	constructor(
		private activatedRoute: ActivatedRoute,
		private router: Router,
		private currencyFB: FormBuilder,
		private subheaderService: SubheaderService,
		private layoutUtilsService: LayoutUtilsService,
		private store: Store<AppState>,
		private service: CurrencyService,
		private layoutConfigService: LayoutConfigService
	) { }

  	ngOnInit() {
		this.loading$ = this.store.pipe(select(selectCurrencyActionLoading));
		const routeSubscription =  this.activatedRoute.params.subscribe(params => {
			const id = params.id;
			if (id) {
				this.store.pipe(select(selectCurrencyById(id))).subscribe(res => {
					if (res) {
						this.currency = res;
						this.oldCurrency = Object.assign({}, this.currency);
						this.initCurrency();
					}
				});
			} else {
				this.currency = new CurrencyModel();
				this.currency.clear();
				this.initCurrency();
			}
		});
		this.subscriptions.push(routeSubscription);
  	}

	initCurrency() {
		this.createForm();
	}


	createForm() {
		if (this.currency._id){
			this.currencyForm = this.currencyFB.group({
				currency: [this.currency.currency, Validators.required],
				region: [this.currency.region, Validators.required],
				value: [this.currency.value, Validators.required],
				created_by: [this.currency.created_by],
			});
		}else{
			this.currencyForm = this.currencyFB.group({
				currency: ["", Validators.required],
				region: ["", Validators.required],
				value: ["", Validators.required],
				created_by: [{value:this.datauser, disabled:true}],
			});
		}
	}

	goBackWithId() {
		const url = `/currency`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}

	refreshCurrency(isNew: boolean = false, id:string = "") {
		let url = this.router.url;
		if (!isNew) {
			this.router.navigate([url], { relativeTo: this.activatedRoute });
			return;
		}
		url = `/currency/edit/${id}`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}

	onSubmit(withBack: boolean = false) {
		this.hasFormErrors = false;
		const controls = this.currencyForm.controls;
		if (this.currencyForm.invalid) {
			Object.keys(controls).forEach(controlName =>
				controls[controlName].markAsTouched()
			);

			this.hasFormErrors = true;
			this.selectedTab = 0;
			return;
		}

		this.loading = true;
		const editedCurrency = this.prepareCurrency();
		if (editedCurrency._id) {
			this.updateCurrency(editedCurrency, withBack);
			return;
		}
		this.addCurrency(editedCurrency, withBack);
	}

	prepareCurrency(): CurrencyModel {
		const controls = this.currencyForm.controls;
		const _currency = new CurrencyModel();
		_currency.clear();
		_currency._id = this.currency._id;
		_currency.currency = controls.currency.value.toLowerCase();
		_currency.region = controls.region.value.toLowerCase();
		_currency.value = controls.value.value;
		_currency.created_by = controls.created_by.value;
		return _currency;
	}

	addCurrency( _currency: CurrencyModel, withBack: boolean = false) {
		const addSubscription = this.service.createCurrency(_currency).subscribe(
			res => {
				const message = `New currency successfully has been added.`;
				this.layoutUtilsService.showActionNotification(message, MessageType.Create, 5000, true, true);
				const url = `/currency`;
				this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
			},
			err => {
				console.error(err);
				const message = 'Error while adding currency | ' + err.statusText;
				this.layoutUtilsService.showActionNotification(message, MessageType.Create, 5000, true, false);
			}
		);
		this.subscriptions.push(addSubscription);
	}

	updateCurrency(_currency: CurrencyModel, withBack: boolean = false) {
		const addSubscription = this.service.updateCurrency(_currency).subscribe(
			res => {
				const message = `Currency successfully has been saved.`;
				this.layoutUtilsService.showActionNotification(message, MessageType.Update, 5000, true, true);
				const url = `/currency`;
				this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
			},
			err => {
				console.error(err);
				const message = 'Error while adding currency | ' + err.statusText;
				this.layoutUtilsService.showActionNotification(message, MessageType.Update, 5000, true, false);
			}
		);
		this.subscriptions.push(addSubscription);
	}

	getComponentTitle() {
		let result = 'Create Currency';
		if (!this.currency || !this.currency._id) {
			return result;
		}

		result = `Edit Currency`;
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
