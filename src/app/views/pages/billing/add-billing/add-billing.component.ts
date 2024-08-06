// Angular
import { Component, OnInit, OnDestroy, ChangeDetectorRef } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import {
	FormBuilder,
	FormControl,
	FormGroup,
	Validators,
} from "@angular/forms";
import {
	MomentDateAdapter,
	MAT_MOMENT_DATE_ADAPTER_OPTIONS,
} from "@angular/material-moment-adapter";
import { MatDatepickerInputEvent } from "@angular/material/datepicker";
// RxJS
import { BehaviorSubject, Observable, of, Subscription } from "rxjs";
// NGRX
import { Store, select } from "@ngrx/store";
import { Update } from "@ngrx/entity";
import { AppState } from "../../../../core/reducers";
// Layout
import {
	SubheaderService,
	LayoutConfigService,
} from "../../../../core/_base/layout";
import {
	LayoutUtilsService,
	MessageType,
	QueryParamsModel,
} from "../../../../core/_base/crud";
import {
	selectLastCreatedBillingId,
	selectBillingActionLoading,
	selectBillingById,
} from "../../../../core/billing/billing.selector";
import {
	BillingOnServerCreated,
	BillingUpdated,
} from "../../../../core/billing/billing.action";
import { BillingModel } from "../../../../core/billing/billing.model";
import { BillingService } from "../../../../core/billing/billing.service";
import { SelectionModel } from "@angular/cdk/collections";
import {
	DateAdapter,
	MAT_DATE_FORMATS,
	MAT_DATE_LOCALE,
	MatDatepicker,
	MatDialog,
} from "@angular/material";
import * as _moment from "moment";
const moment = _rollupMoment || _moment;
import { default as _rollupMoment, Moment } from "moment";
import { CustomerService } from "../../../../core/customer/customer.service";
import { UnitService } from "../../../../core/unit/unit.service";
import { PowerTransactionService } from "../../../../core/power/transaction/transaction.service";
import { WaterTransactionService } from "../../../../core/water/transaction/transaction.service";
import { OwnershipContractService } from "../../../../core/contract/ownership/ownership.service";
import { LeaseContractService } from "../../../../core/contract/lease/lease.service";
import { QueryOwnerTransactionModel } from "../../../../core/contract/ownership/queryowner.model";
import { PowerMeterService } from "../../../../core/power";
import { WaterMeterService } from "../../../../core/water/meter/meter.service";
import { async } from "@angular/core/testing";
import { TaxService } from '../../../../core/masterData/tax/tax.service'
import { QueryTaxModel } from '../../../../core/masterData/tax/querytax.model';
import { environment } from "../../../../../environments/environment";
import { HttpClient } from "@angular/common/http";
import { ServiceFormat } from "../../../../core/serviceFormat/format.service";

@Component({
	selector: "kt-add-billing",
	templateUrl: "./add-billing.component.html",
	styleUrls: ["./add-billing.component.scss"],
})
export class AddBillingComponent implements OnInit, OnDestroy {
	codenum: string = "-";
	type;
	billstats;

	//listrik
	pemakaianListrik: number;
	datasc: number;
	hasilsc: number;
	datappju: number;
	hasilppju: number;
	dataloss: number;
	allpoweramount: number;
	monthPower: number;
	serviceTax: TaxService

	amountIplJournal: any

	//water
	monthWater: number;
	allwateramount: number;

	//
	dataAllIPLParse: number;
	isfreeIpl: boolean = false;
	isfreeAbodement: boolean = false;

	// isToken Unit Start
	isToken: boolean = false;
	// isToken Unit End
	isUnitChild: boolean = false;

	// PPN
	ppnValue: number = 0
	adminValue: number = 0
	allIplNatural: number = 0

	//Error Message Water || Electricity
	message: string;
	hasError: boolean = false;

	billing: BillingModel;
	billingId$: Observable<string>;
	oldBilling: BillingModel;
	selectedTab = 0;
	loading$: Observable<boolean>;
	billingForm: FormGroup;
	hasFormErrors = false;
	isMonthDifferents = false;
	unitResult: any[] = [];
	customerResult: any[] = [];
	powerResult: any[] = [];
	waterResult: any[] = [];
	selection = new SelectionModel<BillingModel>(true, []);
	date = new FormControl(moment());
	date1 = new FormControl(new Date());
	serializedDate = new FormControl(new Date().toISOString());
	duedate = new FormControl();
	billingSave: boolean = false;
	UnitResultFiltered = [];
	viewBlockResult = new FormControl();
	checkOutContract: any
	idUnitContract: any
	validateContract: boolean = false

	// totalResultGalon: number

	// updAmountTemplateBilling isToken START
	abodemenPrice: number = 0;
	admBankPrice: number = 0;
	isFreeIPLMonth: boolean = false;
	// updAmountTemplateBilling isToken END

	// Send data consumption to db, object with response
	resultSendPowerConsumption: any = {}
	resultSendWaterConsumption: any = {}
	resultSendIplConsumption: any = {}


	isGenerateBilling: string = "" /* To determine the condition of the generating billing process in progress */
	msgErrorGenerate: string = "" /* To display message error proccessing generate */

	loadingData = {
		unit: false,
	};

	billmntE: Date;
	billmntW: Date;

	dateConsumptionConvert: any = ""
	dateConsumption: any = ""
	isSewaCheckOut: any
	isSewa: any = ""
	idPpn = ""
	// valueTrGalon: any = {}

	useAmountRslt = 0;

	// Private properties
	private subscriptions: Subscription[] = [];
	constructor(
		private activatedRoute: ActivatedRoute,
		private serviceFormat: ServiceFormat,
		private router: Router,
		private billingFB: FormBuilder,
		private layoutUtilsService: LayoutUtilsService,
		private store: Store<AppState>,
		private serviceBill: BillingService,
		private serviceUnit: UnitService,
		private ownService: OwnershipContractService,
		private leaseService: LeaseContractService,
		private powerservice: PowerTransactionService,
		private waterservice: WaterTransactionService,
		private cd: ChangeDetectorRef,
		private http: HttpClient,
		private dialog: MatDialog,


	) { }

