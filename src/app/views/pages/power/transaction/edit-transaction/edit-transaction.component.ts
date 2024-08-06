// Angular
import { Component, OnInit, OnDestroy, ChangeDetectorRef, ViewChild, ElementRef } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import {
	FormBuilder,
	FormControl,
	FormGroup,
	Validators,
} from "@angular/forms";
import {
	MomentDateAdapter,
	MAT_MOMENT_DATE_ADAPTER_OPTIONS,
} from "@angular/material-moment-adapter";
// RxJS
import { BehaviorSubject, Observable, of, Subscription } from "rxjs";
// NGRX
import { Store, select } from "@ngrx/store";
import { Update } from "@ngrx/entity";
import { AppState } from "../../../../../core/reducers";
// Layout
import {
	SubheaderService,
	LayoutConfigService,
} from "../../../../../core/_base/layout";
import {
	LayoutUtilsService,
	MessageType,
	QueryParamsModel,
} from "../../../../../core/_base/crud";
import {
	selectLastCreatedPowerTransactionId,
	selectPowerTransactionActionLoading,
	selectPowerTransactionById,
} from "../../../../../core/power/transaction/transaction.selector";
import {
	PowerTransactionOnServerCreated,
	PowerTransactionUpdated,
} from "../../../../../core/power/transaction/transaction.action";
import { PowerTransactionModel } from "../../../../../core/power/transaction/transaction.model";
import { PowerMeterService } from "../../../../../core/power/meter/meter.service";
import { SelectionModel } from "@angular/cdk/collections";
import { QueryPowerMeterModel } from "../../../../../core/power/meter/querymeter.model";
import {
	DateAdapter,
	MAT_DATE_FORMATS,
	MAT_DATE_LOCALE,
	MatDatepicker,
	MatDialog,
} from "@angular/material";
import * as _moment from "moment";
import { default as _rollupMoment, Moment } from "moment";
import { HttpClient } from '@angular/common/http';
import { environment } from "../../../../../../environments/environment";
import { UploadFileService } from '../../../../../core/power/transaction/upload-file.service';
import { HttpEventType, HttpResponse } from '@angular/common/http';
import { finalize } from "rxjs/operators";
import { PowerTransactionService } from "../../../../../core/power/transaction/transaction.service";
const moment = _rollupMoment || _moment;

@Component({
	selector: "kt-edit-transaction",
	templateUrl: "./edit-transaction.component.html",
	styleUrls: ["./edit-transaction.component.scss"],
})
export class EditTransactionComponent implements OnInit, OnDestroy {
	powerTransaction: PowerTransactionModel;
	powerTransactionId$: Observable<string>;
	oldPowerTransaction: PowerTransactionModel;
	selectedTab = 0;
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
	buttonSave: boolean = true;
	images: any;
	loading: boolean = false;
	loadingForm: boolean;



	powerListResultFiltered = [];
	viewPowerMeterResult = new FormControl();

	selectedFiles: FileList;
	currentFile: File;
	message = '';
	isUpload: boolean = false
	url = '';
	imageSrc: string;
	isImage: string = "web"


	fileName = '';
	uploadProgress: number;
	uploadSub: Subscription;

	// Upload Image (new) START
	@ViewChild('fileInput', { static: false }) fileInputEl: ElementRef;
	imagesUpload: any[] = []
	myFiles: any[] = []
	// Upload Image (new) END

	paramsById: string /* to get id params */
	titleDeleteImage: string /* to display delete condition from web or mobile */

	isDeleteImage = {
		isDeleteImgWeb: false, /* To check remove image success/failed/cancel */
		isDeleteImgMob: false /* To check remove image success/failed/cancel */
	}


	// Private properties
	private subscriptions: Subscription[] = [];
	constructor(
		private activatedRoute: ActivatedRoute,
		private router: Router,
		private powerTransactionFB: FormBuilder,
		private subheaderService: SubheaderService,
		private layoutUtilsService: LayoutUtilsService,
		private store: Store<AppState>,
		private servicePowerMeter: PowerMeterService,
		private service: PowerTransactionService,
		private http: HttpClient,
		private layoutConfigService: LayoutConfigService,
		private cd: ChangeDetectorRef,
		private dialog: MatDialog,
		private uploadService: UploadFileService,
	) { }

