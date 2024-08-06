import { ChangeDetectorRef, Component, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import {
	FormBuilder,
	FormControl,
	FormGroup,
	Validators,
} from "@angular/forms";
import { Observable, Subscription } from "rxjs";
import { Store, select } from "@ngrx/store";
import { AppState } from "../../../../../../core/reducers";
import {
	SubheaderService,
	LayoutConfigService,
} from "../../../../../../core/_base/layout";
import {
	LayoutUtilsService,
	MessageType,
} from "../../../../../../core/_base/crud";
import { BillComModel } from "../../../../../../core/commersil/master/billCom/billCom.model";
import { selectBillComActionLoading } from "../../../../../../core/commersil/master/billCom/billCom.selector";
import { BillComService } from "../../../../../../core/commersil/master/billCom/billCom.service";
import { SelectionModel } from "@angular/cdk/collections";
import { QueryComUnitModel } from "../../../../../../core/commersil/master/comUnit/querycomUnit.model";
import { ComUnitService } from "../../../../../../core/commersil/master/comUnit/comUnit.service";
import { ComTPowerService } from "../../../../../../core/commersil/master/comTPower/comTPower.service";
import * as _moment from "moment";
const moment = _rollupMoment || _moment;
import { default as _rollupMoment, Moment } from "moment";
import { ComTWaterService } from "../../../../../../core/commersil/master/comTWater/comTWater.service";

@Component({
	selector: "kt-add-billCom",
	templateUrl: "./add-billCom.component.html",
	styleUrls: ["./add-billCom.component.scss"],
})
export class AddBillComComponent implements OnInit, OnDestroy {
	codenum;
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

	monthWater: number;
	allwateramount: number;
	dataAllIPLParse: number;

	datauser = localStorage.getItem("user");
	billCom: BillComModel;
	BillComId$: Observable<string>;
	selection = new SelectionModel<BillComModel>(true, []);
	oldBillCom: BillComModel;
	selectedTab = 0;
	loading$: Observable<boolean>;
	billComForm: FormGroup;
	hasFormErrors = false;
	loading: boolean = false;
	date1 = new FormControl(new Date());
	billing_number: any;

	unitResult: any[] = [];
	unitResultFiltered = [];
	viewUnitResult = new FormControl();

	useAmountRslt = 0;
	admBankPrice = 3000;
	abodemenPrice = 25000;

	private subscriptions: Subscription[] = [];
	constructor(
		private activatedRoute: ActivatedRoute,
		private router: Router,
		private billComFB: FormBuilder,
		private subheaderService: SubheaderService,
		private layoutUtilsService: LayoutUtilsService,
		private store: Store<AppState>,
		private service: BillComService,
		private serviceUnit: ComUnitService,
		private serviceTPower: ComTPowerService,
		private serviceTWater: ComTWaterService,
		private cd: ChangeDetectorRef,
		private layoutConfigService: LayoutConfigService
	) {}

	ngOnInit() {
		this.loading$ = this.store.pipe(select(selectBillComActionLoading));
		const routeSubscription = this.activatedRoute.params.subscribe(
			(params) => {
				this.billCom = new BillComModel();
				this.billCom.clear();
				this.initBillCom();
			}
		);
		this.subscriptions.push(routeSubscription);
	}

	initBillCom() {
		this.createForm();
		this.loadUnitList();
		this.getBillingNumber();
	}

	createForm() {
		this.billComForm = this.billComFB.group({
			billing_number: [{ value: "", disabled: true }],
			billed_to: [{ value: "", disabled: true }],
			unit: [undefined],
			unit2: [""],
			billing_date: [this.date1.value],
			due_date: [""],
			totalBilling: [{ value: "", disabled: true }],
			created_date: [{ value: this.date1.value, disabled: true }],
			created_by: [{ value: this.datauser, disabled: true }],
			unitType: [""],

			power: this.billComFB.group({
				powerId: [{ value: "", disabled: true }],
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
			}),
			water: this.billComFB.group({
				waterId: [{ value: "", disabled: true }],
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
			}),
			ipl: this.billComFB.group({
				unitSize: [{ value: "", disabled: true }],
				serviceCharge: [{ value: "", disabled: true }],
				sinkingFund: [{ value: "", disabled: true }],
				monthIpl: [{ value: "", disabled: true }],
				ipl: [{ value: "", disabled: true }],
				allIpl: [{ value: "", disabled: true }],
			}),
		});
	}

	/**
	 * @param value
	 */
	_setUnitValue(value) {
		this.billComForm.patchValue({ unit: value._id });
		this.getUnit(value._id);
	}

	_onKeyup(e: any) {
		this.billComForm.patchValue({ unit: undefined });
		this._filterList(e.target.value);
	}

	_filterList(text: string) {
		this.unitResultFiltered = this.unitResult.filter((i) => {
			const filterText = `${i.cdunt.toLocaleLowerCase()} - ${i.customer.namaToko.toLocaleLowerCase()} `;
			if (filterText.includes(text.toLocaleLowerCase())) return i;
		});
	}

	loadUnitList() {
		this.selection.clear();
		const queryParams = new QueryComUnitModel(null, 1, 100000);
		this.serviceUnit.getListComUnit(queryParams).subscribe((res) => {
			this.unitResult = res.data;
			this.unitResultFiltered = this.unitResult.slice();
			this.cd.markForCheck();
			this.viewUnitResult.enable();
		});
	}

	getBillingNumber() {
		const controls = this.billComForm.controls;
		this.service.generateCodeBillCom().subscribe((res) => {
			console.log(res, "number");
			this.billing_number = res.data;
			controls.billing_number.setValue(this.billing_number);
		});
		controls.due_date.setValue(
			moment(this.date1.value, "MM/DD/YYYY").add(15, "day").toDate()
		);
	}

	getUnit(id) {
		const controls = this.billComForm.controls;
		this.serviceUnit.findComUnitById(id).subscribe((data) => {
			const dataIPL = 1;
			console.log(data.data);

			controls.unit.setValue(data.data._id);
			controls.unit2.setValue(data.data.cdunt);
			controls.billed_to.setValue(data.data.customer.namaToko);
			controls.unitType.setValue(data.data.type);
			controls.ipl.get("unitSize").setValue(data.data.untsqr);
			controls.ipl
				.get("serviceCharge")
				.setValue(data.data.unitType.service_rate);
			controls.ipl
				.get("sinkingFund")
				.setValue(data.data.unitType.sinking_fund);

			controls.ipl
				.get("ipl")
				.setValue(
					data.data.unitType.service_rate +
						data.data.unitType.sinking_fund
				);
			controls.ipl.get("monthIpl").setValue(dataIPL);
			const dataAllIPL = Math.round(
				controls.ipl.get("unitSize").value *
					controls.ipl.get("ipl").value *
					dataIPL
			).toFixed(0);
			this.dataAllIPLParse = parseInt(dataAllIPL);
			controls.ipl.get("allIpl").setValue(this.dataAllIPLParse);

			this.getPowerTransaction(id);
			this.getDataWater(id);
		});
	}

	getPowerTransaction(id) {
		const controls = this.billComForm.controls;
		this.serviceTPower.findComTPowerByUnitId(id).subscribe((res) => {
			const lastData = res.data.length - 1;
			controls.power.get("powerId").setValue(res.data[lastData]._id),
				controls.power
					.get("powerMeter")
					.setValue(res.data[lastData].powname);

			const dataKwh = (
				res.data[lastData].endpos2 - res.data[lastData].strtpos2
			).toFixed(1);
			const kwh = parseFloat(dataKwh);

			let amount = 0;
			var validationRate = res.data[lastData].pow.rte.nmrtepow;
			if (validationRate === "3500 va") {
				if (kwh <= 140.0) {
					amount = 140 * res.data[lastData].pow.rte.rte;
				} else {
					amount = kwh * res.data[lastData].pow.rte.rte;
				}
			} else if (validationRate === "1300 va") {
				if (kwh <= 52.0) {
					amount = 52 * res.data[lastData].pow.rte.rte;
				} else {
					amount = kwh * res.data[lastData].pow.rte.rte;
				}
			} else if (validationRate === "2200 va") {
				if (kwh <= 88.0) {
					amount = 88 * res.data[lastData].pow.rte.rte;
				} else {
					amount = kwh * res.data[lastData].pow.rte.rte;
				}
			} else if (validationRate === "105.5 kva") {
				if (kwh <= 4220.0) {
					amount = 4220 * res.data[lastData].pow.rte.rte;
				} else {
					amount = kwh * res.data[lastData].pow.rte.rte;
				}
			}

			this.useAmountRslt = amount;

			controls.power.get("powerRateName").setValue(validationRate);
			controls.power
				.get("startPower")
				.setValue(res.data[lastData].strtpos2);
			controls.power.get("endPower").setValue(res.data[lastData].endpos2);
			controls.power.get("usePower").setValue(kwh);
			controls.power.get("useAmount").setValue(amount);
			controls.power
				.get("powerRate")
				.setValue(res.data[lastData].pow.rte.rte);
			controls.power.get("loss").setValue(res.data[lastData].loss);
			controls.power
				.get("ppju")
				.setValue(res.data[lastData].pow.rte.ppju);
			controls.power.get("sc").setValue(res.data[lastData].pow.rte.srvc);
			this.transaksiPower();
		});
	}

	transaksiPower() {
		const controls = this.billComForm.controls;
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
			let convertAllData = Math.round(
				jumlahPemakaian + this.datasc + this.datappju + this.dataloss
			).toFixed(1);
			this.allpoweramount = parseFloat(convertAllData);
			controls.power.get("allPowerAmount").setValue(this.allpoweramount);
			this.getAlldata();
		}
	}

	getDataWater(id) {
		const controls = this.billComForm.controls;
		this.serviceTWater.findComTWaterByUnitId(id).subscribe((res) => {
			if (res.data.length !== 0) {
				const lastData = res.data.length - 1;
				controls.water.get("waterId").setValue(res.data[lastData]._id),
					controls.water
						.get("waterMeter")
						.setValue(res.data[lastData].watname);
				const datam3 = (
					res.data[lastData].endpos2 - res.data[lastData].strtpos2
				).toFixed(3);
				const m3 = parseFloat(datam3);

				let dataadmin = 0;
				let datapeml = 0;
				let amountW = 0;

				// if (m3 <= 2.000){
				// 	amountW = 40000
				// 	dataadmin = 0
				// 	datapeml = 0
				// }else{
				// 	amountW = Math.round( m3 * res.data[lastData].wat.rte.rte)
				// 	dataadmin = res.data[lastData].wat.rte.administrasi
				// 	datapeml = res.data[lastData].wat.rte.pemeliharaan
				// }

				amountW = m3 * res.data[lastData].wat.rte.rte;
				dataadmin = res.data[lastData].wat.rte.administrasi;
				datapeml = res.data[lastData].wat.rte.pemeliharaan;

				controls.water
					.get("waterRate")
					.setValue(res.data[lastData].wat.rte.rte);
				controls.water
					.get("startWater")
					.setValue(res.data[lastData].strtpos2);
				controls.water
					.get("endWater")
					.setValue(res.data[lastData].endpos2);
				controls.water.get("useWater").setValue(m3);
				controls.water.get("useWaterAmount").setValue(amountW);
				controls.water.get("maintenance").setValue(datapeml);
				controls.water.get("administration").setValue(dataadmin);
				controls.water
					.get("dirtyWater")
					.setValue(res.data[lastData].waterManagement);
				this.transaksiWater();
			} else {
				// controls.billing.get('water')['controls'].water_trans.setValue(""),
				// controls.water.get('waterMeter').setValue("")
				// controls.water.get('waterRate').setValue("")
				// controls.water.get('startWater').setValue("")
				// controls.water.get('endWater').setValue("")
				// controls.water.get('useWater').setValue("")
				// controls.water.get('useWaterAmount').setValue("")
				// controls.water.get('maintenance').setValue("")
				// controls.water.get('administration').setValue("")
				// controls.water.get('dirtyWater').setValue("")
				// controls.water.get('dirtyWaterAmount').setValue("")
				// controls.water.get('allWaterAmount').setValue("")
			}
		});
	}

	transaksiWater() {
		const controls = this.billComForm.controls;
		const wateramount = controls.water.get("useWaterAmount").value;
		// const maintenanceamount = controls.water.get("maintenance").value;
		// const administrationamount = controls.water.get("administration").value;
		const dw = controls.water.get("dirtyWater").value;

		if (dw !== 0 || dw === 0) {
			const dwres =
				((wateramount + this.abodemenPrice + this.admBankPrice) / 100) *
				dw;
			controls.water.get("dirtyWaterAmount").setValue(dwres);
			this.allwateramount =
				wateramount + this.abodemenPrice + this.admBankPrice + dwres;
			controls.water.get("allWaterAmount").setValue(this.allwateramount);
			this.getAlldata();
		}
	}

	getAlldata() {
		const controls = this.billComForm.controls;
		const dataPower = controls.power.get("allPowerAmount").value;
		const dataWater = controls.water.get("allWaterAmount").value;
		const dataIPL = controls.ipl.get("allIpl").value;
		if (dataIPL !== null || dataPower !== 0 || dataWater !== 0) {
			const dataPower = this.allpoweramount;
			const dataWater = this.allwateramount;
			const dataIPL = this.dataAllIPLParse;
			controls.ipl.get("allIpl").setValue(dataIPL);
			controls.power.get("allPowerAmount").setValue(this.allpoweramount);
			controls.water.get("allWaterAmount").setValue(this.allwateramount);
			controls.totalBilling.setValue(dataPower + dataWater + dataIPL);
		} else {
			console.log("Tes");
		}
	}

	goBackWithId() {
		const url = `/billCom`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}
	refreshBillCom(isNew: boolean = false, id: string = "") {
		let url = this.router.url;
		if (!isNew) {
			this.router.navigate([url], { relativeTo: this.activatedRoute });
			return;
		}
		url = `/billCom/edit/${id}`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}
	onSubmit(withBack: boolean = false) {
		this.hasFormErrors = false;
		const controls = this.billComForm.controls;
		if (this.billComForm.invalid) {
			Object.keys(controls).forEach((controlName) =>
				controls[controlName].markAsTouched()
			);

			this.hasFormErrors = true;
			this.selectedTab = 0;
			return;
		}

		this.loading = true;
		const editedBillCom = this.prepareBillCom();
		this.addBillCom(editedBillCom, withBack);
	}

	prepareBillCom(): BillComModel {
		const controls = this.billComForm.controls;
		const _billCom = new BillComModel();
		_billCom.clear();
		_billCom._id = this.billCom._id;
		_billCom.billing_number = controls.billing_number.value;
		_billCom.unit = controls.unit.value;
		_billCom.unit2 = controls.unit2.value;
		_billCom.unitType = controls.unitType.value;
		_billCom.power = {
			powerId: controls.power.get("powerId").value,
			powerMeter: controls.power.get("powerMeter").value,
			powerRateName: controls.power.get("powerRateName").value,
			powerRate: controls.power.get("powerRate").value,
			startPower: controls.power.get("startPower").value,
			endPower: controls.power.get("endPower").value,
			usePower: controls.power.get("usePower").value,
			useAmount: controls.power.get("useAmount").value,
			sc: controls.power.get("sc").value,
			scAmount: controls.power.get("scAmount").value,
			ppju: controls.power.get("ppju").value,
			ppjuAmount: controls.power.get("ppjuAmount").value,
			loss: controls.power.get("loss").value,
			lossAmount: controls.power.get("lossAmount").value,
			allPowerAmount: controls.power.get("allPowerAmount").value,
		};
		_billCom.water = {
			waterId: controls.water.get("waterId").value,
			waterMeter: controls.water.get("waterMeter").value,
			waterRate: controls.water.get("waterRate").value,
			startWater: controls.water.get("startWater").value,
			endWater: controls.water.get("endWater").value,
			useWater: controls.water.get("useWater").value,
			useWaterAmount: controls.water.get("useWaterAmount").value,
			maintenance: controls.water.get("maintenance").value,
			administration: controls.water.get("administration").value,
			dirtyWater: controls.water.get("dirtyWater").value,
			dirtyWaterAmount: controls.water.get("dirtyWaterAmount").value,
			allWaterAmount: controls.water.get("allWaterAmount").value,
			admBank: this.admBankPrice,
			abodemen: this.abodemenPrice,
		};
		const iplValue = controls.ipl.value;
		_billCom.ipl = {
			unitSize: iplValue.unitSize,
			serviceCharge: iplValue.serviceCharge,
			sinkingFund: iplValue.sinkingFund,
			monthIpl: iplValue.monthIpl,
			ipl: iplValue.ipl,
			allIpl: iplValue.allIpl,
			admBank: this.admBankPrice,
		};
		_billCom.billed_to = controls.billed_to.value;
		_billCom.totalBilling = controls.totalBilling.value;
		_billCom.billing_date = controls.billing_date.value;
		_billCom.due_date = controls.due_date.value;
		// _billCom.desc = controls.desc.value;
		_billCom.created_date = controls.created_date.value;
		_billCom.created_by = controls.created_by.value;
		return _billCom;
	}

	addBillCom(_billCom: BillComModel, withBack: boolean = false) {
		const addSubscription = this.service.createBillCom(_billCom).subscribe(
			(res) => {
				const message = `New commersil type successfully has been added.`;
				this.layoutUtilsService.showActionNotification(
					message,
					MessageType.Create,
					5000,
					true,
					true
				);
				const url = `/billCom`;
				this.router.navigateByUrl(url, {
					relativeTo: this.activatedRoute,
				});
			},
			(err) => {
				console.error(err);
				const message =
					"Error while adding commersil type | " + err.statusText;
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

	getComponentTitle() {
		let result = "Create Billing Commercial";
		return result;
	}

	onAlertClose($event) {
		this.hasFormErrors = false;
	}

	ngOnDestroy() {
		this.subscriptions.forEach((sb) => sb.unsubscribe());
	}

	inputKeydownHandler(event) {
		return event.keyCode === 8 || event.keyCode === 46
			? true
			: !isNaN(Number(event.key));
	}
}
