import { Component, OnInit, OnDestroy } from '@angular/core';
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
import { RenterContractOnServerCreated, RenterContractUpdated } from '../../../../../core/contract/renter/renter.action';
import { Update } from '@ngrx/entity';
import { SelectionModel } from '@angular/cdk/collections';
import { UnitModel } from '../../../../../core/unit/unit.model';
import { CustomerService } from '../../../../../core/customer/customer.service';
import { UnitService } from '../../../../../core/unit/unit.service';
import { selectUnitActionLoading } from '../../../../../core/unit/unit.selector';
import { selectCustomerActionLoading } from '../../../../../core/customer/customer.selector';
import { QueryUnitModel } from '../../../../../core/unit/queryunit.model';
import { RenterContractService } from '../../../../../core/contract/renter/renter.service';
import { BlockService } from '../../../../../core/block/block.service';
import { QueryBlockModel } from '../../../../../core/block/queryblock.model';
import { QueryBuildingModel } from '../../../../../core/building/querybuilding.model';
import { BuildingService } from '../../../../../core/building/building.service';
import { QueryFloorModel } from '../../../../../core/floor/queryfloor.model';
import { FloorService } from '../../../../../core/floor/floor.service';
import { StateService } from '../../../../../core/state/state.service';

@Component({
	selector: 'kt-edit-renter',
	templateUrl: './edit-renter.component.html',
})
export class EditRenterComponent implements OnInit, OnDestroy {
	name: string = ""
	title: string = ""
	renter: RenterContractModel;
	renterId$: Observable<string>;
	oldRenter: RenterContractModel;
	uloading$: Observable<boolean>;
	selectedTab = 0;
	loading$: Observable<boolean>;
	renterForm: FormGroup;
	selection = new SelectionModel<RenterContractModel>(true, []);
	hasFormErrors = false;
	customerResult: any[] = [];
	unitResult: any[] = [];
	blockResult: any[] = [];
	buildingResult: any[] = [];
	postalcodeResult: any[] = [];
	floorResult: any[] = [];
	TaxId: boolean;
	isPkp: boolean;
	taxvalue: string;
	loading: boolean;

	valCstmr: any

	// Private properties
	private subscriptions: Subscription[] = [];

	constructor(private activatedRoute: ActivatedRoute,
		private router: Router,
		private renterFB: FormBuilder,
		private subheaderService: SubheaderService,
		private layoutUtilsService: LayoutUtilsService,
		private store: Store<AppState>,
		private service: RenterContractService,
		private cservice: CustomerService,
		private serviceBlk: BlockService,
		private serviceBld: BuildingService,
		private stateService: StateService,
		private serviceFloor: FloorService,
		private uservice: UnitService,
		private layoutConfigService: LayoutConfigService) { }

	ngOnInit() {
		this.loading$ = this.store.pipe(select(selectRenterContractActionLoading));
		this.uloading$ = this.store.pipe(select(selectUnitActionLoading));
		this.activatedRoute.data.subscribe( data => {
			this.name = data.name
			this.title = data.title
		})
		const routeSubscription = this.activatedRoute.params.subscribe(params => {
			const id = params.id;
			if (id) {
				// this.store.pipe(select(selectRenterContractById(id))).subscribe(res => {
				this.service.findRenterById(id).subscribe(res => {
					if (res) {
						this.isPkp = res.data.isPKP;
						if (this.isPkp == true) {
							this.TaxId = false;
							this.taxvalue = res.data.tax_id;
						} else {
							this.TaxId = true;
						}
						this.renter = res.data;
						this.valCstmr = {
							gstCust: res.data.cstmr.cstrmrnm,
							custName: res.data.contact_name,
							addr: res.data.cstmr.addrcstmr,
							rgncy: res.data.cstmr.idvllg ? res.data.cstmr.idvllg.district.regency.name : "",
							phone: res.data.cstmr.phncstmr,
							email: res.data.cstmr.emailcstmr,
							pstCode: res.data.cstmr.postcode && res.data.cstmr.idvllg ? `${res.data.cstmr.postcode} - ${res.data.cstmr.idvllg.district.code}` : "",
						}

						this.oldRenter = Object.assign({}, this.renter);
						this.initRenter();
					}
				});
			}
		});

		this.subscriptions.push(routeSubscription);
	}

