import {Component, OnDestroy, OnInit} from '@angular/core';
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
import { PinjamPakaiModel } from '../../../../../core/contract/pinjamPakai/pinjamPakai.model';
import { PinjamPakaiService } from '../../../../../core/contract/pinjamPakai/pinjamPakai.service';
import { selectPinjamPakaiActionLoading, selectPinjamPakaiById } from '../../../../../core/contract/pinjamPakai/pinjamPakai.selector';
import { UnitService } from '../../../../../core/unit/unit.service';
import { OwnershipContractService } from '../../../../../core/contract/ownership/ownership.service';
import { SelectionModel } from '@angular/cdk/collections';
import { QueryOwnerTransactionModel } from '../../../../../core/contract/ownership/queryowner.model';
import { QueryUnitModel } from '../../../../../core/unit/queryunit.model';

@Component({
  selector: 'kt-add-pinjamPakai',
  templateUrl: './add-pinjamPakai.component.html',
  styleUrls: ['./add-pinjamPakai.component.scss']
})
export class AddPinjamPakaiComponent implements OnInit, OnDestroy {
	// Public properties
	pinjamPakai: PinjamPakaiModel;
	PinjamPakaiId$: Observable<string>;
	oldPinjamPakai: PinjamPakaiModel;
	selectedTab = 0;
	loading$: Observable<boolean>;
	pinjamPakaiForm: FormGroup;
	hasFormErrors = false;
	date1 = new FormControl(new Date());
	loading : boolean = false;

	selection = new SelectionModel<PinjamPakaiModel>(true, []);
	customerResult: any[] = [];
	ownerResult: any[] = [];
	blockResult: any[] = [];
	unitResult: any[]=[];
	// Private properties
	private subscriptions: Subscription[] = [];
  	constructor(
		private activatedRoute: ActivatedRoute,
		private router: Router,
		private pinjamPakaiFB: FormBuilder,
		private subheaderService: SubheaderService,
		private layoutUtilsService: LayoutUtilsService,
		private oservice: OwnershipContractService,
		private uservice: UnitService,
		private store: Store<AppState>,
		private service: PinjamPakaiService,
		private layoutConfigService: LayoutConfigService
	) { }

  	ngOnInit() {
		this.loading$ = this.store.pipe(select(selectPinjamPakaiActionLoading));
		const routeSubscription =  this.activatedRoute.params.subscribe(params => {
			const id = params.id;
			if (id) {
				this.store.pipe(select(selectPinjamPakaiById(id))).subscribe(res => {
					if (res) {
						this.pinjamPakai = res;
						this.oldPinjamPakai = Object.assign({}, this.pinjamPakai);
						this.initPinjamPakai();
					}
				});
			} else {
				this.pinjamPakai = new PinjamPakaiModel();
				this.pinjamPakai.clear();
				this.initPinjamPakai();
			}
		});
		this.subscriptions.push(routeSubscription);
  	}

	initPinjamPakai() {
		this.createForm();
		this.loadOwnerList();
	}

	createForm() {
		this.pinjamPakaiForm = this.pinjamPakaiFB.group({
			owner : [""],
			
			contact_name: [{value:"",disabled:true}],
			contact_address: [{value:"",disabled:true}],
			contact_phone: [{value:"",disabled:true}],
			contact_email: [{value:"",disabled:true}],
			contact_city: [{value:"",disabled:true}],
			contract_number : [{value:"", disabled:true}],
			unit : [{value:"", disabled:true}],

			contract_date : [{value:"", disabled:true}],
			expiry_date : [{value:"", disabled:true}],
			start_electricity_stand : [{value:"", disabled:true}],
			start_water_stand : [{value:"", disabled:true}],


			paymentType : [{value:"", disabled:true}],
			tax_id : [{value:"", disabled:true}],
			paymentTerm : [{value:"", disabled:true}],
			virtualAccount : [{value:"", disabled:true}],
			norek : [{value:"", disabled:true}],
			isPKP : [{value:"", disabled:true}],
			

   		 	desc :  [""],
    		createdDate: [{value:this.date1.value, disabled:true}],
			paidDate: [""],
			unit2 : [""],
		});
		
	}

