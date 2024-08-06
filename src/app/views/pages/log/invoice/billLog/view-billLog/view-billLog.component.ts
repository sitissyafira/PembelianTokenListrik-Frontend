
import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {FormBuilder, FormControl, FormGroup,} from '@angular/forms';
import { Observable, Subscription } from 'rxjs';
import { Store, select } from '@ngrx/store';
import { AppState } from '../../../../../../core/reducers';
import {
	selectBillLogActionLoading,
	selectBillLogById
} from '../../../../../../core/log/invoice/billLog/billLog.selector';
import {BillLogModel} from '../../../../../../core/log/invoice/billLog/billLog.model';
import {SelectionModel} from "@angular/cdk/collections";
import * as _moment from 'moment';
import {default as _rollupMoment} from 'moment';
import {UnitService} from '../../../../../../core/unit/unit.service';
import {QueryUnitModel} from '../../../../../../core/unit/queryunit.model';
import { QueryAccountBankModel } from '../../../../../../core/masterData/bank/accountBank/queryaccountBank.model';
import { AccountBankService } from '../../../../../../core/masterData/bank/accountBank/accountBank.service';
const moment = _rollupMoment || _moment;


@Component({
  selector: 'kt-view-billLog',
  templateUrl: './view-billLog.component.html',
  styleUrls: ['./view-billLog.component.scss']
})
export class ViewBillLogComponent implements OnInit, OnDestroy {
	billLog: BillLogModel;
	billLogId$: Observable<string>;
	oldBillLog: BillLogModel;
	selectedTab = 0;
	loading$: Observable<boolean>;
	billLogForm: FormGroup;
	hasFormErrors = false;
	unitResult: any[] = [];
	customerResult: any[] = [];
	powerResult: any[] = [];
	waterResult: any[] = [];
	bankResult: any[] = [];
	selection = new SelectionModel<BillLogModel>(true, []);
	date = new FormControl(moment());
	date1 = new FormControl(new Date());
	serializedDate = new FormControl((new Date()).toISOString());
	duedate = new FormControl();
	
	private subscriptions: Subscription[] = [];
	constructor(
		private activatedRoute: ActivatedRoute,
		private router: Router,
		private billLogFB: FormBuilder,
		private store: Store<AppState>,
		private serviceUnit: UnitService,
		private bservice : AccountBankService,

	) { }

	ngOnInit() {
		this.loading$ = this.store.pipe(select(selectBillLogActionLoading));
		const routeSubscription =  this.activatedRoute.params.subscribe(params => {
			const id = params.id;
			console.log(id)
			if (id) {
				this.store.pipe(select(selectBillLogById(id))).subscribe(res => {
					if (res) {
						this.billLog = res;
						this.oldBillLog = Object.assign({}, this.billLog);
						this.initBillLog();
					}
				});
			}
		});
		this.subscriptions.push(routeSubscription);
	}
	initBillLog() {
		this.createForm();
		this.loadUnit();
		this.loadAccountBank()
	}

