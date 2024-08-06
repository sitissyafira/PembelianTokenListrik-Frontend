import { Component, OnInit, OnDestroy, ChangeDetectorRef } from "@angular/core";
import { BehaviorSubject, Observable, Subscription } from "rxjs";
import {
	FormBuilder,
	FormControl,
	FormGroup,
	Validators,
} from "@angular/forms";
import { OwnershipContractModel } from "../../../../../core/contract/ownership/ownership.model";
import { ActivatedRoute, Router } from "@angular/router";
import {
	LayoutConfigService,
	SubheaderService,
} from "../../../../../core/_base/layout";
import {
	LayoutUtilsService,
	MessageType,
	QueryParamsModel,
} from "../../../../../core/_base/crud";
import { select, Store } from "@ngrx/store";
import { AppState } from "../../../../../core/reducers";
import { SelectionModel } from "@angular/cdk/collections";
import { OwnershipContractDataSource } from "../../../../../core/contract/ownership/ownership.datasource";
import { CustomerService } from "../../../../../core/customer/customer.service";
import { UnitService } from "../../../../../core/unit/unit.service";
import { selectCustomerActionLoading } from "../../../../../core/customer/customer.selector";
import { selectUnitActionLoading } from "../../../../../core/unit/unit.selector";
import { QueryUnitModel } from "../../../../../core/unit/queryunit.model";
import { OwnershipContractService } from "../../../../../core/contract/ownership/ownership.service";
import { BlockService } from "../../../../../core/block/block.service";
import { QueryBlockModel } from "../../../../../core/block/queryblock.model";
import { QueryFloorModel } from "../../../../../core/floor/queryfloor.model";
import { FloorService } from "../../../../../core/floor/floor.service";
import { StateService } from "../../../../../core/state/state.service";
import { PopupPurchaseRequest } from "../popup-purchaseRequest/popup-purchaseRequest.component";
import { MatDialog } from "@angular/material";
import { HttpClient, HttpHeaders } from "@angular/common/http";

@Component({
	selector: "kt-add-ownership",
	templateUrl: "./add-ownership.component.html",
	styleUrls: ["./add-ownership.component.scss"],
})
export class AddOwnershipComponent implements OnInit {
	dataSource: OwnershipContractDataSource;
	ownership: OwnershipContractModel;
	ownershipId$: Observable<string>;
	oldOwnership: OwnershipContractModel;
	selectedTab = 0;
	loading$: Observable<boolean>;
	uloading$: Observable<boolean>;
	ownersForm: FormGroup;
	hasFormErrors = false;
	selection = new SelectionModel<OwnershipContractModel>(true, []);
	customerResult: any[] = [];
	unitResult: any[] = [];
	blockResult: any[] = [];
	floorResult: any[] = [];
	postalcodeResult: any[] = [];
	isHidden: boolean = true;
	TaxId: boolean = true;
	date1 = new FormControl(new Date());
	isPkp: boolean = false;
	loading: boolean = false;

	//
	valueVAId: string = "";
	valueIPL: string = "";
	valueWater: string = "";
	valuePower: string = "";
	valueUtility: string = "";
	valueGas: string = "";
	valueParking: string = "";
	cekInputVaIPL: boolean = false;
	cekInputVaWater: boolean = false;
	cekInputVaPower: boolean = false;
	cekInputVaUtility: boolean = false;
	cekInputVaGas: boolean = false;
	cekInputVaParking: boolean = false;

	// Start checked
	contentEditable: boolean = false;
	valueChoose: boolean = false;
	// End checked

	// Private Properties
	private subscriptions: Subscription[] = [];

	// Autocomplete Filter and Options
	CstmrResultFiltered = [];
	viewBlockResult = new FormControl();

	valueUnitId: string = "";

	loadingData = {
		block: false,
		floor: false,
		unit: false,
	};

	constructor(
		private activatedRoute: ActivatedRoute,
		private router: Router,
		private ownershipFB: FormBuilder,
		private subheaderService: SubheaderService,
		private service: OwnershipContractService,
		private cservice: CustomerService,
		private uservice: UnitService,
		private serviceBlk: BlockService,
		private serviceFloor: FloorService,
		private stateService: StateService,
		private layoutUtilsService: LayoutUtilsService,
		private store: Store<AppState>,
		private cd: ChangeDetectorRef,
		private dialog: MatDialog,
		private http: HttpClient,
		private layoutConfigService: LayoutConfigService
	) { }

