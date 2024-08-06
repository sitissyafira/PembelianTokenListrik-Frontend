import { Component, OnInit, OnDestroy, ChangeDetectorRef, ViewChild, ElementRef } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import {
	FormBuilder,
	FormControl,
	FormGroup,
	Validators,
} from "@angular/forms";
import { Observable, Subscription } from "rxjs";
import { Store, select } from "@ngrx/store";
import { AppState } from "../../../../../core/reducers";
import {
	SubheaderService,
	LayoutConfigService,
} from "../../../../../core/_base/layout";
import {
	LayoutUtilsService,
	MessageType,
} from "../../../../../core/_base/crud";
import {
	selectPowerTransactionActionLoading,
	selectPowerTransactionById,
} from "../../../../../core/power/transaction/transaction.selector";
import { PowerTransactionModel } from "../../../../../core/power/transaction/transaction.model";
import { PowerMeterService } from "../../../../../core/power/meter/meter.service";
import { SelectionModel } from "@angular/cdk/collections";
import { QueryPowerMeterModel } from "../../../../../core/power/meter/querymeter.model";
import * as _moment from "moment";
import { default as _rollupMoment, } from "moment";
import { PowerTransactionService } from '../../../../../core/power/transaction/transaction.service';
import { LeaseContractService } from '../../../../../core/contract/lease/lease.service';
import { OwnershipContractService } from '../../../../../core/contract/ownership/ownership.service';
import { UploadFileService } from '../../../../../core/power/transaction/upload-file.service';
import { HttpEventType, HttpResponse } from '@angular/common/http';
import { finalize } from "rxjs/operators";
import { MatDialog } from "@angular/material";
import { ConfirmationDialog } from "../../../../partials/module/confirmation-popup/confirmation.dialog.component";

const moment = _rollupMoment || _moment;

@Component({
	selector: "kt-add-transaction",
	templateUrl: "./add-transaction.component.html",
	styleUrls: ["./add-transaction.component.scss"],
})
export class AddTransactionComponent implements OnInit, OnDestroy {
	powerTransaction: PowerTransactionModel;
	powerTransactionId$: Observable<string>;
	oldPowerTransaction: PowerTransactionModel;
	selectedTab = 0;
	lastdata: any;
	unit: string;
	type: string;
	status: any;
	loading$: Observable<boolean>;
	powerTransactionForm: FormGroup;
	hasFormErrors = false;

	hasFormErrorsImage: boolean = false;
	messageErrorImage: string = ""


	powerTransactionResult: any[] = [];
	powerMeter: any[] = [];
	date = new FormControl(moment());
	date1 = new FormControl(new Date());
	serializedDate = new FormControl((new Date()).toISOString());
	duedate = new FormControl();
	selection = new SelectionModel<PowerTransactionModel>(true, []);
	checker: boolean;
	loading: boolean = false;

	loading1 = {
		deposit: false,
		submit: false,
		glaccount: false,
	};

	powerListResultFiltered = [];
	viewPowerMeterResult = new FormControl();

	selectedFiles: FileList;
	currentFile: File;
	message = '';
	isUpload: boolean = false
	url = '';
	imageSrc: string;

	fileName = '';
	uploadProgress: number;
	uploadSub: Subscription;



	private loadingData = {
		Meter: false,
	}

	// Upload Image (new) START
	@ViewChild('fileInput', { static: false }) fileInputEl: ElementRef;
	images: any[] = []
	myFiles: any[] = []
	// Upload Image (new) END



	// Private properties
	private subscriptions: Subscription[] = [];
	constructor(
		private activatedRoute: ActivatedRoute,
		private router: Router,
		private powerTransactionFB: FormBuilder,
		private subheaderService: SubheaderService,
		private layoutUtilsService: LayoutUtilsService,
		private store: Store<AppState>,
		private ownerService: OwnershipContractService,
		private tenantService: LeaseContractService,
		private service: PowerTransactionService,
		private servicePowerMeter: PowerMeterService,
		private layoutConfigService: LayoutConfigService,
		private cd: ChangeDetectorRef,
		private uploadService: UploadFileService,
		private dialog: MatDialog
	) { }

