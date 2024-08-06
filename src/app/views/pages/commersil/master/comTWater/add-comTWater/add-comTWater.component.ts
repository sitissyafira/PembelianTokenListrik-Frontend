import {ChangeDetectorRef, Component, OnDestroy, OnInit} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Observable, Subscription } from 'rxjs';
import { Store, select } from '@ngrx/store';
import { AppState } from '../../../../../../core/reducers';
import { SubheaderService, LayoutConfigService } from '../../../../../../core/_base/layout';
import { LayoutUtilsService, MessageType } from '../../../../../../core/_base/crud';
import {ComTWaterModel} from "../../../../../../core/commersil/master/comTWater/comTWater.model";
import {
	selectComTWaterActionLoading,
} from "../../../../../../core/commersil/master/comTWater/comTWater.selector";
import {ComTWaterService} from '../../../../../../core/commersil/master/comTWater/comTWater.service';
import { SelectionModel } from '@angular/cdk/collections';
import { QueryComWaterModel } from '../../../../../../core/commersil/master/comWater/querycomWater.model';
import { ComWaterService } from '../../../../../../core/commersil/master/comWater/comWater.service';


@Component({
  selector: 'kt-add-comTWater',
  templateUrl: './add-comTWater.component.html',
  styleUrls: ['./add-comTWater.component.scss']
})
export class AddComTWaterComponent implements OnInit, OnDestroy {
	datauser = localStorage.getItem("user");
	comTWater: ComTWaterModel;
	ComTWaterId$: Observable<string>;
	selection = new SelectionModel<ComTWaterModel>(true, []);
	oldComTWater: ComTWaterModel;
	selectedTab = 0;
	loading$: Observable<boolean>;
	comTWaterForm: FormGroup;
	hasFormErrors = false;
	loading : boolean = false;
	waterMeter: any[] = [];
	date1 = new FormControl(new Date());
	waterListResultFiltered = [];
	viewWaterMeterResult = new FormControl();
	private loadingData = {
		Meter : false,	
	}

	private subscriptions: Subscription[] = [];
  	constructor(
		private activatedRoute: ActivatedRoute,
		private router: Router,
		private comTWaterFB: FormBuilder,
		private subheaderService: SubheaderService,
		private layoutUtilsService: LayoutUtilsService,
		private store: Store<AppState>,
		private service: ComTWaterService,
		private serviceMWater : ComWaterService,
		private cd: ChangeDetectorRef,
		private layoutConfigService: LayoutConfigService
	) { }

  	ngOnInit() {
		this.loading$ = this.store.pipe(select(selectComTWaterActionLoading));
		const routeSubscription =  this.activatedRoute.params.subscribe(params => {
				this.comTWater = new ComTWaterModel();
				this.comTWater.clear();
				this.initComTWater();
			}
		)
		this.subscriptions.push(routeSubscription);
  	}

	initComTWater() {
		this.createForm();
		this.loadMeterList();
	}

	createForm() {
			this.comTWaterForm = this.comTWaterFB.group({
				date : [this.date1.value],
				wat : [undefined],
				rate : [{value:"", disabled:true}],
				watname : [""],
				unit : [""],
				strtpos : [{value:"", disabled:false}, Validators.required],
				endpos : [{value:"", disabled:false}, Validators.required],
				waterManagement : [{value:"", disabled:false}, Validators.required],
				strtpos2 : [{value:"", disabled:true}],
				endpos2 : [{value:"", disabled:true}],
				isPosting : [""],
				created_date : [this.date1.value],
				created_by: [{value:this.datauser, disabled:true}],
		});
	}




	/**
	* @param value
	*/
	_setWaterValue(value) {
		this.comTWaterForm.patchValue({ wat: value._id });
		this.changeWaterMeter(value._id);
	}

	_onKeyup(e: any) {
		this.comTWaterForm.patchValue({ wat: undefined });
		this._filterWaterList(e.target.value);
	}
	
	_filterWaterList(text: string) {
		this.waterListResultFiltered = this.waterMeter.filter(i => {
			const filterText = `${i.nmmtr} - ${i.unitCode.toLocaleLowerCase()}`;
			if(filterText.includes(text.toLocaleLowerCase())) return i;

		});
	}