	ngOnInit() {
		this.loading$ = this.store.pipe(select(selectCustomerActionLoading));
		this.uloading$ = this.store.pipe(select(selectUnitActionLoading));
		const routeSubscription = this.activatedRoute.params.subscribe(
			(params) => {
				this.ownership = new OwnershipContractModel();
				this.ownership.clear();
				this.initOwnership();
			}
		);
		this.subscriptions.push(routeSubscription);
	}

	ngOnDestroy() {
		this.subscriptions.forEach((sb) => sb.unsubscribe());
	}

	initOwnership() {
		this.createForm();
		this.loadCustomerList();
		this.loadBlockList();
	}
	showHidden() {
		this.isHidden = true;
	}
	createForm() {
		this.ownersForm = this.ownershipFB.group({
			cstmr: ["", Validators.required],
			contract_number: [{ value: "", disabled: true }],
			contract_date: [""],
			contract_number2: ["", Validators.required],
			expiry_date: [""],
			contact_name: ["", Validators.required],
			contact_address: [
				{ value: "", disabled: true },
				Validators.required,
			],
			contact_phone: ["", Validators.required],
			contact_email: [{ value: "", disabled: true }, Validators.required],
			contact_city: [{ value: "", disabled: true }],
			contact_zip: [{ value: "", disabled: true }],
			unit: ["", Validators.required],
			paymentType: ["", Validators.required],
			paymentTerm: ["", Validators.required],
			start_electricity_stand: [""],
			start_water_stand: ["", Validators.required],
			virtualAccount: [""],
			va_ipl: [{ value: "", disabled: false }],
			va_water: [{ value: "", disabled: false }],
			va_power: [{ value: "", disabled: false }],
			va_utility: [{ value: "", disabled: false }],
			va_gas: [{ value: "", disabled: false }],
			va_parking: [{ value: "", disabled: false }],
			isPKP: ["", Validators.required],
			isPP: [],
			regency: [""],
			tax_id: [""],
			blockId: [""],
			unit2: [""],
			floorId: [""],
			norek: [""],
			ktp: ["", Validators.required],
			npwp: ["", Validators.required],
			createdDate: [this.date1.value],
			billstatus: [0],
			receipt: this.ownershipFB.group({
				bastu: this.ownershipFB.group({
					bastu1: false,
				}),
				ppp: this.ownershipFB.group({
					ppp1: false,
				}),
				ba: this.ownershipFB.group({
					ba1: false,
				}),
				bpb: this.ownershipFB.group({
					bpb1: false,
				}),
				kp: this.ownershipFB.group({
					kp1: false,
				}),
				kbm: this.ownershipFB.group({
					kbm1: false,
				}),
				km: this.ownershipFB.group({
					km1: false,
				}),
				ac: this.ownershipFB.group({
					ac1: false,
				}),
				ap: this.ownershipFB.group({
					ap1: false,
				}),
				sm: this.ownershipFB.group({
					sm1: false,
				}),
				sv: this.ownershipFB.group({
					sv1: false,
				}),
				bph: this.ownershipFB.group({
					bph1: false,
				}),
				ksdm: this.ownershipFB.group({
					ksdm1: false,
				}),
			}),
		});
	}

	// start checked
	hideInputChecked() {
		if (this.contentEditable === true) {
			return "d-none col-lg-6 kt-margin-bottom-20-mobile";
		} else if (this.contentEditable === false) {
			return "col-lg-6 kt-margin-bottom-20-mobile";
		}
	}
	toggleEditable(event) {
		if (event.target.checked === true) {
			this.valueChoose = true;
			this.contentEditable = true;
			this.hideInputChecked;
		} else this.contentEditable = false;
	}
	toggleEditableAbonemen(event) {
		this.valueChoose = false;
		if (event.target.checked === true) {
			this.contentEditable = false;
			this.hideInputChecked;
		} else this.contentEditable = false;
	}
	// end checked

	loadBlockList() {
		this.loadingData.block = true;
		this.selection.clear();
		const queryParams = new QueryBlockModel(null, "asc", null, 1, 100);
		this.serviceBlk.getListBlock(queryParams).subscribe((res) => {
			this.blockResult = res.data;
			this.loadingData.block = false;
		});
	}