	ngOnInit() {
		this.loading$ = this.store.pipe(select(selectBillingActionLoading));
		const routeSubscription = this.activatedRoute.params.subscribe(
			(params) => {
				const id = params.id;
				if (id) {
					this.store
						.pipe(select(selectBillingById(id)))
						.subscribe((res) => {
							if (res) {
								this.billing = res;
								this.oldBilling = Object.assign(
									{},
									this.billing
								);
								this.initBilling();
							}
						});


				} else {
					this.billing = new BillingModel();
					this.billing.clear();
					this.initBilling();
				}
			}
		);
		this.http
			.get<any>(`${environment.baseAPI}/api/tax/list?active=true`).subscribe(res => {
				if (res.data) {
					this.ppnValue = parseInt(res.data.nominal)
					this.idPpn = res.data._id
				}
				console.log(this.ppnValue)

			})
		this.subscriptions.push(routeSubscription);
	}
	initBilling() {
		this.createForm();
		this.loadUnit();
		// this.getBillingNumber(new Date())
	}
	createForm() {
		this.billingForm = this.billingFB.group({
			contract: ["", Validators.required],
			unit2: [""],
			billed_to: [{ value: this.billing.billed_to, disabled: true }],
			unit: [undefined],
			billing: this.billingFB.group({
				electricity: this.billingFB.group({
					electric_trans: [undefined],
				}),
				water: this.billingFB.group({
					water_trans: [undefined],
				}),
				ipl: this.billingFB.group({
					unit_trans: [undefined],
				}),
				/* in the comments because there is a change in flow or gallons have not been calculated */
				// galon: this.billingFB.group({
				// 	galon_trans: [],
				// }),
			}),
			power: this.billingFB.group({
				powerMeter: [{ value: "", disabled: true }],
				powerRateName: [{ value: "", disabled: true }],
				powerRate: [{ value: "", disabled: true }],
				startPower: [{ value: "", disabled: true }],
				endPower: [{ value: "", disabled: true }],
				usePower: [{ value: "", disabled: true }],
				useAmount: [{ value: "", disabled: true }],
				sc: [{ value: "", disabled: true }],
				scAmount: [{ value: "", disabled: true }],
				ppju: [{ value: "", disabled: true }],
				ppjuAmount: [{ value: "", disabled: true }],
				loss: [{ value: "", disabled: true }],
				lossAmount: [{ value: "", disabled: true }],
				allPowerAmount: [{ value: "", disabled: true }],
				totalTax: [{ value: "", disabled: true }],
				adminFeeAfterTax: [{ value: "", disabled: true }],
				ppn: [{ value: "", disabled: true }]
			}),
			water: this.billingFB.group({
				waterMeter: [{ value: "", disabled: true }],
				waterRate: [{ value: "", disabled: true }],
				startWater: [{ value: "", disabled: true }],
				endWater: [{ value: "", disabled: true }],
				useWater: [{ value: "", disabled: true }],
				useWaterAmount: [{ value: "", disabled: true }],
				maintenance: [{ value: "", disabled: true }],
				administration: [{ value: "", disabled: true }],
				dirtyWater: [{ value: "", disabled: true }],
				dirtyWaterAmount: [{ value: "", disabled: true }],
				allWaterAmount: [{ value: "", disabled: true }],
				admBank: [{ value: this.admBankPrice, disabled: true }],
				totalTax: [{ value: "", disabled: true }],
				adminFeeAfterTax: [{ value: "", disabled: true }],
				ppn: [{ value: "", disabled: true }]
			}),
			/* in the comments because there is a change in flow or gallons have not been calculated */
			// galon: this.billingFB.group({
			// 	brand: [{ value: "", disabled: true }],
			// 	rate: [{ value: "", disabled: true }],
			// 	qty: [{ value: "", disabled: true }],
			// 	totalTr: [{ value: "", disabled: true }],
			// 	totalTax: [{ value: "", disabled: true }],
			// }),
			ipl: this.billingFB.group({
				unitSize: [{ value: "", disabled: true }],
				serviceCharge: [{ value: "", disabled: true }],
				sinkingFund: [{ value: "", disabled: true }],
				monthIpl: [{ value: "", disabled: true }],
				ipl: [{ value: "", disabled: true }],
				allIpl: [{ value: "", disabled: true }],
				totalIplNatural: [{ value: "", disabled: true }],
				admBank: [{ value: this.admBankPrice, disabled: true }],
				totalTax: [{ value: "", disabled: true }],
				// adminFeeAfterTax: [{ value: "", disabled: true }],
				ppn: [{ value: "", disabled: true }]
			}),
			totalBilling: [{ value: "", disabled: true }],
			totalBillLeft: [{ value: "", disabled: true }], /* totalBillLeft: Ini request Back-End, untuk dikirim sebagai tagihannya */
			subTotalBilling: [{ value: "", disabled: true }], /* subTotalBilling: Ini request Back-End, Sebagai Nilai murni daro totalBilling tanpa FEE atau PPN*/
			isFreeIpl: [""],
			isFreeAbodement: [""],
			billing_number: [
				{ value: this.codenum, disabled: true },
				Validators.required,
			],
			created_date: [
				{ value: this.date1.value, disabled: true },
				Validators.required,
			],
			billing_date: [
				{ value: this.date1.value, disabled: false },
				Validators.required,
			],
			due_date: [{ value: "", disabled: true }],
		});
	}

	getBillingNumber(date) {
		const dateValue = {
			date
		}
		this.serviceBill.getBillingNumber(dateValue).subscribe((res) => {
			this.codenum = res.data;
			const controls = this.billingForm.controls;
			controls.billing_number.setValue(this.codenum);
			// controls.due_date.setValue(
			// 	moment(this.date1.value, "MM/DD/YYYY").add(15, "day").toDate()
			// );
			controls.due_date.setValue(
				moment(date, "MM/DD/YYYY").add(15, "day").toDate()
			);
			this.cd.markForCheck()
		});
	}

	/**
	 * @param value
	 */
	_setBlockValue(value) {
		this.billingForm.patchValue({ unit: value._id });
		this.isUnitChild = value.isChild;

		this.unitOnChange(value._id);
		// this.getTransactionGalon(value._id)

		if (value.isChild) {
			this.conditionIsChild()
			this.isfreeIpl = true;
			this.billingForm.controls.isFreeIpl.disable();
		} else {
			this.isfreeIpl = false;
			this.billingForm.controls.isFreeIpl.enable();
		}

		/* Delay time to make sure the above function runs first */
		setTimeout(() => {
			this.calculateBillAfterTax() /* Run the billing calculation function after TAX/PPN */
		}, 500);
	}

	conditionIsChild() {
		const controls = this.billingForm.controls;
		controls.ipl.get('unitSize').setValue(0);
		controls.ipl.get('serviceCharge').setValue(0);
		controls.ipl.get('sinkingFund').setValue(0);
		controls.ipl.get('monthIpl').setValue(0);
		controls.ipl.get('ipl').setValue(0);
		controls.ipl.get('allIpl').setValue(0);
		controls.ipl.get('totalIplNatural').setValue(0);
		controls.ipl.get('admBank').setValue(0);
		controls.ipl.get('totalTax').setValue(0);
	}

	_onKeyup(e: any) {
		this.billingForm.patchValue({ unit: undefined });
		this._filterCstmrList(e.target.value);
	}

	_filterCstmrList(text: string) {
		this.UnitResultFiltered = this.unitResult.filter((i) => {
			const filterText = `${i.cdunt.toLocaleLowerCase()}`;
			if (filterText.includes(text.toLocaleLowerCase())) return i;
		});
	}

	loadUnit() {
		this.loadingData.unit = true;
		this.selection.clear();
		const queryParams = new QueryOwnerTransactionModel(
			null,
			"asc",
			"grpnm",
			1,
			10000
		);
		this.serviceUnit.getDataUnitForParking(queryParams).subscribe((res) => {
			this.unitResult = res.data;
			this.UnitResultFiltered = this.unitResult.slice();
			this.cd.markForCheck();
			this.viewBlockResult.enable();
			this.loadingData.unit = false;
		});
	}

	// getTransactionGalon(idUnit) {
	// 	const controls = this.billingForm.controls;
	// 	const queryParams = {
	// 		filter: idUnit
	// 	}
	// 	this.serviceBill.getDataTransactionGalon(queryParams).subscribe((resp) => {
	// 		// controls.galon.get('totalTr').setValue(this.formatRupiah(resp.data.totalTrAfterTax))
	// 		this.totalResultGalon = resp.data.totalTrAfterTax
	// 		// controls.galon.get('qty').setValue(resp.data.totalQty)
	// 		// controls.galon.get('totalTax').setValue(resp.data.totalTax === 0 ? 0 :
	// 		// 	`Rp.${this.formatRupiah(resp.data.totalTax)} - PPN ${resp.data.taxPercentage}%`)

	// 		controls.billing.get("ipl")["controls"].unit_trans.setValue(idUnit)

	// 		this.valueTrGalon = { ...resp.data }

	// 		let valueBrand = [], valueGalonRate = [], valueIdGalon = []
	// 		if (resp.data.trDetail) {
	// 			resp.data.trDetail.forEach(item => valueIdGalon.push(item._id))

	// 			// controls.billing.get("galon")["controls"].galon_trans.setValue(valueIdGalon)

	// 			resp.data.trDetail.forEach(item => valueBrand.push(` ${item.brandName.toUpperCase()}`))
	// 			resp.data.trDetail.forEach(item => valueGalonRate.push(` Rp.${this.formatRupiah(item.priceRate)}`))
	// 		}

	// 		// controls.galon.get('brand').setValue(valueBrand)
	// 		// controls.galon.get('rate').setValue(valueGalonRate)
	// 	})

	// }