	initRenter() {
		this.createForm();
		this.loadCustomerList();
		this.loadBlockList();
		this.loadPostalcode(this.renter.regency)
		this.loadFloorList(this.renter.unit.flr.blk._id);
		this.loadUnitList(this.renter.unit.flr._id);
	}



	createForm() {
		this.renterForm = this.renterFB.group({
			cstmr: [{ value: this.renter.cstmr ? this.renter.cstmr._id : "", disabled: false }, Validators.required],
			contact_name: [{ value: this.renter.contact_name, disabled: true }, Validators.required],
			contact_address: [{ value: this.renter.contact_address, disabled: false }, Validators.required],
			contact_phone: [{ value: this.renter.contact_phone, disabled: true }, Validators.required],
			contact_email: [{ value: this.renter.contact_email, disabled: true }],
			contact_city: [{ value: this.renter.contact_city, disabled: true }],
			contact_zip: [{ value: this.renter.contact_zip, disabled: true }],
			ktp: [{ value: this.renter.ktp, disabled: true }],
			npwp: [{ value: this.renter.npwp, disabled: true }],


			unit: [{ value: this.renter.unit._id, disabled: true }],
			unit2: [this.renter.unit2],
			blockId: [{ value: this.renter.unit.flr.blk._id, disabled: true }],
			floorId: [{ value: this.renter.unit.flr._id, disabled: true }],
			contract_number: [{ value: this.renter.contract_number, disabled: true }],
			checkIn: [{ value: this.renter.checkIn, disabled: true }],
			checkOut: [{ value: this.renter.checkOut, disabled: false }],
			rentalAmount: [{ value: this.renter.rentalAmount, disabled: false }],
			start_electricity_stand: [{ value: this.renter.start_electricity_stand, disabled: true }],
			start_water_stand: [{ value: this.renter.start_water_stand, disabled: true }],
			typeRenter: [{ value: this.renter.typeRenter, disabled: true }],

			paymentType: [this.renter.paymentType],
			paymentTerm: [this.renter.paymentTerm],
			virtualAccount: [this.renter.virtualAccount],
			norek: [{ value: this.renter.norek, disabled: false }],
			isPKP: [{ value: this.renter.isPKP, disabled: false }],
			tax_id: [{ value: this.renter.tax_id, disabled: false }],
			receipt: this.renterFB.group({
				bastu: this.renterFB.group({
					bastu1: [{ value: this.renter.receipt ? this.renter.receipt.bastu : false, disabled: false }],
				}),
				ppp: this.renterFB.group({
					ppp1: [{ value: this.renter.receipt ?  this.renter.receipt.ppp: false, disabled: false }],
				}),
				ba: this.renterFB.group({
					ba1: [{ value: this.renter.receipt ? this.renter.receipt.ba: false, disabled: false }],
				}),
				bpb: this.renterFB.group({
					bpb1: [{ value: this.renter.receipt ? this.renter.receipt.bpb: false, disabled: false }],
				}),
				kp: this.renterFB.group({
					kp1: [{ value: this.renter.receipt ? this.renter.receipt.kp: false, disabled: false }],
				}),
				kbm: this.renterFB.group({
					kbm1: [{ value: this.renter.receipt ? this.renter.receipt.kbm: false, disabled: false }],
				}),
				km: this.renterFB.group({
					km1: [{ value: this.renter.receipt ? this.renter.receipt.km: false, disabled: false }],
				}),
				ac: this.renterFB.group({
					ac1: [{ value: this.renter.receipt ? this.renter.receipt.ac: false, disabled: false }],
				}),
				ap: this.renterFB.group({
					ap1: [{ value: this.renter.receipt ? this.renter.receipt.ap: false, disabled: false }],
				}),
				sm: this.renterFB.group({
					sm1: [{ value: this.renter.receipt ? this.renter.receipt.sm: false, disabled: false }],
				}),
				sv: this.renterFB.group({
					sv1: [{ value: this.renter.receipt ? this.renter.receipt.sv: false, disabled: false }],
				}),
				bph: this.renterFB.group({
					bph1: [{ value: this.renter.receipt ? this.renter.receipt.bph: false, disabled: false }],
				}),
				ksdm: this.renterFB.group({
					ksdm1: [{ value: this.renter.receipt ? this.renter.receipt.ksdm: false, disabled: false }],
				}),
			})
		})
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

	loadCustomerList() {
		this.selection.clear();
		const queryParams = new QueryParamsModel(
			null,
			"asc",
			null,
			1,
			10
		);
		this.cservice.getListCustomerTenant(queryParams).subscribe(
			res => {
				this.customerResult = res.data;
			}
		);
	}

	getSingleCustomer(id) {
		const controls = this.renterForm.controls;
		this.cservice.getCustomerTenantById(id).subscribe(data => {
			this.loadPostalcode(data.data.idvllg.district.name);
			controls.contact_zip.setValue(data.data.postcode);
			controls.contact_name.setValue(data.data.cstrmrnm);
			controls.contact_address.setValue(data.data.addrcstmr);
			controls.contact_phone.setValue(data.data.phncstmr);
			controls.contact_email.setValue(data.data.emailcstmr);
			controls.ktp.setValue(data.data.cstrmrpid);
			controls.npwp.setValue(data.data.npwp);
			controls.contact_city.setValue(data.data.idvllg.district.regency.name);
			controls.tax_id.setValue(data.data.npwp);
			controls.regency.setValue(data.data.idvllg.district.name);

		});
	}

	loadPostalcode(regencyName: string) {
		const queryParams = new QueryParamsModel(
			null,
			"asc",
			null,
			1,
			10);
		this.stateService.getListPostalcode(queryParams, regencyName).subscribe(
			res => {
				this.postalcodeResult = res.data;
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
		this.uservice.findUnitByParent(flrid).subscribe(
			res => {
				this.unitResult = res.data;
			}
		);
	}

	goBackWithId() {
		let url = `/contract-management/contract/guest`;
		console.log(this.name)
		if(this.name){
			url = `/contract-management/contract/guest/${this.name}`;
		}
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
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
		this.updateRenter(preparedRenter, withBack);
	}

	prepareRenter(): RenterContractModel {
		const controls = this.renterForm.controls;
		const _renter = new RenterContractModel();
		_renter.clear();
		_renter._id = this.renter._id;
		_renter.cstmr = controls.cstmr.value;
		_renter.contact_name = controls.contact_name.value.toLowerCase();
		_renter.contact_address = controls.contact_address.value.toLowerCase();
		_renter.contact_phone = controls.contact_phone.value;
		_renter.contact_email = controls.contact_email.value;
		_renter.contact_city = controls.contact_city.value.toLowerCase();
		_renter.contact_zip = controls.contact_zip.value;
		_renter.ktp = controls.ktp.value;
		_renter.npwp = controls.npwp.value;


		_renter.unit = controls.unit.value
		_renter.unit2 = controls.unit2.value

		_renter.contract_number = controls.contract_number.value;

		_renter.checkIn = controls.checkIn.value;
		_renter.checkOut = controls.checkOut.value;
		_renter.rentalAmount = controls.rentalAmount.value
		_renter.start_electricity_stand = controls.start_electricity_stand.value;
		_renter.start_water_stand = controls.start_water_stand.value;
		_renter.typeRenter = controls.typeRenter.value;

		_renter.paymentType = controls.paymentType.value.toLowerCase();
		_renter.paymentTerm = controls.paymentTerm.value;
		_renter.virtualAccount = controls.virtualAccount.value;
		_renter.norek = controls.norek.value;
		_renter.isPKP = controls.isPKP.value;
		_renter.tax_id = controls.tax_id.value;

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

	updateRenter(_renter: RenterContractModel, withBack: boolean = false) {
		const addSubscription = this.service.updateRenterContract(_renter).subscribe(
			res => {
				const message = `Tenant contract successfully has been saved.`;
				this.layoutUtilsService.showActionNotification(message, MessageType.Update, 5000, true, true);
				const url = `/contract-management/contract/guest`;
				this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
			},
			err => {
				console.error(err);
				const message = 'Error while saving tenant contract | ' + err.statusText;
				this.layoutUtilsService.showActionNotification(message, MessageType.Update, 5000, true, false);
			}
		);
		this.subscriptions.push(addSubscription);
	}

	ngOnDestroy() {
		this.subscriptions.forEach(sb => sb.unsubscribe());
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

	getComponentTitle() {
		let result = 'Edit Check In Check Out';
		if(this.title){
			result = `Edit ${this.title}`;
		}
		return result;
	}
	onAlertClose($event) {
		this.hasFormErrors = false;
	}
}