	createForm() {
			this.billLogForm = this.billLogFB.group({
				contract: [this.billLog.contract],
				billed_to: [{value:this.billLog.billed_to, disabled:true}],
				unit: [{value:this.billLog.unit._id, disabled:true}],
				unit2: [{value:this.billLog.unit2, disabled:true}],
				billing: this.billLogFB.group({
					electricity: this.billLogFB.group({
						electric_trans: [{value:this.billLog.billing.electricity.electric_trans._id, disabled:true}],
					}),
					water: this.billLogFB.group({
						water_trans: [{value:this.billLog.billing.water.water_trans, disabled:true}]
					})
				}),
				power : this.billLogFB.group({
					powerMeter : [{value:this.billLog.power.powerMeter, disabled:true}],
					powerRateName : [{value:this.billLog.power.powerRateName, disabled:true}],
					powerRate : [{value:this.billLog.power.powerRate, disabled:true}],
					startPower : [{value:this.billLog.power.startPower, disabled:true}],
					endPower : [{value:this.billLog.power.endPower, disabled:true}],
					usePower : [{value:this.billLog.power.usePower, disabled:true}],
					useAmount : [{value:this.billLog.power.useAmount, disabled:true}],
					sc : [{value:this.billLog.power.sc, disabled:true}],
					scAmount : [{value:this.billLog.power.scAmount, disabled:true}],
					ppju : [{value:this.billLog.power.ppju, disabled:true}],
					ppjuAmount : [{value:this.billLog.power.ppjuAmount, disabled:true}],
					loss : [{value:this.billLog.power.loss, disabled:true}],
					lossAmount : [{value:this.billLog.power.lossAmount, disabled:true}],
					allPowerAmount : [{value:this.billLog.power.allPowerAmount, disabled:true}]
				}),
				water : this.billLogFB.group({
					waterMeter :[{value:this.billLog.water.waterMeter, disabled:true}],
					waterRate : [{value:this.billLog.water.waterRate, disabled:true}],
					startWater : [{value:this.billLog.water.startWater, disabled:true}],
					endWater : [{value:this.billLog.water.endWater, disabled:true}],
					useWater : [{value:this.billLog.water.useWater, disabled:true}],
					useWaterAmount : [{value:this.billLog.water.useWaterAmount, disabled:true}],
					maintenance : [{value:this.billLog.water.maintenance, disabled:true}],
					administration : [{value:this.billLog.water.administration, disabled:true}],
					dirtyWater : [{value:this.billLog.water.dirtyWater, disabled:true}],
					dirtyWaterAmount: [{value:this.billLog.water.dirtyWaterAmount, disabled:true}],
					allWaterAmount : [{value:this.billLog.water.allWaterAmount, disabled:true}]
				}),
				ipl : this.billLogFB.group({
					unitSize : [{value:this.billLog.ipl.unitSize, disabled:true}],
					serviceCharge : [{value:this.billLog.ipl.serviceCharge, disabled:true}],
					sinkingFund : [{value:this.billLog.ipl.sinkingFund, disabled:true}],
					monthIpl : [{value:this.billLog.ipl.monthIpl, disabled:true}],
					ipl : [{value:this.billLog.ipl.ipl, disabled:true}],
					allIpl : [{value:this.billLog.ipl.allIpl, disabled:true}]
				}),
				isFreeIpl : [{value:this.billLog.isFreeIpl, disabled:true}],
				isFreeAbodement : [{value:this.billLog.isFreeAbodement, disabled:true}],
				totalBilling : [{value:this.billLog.totalBilling, disabled:true}],
				billing_number: [{value: this.billLog.billing_number, disabled: true}],
				created_date: [{value:this.billLog.created_date, disabled: true}],
				billLog_date: [{value:this.billLog.billing_date, disabled:true}],
				due_date: [{value:this.billLog.due_date, disabled:true}],
				bank : [{value:this.billLog.bank, disabled:true}],
				customerBankNo : [{value:this.billLog.customerBankNo, disabled:true}],
				customerBank : [{value:this.billLog.customerBank, disabled:true}],
				desc : [{value:this.billLog.desc, disabled:true}],
				paidDate :  [{value:this.billLog.paidDate, disabled:true}],
				isPaid : [true],
				paymentType :  [{value:this.billLog.paymentType, disabled:true}],
			});
	}

	loadUnit(){
		this.selection.clear();
		const queryParams = new QueryUnitModel(
			null,
			"asc",
			"grpnm",
			1,
			10
		);
		this.serviceUnit.getDataUnitForParking(queryParams).subscribe(
			res => {
				this.unitResult = res.data;
			}
		);
	}

	loadAccountBank() {
		this.selection.clear();
		const queryParams = new QueryAccountBankModel(
			null,
			"asc",
			null,
			1,
			1000
		);
		this.bservice.getListAccountBank(queryParams).subscribe(
			res => {
				this.bankResult = res.data;
			}
		);
	}

	goBackWithId() {
		const url = `/billLog`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}
	refreshBillLog(isNew: boolean = false, id:string = "") {
		let url = this.router.url;
		if (!isNew) {
			this.router.navigate([url], { relativeTo: this.activatedRoute });
			return;
		}

		url = `/billLog/edit/${id}`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}

	getComponentTitle() {
		let result = `View BillLog`;
		return result;
	}

	onAlertClose($event) {
		this.hasFormErrors = false;
	}
	
	ngOnDestroy() {
		this.subscriptions.forEach(sb => sb.unsubscribe());
	}
}