	loadFloorList(blkid) {
		this.selection.clear();
		const queryParams = new QueryFloorModel(null, "asc", null, 1, 10);
		this.serviceFloor.findFloorByParent(blkid).subscribe((res) => {
			this.floorResult = res.data;
		});
	}

	loadUnitList(flrid) {
		this.selection.clear();
		const queryParams = new QueryUnitModel(null, "asc", null, 1, 10);
		this.uservice.findUnitforContract(flrid).subscribe((res) => {
			this.unitResult = res.data;
		});
	}

	blkChange(item) {
		if (item) {
			this.loadFloorList(item);
			this.ownersForm.controls.flr.enable();
		}
	}
	flrChange(item) {
		if (item) {
			this.loadUnitList(item);
			this.ownersForm.controls.unt.enable();
		}
	}

	goBackWithId() {
		const url = `/contract-management/contract/ownership`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}

	refreshOwnership(isNew: boolean = false, id: string = "") {
		let url = this.router.url;
		if (!isNew) {
			this.router.navigate([url], { relativeTo: this.activatedRoute });
			return;
		}

		url = `/contract-management/contract/ownership/edit/${id}`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}

	onSubmit(withBack: boolean = false) {
		this.hasFormErrors = false;
		const controls = this.ownersForm.controls;
		/** check form */
		if (this.ownersForm.invalid) {
			Object.keys(controls).forEach((controlName) =>
				controls[controlName].markAsTouched()
			);

			this.hasFormErrors = true;
			this.selectedTab = 0;
			return;
		}

		this.loading = true;
		const preparedOwnership = this.prepareOwnership();

		// const httpHeaders = new HttpHeaders();
		// httpHeaders.set('Content-Type', 'application/json');
		// this.http.post<any>(`localhost:3000/api/vatoken/create`, dataVA, { headers: httpHeaders });

		this.addOwnership(preparedOwnership, withBack);
	}

	getContactNumber(unitid) {
		const controls = this.ownersForm.controls;
		this.valueUnitId = unitid;

		this.uservice.getUnitById(unitid).subscribe((res) => {
			controls.unit2.setValue(res.data.cdunt);
			controls.contract_number.setValue(res.data.cdunt);
		});
	}

	prepareOwnership(): OwnershipContractModel {
		const controls = this.ownersForm.controls;
		const _ownership = new OwnershipContractModel();
		_ownership.clear();
		_ownership.cstmr = controls.cstmr.value;
		_ownership.contact_address =
			controls.contact_address.value.toLowerCase();
		_ownership.contract_number2 = controls.contract_number2.value;
		_ownership.contact_phone = controls.contact_phone.value;
		_ownership.contact_email = controls.contact_email.value;
		_ownership.unit2 = controls.unit2.value.toLowerCase();
		_ownership.contact_city = controls.contact_city.value.toLowerCase();
		_ownership.contact_zip = controls.contact_zip.value;
		_ownership.contract_number = controls.contract_number.value;
		_ownership.unit = controls.unit.value.toLowerCase();
		_ownership.contract_date = controls.contract_date.value;
		_ownership.expiry_date = controls.expiry_date.value;
		_ownership.contact_name = controls.contact_name.value.toLowerCase();
		_ownership.paymentType = controls.paymentType.value.toLowerCase();
		_ownership.paymentTerm = controls.paymentTerm.value;
		_ownership.start_electricity_stand =
			controls.start_electricity_stand.value;
		_ownership.start_water_stand = controls.start_water_stand.value;
		_ownership.virtualAccount = controls.virtualAccount.value;
		_ownership.isPKP = controls.isPKP.value;
		_ownership.tax_id = controls.npwp.value;
		_ownership.regency = controls.regency.value;
		_ownership.ktp = controls.ktp.value;
		_ownership.npwp = controls.npwp.value;
		_ownership.norek = controls.norek.value;
		_ownership.billstatus = controls.billstatus.value;
		_ownership.createdDate = controls.createdDate.value;
		_ownership.isToken = this.valueChoose;
		_ownership.isTenant = true;
		_ownership.unitId = this.valueUnitId;

		// virtual account start
		_ownership.cstmrId = this.valueVAId;
		_ownership.va_ipl = this.valueIPL;
		_ownership.va_water = this.valueWater;
		_ownership.va_power = this.valuePower;
		_ownership.va_utility = this.valueUtility;
		_ownership.va_gas = this.valueGas;
		_ownership.va_parking = this.valueParking;

		// virtual account end
		_ownership.isPP = controls.isPP.value;
		_ownership.receipt = {
			bastu: controls.receipt.get("bastu")["controls"].bastu1.value,
			ppp: controls.receipt.get("ppp")["controls"].ppp1.value,
			ba: controls.receipt.get("ba")["controls"].ba1.value,
			bpb: controls.receipt.get("bpb")["controls"].bpb1.value,
			kp: controls.receipt.get("kp")["controls"].kp1.value,
			kbm: controls.receipt.get("kbm")["controls"].kbm1.value,
			km: controls.receipt.get("km")["controls"].km1.value,
			ac: controls.receipt.get("ac")["controls"].ac1.value,
			ap: controls.receipt.get("ap")["controls"].ap1.value,
			sm: controls.receipt.get("sm")["controls"].sm1.value,
			sv: controls.receipt.get("sv")["controls"].sv1.value,
			bph: controls.receipt.get("bph")["controls"].bph1.value,
			ksdm: controls.receipt.get("ksdm")["controls"].ksdm1.value,
		};
		return _ownership;
	}