	ngOnInit() {
		this.loading$ = this.store.pipe(
			select(selectPowerTransactionActionLoading)
		);
		const routeSubscription = this.activatedRoute.params.subscribe(
			(params) => {
				{
					this.powerTransaction = new PowerTransactionModel();
					this.powerTransaction.clear();
					this.initPowerTransaction();
				}
			}
		);
		this.subscriptions.push(routeSubscription);
	}
	initPowerTransaction() {
		this.createForm();
		this.loadMeterList("");
	}

	createForm() {
		this.powerTransactionForm = this.powerTransactionFB.group({
			pow: ["", Validators.required],
			rate: [{ value: "", disabled: true }, Validators.required],
			strtpos: ["", Validators.required],
			endpos: ["", Validators.required],
			strtpos2: [{ value: "", disabled: true }],
			endpos2: [{ value: "", disabled: true }],
			billmnt: [{ value: this.date1.value, disabled: false }, Validators.required],
			loss: [{ value: "0", disabled: false }, Validators.required],
			checker: [""],
			powname: [""],
			unit: [""],
			urlmeter: [""],
			cons: [""],
		});
	}
	goBackWithId() {
		const url = `/power-management/power/transaction`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}
	refreshPowerTransaction(isNew: boolean = false, id: string = "") {
		let url = this.router.url;
		if (!isNew) {
			this.router.navigate([url], { relativeTo: this.activatedRoute });
			return;
		}

		url = `/power-management/power/transaction/edit/${id}`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}

	onSubmit(withBack: boolean = false) {
		this.hasFormErrors = false;
		const controls = this.powerTransactionForm.controls;

		if (!controls.urlmeter.value) {
			const message = `Image is Required !!`;
			this.layoutUtilsService.showActionNotification(message, MessageType.Create, 5000, true, true);
			return;
		}


		if (
			this.powerTransactionForm.controls.endpos.value <
			this.powerTransactionForm.controls.strtpos.value
		) {
			const message = `Value last meter can't be smaller`;
			this.layoutUtilsService.showActionNotification(
				message,
				MessageType.Create,
				5000,
				true,
				true
			);

			return;
		}

		if (this.selectedFiles && !this.isUpload) {
			const message = `Upload your image file`;
			this.layoutUtilsService.showActionNotification(message, MessageType.Create, 5000, true, true);

			return
		}

		if (this.powerTransactionForm.invalid) {
			Object.keys(controls).forEach((controlName) =>
				controls[controlName].markAsTouched()
			);

			this.hasFormErrors = true;
			this.selectedTab = 0;
			return;
		}

		// this.loading = true; 
		const editedPowerTransaction = this.preparePowerTransaction();
		if (this.hasFormErrorsImage) {
			this.loading = false
			return
		}
		const dialogRef = this.dialog.open(
			ConfirmationDialog,
			{
				data: {
					event: 'confirmation',
					title: "Save",
					subTitle: "Are you sure the data is correct?"
				},
				width: '300px',
				disableClose: true
			}
		);
		dialogRef.afterClosed().subscribe((result) => {
			console.log(result)
			if (result == true) {
				this.loading1.submit = true;
				this.addPowerTransaction(editedPowerTransaction, withBack);
			} else {
				return;
			}
		});
		// Condition TO upload Image END
	}

	preparePowerTransaction(): PowerTransactionModel {
		const controls = this.powerTransactionForm.controls;
		const _powerTransaction = new PowerTransactionModel();
		_powerTransaction.clear();
		_powerTransaction._id = this.powerTransaction._id;
		_powerTransaction.pow = controls.pow.value;
		_powerTransaction.strtpos = controls.strtpos.value;
		_powerTransaction.endpos = controls.endpos.value;
		_powerTransaction.strtpos2 = controls.strtpos2.value;
		_powerTransaction.endpos2 = controls.endpos2.value;
		_powerTransaction.billmnt = controls.billmnt.value;
		_powerTransaction.loss = controls.loss.value;
		_powerTransaction.unit = controls.unit.value.toLowerCase();
		_powerTransaction.checker = controls.checker.value;
		_powerTransaction.powname = controls.powname.value.toLowerCase();
		_powerTransaction.urlmeter = controls.urlmeter.value;

		return _powerTransaction;
	}