	ngOnInit() {

		this.loading$ = this.store.pipe(
			select(selectPowerTransactionActionLoading)
		);
		const routeSubscription = this.activatedRoute.params.subscribe(
			(params) => {
				const id = params.id;
				/* ============================ Old consumption Power (old)  ============================ */
				// if (id) { //(This old consumption (old))
				// 	this.store
				// 		.pipe(select(selectPowerTransactionById(id)))
				// 		.subscribe((res) => {
				// 			if (res) {
				// 				this.loadingForm = true;
				// 				this.powerTransaction = res;
				// 				this.checker = res.checker;
				// 				this.oldPowerTransaction = Object.assign(
				// 					{},
				// 					this.powerTransaction
				// 				);

				// 				this.viewPowerMeterResult.setValue(`${res.pow.nmmtr} - ${res.pow.unit.toLocaleLowerCase()}`);
				// 				this._filterPowerList(`${res.pow.nmmtr} - ${res.pow.unit.toLocaleLowerCase()}`);
				// 				this.initPowerTransaction();
				// 			}
				// 		});
				// }

				/* ============================ New Layouting (new)  ============================ */
				if (id) { //This New Layouting (new)
					this.servicePowerMeter.getPowerMeter(id).subscribe((res) => {
						if (res) {
							this.paramsById = id
							this.loadingForm = true;
							this.powerTransaction = res.data;
							this.checker = res.data.checker;
							this.oldPowerTransaction = Object.assign(
								{},
								this.powerTransaction
							);

							this.viewPowerMeterResult.setValue(`${res.data.pow.nmmtr} - ${res.data.pow.unit.toLocaleLowerCase()}`);
							this._filterPowerList(`${res.data.pow.nmmtr} - ${res.data.pow.unit.toLocaleLowerCase()}`);
							this.initPowerTransaction();
						}
					});
				}
			}
		);
		this.subscriptions.push(routeSubscription);
	}
	initPowerTransaction() {
		this.createForm();
		this.loadMeterList("");
		this.getImage();
		this.checkConsumption()
	}



