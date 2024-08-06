// Angular
import { Component, OnInit, OnDestroy, ChangeDetectorRef, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { BehaviorSubject, Observable, of, Subscription } from 'rxjs';
import { Store, select } from '@ngrx/store';
import { AppState } from '../../../../core/reducers';
import { LayoutUtilsService, MessageType, QueryParamsModel } from '../../../../core/_base/crud';
import {
	selectTrGalonActionLoading,
	selectTrGalonById
} from "../../../../core/trGalon/trGalon.selector";
import { QueryOwnerTransactionModel } from "../../../../core/contract/ownership/queryowner.model";

import { TrGalonModel } from '../../../../core/trGalon/trGalon.model';
import { TrGalonService } from '../../../../core/trGalon/trGalon.service';
import { SelectionModel } from "@angular/cdk/collections";
import * as _moment from 'moment';
import { default as _rollupMoment, Moment } from 'moment';
import { UnitService } from '../../../../core/unit/unit.service';
import { QueryUnitModel } from '../../../../core/unit/queryunit.model';
import { QueryAccountBankModel } from '../../../../core/masterData/bank/accountBank/queryaccountBank.model';
import { AccountBankService } from '../../../../core/masterData/bank/accountBank/accountBank.service';
const moment = _rollupMoment || _moment;
import { environment } from '../../../../../environments/environment';
import { HttpClient, HttpEventType, HttpResponse } from '@angular/common/http';
import { OwnershipContractService } from '../../../../core/contract/ownership/ownership.service';
import { UploadFileService } from '../../../../core/power/transaction/upload-file.service';
import { finalize } from "rxjs/operators";
import { ServiceFormat } from '../../../../core/serviceFormat/format.service';
import { ModuleGalon } from '../../../../core/trGalon/module/moduleservice';


@Component({
	selector: 'kt-add-trGalon',
	templateUrl: './edit-trGalon.component.html',
	styleUrls: ['./edit-trGalon.component.scss']
})
export class EditTrGalonComponent implements OnInit, OnDestroy {
	@ViewChild('fileInput', { static: false }) fileInputEl: ElementRef;

	trGalon: TrGalonModel;
	trGalonId$: Observable<string>;
	oldTrGalon: TrGalonModel;
	selectedTab = 0;
	loading$: Observable<boolean>;
	trGalonForm: FormGroup;
	ownService: OwnershipContractService
	idUnit: any = ""
	hasFormErrors = false;
	unitResult: any[] = [];
	customerResult: any[] = [];
	powerResult: any[] = [];
	waterResult: any[] = [];
	bankResult: any[] = [];
	isToken: boolean = false
	selection = new SelectionModel<TrGalonModel>(true, []);
	date = new FormControl(moment());
	date1 = new FormControl(new Date());
	serializedDate = new FormControl((new Date()).toISOString());
	duedate = new FormControl();
	isfreeIpl: boolean = false;
	isfreeAbodement: boolean = false;
	trGalonIdEdit: string = ""

	viewBankResult = new FormControl();


	loadingData = {
		unit: false,
	};


	UnitResultFiltered = [];
	TenantResultFiltered = [];
	BrandResultFiltered = [];

	rateBrand: any = ""
	tenantResult: any[] = [];
	brandResult: any[] = [];


	// Upload Image (new) START
	images: any[] = []
	imagesDelivery: any[] = []

	myFiles: any[] = []

	// Upload Image (new) END

	selectedFiles: FileList;
	currentFile: File;
	url = "";
	imageSrc: string;
	fileName = null;
	uploadProgress: number;
	uploadSub: Subscription;
	message: string;


	viewUnitResult = new FormControl();
	viewCstmrResult = new FormControl();
	viewBrandResult = new FormControl();

	isBrand: boolean = true
	checkedPaid: boolean = false


	vaWaterResult: any[] = []
	vaIPLResult: any[] = []

	// PPN Value not get Collection, PERLU DIPERBAIKI
	ppnValue: number = 11
	isChangeToPPN: boolean = false

	// Private properties
	private subscriptions: Subscription[] = [];
	constructor(
		private activatedRoute: ActivatedRoute,
		private moduleGalon: ModuleGalon, // services for flow galon systems (ex: changeStatus > to change status, etc.)
		private serviceFormat: ServiceFormat,
		private router: Router,
		private trGalonFB: FormBuilder,
		private layoutUtilsService: LayoutUtilsService,
		private store: Store<AppState>,
		private serviceTrGalon: TrGalonService,
		private serviceUnit: UnitService,
		private bservice: AccountBankService,
		private http: HttpClient,
		private cd: ChangeDetectorRef,
		private uploadService: UploadFileService,


	) { }

	ngOnInit() {
		this.loading$ = this.store.pipe(select(selectTrGalonActionLoading));
		const routeSubscription = this.activatedRoute.params.subscribe(params => {
			const id = params.id;
			if (id) {
				this.serviceTrGalon.getTrGalonByID(id).subscribe(res => {
					if (res) {
						// Update ISREAD Galon Tr
						this.serviceTrGalon.updateIsRead(id).subscribe(res => console.log(res))

						this.trGalonIdEdit = res.data._id
						// this.idUnit = res.data.unit._id
						this.idUnit = res.data.unit
						this.trGalon = res.data;
						this.oldTrGalon = Object.assign({}, this.trGalon);
						this.viewUnitResult.setValue(res.data.unit.cdunt ? res.data.unit.cdunt.toUpperCase() : "")
						this.viewCstmrResult.setValue(res.data.cstmr.cstrmrnm)
						this.viewBankResult.setValue(res.data.bankORcoa_id ? `${res.data.bankORcoa_id.acctName.toUpperCase()} - ${res.data.bankORcoa_id.acctNo}` : " ")
						this.viewBrandResult.setValue(`${res.data.brand.brand} - ${this.serviceFormat.rupiahFormatImprovement(res.data.brand.rate)}`)
						this.rateBrand = res.data.brand ? res.data.brand.rate : ""
						this.checkedPaid = res.data.isPaid
						// Deklarasi isPPn check value
						this.isChangeToPPN = res.data.totalPlusTax ? true : false

						if (res.data.brand) this.isBrand = false
						else this.isBrand = true
						this.initTrGalon();
					}
				});
			}

		});
		this.subscriptions.push(routeSubscription);
	}
	initTrGalon() {
		if (this.trGalon.imageTrGalon) this.images.push(this.trGalon.imageTrGalon)
		if (this.trGalon.imageDelivery) this.imagesDelivery.push(this.trGalon.imageDelivery)
		this.createForm();
		this.loadUnit();
		this.loadBrand()
		this.loadTenant()
		this.loadAccountBank("")
	}

	// tester START
	buttonTester(id: string) {
		this.http.get<any>(`${environment.baseAPI}/api/contract/ownership/unit/${id}`).subscribe(
			res => {
				this.isToken = res.data[0].isToken
			}
		)

	}
	// tester END

	createForm() {
		this.trGalonForm = this.trGalonFB.group({
			_id: [this.trGalon._id],
			unit: [this.trGalon.unit ? this.trGalon.unit._id : "", Validators.required],
			cstmr: [this.trGalon.cstmr ? this.trGalon.cstmr : "", Validators.required],
			trDate: [this.trGalon.trDate, Validators.required],
			delivery: [this.trGalon.delivery, Validators.required],
			payment: [this.trGalon.payment, Validators.required],
			qty: [this.trGalon.qty, Validators.required],
			brand: [this.trGalon.brand ? this.trGalon.brand._id : "", Validators.required],
			bankORcoa_id: [this.trGalon.bankORcoa_id ? this.trGalon.bankORcoa_id._id : "", Validators.required],
			totalTr: [this.serviceFormat.rupiahFormatImprovement(this.trGalon.totalTr ? this.trGalon.totalTr : 0), Validators.required],
			// total transaction with PPN 
			totalTrAfterPPN: [this.serviceFormat.rupiahFormatImprovement(this.trGalon.totalPlusTax ? this.trGalon.totalPlusTax : 0), Validators.required],
			isPaid: [this.trGalon.isPaid],
			imageTrGalon: [this.trGalon.imageTrGalon],
			imageDelivery: [this.trGalon.imageDelivery],
			// ts
			urlmeter: [""],
			deliveryStatus: [this.trGalon.deliveryStatus ? this.trGalon.deliveryStatus : ""],
		});
	}

	loadUnit() {
		this.loadingData.unit = true;
		this.selection.clear();
		const queryParams = new QueryOwnerTransactionModel(
			null,
			"asc",
			"grpnm",
			1,
			10000
		);
		this.serviceUnit.getDataUnitForGalon(queryParams).subscribe((res) => {
			this.unitResult = res.data;
			this.UnitResultFiltered = this.unitResult.slice();
			this.cd.markForCheck();
			this.viewUnitResult.enable();
			this.loadingData.unit = false;

		});
	}

	loadTenant() {
		this.loadingData.unit = true;
		this.selection.clear();
		const queryParams = new QueryOwnerTransactionModel(
			null,
			"asc",
			"grpnm",
			1,
			10000
		);
		this.serviceUnit.getDataCustomerForGalon(queryParams).subscribe((res) => {
			this.tenantResult = res.data
			this.TenantResultFiltered = this.tenantResult
			this.cd.markForCheck();
		});
	}

	loadBrand() {
		this.loadingData.unit = true;
		this.selection.clear();
		const queryParams = new QueryOwnerTransactionModel(
			null,
			"asc",
			"grpnm",
			1,
			10000
		);
		this.serviceUnit.getDataBrandForGalon(queryParams).subscribe((res) => {
			this.brandResult = res.data
			this.BrandResultFiltered = this.brandResult
			this.cd.markForCheck();
		});
	}

	selectFile(event) {
		this.selectedFiles = event.target.files;
	}

	validateFile(name: String) {
		var ext = name.substring(name.lastIndexOf(".") + 1);
		if (
			ext.toLowerCase() == "png" ||
			ext.toLowerCase() == "jpg" ||
			ext.toLowerCase() == "jpeg"
		) {
			return true;
		} else {
			return false;
		}
	}

	upload() {
		//this.uploadProgress = 0;
		this.currentFile = this.selectedFiles.item(0);

		this.serviceTrGalon
			.upload(this.currentFile)
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
							this.imageSrc = event.body.url;
							this.trGalonForm.controls.imageTrGalon.setValue(
								this.url
							);
							//this.fileInfos = this.uploadService.getFiles();
						}
					}
				},
				(err) => {
					this.cd.markForCheck();
					this.message = "Could not upload the file!";
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

	goBackWithId() {
		const url = `/trgalon`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}

	refreshTrGalon(isNew: boolean = false, id: string = "") {
		let url = this.router.url;
		if (!isNew) {
			this.router.navigate([url], { relativeTo: this.activatedRoute });
			return;
		}

		url = `/trGalon/edit/${id}`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}

	// Load total tr with PPN
	loadTotalTransaction() {
		const controls = this.trGalonForm.controls;
		const totalTr = this.serviceFormat.formatFloat(controls.totalTr.value)
		const taxAmount = totalTr * (this.ppnValue / 100)
		const result = totalTr + taxAmount

		this.isChangeToPPN = true

		controls.totalTrAfterPPN.setValue(this.serviceFormat.rupiahFormatImprovement(result))

		this.cd.markForCheck()
	}

	onSubmit(withBack: boolean = false) {
		if (this.myFiles.length > 0) {
			// Upload Image START
			this.serviceTrGalon.upload(this.myFiles[0]).pipe(finalize(() => this.reset())).subscribe(
				(event) => {
					this.cd.markForCheck();
					if (event.type === HttpEventType.UploadProgress) {
						this.uploadProgress = Math.round(
							(100 * event.loaded) / event.total
						);
					} else if (event.type === HttpEventType.Response) {
						if (event instanceof HttpResponse) {
							this.message = event.body.message;
							this.fileName = event.body.filename;
						}
					}
				}
			);
			// Upload Image END
		}

		this.hasFormErrors = false;
		const controls = this.trGalonForm.controls;

		if (this.trGalonForm.invalid) {
			Object.keys(controls).forEach((controlName) =>
				controls[controlName].markAsTouched()
			);

			this.hasFormErrors = true;
			this.selectedTab = 0;
			return;
		}

		if (this.myFiles.length > 0) {
			setTimeout(() => {
				const editedTrGalon = this.prepareTrGalon();
				this.updateTrGalon(editedTrGalon, withBack);
			}, 500);
		} else {
			const editedTrGalon = this.prepareTrGalon();
			this.updateTrGalon(editedTrGalon, withBack);
		}
	}

	prepareTrGalon(): TrGalonModel {
		const controls = this.trGalonForm.controls;
		const _trGalon = new TrGalonModel();
		_trGalon.clear();
		_trGalon._id = controls._id.value
		_trGalon.unit = controls.unit.value
		_trGalon.cstmr = controls.cstmr.value
		_trGalon.trDate = controls.trDate.value
		_trGalon.delivery = controls.delivery.value
		_trGalon.payment = controls.payment.value
		_trGalon.qty = controls.qty.value
		_trGalon.brand = controls.brand.value
		_trGalon.bankORcoa_id = controls.bankORcoa_id.value
		_trGalon.imageTrGalon = this.fileName
		_trGalon.totalTr = this.serviceFormat.formatFloat(controls.totalTr.value)
		_trGalon.isPaid = controls.isPaid.value ? controls.isPaid.value : false
		_trGalon.isRead = false
		_trGalon.imageTrGalon = controls.imageTrGalon.value

		_trGalon.deliveryStatus = this.moduleGalon.flowStatusGalon(this.trGalon.deliveryStatus)

		return _trGalon;
	}

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


	updateTrGalon(_trGalon: TrGalonModel, withBack: boolean = false) {

		const editSubscription = this.serviceTrGalon.updateTrGalon(_trGalon).subscribe(
			res => {
				const message = `TrGalon successfully has been saved.`;
				this.layoutUtilsService.showActionNotification(message);
				// this.layoutUtilsService.showActionNotification(message, MessageType.Update, 5000, true, true);
				const url = `/trgalon`;
				this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
			},
			err => {
				console.error(err);
				const message = 'Error while saving trGalon | ' + err.statusText;
				this.layoutUtilsService.showActionNotification(message, MessageType.Update, 5000, true, false);
			}
		);
		this.subscriptions.push(editSubscription);
	}

	loadAccountBank(value) {
		this.selection.clear();
		const queryParams = {
			filter: value
		}
		this.serviceTrGalon.getListAccountBankBilling(queryParams).subscribe(
			res => {
				this.bankResult = res.data;
			}
		);
	}

	changeDeliveryStatus(value: string) {
		if (value === "open") return "Open"
		else if (value === "progress") return "On Progress"
		else if (value === "delivery") return "On Delivery"
		else if (value === "done") return "Done"
	}

	_setBlockValueBank(value) {
		const controls = this.trGalonForm.controls;
		controls.bankORcoa_id.setValue(value._id)
	}



	_onKeyup(e: any, mode) {
		if (mode === "unit") this._filterCstmrList(e.target.value);
		else if (mode === "cstmr") this._filterCstmrTenantList(e.target.value);
		else if (mode === "brand") this._filterBrandList(e.target.value);
	}


	_onKeyupBank(e: any) {
		this._filterBankList(e.target.value);
	}

	_filterBankList(text: string) {
		// this.ResultBankFiltered = this.bankResult.filter((i) => {
		// 	const filterText = `${i.cdunt.toLocaleLowerCase()}`;
		// 	if (filterText.includes(text.toLocaleLowerCase())) return i;
		// });
		this.loadAccountBank(text)
	}

	_filterCstmrList(text: string) {
		this.UnitResultFiltered = this.unitResult.filter((i) => {
			const filterText = `${i.cdunt.toLocaleLowerCase()}`;
			if (filterText.includes(text.toLocaleLowerCase())) return i;
		});
	}

	_filterCstmrTenantList(text: string) {
		this.TenantResultFiltered = this.tenantResult.filter((i) => {
			const filterText = `${i.cstrmrnm.toLocaleLowerCase()}`;
			if (filterText.includes(text.toLocaleLowerCase())) return i;
		});
	}

	_filterBrandList(text: string) {
		this.BrandResultFiltered = this.brandResult.filter((i) => {
			const filterText = `${i.brand.toLocaleLowerCase()}`;
			if (filterText.includes(text.toLocaleLowerCase())) return i;
		});
	}

	quantity(e) {
		const controls = this.trGalonForm.controls;
		let value = parseFloat(e.target.value)
		if (value > 0) {
			if (this.rateBrand) controls.totalTr.setValue(this.serviceFormat.rupiahFormatImprovement(parseFloat(this.rateBrand) * value))
			controls.qty.setValue(value)
			this.isBrand = false

			// Load Tota Transaction with PPN
			this.loadTotalTransaction()
		} else {
			this.isBrand = true
		}
	}

	// Upload Image (new) START
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

	_setBlockValue(value, mode) {
		const controls = this.trGalonForm.controls;
		if (mode === "unit") controls.unit.setValue(value._id)
		else if (mode === "cstmr") controls.cstmr.setValue(value._id)
		else if (mode === "brand") {
			let qtyValue = parseFloat(controls.qty.value)
			let result = (value.rate * qtyValue)
			this.rateBrand = value.rate
			controls.brand.setValue(value._id)
			controls.totalTr.setValue(this.serviceFormat.rupiahFormatImprovement(result))

			// Load Tota Transaction with PPN
			this.loadTotalTransaction()
		}
	}

	paider(e) {
		const controls = this.trGalonForm.controls;
		controls.isPaid.setValue(e.target.checked)
	}

	getComponentTitle() {
		let result = `Update Transaction Galon`;
		return result;
	}

	onAlertClose($event) {
		this.hasFormErrors = false;
	}

	ngOnDestroy() {
		this.subscriptions.forEach(sb => sb.unsubscribe());
	}
	unitOnChange(e) {

	}


	addEvent(input, e) {
		const controls = this.trGalonForm.controls;
		controls.trDate.setValue(e.value
		);
	}


	addEventDelivery(input, e) {
		const controls = this.trGalonForm.controls;
		controls.delivery.setValue(e.value
		);
	}

}