	loadMeterList() {
		// this.loadingData.Meter = true
		this.selection.clear();
		const queryParams = new QueryComWaterModel(
			null,
			1,
			10000
		);
		this.serviceMWater.getListComWaterForTransaction(queryParams).subscribe((res) => {
				this.waterMeter = res.data;
				console.log(res.data)
				this.waterListResultFiltered = this.waterMeter.slice();
				this.cd.markForCheck();
				this.viewWaterMeterResult.enable();
				// this.loadingData.Meter = false
			});
	}


	
	async changeWaterMeter(item) {
		await this.serviceMWater.findComWaterById(item).subscribe(res => {
			console.log(res);
			this.comTWaterForm.controls.rate.setValue(res.data.rte.rte);
			this.comTWaterForm.controls.watname.setValue(res.data.nmmtr);
			this.comTWaterForm.controls.unit.setValue(res.data.unitCode);
			// console.log(res.lastConsumtion.endpos, "last endpost")


			// if (typeof res.lastConsumtion == "undefined" || res.lastConsumtion == null){
			// 	this.lastdata = 0
			// }else{
			// 	this.lastdata = res.lastConsumtion.endpos;
			// }

			

			// this.unit = res.data.unt._id;
			// this.type = res.data.unt.type
			// ;
			// this.waterTransactionForm.controls.unit.setValue(res.data.unit);
			// if (this.type == "pp" || this.type == "owner")	
			// 	{
			// 		this.ownerService.findOwnershipContractByUnit(this.unit).subscribe(data =>
			// 			{
			// 				console.log(data)
			// 				if (data.data[0].billstatus == 0){
			// 					this.waterTransactionForm.controls.strtpos.setValue(data.data[0].start_water_stand)
			// 					const strtpos = this.waterTransactionForm.controls.strtpos.value / 10;
			// 					if(strtpos != 0){
			// 					this.waterTransactionForm.controls.strtpos2.setValue(strtpos)};
			// 				}else{
			// 					this.waterTransactionForm.controls.strtpos.setValue(this.lastdata)
			// 					const strtpos = this.waterTransactionForm.controls.strtpos.value / 10;
			// 					if(strtpos != 0){
			// 					this.waterTransactionForm.controls.strtpos2.setValue(strtpos)};
			// 				}
			// 			})
			// 	}
			// else{
			// 		this.tenantService.findLeaseContractByUnit(this.unit).subscribe(data =>
			// 			{
			// 				if (data.data[0].billstatus == 0){
			// 					this.waterTransactionForm.controls.strtpos.setValue(data.data[0].start_wa_stand)
			// 					const strtpos = this.waterTransactionForm.controls.strtpos.value / 10;
			// 					if(strtpos != 0){
			// 					this.waterTransactionForm.controls.strtpos2.setValue(strtpos)};
			// 				}else{
			// 					this.waterTransactionForm.controls.strtpos.setValue(res.lastConsumtion.endpos)
			// 					const strtpos = this.waterTransactionForm.controls.strtpos.value / 10;
			// 					if(strtpos != 0){
			// 					this.waterTransactionForm.controls.strtpos2.setValue(strtpos)};
			// 				}
			// 			})
			// 	}
			});
	}
	
	goBackWithId() {
		const url = `/comTWater`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}
	refreshComTWater(isNew: boolean = false, id:string = "") {
		let url = this.router.url;
		if (!isNew) {
			this.router.navigate([url], { relativeTo: this.activatedRoute });
			return;
		}
		url = `/comTWater/edit/${id}`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}
	onSubmit(withBack: boolean = false) {
		this.hasFormErrors = false;
		const controls = this.comTWaterForm.controls;
		if (this.comTWaterForm.invalid) {
			Object.keys(controls).forEach(controlName =>
				controls[controlName].markAsTouched()
			);

			this.hasFormErrors = true;
			this.selectedTab = 0;
			return;
		}

		this.loading = true;
		const editedComTWater = this.prepareComTWater();
		this.addComTWater(editedComTWater, withBack);
	}

	prepareComTWater(): ComTWaterModel {
		const controls = this.comTWaterForm.controls;
		const _comTWater = new ComTWaterModel();
		_comTWater.clear();
		_comTWater._id = this.comTWater._id;
		_comTWater.date = controls.date.value;
		_comTWater.wat = controls.wat.value;
		_comTWater.watname = controls.watname.value;
		_comTWater.unit = controls.unit.value;
		_comTWater.strtpos = controls.strtpos.value;
		_comTWater.endpos = controls.endpos.value;
		_comTWater.strtpos2 = controls.strtpos2.value;
		_comTWater.endpos2 = controls.endpos2.value;
		_comTWater.waterManagement = controls.waterManagement.value;
		_comTWater.isPosting = controls.isPosting.value;
		_comTWater.created_date = controls.created_date.value;
		_comTWater.created_by = controls.created_by.value;
		return _comTWater;
	}

	addComTWater( _comTWater: ComTWaterModel, withBack: boolean = false) {
		const addSubscription = this.service.createComTWater(_comTWater).subscribe(
			res => {
				const message = `New commersil type successfully has been added.`;
				this.layoutUtilsService.showActionNotification(message, MessageType.Create, 5000, true, true);
				const url = `/comTWater`;
				this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
			},
			err => {
				console.error(err);
				const message = 'Error while adding commersil type | ' + err.statusText;
				this.layoutUtilsService.showActionNotification(message, MessageType.Create, 5000, true, false);
			}
		);
		this.subscriptions.push(addSubscription);
	}


	getComponentTitle() {
		let result = 'Create Water Transaction Commercial';
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


	changeMeterPost() {
		const strtpos = this.comTWaterForm.controls.strtpos.value / 1000; 
		if (strtpos !== 0){
			this.comTWaterForm.controls.strtpos2.setValue(
				strtpos);
		} else {
			this.comTWaterForm.controls.strtpos2.setValue(
				0);

		}
		const endpos = this.comTWaterForm.controls.endpos.value / 1000;
		if (endpos !== 0){
			this.comTWaterForm.controls.endpos2.setValue(
				endpos);
		} else {
			this.comTWaterForm.controls.endpos2.setValue(
				0);
			
		}
	}
}
