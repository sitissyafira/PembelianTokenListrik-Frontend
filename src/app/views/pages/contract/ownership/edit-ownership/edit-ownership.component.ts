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
import { selectUnitActionLoading } from "../../../../../core/unit/unit.selector";
import { QueryUnitModel } from "../../../../../core/unit/queryunit.model";
import { OwnershipContractService } from "../../../../../core/contract/ownership/ownership.service";
import { BlockService } from "../../../../../core/block/block.service";
import { QueryBlockModel } from "../../../../../core/block/queryblock.model";
import { QueryFloorModel } from "../../../../../core/floor/queryfloor.model";
import { FloorService } from "../../../../../core/floor/floor.service";
import { StateService } from "../../../../../core/state/state.service";
import {
	selectOwnershipContractActionLoading,
	selectOwnershipContractById,
} from "../../../../../core/contract/ownership/ownership.selector";
import { OwnershipContractUpdated } from "../../../../../core/contract/ownership/ownership.action";
import { Update } from "@ngrx/entity";
import { MatDialog } from "@angular/material";
import { PopupPurchaseRequest } from "../popup-purchaseRequest/popup-purchaseRequest.component";
import { HttpClient } from "@angular/common/http";
import { environment } from "../../../../../../environments/environment";

@Component({
	selector: "kt-edit-ownership",
	templateUrl: "./edit-ownership.component.html",
	styleUrls: ["./edit-ownership.component.scss"],
})
export class EditOwnershipComponent implements OnInit {
	dataSource: OwnershipContractDataSource;
	//customer: CustomerModel;
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
	isPkp: boolean = false;
	loading: boolean = false;
	taxvalue: string;

	// start
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

	cekInputAndParagraftVAIPL: boolean = false;
	cekInputAndParagraftVAWater: boolean = false;
	cekInputAndParagraftVAPower: boolean = false;
	cekInputAndParagraftVAUtility: boolean = false;
	cekInputAndParagraftVAGas: boolean = false;
	cekInputAndParagraftVAParking: boolean = false;

	// Start checked
	contentEditable: boolean = false;
	valueChoose: boolean = false;
	// End checked

	checkVirtualAccount: boolean = true

	customerId: string = "";
	// Private Properties
	private subscriptions: Subscription[] = [];

	// Autocomplete Filter and Options
	CstmrResultFiltered = [];
	viewBlockResult = new FormControl();

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

	idContract: string = "";

