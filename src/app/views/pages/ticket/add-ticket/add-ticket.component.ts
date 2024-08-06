import { ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, FormControl, ControlContainer } from '@angular/forms';
import { BehaviorSubject, Observable, of, Subscription } from 'rxjs';
import { Store, select } from '@ngrx/store';
import { AppState } from '../../../../core/reducers';
import { SubheaderService, LayoutConfigService } from '../../../../core/_base/layout';
import { LayoutUtilsService, MessageType } from '../../../../core/_base/crud';
import { TicketModel } from "../../../../core/ticket/ticket.model";
import {
	selectTicketActionLoading,
} from "../../../../core/ticket/ticket.selector";
import { TicketService } from '../../../../core/ticket/ticket.service';
import * as _moment from 'moment';
const moment = _rollupMoment || _moment;
import { default as _rollupMoment, Moment } from 'moment';
import { SelectionModel } from '@angular/cdk/collections';
import { OwnershipContractService } from '../../../../core/contract/ownership/ownership.service';
import { CategoryService } from '../../../../core/category/category.service';
import { QueryCategoryModel } from '../../../../core/category/querycategory.model';
import { QueryDefectModel } from '../../../../core/defect/querydefect.model';
import { DefectService } from '../../../../core/defect/defect.service';
import { SubdefectService } from '../../../../core/subdefect/subdefect.service';
import { QuerySubdefectModel } from '../../../../core/subdefect/querysubdefect.model';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { HttpClient } from '@angular/common/http';
import { LeaseContractService } from '../../../../core/contract/lease/lease.service';
import { UnitService } from '../../../../core/unit/unit.service';
import { QueryUnitModel } from '../../../../core/unit/queryunit.model';
import { environment } from '../../../../../environments/environment';

@Component({
	selector: 'kt-add-ticket',
	templateUrl: './add-ticket.component.html',
	styleUrls: ['./add-ticket.component.scss']
})
export class AddTicketComponent implements OnInit, OnDestroy {

	@ViewChild('fileInput', { static: false }) fileInputEl: ElementRef;

	// Public properties
	ticket: TicketModel;
	type;
	fileToUpload: File = null;
	//file;
	TicketId$: Observable<string>;
	oldTicket: TicketModel;
	selectedTab = 0;
	loading$: Observable<boolean>;
	ticketForm: FormGroup;
	date = new FormControl(moment());
	date1 = new FormControl(new Date());
	serializedDate = new FormControl((new Date()).toISOString());
	duedate = new FormControl();
	selection = new SelectionModel<TicketModel>(true, []);
	hasFormErrors = false;
	unitResult: any[] = [];
	myFiles: any[] = []
	images: any[] = []
	cResult: any[] = [];
	dResult: any[] = [];
	sResult: any[] = [];
	codenum: any;
	loadingData: boolean

	viewUntResult = new FormControl();
	loadingDatas = {
		unt: false,
	}
	FilterUntResult: any[] = [];



	valPriority: string = "true"
	cekPriority: boolean = true
	spnPriority: string = ""
	// Private properties
	private subscriptions: Subscription[] = [];
	loading = {
		location: false,
		sublocation: false,
		defect: false,
		unit: false,
		loadingNumber: false
	}
	constructor(
		private activatedRoute: ActivatedRoute,
		private cdr: ChangeDetectorRef,
		private router: Router,
		private ticketFB: FormBuilder,
		private subheaderService: SubheaderService,
		private layoutUtilsService: LayoutUtilsService,
		private store: Store<AppState>,
		private service: TicketService,
		private uService: UnitService,
		private ownService: OwnershipContractService,
		private leaseService: LeaseContractService,
		private cService: CategoryService,
		private dService: DefectService,
		private sService: SubdefectService,
		private cd: ChangeDetectorRef,
		private layoutConfigService: LayoutConfigService,
		private modalService: NgbModal,
		private http: HttpClient,
	) { }

