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
import { MatDatepickerInputEvent } from "@angular/material/datepicker";
// RxJS
import { BehaviorSubject, Observable, of, Subscription } from "rxjs";
// NGRX
import { Store, select } from "@ngrx/store";
import { Update } from "@ngrx/entity";
import { AppState } from "../../../../core/reducers";
import { finalize } from "rxjs/operators";
import { HttpEventType, HttpResponse } from "@angular/common/http";


// Layout
import {
	SubheaderService,
	LayoutConfigService,
} from "../../../../core/_base/layout";
import {
	LayoutUtilsService,
	MessageType,
	QueryParamsModel,
} from "../../../../core/_base/crud";
import {
	selectLastCreatedTrGalonId,
	selectTrGalonActionLoading,
	selectTrGalonById,
} from "../../../../core/trGalon/trGalon.selector";
import {
	TrGalonOnServerCreated,
	TrGalonUpdated,
} from "../../../../core/trGalon/trGalon.action";
import { TrGalonModel } from "../../../../core/trGalon/trGalon.model";
import { TrGalonService } from "../../../../core/trGalon/trGalon.service";
import { SelectionModel } from "@angular/cdk/collections";
import {
	DateAdapter,
	MAT_DATE_FORMATS,
	MAT_DATE_LOCALE,
	MatDatepicker,
} from "@angular/material";
import * as _moment from "moment";
const moment = _rollupMoment || _moment;
import { default as _rollupMoment, Moment } from "moment";
import { CustomerService } from "../../../../core/customer/customer.service";
import { UnitService } from "../../../../core/unit/unit.service";
import { PowerTransactionService } from "../../../../core/power/transaction/transaction.service";
import { WaterTransactionService } from "../../../../core/water/transaction/transaction.service";
import { OwnershipContractService } from "../../../../core/contract/ownership/ownership.service";
import { LeaseContractService } from "../../../../core/contract/lease/lease.service";
import { QueryOwnerTransactionModel } from "../../../../core/contract/ownership/queryowner.model";
import { PowerMeterService } from "../../../../core/power";
import { WaterMeterService } from "../../../../core/water/meter/meter.service";
import { async } from "@angular/core/testing";
import { ServiceFormat } from "../../../../core/serviceFormat/format.service";

@Component({
	selector: "kt-add-trGalon",
	templateUrl: "./add-trGalon.component.html",
	styleUrls: ["./add-trGalon.component.scss"],
})
export class AddTrGalonComponent implements OnInit, OnDestroy {
	@ViewChild('fileInput', { static: false }) fileInputEl: ElementRef;

	codenum;
	type;
	billstats;

	//listrik
	pemakaianListrik: number;
	datasc: number;
	hasilsc: number;
	datappju: number;
	hasilppju: number;
	dataloss: number;
	allpoweramount: number;
	monthPower: number;

	amountIplJournal: any

	//water
	monthWater: number;
	allwateramount: number;

	//
	dataAllIPLParse: number;
	isfreeIpl: boolean = false;
	isfreeAbodement: boolean = false;

	// isToken Unit Start
	isToken: boolean = false;
	// isToken Unit End
	isUnitChild: boolean = false;

	//Error Message Water || Electricity
	message: string;
	hasError: boolean = false;

	trGalon: TrGalonModel;
	trGalonId$: Observable<string>;
	oldTrGalon: TrGalonModel;
	selectedTab = 0;
	loading$: Observable<boolean>;
	trGalonForm: FormGroup;
	hasFormErrors = false;
	isMonthDifferents = false;
	unitResult: any[] = [];
	tenantResult: any[] = [];
	brandResult: any[] = [];
	customerResult: any[] = [];
	powerResult: any[] = [];
	waterResult: any[] = [];
	selection = new SelectionModel<TrGalonModel>(true, []);
	date = new FormControl(moment());
	date1 = new FormControl(new Date());
	serializedDate = new FormControl(new Date().toISOString());
	duedate = new FormControl();
	trGalonSave: boolean = false;
	UnitResultFiltered = [];
	TenantResultFiltered = [];
	BrandResultFiltered = [];