	addPowerTransaction(_powerTransaction: PowerTransactionModel, withBack: boolean = false) {
		const addSubscription = this.service.createPowerTransaction(_powerTransaction).subscribe(
			(res) => {
				const message = `New powerconsumption successfully has been added.`;
				this.layoutUtilsService.showActionNotification(message, MessageType.Create, 5000, true, true);

				if (_powerTransaction.checker != true) {
					const url = `/power-management/power/transaction/new`;
					this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
				} else {
					const url2 = `/power-management/power/transaction`;
					this.router.navigateByUrl(url2, { relativeTo: this.activatedRoute });
				}

			},
			(err) => {
				console.error(err);
				const message = "Error while adding powerconsumption | " + err.statusText;
				this.layoutUtilsService.showActionNotification(message, MessageType.Create, 5000, true, false);
			}
		);
		this.subscriptions.push(addSubscription);
	}

	getComponentTitle() {
		let result = "Create Electricity Consumption ";
		return result;
	}
	onAlertClose($event) {
		this.hasFormErrors = false;
	}
	onAlertCloseImage($event) {
		this.hasFormErrorsImage = false;
	}

	/**
	* @param value
	*/
	_setPowerValue(value) {
		const controls = this.powerTransactionForm.controls
		controls.pow.setValue(value._id)
		this.getChangePowerMeter(value._id); /* This new layouting function (new) */
		// this.changePowerMeter(value._id); /* This  function (old) */
	}

	_onKeyup(e: any) {
		this._filterPowerList(e.target.value);
	}

	_filterPowerList(text: string) {
		// this.powerListResultFiltered = this.powerMeter.filter(i => {
		// 	const filterText = `${i.nmmtr} - ${i.unit.toLocaleLowerCase()}`;
		// 	if (filterText.includes(text.toLocaleLowerCase())) return i;

		// });
		this.loadMeterList(text)
	}

	checkConsumption() { // fungsi untuk menentukan nilai consumption (last meter dikurangi Start Meter)
		const controls = this.powerTransactionForm.controls
		const start2 = controls.strtpos2.value
		const end2 = controls.endpos2.value

		if (start2 === 0 || end2 === 0) {
			controls.cons.setValue("")
			return
		}


		if (start2 && end2) {
			const dataKwh = (end2 - start2).toFixed(1)
			const kwh = parseFloat(dataKwh)
			controls.cons.setValue(kwh)
			this.cd.markForCheck()
		}
	}

	// /** This Function Load Meter, From New Layouting!! (new)
	//  * @param text Search filter handled by Back-end
	//  */
	loadMeterList(text) {
		this.loadingData.Meter = true
		this.selection.clear();
		const queryParams = {
			input: text
		}

		this.servicePowerMeter.getListPowerMeterforTr(queryParams).subscribe((res) => {
			this.powerMeter = res.data;
			this.powerListResultFiltered = res.data
			this.cd.markForCheck();
			this.viewPowerMeterResult.enable();
			this.loadingData.Meter = false
		});
	}

	/**
	 * This Function Load Meter (old)
	 * @param text Search filter unit by Backend
	 */
	// loadMeterList(text) {
	// 	this.loadingData.Meter = true;
	// 	this.selection.clear();
	// 	const queryParams = {
	// 		filter: text
	// 	}
	// 	this.servicePowerMeter
	// 		.getListPowerMeterforTr(queryParams)
	// 		.subscribe((res) => {
	// 			this.powerMeter = res.data;
	// 			this.powerListResultFiltered = this.powerMeter.slice();
	// 			this.cd.markForCheck();
	// 			this.viewPowerMeterResult.enable();
	// 			this.loadingData.Meter = false;
	// 		});
	// }

	// Handle Billing Date
	billDate(event) {
		const controls = this.powerTransactionForm.controls
		controls.billmnt.setValue(event.target.value)

		// Kosongkan jika milih tanggal
		controls.rate.setValue("") // rate
		controls.powname.setValue("") // powname
		controls.unit.setValue("") // unit
		controls.strtpos.setValue("") // strtpos
		controls.strtpos2.setValue("") // strtpos2
		this.viewPowerMeterResult.setValue("") // Select Power Meter
		controls.endpos.setValue("") // endpos
		controls.endpos2.setValue("") // endpos2
		controls.cons.setValue("") // consumption

		this.loadMeterList("")
	}

