import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import { Observable, Subscription } from 'rxjs';
import { Store, select } from '@ngrx/store';
import { AppState } from '../../../../../../core/reducers';
import {LayoutUtilsService, MessageType, } from '../../../../../../core/_base/crud';
import {
	selectBillLogActionLoading,
	selectBillLogById
} from '../../../../../../core/log/invoice/billLog/billLog.selector';
import {BillLogModel} from '../../../../../../core/log/invoice/billLog/billLog.model';
import {BillLogService} from '../../../../../../core/log/invoice/billLog/billLog.service';
import {SelectionModel} from "@angular/cdk/collections";
import * as _moment from 'moment';
import {default as _rollupMoment, Moment} from 'moment';
import {UnitService} from '../../../../../../core/unit/unit.service';
import {QueryUnitModel} from '../../../../../../core/unit/queryunit.model';
import { QueryAccountBankModel } from '../../../../../../core/masterData/bank/accountBank/queryaccountBank.model';
import { AccountBankService } from '../../../../../../core/masterData/bank/accountBank/accountBank.service';
const moment = _rollupMoment || _moment;
import { environment } from '../../../../../../../environments/environment';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'kt-add-billLog',
  templateUrl: './edit-billLog.component.html',
  styleUrls: ['./edit-billLog.component.scss']
})
export class EditBillLogComponent implements OnInit, OnDestroy {
	billLog: BillLogModel;
	images: any;
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
	isfreeIpl : boolean = false;
	isfreeAbodement : boolean = false;
	// Private properties
	private subscriptions: Subscription[] = [];
	constructor(
		private activatedRoute: ActivatedRoute,
		private router: Router,
		private billLogFB: FormBuilder,
		private layoutUtilsService: LayoutUtilsService,
		private store: Store<AppState>,
		private serviceBill: BillLogService,
		private serviceUnit: UnitService,
		private bservice : AccountBankService,
		private http : HttpClient,
	) { }