	rateBrand: any = ""

	viewUnitResult = new FormControl();
	viewCstmrResult = new FormControl();
	viewBrandResult = new FormControl();

	viewBankResult = new FormControl();
	bankResult: any[] = [];

	selectedFiles: FileList;
	currentFile: File;
	url = "";
	imageSrc: string;
	fileName = null;
	uploadProgress: number;
	uploadSub: Subscription;

	loadingData = {
		unit: false,
	};

	billmntE: Date;
	billmntW: Date;

	dateConsumption: any = ""

	useAmountRslt = 0;

	isBrand: boolean = true

	// PPN Value not get Collection, PERLU DIPERBAIKI
	ppnValue: number = 11

	// Upload Image (new) START
	images: any[] = []
	myFiles: any[] = []

	// Upload Image (new) END

	// Private properties
	private subscriptions: Subscription[] = [];
	constructor(
		private activatedRoute: ActivatedRoute,
		private serviceFormat: ServiceFormat,
		private router: Router,
		private trGalonFB: FormBuilder,
		private layoutUtilsService: LayoutUtilsService,
		private store: Store<AppState>,
		private serviceTrGalon: TrGalonService,
		private serviceUnit: UnitService,
		private ownService: OwnershipContractService,
		private leaseService: LeaseContractService,
		private powerservice: PowerTransactionService,
		private waterservice: WaterTransactionService,
		private cd: ChangeDetectorRef
	) { }

	ngOnInit() {
		this.loading$ = this.store.pipe(select(selectTrGalonActionLoading));
		const routeSubscription = this.activatedRoute.params.subscribe(
			(params) => {
				const id = params.id;
				if (id) {
					this.store
						.pipe(select(selectTrGalonById(id)))
						.subscribe((res) => {
							if (res) {
								this.trGalon = res;
								this.oldTrGalon = Object.assign(
									{},
									this.trGalon
								);
								this.initTrGalon();
							}
						});
				} else {
					this.trGalon = new TrGalonModel();
					this.trGalon.clear();
					this.initTrGalon();
				}
			}
		);
		this.subscriptions.push(routeSubscription);
	}

	initTrGalon() {
		this.createForm();
		this.loadUnit();
		this.loadAccountBank("")
		this.loadTenant();
		this.loadBrand()
	}

	createForm() {
		this.trGalonForm = this.trGalonFB.group({
			unit: ["", Validators.required],
			cstmr: ["", Validators.required],
			trDate: ["", Validators.required],
			delivery: ["", Validators.required],
			payment: ["", Validators.required],
			qty: ["", Validators.required],
			brand: ["", Validators.required],
			totalTr: ["", Validators.required],
			// total transaction with PPN
			totalTrAfterPPN: ["", Validators.required],
			bankORcoa_id: ["", Validators.required],
			isPaid: [""],
			imageTrGalon: [""],
			// new
			isRead: [false],
			deliveryStatus: ["open"],
		});
	}

	/**
	 * @param value
	 */
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

