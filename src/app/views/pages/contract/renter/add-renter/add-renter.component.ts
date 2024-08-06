import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RenterContractModel } from '../../../../../core/contract/renter/renter.model';
import { ActivatedRoute, Router } from '@angular/router';
import { LayoutConfigService, SubheaderService } from '../../../../../core/_base/layout';
import { LayoutUtilsService, MessageType, QueryParamsModel } from '../../../../../core/_base/crud';
import { select, Store } from '@ngrx/store';
import { AppState } from '../../../../../core/reducers';
import {
	selectRenterContractActionLoading,
	selectRenterContractById,
	selectLastCreatedRenterContractId
} from '../../../../../core/contract/renter/renter.selector';
import { RenterContractOnServerCreated } from '../../../../../core/contract/renter/renter.action';
import { SelectionModel } from '@angular/cdk/collections';
import { RenterContractDataSource } from '../../../../../core/contract/renter/renter.datasource';
import { CustomerService } from '../../../../../core/customer/customer.service';
import { UnitService } from '../../../../../core/unit/unit.service';
import { selectCustomerActionLoading } from '../../../../../core/customer/customer.selector';
import { selectUnitActionLoading } from '../../../../../core/unit/unit.selector';
import { QueryUnitModel } from '../../../../../core/unit/queryunit.model';
import { RenterContractService } from '../../../../../core/contract/renter/renter.service';
import { BlockService } from '../../../../../core/block/block.service';
import { QueryBlockModel } from '../../../../../core/block/queryblock.model';
import { QueryFloorModel } from '../../../../../core/floor/queryfloor.model';
import { FloorService } from '../../../../../core/floor/floor.service';
import { StateService } from '../../../../../core/state/state.service';
import { CDK_CONNECTED_OVERLAY_SCROLL_STRATEGY_PROVIDER } from '@angular/cdk/overlay/typings/overlay-directives';
import { WaterMeterService } from '../../../../../core/water/meter/meter.service';
import { PowerMeterService } from '../../../../../core/power/meter/meter.service';
import { environment } from '../../../../../../environments/environment';
import { HttpClient } from '@angular/common/http';

@Component({
	selector: 'kt-add-renter',
	templateUrl: './add-renter.component.html',
	styleUrls: ['./add-renter.component.scss']
})
export class AddRenterComponent implements OnInit, OnDestroy {
	name: string = ""
	title: string = ""
	dataSource: RenterContractDataSource;
	renter: RenterContractModel;
	renterId$: Observable<string>;
	oldRenter: RenterContractModel;
	selectedTab = 0;
	codenum: any = null;
	loading$: Observable<boolean>;
	uloading$: Observable<boolean>;
	renterForm: FormGroup;
	dataAmount: number;
	hasFormErrors = false;
	selection = new SelectionModel<RenterContractModel>(true, []);
	customerResult: any[] = [];
	unitResult: any[] = [];
	datalastPower: any[] = [];
	datalastWater: any[] = [];
	blockResult: any[] = [];
	floorResult: any[] = [];
	CstmrResultFiltered: any[] = []
	serviceWaterMeter: WaterMeterService
	servicePowerMeter: PowerMeterService


	pwrmtr;
	wtrmtr;

	postalcodeResult: any[] = [];
	isHidden: boolean = true;
	TaxId: boolean = true;
	isPkp: boolean = false;
	loading: boolean = false;

	loadingData = {
		unit: false,
	};
	// Private Properties
	private subscriptions: Subscription[] = [];

	constructor(private activatedRoute: ActivatedRoute,
		private router: Router,
		private renterFB: FormBuilder,
		private subheaderService: SubheaderService,
		private service: RenterContractService,
		private cservice: CustomerService,
		private uservice: UnitService,
		private serviceBlk: BlockService,
		private stateService: StateService,
		private serviceFloor: FloorService,
		private cd: ChangeDetectorRef,
		private layoutUtilsService: LayoutUtilsService,
		private http: HttpClient,
		private store: Store<AppState>,
		private layoutConfigService: LayoutConfigService) { }

