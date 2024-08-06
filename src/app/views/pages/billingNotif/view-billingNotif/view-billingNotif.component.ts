import { ChangeDetectorRef, Component,Directive, OnDestroy, OnInit, ViewChild,ElementRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators,FormControl, RequiredValidator } from '@angular/forms';
// RxJS
import { BehaviorSubject, Observable, of, Subscription } from 'rxjs';
// NGRX
import { Store, select } from '@ngrx/store';
import { Update } from '@ngrx/entity';
import { AppState } from '../../../../core/reducers';
// Layout
import { SubheaderService, LayoutConfigService } from '../../../../core/_base/layout';
import { LayoutUtilsService, MessageType } from '../../../../core/_base/crud';
import { billingNotifModel } from "../../../../core/billingNotif/billingNotif.model";
import {
	selectLastCreatedbillingNotifId,
	selectbillingNotifActionLoading,
	selectbillingNotifById
} from "../../../../core/billingNotif/billingNotif.selector";
import { billingNotifService } from '../../../../core/billingNotif/billingNotif.service';
import { SelectionModel } from '@angular/cdk/collections';
import { AccountTypeService } from '../../../../core/accountType/accountType.service';
// import { QuerybillingNotifModel } from '../../../../core/billingNotif/queryag.model';
import { OwnershipContractService } from '../../../../core/contract/ownership/ownership.service';
import {QueryUnitModel} from '../../../../core/unit/queryunit.model';
import { UnitService} from '../../../../core/unit/unit.service';
import { MomentDateAdapter } from "@angular/material-moment-adapter";
import {
	DateAdapter,
	MAT_DATE_FORMATS,
	MAT_DATE_LOCALE,
} from "@angular/material";
import * as _moment from "moment";
import { default as _rollupMoment, Moment } from "moment";

const moment = _rollupMoment || _moment;
const MY_FORMATS = {
	parse: {
		dateInput: "DD-MM-YYYY",
	},
	display: {
		dateInput: "DD-MM-YYYY",
		monthYearLabel: "YYYY",
		dateA11yLabel: "LL",
		monthYearA11yLabel: "YYYY",
	},
};
const PERIOD = {
	parse: {
		dateInput: "MM-YYYY",
	},
	display: {
		dateInput: "MM-YYYY",
		monthYearLabel: "YYYY",
		dateA11yLabel: "LL",
		monthYearA11yLabel: "YYYY",
	},
};