	ngOnInit() {
		this.loading$ = this.store.pipe(select(selectTicketActionLoading));
		this.ticket = new TicketModel();
		this.ticket.clear();
		this.initTicket();
	}

	initTicket() {
		this.createForm();
		this.loadUnit();
		this.loadCategory();
		this.getNumber()
	}

	createForm() {
		this.ticketForm = this.ticketFB.group({
			ticketId: [{ value: this.codenum, disabled: true }, Validators.required],
			subject: ["", Validators.required],
			contract: ["", Validators.required],
			contract2: [{ value: "", disabled: true }],
			tenant_phone: [{ value: "", disabled: true }],
			tenant_email: [{ value: "", disabled: true }],
			unit: [""],
			unit2: [""],
			category: [""],
			dcategory: [""],
			priority: [""],
			subDefect: [""],
			description: [""],
			attachment: [null],
			status: ["open"],
			handledBy: ["tro"],
			ticketdate: [{ value: this.date1.value, disabled: true }],
			// Update Add Index
			nameInput: ["", Validators.required],
			phoneNumber: ["", Validators.required],
			statusCreator: ["", Validators.required],
		});
	}
	getNumber() {
		this.loading.loadingNumber = true
		const controls = this.ticketForm.controls;
		this.service.generateTicketCode().subscribe(
			res => {
				this.codenum = res.data
				controls.ticketId.setValue(this.codenum);
				this.loading.loadingNumber = false;
			}
		)
	}

	loadUnit() {
		this.loading.unit = true
		this.selection.clear();
		const queryParams = new QueryUnitModel(
			null,
			"asc",
			null,
			1,
			1000
		);
		this.uService.getDataUnitForParking(queryParams).subscribe(
			res => {
				this.unitResult = res.data;
				this.FilterUntResult = res.data;
				this.loading.unit = false;
				this.cd.markForCheck();
			}
		);
	}

	getUnitId(id) {
		this.loading.unit = true
		this.ticketForm.controls.unit.disable();
		this.uService.getUnitById(id).subscribe(
			data => {
				this.type = data.data.type;
				this.ticketForm.controls.unit.setValue(data.data._id);
				if (this.type == "owner" || this.type == "pp") {
					this.ownService.findOwnershipContractByUnit(id).subscribe(
						dataowner => {
							this.ticketForm.controls.contract.setValue(dataowner.data[0]._id);
							this.ticketForm.controls.contract2.setValue(dataowner.data[0].contact_name);
							this.ticketForm.controls.tenant_phone.setValue(dataowner.data[0].contact_phone);
							this.ticketForm.controls.tenant_email.setValue(dataowner.data[0].contact_email);
							this.ticketForm.controls.unit2.setValue(dataowner.data[0].unit2);
							this.loading.unit = false
							this.ticketForm.controls.unit.enable();
						}
					)
				} else {
					this.leaseService.findLeaseContractByUnit(id).subscribe(
						datalease => {
							this.ticketForm.controls.contract.setValue(datalease.data[0]._id);
							this.ticketForm.controls.contract2.setValue(datalease.data[0].contact_name);
							this.ticketForm.controls.tenant_phone.setValue(datalease.data[0].contact_phone);
							this.ticketForm.controls.tenant_email.setValue(datalease.data[0].contact_email);
							this.ticketForm.controls.unit2.setValue(datalease.data[0].unit2);
							this.loading.unit = false
							this.ticketForm.controls.unit.enable();
						}
					)
				}
			});
	}

