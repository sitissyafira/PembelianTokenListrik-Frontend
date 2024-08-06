import {ChangeDetectorRef, Component, OnDestroy, OnInit} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Observable, Subscription } from 'rxjs';
import { Store, select } from '@ngrx/store';
import { AppState } from '../../../../core/reducers';
import { SubheaderService, LayoutConfigService } from '../../../../core/_base/layout';
import { LayoutUtilsService, MessageType, QueryParamsModel } from '../../../../core/_base/crud';
import {RequestInvoiceModel} from "../../../../core/requestInvoice/requestInvoice.model";
import {
	selectRequestInvoiceActionLoading,
	selectRequestInvoiceById
} from "../../../../core/requestInvoice/requestInvoice.selector";
import {RequestInvoiceService} from '../../../../core/requestInvoice/requestInvoice.service';
import { SelectionModel } from '@angular/cdk/collections';
import { UnitService } from '../../../../core/unit/unit.service';
import { OwnershipContractService } from '../../../../core/contract/ownership/ownership.service';
import { LeaseContractService } from '../../../../core/contract/lease/lease.service';


@Component({
  selector: 'kt-edit-requestInvoice',
  templateUrl: './edit-requestInvoice.component.html',
  styleUrls: ['./edit-requestInvoice.component.scss']
})
export class EditRequestInvoiceComponent implements OnInit, OnDestroy {
	datauser = localStorage.getItem("user");
	requestInvoice: RequestInvoiceModel;
	RequestInvoiceId$: Observable<string>;
    selection = new SelectionModel<RequestInvoiceModel>(true, []);
	oldRequestInvoice: RequestInvoiceModel;
	selectedTab = 0;
	loading$: Observable<boolean>;
	requestInvoiceForm: FormGroup;
	hasFormErrors = false;
	loading : boolean = false;
	contractResult: any[] = [];
	UOMResult: any[] = [];
	date1 = new FormControl(new Date());
	type;
	unitResultFiltered = [];
	viewUnitResult = new FormControl();


	private subscriptions: Subscription[] = [];
  	constructor(
		private activatedRoute: ActivatedRoute,
		private router: Router,
		private requestInvoiceFB: FormBuilder,
		private subheaderService: SubheaderService,
		private layoutUtilsService: LayoutUtilsService,
		private store: Store<AppState>,
		private service: RequestInvoiceService,
		private unitService : UnitService,
		private leaseService : LeaseContractService,
		private ownService : OwnershipContractService,
		private cd: ChangeDetectorRef,
		private layoutConfigService: LayoutConfigService
	) { }

  	ngOnInit() {
		this.loading$ = this.store.pipe(select(selectRequestInvoiceActionLoading));
		const routeSubscription =  this.activatedRoute.params.subscribe(params => {
			const id = params.id;
			if (id) {
				this.store.pipe(select(selectRequestInvoiceById(id))).subscribe(res => {
					if (res) {
						this.requestInvoice = res;


						this.viewUnitResult.disable();
						this.viewUnitResult.setValue(`${res.unit.cdunt}`);
						this._filterCstmrList(`${res.unit.cdunt}`);
						this.oldRequestInvoice = Object.assign({}, this.requestInvoice);
						this.initRequestInvoice();
					}
				});
			}
		});
		this.subscriptions.push(routeSubscription);
  	}

	initRequestInvoice() {
		this.createForm();
		this.loadUnitList();
		this.getSingleCustomer(this.requestInvoice.tenant);
	}

	createForm() {
			this.requestInvoiceForm = this.requestInvoiceFB.group({
				request_no : [{value:this.requestInvoice.request_no, disabled:true}],
				contract: [{value:this.requestInvoice.contract, disabled:false}],
				tenant : [{value:this.requestInvoice.tenant, disabled:false}],
				unit : [{value:this.requestInvoice.unit, disabled:true}],
				name :[{value:this.requestInvoice.contract.contact_name, disabled:true}],
				type_deposit : [{value:this.requestInvoice.type_deposit, disabled:true}],
				desc : [{value:this.requestInvoice.desc, disabled:true}],
				status : [{value: "cancel", disabled:true}],
				created_date : [{value:this.requestInvoice.created_date, disabled:true}],
				created_by: [{value:this.requestInvoice.created_by, disabled:true}],
			});
	}



	/**
	 * @param value
	 */
	 _setUnitValue(value) {
		this.requestInvoiceForm.patchValue({ unit: value._id });
		this.getSingleCustomer(value._id);
	}

	_onKeyup(e: any) {
		this.requestInvoiceForm.patchValue({ unit: undefined });
		this._filterCstmrList(e.target.value);
	}
	
