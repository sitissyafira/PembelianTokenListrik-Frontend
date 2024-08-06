import { Component, OnInit, OnDestroy, ElementRef, ViewChild, ChangeDetectorRef } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { LayoutConfigService, SubheaderService } from '../../../../core/_base/layout';
import { LayoutUtilsService, MessageType, QueryParamsModel } from '../../../../core/_base/crud';
import { select, Store } from '@ngrx/store';
import { AppState } from '../../../../core/reducers';
import { SelectionModel } from '@angular/cdk/collections';
import { ArCardDataSource } from '../../../../core/arCard/arCard.datasource';
import { ArCardModel } from '../../../../core/arCard/arCard.model';
import { ArCardService } from '../../../../core/arCard/arCard.service';
import { selectArCardActionLoading, selectArCardById } from '../../../../core/arCard/arCard.selector';
import * as _moment from 'moment';
const moment = _rollupMoment || _moment;
import { default as _rollupMoment, Moment } from 'moment';
import { OwnershipContractService } from '../../../../core/contract/ownership/ownership.service';
import { QueryOwnerTransactionModel } from '../../../../core/contract/ownership/queryowner.model';
import { LeaseContractService } from '../../../../core/contract/lease/lease.service';
import { UnitService } from '../../../../core/unit/unit.service';
import { RequestInvoiceService } from '../../../../core/requestInvoice/requestInvoice.service';
import { QueryRequestInvoiceModel } from '../../../../core/requestInvoice/queryrequestInvoice.model';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TemplatePDFARCard } from '../../../../core/templatePDF/arCard.service';

// PDF Make start
import * as pdfMake from "pdfmake/build/pdfmake";
import * as pdfFonts from "pdfmake/build/vfs_fonts";
// import { selectArById } from 'src/app/core/finance/ar/ar.selector';
const appHost = `${location.protocol}//${location.host}`;

(<any>pdfMake).vfs = pdfFonts.pdfMake.vfs;
(<any>pdfMake).fonts = {
	Poppins: {
		normal: `${appHost}/assets/fonts/poppins/regular.ttf`,
		bold: `${appHost}/assets/fonts/poppins/bold.ttf`,
		italics: `${appHost}/assets/fonts/poppins/italics.ttf`,
		bolditalics: `${appHost}/assets/fonts/poppins/bolditalics.ttf`,
	},
};
// PDF Make end

@Component({
	selector: 'kt-add-arCard',
	templateUrl: './view-arCard.component.html',
	styleUrls: ['./view-arCard.component.scss']
})
export class ViewArCardComponent implements OnInit, OnDestroy {
	dataSource: ArCardDataSource;
	arCard: ArCardModel;
	arCardBio: any;
	arCardId$: Observable<string>;
	oldArCard: ArCardModel;
	selectedTab = 0;
	loading$: Observable<boolean>;
	loading: boolean = false;
	arCardForm: FormGroup;
	hasFormErrors = false;
	selection = new SelectionModel<ArCardModel>(true, []);
	blockResult: any[] = [];
	blockGroupResult: any[] = [];
	buildingResult: any[] = [];
	datedefault: string;
	date = new FormControl(moment());
	date1 = new FormControl(new Date());
	serializedDate = new FormControl((new Date()).toISOString());
	codenum: any;
	blockgroupNotSelected: boolean = false;
	ownResult: any[] = [];
	isView: boolean = true
	loadingForm: boolean
	loadingRequest: boolean
	requestResult: any[] = []
	// Private properties

	public selectedName: any;

	public highlightRow(emp) {
		this.selectedName = emp.name;
	}

	// Modal
	@ViewChild("modalLoad", { static: true }) modalLoad: ElementRef;

	// Download PDF
	paramsView: any

	private subscriptions: Subscription[] = [];
	constructor(
		private activatedRoute: ActivatedRoute,
		private templatePDFARCard: TemplatePDFARCard,
		private router: Router,
		private arCardFB: FormBuilder,
		private service: ArCardService,
		private uService: UnitService,
		private riService: RequestInvoiceService,
		private ownService: OwnershipContractService,
		private leaseService: LeaseContractService,
		private layoutUtilsService: LayoutUtilsService,
		private store: Store<AppState>,
		private layoutConfigService: LayoutConfigService,
		private modalService: NgbModal,
		private cdr: ChangeDetectorRef,
	) { }
	ngOnInit() {
		this.openLarge()
		this.loadingForm = true
		this.loading$ = this.store.pipe(select(selectArCardActionLoading));
		const routeSubscription = this.activatedRoute.queryParams.subscribe(params => {
			const id = params.id;
			if (id) {
				// Find By Id AR Card start
				this.service.viewArCardById(params).subscribe(res => {
					if (res) {
						this.modalService.dismissAll()
						this.paramsView = params
						this.arCard = res.data;
						this.arCardBio = res.bio;
						this.cdr.markForCheck()
					}
				})
				// Find By Id AR Card end 
			}
		});
		this.subscriptions.push(routeSubscription);
	}

	goBackWithId() {
		const url = `/arCard`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}

	getComponentTitle() {
		if (this.arCard) {
			this.modalService.dismissAll()
			let result = 'View AR Card';
			return result;
		}
	}

	onAlertClose($event) {
		this.hasFormErrors = false;
	}

	ngOnDestroy() {
		this.subscriptions.forEach(sb => sb.unsubscribe());
	}

	/**
	 * Load Modal Import
	 */
	openLarge() {
		this.modalService.open(this.modalLoad, {
			centered: true,
			size: 'sm',
			backdrop: "static",
		});
	}

	/**
	 * Print PDF Table
	 */
	printPdf() {
		const queryParams = this.paramsView
		this.service.downloadArCardById(queryParams).subscribe(
			res => {
				const result = this.templatePDFARCard.generatePDFTemplateARCard(this.arCardBio, res.data);
				const nameFile = `AR Card - ${this.arCardBio.unitName} - ${this.arCardBio.startDate} - ${this.arCardBio.endDate}.pdf`
				pdfMake.createPdf(result).download(nameFile);
			},
			err => {
				console.error(err);
				const message = 'Error download PDF';
				this.layoutUtilsService.showActionNotification(message, MessageType.Create, 2000, true, false);
			}
		)
	}

}
