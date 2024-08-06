import {Component, OnDestroy, OnInit,} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {  Observable, Subscription } from 'rxjs';
import { Store, select } from '@ngrx/store';
import { AppState } from '../../../../core/reducers';
import { SubheaderService, LayoutConfigService } from '../../../../core/_base/layout';
import {LayoutUtilsService, MessageType, QueryParamsModel} from '../../../../core/_base/crud';
import {CustomerModel} from "../../../../core/customer/customer.model";
import {
	selectCustomerActionLoading,
} from "../../../../core/customer/customer.selector";
import {StateService} from '../../../../core/state/state.service';
import {CustomerService} from '../../../../core/customer/customer.service';

@Component({
  selector: 'kt-add-customer',
  templateUrl: './add-customer.component.html',
  styleUrls: ['./add-customer.component.scss']
})
export class AddCustomerComponent implements OnInit, OnDestroy {
	customer: CustomerModel;
	customerId$: Observable<string>;
	oldCustomer: CustomerModel;
	selectedTab = 0;
	loading$: Observable<boolean>;
	customerForm: FormGroup;
	hasFormErrors = false;
	codenum: any = null;
	provinceResult: any[] = [];
	regencyResult: any[] = [];
	districtResult: any[] = [];
	villageResult: any[] = [];
	postalcodeResult: any[] = [];
	propinsi: string;
	loading : Boolean = false
	private subscriptions: Subscription[] = [];
	constructor(
		private activatedRoute: ActivatedRoute,
		private router: Router,
		private customerFB: FormBuilder,
		private subheaderService: SubheaderService,
		private layoutUtilsService: LayoutUtilsService,
		private stateService: StateService,
		private customerService: CustomerService,
		private store: Store<AppState>,
		private layoutConfigService: LayoutConfigService
	) {

	}
	ngOnInit() {
		this.loading$ = this.store.pipe(select(selectCustomerActionLoading));
		const routeSubscription =  this.activatedRoute.params.subscribe(params =>
			{
				this.customer = new CustomerModel();
				this.customer.clear();
				this.initCustomer();
			});
		this.subscriptions.push(routeSubscription);
	
	}
	initCustomer(){
		this.createForm();
		this.loadProvince();
	}
	createForm() {
			this.customerForm = this.customerFB.group({
				// cstrmrcd: [{"value":this.codenum, "disabled":true}, Validators.required],
				cstrmrpid: [""],
				npwp: [""],
				cstrmrnm: ["",Validators.required],
				addrcstmr: ["", Validators.required],
				gndcstmr: ["", Validators.required],
				phncstmr: ["", Validators.required],
				emailcstmr: ["", Validators.required],
				idvllg: [],
				district: [{"value":"", "disabled": true}],
				regency: [{"value":"", "disabled": true}],
				province: [{"value": ""}],
				postcode: [{"value":"", "disabled": true}],
				type: [{value:"", disabled:true}],
				bankname: [""],
				bankaccnt: [""],
			});
	}
	// getNumber() {
	// 	this.customerService.generateCustomerCode().subscribe(
	// 		res => {
	// 			this.codenum = res.data
	// 		}
	// 	)
	// }