	_setBlockValueBank(value) {
		const controls = this.trGalonForm.controls;
		controls.bankORcoa_id.setValue(value._id)
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

	// Load total tr with PPN
	loadTotalTransaction() {
		const controls = this.trGalonForm.controls;
		const totalTr = this.serviceFormat.formatFloat(controls.totalTr.value)
		const taxAmount = totalTr * (this.ppnValue / 100)
		const result = totalTr + taxAmount

		controls.totalTrAfterPPN.setValue(this.serviceFormat.rupiahFormatImprovement(result))
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

	paider(e) {
		const controls = this.trGalonForm.controls;
		controls.isPaid.setValue(e.target.checked)
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

	// upload() {
	// 	//this.uploadProgress = 0;
	// 	this.currentFile = this.selectedFiles.item(0);

	// 	this.serviceTrGalon
	// 		.upload(this.currentFile)
	// 		.pipe(finalize(() => this.reset()))
	// 		.subscribe(
	// 			(event) => {
	// 				if (!this.validateFile(this.currentFile.name)) {
	// 					this.message = "Selected file format is not supported.";
	// 					return false;
	// 				}
	// 				this.cd.markForCheck();
	// 				if (event.type === HttpEventType.UploadProgress) {
	// 					this.uploadProgress = Math.round(
	// 						(100 * event.loaded) / event.total
	// 					);
	// 				} else if (event.type === HttpEventType.Response) {
	// 					if (event instanceof HttpResponse) {
	// 						this.message = event.body.message;
	// 						this.url = event.body.url;
	// 						// console.log(this.url);
	// 						this.imageSrc = event.body.url;
	// 						this.trGalonForm.controls.imageTrGalon.setValue(
	// 							this.url
	// 						);
	// 						//this.fileInfos = this.uploadService.getFiles();
	// 					}
	// 				}
	// 			},
	// 			(err) => {
	// 				this.cd.markForCheck();
	// 				this.message = "Could not upload the file!";
	// 				this.imageSrc = "";
	// 				this.currentFile = undefined;
	// 			}
	// 		);

	// 	this.selectedFiles = undefined;
	// }

	cancelUpload() {
		this.uploadSub.unsubscribe();
		this.reset();
	}

	reset() {
		this.uploadProgress = null;
		this.uploadSub = null;
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
	// Upload Image (new) END

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


	valueTotalTrGalon = 0;

	prepareTrGalon(): TrGalonModel {


		const controls = this.trGalonForm.controls;
		const _trGalon = new TrGalonModel();
		_trGalon.unit = controls.unit.value
		_trGalon.cstmr = controls.cstmr.value
		_trGalon.trDate = controls.trDate.value
		_trGalon.qty = controls.qty.value
		_trGalon.brand = controls.brand.value
		_trGalon.delivery = controls.delivery.value
		_trGalon.payment = controls.payment.value
		_trGalon.bankORcoa_id = controls.bankORcoa_id.value
		_trGalon.isMobile = false
		_trGalon.totalTr = this.serviceFormat.formatFloat(controls.totalTr.value)
		_trGalon.isPaid = controls.isPaid.value ? controls.isPaid.value : false
		// update
		_trGalon.isRead = controls.isRead.value
		_trGalon.deliveryStatus = controls.deliveryStatus.value
		// Upload Image
		_trGalon.imageTrGalon = this.fileName

		return _trGalon;
	}

	onSubmit = async (withBack: boolean = false) => {
		try {
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
					this.addTrGalon(editedTrGalon, withBack);
				}, 500);
			} else {
				const editedTrGalon = this.prepareTrGalon();
				this.addTrGalon(editedTrGalon, withBack);
			}

		} catch (error) {
			console.log(error);
			this.layoutUtilsService.showActionNotification(
				error,
				MessageType.Create,
				5000,
				true,
				true
			);
		}
	};

	addTrGalon(_trGalon: TrGalonModel, withBack: boolean = false) {
		const addSubscription = this.serviceTrGalon
			.createTrGalon(_trGalon)
			.subscribe(
				(res) => {
					if (res) {
						const message = `New trGalon successfully has been added.`;
						this.layoutUtilsService.showActionNotification(
							message,
							MessageType.Create,
							5000,
							true,
							true
						);
						const url = `/trgalon`;
						this.router.navigateByUrl(url, {
							relativeTo: this.activatedRoute,
						});
					}
				},
				(err) => {
					console.error(err);
					const message =
						"Error while adding trGalon | " + err.statusText;
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

	ngOnDestroy() {
		this.subscriptions.forEach((sb) => sb.unsubscribe());
	}

	addEvent(type: string, event: MatDatepickerInputEvent<Date>) {
		const controls = this.trGalonForm.controls;
		controls.trDate.setValue(event.value
		);
	}
	addEventDelivery(type: string, event: MatDatepickerInputEvent<Date>) {
		const controls = this.trGalonForm.controls;
		controls.delivery.setValue(event.value
		);
	}


	getComponentTitle() {
		let result = "Create Transaksi Galon";
		return result;
	}

	onAlertClose($event) {
		this.hasFormErrors = false;
		this.hasError = false;
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
}
