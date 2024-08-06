import {Component, OnDestroy, OnInit, AfterViewChecked} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
// RxJS
import { BehaviorSubject, Observable, of, Subscription } from 'rxjs';
// NGRX
import { Store, select } from '@ngrx/store';
import { Update } from '@ngrx/entity';
import { AppState } from '../../../../core/reducers';
// Layout
import { SubheaderService, LayoutConfigService } from '../../../../core/_base/layout';
import {LayoutUtilsService, MessageType, QueryParamsModel} from '../../../../core/_base/crud';
import {CustomerModel} from "../../../../core/customer/customer.model";
import {
	selectLastCreatedCustomerId,
	selectCustomerActionLoading,
	selectCustomerById
} from "../../../../core/customer/customer.selector";
import {CustomerOnServerCreated, CustomerUpdated} from "../../../../core/customer/customer.action";
import {ProvinceModel} from '../../../../core/state/province.model';
import {RegencyModel} from '../../../../core/state/regency.model';
import {DistrictModel} from '../../../../core/state/district.model';
import {VillageModel} from '../../../../core/state/village.model';
import {StateService} from '../../../../core/state/state.service';
import {CustomerService} from '../../../../core/customer/customer.service';

@Component({
  selector: 'kt-view-customer',
  templateUrl: './view-customer.component.html',
  styleUrls: ['./view-customer.component.scss']
})
export class ViewCustomerComponent implements OnInit, OnDestroy{
	// Public properties
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
	// Private properties
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
		const routeSubscription =  this.activatedRoute.params.subscribe(params => {
			const id = params.id;
			if (id) {
				this.store.pipe(select(selectCustomerById(id))).subscribe(res => {
					if (res) {
						this.customer = res;
						this.oldCustomer = Object.assign({}, this.customer);
						this.initCustomer();
					}
				});
			} 
		});
		this.subscriptions.push(routeSubscription);
		

	}
	initCustomer(){
		this.createForm();
		this.loadProvince();

	}

	createForm() {
		if (this.customer.idvllg !== null ){
			this.loadRegency(this.customer.idvllg.district.regency.province.code)
			this.loadDistrict(this.customer.idvllg.district.regency.code)
			this.loadVillage(this.customer.idvllg.district.code)
			this.loadPostalcode(this.customer.idvllg.district.name)
			this.customerForm = this.customerFB.group({
				// cstrmrcd: [{"value":this.customer.cstrmrcd, "disabled":true}],
				cstrmrpid: [{value:this.customer.cstrmrpid, disabled:true}],
				npwp: [{value:this.customer.npwp, disabled:true}],
				cstrmrnm: [{value:this.customer.cstrmrnm, disabled:true}],
				addrcstmr: [{value:this.customer.addrcstmr, disabled:true}],
				gndcstmr: [{value:this.customer.gndcstmr, disabled:true}],
				phncstmr: [{value:this.customer.phncstmr, disabled:true}],
				emailcstmr: [{value:this.customer.emailcstmr, disabled:true}],
				idvllg: [{value:this.customer.idvllg._id, disabled:true}],
				district: [{value:this.customer.idvllg.district.code, disabled:true}],
				regency: [{value:this.customer.idvllg.district.regency.code, disabled:true}],
				province: [{value:this.customer.idvllg.district.regency.province.code, disabled:true}],
				postcode: [{value:this.customer.postcode, disabled:true}],
				// type: [this.customer.type],
				bankname: [{value:this.customer.bankname, disabled:true}],
				bankaccnt: [{value:this.customer.bankaccnt, disabled:true}],
			});
		}
		this.customerForm = this.customerFB.group({
			// cstrmrcd: [{"value":this.customer.cstrmrcd, "disabled":true}],
			cstrmrpid: [{value:this.customer.cstrmrpid, disabled:true}],
			npwp: [{value:this.customer.npwp, disabled:true}],
			cstrmrnm: [{value:this.customer.cstrmrnm, disabled:true}],
			addrcstmr: [{value:this.customer.addrcstmr, disabled:true}],
			gndcstmr: [{value:this.customer.gndcstmr, disabled:true}],
			phncstmr: [{value:this.customer.phncstmr, disabled:true}],
			emailcstmr: [{value:this.customer.emailcstmr, disabled:true}],
			idvllg: [{value:[], disabled:true}],
			district: [{value:[], disabled:true}],
			regency: [{value:[], disabled:true}],
			province: [{value:[], disabled:true}],
			postcode: [{value:this.customer.postcode, disabled:true}],
			// type: [this.customer.type],
			bankname: [{value:this.customer.bankname, disabled:true}],
			bankaccnt: [{value:this.customer.bankaccnt, disabled:true}],
		});
	}

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
	
	loadVillage(districtCode: string){
		const queryParams = new QueryParamsModel(null,
			"asc",
			"grpnm",
			1,
			10);
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
	getComponentTitle() {
		let result = `View Customer`;
		return result;
	}
	onAlertClose($event) {
		this.hasFormErrors = false;
	}
	ngOnDestroy() {
		this.subscriptions.forEach(sb => sb.unsubscribe());
	}

}