	unitOnChange(id) {
		const controls = this.billingForm.controls;
		controls.totalBilling.setValue(0);
		controls.water.get("ppn").setValue(this.ppnValue)
		controls.power.get("ppn").setValue(this.ppnValue)
		controls.ipl.get("ppn").setValue(this.ppnValue)
		this.serviceUnit.getUnitById(id).subscribe((data) => {
			this.isSewa = data.data.isSewa

			// 	const dataAllIPLJournal = Math.round(controls.ipl.get("unitSize").value * controls.ipl.get("ipl").value * 1).toFixed(0);
			// this.amountIplJournal = parseInt(dataAllIPLJournal)

			this.amountIplJournal = data.data.untsqr * (data.data.untrt.service_rate + data.data.untrt.sinking_fund) * 1
			controls.ipl.get("totalIplNatural").setValue(this.formatRupiah(this.amountIplJournal));


			this.type = data.data.type;
			controls.ipl.get("unitSize").setValue(data.data.untsqr);

			if (this.isUnitChild) {
				controls.ipl.get("ipl").setValue(0);
				controls.ipl.get("serviceCharge").setValue(0);
				controls.ipl.get("sinkingFund").setValue(0);
			} else {
				controls.ipl
					.get("ipl")
					.setValue(data.data.srvcrate + data.data.sinkingfund);
				controls.ipl.get("serviceCharge").setValue(data.data.srvcrate);
				controls.ipl.get("sinkingFund").setValue(data.data.sinkingfund);
			}
			this.getDataElectricity(id);
			this.getDataWater(id);

			if (this.type == "owner" || this.type == "pp") {
				if (data.data.isSewa) {
					this.getDataRenter(id)
				} else {
					this.getDataOwner(id);
				}
			} else {
				this.leaseService
					.findLeaseContractByUnit(id)
					.subscribe((datalease) => {
						this.billingForm.controls.contract.setValue(
							datalease.data[0]._id
						);
						this.billingForm.controls.billed_to.setValue(
							datalease.data[0].contact_name
						);
						this.billingForm.controls.unit2.setValue(
							datalease.data[0].unit2
						);
						this.billstats = datalease.data[0].billstatus;
						const contractDate = moment(
							datalease.data[0].contract_date
						).format("MM");
						const contractDatatoDate = parseInt(contractDate);

						let dataIPL = 1; //ADJUSTMENT PBM 1 BULANAN FIXED

						if (dataIPL == 0) {
							this.isFreeIPLMonth = true;
							controls.ipl.get("ipl").setValue(0);
						} else {
							this.isFreeIPLMonth = false;
						}
						// Condition while unit status is child
						if (this.isUnitChild) {
							controls.ipl.get("monthIpl").setValue(0);
						} else {
							controls.ipl.get("monthIpl").setValue(dataIPL);
						}

						const dataAllIPL = Math.round(
							data.data.untsqr *
							(data.data.srvcrate + data.data.sinkingfund) *
							dataIPL
						).toFixed(0);
						// const adminFeeAfterTax = this.adminValue + (this.adminValue * (this.ppnValue / 100))
						this.dataAllIPLParse = (parseInt(dataAllIPL) + (parseInt(dataAllIPL) * (this.ppnValue / 100)))
						const totalTaxResult = (parseInt(dataAllIPL) * (this.ppnValue / 100))

						this.allIplNatural = parseInt(dataAllIPL)

						// Change Value Total All START
						if (this.isUnitChild) {
							controls.ipl.get('totalIplNatural').setValue(0)
						} else {
							controls.ipl.get('totalIplNatural').setValue(this.formatRupiah(parseInt(dataAllIPL)))
						}
						// Change Value Total All END

						this.resultSendIplConsumption = {
							taxPercentage: this.ppnValue,
							totalTax: totalTaxResult,
							allIplAfterTax: this.dataAllIPLParse
						}

						// controls.ipl.get("totalTax").setValue(`${this.formatRupiah((parseInt(dataAllIPL) * (this.ppnValue / 100)))} - PPN ${this.ppnValue}%`);
						controls.ipl.get("totalTax").setValue(totalTaxResult)
						// controls.ipl.get("adminFeeAfterTax").setValue(`${this.formatRupiah(adminFeeAfterTax)}`);

						this.isUnitChild || this.isFreeIPLMonth
							? controls.ipl.get("allIpl").setValue(0)
							: controls.ipl
								.get("allIpl")
								.setValue(this.dataAllIPLParse);
					});
			}
		});
	}

	_getStatusPayCond(status: string) {
		if (status) return "chip chip--parsial-lebih";
		else return "chip chip--outstanding";
	}

	getDataOwner(id) {
		const controls = this.billingForm.controls;
		this.ownService
			.findOwnershipContractByUnit(id)
			.subscribe((dataowner) => {
				this.isToken = dataowner.data[0].isToken;

				this.billingForm.controls.contract.setValue(
					dataowner.data[0]._id
				);
				this.billingForm.controls.billed_to.setValue(
					dataowner.data[0].contact_name
				);
				this.billingForm.controls.unit2.setValue(
					dataowner.data[0].unit2
				);
				this.billstats = dataowner.data[0].billstatus;
				const contractDate = moment(
					dataowner.data[0].contract_date
				).format("MM");
				const contractDatatoDate = parseInt(contractDate);

				let dataIPL = 1; //ADJUSTMENT PBM 1 BULANAN FIXED


				if (dataIPL == 0) {
					this.isFreeIPLMonth = true;
					controls.ipl.get("ipl").setValue(0);
				} else {
					this.isFreeIPLMonth = false;
				}

				// Condition while unit status is child
				if (this.isUnitChild) {
					controls.ipl.get("monthIpl").setValue(0);
				} else {
					controls.ipl.get("monthIpl").setValue(dataIPL);
				}

				const dataAllIPL = Math.round(
					controls.ipl.get("unitSize").value *
					controls.ipl.get("ipl").value *
					dataIPL
				).toFixed(0);

				// const adminFeeAfterTax = this.adminValue + (this.adminValue * (this.ppnValue / 100))
				const totalTaxResult = (parseInt(dataAllIPL) * (this.ppnValue / 100))
				this.dataAllIPLParse = (parseInt(dataAllIPL) + (parseInt(dataAllIPL) * (this.ppnValue / 100)))

				this.allIplNatural = parseInt(dataAllIPL)

				// Change Value Total All START
				if (this.isUnitChild) {
					controls.ipl.get('totalIplNatural').setValue(0)
				} else {
					controls.ipl.get('totalIplNatural').setValue(this.formatRupiah(parseInt(dataAllIPL)))
				}
				// Change Value Total All END

				this.resultSendIplConsumption = {
					taxPercentage: this.ppnValue,
					totalTax: totalTaxResult,
					allIplAfterTax: this.dataAllIPLParse
				}

				// controls.ipl.get("totalTax").setValue(`${this.formatRupiah((parseInt(dataAllIPL) * (this.ppnValue / 100)))} - PPN ${this.ppnValue}%`);
				controls.ipl.get("totalTax").setValue(totalTaxResult)
				// controls.ipl.get("adminFeeAfterTax").setValue(`${this.formatRupiah(adminFeeAfterTax)}`);
				this.isUnitChild || this.isFreeIPLMonth
					? controls.ipl.get("allIpl").setValue(0)
					: controls.ipl.get("allIpl").setValue(this.formatRupiah(this.dataAllIPLParse));
			});
	}