	ngOnInit() {
		this.loading$ = this.store.pipe(select(selectCustomerActionLoading));
		this.uloading$ = this.store.pipe(select(selectUnitActionLoading));
		this.activatedRoute.data.subscribe(data => {
			this.name = data.name
			this.title = data.title
		})
		const routeSubscription = this.activatedRoute.params.subscribe(params => {
			this.renter = new RenterContractModel();
			this.renter.clear();
			this.initRenter()
		});
		this.subscriptions.push(routeSubscription);
	}

	ngOnDestroy() {
		this.subscriptions.forEach(sb => sb.unsubscribe());
	}

	initRenter() {
		this.createForm();
		this.loadCustomerList();
		this.loadBlockList();
	}
	showHidden() {
		this.isHidden = true;
	}
	createForm() {
		this.renterForm = this.renterFB.group({
			cstmrId: ["", Validators.required],
			cstmr: ["", Validators.required],
			contact_name: ["", Validators.required],
			contact_address: [{ value: "", disabled: true }, Validators.required],
			contact_phone: ["", Validators.required],
			contact_email: [{ value: "", disabled: true }, Validators.required],
			contact_city: [{ value: "", disabled: true }],
			contact_zip: [{ value: "", disabled: true }],
			ktp: ["", Validators.required],
			npwp: [""],

			blockId: [""],
			floorId: [""],
			unit: ["", Validators.required],
			unit2: [""],
			regency: [""],
			typeRenter: [""],
			contract_number: ["", Validators.required],
			checkIn: ["", Validators.required],
			checkOut: [""],
			// rentalAmount: ["", Validators.required],
			rentalAmount: [""],
			start_electricity_stand: ["", Validators.required],
			start_water_stand: ["", Validators.required],


			paymentType: ["", Validators.required],
			paymentTerm: ["", Validators.required],
			virtualAccount: [""],
			norek: [""],
			isPKP: ["", Validators.required],
			tax_id: [""],

			receipt: this.renterFB.group({
				bastu: this.renterFB.group({
					bastu1: false,
				}),
				ppp: this.renterFB.group({
					ppp1: false,
				}),
				ba: this.renterFB.group({
					ba1: false,
				}),
				bpb: this.renterFB.group({
					bpb1: false,
				}),
				kp: this.renterFB.group({
					kp1: false,
				}),
				kbm: this.renterFB.group({
					kbm1: false,
				}),
				km: this.renterFB.group({
					km1: false,
				}),
				ac: this.renterFB.group({
					ac1: false,
				}),
				ap: this.renterFB.group({
					ap1: false,
				}),
				sm: this.renterFB.group({
					sm1: false,
				}),
				sv: this.renterFB.group({
					sv1: false,
				}),
				bph: this.renterFB.group({
					bph1: false,
				}),
				ksdm: this.renterFB.group({
					ksdm1: false,
				}),
			})
		});
	}

	loadBlockList() {
		this.selection.clear();
		const queryParams = new QueryBlockModel(
			null,
			"asc",
			null,
			1,
			1000
		);
		this.serviceBlk.getListBlock(queryParams).subscribe(
			res => {
				this.blockResult = res.data;
			}
		);
	}

	loadFloorList(blkid) {
		this.selection.clear();
		const queryParams = new QueryFloorModel(
			null,
			"asc",
			null,
			1,
			1000
		);
		this.serviceFloor.findFloorByParent(blkid).subscribe(
			res => {
				this.floorResult = res.data;
			}
		);
	}

	loadUnitList(flrid) {
		this.selection.clear();
		const queryParams = new QueryUnitModel(
			null,
			"asc",
			null,
			1,
			1000
		);
		this.uservice.findUnitforContractRenter(flrid).subscribe(
			res => {
				this.unitResult = res.data;
				// this.datalastPower = res.lastConsumtionWater.endpos;
				// this.datalastWater = res.lastConsumtionPower.endpos;

			}
		);

	}


	blkChange(item) {
		if (item) {
			this.loadFloorList(item);
			this.renterForm.controls.flr.enable();
		}
	}
	flrChange(item) {
		if (item) {
			this.loadUnitList(item);
			this.renterForm.controls.unt.enable();
		}
	}

	goBackWithId() {
		let url = `/contract-management/contract/guest`;
		console.log(this.name)
		if (this.name) {
			url = `/contract-management/contract/guest/${this.name}`;
		}
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}