	ngOnInit() {
		this.loading$ = this.store.pipe(select(selectBillLogActionLoading));
		const routeSubscription =  this.activatedRoute.params.subscribe(params => {
			const id = params.id;
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
		this.getBIllingmage(this.billLog._id)
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
				created_date: [{"value":this.billLog.created_date, "disabled": true}],
				billing_date: [{value:this.billLog.billing_date, disabled:true}],
				due_date: [{value:this.billLog.due_date, disabled:true}],

				bank : [{value:this.billLog.bank, disabled:false}, Validators.required],
				customerBankNo : [{value:this.billLog.customerBankNo, disabled:false}],
				customerBank : [{value:this.billLog.customerBank, disabled:false}],
				desc : [{value:this.billLog.desc, disabled:false}],
				paidDate :  [{value:this.date1.value, disabled:false}],
				isPaid : [true],
				transferAmount: [{value:this.billLog.transferAmount, disabled:false}],
				paymentType : [{value:this.billLog.paymentType, disabled:false}],
				attachment : [{value:this.billLog.attachment, disabled:false}],
				accountOwner : [this.billLog.accountOwner]
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

	onSubmit(withBack: boolean = false) {
		this.hasFormErrors = false;
		const controls = this.billLogForm.controls;
		/** check form */
		if (this.billLogForm.invalid) {
			console.log(controls);
			Object.keys(controls).forEach(controlName =>
				controls[controlName].markAsTouched()
			);
			this.hasFormErrors = true;
			this.selectedTab = 0;
			return;
		}
		const editedBillLog = this.prepareBillLog();
		this.updateBillLog(editedBillLog, withBack);
	}
	
	prepareBillLog(): BillLogModel {
		const controls = this.billLogForm.controls;
		const _billLog = new BillLogModel();
		_billLog.clear();
		_billLog._id = this.billLog._id;
		_billLog.contract = controls.contract.value;
		_billLog.billed_to = controls.billed_to.value.toLowerCase();
		_billLog.unit = controls.unit.value;
		_billLog.unit2 = controls.unit2.value.toLowerCase()
		// _billLog.billing = {
		// 	electricity: {
		// 		electric_trans: controls.billLog.get('electricity')['controls'].electric_trans.value,
		// 	},
		// 	water: {
		// 		water_trans: controls.billLog.get('water')['controls'].water_trans.value,
		// 	},
		// };
		_billLog.power = {
			powerMeter : controls.power.get('powerMeter').value,
			powerRateName: controls.power.get('powerRateName').value,
			powerRate: controls.power.get('powerRate').value,
			startPower: controls.power.get('startPower').value,
			endPower : controls.power.get('endPower').value,
			usePower : controls.power.get('usePower').value,
			useAmount: controls.power.get('useAmount').value,
			sc: controls.power.get('sc').value,
			scAmount : controls.power.get('scAmount').value,
			ppju: controls.power.get('ppju').value,
			ppjuAmount: controls.power.get('ppjuAmount').value,
			loss: controls.power.get('loss').value,
			lossAmount: controls.power.get('lossAmount').value,
			allPowerAmount : controls.power.get('allPowerAmount').value,
		};
		_billLog.water = {
			waterMeter: controls.water.get('waterMeter').value,
			waterRate: controls.water.get('waterRate').value,
			startWater: controls.water.get('startWater').value,
			endWater : controls.water.get('endWater').value,
			useWater : controls.water.get('useWater').value,
			useWaterAmount: controls.water.get('useWaterAmount').value,
			maintenance: controls.water.get('maintenance').value,
			administration : controls.water.get('administration').value,
			dirtyWater: controls.water.get('dirtyWater').value,
			dirtyWaterAmount: controls.water.get('dirtyWaterAmount').value,
			allWaterAmount: controls.water.get('allWaterAmount').value,
		};
		_billLog.ipl = {
			unitSize: controls.ipl.get('unitSize').value,
			serviceCharge: controls.ipl.get('serviceCharge').value,
			sinkingFund : controls.ipl.get('sinkingFund').value,
			monthIpl : controls.ipl.get('monthIpl').value,
			ipl: controls.ipl.get('ipl').value,
			allIpl: controls.ipl.get('allIpl').value,
		};
		_billLog.isFreeIpl = controls.isFreeIpl.value;
		_billLog.isFreeAbodement = controls.isFreeAbodement.value;
		_billLog.totalBilling = controls.totalBilling.value;
		_billLog.billing_number = controls.billing_number.value;
		_billLog.created_date = controls.created_date.value;
		_billLog.billing_date = controls.billing_date.value;
		_billLog.due_date = controls.due_date.value;


		_billLog.bank = controls.bank.value;
		_billLog.isPaid = controls.isPaid.value;
		_billLog.customerBank = controls.customerBank.value;
		_billLog.customerBankNo = controls.customerBankNo.value;
		_billLog.desc = controls.desc.value;
		_billLog.paidDate = controls.paidDate.value;
		_billLog.paymentType = controls.paymentType.value;
		_billLog.transferAmount = controls.transferAmount.value;
		_billLog.accountOwner = controls.accountOwner.value;
		_billLog.attachment = controls.attachment.value;
		
		return _billLog;
	}


	updateBillLog(_billLog: BillLogModel, withBack: boolean = false){
		const editSubscription = this.serviceBill.updateBillLog(_billLog).subscribe(
			res => {
				const message = `BillLog successfully has been saved.`;
				this.layoutUtilsService.showActionNotification(message, MessageType.Update, 5000, true, true);
				const url = `/billLog`;
				this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
			},
			err => {
				console.error(err);
				const message = 'Error while saving billLog | ' + err.statusText;
				this.layoutUtilsService.showActionNotification(message, MessageType.Update, 5000, true, false);
			}
		);
		this.subscriptions.push(editSubscription);
	}

	getComponentTitle() {
		let result = `Update BillLog`;
		return result;
	}

	onAlertClose($event) {
		this.hasFormErrors = false;
	}
	
	ngOnDestroy() {
		this.subscriptions.forEach(sb => sb.unsubscribe());
	}

	async getBIllingmage(id){
		const URL_IMAGE = `${environment.baseAPI}/api/billLog`
		await this.http.get(`${URL_IMAGE}/${id}/image`).subscribe((res: any) => {
				console.log(res)
				this.images = res.data;
		 });
	}
}
