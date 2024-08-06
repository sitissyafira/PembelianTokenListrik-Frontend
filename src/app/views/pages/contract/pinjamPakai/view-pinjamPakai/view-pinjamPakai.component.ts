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
  selector: 'kt-view-pinjamPakai',
  templateUrl: './view-pinjamPakai.component.html',
  styleUrls: ['./view-pinjamPakai.component.scss']
})

export class ViewPinjamPakaiComponent implements OnInit, OnDestroy {
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
			}
		});
		this.subscriptions.push(routeSubscription);
  	}

	initPinjamPakai() {
		this.createForm();
	}


	createForm() {
		this.loadOwnerList();
			this.pinjamPakaiForm = this.pinjamPakaiFB.group({
			owner : [{value:this.pinjamPakai.owner._id, disabled:true}],

			contract_number : [{value:this.pinjamPakai.owner.contract_number, disabled:true}],
			unit : [{value:this.pinjamPakai.unit, disabled:true}],

			contact_name: [{value:this.pinjamPakai.owner.contact_name, disabled:true}],
			contact_address: [{value:this.pinjamPakai.owner.contact_address ,disabled:true}],
			contact_phone: [{value:this.pinjamPakai.owner.contact_phone, disabled:true}],
			contact_email: [{value:this.pinjamPakai.owner.contact_email, disabled:true}],
			contact_city: [{value:this.pinjamPakai.owner.contact_city,disabled:true}],
			
			contract_date : [{value:this.pinjamPakai.owner.contract_date, disabled:true}],
			expiry_date : [{value:this.pinjamPakai.owner.expiry_date, disabled:true}],
			start_electricity_stand : [{value:this.pinjamPakai.owner.start_electricity_stand, disabled:true}],
			start_water_stand : [{value:this.pinjamPakai.owner.start_water_stand, disabled:true}],


			paymentType : [{value:this.pinjamPakai.owner.paymentType, disabled:true}],
			tax_id : [{value:this.pinjamPakai.owner.tax_id, disabled:true}],
			paymentTerm : [{value:this.pinjamPakai.owner.paymentTerm, disabled:true}],
			virtualAccount : [{value:this.pinjamPakai.owner.virtualAccount, disabled:true}],
			norek : [{value:this.pinjamPakai.owner.norek, disabled:true}],
			isPKP : [{value:this.pinjamPakai.owner.isPKP, disabled:true}],
			
			
   		 	desc :  [{value:this.pinjamPakai.desc, disabled:true}],
    		createdDate: [{value:this.pinjamPakai.createdDate, disabled:true}],
			unit2 : [{value : this.pinjamPakai.unit2, disabled:true}],
			isPaid : [{value:this.pinjamPakai.isPaid, disabled:true}],
			closeDate : [{value:this.pinjamPakai.closeDate, disabled:true}],
			closeDescription : [{value:this.pinjamPakai.closeDescription, disabled:true}],
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

		this.oservice.getListOwnershipContract(queryParams).subscribe(
			res => {
				this.ownerResult = res.data;
			}
		);
	}

	goBackWithId() {
		const url = `/pinjamPakai`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}
	
	getComponentTitle() {
		let result = `View Lease Contract`;
		return result;
	}

	onAlertClose($event) {
		this.hasFormErrors = false;
	}

  	ngOnDestroy() {
		this.subscriptions.forEach(sb => sb.unsubscribe());
	}
	
}