	loadCategory() {
		this.loading.location = true;
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
				this.loading.location = false;
				this.cd.markForCheck();
			}
		);
	}
	categoryOnChange(id) {
		if (id) {
			this.loadDefect(id);
			this.ticketForm.controls.dcategory.enable();
		}
	}

	loadDefect(id) {
		this.loading.sublocation = true;
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
				this.loading.sublocation = false;
				this.cd.markForCheck();
			}
		);
	}

	defectOnChange(id) {
		if (id) {
			this.loadSubdefect(id);
			this.ticketForm.controls.subdefect.enable();
		}
	}

	loadSubdefect(id) {
		this.loading.defect = true
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
				this.loading.defect = false;
				this.cd.markForCheck();
			}
		);
	}

	subDefectOnChange(id) {
		const controls = this.ticketForm.controls;
		this.sService.findSubdefectByIdPriority(id).subscribe(data => {
			controls.priority.setValue(data.data.priority);
			const value = data.data.priority
			const valResult = value.toLowerCase()
			this.valPriority = data.data.priority
			this.cekPriority = false

			if (valResult === "medium") return this.spnPriority = "chip chip--medium"
			else if (valResult === "high") return this.spnPriority = "chip chip--high"
			else return this.spnPriority = "chip chip--low"
		});
	}

	goBackWithId() {
		const url = `/ticket`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}

	refreshTicket(isNew: boolean = false, id: string = "") {
		let url = this.router.url;
		if (!isNew) {
			this.router.navigate([url], { relativeTo: this.activatedRoute });
			return;
		}

		url = `/ticket/edit/${id}`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}

	reset() {
		this.ticket = Object.assign({}, this.oldTicket);
		this.createForm();
		this.hasFormErrors = false;
		this.ticketForm.markAsPristine();
		this.ticketForm.markAsUntouched();
		this.ticketForm.updateValueAndValidity();
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

	submitForm() {
		if (this.images.length === 0) {
			const message = `Add image ticketing`;
			this.layoutUtilsService.showActionNotification(message, MessageType.Create, 5000, true, true);
			return
		}
		this.loadingData = true;
		var formData: any = new FormData();
		for (var i = 0; i < this.myFiles.length; i++) {
			formData.append("attachment", this.myFiles[i]);
		}
		formData.append("ticketId", this.ticketForm.get('ticketId').value);
		formData.append("subject", this.ticketForm.get('subject').value);
		formData.append("contract", this.ticketForm.get('contract').value);
		formData.append("contract2", this.ticketForm.get('contract2').value);
		formData.append("subDefect", this.ticketForm.get('subDefect').value);
		formData.append("unit", this.ticketForm.get('unit').value);
		formData.append("unit2", this.ticketForm.get('unit2').value);
		formData.append("description", this.ticketForm.get('description').value);
		formData.append("priority", this.ticketForm.get('priority').value);
		formData.append("status", this.ticketForm.get('status').value);
		formData.append("ticketdate", this.ticketForm.get('ticketdate').value);
		formData.append("handledBy", this.ticketForm.get('handledBy').value);
		formData.append("createdOn", "web");

		// Update add index
		formData.append("nameInput", this.ticketForm.get('nameInput').value);
		formData.append("phoneNumber", this.ticketForm.get('phoneNumber').value);
		formData.append("statusCreator", this.ticketForm.get('statusCreator').value);


		this.http.post(`${environment.baseAPI}/api/ticket/`, formData).subscribe(
			(response) => {
				const message = `New Ticket successfully has been added.`;
				this.layoutUtilsService.showActionNotification(message, MessageType.Create, 5000, true, true);
				const url = `/ticket`;
				this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
			},
			(error) => {
				console.error(error);
				const message = 'Error while adding ticket | ' + error.statusText;
				this.layoutUtilsService.showActionNotification(message, MessageType.Create, 5000, true, false);
			}
		)
	}

	_onKeyup(e: any) {
		this._filterUntList(e.target.value);
	}

	_filterUntList(text: string) {
		this.FilterUntResult = this.unitResult.filter((i) => {
			const filterText = `${i.cdunt.toLocaleLowerCase()}`;
			if (filterText.includes(text.toLocaleLowerCase())) return i;
		});
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
		let result = 'Create Ticketing';
		return result;
	}

	onAlertClose($event) {
		this.hasFormErrors = false;
	}

	ngOnDestroy() {
		this.subscriptions.forEach(sb => sb.unsubscribe());
	}

}
