
import { Component, OnInit, OnDestroy, ChangeDetectorRef, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormControl, FormGroup, Validators, } from '@angular/forms';
import { Observable, Subscription } from 'rxjs';
import { Store, select } from '@ngrx/store';
import { AppState } from '../../../../core/reducers';
import { SubheaderService, LayoutConfigService } from '../../../../core/_base/layout';
import { LayoutUtilsService, MessageType, } from '../../../../core/_base/crud';
import {
	selectBillingActionLoading,
	selectBillingById
} from "../../../../core/billingUpd/billing.selector";
import { BillingModel } from '../../../../core/billingUpd/billing.model';
import { BillingService } from '../../../../core/billingUpd/billing.service';
import { SelectionModel } from "@angular/cdk/collections";
import * as _moment from 'moment';
import { default as _rollupMoment, Moment } from 'moment';
import { CustomerService } from '../../../../core/customer/customer.service';
import { UnitService } from '../../../../core/unit/unit.service';
import { QueryUnitModel } from '../../../../core/unit/queryunit.model';
import { PowerTransactionService } from '../../../../core/power/transaction/transaction.service';
import { WaterTransactionService } from '../../../../core/water/transaction/transaction.service';
import { QueryAccountBankModel } from '../../../../core/masterData/bank/accountBank/queryaccountBank.model';
import { AccountBankService } from '../../../../core/masterData/bank/accountBank/accountBank.service';
import { PowerMeterService } from '../../../../core/power';
import { WaterMeterService } from '../../../../core/water/meter/meter.service';
import { environment } from '../../../../../environments/environment'
import { HttpClient } from '@angular/common/http';
import { ServiceFormat } from '../../../../core/serviceFormat/serviceFormat';
const moment = _rollupMoment || _moment;
import { AccountGroupService } from '../../../../core/accountGroup/accountGroup.service';
import { VoidBillService } from '../../../../core/void/voidBill/voidBill.service';
import { MatDialog } from '@angular/material';



@Component({
	selector: 'kt-view-voidbilling',
	templateUrl: './view-voidbilling.component.html',
	styleUrls: ['./view-voidbilling.component.scss']
})
export class ViewVoidBillingComponent implements OnInit, OnDestroy {
	billdelForm: FormGroup;
	loading$: Observable<boolean>;


	// Upload Image (new) START
	images: any[] = []
	myFiles: any[] = []
	@ViewChild('fileInput', { static: false }) fileInputEl: ElementRef;
	// Upload Image (new) END

	hasFormErrors = false;
	dataGetLocal = localStorage.getItem("currentUser");
	dataUser = JSON.parse(this.dataGetLocal);

	isGenerateBilling: string = "" /* To determine the condition of the generating billing process in progress */
	msgErrorGenerate: string = "" /* To display message error proccessing generate */
	idVoidBilling: string = ""

	loadingData = {
		paidTo: false,
	};
	viewBankResult = new FormControl()
	// Private properties

	prevTotalBillLeft: number = 0;
	originalBill: number = 0;
	prevBilling: []
	private subscriptions: Subscription[] = [];
	constructor(
		private activatedRoute: ActivatedRoute,
		private store: Store<AppState>,
		private serviceBill: BillingService,
		private serviceUnit: UnitService,
		private bservice: AccountBankService,
		private coaService: AccountGroupService,
		private http: HttpClient,
		private delBillFB: FormBuilder,
		private cdr: ChangeDetectorRef,
		private service: VoidBillService,
		private layoutUtilsService: LayoutUtilsService,
		private dialog: MatDialog,
		private router: Router,

	) { }

	voidBillNum: string = ""
	dataBilling: BillingModel
	displayUtilityAdmin: boolean = false


