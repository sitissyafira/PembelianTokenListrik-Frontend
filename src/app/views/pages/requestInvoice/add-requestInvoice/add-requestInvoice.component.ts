import {ChangeDetectorRef, Component, OnDestroy, OnInit} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { Observable, Subscription } from 'rxjs';
import { Store, select } from '@ngrx/store';
import { AppState } from '../../../../core/reducers';
import { SubheaderService, LayoutConfigService } from '../../../../core/_base/layout';
import { LayoutUtilsService, MessageType, QueryParamsModel } from '../../../../core/_base/crud';
import {RequestInvoiceModel} from "../../../../core/requestInvoice/requestInvoice.model";
import {
	selectRequestInvoiceActionLoading,
} from "../../../../core/requestInvoice/requestInvoice.selector";
import {RequestInvoiceService} from '../../../../core/requestInvoice/requestInvoice.service';
import { SelectionModel } from '@angular/cdk/collections';
import { UnitService } from '../../../../core/unit/unit.service';
import { OwnershipContractService } from '../../../../core/contract/ownership/ownership.service';
import { LeaseContractService } from '../../../../core/contract/lease/lease.service';

@Component({
  selector: 'kt-add-requestInvoice',
  templateUrl: './add-requestInvoice.component.html',
  styleUrls: ['./add-requestInvoice.component.scss']
})
export class AddRequestInvoiceComponent implements OnInit, OnDestroy {
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
				this.requestInvoice = new RequestInvoiceModel();
				this.requestInvoice.clear();
				this.initRequestInvoice();
			}
		)
		this.subscriptions.push(routeSubscription);
  	}

	initRequestInvoice() {
		this.createForm();
		this.loadUnitList();
		// this.loadProduct();
	}

	createForm() {
			this.requestInvoiceForm = this.requestInvoiceFB.group({
				request_no : [{value:"", disabled:false}],
				contract: [{value:undefined, disabled:false}],
				tenant : [{value:undefined, disabled:false}],
				unit : [{value:undefined, disabled:false}],
				name :[{value:undefined, disabled:false}],

				type_deposit : [{value:"", disabled:false}],
				desc : [{value:"", disabled:false}],
				status : [{value: "open", disabled:true}],

				created_date : [{value:this.date1.value, disabled:true}],
				created_by: [{value:this.datauser, disabled:true}],
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
				this.viewUnitResult.enable();
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
	onSubmit(withBack: boolean = false) {
		this.hasFormErrors = false;
		const controls = this.requestInvoiceForm.controls;
		if (this.requestInvoiceForm.invalid) {
			Object.keys(controls).forEach(controlName =>
				controls[controlName].markAsTouched()
			);

			this.hasFormErrors = true;
			this.selectedTab = 0;
			return;
		}

		this.loading = true;
		const editedRequestInvoice = this.prepareRequestInvoice();
		this.addRequestInvoice(editedRequestInvoice, withBack);
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

	addRequestInvoice( _requestInvoice: RequestInvoiceModel, withBack: boolean = false) {
		const addSubscription = this.service.createRequestInvoice(_requestInvoice).subscribe(
			res => {
				const message = `New stock product successfully has been added.`;
				this.layoutUtilsService.showActionNotification(message, MessageType.Create, 5000, true, true);
				const url = `/requestInvoice`;
				this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
			},
			err => {
				console.error(err);
				const message = 'Error while adding stock product | ' + err.statusText;
				this.layoutUtilsService.showActionNotification(message, MessageType.Create, 5000, true, false);
			}
		);
		this.subscriptions.push(addSubscription);
	}


	getComponentTitle() {
		let result = 'Create Request Invoice';
		return result;
	}

	onAlertClose($event) {
		this.hasFormErrors = false;
	}

  	ngOnDestroy() {
		this.subscriptions.forEach(sb => sb.unsubscribe());
	}

	inputKeydownHandler(event) {
		return event.keyCode === 8 || event.keyCode === 46 ? true : !isNaN(Number(event.key));
	}
}