	// New API
	getChangePowerMeter(id) { //# get Consumption Start Meter ( NEW, dihandle dari BE)
		const controls = this.powerTransactionForm.controls
		const mPowId = id
		const consumDate = controls.billmnt.value
		const queryParams = { mPowId, consumDate }
		this.servicePowerMeter.getLastConsumptionPower(queryParams).subscribe(
			res => {
				if (res.data.pow) {
					controls.rate.setValue(res.data.pow.rte.rte) // rate
					controls.powname.setValue(res.data.pow.nmmtr) // powname
					controls.unit.setValue(res.data.unit) // unit
					controls.strtpos.setValue(res.data.endpos) // strtpos
					// get startpos2
					const getStartpos2 = res.data.endpos / 10;
					controls.strtpos2.setValue(getStartpos2.toFixed(1)) // strtpos2
				}
				else {
					// Get value rate and powname if not found end Meter START
					this.servicePowerMeter.getPowerMeterMaster(id).subscribe(respmaster => {
						controls.rate.setValue(respmaster.data.rte.rte) // rate
						controls.powname.setValue(respmaster.data.nmmtr) // powname
					})
					// Get value rate and powname if not found end Meter END

					// Valid With NEW API
					controls.unit.setValue(res.data.unit2) // unit
					controls.strtpos.setValue(res.data.start_electricity_stand) // strtpos
					// get startpos2
					const getStartpos2 = res.data.start_electricity_stand / 10;
					controls.strtpos2.setValue(getStartpos2.toFixed(1)) // strtpos2
				}
				this.checkConsumption()
			}, err => {
				console.log(err);
				// Kosongkan jika milih tanggal
				controls.rate.setValue("") // rate
				controls.powname.setValue("") // powname
				controls.unit.setValue("") // unit
				controls.strtpos.setValue("") // strtpos
				controls.strtpos2.setValue("") // strtpos2
				this.viewPowerMeterResult.setValue("") // Select Power Meter
				this.loadMeterList("")

				// Alert For Error
				const message = `there is no master power for consumption!`;
				this.layoutUtilsService.showActionNotification(message, MessageType.Create, 5000, true, true);
				return
			})
	}

	/**
	 * This old function (old)
	 * @param item 
	 */
	// async changePowerMeter(item) { // # get Consumption Start Meter ( codingan lama dihandle dari FE)
	// 	this.servicePowerMeter.getPowerMeter(item).subscribe(res => {
	// 		this.powerTransactionForm.controls.rate.setValue(res.data.rte.rte);
	// 		this.powerTransactionForm.controls.powname.setValue(res.data.nmmtr);
	// 		this.powerTransactionForm.controls.unit.setValue(res.data.unit);

	// 		if (typeof res.lastConsumtion == "undefined" || res.lastConsumtion == null) {
	// 			this.lastdata = 0
	// 		} else {
	// 			this.lastdata = res.lastConsumtion.endpos;
	// 		}

	// 		this.unit = res.data.unt._id;
	// 		this.type = res.data.unt.type;
	// 		this.powerTransactionForm.controls.unit.setValue(res.data.unit);
	// 		if (this.type == "pp" || this.type == "owner") {
	// 			this.ownerService.findOwnershipContractByUnit(this.unit).subscribe(data => {
	// 				console.log(data)
	// 				if (data.data[0].billstatus == 0) {
	// 					//this.powerTransactionForm.controls.strtpos.setValue(data.data[0].start_water_stand)
	// 					this.powerTransactionForm.controls.strtpos.setValue(data.data[0].start_electricity_stand)
	// 					const strtpos = this.powerTransactionForm.controls.strtpos.value / 10;
	// 					if (strtpos != 0) {
	// 						this.powerTransactionForm.controls.strtpos2.setValue(strtpos.toFixed(1))
	// 					};
	// 				} else {
	// 					this.powerTransactionForm.controls.strtpos.setValue(this.lastdata)
	// 					const strtpos = this.powerTransactionForm.controls.strtpos.value / 10;
	// 					if (strtpos != 0) {
	// 						this.powerTransactionForm.controls.strtpos2.setValue(strtpos.toFixed(1))
	// 					};
	// 				}
	// 			})
	// 		}
	// 		else {
	// 			this.tenantService.findLeaseContractByUnit(this.unit).subscribe(data => {
	// 				console.log(data, "data");