	ngOnInit() {
		this.loading$ = this.store.pipe(
			select(selectOwnershipContractActionLoading)
		);
		this.uloading$ = this.store.pipe(select(selectUnitActionLoading));
		const routeSubscription = this.activatedRoute.params.subscribe(
			(params) => {
				const id = params.id;
				if (id) {
					this.store
						.pipe(select(selectOwnershipContractById(id)))
						.subscribe((res) => {
							if (res) {
								this.idContract = res._id;
								this.contentEditable = res.isToken;

								this.customerId = res.cstmr ? res.cstmr._id : "";

								this.isPkp = res.isPKP;
								if (this.isPkp == true) {
									this.TaxId = false;
									this.taxvalue = res.tax_id;
								} else {
									this.TaxId = true;
								}

								this.viewBlockResult.setValue(
									`${res.cstmr ? res.cstmr.cstrmrnm : ""}`
								);
								this._filterCstmrList(`${res.cstmr ? res.cstmr.cstrmrnm : ""}`);

								this.ownership = res;
								this.oldOwnership = Object.assign(
									{},
									this.ownership
								);
								this.initOwnership();
							}
						});
				}

				this.http
					.get<any>(
						`${environment.baseAPI}/api/vatoken/getbycontract/${this.idContract}`
					)
					.subscribe((res) => {
						if (
							res.data.va_ipl === null ||
							res.data.va_ipl === ""
						) {
							this.cekInputAndParagraftVAIPL = true;
						}
						if (
							res.data.va_water === null ||
							res.data.va_water === ""
						) {
							this.cekInputAndParagraftVAWater = true;
						}
						if (
							res.data.va_power === null ||
							res.data.va_power === ""
						) {
							this.cekInputAndParagraftVAPower = true;
						}
						if (
							res.data.va_utility === null ||
							res.data.va_utility === ""
						) {
							this.cekInputAndParagraftVAUtility = true;
						}
						if (
							res.data.va_gas === null ||
							res.data.va_gas === ""
						) {
							this.cekInputAndParagraftVAGas = true;
						}
						if (
							res.data.va_parking === null ||
							res.data.va_parking === ""
						) {
							this.cekInputAndParagraftVAParking = true;
						}
						this.valueIPL = res.data.va_ipl;
						this.valueWater = res.data.va_water;
						this.valuePower = res.data.va_power;
						this.valueUtility = res.data.va_utility;
						this.valueGas = res.data.va_gas;
						this.valueParking = res.data.va_parking;
					});
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
		this.loadFloorList(this.ownership.unit ? this.ownership.unit.flr.blk._id : "");
		this.loadUnitList(this.ownership.unit ? this.ownership.unit.flr._id : "");
	}

	showHidden() {
		this.isHidden = true;
	}

	createForm() {
		this.ownersForm = this.ownershipFB.group({
			cstmr: [this.ownership.cstmr ? this.ownership.cstmr._id : "", Validators.required],
			contact_name: [
				{ value: this.ownership.contact_name, disabled: false },
			],
			contact_address: [
				{ value: this.ownership.contact_address, disabled: true },
			],
			contact_phone: [
				{ value: this.ownership.contact_phone, disabled: false },
			],
			contact_email: [
				{ value: this.ownership.contact_email, disabled: true },
			],
			contact_city: [
				{ value: this.ownership.contact_city, disabled: true },
			],
			contact_zip: [
				{ value: this.ownership.contact_zip, disabled: true },
				Validators.required,
			],
			ktp: [{ value: this.ownership.ktp, disabled: false }],
			npwp: [{ value: this.ownership.npwp, disabled: false }],

			contract_number2: [
				{ value: this.ownership.contract_number2, disabled: false },
				Validators.required,
			],
			contract_number: [
				{ value: this.ownership.contract_number, disabled: true },
			],
			contract_date: [
				{ value: this.ownership.contract_date, disabled: true },
			],
			expiry_date: [
				{ value: this.ownership.expiry_date, disabled: false },
			],
			unit: [{ value: this.ownership.unit ? this.ownership.unit._id : "", disabled: true }],
			start_electricity_stand: [
				{
					value: this.ownership.start_electricity_stand,
					disabled: false,
				},
			],
			start_water_stand: [
				{ value: this.ownership.start_water_stand, disabled: false },
			],
			isPP: [{ value: this.ownership.isPP, disabled: false }],
			blockId: [
				{ value: this.ownership.unit ? this.ownership.unit.flr.blk._id : "", disabled: true },
			],
			floorId: [{ value: this.ownership.unit ? this.ownership.unit.flr._id : "", disabled: true }],
			unit2: [this.ownership.unit2],
			regency: [{ value: "", disabled: false }],

			// VA
			va_ipl: [{ value: "", disabled: false }],
			va_water: [{ value: "", disabled: false }],
			va_power: [{ value: "", disabled: false }],
			va_utility: [{ value: "", disabled: false }],
			va_gas: [{ value: "", disabled: false }],
			va_parking: [{ value: "", disabled: false }],

			paymentType: [
				{ value: this.ownership.paymentType, disabled: false },
			],
			paymentTerm: [
				{ value: this.ownership.paymentTerm, disabled: false },
			],
			virtualAccount: [
				{ value: this.ownership.virtualAccount, disabled: false },
			],
			isPKP: [{ value: this.ownership.isPKP, disabled: false }],
			tax_id: [{ value: this.ownership.tax_id, disabled: false }],
			norek: [{ value: this.ownership.norek, disabled: false }],

			receipt: this.ownershipFB.group({
				bastu: this.ownershipFB.group({
					bastu1: [
						{
							value: this.ownership.receipt ? this.ownership.receipt.bastu : "",
							disabled: false,
						},
					],
				}),
				ppp: this.ownershipFB.group({
					ppp1: [
						{ value: this.ownership.receipt ? this.ownership.receipt.ppp : "", disabled: false },
					],
				}),
				ba: this.ownershipFB.group({
					ba1: [
						{ value: this.ownership.receipt ? this.ownership.receipt.ba : "", disabled: false },
					],
				}),
				bpb: this.ownershipFB.group({
					bpb1: [
						{ value: this.ownership.receipt ? this.ownership.receipt.bpb : "", disabled: false },
					],
				}),
				kp: this.ownershipFB.group({
					kp1: [
						{ value: this.ownership.receipt ? this.ownership.receipt.kp : "", disabled: false },
					],
				}),
				kbm: this.ownershipFB.group({
					kbm1: [
						{ value: this.ownership.receipt ? this.ownership.receipt.kbm : "", disabled: false },
					],
				}),
				km: this.ownershipFB.group({
					km1: [
						{ value: this.ownership.receipt ? this.ownership.receipt.km : "", disabled: false },
					],
				}),
				ac: this.ownershipFB.group({
					ac1: [
						{ value: this.ownership.receipt ? this.ownership.receipt.ac : "", disabled: false },
					],
				}),
				ap: this.ownershipFB.group({
					ap1: [
						{ value: this.ownership.receipt ? this.ownership.receipt.ap : "", disabled: false },
					],
				}),
				sm: this.ownershipFB.group({
					sm1: [
						{ value: this.ownership.receipt ? this.ownership.receipt.sm : "", disabled: false },
					],
				}),
				sv: this.ownershipFB.group({
					sv1: [
						{ value: this.ownership.receipt ? this.ownership.receipt.sv : "", disabled: false },
					],
				}),
				bph: this.ownershipFB.group({
					bph1: [
						{ value: this.ownership.receipt ? this.ownership.receipt.bph : "", disabled: false },
					],
				}),
				ksdm: this.ownershipFB.group({
					ksdm1: [
						{ value: this.ownership.receipt ? this.ownership.receipt.ksdm : "", disabled: false },
					],
				}),
			}),
		});
	}

	loadBlockList() {
		this.selection.clear();
		const queryParams = new QueryBlockModel(null, "asc", null, 1, 100);
		this.serviceBlk.getListBlock(queryParams).subscribe((res) => {
			this.blockResult = res.data;
		});
	}

	loadFloorList(blkid) {
		this.selection.clear();
		const queryParams = new QueryFloorModel(null, "asc", null, 1, 10);
		this.serviceFloor.findFloorByParent(blkid).subscribe((res) => {
			this.floorResult = res.data;
		});
	}

	// start checked
	hideInputChecked() {
		if (this.contentEditable === true) {
			const controls = this.ownersForm.controls;

			controls.start_electricity_stand.setValue(null);

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

	loadUnitList(flrid) {
		this.selection.clear();
		const queryParams = new QueryUnitModel(null, "asc", null, 1, 10);
		this.uservice.findUnitByParent(flrid).subscribe((res) => {
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

	getSingleCustomer(id) {
		const controls = this.ownersForm.controls;
		this.cservice.getCustomerById(id).subscribe((data) => {
			controls.contact_name.setValue(data.data.cstrmrnm);
			controls.contact_address.setValue(data.data.addrcstmr);
			controls.contact_phone.setValue(data.data.phncstmr);
			controls.contact_email.setValue(data.data.emailcstmr);
			controls.tax_id.setValue(data.data.npwp);

			if (data.data.idvllg === null) {
				controls.contact_city.setValue("");
				controls.contact_zip.setValue("");
			} else {
				this.loadPostalcode(data.data.idvllg.district.name);
				controls.contact_city.setValue(
					data.data.idvllg.district.regency.name
				);
				controls.contact_zip.setValue(data.data.postcode);
			}
			if (
				data.data.cstrmrpid === null ||
				data.data.cstrmrpid === undefined ||
				data.data.cstrmrpid === ""
			) {
				controls.ktp.setValue(null);
			} else {
				controls.ktp.setValue(data.data.cstrmrpid);
			}
			controls.npwp.setValue(data.data.npwp);
		});
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
		this.updateOwnership(preparedOwnership, withBack);
	}

	/**
	 * @param value
	 */
	_setBlockValue(value) {
		this.ownersForm.patchValue({ cstmr: value._id });
		this.getSingleCustomer(value._id);
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

	getContactNumber(unitid) {
		this.service.getOwnershipContractNumber(unitid).subscribe((res) => {
			const controls = this.ownersForm.controls;
			controls.contract_number.setValue(res.data);
		});
		this.uservice.getUnitById(unitid).subscribe((res) => {
			const controls = this.ownersForm.controls;
			controls.unit2.setValue(res.data.cdunt);
		});
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
					this.cekInputAndParagraftVAIPL = true;
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
					this.cekInputAndParagraftVAWater = true;
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
					this.cekInputAndParagraftVAPower = true;
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
					this.cekInputAndParagraftVAUtility = true;
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
					this.cekInputAndParagraftVAGas = true;
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
					this.cekInputAndParagraftVAParking = true;
				}
			}

			this.cd.markForCheck();
		});
	}

	prepareOwnership(): OwnershipContractModel {
		const controls = this.ownersForm.controls;
		const _ownership = new OwnershipContractModel();
		_ownership.clear();
		_ownership._id = this.ownership._id;
		_ownership.cstmr = controls.cstmr.value.toLowerCase();
		_ownership.contact_address =
			controls.contact_address.value.toLowerCase();
		_ownership.contact_phone = controls.contact_phone.value;
		_ownership.contact_email = controls.contact_email.value;
		_ownership.unit2 = controls.unit2.value.toLowerCase();
		_ownership.contact_city = controls.contact_city.value;
		_ownership.contact_zip = controls.contact_zip.value;
		_ownership.contract_number = controls.contract_number.value;
		_ownership.contract_number2 = controls.contract_number2.value;
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
		_ownership.ktp = controls.ktp.value;
		_ownership.npwp = controls.npwp.value;
		_ownership.regency = controls.regency.value;
		_ownership.norek = controls.norek.value;
		_ownership.isPP = controls.isPP.value;
		_ownership.cstmrId = this.customerId;
		_ownership.isToken = this.contentEditable;

		// virtual account start
		_ownership.va_ipl = this.valueIPL;
		_ownership.va_water = this.valueWater;
		_ownership.va_power = this.valuePower;
		_ownership.va_utility = this.valueUtility;
		_ownership.va_gas = this.valueGas;
		_ownership.va_parking = this.valueParking;
		// virtual account end

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

	updateOwnership(
		_ownership: OwnershipContractModel,
		withBack: boolean = false
	) {
		this.service
			.updateVirtualAccount(_ownership, this.idContract)
			.subscribe((res) => {
				console.log(res);
			});
		const updatedOwnership: Update<OwnershipContractModel> = {
			id: _ownership._id,
			changes: _ownership,
		};
		this.store.dispatch(
			new OwnershipContractUpdated({
				partialOwnershipContract: updatedOwnership,
				ownershipcontract: _ownership,
			})
		);
		const message = `Ownership successfully has been saved.`;
		this.layoutUtilsService.showActionNotification(
			message,
			MessageType.Update,
			5000,
			true,
			true
		);
		if (withBack) {
			this.goBackWithId();
		} else {
			this.refreshOwnership(false);
			const url = `/contract-management/contract/ownership`;
			this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
		}
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
		let result = "Edit Ownership Contract";

		return result;
	}
	onAlertClose($event) {
		this.hasFormErrors = false;
	}
}