	refreshRenter(isNew: boolean = false, id: string = "") {
		let url = this.router.url;
		if (!isNew) {
			this.router.navigate([url], { relativeTo: this.activatedRoute });
			return;
		}

		url = `/contract-management/contract/guest/edit/${id}`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}

	reset() {
		this.renter = Object.assign({}, this.oldRenter);
		this.createForm();
		this.hasFormErrors = false;
		this.renterForm.markAsPristine();
		this.renterForm.markAsUntouched();
		this.renterForm.updateValueAndValidity();
	}

	onSubmit(withBack: boolean = false) {
		this.hasFormErrors = false;
		const controls = this.renterForm.controls;
		/** check form */
		if (this.renterForm.invalid) {
			Object.keys(controls).forEach(controlName =>
				controls[controlName].markAsTouched()
			);

			this.hasFormErrors = true;
			this.selectedTab = 0;
			return;
		}

		this.loading = true;
		const preparedRenter = this.prepareRenter();
		this.addRenter(preparedRenter, withBack);
	}

	loadCustomerList() {
		this.selection.clear();
		const queryParams = new QueryParamsModel(
			null,
			"asc",
			null,
			1,
			1000
		);
		this.cservice.getListCustomerTenant(queryParams).subscribe(
			res => {
				this.CstmrResultFiltered = res.data
				this.customerResult = res.data;
			}
		);
	}



	prepareRenter(): RenterContractModel {
		const controls = this.renterForm.controls;
		const _renter = new RenterContractModel();
		_renter.clear();
		_renter.cstmr = controls.cstmrId.value;
		_renter.contract_number = controls.contract_number.value;
		_renter.checkIn = controls.checkIn.value;
		_renter.checkOut = controls.checkOut.value;
		_renter.contact_name = controls.contact_name.value.toLowerCase();
		_renter.contact_address = controls.contact_address.value.toLowerCase();
		_renter.contact_phone = controls.contact_phone.value;
		_renter.contact_email = controls.contact_email.value;
		_renter.contact_city = controls.contact_city.value.toLowerCase();
		_renter.contact_zip = controls.contact_zip.value;
		_renter.ktp = controls.ktp.value;
		_renter.npwp = controls.npwp.value;

		_renter.unit = controls.unit.value;
		_renter.unit2 = controls.unit2.value.toLowerCase();
		_renter.regency = controls.regency.value;
		_renter.start_electricity_stand = controls.start_electricity_stand.value;
		_renter.start_water_stand = controls.start_water_stand.value;
		_renter.rentalAmount = controls.rentalAmount.value;
		_renter.paymentType = controls.paymentType.value;
		_renter.paymentTerm = controls.paymentTerm.value;
		_renter.norek = controls.norek.value;
		_renter.virtualAccount = controls.virtualAccount.value;
		_renter.isPKP = controls.isPKP.value;
		_renter.tax_id = controls.tax_id.value;
		// _renter.typeRenter = controls.typeRenter.value;
		_renter.receipt = {
			bastu: controls.receipt.get('bastu')['controls'].bastu1.value,
			ppp: controls.receipt.get('ppp')['controls'].ppp1.value,
			ba: controls.receipt.get('ba')['controls'].ba1.value,
			bpb: controls.receipt.get('bpb')['controls'].bpb1.value,
			kp: controls.receipt.get('kp')['controls'].kp1.value,
			kbm: controls.receipt.get('kbm')['controls'].kbm1.value,
			km: controls.receipt.get('km')['controls'].km1.value,
			ac: controls.receipt.get('ac')['controls'].ac1.value,
			ap: controls.receipt.get('ap')['controls'].ap1.value,
			sm: controls.receipt.get('sm')['controls'].sm1.value,
			sv: controls.receipt.get('sv')['controls'].sv1.value,
			bph: controls.receipt.get('bph')['controls'].bph1.value,
			ksdm: controls.receipt.get('ksdm')['controls'].ksdm1.value,
		};
		return _renter;
	}

	addRenter(_renter: RenterContractModel, withBack: boolean = false) {
		const addSubscription = this.service.createRenterContract(_renter).subscribe(
			res => {
				const message = `New customer contract successfully has been added.`;
				this.layoutUtilsService.showActionNotification(message, MessageType.Create, 5000, true, true);
				const url = `/contract-management/contract/guest/checkin`;
				this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
			},
			err => {
				console.error(err);
				const message = 'Error while adding customer contract | ' + err.statusText;
				this.layoutUtilsService.showActionNotification(message, MessageType.Create, 5000, true, false);
			}
		);
		this.subscriptions.push(addSubscription);
	}