	getDataRenter(id) {
		const controls = this.billingForm.controls;
		const params = {
			filter: id
		}
		this.ownService
			.findRenterContractByUnit(params)
			.subscribe((datarenter) => {
				const dateContract = new Date(`${datarenter.data.checkOut}`)
				this.idUnitContract = id
				this.checkOutContract = dateContract
				this.isToken = datarenter.data.isToken;


				this.billingForm.controls.contract.setValue(
					datarenter.data._id
				);
				this.billingForm.controls.billed_to.setValue(
					datarenter.data.contact_name
				);
				this.billingForm.controls.unit2.setValue(
					datarenter.data.unit2
				);
				this.billstats = datarenter.data.billstatus;
				const contractDate = moment(
					datarenter.data.contract_date
				).format("MM");
				const contractDatatoDate = parseInt(contractDate);

				let dataIPL = 1; //ADJUSTMENT PBM 1 BULANAN FIXED

				if (dataIPL == 0) {
					this.isFreeIPLMonth = true;
					controls.ipl.get("ipl").setValue(0);
				} else {
					this.isFreeIPLMonth = false;
				}

				// Condition while unit status is child
				if (this.isUnitChild) {
					controls.ipl.get("monthIpl").setValue(0);
				} else {
					controls.ipl.get("monthIpl").setValue(dataIPL);
				}

				const dataAllIPL = Math.round(
					controls.ipl.get("unitSize").value *
					controls.ipl.get("ipl").value *
					dataIPL
				).toFixed(0);

				// const adminFeeAfterTax = this.adminValue + (this.adminValue * (this.ppnValue / 100))
				const totalTaxResult = (parseInt(dataAllIPL) * (this.ppnValue / 100))
				this.dataAllIPLParse = (parseInt(dataAllIPL) + (parseInt(dataAllIPL) * (this.ppnValue / 100)))

				this.allIplNatural = parseInt(dataAllIPL)

				// Change Value Total All START
				if (this.isUnitChild) {
					controls.ipl.get('totalIplNatural').setValue(0)
				} else {
					controls.ipl.get('totalIplNatural').setValue(this.formatRupiah(parseInt(dataAllIPL)))
				}
				// Change Value Total All END

				this.resultSendIplConsumption = {
					taxPercentage: this.ppnValue,
					totalTax: totalTaxResult,
					allIplAfterTax: this.dataAllIPLParse
				}

				// controls.ipl.get("totalTax").setValue(`${this.formatRupiah((parseInt(dataAllIPL) * (this.ppnValue / 100)))} - PPN ${this.ppnValue}%`);
				controls.ipl.get("totalTax").setValue(totalTaxResult)
				// controls.ipl.get("adminFeeAfterTax").setValue(`${this.formatRupiah(adminFeeAfterTax)}`);
				this.isUnitChild || this.isFreeIPLMonth
					? controls.ipl.get("allIpl").setValue(0)
					: controls.ipl.get("allIpl").setValue(this.formatRupiah(this.dataAllIPLParse));
			});
	}

	getDataElectricity(id) {
		const controls = this.billingForm.controls;
		const params = {
			filter: "bill"
		}
		this.powerservice.getPowerTransactionUnit(id).subscribe((res) => {
			if (res.data.length !== 0) {
				this.billmntE = res.data[0].billmnt;

				controls.billing
					.get("electricity")
				["controls"].electric_trans.setValue(res.data[0]._id),
					controls.power
						.get("powerMeter")
						.setValue(res.data[0].powname);

				this.powerservice
					.getPowerTransactionBill(res.data[0]._id, params)
					.subscribe((res) => {
						const controls = this.billingForm.controls;

						// RESULT VALUE POWER START
						this.resultSendPowerConsumption = res.data.powerBilling
						// RESULT VALUE POWER END

						const dataKwh = (
							res.data.endpos2 - res.data.strtpos2
						).toFixed(1);
						const kwh = parseFloat(dataKwh);

						let amount = 0;
						var validationRate = res.data.pow.rte.nmrtepow;
						if (validationRate === "3500 va") {
							if (kwh <= 140.0) {
								amount = 140 * res.data.pow.rte.rte;
							} else {
								amount = kwh * res.data.pow.rte.rte;
							}
						} else if (validationRate === "1300 va") {
							if (kwh <= 52.0) {
								amount = 52 * res.data.pow.rte.rte;
							} else {
								amount = kwh * res.data.pow.rte.rte;
							}
						} else if (validationRate === "2200 va") {
							if (kwh <= 88.0) {
								amount = 88 * res.data.pow.rte.rte;
							} else {
								amount = kwh * res.data.pow.rte.rte;
							}
						} else if (validationRate === "105.5 kva") {
							if (kwh <= 4220.0) {
								amount = 4220 * res.data.pow.rte.rte;
							} else {
								amount = kwh * res.data.pow.rte.rte;
							}
						}
						// TAX AND ADMIN Start
						// controls.power.get("totalTax").setValue(`Rp.${this.formatRupiah(res.data.powerBilling.totalTax)} - PPN ${res.data.powerBilling.taxPercentage}%`);
						controls.power.get("totalTax").setValue(res.data.powerBilling.totalTax)
						console.log(res.data.powerBilling.totalTax)
						controls.power.get("adminFeeAfterTax").setValue(this.formatRupiah(res.data.powerBilling.adminFeeAfterTax));
						// TAX AND ADMIN End

						this.useAmountRslt = amount;

						controls.power
							.get("powerRateName")
							.setValue(validationRate);
						controls.power
							.get("startPower")
							.setValue(res.data.strtpos2);
						controls.power
							.get("endPower")
							.setValue(res.data.endpos2);
						controls.power.get("usePower").setValue(kwh);
						controls.power.get("useAmount").setValue(amount);
						controls.power
							.get("powerRate")
							.setValue(res.data.pow.rte.rte);
						controls.power.get("loss").setValue(res.data.loss);
						controls.power
							.get("ppju")
							.setValue(res.data.pow.rte.ppju);
						controls.power
							.get("sc")
							.setValue(res.data.pow.rte.srvc);


						this.transaksiPower(res.data.powerBilling.allPowerAmountAfterFeeAndTax); // send total all power amount PPN + ADMIN

					});


			} else {
				controls.billing
					.get("electricity")
				["controls"].electric_trans.setValue(""),
					controls.power.get("powerMeter").setValue("");
				controls.power.get("startPower").setValue("");
				controls.power.get("endPower").setValue("");
				controls.power.get("usePower").setValue("");
				controls.power.get("useAmount").setValue("");
				controls.power.get("powerRate").setValue("");
				controls.power.get("powerRateName").setValue("");
				controls.power.get("loss").setValue("");
				controls.power.get("ppju").setValue("");
				controls.power.get("sc").setValue("");
				controls.power.get("scAmount").setValue("");
				controls.power.get("ppjuAmount").setValue("");
				controls.power.get("lossAmount").setValue("");
				controls.power.get("allPowerAmount").setValue("");
			}
		});
	}

	transaksiPower(allPowerAmount) {
		const controls = this.billingForm.controls;
		const pemakaianListrik = controls.power.get("usePower").value;
		const jumlahPemakaian = controls.power.get("useAmount").value;
		const scjunum = controls.power.get("sc").value;

		if (pemakaianListrik !== null) {
			const convertData = ((jumlahPemakaian / 100) * scjunum).toFixed(2);
			this.datasc = parseFloat(convertData);
			controls.power.get("scAmount").setValue(this.datasc);
			this.hasilsc = this.datasc + jumlahPemakaian;
		}

		const ppjunum = controls.power.get("ppju").value;
		if (this.hasilsc !== null) {
			const convertDataPPJU = (
				this.useAmountRslt *
				(ppjunum / 100)
			).toFixed(2);
			this.datappju = parseFloat(convertDataPPJU);

			controls.power.get("ppjuAmount").setValue(this.datappju);
			this.hasilppju = this.datappju + this.hasilsc;
		}

		const lossnum = controls.power.get("loss").value;
		if (lossnum !== null) {
			const convertDataLoss = ((this.hasilppju / 100) * lossnum).toFixed(
				2
			);
			this.dataloss = parseFloat(convertDataLoss);
			controls.power.get("lossAmount").setValue(this.dataloss);
			// let convertAllData = Math.round(
			// 	jumlahPemakaian + this.datasc + this.datappju + this.dataloss
			// ).toFixed(1);
			let convertAllData = allPowerAmount
			this.allpoweramount = convertAllData
			controls.power.get("allPowerAmount").setValue(this.formatRupiah(this.allpoweramount));
			this.getAlldata();
		}
	}