	getSingleCustomer(id){
		const controls = this.pinjamPakaiForm.controls;
		this.oservice.findOwneshipById(id).subscribe(data => {
			controls.contact_name.setValue(data.data.contact_name);
			controls.contact_address.setValue(data.data.contact_address);
			controls.contact_phone.setValue(data.data.contact_phone);
			controls.contact_email.setValue(data.data.contact_email);
			controls.contact_city.setValue(data.data.contact_city);
			controls.contract_number.setValue(data.data.contract_number);
			controls.unit.setValue(data.data.unit._id);
			controls.unit2.setValue(data.data.unit.cdunt);

			controls.contract_date.setValue(data.data.contract_date);
			controls.expiry_date.setValue(data.data.expiry_date);
			controls.start_electricity_stand.setValue(data.data.start_electricity_stand);
			controls.start_water_stand.setValue(data.data.start_water_stand);

			controls.paymentType.setValue(data.data.paymentType);
			controls.paymentTerm.setValue(data.data.paymentTerm);
			controls.virtualAccount.setValue(data.data.virtualAccount);
			controls.norek.setValue(data.data.norek);
			controls.tax_id.setValue(data.data.tax_id);
			controls.isPKP.setValue(data.data.isPKP);

		});
		
	}

	loadOwnerList() {
		this.selection.clear();
		const queryParams = new QueryOwnerTransactionModel(
			null,
			"asc",
			null,
			1,
			100
		);
		this.oservice.getListPPContract(queryParams).subscribe(
			res => {
				this.ownerResult = res.data;
			}
		);
	}


	goBackWithId() {
		const url = `/pinjamPakai`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}

	refreshPinjamPakai(isNew: boolean = false, id:string = "") {
		let url = this.router.url;
		if (!isNew) {
			this.router.navigate([url], { relativeTo: this.activatedRoute });
			return;
		}

		url = `/pinjamPakai/edit/${id}`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}

	reset() {
		this.pinjamPakai = Object.assign({}, this.oldPinjamPakai);
		this.createForm();
		this.hasFormErrors = false;
		this.pinjamPakaiForm.markAsPristine();
		this.pinjamPakaiForm.markAsUntouched();
		this.pinjamPakaiForm.updateValueAndValidity();
	}

	onSubmit(withBack: boolean = false) {
		this.hasFormErrors = false;
		const controls = this.pinjamPakaiForm.controls;
		/** check form */
		if (this.pinjamPakaiForm.invalid) {
			Object.keys(controls).forEach(controlName =>
				controls[controlName].markAsTouched()
			);

			this.hasFormErrors = true;
			this.selectedTab = 0;
			return;
		}

		this.loading = true;
		const editedPinjamPakai = this.preparePinjamPakai();
		this.addPinjamPakai(editedPinjamPakai, withBack);
    }
    
	preparePinjamPakai(): PinjamPakaiModel {
		const controls = this.pinjamPakaiForm.controls;
		const _pinjamPakai = new PinjamPakaiModel();
		_pinjamPakai.clear();
		_pinjamPakai._id = this.pinjamPakai._id;
		_pinjamPakai.owner = controls.owner.value;
		_pinjamPakai.unit = controls.unit.value;
		_pinjamPakai.unit2 = controls.unit2.value.toLowerCase();
		_pinjamPakai.paidDate = controls.paidDate.value;
		_pinjamPakai.createdDate = controls.createdDate.value;
		_pinjamPakai.desc = controls.desc.value;
		return _pinjamPakai;
	}

	addPinjamPakai( _pinjamPakai: PinjamPakaiModel, withBack: boolean = false) {
		const addSubscription = this.service.createPinjamPakai(_pinjamPakai).subscribe(
			res => {
				const message = `New Lease Contract successfully has been added.`;
				this.layoutUtilsService.showActionNotification(message, MessageType.Create, 5000, true, true);
				const url = `/contract-management/contract/pp`;
				this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
			},
			err => {
				console.error(err);
				const message = 'Error while adding lease contract | ' + err.statusText;
				this.layoutUtilsService.showActionNotification(message, MessageType.Create, 5000, true, false);
			}
		);
		this.subscriptions.push(addSubscription);
	}


	getComponentTitle() {
		let result = 'Create Lease Contract';
		return result;
	}

	onAlertClose($event) {
		this.hasFormErrors = false;
	}

  	ngOnDestroy() {
		this.subscriptions.forEach(sb => sb.unsubscribe());
	}
	
}
