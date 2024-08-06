import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
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
import { PublicTicketModel } from "../../../../core/ticketpublic/publicticket.model";
import {
	selectLastCreatedPublicTicketId,
	selectPublicTicketActionLoading,
	selectPublicTicketById
} from "../../../../core/ticketpublic/publicticket.selector";
import { PublicTicketService } from '../../../../core/ticketpublic/publicticket.service';
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
import { Popup, PopupReschdule, PopupReschduleFixing } from '../popup/popup.component';
import { MatDialog, MatTable } from '@angular/material';
import { ServiceFormat } from '../../../../core/serviceFormat/format.service';
import { ModuleTicketingPublic } from '../../../../core/ticketpublic/module/moduleservice';

@Component({
	selector: 'kt-view-ticket',
	templateUrl: './view-ticket.component.html',
	styleUrls: ['./view-ticket.component.scss']
})
export class ViewTicketComponent implements OnInit, OnDestroy {
	// Public properties
	ticket: PublicTicketModel;
	type;
	TicketId$: Observable<string>;
	oldTicket: PublicTicketModel;
	selectedTab = 0;
	loading$: Observable<boolean>;
	ticketForm: FormGroup;
	selection = new SelectionModel<PublicTicketModel>(true, []);
	hasFormErrors = false;
	unitResult: any[] = [];
	enResult: any[] = [];
	FilterEnResult: any[] = [];
	myFiles: any[] = []
	images: any;
	imagesSurvey: any;
	imagesFixing: any;
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
		private moduleTicketing: ModuleTicketingPublic, // services for flow ticketing systems (ex: changeStatus > to change status, etc.)
		private serviceFormat: ServiceFormat,
		private router: Router,
		private ticketFB: FormBuilder,
		private subheaderService: SubheaderService,
		private layoutUtilsService: LayoutUtilsService,
		private store: Store<AppState>,
		private service: PublicTicketService,
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
		this.loading$ = this.store.pipe(select(selectPublicTicketActionLoading));
		const routeSubscription = this.activatedRoute.params.subscribe(params => {
			const id = params.id;
			if (id) {
				// this.loadDataId(id)
				this.store.pipe(select(selectPublicTicketById(id))).subscribe(res => {
					if (res) {
						this.ticket = res;
						this.viewEnResult.setValue(res.engFixing ? res.engFixing.name : "")
						this.viewUnitResult.setValue(res.unit.cdunt)
						this.oldTicket = Object.assign({}, this.ticket);
						this.initTicket();
					}
				});
			}
		});
		this.subscriptions.push(routeSubscription);
		this.getImage();
	}

	initTicket() {
		this.createForm();
		this.hiddenReschedule();
		this.hiddenSave();
		this.loadEnginer();
		this.hiddenAfterRes();
		this.getUnitId(this.ticket.unit)
	}

	showHidden() {
		this.isHidden = true;
	}

	hiddenReschedule() {
		if (this.ticket.status != "waiting for confirmation") {
			this.buttonReshedule = true;

		} else {
			this.buttonReshedule = false;
		}
	}

	hiddenAfterRes() {
		this.buttonRes = false;
	}

	hiddenSave() {
		if (this.ticket.status === "wait-sched-surv" || this.ticket.status === "wait-confirm-surv" ||
			this.ticket.status === "tick-cust-approve" || this.ticket.status === "wait-sched-wo" ||
			this.ticket.status === "wait-approve-mgr" || this.ticket.status === "eng-mgr-approve" ||
			this.ticket.status === "resched-for-fix" || this.ticket.status === "wait-confirm-wo" ||
			this.ticket.handledBy === "mobile") {
			this.buttonSave = true;
		} else {
			this.buttonSave = false;
		}
	}

	createForm() {
		// if (this.ticket.status === "open") {
		let objFormMultiGl = {}
		for (let i = 1; i <= 30; i++) {
			objFormMultiGl[`item${i}`] = [{ value: undefined, disabled: false }];
			objFormMultiGl[`cost${i}`] = [{ value: "", disabled: false }];
		}
		this.loadCategory();
		this.ticketForm = this.ticketFB.group({
			ticketId: [{ value: this.ticket.ticketId, disabled: true }],
			subject: [{ value: this.ticket.subject, disabled: true }],
			contract: [{ value: this.ticket.contract, disabled: true }],
			reason: [{ value: "", disabled: true }],
			contract2: [{ value: this.ticket.contract2, disabled: true }],
			tenant_phone: [{ value: this.ticket.contract.contact_phone, disabled: true }],
			tenant_email: [{ value: this.ticket.contract.contact_email, disabled: true }],
			description: [{ value: this.ticket.description, disabled: true }],
			priority: [{ value: this.ticket.priority, disabled: true }],
			status: [{ value: this.ticket.status, disabled: true }],
			unit: [{ value: this.ticket.unit, disabled: true }],
			unit2: [{ value: this.ticket.unit2, disabled: true }],
			attachment: [this.ticket.attachment],
			ticketdate: [{ value: this.ticket.createdDate, disabled: true }],
			createdDate: [{ value: this.ticket.createdDate, disabled: true }],
			// New Flow
			engFixingDesc: [{ value: this.ticket.engFixingDesc ? this.ticket.engFixingDesc : "", disabled: false }],
			visitDateFixing: [{ value: this.ticket.visitDateFixing ? this.ticket.visitDateFixing : "", disabled: false }],
			visitDateSurv: [{ value: this.ticket.visitDateSurv ? this.ticket.visitDateSurv : "", disabled: false }],
			engSurvey: [{ value: this.ticket.engSurvey ? this.ticket.engSurvey._id : "", disabled: false }],
			engFixing: [{ value: this.ticket.engFixing ? this.ticket.engFixing._id : "", disabled: false }],

			// Update add index 
			nameInput: [{ value: this.ticket.nameInput, disabled: true }],
			tenantName: [{ value: this.ticket.tenantName, disabled: true }],
			phoneNumber: [{ value: this.ticket.phoneNumber, disabled: true }],
			statusCreator: [{ value: this.ticket.statusCreator, disabled: true }],
			statusTenant: [{ value: this.ticket.statusTenant, disabled: true }],
		});
	}



	addCC(e) {
		const controls = this.ticketForm.controls;

		this.totalField = parseInt(e + 1)

		this.ccList.push({ id: '' });
		this.table.renderRows();
	}


	removeCC(i: number) {
		const controls = this.ticketForm.controls;

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
		if (status === "survey") this.ticketForm.controls.engSurvey.setValue(value._id);
		else if (status === "fixing") this.ticketForm.controls.engFixing.setValue(value._id);
		else if (status === "change") {
			this.ticketForm.controls.engFixingDesc.setValue("");
			if (value._id === this.ticket.engFixing._id) this.checkChangeEngineer = true;
			else this.checkChangeEngineer = false;

			this.changeEngineer = true
			this.ticketForm.controls.engFixing.setValue(value._id);
		}
	}


	getUnitId(id) {
		this.uService.findUnitById(id).subscribe(
			data => {
				this.type = data.data.type;
				this.cdUnit = data.data.cdunt.toUpperCase()
				// this.ticketForm.controls.unit.setValue(data.data._id);

				if (this.type == "owner" || this.type == "pp") {
					this.ownService.findOwnershipContractByUnit(id).subscribe(
						dataowner => {
							this.ticketForm.controls.tenant_phone.setValue(dataowner.data[0].contact_phone);
							this.ticketForm.controls.tenant_email.setValue(dataowner.data[0].contact_email);
						}
					)
				} else {
					this.leaseService.findLeaseContractByUnit(id).subscribe(
						datalease => {
							this.ticketForm.controls.tenant_phone.setValue(datalease.data[0].contact_phone);
							this.ticketForm.controls.tenant_email.setValue(datalease.data[0].contact_email);
						}
					)
				}
			});
	}

	processMenuHandler(id) {
		const controls = this.ticketForm.controls;
		const dialogRef = this.dialog.open(Popup, {
			data: {
				input: ""
			},
			maxWidth: "400px",
			minHeight: "200px",
		});

		// tes modal
		dialogRef.afterClosed().subscribe((result) => {
			const _ticket = new PublicTicketModel();
			_ticket._id = this.ticket._id;
			_ticket.status = "fix-admin-reject";
			_ticket.rejectDesc = result.reject;
			_ticket.rejectDate = Date.now();
			_ticket.ticketId = controls.ticketId.value;
			_ticket.createdDate = controls.createdDate.value;
			_ticket.contract = controls.contract.value;
			_ticket.contract2 = controls.contract2.value;
			_ticket.unit = controls.unit.value;
			_ticket.unit2 = controls.unit2.value;
			_ticket.description = controls.description.value;
			_ticket.priority = controls.priority.value;
			_ticket.attachment = controls.attachment.value;


			this.service.updatePublicTicket(_ticket).subscribe(
				res => {
					const message = `Ticket successfully has been rejected.`;
					this.layoutUtilsService.showActionNotification(message, MessageType.Update, 5000, true, true);
					this.router.navigate(['/publicticket/reject', id], { relativeTo: this.activatedRoute });
				},
				err => {
					console.error(err);
					const message = 'Error while adding ticket | ' + err.statusText;
					this.layoutUtilsService.showActionNotification(message, MessageType.Update, 5000, true, false);
				}
			);
		});
	}

	processMenuHandlerRe(id) {
		const controls = this.ticketForm.controls;
		const dialogRef = this.dialog.open(PopupReschdule, {
			data: {
				input: ""
			},
			maxWidth: "700px",
			minHeight: "200px",
		});

		// tes modal
		dialogRef.afterClosed().subscribe((result) => {
			const _ticket = new PublicTicketModel();
			_ticket._id = this.ticket._id;
			_ticket.status = "resched-for-surv";
			_ticket.ticketId = controls.ticketId.value;
			_ticket.createdDate = controls.createdDate.value;
			_ticket.contract = controls.contract.value;
			_ticket.contract2 = controls.contract2.value;
			_ticket.unit = controls.unit.value;
			_ticket.unit2 = controls.unit2.value;
			_ticket.description = controls.description.value;
			_ticket.priority = controls.priority.value;
			_ticket.attachment = controls.attachment.value;
			_ticket.handledBy = "mobile"

			this.service.updatePublicTicket(_ticket).subscribe(
				res => {
					const message = `Ticket successfully has been rejected.`;
					this.layoutUtilsService.showActionNotification(message, MessageType.Update, 5000, true, true);
					this.router.navigate(['/publicticket'], { relativeTo: this.activatedRoute });
				},
				err => {
					console.error(err);
					const message = 'Error while adding ticket | ' + err.statusText;
					this.layoutUtilsService.showActionNotification(message, MessageType.Update, 5000, true, false);
				}
			);
		});
	}
	processMenuHandlerReFixing(id) {
		const controls = this.ticketForm.controls;
		const dialogRef = this.dialog.open(PopupReschduleFixing, {
			data: {
				input: ""
			},
			maxWidth: "700px",
			minHeight: "200px",
		});

		// tes modal
		dialogRef.afterClosed().subscribe((result) => {
			const _ticket = new PublicTicketModel();
			_ticket._id = this.ticket._id;
			_ticket.status = "resched-for-fix";
			_ticket.ticketId = controls.ticketId.value;
			_ticket.createdDate = controls.createdDate.value;
			_ticket.contract = controls.contract.value;
			_ticket.contract2 = controls.contract2.value;
			_ticket.unit = controls.unit.value;
			_ticket.unit2 = controls.unit2.value;
			_ticket.description = controls.description.value;
			_ticket.priority = controls.priority.value;
			_ticket.attachment = controls.attachment.value;
			_ticket.handledBy = "mobile"

			this.service.updatePublicTicket(_ticket).subscribe(
				res => {
					const message = `Ticket successfully has been rejected.`;
					this.layoutUtilsService.showActionNotification(message, MessageType.Update, 5000, true, true);
					this.router.navigate(['/publicticket'], { relativeTo: this.activatedRoute });
				},
				err => {
					console.error(err);
					const message = 'Error while adding ticket | ' + err.statusText;
					this.layoutUtilsService.showActionNotification(message, MessageType.Update, 5000, true, false);
				}
			);
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
		let controls = this.ticketForm.controls;
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

		this.loadTotalCost()
		return rupiah
	}

	rejectTicket(id) {
		this.router.navigate(['/publicticket/reject', id], { relativeTo: this.activatedRoute });
	}

	loadTotalCost() {
		const controls = this.ticketForm.controls
		let result = 0
	}


	goBackWithId() {
		const url = `/publicticket`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}

	refreshTicket(isNew: boolean = false, id: string = "") {
		let url = this.router.url;
		if (!isNew) {
			this.router.navigate([url], { relativeTo: this.activatedRoute });
			return;
		}

		url = `/publicticket/view/${id}`;
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

	updatePublicTicket(_ticket: PublicTicketModel, withBack: boolean = false) {
		const addSubscription = this.service.updatePublicTicket(_ticket).subscribe(
			res => {
				const message = `Ticket successfully has been saved.`;
				this.layoutUtilsService.showActionNotification(message, MessageType.Update, 5000, true, true);
				const url = `/publicticket`;
				this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
			},
			err => {
				console.error(err);
				const message = 'Error while adding ticket | ' + err.statusText;
				this.layoutUtilsService.showActionNotification(message, MessageType.Update, 5000, true, false);
			}
		);
		this.subscriptions.push(addSubscription);
	}




	getComponentTitle() {
		let result = `View Ticketing`;
		return result;
	}

	onAlertClose($event) {
		this.hasFormErrors = false;
	}

	ngOnDestroy() {
		this.subscriptions.forEach(sb => sb.unsubscribe());
	}

	reTicket(id) {
		this.router.navigate(['/publicticket/re', id], { relativeTo: this.activatedRoute });
	}

	async getImage() {
		const URL_IMAGE = `${environment.baseAPI}/api/ticketPublic`
		await this.http.get(`${URL_IMAGE}/${this.ticket._id}/image`).subscribe((res: any) => {
			this.images = res.data.attachment;
			this.imagesSurvey = res.data.attachmentSurvey;
			this.imagesFixing = res.data.attachmentFixing;
		});
	}

	async loadDataId(id) {
		const URL_DATA = `${environment.baseAPI}/api/ticketPublic`
		await this.http.get(`${URL_DATA}/${id}`).subscribe((res: any) => {
			if (res.data) {
				this.ticket = res.data;
				this.viewEnResult.setValue(res.data.engFixing ? res.data.engFixing.name : "")
				this.viewUnitResult.setValue(res.data.unit.cdunt)
				this.oldTicket = Object.assign({}, this.ticket);
				this.initTicket();
			}
		});
	}

}