	_onKeyup(e: any) {
		// this.renterForm.patchValue({ unit: undefined });
		this._filterCstmrList(e.target.value);
	}

	_filterCstmrList(text: string) {
		this.CstmrResultFiltered = this.customerResult.filter((i) => {
			const filterText = `${i.cstrmrnm.toLocaleLowerCase()}`;
			if (filterText.includes(text.toLocaleLowerCase())) return i;
		});
	}

	getSingleCustomer(id) {
		const controls = this.renterForm.controls;
		this.cservice.getCustomerTenantById(id).subscribe(data => {
			controls.cstmrId.setValue(data.data._id);
			controls.cstmr.setValue(data.data.cstrmrnm);
			controls.contact_name.setValue(data.data.cstrmrnm);
			controls.contact_address.setValue(data.data.addrcstmr);
			controls.contact_phone.setValue(data.data.phncstmr);
			controls.contact_email.setValue(data.data.emailcstmr);
			controls.contact_city.setValue(data.data.idvllg.district.regency.name);
			this.loadPostalcode(data.data.idvllg.district.name);
			controls.contact_zip.setValue(data.data.postcode);
			controls.tax_id.setValue(data.data.npwp);
			controls.npwp.setValue(data.data.npwp);
			controls.ktp.setValue(data.data.cstrmrpid);
			controls.regency.setValue(data.data.idvllg.district.name)
			this.cd.markForCheck();
		});
		this.cd.markForCheck();
	}

	loadPostalcode(regencyName: string) {
		const queryParams = new QueryParamsModel(null,
			"asc",
			"grpnm",
			1,
			10);
		this.stateService.getListPostalcode(queryParams, regencyName).subscribe(
			res => {
				this.postalcodeResult = res.data;
				console.log(res.data)
				this.cd.markForCheck()
			}
		);
	}
	getComponentTitle() {
		let result = 'Create Check In Check Out';
		return result;
	}

	getNumber(id) {
		const controls = this.renterForm.controls;
		this.cd.markForCheck()

		this.service.getContractByUnit(id).subscribe(res => {
			controls.start_electricity_stand.setValue(res.data[0].start_electricity_stand)
			controls.start_water_stand.setValue(res.data[0].start_water_stand)
		})

		setTimeout(() => {
			this.service.getConsumptionContractByUnit(id).subscribe(res => {
				controls.start_electricity_stand.setValue(res.data.lastPowMtr)
				controls.start_water_stand.setValue(res.data.lastWatMtr)
			})
		}, 100)


		this.uservice.getUnitById(id).subscribe(
			dataUnit => {
				controls.unit2.setValue(dataUnit.data.cdunt);
				this.dataAmount = dataUnit.data.rentalPrice;
				if (this.dataAmount == 0 || this.dataAmount == null || this.dataAmount == undefined) {
					controls.rentalAmount.setValue(0);
				} else {
					controls.rentalAmount.setValue(this.dataAmount);
				}

				this.pwrmtr = dataUnit.lastConsumtionPower
				this.wtrmtr = dataUnit.lastConsumtionWater
			}
		)

	}

	changePKP() {
		if (this.isPkp == true) {
			this.TaxId = false;
			this.showTaxId();
		} else {
			// console.log(this.renterForm.controls['tax_id']);
			this.TaxId = true;
			this.hiddenTaxId()
		}
	}

	hiddenTaxId() {
		this.renterForm.controls['tax_id'].setValidators([]);
		this.renterForm.controls['tax_id'].updateValueAndValidity();
		console.log(this.TaxId);
		console.log(this.renterForm.get('tax_id'));
	}
	showTaxId() {
		this.renterForm.controls['tax_id'].setValidators([Validators.required]);
		// this.renterForm.get('tax_id').setValidators([Validators.required]);
		this.renterForm.controls['tax_id'].updateValueAndValidity();
		console.log(this.TaxId);
		console.log(this.renterForm.get('tax_id'));
	}
	onAlertClose($event) {
		this.hasFormErrors = false;
	}

}