	getDataWater(id) {
		const controls = this.billingForm.controls;
		const params = {
			filter: "bill"
		}
		this.waterservice.getWaterTransactionUnit(id).subscribe((res) => {
			this.waterResult = res.data;

			var a = moment(new Date(res.data[0].billmnt)).format("MM");
			this.dateConsumptionConvert = moment(new Date(res.data[0].billmnt)).format("DD")

			this.dateConsumption = parseInt(a) + 1

			if (res.data.length !== 0) {
				this.billmntW = res.data[0].billmnt;
				controls.billing
					.get("water")
				["controls"].water_trans.setValue(res.data[0]._id),
					controls.water
						.get("waterMeter")
						.setValue(res.data[0].watname);
				this.waterservice
					.getWaterTransactionBill(res.data[0]._id, params)
					.subscribe((res) => {
						// const datam3 = (res.data.endpos2 - res.data.strtpos2).toFixed(3)
						// const m3 = parseFloat(datam3)

						// RESULT VALUE WATER START
						this.ppnValue = res.data.waterBilling.taxPercentage
						this.resultSendWaterConsumption = res.data.waterBilling
						// RESULT VALUE WATER END

						var endpost = res.data.endpos;
						var strtpost = res.data.strtpos;
						var m3 = endpost - strtpost;

						let dataadmin = 0;
						let datapeml = 0;
						let amountW = 0;

						// if (m3 <= 2.000) {
						// 	amountW = 25000
						// 	dataadmin = 0
						// 	datapeml = 0
						// } else {
						// 	amountW = Math.round(m3 * res.data.wat.rte.rte)
						// 	dataadmin = res.data.wat.rte.administrasi
						// 	datapeml = res.data.wat.rte.pemeliharaan
						// }

						amountW = m3 * res.data.wat.rte.rte;
						dataadmin = res.data.wat.rte.administrasi;
						datapeml = res.data.wat.rte.pemeliharaan;

						// TAX AND ADMIN Start
						// controls.water.get("totalTax").setValue(`Rp.${this.formatRupiah(res.data.waterBilling.totalTax)} - PPN ${res.data.waterBilling.taxPercentage}%`);
						controls.water.get("totalTax").setValue(res.data.waterBilling.totalTax)
						controls.water.get("adminFeeAfterTax").setValue(this.formatRupiah(res.data.waterBilling.adminFeeAfterTax));
						// TAX AND ADMIN End

						controls.water
							.get("waterRate")
							.setValue(res.data.wat.rte.rte);
						controls.water
							.get("startWater")
							.setValue(res.data.strtpos2);
						controls.water
							.get("endWater")
							.setValue(res.data.endpos2);
						controls.water.get("useWater").setValue(m3);
						controls.water.get("useWaterAmount").setValue(amountW);
						controls.water.get("maintenance").setValue(datapeml);
						controls.water
							.get("administration")
							.setValue(dataadmin);
						controls.water
							.get("dirtyWater")
							.setValue(res.data.air_kotor);
						this.transaksiWater(res.data.waterBilling.allWaterAmountAfterFeeAndTax); // add allwateramount + PPN + ADMIN
					});
			} else {
				controls.billing
					.get("water")
				["controls"].water_trans.setValue(""),
					controls.water.get("waterMeter").setValue("");
				controls.water.get("waterRate").setValue("");
				controls.water.get("startWater").setValue("");
				controls.water.get("endWater").setValue("");
				controls.water.get("useWater").setValue("");
				controls.water.get("useWaterAmount").setValue("");
				controls.water.get("maintenance").setValue("");
				controls.water.get("administration").setValue("");
				controls.water.get("dirtyWater").setValue("");
				controls.water.get("dirtyWaterAmount").setValue("");
				controls.water.get("allWaterAmount").setValue("");
			}
		});
	}

	transaksiWater(allWaterAmount) {
		const controls = this.billingForm.controls;
		const wateramount = controls.water.get("useWaterAmount").value;
		// const maintenanceamount = controls.water.get("maintenance").value;
		// const administrationamount = controls.water.get("administration").value;
		const dw = controls.water.get("dirtyWater").value;

		if (this.isToken) {
			const dwres =
				((wateramount + this.admBankPrice + this.abodemenPrice) / 100) *
				dw;
			controls.water.get("dirtyWaterAmount").setValue(dwres);
			this.allwateramount =
				// wateramount + this.admBankPrice + this.abodemenPrice + dwres;
				allWaterAmount
			controls.water.get("allWaterAmount").setValue(this.formatRupiah(this.allwateramount));
			this.getAlldata();
			return;
		}
		if (dw !== 0 || dw === 0) {
			const dwres =
				((wateramount + this.abodemenPrice + this.admBankPrice) / 100) *
				dw;
			controls.water.get("dirtyWaterAmount").setValue(dwres);
			this.allwateramount =
				// wateramount + this.abodemenPrice + this.admBankPrice + dwres;
				allWaterAmount
			controls.water.get("allWaterAmount").setValue(this.formatRupiah(this.allwateramount));
			this.getAlldata();
		}
	}

	changeFreeAbodement() {
		const controls = this.billingForm.controls;
		if (this.isfreeAbodement == true) {
			controls.isFreeAbodement.setValue(true);
			this.getAlldata();
		} else {
			controls.isFreeAbodement.setValue(false);
			this.getAlldata();
		}
	}

	changeFreeIPL() {
		const controls = this.billingForm.controls;
		if (this.isfreeIpl == true) {
			controls.isFreeIpl.setValue(true);
			this.getAlldata();
		} else {
			controls.isFreeIpl.setValue(false);
			this.getAlldata();
		}
	}