	createForm() {
		if (this.powerTransaction._id) {
			this.powerTransactionForm = this.powerTransactionFB.group({
				pow: [{ "value": this.powerTransaction.pow._id, disabled: true }],
				loss: [{ "value": this.powerTransaction.loss, disabled: false }],
				rate: [
					{
						value: this.powerTransaction.pow.rte.rte,
						disabled: true,
					},
				],
				strtpos: [{ value: this.powerTransaction.strtpos, disabled: false }, Validators.required],
				endpos: [this.powerTransaction.endpos, Validators.required],
				strtpos2: [{ value: this.powerTransaction.strtpos2 ? this.powerTransaction.strtpos2.toFixed(1) : this.convertStrtpos(this.powerTransaction.strtpos), disabled: true }],
				endpos2: [{ value: this.powerTransaction.endpos2 ? this.powerTransaction.endpos2.toFixed(1) : this.convertEndpos(this.powerTransaction.endpos), disabled: true }],
				// billmnt: [{ value: this.powerTransaction.billmnt, disabled: true }, Validators.required],
				billmnt: [{ value: this.powerTransaction.billmnt, disabled: false }, Validators.required],
				checker: [this.powerTransaction.checker],
				powname: [this.powerTransaction.powname],
				unit: [this.powerTransaction.unit],
				urlmeter: [this.powerTransaction.urlmeter],
				cons: [""],
			});

			if (this.powerTransaction.urlmeter)
				this.imageSrc = this.powerTransaction.urlmeter;
		}
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

		if (this.powerTransactionForm.controls.endpos.value < this.powerTransactionForm.controls.strtpos.value) {
			const message = `Value last meter can't be smaller`;
			this.layoutUtilsService.showActionNotification(message, MessageType.Create, 5000, true, true);

			return
		}

		if (this.selectedFiles && !this.isUpload) {
			const message = `Upload your image file`;
			this.layoutUtilsService.showActionNotification(message, MessageType.Create, 5000, true, true);

			return
		}



		const controls = this.powerTransactionForm.controls;
		/** check form */
		if (this.powerTransactionForm.invalid) {
			console.log(controls);
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

		this.updatePowerTransaction(editedPowerTransaction, withBack);
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
		_powerTransaction.checker = controls.checker.value;
		_powerTransaction.powname = controls.powname.value.toLowerCase();
		_powerTransaction.unit = controls.unit.value.toLowerCase();

		/** if after deleting there is no image file and there is an image */
		_powerTransaction.urlmeter = this.isDeleteImage.isDeleteImgWeb && !this.imageSrc ? null : controls.urlmeter.value;
		return _powerTransaction;
	}

	updatePowerTransaction(
		_powerTransaction: PowerTransactionModel,
		withBack: boolean = false
	) {
		const updatedPowerTransaction: Update<PowerTransactionModel> = {
			id: _powerTransaction._id,
			changes: _powerTransaction,
		};
		this.store.dispatch(
			new PowerTransactionUpdated({
				partialPowerTransaction: updatedPowerTransaction,
				powertransaction: _powerTransaction,
			})
		);
		const message = `Power consumption successfully has been saved.`;
		this.layoutUtilsService.showActionNotification(
			message,
			MessageType.Update,
			5000,
			true,

		);
		if (withBack) {
			this.goBackWithId();

		} else {
			this.refreshPowerTransaction(false);
			const url = `/power-management/power/transaction`;
			this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });

		}
	}

	// #START, Consumption Start End POS # new Adjustment
	convertStrtpos(value) { // START POS
		const strtpos = value / 10;
		return strtpos.toFixed(1)
	}
	convertEndpos(value) { // END POS
		const endpos = value / 10;
		return endpos.toFixed(1)
	}
	// #END, Consumption Start End POS # new Adjustment

	getComponentTitle() {
		let result = `Edit Electricity Consumption`;
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
		this.powerTransactionForm.patchValue({ pow: value._id });
	}

	_onKeyup(e: any) {
		this.powerTransactionForm.patchValue({ pow: undefined });
		this._filterPowerList(e.target.value);
	}

	_filterPowerList(text: string) {
		// this.powerListResultFiltered = this.powerMeter.filter(i => {
		// 	const filterText = `${i.nmmtr} - ${i.unit.toLocaleLowerCase()}`;
		// 	if (filterText.includes(text.toLocaleLowerCase())) return i;

		// });
		this.loadMeterList(text)
	}

	loadMeterList(text) {
		this.selection.clear();
		// const queryParams = new QueryPowerMeterModel(
		// 	null,
		// 	"asc",
		// 	null,
		// 	1,
		// 	10000
		const queryParams = {
			input: text
		}

		this.servicePowerMeter.getListPowerMeterforTr(queryParams).subscribe((res) => {
			this.powerMeter = res.data;

			this.powerListResultFiltered = this.powerMeter.slice();
			this.cd.markForCheck();
			this.viewPowerMeterResult.disable();
		});
	}


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
		const rate = this.powerTransactionForm.controls.rate.value;

		this.checkConsumption()
	}



	ngOnDestroy() {
		this.subscriptions.forEach((sb) => sb.unsubscribe());
	}


	async getImage() {
		const URL_IMAGE = `${environment.baseAPI}/api/power/transaksi`
		await this.http.get(`${URL_IMAGE}/${this.powerTransaction._id}/getimages`).subscribe((res: any) => {
			this.images = res.data;
		});
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


	changeImage(stts) {
		if (stts === 'web') this.isImage = 'web';
		else if (stts === 'mobile') this.isImage = 'mobile';

		this.cd.markForCheck()
	}

	/**
	 * Delete Image
	 * @param condition To find out web or mobile images
	 * @param contentPopUp  This connect to tag/element html code
	 * paramsById > send the id of the image
	 */
	deleteImage(condition: string, contentPopUp) {
		this.titleDeleteImage = condition
		this.popUpDeleteImage(contentPopUp)
	}

	/**
	 * Pop Up Delete Image
	 * @param content This connect to tag/element html code.
	 */
	popUpDeleteImage(content) {
		this.dialog.open(content, {
			data: {
				input: ""
			},
			maxWidth: "350px",
			minHeight: "150px",
		});
	}

	/**
	 * Function delete image, and shoot API
	 */
	yesDeleteImage() {
		this.service.deleteImage(this.paramsById, this.titleDeleteImage).subscribe(
			res => {
				const message = `Delete image From ${this.titleDeleteImage ? this.titleDeleteImage : "..."}`;
				this.layoutUtilsService.showActionNotification(message, MessageType.Create, 5000, true, true);

				if (this.titleDeleteImage === "web") {
					this.imageSrc = ""
					this.isDeleteImage.isDeleteImgWeb = true
				} /* Reset image source, if response success, (web) */
				else if (this.titleDeleteImage === "mobile") {
					this.images = []
					this.isDeleteImage.isDeleteImgMob = true
				} /* Reset image source, if response success, (mobile) */

				setTimeout(() => { // Delay to reset variabel and close Pop Up
					this.clickNo()
				}, 500);

				this.cd.markForCheck()
			}, err => {
				console.error(err);
				const message = `Error message transaction!`;
				this.layoutUtilsService.showActionNotification(message, MessageType.Create, 5000, true, true);
				setTimeout(() => { // Delay to reset variabel and close Pop Up
					this.clickNo()
				}, 500);
			})
	}

	/**
	 * cancel delete image and reset variabel
	 */
	clickNo() {
		this.dialog.closeAll()
		this.titleDeleteImage = ""
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
							this.powerTransactionForm.controls.urlmeter.setValue(this.url);
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

	// NEW INPUT IMAGE #START
	// Upload Image (new) START
	selectFileUpload(e) {
		const files = (e.target as HTMLInputElement).files;

		if (files.length > 1 || this.myFiles.length >= 1 || this.imagesUpload.length >= 1) {
			this.fileInputEl.nativeElement.value = "";
			const message = `Only 1 imagesUpload are allowed to select`;
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
				this.imagesUpload.push({ name: files[i].name, url: reader.result });
				this.cd.markForCheck();
			}
			reader.readAsDataURL(files[i]);
		}
	}

	clearSelection() {
		this.myFiles = [];
		this.imagesUpload = [];
		this.fileInputEl.nativeElement.value = "";
		this.cd.markForCheck();
	}
	removeSelectedFile(item) {
		this.myFiles = this.myFiles.filter(i => i.name !== item.name);
		this.imagesUpload = this.imagesUpload.filter(i => i.url !== item.url);
		this.fileInputEl.nativeElement.value = "";

		this.cd.markForCheck();
	}

	// NEW INPUT IMAGE #END 
	reset() {
		this.uploadProgress = null;
		this.uploadSub = null;
	}

}