	addOwnership(
		_ownership: OwnershipContractModel,
		withBack: boolean = false
	) {
		const addSubscription = this.service
			.createOwnershipContract(_ownership)
			.subscribe(
				(res) => {
					const message = `New ownership successfully has been added.`;
					this.service
						.createVirtualAccount(_ownership, res.data._id)
						.subscribe((resVA) => {
							this.service
								.updateOwnershipContractVAId(
									res.data._id,
									resVA.data._id
								)
								.subscribe((resVAUPD) =>
									console.log(resVAUPD, "this res upd VA no upd")
								);
						});
					this.layoutUtilsService.showActionNotification(
						message,
						MessageType.Create,
						5000,
						true,
						true
					);
					const url = `/contract-management/contract/ownership`;
					this.router.navigateByUrl(url, {
						relativeTo: this.activatedRoute,
					});
				},
				(err) => {
					console.error(err);
					const message =
						"Error while adding ownership | " + err.statusText;
					this.layoutUtilsService.showActionNotification(
						message,
						MessageType.Create,
						5000,
						true,
						false
					);
				}
			);
		this.subscriptions.push(addSubscription);
	}

	/**
	 * @param value
	 */
	_setBlockValue(value) {
		this.ownersForm.patchValue({ cstmr: value._id });
		this.getSingleCustomer(value._id);

		this.valueVAId = value._id;
	}

	_onKeyup(e: any) {
		this.ownersForm.patchValue({ cstmr: undefined });
		this._filterCstmrList(e.target.value);
	}

	_filterCstmrList(text: string) {
		this.CstmrResultFiltered = this.customerResult.filter((i) => {
			const filterText = `${i.cstrmrnm.toLocaleLowerCase()}`;
			if (filterText.includes(text.toLocaleLowerCase())) return i;
		});
	}

	loadCustomerList() {
		this.selection.clear();
		const queryParams = new QueryParamsModel(null, "asc", null, 1, 100000);
		this.cservice.getListCustomer(queryParams).subscribe((res) => {
			this.customerResult = res.data;
			this.CstmrResultFiltered = this.customerResult.slice();
			this.cd.markForCheck();
			this.viewBlockResult.enable();
		});
	}

	getSingleCustomer(id) {
		const controls = this.ownersForm.controls;
		this.datareset();
		this.cservice.getCustomerById(id).subscribe((data) => {
			controls.contact_name.setValue(data.data.cstrmrnm);
			controls.contact_address.setValue(data.data.addrcstmr);
			controls.contact_phone.setValue(data.data.phncstmr);
			controls.contact_email.setValue(data.data.emailcstmr);
			controls.contact_city.setValue(
				data.data.idvllg.district.regency.name
			);
			controls.tax_id.setValue(data.data.npwp);
			this.loadPostalcode(data.data.idvllg.district.name);
			controls.contact_zip.setValue(data.data.postcode);
			controls.regency.setValue(data.data.idvllg.district.name);
			controls.ktp.setValue(data.data.cstrmrpid);
			controls.npwp.setValue(data.data.npwp);
		});
	}