	_filterCstmrList(text: string) {
		this.unitResultFiltered = this.contractResult.filter(i => {
			const filterText = `${i.cdunt.toLocaleLowerCase()}`;
			if(filterText.includes(text.toLocaleLowerCase())) return i;
		});
	}

	loadUnitList() {
		this.selection.clear();
		const queryParams = new QueryParamsModel(
			null,
			"asc",
			null,
			1,
			100000
		);
		this.unitService.getDataUnitForParking(queryParams).subscribe(
			res => {
				this.contractResult = res.data;
				this.unitResultFiltered = this.contractResult.slice();
				this.cd.markForCheck();
				this.viewUnitResult.disable();
			}
		);
	}

	getSingleCustomer(id){
		const controls = this.requestInvoiceForm.controls;
		this.unitService.getUnitById(id).subscribe(
			data => {
				this.type = data.data.type;
				
				if (this.type == "owner" || this.type == "pp"){
					this.getDataOwner(id)
				}else{
					this.leaseService.findLeaseContractByUnit(id).subscribe(
							datalease => {
								this.requestInvoiceForm.controls.contract.setValue(datalease.data[0]._id);
								this.requestInvoiceForm.controls.tenant.setValue(datalease.data[0].cstmr);
								this.requestInvoiceForm.controls.name.setValue(datalease.data[0].contact_name);
							}
						)
					}	
				}
		)
	}

	getDataOwner(id){
		const controls = this.requestInvoiceForm.controls;
		this.ownService.findOwnershipContractByUnit(id).subscribe(
			dataowner => {				
				this.requestInvoiceForm.controls.contract.setValue(dataowner.data[0]._id);
				this.requestInvoiceForm.controls.tenant.setValue(dataowner.data[0].cstmr);
				this.requestInvoiceForm.controls.name.setValue(dataowner.data[0].contact_name);
			})
	}



	onSubmit(withBack: boolean = false) {
		this.hasFormErrors = false;
		const controls = this.requestInvoiceForm.controls;
		/** check form */
		if (this.requestInvoiceForm.invalid) {
			Object.keys(controls).forEach(controlName =>
				controls[controlName].markAsTouched()
			);

			this.hasFormErrors = true;
			this.selectedTab = 0;
			return;
		}

		this.loading = true;
		const preparedInvoice = this.prepareRequestInvoice();
		this.updateInvoice(preparedInvoice, withBack);
	}



	prepareRequestInvoice(): RequestInvoiceModel {
		const controls = this.requestInvoiceForm.controls;
		const _requestInvoice = new RequestInvoiceModel();
		_requestInvoice.clear();
		_requestInvoice._id = this.requestInvoice._id;
		_requestInvoice.request_no = controls.request_no.value;
		_requestInvoice.contract = controls.contract.value;
		_requestInvoice.tenant = controls.tenant.value;
		_requestInvoice.name = controls.name.value;
		_requestInvoice.type_deposit = controls.type_deposit.value;
		_requestInvoice.desc = controls.desc.value;
		_requestInvoice.status = controls.status.value;
		_requestInvoice.unit = controls.unit.value;

		_requestInvoice.created_date = controls.created_date.value;
		_requestInvoice.created_by = controls.created_by.value;
		return _requestInvoice;
	}


	updateInvoice(_requestInvoice: RequestInvoiceModel, withBack: boolean = false) {
		// Update User
		// tslint:disable-next-line:prefer-const
		const addSubscription = this.service.updateRequestInvoice(_requestInvoice).subscribe(
			res => {
				const message = `Invoice successfully has been saved.`;
				this.layoutUtilsService.showActionNotification(message, MessageType.Update, 5000, true, true);
				const url = `/requestInvoice`;
				this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
			},
			err => {
				console.error(err);
				const message = 'Error while adding invoice | ' + err.statusText;
				this.layoutUtilsService.showActionNotification(message, MessageType.Update, 5000, true, false);
			}
		);
		this.subscriptions.push(addSubscription);
	}






	goBackWithId() {
		const url = `/requestInvoice`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}
	refreshRequestInvoice(isNew: boolean = false, id:string = "") {
		let url = this.router.url;
		if (!isNew) {
			this.router.navigate([url], { relativeTo: this.activatedRoute });
			return;
		}
		url = `/requestInvoice/edit/${id}`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}


	getComponentTitle() {
		let result = `Cancel Request Invoice`;
		return result;
	}

	onAlertClose($event) {
		this.hasFormErrors = false;
	}

  	ngOnDestroy() {
		this.subscriptions.forEach(sb => sb.unsubscribe());
	}
}
