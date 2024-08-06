import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators,FormControl } from '@angular/forms';
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
moment.locale("id")
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
@Component({
	selector: 'kt-edit-billingNotif',
	templateUrl: './edit-billingNotif.component.html',
	styleUrls: ['./edit-billingNotif.component.scss'],
	providers: [
		{
			provide: DateAdapter,
			useClass: MomentDateAdapter,
			deps: [MAT_DATE_LOCALE],
		},
		{ provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
	],
})
export class EditbillingNotifComponent implements OnInit, OnDestroy {
	// Public properties
	billingNotif: billingNotifModel;
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
	}
	typeResult: any[] = [];
	accountResult: any[] = [];
	selection = new SelectionModel<billingNotifModel>(true, []);
	viewUnitResult = new FormControl();
	unitListResultFiltered
	status = [
		"pemilik",
		"penyewa"
	]
	selectedStatus: string
	selectedIsActive:boolean = true
	isActiveOptions = [
		{viewValue:"Aktif",value:true},
		{viewValue:"Tidak Aktif", value:false}
	]
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
		const routeSubscription = this.activatedRoute.params.subscribe(params => {
			const id = params.id;
			if (id) {
				this.store.pipe(select(selectbillingNotifById(id))).subscribe(res => {
					if (res) {
						// this.loadUnitList("")
						this.billingNotif = res
						this.selectedStatus = res.status
						// this.selectedIsActive = res.isActive
						this.initbillingNotif();
						this.loading.load = true
						this.cdr.markForCheck()
					}
				});
			}
		})
		
	}

	initbillingNotif() {
		this.createForm();
	}


	createForm() {
		let received = false
		// if(this.billingNotif.handover_date && this.billingNotif.receiver_name && this.billingNotif.receiver_phone){
		// 	received = true
		// }
		this.billingNotifForm = this.billingNotifFB.group({
			// serial_number: [{value:this.billingNotif.serial_number,disabled:true}],
			// unit:[{value: this.billingNotif.unit._id, disabled:true},Validators.required],
			// isActive:[{value:this.billingNotif.isActive,disabled:false},Validators.required],
			// status:[{value:this.billingNotif.status, disabled:true},Validators.required],
			// tenant_name:[{value:this.billingNotif.tenant_name,disabled:true},Validators.required],
			// created_date:[{value:moment(this.billingNotif.created_date),disabled:true}, Validators.required],
			// handover_date:[{value:this.billingNotif.handover_date ? this.billingNotif.handover_date : "",disabled: received },Validators.required],
			// receiver_name:[{value:this.billingNotif.receiver_name ? this.billingNotif.receiver_name : "", disabled:  received },Validators.required],
			// receiver_phone:[{value:this.billingNotif.receiver_phone ? this.billingNotif.receiver_phone : "", disabled:  received },Validators.required]

		});
		// this.viewUnitResult.setValue(this.billingNotif.unit.cdunt)
		this.viewUnitResult.disable()
	}

	goBackWithId() {
		const url = `/access-card`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}

	onSubmit(withBack: boolean = false) {
		this.hasFormErrors = false;
		const controls = this.billingNotifForm.controls;
		/** check form */
		if(controls.unit.value == "" || controls.unit.value == undefined){
			let message = "Mohon Pilih No Unit"
			this.layoutUtilsService.showActionNotification(message, MessageType.Create, 5000, true, true);
			return;
		}
		if (this.billingNotifForm.invalid) {
			Object.keys(controls).forEach(controlName =>
				controls[controlName].markAsTouched()
			);

			this.hasFormErrors = true;
			this.selectedTab = 0;
			return;
		}

		this.setLoading('submited', true);

		const editedbillingNotif = this.preparebillingNotif();
		this.editbillingNotif(editedbillingNotif, withBack);
	}

	preparebillingNotif(): any {
		const controls = this.billingNotifForm.controls;
		const _billingNotif:any = {}
		_billingNotif._id = this.billingNotif._id
		_billingNotif.serial_number = controls.serial_number.value
		_billingNotif.unit = controls.unit.value
		_billingNotif.isActive = controls.isActive.value
		_billingNotif.status = controls.status.value
		_billingNotif.handover_date = controls.handover_date.value
		_billingNotif.receiver_name = controls.receiver_name.value
		_billingNotif.receiver_phone = controls.receiver_phone.value
		return _billingNotif;
	}

	editbillingNotif(_billingNotif: billingNotifModel, withBack: boolean = false) {

		const editSubscription = this.service.updatebillingNotif(_billingNotif).subscribe(
			res => {
				const message = `Access Card successfully has been edited.`;
				this.layoutUtilsService.showActionNotification(message, MessageType.Create, 5000, true, true);
				const url = `/access-card`;
				this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
			},
			err => {
				this.setLoading('submited', false);
				const message = 'Error while editing account group | ' + err.statusText;
				this.layoutUtilsService.showActionNotification(message, MessageType.Create, 5000, true, false);
			},
			() => {
				this.setLoading('submited', false);
			}
		);
		this.subscriptions.push(editSubscription);
	}


	getComponentTitle() {
		let result = 'Edit Access Card';
		if (!this.billingNotif || !this.billingNotif._id) {
			return result;
		}

		result = `Edit Account`;
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
		this.loadUnitList(event.target.value)
	}

	loadUnitList(text) {
		this.selection.clear();
		let filter = {
			cdunt:text
		}
		const queryParams = new QueryUnitModel(
			filter,
			null,
			null,
			1,
			10
		);
		// this.store.dispatch(new Unit({ page: queryParams }));
		this.unitService.getListUnit(queryParams).subscribe(
			res => {
				this.unitListResultFiltered = res.data
				this.cdr.markForCheck();
			});
		
		this.selection.clear();
	}
	_setUnitValue(item){
		let controls = this.billingNotifForm.controls
		controls.unit.setValue(item._id)
		controls.status.setValue("")
	}
	
}
