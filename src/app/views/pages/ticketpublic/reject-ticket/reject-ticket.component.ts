import { Component, OnDestroy, OnInit } from '@angular/core';
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
import { Popup } from '../popup/popup.component';
import { MatDialog } from '@angular/material';

@Component({
	selector: 'kt-reject-ticket',
	templateUrl: './reject-ticket.component.html',
	styleUrls: ['./reject-ticket.component.scss']
})
export class RejectTicketComponent implements OnInit, OnDestroy {
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
	myFiles: any[] = []
	images: any;
	cResult: any[] = [];
	dResult: any[] = [];
	sResult: any[] = [];
	codenum: any;
	selectedFile: File;
	retrievedImage: any;
	base64Data: any;
	message: string;

	loading: boolean;
	viewUnitResult = new FormControl()

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
	buttonWfs: boolean = true
	buttonReject: boolean = true;
	buttonRes: boolean = true;

	rejectDesc: string = ""

	valPriority: string = "true"
	cekPriority: boolean = true
	spnPriority: string = ""
	// Private properties
	private subscriptions: Subscription[] = [];
	constructor(
		private activatedRoute: ActivatedRoute,
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
				this.store.pipe(select(selectPublicTicketById(id))).subscribe(res => {
					if (res) {
						this.ticket = res;
						const valrjct = localStorage.getItem('rejectDesc');
						this.rejectDesc = valrjct
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
		this.hiddenWfs();
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

	hiddenWfs() {
		if (this.ticket.status != "open") {
			this.buttonWfs = true;
		} else {
			this.buttonWfs = false;
		}
	}

	createForm() {
		if (this.ticket.status === "open") {
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
				createdDate: [{ value: this.ticket.createdDate, disabled: true }]
			});
		}
		else if (this.ticket.status === "waiting for confirmation") {
				this.loadCategory();
				this.ticketForm = this.ticketFB.group({
					ticketId: [{ value: this.ticket.ticketId, disabled: true }],
					subject: [{ value: this.ticket.subject, disabled: true }],
					contract: [{ value: this.ticket.contract, disabled: true }],
					rescheduleDate: [{ value: "", disabled: true }],
					reason: [{ value: "", disabled: true }],
					contract2: [{ value: this.ticket.contract2, disabled: true }],
					tenant_phone: [{ value: this.ticket.contract.contact_phone, disabled: true }],
					tenant_email: [{ value: this.ticket.contract.contact_email, disabled: true }],
					description: [{ value: this.ticket.description, disabled: true }],
					priority: [{ value: this.ticket.priority, disabled: true }],
					status: [{ value: this.ticket.status, disabled: true }],
					attachment: [this.ticket.attachment],
					unit: [{ value: this.ticket.unit, disabled: true }],
					unit2: [{ value: this.ticket.unit2, disabled: true }],
					dateScheduled: [{ value: this.ticket.dateScheduled, disabled: true }],
					engineerId: [{ value: this.ticket.engineerId, disabled: true }],
					ticketdate: [{ value: this.ticket.createdDate, disabled: true }],
					createdDate: [{ value: this.ticket.createdDate, disabled: true }]
				});
		}
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
			}
		);
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
			_ticket.status = "reject";
			_ticket.rejectDesc = result.reject;
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

	rejectTicket(id) {
		this.router.navigate(['/publicticket/reject', id], { relativeTo: this.activatedRoute });
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

		url = `/publicticket/edit/${id}`;
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

	onSubmit(withBack: boolean = false) {
		this.hasFormErrors = false;
		const controls = this.ticketForm.controls;
		/** check form */
		if (this.ticketForm.invalid) {
			Object.keys(controls).forEach(controlName =>
				controls[controlName].markAsTouched()
			);

			this.hasFormErrors = true;
			this.selectedTab = 0;
			return;
		}

		this.loading = true;

		const editedTicket = this.prepareTicket();
		this.updatePublicTicket(editedTicket, withBack);

	}

	prepareTicket(): PublicTicketModel {
		if (this.ticket.status === "open") {
			const controls = this.ticketForm.controls;
			const _ticket = new PublicTicketModel();
			_ticket.clear();
			_ticket._id = this.ticket._id;
			_ticket.ticketId = controls.ticketId.value;
			_ticket.createdDate = controls.createdDate.value;
			_ticket.subject = controls.subject.value;
			_ticket.contract = controls.contract.value;
			_ticket.contract2 = controls.contract2.value;
			_ticket.unit = controls.unit.value;
			_ticket.unit2 = controls.unit2.value;
			_ticket.description = controls.description.value;
			_ticket.priority = controls.priority.value;
			_ticket.attachment = controls.attachment.value;
			_ticket.status = "waiting for schedule";
			return _ticket;

		} else if (this.ticket.status === "waiting for confirmation") {
			const controls = this.ticketForm.controls;
			const _ticket = new PublicTicketModel();
			_ticket.clear();
			_ticket._id = this.ticket._id;
			_ticket.ticketId = controls.ticketId.value;
			_ticket.createdDate = controls.createdDate.value;
			_ticket.subject = controls.subject.value;
			_ticket.dateScheduled = controls.dateScheduled.value;
			_ticket.contract = controls.contract.value;
			_ticket.contract2 = controls.contract2.value;
			_ticket.engineerId = controls.engineerId.value;
			_ticket.description = controls.description.value;
			_ticket.priority = controls.priority.value;
			_ticket.unit = controls.unit.value;
			_ticket.unit2 = controls.unit2.value;
			_ticket.dateScheduled = controls.dateScheduled.value;
			_ticket.engineerId = controls.engineerId.value;
			_ticket.attachment = controls.attachment.value;
			_ticket.status = "scheduled";
			return _ticket;
		}
		else if (this.ticket.status === "waiting for confirmation" && this.ticket.dateScheduled !== null) {
			const controls = this.ticketForm.controls;
			const _ticket = new PublicTicketModel();
			_ticket.clear();
			_ticket._id = this.ticket._id;
			_ticket.ticketId = controls.ticketId.value;
			_ticket.createdDate = controls.createdDate.value;
			_ticket.subject = controls.subject.value;
			_ticket.dateScheduled = controls.rescheduleDate.value;
			_ticket.reason = controls.reason.value;
			_ticket.contract = controls.contract.value;
			_ticket.contract2 = controls.contract2.value;
			_ticket.engineerId = controls.engineerId.value;
			_ticket.unit = controls.unit.value;
			_ticket.unit2 = controls.unit2.value;

			_ticket.description = controls.description.value;
			_ticket.priority = controls.priority.value;
			_ticket.dateScheduled = controls.dateScheduled.value;
			_ticket.engineerId = controls.engineerId.value;
			_ticket.attachment = controls.attachment.value;
			_ticket.status = "scheduled";
			return _ticket;
		}
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
		let result = `Reject Ticketing`;
		return result;
	}

	onAlertClose($event) {
		this.hasFormErrors = false;
	}

	ngOnDestroy() {
		this.subscriptions.forEach(sb => sb.unsubscribe());
	}

	async getImage() {
		const URL_IMAGE = `${environment.baseAPI}/api/ticketPublic`
		await this.http.get(`${URL_IMAGE}/${this.ticket._id}/image`).subscribe((res: any) => {
			this.images = res.data;
		});
	}

}
