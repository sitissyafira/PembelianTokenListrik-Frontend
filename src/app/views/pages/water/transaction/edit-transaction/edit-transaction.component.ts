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
	selectWaterTransactionById,
} from "../../../../../core/water/transaction/transaction.selector";
import { WaterTransactionModel } from "../../../../../core/water/transaction/transaction.model";
import { WaterMeterService } from "../../../../../core/water/meter/meter.service";
import { SelectionModel } from "@angular/cdk/collections";
import { QueryWaterMeterModel } from "../../../../../core/water/meter/querymeter.model";
import * as _moment from "moment";
import { default as _rollupMoment } from "moment";
import { WaterTransactionService } from "../../../../../core/water/transaction/transaction.service";
import { HttpClient } from '@angular/common/http';
import { environment } from "../../../../../../environments/environment";
import { UploadFileService } from '../../../../../core/water/transaction/upload-file.service';
import { HttpEventType, HttpResponse } from '@angular/common/http';
import { finalize } from "rxjs/operators";
import { MatDialog } from "@angular/material";
const moment = _rollupMoment || _moment;

@Component({
	selector: "kt-edit-transaction",
	templateUrl: "./edit-transaction.component.html",
	styleUrls: ["./edit-transaction.component.scss"],
})
export class EditTransactionComponent implements OnInit, OnDestroy {
	waterTransaction: WaterTransactionModel;
	waterTransactionId$: Observable<string>;
	oldWaterTransaction: WaterTransactionModel;
	selectedTab = 0;
	loading$: Observable<boolean>;
	waterTransactionForm: FormGroup;
	hasFormErrors = false;

	hasFormErrorsImage: boolean = false;
	messageErrorImage: string = ""

	waterTransactionResult: any[] = [];
	waterMeter: any[] = [];
	selection = new SelectionModel<WaterTransactionModel>(true, []);
	date = new FormControl(moment());
	checker: boolean;
	buttonSave: boolean = true;
	loadingForm: boolean
	images: any;
	loading: boolean = false;


