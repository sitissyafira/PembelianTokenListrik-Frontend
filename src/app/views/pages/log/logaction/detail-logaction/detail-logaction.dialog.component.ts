import { Component, OnInit, Inject, ChangeDetectionStrategy, ViewEncapsulation, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
// Material
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
// RxJS
import { Subscription, of } from 'rxjs';
// NGRX
import { Store, select } from '@ngrx/store';
// State
import { AppState } from '../../../../../core/reducers';
// CRUD
import { LogactionModel } from '../../../../../core/logaction/logaction.model';
import { selectLogactionActionLoading } from '../../../../../core/logaction/logaction.selector';
// Services and Models
import moment from 'moment';
import { environment } from '../../../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { SubdefectService } from '../../../../../core/subdefect/subdefect.service';
import { ModuleTicketing } from '../../../../../core/ticket/module/moduleservice';
import { AuthService } from '../../../../../core/auth/_services';
@Component({
	selector: 'kt-detail-logaction-dialog',
	templateUrl: './detail-logaction.dialog.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
	encapsulation: ViewEncapsulation.None
})
export class DetailLogactionDialogComponent implements OnInit, OnDestroy {
	// Public properties
	logaction: LogactionModel;
	datanya: any;
	viewLoading = false;
	
	subDefectDetail :any;
	user = {
		before:null,
		after: null
	}

	CreateMasterUnit: boolean = false;
	CreateMasterUnitType: boolean = false;
	CreateMasterUnitRate: boolean = false;
	CreateOwnership: boolean = false;
	CreateBilling: boolean = false;
	GenerateBilling: boolean = false;
	CreateConsumptionWater: boolean = false;
	CreateConsumptionPower: boolean = false;
	CreateTicket: boolean = false;

	DeleteMasterUnit: boolean = false;
	DeleteMasterUnitType: boolean = false;
	DeleteMasterUnitRate: boolean = false;
	DeleteOwnership: boolean = false;
	DeleteBilling: boolean = false;
	DeleteConsumptionWater: boolean = false;
	DeleteConsumptionPower: boolean = false;
	DeleteTicket: boolean = false

	UpdateMasterUnit: boolean = false;
	UpdateMasterUnitType: boolean = false;
	UpdateMasterUnitRate: boolean = false;
	UpdateOwnership: boolean = false;
	PaidBillingFullPayment: boolean = false;
	UpdateBilling: boolean = false;
	UpdateConsumptionWater: boolean = false;
	UpdateConsumptionPower: boolean = false;
	UpdateTicket: boolean = false;
	  // Private properties
	  private componentSubscriptions: Subscription;

	  /**
	   * Component constructor
	   *
	   * @param dialogRef: MatDialogRef<OwnershipDetailDialogComponent>
	   * @param data: any
	   * @param fb: FormBuilder
	   * @param store: Store<AppState>
	   * @param typesUtilsService: TypesUtilsService
	   */
	  constructor(
	  public dialogRef: MatDialogRef<DetailLogactionDialogComponent>,
	  @Inject(MAT_DIALOG_DATA) public data: any,
	  private store: Store<AppState>,
	  private http: HttpClient,
	  private auth: AuthService,
	  private subdefectService: SubdefectService,
	  private moduleTicketing: ModuleTicketing,
	  private cdr: ChangeDetectorRef,
	  // private typesUtilsService: TypesUtilsService
	) { }

 	/**
	 * @ Lifecycle sequences => https://angular.io/guide/lifecycle-hooks
	 */

	/**
	 * On init
	 */
	ngOnInit() {
		this.store.pipe(select(selectLogactionActionLoading)).subscribe(res => this.viewLoading = res);
		this.logaction = this.data.logaction;

		switch (this.logaction.log_task) {
			case "Create Master Unit": 	this.CreateMasterUnit = true;
										break;
			case "Create Master Unit Type": this.CreateMasterUnitType = true;
											break;
			case "Create Master Unit Rate": this.CreateMasterUnitRate = true;
											break;
			case "Create Ownership": 	this.CreateOwnership = true;
										break;
			case "Create Billing": 	this.CreateBilling = true;
									break;
			case "Generate Billing": 	this.GenerateBilling = true;
										break;
			case "Create Consumption Water": 	this.CreateConsumptionWater = true;
												break;
			case "Create Consumption Power": 	this.CreateConsumptionPower = true;
												break;
			case "Create Ticket": 	this.CreateTicket = true;
									this.getSubDefect(this.data.logaction.log_after.subDefect);
									break;

			case "Delete Master Unit": 	this.DeleteMasterUnit = true;
										break;
			case "Delete Master Unit Type": this.DeleteMasterUnitType = true;
											break;
			case "Delete Master Unit Rate": this.DeleteMasterUnitRate = true;
											break;
			case "Delete Ownership": 	this.DeleteOwnership = true;
										break;
			case "Delete Billing": 	this.DeleteBilling = true;
									break;
			case "Delete Consumption Water": 	this.DeleteConsumptionWater = true;
												break;
			case "Delete Consumption Power": 	this.DeleteConsumptionPower = true;
												break;
			case "Delete Ticket": 	this.DeleteTicket = true;
									this.getSubDefect(this.data.logaction.log_after.subDefect);
									this.cdr.markForCheck()
									break;
			case "Update Master Unit": 	this.UpdateMasterUnit = true;
										break;
			case "Update Master Unit Type": this.UpdateMasterUnitType = true;
											break;
			case "Update Master Unit Rate": this.UpdateMasterUnitRate = true;
											break;
			case "Update Ownership": 	this.UpdateOwnership = true;
										break;
			case "Paid Billing Full Payment":	if (this.data.logaction.log_after.bank) {
													this.acctBank(this.data.logaction.log_after.bank)
												};
												this.PaidBillingFullPayment = true;
												break;
			case "Paid Billing Bayar Lebih": 	if (this.data.logaction.log_after.bank) {
														this.acctBank(this.data.logaction.log_after.bank)
												};
												this.PaidBillingFullPayment = true;
												break;
			case "Paid Billing Bayar Kurang":   if (this.data.logaction.log_after.bank) {
													this.acctBank(this.data.logaction.log_after.bank)
												};
												this.PaidBillingFullPayment = true;
												break;
			case "Paid Billing Custom":	if (this.data.logaction.log_after.bank) {
											this.acctBank(this.data.logaction.log_after.bank)
										};
										this.PaidBillingFullPayment = true;
										break;
			case "Update Billing": 	this.UpdateBilling = true;
									break;
			case "Update Consumption Water": 	this.UpdateConsumptionWater = true;
												break;
			case "Update Consumption Power": 	this.UpdateConsumptionPower = true;
												break;
			case "Update Ticket": 	this.UpdateTicket = true;
									this.getSubDefect(this.data.logaction.log_before.subDefect);
									this.getUser(this.data.logaction.log_before.updatedBy,'before')
									this.getUser(this.data.logaction.log_after.updatedBy,'after')
									this.cdr.markForCheck()
										break
			
		}




	}

	ngOnDestroy() {
			if (this.componentSubscriptions) {
				this.componentSubscriptions.unsubscribe();
			}
	}

	async acctBank(id) {
		const API_ACCTBANK_URL = `${environment.baseAPI}/api/acct`;
		this.http
				.get(`${API_ACCTBANK_URL}/${id}`, {
					responseType: "json",
				})
				.subscribe(
					(response) => {
						console.log(response)
						this.datanya = response;
						console.log(this.datanya,'dialog')

					},
					(e) => {
						console.error(e);
					}
				);
	}
	
	async getSubDefect(id){
		this.subdefectService.findSubdefectById(id).subscribe(
			(response)=>{
				this.subDefectDetail = response.data;
				this.cdr.markForCheck()
			},
			(e) => {
				console.error(e)
			}
			
		)
	}
	async getUser(id,target){
		this.auth.findUserById(id).subscribe(res => {
			this.user[target] = res.data;
			this.cdr.markForCheck()
		});
	}
}