	ngOnInit() {
		this.loading$ = this.store.pipe(select(selectBillingActionLoading));
		const routeSubscription = this.activatedRoute.params.subscribe(params => {
			const id = params.id;
			this.initBilling()
			if (id) {
				this.serviceBill.getBillingByID(id).subscribe(res => {
					if (res) {
						this.dataBilling = res.data
						this.idVoidBilling = id
					}
				});
			}
		});
		this.subscriptions.push(routeSubscription);
	}
	initBilling() {
		this.createForm()
		this.cdr.markForCheck();
	}

	ngOnDestroy() {
		this.subscriptions.forEach(sb => sb.unsubscribe());
	}


	closePopUp() {
	}


	createForm() {
		this.billdelForm = this.delBillFB.group({
			reasonDel: [{ value: "", disabled: false }, Validators.required],
			descriptionDelete: [{ value: "", disabled: false }, Validators.required],
			attachment: [{ value: "", disabled: false }],
		});
	}

	// Upload Image (new) START
	selectFileUpload(e) {
		const files = (e.target as HTMLInputElement).files;

		if (files.length > 1 || this.myFiles.length >= 1 || this.images.length >= 1) {
			this.fileInputEl.nativeElement.value = "";
			const message = `Only 1 images are allowed to select`;
			this.layoutUtilsService.showActionNotification(message, MessageType.Create, 5000, true, true);

			return
		}

		for (let i = 0; i < files.length; i++) {
			// Skip uploading if file is already selected
			const alreadyIn = this.myFiles.filter(tFile => tFile.name === files[i].name).length > 0;
			if (alreadyIn) continue;

			this.myFiles.push(files[i]);

			const reader = new FileReader();
			reader.onload = () => {
				this.images.push({ name: files[i].name, url: reader.result });
				this.cdr.markForCheck();
			}
			reader.readAsDataURL(files[i]);
		}
	}

	clearSelection() {
		this.myFiles = [];
		this.images = [];
		this.fileInputEl.nativeElement.value = "";
		this.cdr.markForCheck();
	}

	removeSelectedFile(item) {
		this.myFiles = this.myFiles.filter(i => i.name !== item.name);
		this.images = this.images.filter(i => i.url !== item.url);
		this.fileInputEl.nativeElement.value = "";

		this.cdr.markForCheck();
	}
	// Upload Image (new) END

	closed() {
		const url = `/billing`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}

	closedNoSure() {
		this.dialog.closeAll()
	}

	/** Pop Up validateDelete
	 * This is a popup for the progress of generating billing
	 */
	validateDelete(content) {
		const controls = this.billdelForm.controls
		if (this.billdelForm.invalid) {
			Object.keys(controls).forEach(controlName => controls[controlName].markAsTouched());

			this.hasFormErrors = true;
			return;
		}

		this.dialog.open(content, {
			data: {
				input: ""
			},
			maxWidth: "300px",
			minHeight: "150px",
			disableClose: false
		});
	}

	onAlertClose($event) {
		this.hasFormErrors = false;
	}

	/** 
	 * clickDeleted
	 */
	clickDeleted() {
		const controls = this.billdelForm.controls
		const reasonDel = controls.reasonDel.value
		const descriptionDelete = controls.descriptionDelete.value
		const attachment = this.myFiles
		const dataSend = { ...this.dataBilling, reasonDel, descriptionDelete, attachment, updateBy: this.dataUser.id }

		if (reasonDel === "copd" && this.myFiles.length === 0) {
			const message = `Select image attachment!`;
			this.layoutUtilsService.showActionNotification(message, MessageType.Create, 5000, true, true);

			return
		}



		this.service.deleteBillVoid(dataSend).subscribe(
			res => {
				const message = `Charge cleared successfully, check your bill`;
				this.layoutUtilsService.showActionNotification(message, MessageType.Create, 5000, true, true);
				const url = `/billing`;
				this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
				this.dialog.closeAll()
			},
			err => {
				console.error(err)
				const message = `Error delete void billing`;
				this.layoutUtilsService.showActionNotification(message, MessageType.Create, 5000, true, true);

				this.dialog.closeAll()
			}
		)
	}

}