	waterListResultFiltered = [];
	viewWaterMeterResult = new FormControl();

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
		private waterTransactionFB: FormBuilder,
		private subheaderService: SubheaderService,
		private layoutUtilsService: LayoutUtilsService,
		private store: Store<AppState>,
		private serviceWaterrMeter: WaterMeterService,
		private layoutConfigService: LayoutConfigService,
		private http: HttpClient,
		private service: WaterTransactionService,
		private cd: ChangeDetectorRef,
		private dialog: MatDialog,
		private uploadService: UploadFileService,
	) { }

	ngOnInit() {
		this.loading$ = this.store.pipe(
			select(selectWaterTransactionActionLoading)
		);
		const routeSubscription = this.activatedRoute.params.subscribe(
			(params) => {
				const id = params.id;
				/** ====================== This Old Consumption (old) ====================== */
				// if (id) { // This OLD consumption (old)
				// 	this.store
				// 		.pipe(select(selectWaterTransactionById(id)))
				// 		.subscribe((res) => {
				// 			if (res) {
				// 				this.loadingForm = true
				// 				this.waterTransaction = res;
				// 				this.checker = res.checker;
				// 				this.oldWaterTransaction = Object.assign(
				// 					{},
				// 					this.waterTransaction
				// 				);
				// 				this.viewWaterMeterResult.setValue(`${res.wat.nmmtr} - ${res.wat.unit.toLocaleLowerCase()}`);
				// 				this._filterWaterList(`${res.wat.nmmtr} - ${res.wat.unit.toLocaleLowerCase()}`);

				// 				this.initWaterTransaction();
				// 			}
				// 		});
				// }

				/** ====================== This New Layout Consumption (new) ====================== */
				if (id) { // This new layout (new)
					this.serviceWaterrMeter.getWaterMeter(id).subscribe((res) => {
						if (res) {
							this.paramsById = id
							this.loadingForm = true
							this.waterTransaction = res.data;
							this.checker = res.data.checker;
							this.oldWaterTransaction = Object.assign(
								{},
								this.waterTransaction
							);
							this.viewWaterMeterResult.setValue(`${res.data.wat.nmmtr} - ${res.data.wat.unit.toLocaleLowerCase()}`);
							this._filterWaterList(`${res.data.wat.nmmtr} - ${res.data.wat.unit.toLocaleLowerCase()}`);

							this.initWaterTransaction();
						}
					});
				}
			}
		);
		this.subscriptions.push(routeSubscription);
	}
	initWaterTransaction() {
		this.createForm();
		this.hiddenAfterRes()
		this.getImage();
		this.checkConsumption()
	}


	hiddenAfterRes() {
		if (this.waterTransaction.checker != false) {
			this.buttonSave = true;
		} else {
			this.buttonSave = false;
		}
	}

	createForm() {
		if (this.waterTransaction._id) {
			this.loadMeterList("");
			this.waterTransactionForm = this.waterTransactionFB.group({
				wat: [{ value: this.waterTransaction.wat._id, disabled: true }],
				rate: [
					{
						value: this.waterTransaction.wat.rte.rte,
						disabled: true,
					},
				],
				strtpos: [{ value: this.waterTransaction.strtpos, disabled: false }, Validators.required],
				endpos: [this.waterTransaction.endpos, Validators.required],
				// billmnt: [{ value: this.waterTransaction.billmnt, disabled: true }, Validators.required],
				billmnt: [{ value: this.waterTransaction.billmnt, disabled: false }, Validators.required],
				unit: [this.waterTransaction.unit],
				air_kotor: [this.waterTransaction.air_kotor],
				strtpos2: [{ value: this.waterTransaction.strtpos2 ? this.waterTransaction.strtpos2.toFixed(1) : this.convertStrtpos(this.waterTransaction.strtpos), disabled: true }],
				endpos2: [{ value: this.waterTransaction.endpos2 ? this.waterTransaction.endpos2.toFixed(1) : this.convertEndpos(this.waterTransaction.endpos), disabled: true }],
				checker: [""],
				watname: [this.waterTransaction.watname],
				urlmeter: [this.waterTransaction.urlmeter],
				cons: [""]
			});

			if (this.waterTransaction.urlmeter)
				this.imageSrc = this.waterTransaction.urlmeter;
		}
	}

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


		const controls = this.waterTransactionForm.controls;
		/** check form */
		if (this.waterTransactionForm.invalid) {
			console.log(controls);
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
		this.updateWaterTransaction(editedWaterTransaction, withBack);
		// Condition TO upload Image END

	}
	prepareWaterTransaction(): WaterTransactionModel {
		const controls = this.waterTransactionForm.controls;
		const _waterTransaction = new WaterTransactionModel();
		_waterTransaction.clear();
		_waterTransaction._id = this.waterTransaction._id;
		_waterTransaction.wat = controls.wat.value;
		_waterTransaction.strtpos = controls.strtpos.value;
		_waterTransaction.endpos = controls.endpos.value;
		_waterTransaction.strtpos2 = controls.strtpos2.value;
		_waterTransaction.endpos2 = controls.endpos2.value;
		_waterTransaction.billmnt = controls.billmnt.value;
		_waterTransaction.air_kotor = controls.air_kotor.value;
		_waterTransaction.unit = controls.unit.value.toLowerCase();
		_waterTransaction.checker = controls.checker.value;
		_waterTransaction.watname = controls.watname.value.toLowerCase();

		/** if after deleting there is no image file and there is an image */
		_waterTransaction.urlmeter = this.isDeleteImage.isDeleteImgWeb && !this.imageSrc ? null : controls.urlmeter.value;

		return _waterTransaction;
	}



	updateWaterTransaction(
		_waterTransaction: WaterTransactionModel,
		withBack: boolean = false
	) {
		const addSubscription = this.service
			.updateWaterTransaction(_waterTransaction)
			.subscribe(
				(res) => {
					const message = `Water consumption successfully has been saved.`;
					this.layoutUtilsService.showActionNotification(
						message,
						MessageType.Create,
						5000,
						true,
						true
					);
					const url = `/water-management/water/transaction`;
					this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
				},
				(err) => {
					console.error(err);
					const message =
						"Error while saving water consumption | " +
						err.statusText;
					this.layoutUtilsService.showActionNotification(
						message,
						MessageType.Create,
						5000,
						true,
						false
					);
				}
			);
		this.subscriptions.push(addSubscription);
	}
	getComponentTitle() {
		let result = `Edit Water Consumption`;
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
	_setWaterValue(value) {
		this.waterTransactionForm.patchValue({ wat: value._id });
	}

	_onKeyup(e: any) {
		this.waterTransactionForm.patchValue({ wat: undefined });
		this._filterWaterList(e.target.value);
	}

	_filterWaterList(text: string) {
		this.waterListResultFiltered = this.waterMeter.filter(i => {
			const filterText = `${i.nmmtr} - ${i.unit.toLocaleLowerCase()}`;
			if (filterText.includes(text.toLocaleLowerCase())) return i;

		});
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

	loadMeterList(text) {
		this.selection.clear();
		// const queryParams = new QueryWaterMeterModel(
		// 	null,
		// 	"asc",
		// 	null,
		// 	1,
		// 	100000
		// );
		const queryParams = {
			input: text
		}

		this.serviceWaterrMeter.getListWaterMeterforTr(queryParams).subscribe(
			res => {
				this.waterMeter = res.data;
				this.waterListResultFiltered = this.waterMeter.slice();
				this.cd.markForCheck();
				this.viewWaterMeterResult.disable();
			});
	}


	changeMeterPost() {
		const strtpos = this.waterTransactionForm.controls.strtpos.value / 10;
		if (strtpos != 0) {
			this.waterTransactionForm.controls.strtpos2.setValue(strtpos.toFixed(1))
		} else this.waterTransactionForm.controls.strtpos2.setValue(0)
		const endpos = this.waterTransactionForm.controls.endpos.value / 10;
		if (endpos != 0) {
			this.waterTransactionForm.controls.endpos2.setValue(endpos.toFixed(1))
		} else this.waterTransactionForm.controls.endpos2.setValue(0)
		const rate = this.waterTransactionForm.controls.rate.value;
		this.checkConsumption()
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

	checkConsumption() { // fungsi untuk menentukan nilai consumption (last meter dikurangi Start Meter)
		const controls = this.waterTransactionForm.controls
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


	ngOnDestroy() {
		this.subscriptions.forEach((sb) => sb.unsubscribe());
	}

	inputKeydownHandler(event) {
		return event.keyCode === 8 || event.keyCode === 46 ? true : !isNaN(Number(event.key));
	}

	inputKeydownHandlerLoss(event) {
		return event.keyCode === 8 || event.keyCode === 46 ? true : !isNaN(Number(event.key)) || event.key === '.';
	}

	async getImage() {
		const URL_IMAGE = `${environment.baseAPI}/api/water/transaksi`
		await this.http.get(`${URL_IMAGE}/${this.waterTransaction._id}/getimages`).subscribe((res: any) => {
			this.images = res.data;
		});
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
