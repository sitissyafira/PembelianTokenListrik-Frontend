import {Component, OnDestroy, OnInit} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable, Subscription } from 'rxjs';
import { Store, select } from '@ngrx/store';
import { AppState } from '../../../../../core/reducers';
import { SubheaderService, LayoutConfigService } from '../../../../../core/_base/layout';
import { LayoutUtilsService, MessageType } from '../../../../../core/_base/crud';
import {TaxModel} from "../../../../../core/masterData/tax/tax.model";
import {
	selectTaxActionLoading,
	selectTaxById
} from "../../../../../core/masterData/tax/tax.selector";
import {TaxService} from '../../../../../core/masterData/tax/tax.service';

@Component({
  selector: 'kt-add-tax',
  templateUrl: './add-tax.component.html',
  styleUrls: ['./add-tax.component.scss']
})
export class AddTaxComponent implements OnInit, OnDestroy {
	datauser = localStorage.getItem("user");
	tax: TaxModel;
	TaxId$: Observable<string>;
	oldTax: TaxModel;
	selectedTab = 0;
	loading$: Observable<boolean>;
	taxForm: FormGroup;
	hasFormErrors = false;
	loading : boolean = false;

	private subscriptions: Subscription[] = [];
  	constructor(
		private activatedRoute: ActivatedRoute,
		private router: Router,
		private taxFB: FormBuilder,
		private subheaderService: SubheaderService,
		private layoutUtilsService: LayoutUtilsService,
		private store: Store<AppState>,
		private service: TaxService,
		private layoutConfigService: LayoutConfigService
	) { }

  	ngOnInit() {
		this.loading$ = this.store.pipe(select(selectTaxActionLoading));
		const routeSubscription =  this.activatedRoute.params.subscribe(params => {
			const id = params.id;
			if (id) {
				this.store.pipe(select(selectTaxById(id))).subscribe(res => {
					if (res) {
						this.tax = res;
						this.oldTax = Object.assign({}, this.tax);
						this.initTax();
					}
				});
			} else {
				this.tax = new TaxModel();
				this.tax.clear();
				this.initTax();
			}
		});
		this.subscriptions.push(routeSubscription);
  	}

	initTax() {
		this.createForm();
	}

	createForm() {
		if (this.tax._id){
			this.taxForm = this.taxFB.group({
				tax_code: [this.tax.tax_code, Validators.required],
				tax_name: [this.tax.tax_name, Validators.required],
				nominal: [this.tax.nominal, Validators.required],
				remarks : [this.tax.remarks],
				created_by: [this.tax.created_by],
				isActive: [this.tax.isActive]
			});
		}else{
			this.taxForm = this.taxFB.group({
				tax_code: ["", Validators.required],
				tax_name: ["", Validators.required],
				nominal: ["", Validators.required],
				remarks: [""],
				created_by: [{value:this.datauser, disabled:true}],
				isActive: [""]
			});
		}
	}
	goBackWithId() {
		const url = `/tax`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}
	refreshTax(isNew: boolean = false, id:string = "") {
		let url = this.router.url;
		if (!isNew) {
			this.router.navigate([url], { relativeTo: this.activatedRoute });
			return;
		}
		url = `/tax/edit/${id}`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}
	onSubmit(withBack: boolean = false) {
		this.hasFormErrors = false;
		const controls = this.taxForm.controls;
		if (this.taxForm.invalid) {
			Object.keys(controls).forEach(controlName =>
				controls[controlName].markAsTouched()
			);

			this.hasFormErrors = true;
			this.selectedTab = 0;
			return;
		}

		this.loading = true;
		const editedTax = this.prepareTax();
		if (editedTax._id) {
			this.updateTax(editedTax, withBack);
			return;
		}
		this.addTax(editedTax, withBack);
	}

	prepareTax(): TaxModel {
		const controls = this.taxForm.controls;
		const _tax = new TaxModel();
		_tax.clear();
		_tax._id = this.tax._id;
		_tax.tax_code = controls.tax_code.value;
		_tax.tax_name = controls.tax_name.value.toLowerCase();
		_tax.nominal = controls.nominal.value;
		_tax.remarks = controls.remarks.value;
		_tax.created_by = controls.created_by.value;
		_tax.isActive = controls.isActive.value
		return _tax;
	}

	addTax( _tax: TaxModel, withBack: boolean = false) {
		const addSubscription = this.service.createTax(_tax).subscribe(
			res => {
				const message = `New Tax successfully has been added.`;
				this.layoutUtilsService.showActionNotification(message, MessageType.Create, 5000, true, true);
				const url = `/tax`;
				this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
			},
			err => {
				console.error(err);
				const message = 'Error while adding tax | ' + err.statusText;
				this.layoutUtilsService.showActionNotification(message, MessageType.Create, 5000, true, false);
			}
		);
		this.subscriptions.push(addSubscription);
	}

	updateTax(_tax: TaxModel, withBack: boolean = false) {
		const addSubscription = this.service.updateTax(_tax).subscribe(
			res => {
				const message = `Tax successfully has been saved.`;
				this.layoutUtilsService.showActionNotification(message, MessageType.Update, 5000, true, true);
				const url = `/tax`;
				this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
			},
			err => {
				console.error(err);
				const message = 'Error while adding tax | ' + err.statusText;
				this.layoutUtilsService.showActionNotification(message, MessageType.Update, 5000, true, false);
			}
		);
		this.subscriptions.push(addSubscription);
	}

	getComponentTitle() {
		let result = 'Create Tax'
		if (!this.tax || !this.tax._id) {
			return result;
		}

		result = `Edit Tax`;
		return result;
	}

	onAlertClose($event) {
		this.hasFormErrors = false;
	}

	activeOptions = [
		{ value: true, name: "Active" },
		{ value: false, name: "InActive" },
	];

  	ngOnDestroy() {
		this.subscriptions.forEach(sb => sb.unsubscribe());
	}

	inputKeydownHandler(event) {
		return event.keyCode === 8 || event.keyCode === 46 ? true : !isNaN(Number(event.key)) || event.key === '.';
	}
}