	// 				if (data.data[0].billstatus == 0) {
	// 					this.powerTransactionForm.controls.strtpos.setValue(data.data[0].start_wa_stand)
	// 					const strtpos = this.powerTransactionForm.controls.strtpos.value / 10;
	// 					if (strtpos != 0) {
	// 						this.powerTransactionForm.controls.strtpos2.setValue(strtpos.toFixed(1))
	// 					};
	// 				} else {
	// 					this.powerTransactionForm.controls.strtpos.setValue(res.lastConsumtion.endpos)
	// 					const strtpos = this.powerTransactionForm.controls.strtpos.value / 10;
	// 					if (strtpos != 0) {
	// 						this.powerTransactionForm.controls.strtpos2.setValue(strtpos.toFixed(1))
	// 					};
	// 				}
	// 			})
	// 		}
	// 	});
	// }


	changeMeterPost() {
		const strtpos = this.powerTransactionForm.controls.strtpos.value / 10;
		if (strtpos !== 0) {
			this.powerTransactionForm.controls.strtpos2.setValue(
				strtpos.toFixed(1));
		} else this.powerTransactionForm.controls.strtpos2.setValue(0)
		const endpos = this.powerTransactionForm.controls.endpos.value / 10;
		if (endpos !== 0) {
			this.powerTransactionForm.controls.endpos2.setValue(
				endpos.toFixed(1));
		} else this.powerTransactionForm.controls.endpos2.setValue(0)
		this.checkConsumption()
	}

	ngOnDestroy() {
		this.subscriptions.forEach((sb) => sb.unsubscribe());
	}

	// onkeydown handler input
	inputKeydownHandler(event) {
		return event.keyCode === 8 || event.keyCode === 46 ? true : !isNaN(Number(event.key));
	}

	inputKeydownHandlerLoss(event) {
		return event.keyCode === 8 || event.keyCode === 46 ? true : !isNaN(Number(event.key)) || event.key === '.';
	}

	selectFile(event) {
		this.selectedFiles = event.target.files;
	}

	validateFile(name: String) {
		var ext = name.substring(name.lastIndexOf('.') + 1);
		if (ext.toLowerCase() == 'png' || ext.toLowerCase() == 'jpg' || ext.toLowerCase() == 'jpeg') {
			return true;
		}
		else {
			return false;
		}
	}


	upload() {
		//this.uploadProgress = 0;
		this.currentFile = this.selectedFiles.item(0);
		const controls = this.powerTransactionForm.controls
		const untFileName = controls.unit.value

		if (!untFileName) {
			const message = `Unit Meter is Required !!`;
			this.layoutUtilsService.showActionNotification(message, MessageType.Create, 5000, true, true);
			return;
		}

		this.uploadService
			.upload(this.currentFile, untFileName)
			.pipe(finalize(() => this.reset()))
			.subscribe(
				(event) => {
					if (!this.validateFile(this.currentFile.name)) {
						this.message = "Selected file format is not supported.";
						return false;
					}
					this.cd.markForCheck();
					if (event.type === HttpEventType.UploadProgress) {
						this.uploadProgress = Math.round(
							(100 * event.loaded) / event.total
						);
					} else if (event.type === HttpEventType.Response) {
						if (event instanceof HttpResponse) {
							this.message = event.body.message;
							this.url = event.body.url;
							// console.log(this.url);
							this.imageSrc = event.body.url;
							this.powerTransactionForm.controls.urlmeter.setValue(
								this.url
							);
							this.isUpload = true
							//this.fileInfos = this.uploadService.getFiles();
						}
					}
				},
				(err) => {
					this.cd.markForCheck();
					this.message = "Could not upload the file! or File size cannot be larger than 2MB!";
					this.imageSrc = "";
					this.currentFile = undefined;
				}
			);

		this.selectedFiles = undefined;
	}

	cancelUpload() {
		this.uploadSub.unsubscribe();
		this.reset();
	}


	reset() {
		this.uploadProgress = null;
		this.uploadSub = null;
	}

	// NEW INPUT IMAGE #START
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
				this.cd.markForCheck();
			}
			reader.readAsDataURL(files[i]);
		}
	}

	clearSelection() {
		this.myFiles = [];
		this.images = [];
		this.fileInputEl.nativeElement.value = "";
		this.cd.markForCheck();
	}
	removeSelectedFile(item) {
		this.myFiles = this.myFiles.filter(i => i.name !== item.name);
		this.images = this.images.filter(i => i.url !== item.url);
		this.fileInputEl.nativeElement.value = "";

		this.cd.markForCheck();
	}

	// NEW INPUT IMAGE #END

}