	valueTotalBilling = 0;
	formatRupiah(value) {
		const numbToken = value.toFixed(0);
		const format = numbToken
			.toString()
			.split("")
			.reverse()
			.join("");
		const convertToken = format.match(/\d{1,3}/g);
		const result = convertToken
			.join(".")
			.split("")
			.reverse()
			.join("");

		return result
	}
	getAlldata() {
		const controls = this.billingForm.controls;
		// controls.totalBilling.setValue("");
		const dataFreeAbodement = controls.isFreeAbodement.value;
		const dataFreeIPL = controls.isFreeIpl.value;
		const dataPower = controls.power.get("allPowerAmount").value;
		const dataWater = controls.water.get("allWaterAmount").value;
		// const totalGalon = this.totalResultGalon
		let dataIPL = controls.ipl.get("allIpl").value;

		// Condition if unit status is child
		if (this.isUnitChild) {
			dataIPL = 0;
			controls.ipl.get("monthIpl").setValue(0);
		}

		if (dataIPL !== null || dataPower !== 0 || dataWater !== 0) {
			if (dataFreeAbodement === true && dataFreeIPL === false) {
				const dataPower2 = dataPower * 0;
				const dataWater2 = dataWater * 0;
				const dataIPL = this.dataAllIPLParse;
				// let totalBilling = dataPower2 + dataWater2 + dataIPL;
				let totalBilling = dataPower2 + dataWater2 + dataIPL + this.admBankPrice // + totalGalon //admin bank milik IPL

				if (this.isFreeIPLMonth) {
					totalBilling = totalBilling - this.admBankPrice;
				}
				if (this.isToken) {
					let totalBillingToken = dataWater2 + dataIPL + this.admBankPrice // + totalGalon // admin bank milik IPL;

					if (this.isFreeIPLMonth) {
						totalBillingToken =
							totalBillingToken - this.admBankPrice;
					}
					// 1 change
					const rupiahtotalBillingToken = this.formatRupiah(totalBillingToken)

					this.isUnitChild || this.isFreeIPLMonth
						? controls.ipl.get("allIpl").setValue(0)
						: controls.ipl.get("allIpl").setValue(this.formatRupiah(dataIPL));
					// controls.power.get('allPowerAmount').setValue(dataPower2);
					controls.water.get("allWaterAmount").setValue(this.formatRupiah(dataWater2));
					this.valueTotalBilling = totalBillingToken;
					controls.totalBilling.setValue(rupiahtotalBillingToken);
					return false;
				}
				this.isUnitChild || this.isFreeIPLMonth
					? controls.ipl.get("allIpl").setValue(0)
					: controls.ipl.get("allIpl").setValue(this.formatRupiah(dataIPL));
				controls.power.get("allPowerAmount").setValue(this.formatRupiah(dataPower2));
				controls.water.get("allWaterAmount").setValue(this.formatRupiah(dataWater2));

				// 2 change
				const rupiahtotalBilling = this.formatRupiah(totalBilling)

				this.valueTotalBilling = totalBilling;
				controls.totalBilling.setValue(rupiahtotalBilling);
			} else if (dataFreeAbodement === false && dataFreeIPL === true) {
				let dataIPL2 = "";
				if (controls.ipl.get("monthIpl").value !== 0) {
					dataIPL2 = Math.round(
						controls.ipl.get("unitSize").value *
						controls.ipl.get("ipl").value *
						(controls.ipl.get("monthIpl").value - 1)
					).toFixed(0);
				} else {
					dataIPL2 = Math.round(
						controls.ipl.get("unitSize").value *
						controls.ipl.get("ipl").value *
						(controls.ipl.get("monthIpl").value * 0)
					).toFixed(0);
				}

				// Condition while unit is child
				let dataIPL2Parse = 0;
				if (this.isUnitChild) {
					dataIPL2Parse = 0;
					controls.ipl.get("unitSize").setValue(0);
				} else {
					dataIPL2Parse = parseInt(dataIPL2);
				}

				const dataPower = this.allpoweramount;
				const dataWater = this.allwateramount;
				let totalBilling = dataPower + dataWater + dataIPL2Parse + this.admBankPrice // + totalGalon//admin bank milik IPL;
				if (this.isFreeIPLMonth) {
					totalBilling = totalBilling - this.admBankPrice;
				}
				if (this.isToken) {
					const dataIPL2ParseToken =
						// parseInt(dataIPL2) + this.admBankPrice;
						parseInt(dataIPL2)
					const dataWaterToken = this.allwateramount;
					let totalBillingToken = dataWaterToken + dataIPL2ParseToken + this.admBankPrice // + totalGalon //admin bank milik IPL;

					if (this.isFreeIPLMonth) {
						totalBillingToken =
							totalBillingToken - this.admBankPrice;
					}

					// 3 change
					const rupiahtotalBillingToken = this.formatRupiah(totalBillingToken)

					this.isUnitChild || this.isFreeIPLMonth
						? controls.ipl.get("allIpl").setValue(0)
						: controls.ipl
							.get("allIpl")
							.setValue(dataIPL2ParseToken);
					// controls.power.get('allPowerAmount').setValue(this.allpoweramount);
					controls.water
						.get("allWaterAmount")
						.setValue(this.allwateramount);

					this.valueTotalBilling = totalBillingToken;
					controls.totalBilling.setValue(rupiahtotalBillingToken);
					return false;
				}
				this.isUnitChild || this.isFreeIPLMonth
					? controls.ipl.get("allIpl").setValue(0)
					: controls.ipl.get("allIpl").setValue(this.formatRupiah(dataIPL2Parse));
				controls.power
					.get("allPowerAmount")
					.setValue(this.formatRupiah(this.allpoweramount));
				controls.water
					.get("allWaterAmount")
					.setValue(this.formatRupiah(this.allwateramount));

				// 4 change
				const rupiahtotalBilling = this.formatRupiah(totalBilling)

				this.valueTotalBilling = totalBilling;
				controls.totalBilling.setValue(rupiahtotalBilling);
			} else if (dataFreeAbodement === true && dataFreeIPL === true) {
				const dataPower3 = dataPower * 0;
				const dataWater3 = dataWater * 0;
				let dataIPL3 = "";
				if (controls.ipl.get("monthIpl").value !== 0) {
					dataIPL3 = Math.round(
						controls.ipl.get("unitSize").value *
						controls.ipl.get("ipl").value *
						(controls.ipl.get("monthIpl").value - 1)
					).toFixed(0);
				} else {
					dataIPL3 = Math.round(
						controls.ipl.get("unitSize").value *
						controls.ipl.get("ipl").value *
						(controls.ipl.get("monthIpl").value * 0)
					).toFixed(0);
				}

				// Condition while unit is child
				let dataIPL3Parse = 0;
				if (this.isUnitChild) {
					dataIPL3Parse = 0;
					controls.ipl.get("unitSize").setValue(0);
				} else {
					dataIPL3Parse = parseInt(dataIPL3);
				}

				if (this.isToken) {
					const dataIPL3ParseToken =
						// parseInt(dataIPL3) + this.admBankPrice;
						parseInt(dataIPL3)
					let totalBillingToken = dataWater3 + dataIPL3ParseToken + this.admBankPrice // + totalGalon //admin bank milik IPL;

					if (this.isFreeIPLMonth) {
						totalBillingToken =
							totalBillingToken - this.admBankPrice;
					}

					// 5 change
					const rupiahtotalBillingToken = this.formatRupiah(totalBillingToken)

					this.valueTotalBilling = totalBillingToken;
					controls.totalBilling.setValue(rupiahtotalBillingToken);
					// controls.power.get('allPowerAmount').setValue(dataPower3);
					controls.water.get("allWaterAmount").setValue(this.formatRupiah(dataWater3));
					this.isUnitChild || this.isFreeIPLMonth
						? controls.ipl.get("allIpl").setValue(0)
						: controls.ipl
							.get("allIpl")
							.setValue(dataIPL3ParseToken);
					return false;
				}

				let totalBilling = dataWater3 + dataPower3 + dataIPL3Parse + this.admBankPrice // + totalGalon//admin bank milik IPL;

				if (this.isFreeIPLMonth) {
					totalBilling = totalBilling - this.admBankPrice;
				}
				controls.power.get("allPowerAmount").setValue(this.formatRupiah(dataPower3));
				controls.water.get("allWaterAmount").setValue(this.formatRupiah(dataWater3));
				this.isUnitChild || this.isFreeIPLMonth
					? controls.ipl.get("allIpl").setValue(0)
					: controls.ipl.get("allIpl").setValue(this.formatRupiah(dataIPL3Parse));

				// 6 change
				const rupiahtotalBilling = this.formatRupiah(totalBilling)

				this.valueTotalBilling = totalBilling;
				controls.totalBilling.setValue(rupiahtotalBilling);
			} else {
				const dataPower = this.allpoweramount;
				const dataWater = this.allwateramount;
				const dataIPL = this.dataAllIPLParse;
				if (this.isToken) {
					let totalBillingToken = dataWater + dataIPL + this.admBankPrice // + totalGalon //admin bank milik IPL;

					if (this.isFreeIPLMonth) {
						totalBillingToken =
							totalBillingToken - this.admBankPrice;
					}

					// 7 change
					const rupiahtotalBillingToken = this.formatRupiah(totalBillingToken)

					this.valueTotalBilling = totalBillingToken;
					controls.totalBilling.setValue(rupiahtotalBillingToken);
					this.isUnitChild || this.isFreeIPLMonth
						? controls.ipl.get("allIpl").setValue(0)
						: controls.ipl.get("allIpl").setValue(this.formatRupiah(dataIPL));
					// controls.power.get('allPowerAmount').setValue(this.allpoweramount);
					controls.water
						.get("allWaterAmount")
						.setValue(this.allwateramount);
					return false;
				}
				this.isUnitChild || this.isFreeIPLMonth
					? controls.ipl.get("allIpl").setValue(0)
					: controls.ipl.get("allIpl").setValue(this.formatRupiah(dataIPL));
				controls.power
					.get("allPowerAmount")
					.setValue(this.formatRupiah(this.allpoweramount));
				controls.water
					.get("allWaterAmount")
					.setValue(this.formatRupiah(this.allwateramount));
				let totalBilling = dataPower + dataWater + dataIPL + this.admBankPrice // + totalGalon //admin bank milik IPL;

				if (this.isFreeIPLMonth) {
					totalBilling = totalBilling - this.admBankPrice;
				}

				// 8 change 
				const rupiahtotalBilling = this.formatRupiah(totalBilling)

				this.valueTotalBilling = totalBilling;
				controls.totalBilling.setValue(rupiahtotalBilling);
			}
		} else {
			console.log("Tes");
		}
	}