@Component({
	selector: 'kt-view-billingNotif',
	templateUrl: './view-billingNotif.component.html',
	styleUrls: ['./view-billingNotif.component.scss'],
	providers: [
		{
			provide: DateAdapter,
			useClass: MomentDateAdapter,
			deps: [MAT_DATE_LOCALE],
		},
		{ provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
	],
})

export class ViewbillingNotifComponent implements OnInit, OnDestroy {
	// Public properties
	billingNotif: any;
	billingNotifId$: Observable<string>;
	oldbillingNotif: billingNotifModel;
	selectedTab = 0;
	loading$: Observable<boolean>;
	billingNotifForm: FormGroup;
	hasFormErrors = false;
	subAcc: boolean = false;
	editMode: boolean = false;
	// Private properties
	private subscriptions: Subscription[] = [];
	private depth = 0;
	loading = {
		accType: false,
		acc: false,
		submited: false,
		load: false,
		loadUnit: false
	}
	typeResult: any[] = [];
	accountResult: any[] = [];
	selection = new SelectionModel<billingNotifModel>(true, []);
	viewUnitResult = new FormControl();
	//unit list
	unitListResultFiltered: any[] = []
	showUnitSelect: boolean = false;
	unitSelection = new SelectionModel<any>(true, []);
	unitRes: any
	unit: any[] = []; // array of unit
	selectedUnit: any[] = []; // array of id unit
	@ViewChild('searchInput', { static: true }) searchInput: ElementRef;
	search = new FormControl()
	page = 0
	selectedIsActive:boolean = false
	selectedType: string = ""
	typeNotifOptions = [
		{viewValue:"Denda",value:"denda"},
		{viewValue:"Tagihan", value:"tagihan"},
		{viewValue:"Khusus", value:"khusus"}

	]
	selectedMonth
	constructor(
		private activatedRoute: ActivatedRoute,
		private router: Router,
		private billingNotifFB: FormBuilder,
		private layoutUtilsService: LayoutUtilsService,
		private store: Store<AppState>,
		private service: billingNotifService,
		private layoutConfigService: LayoutConfigService,
		private cdr: ChangeDetectorRef,
		private unitService: UnitService,
		private ownershipContractService:OwnershipContractService,
	) { }

	ngOnInit() {
		this.loading$ = this.store.pipe(select(selectbillingNotifActionLoading));
		// this.loadUnitList("")
		const routeSubscription = this.activatedRoute.params.subscribe(params => {
			const id = params.id;
			if (id) {
				this.service.findbillingNotifById(id).subscribe(res => {
					if (res) {
						this.billingNotif = res.data;
						this.selectedType = res.data.type_notif
						this.initbillingNotif();
					}
				})
			}
		})
		
	}

	initbillingNotif() {
		this.createForm();
		this.selectedUnit = this.billingNotif.units
		this.cdr.markForCheck()
	}


	createForm() {
		this.billingNotifForm = this.billingNotifFB.group({
			type_notif: [{value:this.billingNotif.type_notif,disabled: true}, Validators.required],
			title:[{value:this.billingNotif.title,disabled: true},Validators.required],
			period:[{value:this.billingNotif.start_period, disabled: true}],
			start_period:[{value:this.billingNotif.start_period, disabled: true},],
			end_period:[{value:this.billingNotif.end_period,disabled:true},],
			description:[{value:this.billingNotif.description,disabled:true}, Validators.required],

		});
		this.cdr.markForCheck()
	}

	goBackWithId() {
		const url = `/access-card`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}

	onSubmit(withBack: boolean = false) {
		this.hasFormErrors = false;
		const controls = this.billingNotifForm.controls;

		if (this.billingNotifForm.invalid) {
			Object.keys(controls).forEach(controlName =>{
				controls[controlName].markAsTouched()
			}
			);

			this.hasFormErrors = true;
			this.selectedTab = 0;
			return;
		}
		this.setLoading('submited', true);

		const editedbillingNotif = this.preparebillingNotif();
		this.addbillingNotif(editedbillingNotif, withBack);
	}

	preparebillingNotif(): any {
		const controls = this.billingNotifForm.controls;
		
		let units = []
		this.selectedUnit.map(item => {
			units.push(item._id)
		})

		if(controls.type_notif.value == "tagihan"){
			let start_period = moment(controls.period.value).startOf("month").add(1,"second" )
			let end_period = moment(controls.period.value).endOf("month")
			
			controls.start_period.setValue(start_period)
			controls.end_period.setValue(end_period)
		}

		const _billingNotif:any = {}
		_billingNotif.type_notif = controls.type_notif.value
		_billingNotif.title = controls.title.value
		_billingNotif.units = units
		_billingNotif.start_period = controls.start_period.value
		_billingNotif.end_period = controls.end_period.value
		_billingNotif.description = controls.description.value
		// _billingNotif.status = controls.status.value
		return _billingNotif;
	}

	addbillingNotif(_billingNotif: billingNotifModel, withBack: boolean = false) {

		const addSubscription = this.service.createbillingNotif(_billingNotif).subscribe(
			res => {
				const message = `New Billing Notification successfully has been added.`;
				this.layoutUtilsService.showActionNotification(message, MessageType.Create, 5000, true, true);
				const url = `/bill-notif`;
				this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
			},
			err => {
				this.setLoading('submited', false);
				const message = 'Error while adding billing notification | ' + err.statusText;
				this.layoutUtilsService.showActionNotification(message, MessageType.Create, 5000, true, false);
			},
			() => {
				this.setLoading('submited', false);
			}
		);
		this.subscriptions.push(addSubscription);
	}


	getComponentTitle() {
		
		let result = `View Notifikasi Billing`;
		return result;
	}

	onAlertClose($event) {
		this.hasFormErrors = false;
	}

	ngOnDestroy() {
		this.subscriptions.forEach(sb => sb.unsubscribe());
	}
	setLoading(type, val) {
		this.loading = {
			...this.loading,
			[type]: val
		}
	}
	_onKeyup(event){
		// this.loadUnitList(event.target.value)
	}

	loadUnitList(body) {
		this.selection.clear();
		this.loading.loadUnit = true
		this.cdr.markForCheck()
		this.service.findUnit(body).subscribe(
			res => {
				this.unitListResultFiltered = res.data
				this.unitRes = res.data
				this.loading.loadUnit = false
				this.cdr.markForCheck();
			err => {
				this.loading.loadUnit = false
				this.cdr.markForCheck()
			}
			});
		
		this.selection.clear();
	}
	_setUnitValue(item){
		let controls = this.billingNotifForm.controls
		controls.unit.setValue(item._id)
		controls.status.setValue("")
	}
	/**
	 * onChangeStatusMeter is a function for hide and display desciption input
	 */
	 onChangeStatus(){
		let controls = this.billingNotifForm.controls
		let status = controls.status.value
		let unit = controls.unit.value
		controls.tenant_name.setValue("")
		if(unit == "" || unit == undefined){
			let message = "Mohon Pilih No Unit"
			this.layoutUtilsService.showActionNotification(message, MessageType.Create, 5000, true, true);
			return;
			
		}
		if(status === "pemilik"){
			this.getOwnershipContract()
		}
	}
	getOwnershipContract(){
		
	}

	selectUnit(unit, e) {
		e.stopPropagation()
		this.selectedUnit.push(unit)
		this._removeUntList(unit._id)
		this.cdr.markForCheck()
	}
	clearAllSelection(e) {
		e.preventDefault();
		this.unitSelection.clear()
		this.page = 0
		this.selectedUnit = []
		this.validateLoadUnit()
		this.cdr.markForCheck()
	}
	onChange(e) {
		this.search.setValue(e.target.value)
		// this.loadUnitList("")
	}

	_filterUntList() {
		let unt = []
		if (this.selectedUnit.length > 0) {
			this.selectedUnit.map((i, index) => {
				let tempUnt = this.unitRes.filter(unit => {
					if (i._id != unit._id) {
						return unit
					}
				})
				this.unitRes = tempUnt
			})
			this.cdr.markForCheck()

		} else {
			this.unitRes = this.unit
			this.cdr.markForCheck()
		}
	}
	_deleteUntList(unit) {
		this.selectedUnit = this.selectedUnit.filter(i => {
			if (i._id != unit._id) return i;
		})
		this.unitRes.push(unit)
		this.unitRes.sort()
		this.cdr.markForCheck()
	}
	_removeUntList(id) {
		this.unitRes = this.unitRes.filter(i => {
			if (i._id != id) return i;
		})
	}
	isAllSelected() {
		const numSelected = this.unitSelection.selected.length;
		const numRows = this.unit.length;
		// return numSelected === numRows;
		return false;
	}
	masterToggle() {

		if (this.isAllSelected()) {
			this.unitSelection.clear()
			this.unitRes = this.selectedUnit
			this.selectedUnit = []

			this.cdr.markForCheck()
		} else {
			this.unitSelection.clear()
			this.unitRes.map((col) => {
				this.unitSelection.select(col)
				this.selectedUnit.push(col)
			})

			this.page++
			// this.loadUnitList("")
			this.unitRes = []
			this.cdr.markForCheck()
		}
	}
	chosenMonthHandler(normlizedMonth, datepicker) {
		const controls = this.billingNotifForm.controls
        var tempDate = JSON.stringify(normlizedMonth).replace("\"",'').split("-")
        var month = parseInt(tempDate[1])
        var year = month == 12?parseInt(tempDate[0])+1:parseInt(tempDate[0])
        var year = month == 12?parseInt(tempDate[0])+1:parseInt(tempDate[0])
        month = month == 12?1:month+1;
        this.selectedMonth = new Date(year + "-" + month)
		controls.period.setValue(this.selectedMonth)
		this.validateLoadUnit()
        datepicker.close();
      }
	changeType(value){
		const controls = this.billingNotifForm.controls
		if(this.selectedType == "tagihan"){
			this.billingNotifForm.reset()
			controls.type_notif.setValue(value)
			controls.start_period.setValue(undefined)
			controls.end_period.setValue(undefined)
			controls.start_period.clearValidators()
			controls.end_period.clearValidators()
			controls.period.setValidators([Validators.required])
			controls.start_period.updateValueAndValidity()
			controls.end_period.updateValueAndValidity()
			controls.period.updateValueAndValidity()

		}
		if(this.selectedType != "tagihan"){
			this.billingNotifForm.reset()
			controls.type_notif.setValue(value)
			controls.period.setValue(undefined)
			controls.start_period.setValidators([Validators.required])
			controls.end_period.setValidators([Validators.required])
			controls.period.clearValidators()
			controls.start_period.updateValueAndValidity()
			controls.end_period.updateValueAndValidity()
			controls.period.updateValueAndValidity()
		}
	}
	validateLoadUnit(){
		const controls = this.billingNotifForm.controls
		let start_period = controls.start_period.value
		let end_period = controls.end_period.value
		if(this.selectedType == "tagihan"){
			start_period = controls.period.value
			end_period = controls.period.value
		}
		let body = {
			type_notif: this.selectedType,
			start_period: start_period,
			end_period: end_period
		}
		if(body.type_notif == ""){
			return false
		}
		if(!body.start_period){
			return false
		}
		if(!body.end_period){
			return false
		}
		this.loadUnitList(body)			
	}
}
@Directive({
	selector: '[period]',
	providers: [
	  {provide: MAT_DATE_FORMATS, useValue: PERIOD},
	],
  })
export class CustomDateFormat1 {}
