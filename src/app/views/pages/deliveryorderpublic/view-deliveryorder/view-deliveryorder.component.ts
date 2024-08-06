import { ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
// RxJS
import { BehaviorSubject, Observable, of, Subscription } from 'rxjs';
// NGRX
import { Store, select } from '@ngrx/store';
import { Update } from '@ngrx/entity';
import { AppState } from '../../../../core/reducers';
// Layout
import { SubheaderService, LayoutConfigService } from '../../../../core/_base/layout';
import { LayoutUtilsService, MessageType } from '../../../../core/_base/crud';
import { PublicDeliveryorderModel } from "../../../../core/deliveryorderpublic/publicdeliveryorder.model";
import {
	selectLastCreatedPublicDeliveryorderId,
	selectPublicDeliveryorderActionLoading,
	selectPublicDeliveryorderById
} from "../../../../core/deliveryorderpublic/publicdeliveryorder.selector";
import { PublicDeliveryorderService } from '../../../../core/deliveryorderpublic/publicdeliveryorder.service';
import { SelectionModel } from '@angular/cdk/collections';
import { OwnershipContractService } from '../../../../core/contract/ownership/ownership.service';
import { QueryOwnerTransactionModel } from '../../../../core/contract/ownership/queryowner.model';
import { CategoryService } from '../../../../core/category/category.service';
import { QueryCategoryModel } from '../../../../core/category/querycategory.model';
import { QueryDefectModel } from '../../../../core/defect/querydefect.model';
import { DefectService } from '../../../../core/defect/defect.service';
import { SubdefectService } from '../../../../core/subdefect/subdefect.service';
import { QuerySubdefectModel } from '../../../../core/subdefect/querysubdefect.model';
import { DomSanitizer } from '@angular/platform-browser';
import { HttpClient } from '@angular/common/http';
import { LeaseContractService } from '../../../../core/contract/lease/lease.service';
import { QueryEngineerModel } from '../../../../core/engineer/queryengineer.model';
import { EngineerService } from '../../../../core/engineer/engineer.service';
import { QueryUnitModel } from '../../../../core/unit/queryunit.model';
import { UnitService } from '../../../../core/unit/unit.service';
import { environment } from '../../../../../environments/environment';
import { MatDialog, MatTable } from '@angular/material';
import { ServiceFormat } from '../../../../core/serviceFormat/format.service';
import { ModuleTicketingPublic } from '../../../../core/ticketpublic/module/moduleservice';

@Component({
	selector: 'kt-view-deliveryorder',
	templateUrl: './view-deliveryorder.component.html',
	styleUrls: ['./view-deliveryorder.component.scss']
})
export class ViewDoComponent implements OnInit, OnDestroy {
	@ViewChild('fileInput', { static: false }) fileInputEl: ElementRef;

	// Public properties
	publicDeliveryorder: PublicDeliveryorderModel;
	type;
	DeliveryorderId$: Observable<string>;
	oldDeliveryorder: PublicDeliveryorderModel;
	selectedTab = 0;
	loading$: Observable<boolean>;
	deliveryorderForm: FormGroup;
	selection = new SelectionModel<PublicDeliveryorderModel>(true, []);
	hasFormErrors = false;
	unitResult: any[] = [];
	enResult: any[] = [];
	FilterEnResult: any[] = [];
	myFiles: any[] = []
	images: any = [];
	cResult: any[] = [];
	dResult: any[] = [];
	sResult: any[] = [];
	codenum: any;
	selectedFile: File;
	retrievedImage: any;
	base64Data: any;
	message: string;

	@ViewChild('myTable', { static: false }) table: MatTable<any>;
	displayedColumns = ['item', 'cost', 'action'];
	ccList = [{ id: '' }];

	loading: boolean;
	viewUnitResult = new FormControl()
	viewEnResult = new FormControl();


	loader = {
		location: false,
		sublocation: false,
		defect: false,
		unit: false,
		loadingNumber: false
	}
	cdUnit: string = ""
	imageName: any;
	//button hidden
	ckReject: boolean;
	isHidden: boolean = true;
	buttonReshedule: boolean = true;
	buttonSave: boolean = true
	buttonReject: boolean = true;
	buttonRes: boolean = true;
	totalField: number = 1

	changeEngineer: boolean = false;
	checkChangeEngineer: boolean = true;


	reportFixCheck: boolean = true

	loadingData = {
		engineer: false,
	}
	valPriority: string = "true"
	cekPriority: boolean = true
	spnPriority: string = ""
	// Private properties
	private subscriptions: Subscription[] = [];
	constructor(
		private activatedRoute: ActivatedRoute,
		private serviceFormat: ServiceFormat,
		private cdr: ChangeDetectorRef,
		private moduleTicketing: ModuleTicketingPublic,

		private router: Router,
		private deliveryorderFB: FormBuilder,
		private subheaderService: SubheaderService,
		private layoutUtilsService: LayoutUtilsService,
		private store: Store<AppState>,
		private service: PublicDeliveryorderService,
		private ownService: OwnershipContractService,
		private leaseService: LeaseContractService,
		private uService: UnitService,
		private cService: CategoryService,
		private dService: DefectService,
		private sService: SubdefectService,
		private enService: EngineerService,
		private layoutConfigService: LayoutConfigService,
		private http: HttpClient,
		private sanitizer: DomSanitizer,
		private dialog: MatDialog,
	) { }

	ngOnInit() {
		this.loading$ = this.store.pipe(select(selectPublicDeliveryorderActionLoading));
		const routeSubscription = this.activatedRoute.params.subscribe(params => {
			const id = params.id;
			if (id) {
				this.store.pipe(select(selectPublicDeliveryorderById(id))).subscribe(res => {
					if (res) {
						this.publicDeliveryorder = res;
						if (res.status === "vis-for-fix") this.reportFixCheck = false
						this.viewEnResult.setValue(res.engFixing ? res.engFixing.name : "")
						this.oldDeliveryorder = Object.assign({}, this.publicDeliveryorder);
						this.initDeliveryorder();
					}
				});
			}
		});
		this.subscriptions.push(routeSubscription);
		this.getImage();
	}

	initDeliveryorder() {
		this.createForm();
		this.hiddenReschedule();
		this.hiddenSave();
		this.loadEnginer();
		this.hiddenAfterRes();
		this.getUnitId(this.publicDeliveryorder.unitID)
	}

	showHidden() {
		this.isHidden = true;
	}

	hiddenReschedule() {
		if (this.publicDeliveryorder.status != "waiting for confirmation") {
			this.buttonReshedule = true;

		} else {
			this.buttonReshedule = false;
		}
	}

	hiddenAfterRes() {
		this.buttonRes = false;
	}

	hiddenSave() {
		if (this.publicDeliveryorder.status === "wait-sched-surv" || this.publicDeliveryorder.status === "wait-confirm-surv" ||
			this.publicDeliveryorder.status === "tick-cust-approve" || this.publicDeliveryorder.status === "wait-sched-wo" ||
			this.publicDeliveryorder.status === "wait-approve-mgr" || this.publicDeliveryorder.status === "eng-mgr-approve" ||
			this.publicDeliveryorder.status === "resched-for-fix" || this.publicDeliveryorder.status === "wait-confirm-wo" ||
			this.publicDeliveryorder.handledBy === "mob") {
			this.buttonSave = true;
		} else {
			this.buttonSave = false;
		}
	}

	createForm() {
		// if (this.publicDeliveryorder.status === "open") {
		let objFormMultiGl = {}
		for (let i = 1; i <= 30; i++) {
			objFormMultiGl[`item${i}`] = [{ value: undefined, disabled: false }];
			objFormMultiGl[`cost${i}`] = [{ value: "", disabled: false }];
		}
		this.loadCategory();
		this.deliveryorderForm = this.deliveryorderFB.group({
			_id: [{ value: this.publicDeliveryorder._id, disabled: true }],
			doId: [{ value: this.publicDeliveryorder.doId, disabled: true }],
			ticketId: [{ value: this.publicDeliveryorder.ticket._id, disabled: true }],
			subject: [{ value: this.publicDeliveryorder.ticket.subject, disabled: true }],
			contract: [{ value: this.publicDeliveryorder.ticket.contract, disabled: true }],
			reason: [{ value: "", disabled: true }],
			contract2: [{ value: this.publicDeliveryorder.ticket.contract2, disabled: true }],
			tenant_phone: [{ value: this.publicDeliveryorder.ticket.contract.contact_phone, disabled: true }],
			tenant_email: [{ value: this.publicDeliveryorder.ticket.contract.contact_email, disabled: true }],
			description: [{ value: this.publicDeliveryorder.description, disabled: true }],
			priority: [{ value: this.publicDeliveryorder.ticket.priority, disabled: true }],
			status: [{ value: this.publicDeliveryorder.status, disabled: true }],
			unit: [{ value: this.publicDeliveryorder.unit, disabled: true }],
			unit2: [{ value: '', disabled: true }],
			attachment: [this.publicDeliveryorder.attachment],
			attachmentFixing: [this.publicDeliveryorder.attachmentFixing],
			deliveryorderdate: [{ value: this.publicDeliveryorder.createdDate, disabled: true }],
			createdDate: [{ value: this.publicDeliveryorder.createdDate, disabled: true }],
			fixingDesc: [{ value: this.publicDeliveryorder.fixingDesc ? this.publicDeliveryorder.fixingDesc : "", disabled: true }],
			surveyDesc: [{ value: this.publicDeliveryorder.surveyDesc ? this.publicDeliveryorder.surveyDesc : "", disabled: true }],
			// New Flow
			engFixingDesc: [{ value: this.publicDeliveryorder.engFixingDesc ? this.publicDeliveryorder.engFixingDesc : "", disabled: false }],
			visitDateFixing: [{ value: this.publicDeliveryorder.visitDateFixing ? this.publicDeliveryorder.visitDateFixing : "", disabled: false }],
			visitDateSurv: [{ value: this.publicDeliveryorder.visitDateSurv ? this.publicDeliveryorder.visitDateSurv : "", disabled: false }],
			engSurvey: [{ value: this.publicDeliveryorder.engSurvey ? this.publicDeliveryorder.engSurvey._id : "", disabled: false }],
			engFixing: [{ value: this.publicDeliveryorder.engFixing ? this.publicDeliveryorder.engFixing._id : "", disabled: false }],

		});
	}



	addCC(e) {
		const controls = this.deliveryorderForm.controls;

		this.ccList.push({ id: '' });
		this.table.renderRows();
	}


	removeCC(i: number) {
		const controls = this.deliveryorderForm.controls;

		this.ccList.splice(i, 1);
		this.table.renderRows();
	}


	loadEnginer() {
		this.selection.clear();
		const queryParams = new QueryEngineerModel(
			null,
			"asc",
			null,
			1,
			1000
		);
		this.enService.getListEngineer(queryParams).subscribe(
			res => {
				this.enResult = res.data;
				this.FilterEnResult = res.data;
			}
		);
	}

	_onKeyup(e: any) {
		this._filterEngineerList(e.target.value);
	}

	_filterEngineerList(text: string) {
		this.FilterEnResult = this.enResult.filter((i) => {
			const filterText = `${i.name.toLocaleLowerCase()}`;
			if (filterText.includes(text.toLocaleLowerCase())) return i;
		});
	}

	_setEngValue(value, status) {
		if (status === "survey") this.deliveryorderForm.controls.engSurvey.setValue(value._id);
		else if (status === "fixing") this.deliveryorderForm.controls.engFixing.setValue(value._id);
		else if (status === "change") {
			this.deliveryorderForm.controls.engFixingDesc.setValue("");
			if (value._id === this.publicDeliveryorder.engFixing._id) this.checkChangeEngineer = true;
			else this.checkChangeEngineer = false;

			this.changeEngineer = true
			this.deliveryorderForm.controls.engFixing.setValue(value._id);
		}
	}


	getUnitId(id) {
		this.uService.findUnitById(id).subscribe(
			data => {
				console.log(data, "get data unit");

				this.type = data.data.type;
				this.cdUnit = data.data.cdunt.toUpperCase()
				// this.deliveryorderForm.controls.unit.setValue(data.data._id);

				if (this.type == "owner" || this.type == "pp") {
					this.ownService.findOwnershipContractByUnit(id).subscribe(
						dataowner => {
							this.deliveryorderForm.controls.tenant_phone.setValue(dataowner.data[0].contact_phone);
							this.deliveryorderForm.controls.tenant_email.setValue(dataowner.data[0].contact_email);
						}
					)
				} else {
					this.leaseService.findLeaseContractByUnit(id).subscribe(
						datalease => {
							this.deliveryorderForm.controls.tenant_phone.setValue(datalease.data[0].contact_phone);
							this.deliveryorderForm.controls.tenant_email.setValue(datalease.data[0].contact_email);
						}
					)
				}
			});
	}

	loadCategory() {
		this.selection.clear();
		const queryParams = new QueryCategoryModel(
			null,
			"asc",
			null,
			1,
			1000
		);
		this.cService.getListCategory(queryParams).subscribe(
			res => {
				this.cResult = res.data;
			}
		);
	}

	categoryOnChange(id) {
		if (id) {
			this.loadDefect(id);
		}
	}

	loadDefect(id) {
		this.selection.clear();
		const queryParams = new QueryDefectModel(
			null,
			"asc",
			null,
			1,
			1000
		);
		this.dService.getListDefectbyCategoryId(id).subscribe(
			res => {
				this.dResult = res.data;
			}
		);
	}

	defectOnChange(id) {
		if (id) {
			this.loadSubdefect(id);
		}
	}

	loadSubdefect(id) {
		this.selection.clear();
		const queryParams = new QuerySubdefectModel(
			null,
			"asc",
			null,
			1,
			1000
		);
		this.sService.findSubdefectByIdParent(id).subscribe(
			res => {
				this.sResult = res.data;
			}
		);
	}



	// currency format
	changeAmount(event, id) {
		this.toCurrency(event, id);
	}

	toCurrency(event: any, id) {
		// Differenciate function calls (from event or another function)
		let controls = this.deliveryorderForm.controls;
		let value = event.target.value
		// controls.multiGLAccount.get(`amount${id}`).setValue(formattedNumber);

		var number_string = value.replace(/[^,\d]/g, "").toString(),
			split = number_string.split(","),
			sisa = split[0].length % 3,
			rupiah = split[0].substr(0, sisa),
			ribuan = split[0].substr(sisa).match(/\d{3}/gi);

		// tambahkan titik jika yang di input sudah menjadi value ribuan
		let separator
		if (ribuan) {
			separator = sisa ? "." : "";
			rupiah += separator + ribuan.join(".");
		}

		rupiah = split[1] != undefined ? split[1][1] != undefined ? rupiah + ","
			+ split[1][0] + split[1][1] : split[1] != '' ? rupiah + "," + split[1][0] : rupiah + "," + split[1] : rupiah;

		return rupiah
	}

	rejectDeliveryorder(id) {
		this.router.navigate(['/publicdeliveryorder/reject', id], { relativeTo: this.activatedRoute });
	}

	loadTotalCost() {
		const controls = this.deliveryorderForm.controls
		let result = 0
		for (let i = 1; i <= 30; i++) {
			let v = controls.itemReq.get(('cost' + i)).value ? controls.itemReq.get(('cost' + i)).value : 0
			result += this.serviceFormat.formatFloat(v)
		}
		controls.totalCost.setValue(this.serviceFormat.rupiahFormatImprovement(result))
	}


	goBackWithId() {
		const url = `/publicMgrDeliveryorder`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}

	refreshDeliveryorder(isNew: boolean = false, id: string = "") {
		let url = this.router.url;
		if (!isNew) {
			this.router.navigate([url], { relativeTo: this.activatedRoute });
			return;
		}

		url = `/publicdeliveryorder/edit/${id}`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}

	reset() {
		this.publicDeliveryorder = Object.assign({}, this.oldDeliveryorder);
		this.createForm();
		this.hasFormErrors = false;
		this.deliveryorderForm.markAsPristine();
		this.deliveryorderForm.markAsUntouched();
		this.deliveryorderForm.updateValueAndValidity();
	}

	onSubmit(withBack: boolean = false) {
		const controls = this.deliveryorderForm.controls;
		let descChangeEng = controls.engFixingDesc.value
		let visitDateSurv = controls.visitDateSurv.value
		let engSurvey = controls.engSurvey.value
		let visitDateFixing = controls.visitDateFixing.value
		let engFixing = controls.engFixing.value

		if (!this.checkChangeEngineer) {
			if (!descChangeEng) {
				const message = `Input description change engineer fixing`;
				this.layoutUtilsService.showActionNotification(message, MessageType.Create, 5000, true, true)
				return
			}
		}

		if (this.publicDeliveryorder.status === "wait-sched-surv") {
			if (visitDateSurv === "" || engSurvey === "") {
				const message = `Input visit date survey or engineer survey`;
				this.layoutUtilsService.showActionNotification(message, MessageType.Create, 5000, true, true)
				return
			}
		}

		if (this.publicDeliveryorder.status === "wait-sched-wo") {
			if (visitDateFixing === "" || engFixing === "") {
				const message = `Input visit date fixing or engineer fixing`;
				this.layoutUtilsService.showActionNotification(message, MessageType.Create, 5000, true, true)
				return
			}
		}

		this.hasFormErrors = false;
		/** check form */
		if (this.deliveryorderForm.invalid) {
			Object.keys(controls).forEach(controlName =>
				controls[controlName].markAsTouched()
			);

			this.hasFormErrors = true;
			this.selectedTab = 0;
			return;
		}

		this.loading = true;

		const editedDeliveryorder = this.prepareDeliveryorder();
		this.updateDeliveryorder(editedDeliveryorder, withBack);

	}

	tes() {
		this.prepareDeliveryorder()
	}

	prepareDeliveryorder(): PublicDeliveryorderModel {
		const controls = this.deliveryorderForm.controls;

		controls.status.setValue(this.publicDeliveryorder.status === "sched-for-fix" || this.publicDeliveryorder.status === "resched-for-fix" ?
			'vis-for-fix' : this.publicDeliveryorder.status === "vis-for-fix" ? "fix-work-done" : undefined)

		var formData: any = new FormData();
		if (!this.reportFixCheck) {
			for (var i = 0; i < this.myFiles.length; i++) {
				formData.append("attachmentFixing", this.myFiles[i]);
			}
		}

		formData.append("doId", this.deliveryorderForm.get("doId").value);
		formData.append("ticketId", this.deliveryorderForm.get("ticketId").value);
		formData.append("status", this.deliveryorderForm.get("status").value);
		// formData.append('surveyDesc', "tester survey")
		formData.append('fixingDesc', "tester fixing")



		return formData;
	}

	updateDeliveryorder(_deliveryorder: PublicDeliveryorderModel, withBack: boolean = false) {
		const addSubscription = this.service.updatePublicDeliveryorderUpd(_deliveryorder, this.publicDeliveryorder._id).subscribe(
			res => {
				const message = `Deliveryorder successfully has been saved.`;
				this.layoutUtilsService.showActionNotification(message, MessageType.Update, 5000, true, true);
				const url = `/publicMgrDeliveryorder`;
				this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
			},
			err => {
				console.error(err);
				const message = 'Error while adding publicDeliveryorder | ' + err.statusText;
				this.layoutUtilsService.showActionNotification(message, MessageType.Update, 5000, true, false);
			}
		);
		this.subscriptions.push(addSubscription);
	}

	selectFile(e) {
		const files = (e.target as HTMLInputElement).files;

		if (files.length > 5 || this.myFiles.length >= 5 || this.images.length >= 5) {
			this.fileInputEl.nativeElement.value = "";
			const message = `Only 5 images are allowed to select`;
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


	removeSelectedFile(item) {
		this.myFiles = this.myFiles.filter(i => i.name !== item.name);
		this.images = this.images.filter(i => i.url !== item.url);
		this.fileInputEl.nativeElement.value = "";

		this.cdr.markForCheck();
	}

	clearSelection() {
		this.myFiles = [];
		this.images = [];
		this.fileInputEl.nativeElement.value = "";

		this.cdr.markForCheck();
	}




	getComponentTitle() {
		let result = `Edit Deliveryordering`;
		return result;
	}

	onAlertClose($event) {
		this.hasFormErrors = false;
	}

	ngOnDestroy() {
		this.subscriptions.forEach(sb => sb.unsubscribe());
	}

	reDeliveryorder(id) {
		this.router.navigate(['/publicdeliveryorder/re', id], { relativeTo: this.activatedRoute });
	}


	async getImage() {
		const URL_IMAGE = `${environment.baseAPI}/api/doPublic/${this.publicDeliveryorder._id}/image/engineer`
		await this.http.get(`${URL_IMAGE}`).subscribe((res: any) => {
			this.images = res.data;
		});
	}

}
