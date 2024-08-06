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
	selectWaterTransactionActionLoading,
} from "../../../../../core/water/transaction/transaction.selector";
import { WaterTransactionModel } from "../../../../../core/water/transaction/transaction.model";
import { WaterMeterService } from "../../../../../core/water/meter/meter.service";
import { SelectionModel } from "@angular/cdk/collections";
import { QueryWaterMeterModel } from "../../../../../core/water/meter/querymeter.model";
import * as _moment from "moment";
import { default as _rollupMoment } from "moment";
import { WaterTransactionService } from "../../../../../core/water/transaction/transaction.service";
import { OwnershipContractService } from '../../../../../core/contract/ownership/ownership.service';
import { LeaseContractService } from '../../../../../core/contract/lease/lease.service';
import { UploadFileService } from '../../../../../core/water/transaction/upload-file.service';
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
	waterTransaction: WaterTransactionModel;
	waterTransactionId$: Observable<string>;
	oldWaterTransaction: WaterTransactionModel;
	selectedTab = 0;
	lastdata: any;
	unit: string;
	type: string;
	status: any;
	loading$: Observable<boolean>;
	waterTransactionForm: FormGroup;
	hasFormErrors = false;

	hasFormErrorsImage: boolean = false;
	messageErrorImage: string = ""

	waterTransactionResult: any[] = [];
	waterMeter: any[] = [];
	date1 = new FormControl(new Date());
	selection = new SelectionModel<WaterTransactionModel>(true, []);
	date = new FormControl(moment());
	checker: boolean;
	loading: boolean = false;

	loading1 = {
		deposit: false,
		submit: false,
		glaccount: false,
	};

	waterListResultFiltered = [];
	viewWaterMeterResult = new FormControl();

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

	private subscriptions: Subscription[] = [];
	constructor(
		private activatedRoute: ActivatedRoute,
		private router: Router,
		private waterTransactionFB: FormBuilder,
		private subheaderService: SubheaderService,
		private layoutUtilsService: LayoutUtilsService,
		private store: Store<AppState>,
		private serviceWaterrMeter: WaterMeterService,
		private ownerService: OwnershipContractService,
		private tenantService: LeaseContractService,
		private layoutConfigService: LayoutConfigService,
		private service: WaterTransactionService,
		private cd: ChangeDetectorRef,
		private uploadService: UploadFileService,
		private dialog: MatDialog
	) { }

	ngOnInit() {
		this.loading$ = this.store.pipe(
			select(selectWaterTransactionActionLoading)
		);
		const routeSubscription = this.activatedRoute.params.subscribe(
			(params) => {
				this.waterTransaction = new WaterTransactionModel();
				this.waterTransaction.clear();
				this.initWaterTransaction();

			}
		);
		this.subscriptions.push(routeSubscription);
	}

	initWaterTransaction() {
		this.createForm();
		this.loadMeterList("");
	}
	createForm() {
		this.waterTransactionForm = this.waterTransactionFB.group({
			wat: ["", Validators.required],
			rate: [{ value: "", disabled: true }, Validators.required],
			strtpos: ["", Validators.required],
			strtpos2: [{ value: "", disabled: true }],
			endpos: ["", Validators.required],
			endpos2: [{ value: "", disabled: true }],
			billmnt: [{ value: this.date1.value, disabled: false }, Validators.required],
			unit: [""],
			air_kotor: [{ value: "0", disabled: false }, Validators.required],
			checker: [""],
			watname: [""],
			urlmeter: [""],
			cons: [""],
		});
	}

	/**
	* @param value
	*/
	_setWaterValue(value) {
		const controls = this.waterTransactionForm.controls
		controls.wat.setValue(value._id)
		this.getChangeWaterMeter(value._id); /* This new layouting function (new) */
		// this.changeWaterMeter(value._id); /* This  function (old) */
	}

	_onKeyup(e: any) {
		this._filterWaterList(e.target.value);
	}

	_filterWaterList(text: string) {
		// this.waterListResultFiltered = this.waterMeter.filter(i => {
		// 	const filterText = `${i.nmmtr} - ${i.unit.toLocaleLowerCase()}`;
		// 	if (filterText.includes(text.toLocaleLowerCase())) return i;

		// });

		this.loadMeterList(text)
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
		this.serviceWaterrMeter.getListWaterMeterforTr(queryParams).subscribe(
			res => {
				this.waterMeter = res.data;
				this.waterListResultFiltered = res.data
				this.cd.markForCheck();
				this.viewWaterMeterResult.enable();
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
	// 	this.serviceWaterrMeter
	// 		.getListWaterMeterforTr(queryParams)
	// 		.subscribe((res) => {
	// 			this.waterMeter = res.data;
	// 			this.waterListResultFiltered = this.waterMeter.slice();
	// 			this.cd.markForCheck();
	// 			this.viewWaterMeterResult.enable();
	// 			this.loadingData.Meter = false;
	// 		});
	// }

	goBackWithId() {
		const url = `/water-management/water/transaction`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}
	refreshWaterTransaction(isNew: boolean = false, id: string = "") {
		let url = this.router.url;
		if (!isNew) {
			this.router.navigate([url], { relativeTo: this.activatedRoute });
			return;
		}

		url = `/water-management/water/transaction/edit/${id}`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}

	onSubmit(withBack: boolean = false) {
		this.hasFormErrors = false;
		const controls = this.waterTransactionForm.controls;

		if (!controls.urlmeter.value) {
			const message = `Image is Required !!`;
			this.layoutUtilsService.showActionNotification(message, MessageType.Create, 5000, true, true);

			return;
		}


		if (this.waterTransactionForm.controls.endpos.value < this.waterTransactionForm.controls.strtpos.value) {
			const message = `Value last meter can't be smaller`;
			this.layoutUtilsService.showActionNotification(message, MessageType.Create, 5000, true, true);

			return
		}


		if (this.selectedFiles && !this.isUpload) {
			const message = `Upload your image file`;
			this.layoutUtilsService.showActionNotification(message, MessageType.Create, 5000, true, true);

			return
		}



		/** check form */
		if (this.waterTransactionForm.invalid) {
			Object.keys(controls).forEach((controlName) =>
				controls[controlName].markAsTouched()
			);

			this.hasFormErrors = true;
			this.selectedTab = 0;
			return;
		}
		// this.loading = true; 
		const editedWaterTransaction = this.prepareWaterTransaction();
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
				this.addWaterTransaction(editedWaterTransaction, withBack);
			} else {
				return;
			}
		});
		// Condition TO upload Image END
	}
	prepareWaterTransaction(): WaterTransactionModel {
		const controls = this.waterTransactionForm.controls;
		const _waterTransaction = new WaterTransactionModel();
		_waterTransaction.clear();
		_waterTransaction._id = this.waterTransaction._id;
		_waterTransaction.wat = controls.wat.value;
		_waterTransaction.strtpos = controls.strtpos.value;
		_waterTransaction.strtpos2 = controls.strtpos2.value;
		_waterTransaction.endpos2 = controls.endpos2.value;
		_waterTransaction.endpos = controls.endpos.value;
		_waterTransaction.billmnt = controls.billmnt.value;
		_waterTransaction.air_kotor = controls.air_kotor.value;
		_waterTransaction.unit = controls.unit.value.toLowerCase();
		_waterTransaction.checker = controls.checker.value;
		_waterTransaction.watname = controls.watname.value.toLowerCase();
		_waterTransaction.urlmeter = controls.urlmeter.value;
		return _waterTransaction;
	}

	addWaterTransaction(_waterTransaction: WaterTransactionModel, withBack: boolean = false) {
		const addSubscription = this.service.createWaterTransaction(_waterTransaction).subscribe(
			(res) => {
				const message = `New water consumption successfully has been added.`;
				this.layoutUtilsService.showActionNotification(message, MessageType.Create, 5000, true, true);

				if (_waterTransaction.checker != true) {
					const url = `/water-management/water/transaction/new`;
					this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
				} else {
					const url2 = `/water-management/water/transaction`;
					this.router.navigateByUrl(url2, { relativeTo: this.activatedRoute });
				}
			},
			(err) => {
				console.error(err);
				const message = "Error while adding water consumption | " + err.statusText;
				this.layoutUtilsService.showActionNotification(message, MessageType.Create, 5000, true, false);
			}
		);
		this.subscriptions.push(addSubscription);
	}


	getComponentTitle() {
		let result = "Create Water Consumption";
		return result;
	}
	onAlertClose($event) {
		this.hasFormErrors = false;
	}
	onAlertCloseImage($event) {
		this.hasFormErrorsImage = false;
	}

	// Handle Billing Date
	billDate(event) {
		const controls = this.waterTransactionForm.controls
		controls.billmnt.setValue(event.target.value)

		// Kosongkan jika milih tanggal
		controls.rate.setValue("") // rate
		controls.watname.setValue("") // watname
		controls.unit.setValue("") // unit
		controls.strtpos.setValue("") // strtpos
		controls.strtpos2.setValue("") // strtpos2
		this.viewWaterMeterResult.setValue("") // Select Water Meter
		controls.endpos.setValue("") // endpos
		controls.endpos2.setValue("") // endpos2
		controls.cons.setValue("") // consumption

		this.loadMeterList("")
	}

	// New API
	getChangeWaterMeter(id) { //# get Consumption Start Meter ( NEW, dihandle dari BE)
		const controls = this.waterTransactionForm.controls
		const mWtrId = id
		const consumDate = controls.billmnt.value
		const queryParams = { mWtrId, consumDate }
		this.serviceWaterrMeter.getLastConsumptionWater(queryParams).subscribe(
			res => {
				if (res.data.wat) {
					controls.rate.setValue(res.data.wat.rte.rte) // rate
					controls.watname.setValue(res.data.wat.nmmtr) // watname
					controls.unit.setValue(res.data.unit) // unit
					controls.strtpos.setValue(res.data.endpos) // strtpos
					// get startpos2
					const getStartpos2 = res.data.endpos / 10;
					controls.strtpos2.setValue(getStartpos2.toFixed(1)) // strtpos2
				}
				else {
					// Get value rate and watname if not found end Meter START
					this.serviceWaterrMeter.getWaterMeterMaster(id).subscribe(respmaster => {
						controls.rate.setValue(respmaster.data.rte.rte) // rate
						controls.watname.setValue(respmaster.data.nmmtr) // watname
					})
					// Get value rate and watname if not found end Meter END

					// Valid With NEW API
					controls.unit.setValue(res.data.unit2) // unit
					controls.strtpos.setValue(res.data.start_water_stand) // strtpos
					// get startpos2
					const getStartpos2 = res.data.start_water_stand / 10;
					controls.strtpos2.setValue(getStartpos2.toFixed(1)) // strtpos2
				}
				this.checkConsumption()
			}, err => {
				console.log(err);
				// Kosongkan jika milih tanggal
				controls.rate.setValue("") // rate
				controls.watname.setValue("") // watname
				controls.unit.setValue("") // unit
				controls.strtpos.setValue("") // strtpos
				controls.strtpos2.setValue("") // strtpos2
				this.viewWaterMeterResult.setValue("") // Select Water Meter
				this.loadMeterList("")

				// Alert For Error
				const message = `there is no master water for consumption!`;
				this.layoutUtilsService.showActionNotification(message, MessageType.Create, 5000, true, true);
				return
			})
	}

	// async changeWaterMeter(item) { // # get Consumption Start Meter ( codingan lama dihandle dari FE)
	// 	this.serviceWaterrMeter.getWaterMeter(item).subscribe(res => {
	// 		this.waterTransactionForm.controls.rate.setValue(res.data.rte.rte);
	// 		this.waterTransactionForm.controls.watname.setValue(res.data.nmmtr)
	// 		this.waterTransactionForm.controls.unit.setValue(res.data.unit)

	// 		if (typeof res.lastConsumtion == "undefined" || res.lastConsumtion == null) {
	// 			this.lastdata = 0
	// 		} else {
	// 			this.lastdata = res.lastConsumtion.endpos;
	// 		}
	// 		this.unit = res.data.unt._id;
	// 		this.type = res.data.unt.type;
	// 		if (this.type == "pp" || this.type == "owner") {
	// 			this.ownerService.findOwnershipContractByUnit(this.unit).subscribe(data => {
	// 				if (data.data[0].billstatus == 0) {
	// 					this.waterTransactionForm.controls.strtpos.setValue(data.data[0].start_water_stand)
	// 					const strtpos = this.waterTransactionForm.controls.strtpos.value / 10;

	// 					if (strtpos != 0) {
	// 						this.waterTransactionForm.controls.strtpos2.setValue(strtpos.toFixed(1))
	// 					};
	// 				} else {
	// 					this.waterTransactionForm.controls.strtpos.setValue(res.lastConsumtion.endpos)
	// 					const strtpos = this.waterTransactionForm.controls.strtpos.value / 10;
	// 					if (strtpos != 0) {
	// 						this.waterTransactionForm.controls.strtpos2.setValue(strtpos.toFixed(1))
	// 					};
	// 				}
	// 			})
	// 		}
	// 		else {
	// 			this.tenantService.findLeaseContractByUnit(this.unit).subscribe(data => {
	// 				if (data.data[0].billstatus == 0) {
	// 					this.waterTransactionForm.controls.strtpos.setValue(data.data[0].start_water_stand)
	// 					const strtpos = this.waterTransactionForm.controls.strtpos.value / 10;
	// 					if (strtpos != 0) {
	// 						this.waterTransactionForm.controls.strtpos2.setValue(strtpos.toFixed(1))
	// 					};
	// 				} else {
	// 					this.waterTransactionForm.controls.strtpos.setValue(res.lastConsumtion.endpos)
	// 					const strtpos = this.waterTransactionForm.controls.strtpos.value / 10;
	// 					if (strtpos != 0) {
	// 						this.waterTransactionForm.controls.strtpos2.setValue(strtpos.toFixed(1))
	// 					};
	// 				}
	// 			})
	// 		}
	// 	});
	// }

	changeMeterPost() {
		const strtpos = this.waterTransactionForm.controls.strtpos.value / 10;
		if (strtpos != 0) {
			this.waterTransactionForm.controls.strtpos2.setValue(strtpos.toFixed(1))
		} else this.waterTransactionForm.controls.strtpos2.setValue(0)
		const endpos = this.waterTransactionForm.controls.endpos.value / 10;
		if (endpos != 0) {
			this.waterTransactionForm.controls.endpos2.setValue(endpos.toFixed(1))
		} else this.waterTransactionForm.controls.endpos2.setValue(0)
		this.checkConsumption()
	}

	checkConsumption() { // fungsi untuk menentukan nilai consumption (last meter dikurangi Start Meter)
		const controls = this.waterTransactionForm.controls
		const start2 = controls.strtpos2.value
		const end2 = controls.endpos2.value

		if (start2 === 0 || end2 === 0) {
			controls.cons.setValue("")
			return
		}


		if (start2 && end2) {
			const dataWater = (end2 - start2).toFixed(3)
			const result = parseFloat(dataWater)
			controls.cons.setValue(result)
			this.cd.markForCheck()
		}
	}


	ngOnDestroy() {
		this.subscriptions.forEach((sb) => sb.unsubscribe());
	}

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
		const controls = this.waterTransactionForm.controls
		const untFileName = controls.unit.value

		if (!untFileName) {
			const message = `Unit Meter is Required !!`;
			this.layoutUtilsService.showActionNotification(message, MessageType.Create, 5000, true, true);
			return;
		}

		this.uploadService.upload(this.currentFile, untFileName)
			.pipe(finalize(() => this.reset()))
			.subscribe(
				event => {
					if (!this.validateFile(this.currentFile.name)) {
						this.message = 'Selected file format is not supported.';
						return false;
					}
					this.cd.markForCheck();
					if (event.type === HttpEventType.UploadProgress) {
						this.uploadProgress = Math.round(100 * event.loaded / event.total);
					} else if (event.type === HttpEventType.Response) {
						if (event instanceof HttpResponse) {

							this.message = event.body.message;
							this.url = event.body.url;
							// console.log(this.url);
							this.imageSrc = event.body.url;
							this.waterTransactionForm.controls.urlmeter.setValue(this.url);
							this.isUpload = true
							//this.fileInfos = this.uploadService.getFiles();
						}
					}
				},
				err => {
					this.cd.markForCheck();
					this.message = 'Could not upload the file! or File size cannot be larger than 2MB!';
					this.imageSrc = '';
					this.currentFile = undefined;
				});

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