	prepareBilling(): BillingModel {
		const controls = this.billingForm.controls;
		const _billing = new BillingModel();

		_billing.clear();
		_billing._id = this.billing._id;
		_billing.contract = controls.contract.value;
		_billing.billed_to = controls.billed_to.value.toLowerCase();
		_billing.unit = controls.unit.value;
		_billing.unit2 = controls.unit2.value.toLowerCase();
		if (this.isToken) {
			_billing.billing = {
				electricity: {
					electric_trans: null,
				},
				water: {
					water_trans:
						controls.billing.get("water")["controls"].water_trans
							.value,
				},
				ipl: {
					unit_trans:
						controls.billing.get("ipl")["controls"].unit_trans
							.value,
				},
				/* in the comments because there is a change in flow or gallons have not been calculated */
				// galon: { / 
				// 	galon_trans:
				// 		controls.billing.get("galon")["controls"].galon_trans
				// 			.value,
				// },
			};
		} else {
			_billing.billing = {
				electricity: {
					electric_trans:
						controls.billing.get("electricity")["controls"]
							.electric_trans.value,
				},
				water: {
					water_trans:
						controls.billing.get("water")["controls"].water_trans
							.value,
				},
				ipl: {
					unit_trans:
						controls.billing.get("ipl")["controls"].unit_trans
							.value,
				},
				/* in the comments because there is a change in flow or gallons have not been calculated */
				// galon: {
				// 	galon_trans:
				// 		controls.billing.get("galon")["controls"].galon_trans
				// 			.value,
				// },
			};
		}
		// Power
		/** the final result of the calculation in the IPL, is entered into a variable to be sent */
		const powerSend = {
			powerMeter: "",
			powerRateName: "",
			powerRate: "",
			startPower: "",
			endPower: "",
			usePower: "",
			useAmount: "",
			sc: "",
			scAmount: "",
			ppju: "",
			ppjuAmount: "",
			loss: "",
			lossAmount: "",
			allPowerAmount: "",
			adminFee: "",
			adminFeeAfterTax: "",
			taxPercentage: "",
			totalTax: "",
			allPowerAmountAfterFeeAndTax: ""
		}
		_billing.power = this.isToken !== true ? this.resultSendPowerConsumption : powerSend

		// Water
		/** the final result of the calculation in the Water, is entered into a variable to be sent */
		_billing.water = this.resultSendWaterConsumption

		/* in the comments because there is a change in flow or gallons have not been calculated */
		// _billing.galon = {
		// 	...this.valueTrGalon
		// }

		_billing.ipl = {
			unitSize: controls.ipl.get("unitSize").value,
			serviceCharge: this.isUnitChild || this.isFreeIPLMonth ? 0 : controls.ipl.get("serviceCharge").value,
			sinkingFund: this.isUnitChild || this.isFreeIPLMonth ? 0 : controls.ipl.get("sinkingFund").value,
			monthIpl: controls.ipl.get("monthIpl").value,
			ipl: this.isUnitChild || this.isFreeIPLMonth ? 0 : controls.ipl.get("ipl").value,
			admBank: this.isUnitChild || this.isFreeIPLMonth ? 0 : this.admBankPrice,
			allIpl: this.isUnitChild || this.isFreeIPLMonth ? 0 : parseInt(this.amountIplJournal),
			// iplBulanan: parseInt(this.amountIplJournal), */ dikomen karena sudah tidak dipakai, tidak dihapus karena kemungkinan dipakai lagi.
			taxPercentage: this.isUnitChild || this.isFreeIPLMonth ? 0 : this.resultSendIplConsumption.taxPercentage,
			totalTax: this.isUnitChild || this.isFreeIPLMonth ? 0 : this.resultSendIplConsumption.totalTax,
			allIplAfterTax: this.isUnitChild || this.isFreeIPLMonth ? 0 : this.resultSendIplConsumption.allIplAfterTax,
		};

		_billing.isFreeIpl = controls.isFreeIpl.value;
		_billing.isFreeAbodement = controls.isFreeAbodement.value;

		// _billing.totalBilling = this.valueTotalBilling; /* Dikomen Karena ada perubahan pada perhitungan billing */

		_billing.totalBilling = this.serviceFormat.formatFloat(controls.totalBilling.value) /* Perubahan perhitungan billing sudah ditambah beberapa utility yang sudah ditambahkan PPN ada difunction calculateBillAfterTax() */
		_billing.totalBillLeft = controls.totalBillLeft.value /* Total bill left dikirim request BackEnd untuk sisa tagihan */
		_billing.subTotalBilling = this.serviceFormat.formatFloat(controls.subTotalBilling.value) /* Sub Total bill, Nilai murni total billing tanpa FEE/PPN */

		_billing.billing_number = controls.billing_number.value;
		_billing.created_date = controls.created_date.value;   //modif rehan krn list biling date pakai create date
		// _billing.created_date = controls.billing_date.value; /* dikomen karena ada request untuk penyesuaian pengiriman data
		_billing.billing_date = controls.billing_date.value;
		_billing.due_date = controls.due_date.value;


		return _billing;
	}