	loadProvince(){
		const queryParams = new QueryParamsModel(null,
			"asc",
			"grpnm",
			1,
			10);
		this.stateService.getListProvince(queryParams).subscribe(
			res => {
				this.provinceResult = res.data;
			}
		);
	}
	loadRegency(provCode){
		const queryParams = new QueryParamsModel(null,
			"asc",
			"grpnm",
			1,
			10);
		this.stateService.getListRegencyByParent(queryParams, provCode).subscribe(
			res => {
				this.regencyResult = res.data;
			}
		);
	}
	loadDistrict(regencyCode: string){
		const queryParams = new QueryParamsModel(null,
			"asc",
			"grpnm",
			1,
			10);
		this.stateService.getListDistrictByParent(queryParams, regencyCode).subscribe(
			res => {
				this.districtResult = res.data;
			}
		);
	}
	loadVillage(districtCode: string){
		const queryParams = new QueryParamsModel(null,
			"asc",
			"grpnm",
			1,
			1000);
		this.stateService.getListVillageByParent(queryParams, districtCode).subscribe(
			res => {
				this.villageResult = res.data;
			}
		);
	}
	loadPostalcode(regencyName: string){
		const queryParams = new QueryParamsModel(null,
			"asc",
			"grpnm",
			1,
			10);
		this.stateService.getListPostalcode(queryParams, regencyName).subscribe(
			res => {
				this.postalcodeResult = res.data;
				console.log(res.data)
			}
		);
	}
	provinceOnChange(item){
		if(item){
			this.customerForm.controls.regency.enable();
			this.loadRegency(item);
		}
	}
	regencyOnChange(item){
		if(item){
			this.customerForm.controls.district.enable();
			this.loadDistrict(item);
		}
	}

	
	districtOnChange(item){
		if(item){
			console.log(name);
			this.customerForm.controls.idvllg.enable();
			this.customerForm.controls.postcode.enable();
			this.loadVillage(item);
			this.districtResult.forEach((postalitem)=>{
				console.log(item);
				if( postalitem.code == item){
					this.loadPostalcode(postalitem.name);
					console.log(postalitem.name)
				}
			});
		}
	}
	goBackWithId() {
		const url = `/customer`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}
	refreshCustomer(isNew: boolean = false, id:string = "") {
		let url = this.router.url;
		if (!isNew) {
			this.router.navigate([url], { relativeTo: this.activatedRoute });
			return;
		}

		url = `/customer/edit/${id}`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}


	onSubmit(withBack: boolean = false) {
		const _title = 'Customer'
		const _description = 'Are you sure to create this customer?';
		const _waitDesciption = 'Customer is creating...';
		const _deleteMessage = `Customer Has been create`;
		
		const dialogRef = this.layoutUtilsService.jobElement(_title, _description, _waitDesciption);
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				return;
			}
			this.hasFormErrors = false;
			const controls = this.customerForm.controls;
			/** check form */
			if (this.customerForm.invalid) {
				Object.keys(controls).forEach(controlName =>
					controls[controlName].markAsTouched()
				);
	
				this.hasFormErrors = true;
				this.selectedTab = 0;
				return;
			}
			this.loading = true;
			const editedCustomer = this.prepareCustomer();
			this.addCustomer(editedCustomer, withBack);
			});
	}
	prepareCustomer(): CustomerModel {
		const controls = this.customerForm.controls;
		const _customer = new CustomerModel();
		_customer.clear();
		_customer._id = this.customer._id;
		// _customer.cstrmrcd = controls.cstrmrcd.value;
		_customer.cstrmrpid = controls.cstrmrpid.value;
		_customer.npwp = controls.npwp.value;
		_customer.cstrmrnm = controls.cstrmrnm.value.toLowerCase();
		_customer.gndcstmr = controls.gndcstmr.value.toLowerCase();
		_customer.phncstmr = controls.phncstmr.value;
		_customer.addrcstmr = controls.addrcstmr.value.toLowerCase();
		_customer.emailcstmr = controls.emailcstmr.value;
		_customer.idvllg = controls.idvllg.value;
		_customer.postcode = controls.postcode.value;
		_customer.bankname = controls.bankname.value.toLowerCase();
		_customer.bankaccnt = controls.bankaccnt.value;
		return _customer;
	}
	addCustomer( _customer: CustomerModel, withBack: boolean = false) {
		const addSubscription = this.customerService.createCustomer(_customer).subscribe(
			res => {
				const message = `New customer successfully has been added.`;
				this.layoutUtilsService.showActionNotification(message, MessageType.Create, 5000, true, true);
				const url = `/customer`;
				this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
			},
			err => {
				console.error(err);
				const message = 'Error while adding customer | ' + err.statusText;
				this.layoutUtilsService.showActionNotification(message, MessageType.Create, 5000, true, false);
			}
		);
		this.subscriptions.push(addSubscription);
	}
	getComponentTitle() {
		let result = 'Create Customer';
		return result;
	}
	onAlertClose($event) {
		this.hasFormErrors = false;
	}
	ngOnDestroy() {
		this.subscriptions.forEach(sb => sb.unsubscribe());
	}
}