	datareset() {
		const controls = this.ownersForm.controls;
		controls.contact_name.setValue("");
		controls.contact_address.setValue("");
		controls.contact_phone.setValue("");
		controls.contact_email.setValue("");
		controls.contact_city.setValue("");
		controls.tax_id.setValue("");
		this.loadPostalcode("");
		controls.contact_zip.setValue("");
		controls.regency.setValue("");
		controls.ktp.setValue("");
		controls.npwp.setValue("");
	}

	loadPostalcode(regencyName: string) {
		const queryParams = new QueryParamsModel(null, "asc", "grpnm", 1, 10);
		this.stateService
			.getListPostalcode(queryParams, regencyName)
			.subscribe((res) => {
				this.postalcodeResult = res.data;
			});
	}

	changePKP() {
		if (this.isPkp == true) {
			this.TaxId = false;
			this.showTaxId();
		} else {
			this.TaxId = true;
			this.hiddenTaxId();
		}
	}

	hiddenTaxId() {
		this.ownersForm.controls["tax_id"].setValidators([]);
		this.ownersForm.controls["tax_id"].updateValueAndValidity();
	}
	showTaxId() {
		this.ownersForm.controls["tax_id"].setValidators([Validators.required]);
		// this.leaseForm.get('tax_id').setValidators([Validators.required]);
		this.ownersForm.controls["tax_id"].updateValueAndValidity();
	}

	getComponentTitle() {
		let result = "Create Ownership Contract";

		return result;
	}
	onAlertClose($event) {
		this.hasFormErrors = false;
	}

	processMenuHandler() {
		const controls = this.ownersForm.controls;
		const dialogRef = this.dialog.open(PopupPurchaseRequest, {
			data: {
				va_ipl: this.valueIPL,
				va_water: this.valueWater,
				va_power: this.valuePower,
				va_utility: this.valueUtility,
				va_gas: this.valueGas,
				va_parking: this.valueParking,
			},
			maxWidth: "500px",
			minHeight: "300px",
		});

		// tes modal
		dialogRef.afterClosed().subscribe((result) => {
			if (result.va_ipl !== "") {
				if (result.va_ipl === null) {
					controls.va_ipl.setValue("");
					this.cekInputVaIPL = false;
					this.valueIPL = undefined;
				} else {
					controls.va_ipl.setValue("VA IPL : " + result.va_ipl);
					this.valueIPL = result.va_ipl;
					this.cekInputVaIPL = true;
				}
			}
			if (result.va_water !== "") {
				if (result.va_water === null) {
					controls.va_water.setValue("");
					this.cekInputVaWater = false;
					this.valueWater = undefined;
				} else {
					controls.va_water.setValue("VA Water : " + result.va_water);
					this.valueWater = result.va_water;
					this.cekInputVaWater = true;
				}
			}
			if (result.va_power !== "") {
				if (result.va_power === null) {
					controls.va_power.setValue("");
					this.valuePower = undefined;
					this.cekInputVaPower = false;
				} else {
					controls.va_power.setValue("VA Power : " + result.va_power);
					this.valuePower = result.va_power;
					this.cekInputVaPower = true;
				}
			}
			if (result.va_utility !== "") {
				if (result.va_utility === null) {
					controls.va_utility.setValue("");
					this.cekInputVaUtility = false;
					this.valueUtility = undefined;
				} else {
					controls.va_utility.setValue(
						"VA Utility : " + result.va_utility
					);
					this.valueUtility = result.va_utility;
					this.cekInputVaUtility = true;
				}
			}
			if (result.va_gas !== "") {
				if (result.va_gas === null) {
					controls.va_gas.setValue("");
					this.cekInputVaGas = false;
					this.valueGas = undefined;
				} else {
					controls.va_gas.setValue("VA Gas : " + result.va_gas);
					this.valueGas = result.va_gas;
					this.cekInputVaGas = true;
				}
			}
			if (result.va_parking !== "") {
				if (result.va_parking === null) {
					controls.va_parking.setValue("");
					this.valueParking = undefined;
					this.cekInputVaParking = false;
				} else {
					controls.va_parking.setValue(
						"VA Parking : " + result.va_parking
					);
					this.valueParking = result.va_parking;
					this.cekInputVaParking = true;
				}
			}

			this.cd.markForCheck();
		});
	}
}
