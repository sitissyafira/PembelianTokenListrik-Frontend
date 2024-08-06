import {ChangeDetectorRef, Component, OnDestroy, OnInit} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Observable, Subscription } from 'rxjs';
import { Store, select } from '@ngrx/store';
import { AppState } from '../../../../../../core/reducers';
import { SubheaderService, LayoutConfigService } from '../../../../../../core/_base/layout';
import { LayoutUtilsService, MessageType } from '../../../../../../core/_base/crud';
import {BillComModel} from "../../../../../../core/commersil/master/billCom/billCom.model";
import {
	selectBillComActionLoading, selectBillComById,
} from "../../../../../../core/commersil/master/billCom/billCom.selector";
import {BillComService} from '../../../../../../core/commersil/master/billCom/billCom.service';
import { SelectionModel } from '@angular/cdk/collections';
import { QueryComUnitModel } from '../../../../../../core/commersil/master/comUnit/querycomUnit.model';
import { ComUnitService } from '../../../../../../core/commersil/master/comUnit/comUnit.service';
import { ComTPowerService } from '../../../../../../core/commersil/master/comTPower/comTPower.service';
import * as _moment from 'moment';
const moment = _rollupMoment || _moment;
import {default as _rollupMoment, Moment} from 'moment';
import { ComTWaterService } from '../../../../../../core/commersil/master/comTWater/comTWater.service';

@Component({
  selector: 'kt-view-billCom',
  templateUrl: './view-billCom.component.html',
  styleUrls: ['./view-billCom.component.scss']
})
export class ViewBillComComponent implements OnInit, OnDestroy {
	codenum
	type;
	billstats;

	//listrik
	pemakaianListrik : number;
	datasc : number;
	hasilsc : number;
	datappju : number;
	hasilppju : number;
	dataloss : number;
	allpoweramount : number;
	monthPower : number;

	monthWater : number;
	allwateramount : number;
	dataAllIPLParse : number

	datauser = localStorage.getItem("user");
	billCom: BillComModel;
	BillComId$: Observable<string>;
	selection = new SelectionModel<BillComModel>(true, []);
	oldBillCom: BillComModel;
	selectedTab = 0;
	loading$: Observable<boolean>;
	billComForm: FormGroup;
	hasFormErrors = false;
	loading : boolean = false;
	date1 = new FormControl(new Date());
	isPaid: boolean


	unitResult: any[] = [];
	unitResultFiltered = [];
	viewUnitResult = new FormControl();


	private subscriptions: Subscription[] = [];
  	constructor(
		private activatedRoute: ActivatedRoute,
		private router: Router,
		private billComFB: FormBuilder,
		private subheaderService: SubheaderService,
		private layoutUtilsService: LayoutUtilsService,
		private store: Store<AppState>,
		private service: BillComService,
		private serviceUnit : ComUnitService,
		private serviceTPower : ComTPowerService,
		private serviceTWater : ComTWaterService,
		private cd: ChangeDetectorRef,
		private layoutConfigService: LayoutConfigService
	) { }

  	ngOnInit() {
		this.loading$ = this.store.pipe(select(selectBillComActionLoading));
		const routeSubscription =  this.activatedRoute.params.subscribe(params => {
			const id = params.id;
			if (id) {
				this.store.pipe(select(selectBillComById(id))).subscribe(res => {
					if (res) {
						this.billCom = res;
						this.isPaid = res.isPaid;
						this.oldBillCom = Object.assign({}, this.billCom);
						this.initBillCom();
					}
				});
			}
		});
		this.subscriptions.push(routeSubscription);
  	}

	initBillCom() {
		this.createForm();
		this.loadUnitList();
	}