	onSubmit = async (withBack: boolean = false) => {
		try {
			const controls = this.billingForm.controls;
			const billDate = controls.billing_date.value
			const billDateConvert = billDate.getDate()
			const dateConsm = parseInt(this.dateConsumptionConvert)

			const billing_number = controls.billing_number.value
			if (billing_number == undefined || billing_number == "" || billing_number == "-") {
				this.hasError = true;
				this.message = "Billing Number harus diisi. Pilih Billing Date !";
				this.selectedTab = 0;
				return false;
			}
			this.hasFormErrors = false;
			const editedBilling = this.prepareBilling();
			/** check form */
			var dtE = new Date(this.billmntE);
			var dtW = new Date(this.billmntW);
			var bd = new Date(editedBilling.billing_date);

			// Fixing Start
			let fixDTE = dtE.getMonth() + 2;
			let fixDTW = dtW.getMonth() + 2;

			if (fixDTE === 13) {
				fixDTE = 1;
			}
			if (fixDTW === 13) {
				fixDTW = 1;
			}

			let getMonthDate = bd.getMonth() + 1
			const isSewa = this.isSewa
			const isSewaCheckOut = (this.dateConsumption - 1)

			if (this.billingForm.invalid) {
				Object.keys(controls).forEach((controlName) =>
					controls[controlName].markAsTouched()
				);

				this.hasFormErrors = true;
				this.selectedTab = 0;
				return;
			}
			if (!this.isToken) {
				if (isSewa) {
					if (!this.validateContract) {

						if (dateConsm > billDateConvert || getMonthDate !== isSewaCheckOut) {
							this.hasError = true;
							this.message =
								"Proses Billing Date Penyewa harus sesuai tanggal consumption";
							this.selectedTab = 0;
							return false;
						}
					}
					else {
						if (
							editedBilling.power.allPowerAmount === undefined ||
							editedBilling.water.allWaterAmount === undefined
						) {
							this.hasError = true;
							this.message =
								editedBilling.power.allPowerAmount === undefined
									? " Ouch ! Your Power Meter Not Found "
									: " Ouch ! Your Water Meter Not Found ";
							this.selectedTab = 0;
							return false;
						} else if (fixDTE != bd.getMonth() + 1) {
							this.hasError = true;
							this.message =
								"Proses Billing Date harus (Month + 1) dari Consumtion Electricity Unit.";
							this.selectedTab = 0;
							return false;
						} else if (fixDTW != bd.getMonth() + 1) {
							this.hasError = true;
							this.message =
								"Proses Billing Date harus (Month + 1) dari Consumtion Water Unit.";
							this.selectedTab = 0;
							return false;
						}
					}

				} else {
					if (
						editedBilling.power.allPowerAmount === undefined ||
						editedBilling.water.allWaterAmount === undefined
					) {
						this.hasError = true;
						this.message =
							editedBilling.power.allPowerAmount === undefined
								? " Ouch ! Your Power Meter Not Found "
								: " Ouch ! Your Water Meter Not Found ";
						this.selectedTab = 0;
						return false;
					} else if (fixDTE != bd.getMonth() + 1) {
						this.hasError = true;
						this.message =
							"Proses Billing Date harus (Month + 1) dari Consumtion Electricity Unit.";
						this.selectedTab = 0;
						return false;
					} else if (fixDTW != bd.getMonth() + 1) {
						this.hasError = true;
						this.message =
							"Proses Billing Date harus (Month + 1) dari Consumtion Water Unit.";
						this.selectedTab = 0;
						return false;
					}
				}
			} else {
				if (isSewa) {
					if (!this.validateContract) {

						if (dateConsm > billDateConvert || getMonthDate !== isSewaCheckOut) {
							this.hasError = true;
							this.message =
								"Proses Billing Date Penyewa harus sesuai tanggal consumption";
							this.selectedTab = 0;
							return false;
						}
					}
					else {
						if (
							editedBilling.power.allPowerAmount === undefined ||
							editedBilling.water.allWaterAmount === undefined
						) {
							this.hasError = true;
							this.message =
								editedBilling.power.allPowerAmount === undefined
									? " Ouch ! Your Power Meter Not Found "
									: " Ouch ! Your Water Meter Not Found ";
							this.selectedTab = 0;
							return false;
						} else if (fixDTE != bd.getMonth() + 1) {
							this.hasError = true;
							this.message =
								"Proses Billing Date harus (Month + 1) dari Consumtion Electricity Unit.";
							this.selectedTab = 0;
							return false;
						} else if (fixDTW != bd.getMonth() + 1) {
							this.hasError = true;
							this.message =
								"Proses Billing Date harus (Month + 1) dari Consumtion Water Unit.";
							this.selectedTab = 0;
							return false;
						}
					}

				} else {
					if (editedBilling.water.allWaterAmount === undefined) {
						this.hasError = true;
						this.message =
							editedBilling.power.allWaterAmount === undefined
								? " Ouch ! Your Power Water Not Found "
								: "";
						this.selectedTab = 0;
						return false;
					} else if (fixDTW != bd.getMonth() + 1) {
						this.hasError = true;
						this.message =
							"Proses Billing Date harus (Month + 1) dari Consumtion Water Unit.";
						this.selectedTab = 0;
						return false;
					}
				}
			}
			this.addBilling(editedBilling, withBack);
		} catch (error) {
			console.log(error);
			this.layoutUtilsService.showActionNotification(
				error,
				MessageType.Create,
				5000,
				true,
				true
			);
		}
	};


	addBilling(_billing: BillingModel, withBack: boolean = false) {
		const addSubscription = this.serviceBill
			.createBilling(_billing)
			.subscribe(
				(res) => {
					const message = `New billing successfully has been added.`;
					if (res) {
						this.checkProgressGenerate('success') // Progress "success" generate PopUp

						this.layoutUtilsService.showActionNotification(
							message,
							MessageType.Create,
							5000,
							true,
							true
						);
						const url = `/billing`;
						this.router.navigateByUrl(url, {
							relativeTo: this.activatedRoute,
						});
					}
				},
				(err) => {
					console.error(err);
					this.checkProgressGenerate('failed') // Progress "success" generate PopUp

					const message =
						"Error while adding billing | " + err.statusText;
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

	ngOnDestroy() {
		this.subscriptions.forEach((sb) => sb.unsubscribe());
	}

	addEvent(type: string, event: MatDatepickerInputEvent<Date>) {
		const controls = this.billingForm.controls;
		const checkOutContract = this.checkOutContract
		const generateBill = new Date(`${event.value}`);
		if (generateBill > checkOutContract) { /** Ini Kondisi untuk mengetahui renter contract check-out*/
			this.validateContract = true
			this.getDataOwner(this.idUnitContract)
		}
		else {
			this.validateContract = false
			this.getDataRenter(this.idUnitContract)
		}

		// controls.due_date.setValue(
		// 	moment(event.value, "MM/DD/YYYY").add(15, "day").toDate()
		// );
		if (type === 'change') this.getBillingNumber(event.value)
	}

	/**
	 * Function to add up, total Overall.
	 * Menghitung, cth: (total keseluruhan dari IPL, total keseluruhan dari WATER, total keseluruhan dari Power, dan lainnya jika ada penambahan.)
	 * Note : Total Keseluruhan itu beserta TAX/PPN-nya.
	 */
	calculateBillAfterTax() {
		const controls = this.billingForm.controls
		const amountAllPower: number = this.resultSendPowerConsumption.allPowerAmountAfterFeeAndTax ? /* Total Dari keseluruhan perhitungan Power/Electricity + setelah TAX */
			this.resultSendPowerConsumption.allPowerAmountAfterFeeAndTax : this.resultSendPowerConsumption.allPowerAmount ? this.resultSendPowerConsumption.allPowerAmount : 0
		const amountAllWater: number = this.resultSendWaterConsumption.allWaterAmountAfterFeeAndTax ? /* Total Dari keseluruhan perhitungan Water + setelah TAX */
			this.resultSendWaterConsumption.allWaterAmountAfterFeeAndTax : this.resultSendWaterConsumption.allWaterAmount
		const amountAllIPL: number = this.resultSendIplConsumption.allIplAfterTax ? /* Total Dari keseluruhan perhitungan IPL + setelah TAX */
			this.resultSendIplConsumption.allIplAfterTax : this.resultSendIplConsumption.allIpl

		const pureBilling = /* Nilai murni dari billing (Power + Water + Ipl, dll sesuai adjsument...) */
			(this.resultSendPowerConsumption.allPowerAmount ? this.resultSendPowerConsumption.allPowerAmount : 0) +
			this.resultSendWaterConsumption.allWaterAmount + this.serviceFormat.formatFloat(controls.ipl.get('totalIplNatural').value)

		const result = (amountAllIPL + amountAllWater + amountAllPower) /* Penjumlahan hasil perhitungan utility */
		controls.totalBilling.setValue(this.serviceFormat.rupiahFormatImprovement(result)) /* Hasil perhitungan yang ada pada variable result, dimasukkan kedalam totalBilling */
		controls.totalBillLeft.setValue(result) /* Hasil perhitungan yang ada pada variable result, dimasukkan kedalam totalBillLeft */
		controls.subTotalBilling.setValue(this.serviceFormat.rupiahFormatImprovement(pureBilling)) /* Nilai murni dari totalBilling tanpa FEE ataupun PPN */
	}


	getComponentTitle() {
		let result = "Create IPL Billing";
		return result;
	}

	onAlertClose($event) {
		this.hasFormErrors = false;
		this.hasError = false;
	}

	goBackWithId() {
		const url = `/billing`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}

	refreshBilling(isNew: boolean = false, id: string = "") {
		let url = this.router.url;
		if (!isNew) {
			this.router.navigate([url], { relativeTo: this.activatedRoute });
			return;
		}

		url = `/billing/edit/${id}`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}


	/** Process Generate
 * This is a popup for the progress of generating billing
 * @param content 
 */
	processGenerate(content) {
		this.dialog.open(content, {
			data: {
				input: ""
			},
			maxWidth: "565px",
			minHeight: "375px",
			disableClose: true
		});
	}

	/**
* Function to close the process generate dialog popup
*/
	closePopUp() {
		this.dialog.closeAll()
		this.isGenerateBilling = "" // Reset > isGenerateBilling
		this.msgErrorGenerate = "" // Reset > msgErrorGenerate
	}

	/**
 * Function to run progress on generating billing
 * @param status status, to determine the feedback response from the back-end
 */
	checkProgressGenerate(status: string) {
		this.isGenerateBilling = status
	}
}