	createForm() {

			this.billComForm = this.billComFB.group({
				billing_number : [{value:this.billCom.billing_number, disabled:true}],
				billed_to : [{value:this.billCom.billed_to, disabled:true}],
				unit : [{value: this.billCom.unit, disabled: true}],
				unit2 : [{value: this.billCom.unit2, disabled: true}],
				billing_date : [{value: this.billCom.billing_date, disabled: true}],
				due_date : [{value: this.billCom.due_date, disabled: true}],
				totalBilling : [{value:this.billCom.totalBilling, disabled:true}],
				created_date : [{value:this.billCom.created_date, disabled:true}],
				created_by: [{value:this.billCom.created_by, disabled:true}],
				unitType : [{value: this.billCom.unitType, disabled: true}],
				isPaid: [{value: this.billCom.isPaid, disabled: true}],

				power : this.billComFB.group({
					powerId : [{value:this.billCom.power.powerId, disabled:true}],
					powerMeter : [{value:this.billCom.power.powerMeter, disabled:true}],
					powerRateName : [{value:this.billCom.power.powerRateName, disabled:true}],
					powerRate : [{value:this.billCom.power.powerRate, disabled:true}],
					startPower : [{value:this.billCom.power.startPower, disabled:true}],
					endPower : [{value:this.billCom.power.endPower, disabled:true}],
					usePower : [{value:this.billCom.power.usePower, disabled:true}],
					useAmount : [{value:this.billCom.power.useAmount, disabled:true}],
					sc : [{value:this.billCom.power.sc, disabled:true}],
					scAmount : [{value:this.billCom.power.scAmount, disabled:true}],
					ppju : [{value:this.billCom.power.ppju, disabled:true}],
					ppjuAmount : [{value:this.billCom.power.ppjuAmount, disabled:true}],
					loss : [{value:this.billCom.power.loss, disabled:true}],
					lossAmount : [{value:this.billCom.power.lossAmount, disabled:true}],
					allPowerAmount : [{value:this.billCom.power.allPowerAmount, disabled:true}]
				}),
				water : this.billComFB.group({
					waterId : [{value:this.billCom.water.waterId, disabled:true}],
					waterMeter :[{value:this.billCom.water.waterMeter, disabled:true}],
					waterRate : [{value:this.billCom.water.waterRate, disabled:true}],
					startWater : [{value:this.billCom.water.startWater, disabled:true}],
					endWater : [{value:this.billCom.water.endWater, disabled:true}],
					useWater : [{value:this.billCom.water.useWater, disabled:true}],
					useWaterAmount : [{value:this.billCom.water.useWaterAmount, disabled:true}],
					maintenance : [{value:this.billCom.water.maintenance, disabled:true}],
					administration : [{value:this.billCom.water.administration, disabled:true}],
					dirtyWater : [{value:this.billCom.water.dirtyWater, disabled:true}],
					dirtyWaterAmount: [{value:this.billCom.water.dirtyWaterAmount, disabled:true}],
					allWaterAmount : [{value:this.billCom.water.allWaterAmount, disabled:true}]
				}),
				ipl : this.billComFB.group({
					unitSize : [{value:this.billCom.ipl.unitSize, disabled:true}],
					serviceCharge : [{value:this.billCom.ipl.serviceCharge, disabled:true}],
					sinkingFund : [{value:this.billCom.ipl.sinkingFund, disabled:true}],
					monthIpl : [{value:this.billCom.ipl.monthIpl, disabled:true}],
					ipl : [{value:this.billCom.ipl.ipl, disabled:true}],
					allIpl : [{value:this.billCom.ipl.allIpl, disabled:true}]
				}),
			});
	}

	loadUnitList() {
		this.selection.clear();
		const queryParams = new QueryComUnitModel(
			null,
			1,
			100000
		);
		this.serviceUnit.getListComUnit(queryParams).subscribe(
			res => {
				this.unitResult = res.data;
			}
		);
		
	}

	goBackWithId() {
		const url = `/billCom`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}

	refreshBillCom(isNew: boolean = false, id:string = "") {
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
			Object.keys(controls).forEach(controlName =>
				controls[controlName].markAsTouched()
			);

			this.hasFormErrors = true;
			this.selectedTab = 0;
			return;
		}

		this.loading = true;
		const editedComType = this.prepareBillCom();
		this.updateBillCom(editedComType, withBack);
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
		_billCom.isPaid = controls.isPaid.value;
		_billCom.power = {
			powerId : controls.power.get('powerId').value,
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
		_billCom.water = {
			waterId : controls.water.get('waterId').value,
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
		_billCom.ipl = controls.ipl.value;
		_billCom.billed_to = controls.billed_to.value;
		_billCom.totalBilling = controls.totalBilling.value;
		_billCom.billing_date = controls.billing_date.value;
		_billCom.due_date = controls.due_date.value;
		// _billCom.desc = controls.desc.value;
		_billCom.created_date = controls.created_date.value;
		_billCom.created_by = controls.created_by.value;
		return _billCom;

	}
	
	updateBillCom(_comType: BillComModel, withBack: boolean = false) {
		const addSubscription = this.service.updateBillCom(_comType).subscribe(
			res => {
				const message = `Product successfully has been saved.`;
				this.layoutUtilsService.showActionNotification(message, MessageType.Update, 5000, true, true);
				const url = `/billCom`;
				this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
			},
			err => {
				console.error(err);
				const message = 'Error while adding Product | ' + err.statusText;
				this.layoutUtilsService.showActionNotification(message, MessageType.Update, 5000, true, false);
			}
		);
		this.subscriptions.push(addSubscription);
	}


	getComponentTitle() {
		let result = 'Create Billing Commercial';
		return result;
	}

	onAlertClose($event) {
		this.hasFormErrors = false;
	}

  	ngOnDestroy() {
		this.subscriptions.forEach(sb => sb.unsubscribe());
	}

	inputKeydownHandler(event) {
		return event.keyCode === 8 || event.keyCode === 46 ? true : !isNaN(Number(event.key));
	}
}
