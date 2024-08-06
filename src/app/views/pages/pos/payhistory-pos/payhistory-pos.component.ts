import { Component, OnDestroy, OnInit, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { SelectionModel } from "@angular/cdk/collections";
import { MatDialog } from '@angular/material';
import { PopupLogout, PopupPay } from '../popup/popup.component';
import { PosService } from '../../../../core/pos/pos.service';
import { QueryPosModel } from '../../../../core/pos/querypos.model';
import { LayoutUtilsService, MessageType } from '../../../../core/_base/crud';
import { PosModel } from '../../../../core/pos/pos.model';

// Animaton Start
// import the required animation functions from the angular animations module
import { trigger, animate, transition, style } from '@angular/animations';
import moment from 'moment';
import { QueryBankModel } from '../../../../core/masterData/bank/bank/querybank.model'
import { KtDialogService } from '../../../../core/_base/layout';
import { DomSanitizer } from '@angular/platform-browser';
import { Subscription } from 'rxjs';
export const fadeInAnimation =
	// trigger name for attaching this animation to an element using the [@triggerName] syntax
	trigger('fadeInAnimation', [

		// route 'enter' transition
		transition(':enter', [

			// css styles at start of transition
			style({ opacity: 0 }),

			// animation and styles at end of transition
			animate('.3s', style({ opacity: 1 }))
		]),
	]);
// Animaton End

import * as pdfMake from "pdfmake/build/pdfmake";
import * as pdfFonts from "pdfmake/build/vfs_fonts";
import { ServiceFormat } from '../../../../core/serviceFormat/format.service';
import { TemplatePDFCashierPayment } from '../../../../core/templatePDF/pos.service';
// import { selectArById } from 'src/app/core/finance/ar/ar.selector';
// import moment from "moment";

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

@Component({
	selector: 'kt-payhistory-pos',
	templateUrl: './payhistory-pos.component.html',
	styleUrls: ['./payhistory-pos.component.scss'],
	animations: [fadeInAnimation],
	host: { '[@fadeInAnimation]': '' }
})
export class PayhistoryPosComponent implements OnInit {
	ngOnInit() {
		const checkLoginPOS = localStorage.getItem('loginPOS')
		const checkCashierRecord = localStorage.getItem('isCashierRecord')
		const url = `/`;
		if (!checkLoginPOS || !checkCashierRecord) return this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });

		this.loadGetUnitBilling("")
		this.loadClosingControl()
		this.createForm()
		// Timer Start
		this.startCountTimer()
	}

	date = {
		valid: false,
		filter: {
			control: new FormControl(),
			val: undefined,
		},
		start: {
			control: new FormControl(),
			val: undefined,
		},
		end: {
			control: new FormControl(),
			val: undefined,
		},
	};

	isPrinted: boolean = false

	preview = {
		src: undefined,
		blobURL: '',
		status: false
	};

	_subs: Subscription[] = [];

	pdfSrc: any = ""


	posForm: FormGroup;
	cekLogin: boolean = true
	UnitResultFiltered: any[] = []
	unitResult: any[] = []
	setUnitLoad: string = ""
	idUnit: string = ""
	loadingBillUnit: boolean = false
	conditionBill: boolean = false

	isOpenSearch: boolean = false
	unitChoose: boolean = false
	categoryChoose: boolean = false
	categoryChooseTitle: string = ""

	wordingChecked: string = "Billing Number"
	selectCategory: any[] = [
		{ name: "Invoice", value: "invoice" },
		{ name: "Galon", value: "galon" },
		{ name: "Ticketing", value: "ticket" },
		{ name: "Parking", value: "parking" },
	]
	generatedPDF: any;
	// Timer Start
	ms: any = '0' + 0
	sec: any = '0' + 0
	min: any = '0' + 0
	hr: any = '0' + 0

	startTimer: any
	running = false

	newDateTime: any = `${moment(new Date()).format('dddd')}, ${moment(new Date()).format('LL')} - `

	// Timer End


	isChangeColor: boolean = false

	SlctPaymentResultFiltered = []
	slctPaymentResult = []
	BankMtdResultFiltered = []
	emoneyResultFiltered = []
	emoneyResult = []
	isCash: boolean = false
	isEmoney: boolean = true
	isCredDebCard: boolean = true

	bankMtdBlockResult = []
	nameCashier: string = JSON.parse(localStorage.getItem('loginPOS'))
	cashierRecordID: string = JSON.parse(localStorage.getItem('cashierRecordID'))

	dataClosingControl: any
	isCheckTotal: boolean = false

	invoices: any[] = [
		{ name: "Invoice", value: "invoice" },
		{ name: "Template", value: "template" }

	]
	loadingData = {
		unit: false,
	};
	viewBlockResult = new FormControl();

	columnsList: any[] = [
	];

	loading = {
		msg: '',
		status: false
	};

	detailList: any[] = [];

	descDetail: any[] = []
	descDetailGalon: any[] = []
	descDetailTicket: any[] = []

	selectedColumns = [];
	selection = new SelectionModel<any>(true, []);

	selected = -1;

	// // HardCode price printed
	isPrintedActive: boolean = true // sementara template print tidak ada
	printedFee: number = this.isPrintedActive ? 2500 : 0

	// Zoom PDF
	zoom = 0.98; // default initial zoom value
	zoomMax = 2; // max zoom value
	zoomMin = 0.5; // min zoom value
	zoomAmt = 0.2; // stepping zoom values on button click


	constructor(
		private activatedRoute: ActivatedRoute,
		private serviceFormat: ServiceFormat,
		private templatePDFCashierPayment: TemplatePDFCashierPayment,
		private router: Router,
		private posFB: FormBuilder,
		private dialog: MatDialog,
		private layoutUtilsService: LayoutUtilsService,
		private posService: PosService,
		private cd: ChangeDetectorRef,
		private dialogueService: KtDialogService,
		private sanitizer: DomSanitizer,
		private layoutUtilService: LayoutUtilsService,
	) { }



	startCountTimer(): void {
		if (!this.running) {
			this.running = true;
			this.startTimer = setInterval(() => {
				this.ms++;
				this.ms = this.ms < 10 ? '0' + this.ms : this.ms

				if (this.ms === 100) {
					this.sec++
					this.sec = this.sec < 10 ? '0' + this.sec : this.sec;
					this.ms = '0' + 0
				}

				if (this.sec === 60) {
					this.min++;
					this.min = this.min < 10 ? '0' + this.min : this.min;
					this.sec = '0' + 0
				}
				if (this.min === 60) {
					this.hr++;
					this.hr = this.hr < 10 ? '0' + this.hr : this.hr;
					this.min = '0' + 0
				}

				this.cd.markForCheck()
			}, 10)
		}
	}

	loadGetUnitBilling(text) {
		this.loadingData.unit = true;
		this.selection.clear();
		const queryParams = new QueryPosModel(
			{ "unit": text },
			"desc",
			"id",
			1,
			10
		);
		this.posService.getUnitAll(queryParams).subscribe((res) => {
			this.UnitResultFiltered = res.data
			this.unitResult = res.data
			this.cd.markForCheck()
		});
	}

	selectFormChange(status) {
		const controls = this.posForm.controls
		controls.category.setValue(status)
		this.categoryChoose = true
		// this.categoryChooseTitle = status
		this.checkSearching()
	}

	loadClosingControl() {
		this.loadingData.unit = true;
		this.selection.clear();
		const queryParams = {
			admName: this.nameCashier,
			cashierRecordID: this.cashierRecordID
		}

		this.posService.getClosingControl(queryParams).subscribe((res) => {
			if (res) {
				this.dataClosingControl = res.data
				this.cd.markForCheck()
			}
		});
	}

	createForm() {
		this.posForm = this.posFB.group({
			invoices: [{ value: "", disabled: false }],
			printedFee: [{ value: "", disabled: false }],
			subTotalPOS: [{ value: "", disabled: false }],
			change: [{ value: "", disabled: false }],
			totalPOS: [{ value: "", disabled: false }],
			amount: [{ value: "", disabled: false }],

			category: [{ value: "", disabled: false }],

			payMtd: [{ value: "", disabled: false }],
			bankMtd: [{ value: "", disabled: false }],
			cardNo: [{ value: "", disabled: false }],
			unitID: [{ value: "", disabled: false }],
			cashierRecordID: [{ value: JSON.parse(localStorage.getItem('cashierRecordID')), disabled: false }],
		});
	}

	logout() {
		this.loadClosingControl()
		const dialogRef = this.dialog.open(PopupLogout, {
			data: this.dataClosingControl ? this.dataClosingControl : {},
			maxWidth: "950px",
			minHeight: "350px",
		});

		// tes modal
		dialogRef.afterClosed().subscribe((result) => {
			console.log(result, "result");
		});
	}


	_onKeyup(e: any, status) {
		if (status === "noUnit") this._filterUnit(e.target.value);
	}

	_filterUnit(text: string) {
		this.setUnitLoad = text
		this.loadGetUnitBilling(text)
	}

	_setBlockValue(value, stts) {
		const controls = this.posForm.controls
		if (stts === "unit") {
			this.unitChoose = true
			this.setUnitLoad = value.cdunt
			this.idUnit = value._id
			this.checkSearching()
		}


	}

	// Event handlers and checkers
	addDate(type, e) {
		this.date[type].val = e.target.value;
		// this.checkDateValidation(); 
		this.checkSearching()
	}

	checkSearching() {
		if (this.unitChoose && this.categoryChoose && this.date.start.val && this.date.end.val) this.isOpenSearch = true;
		else this.isOpenSearch = false
	}

	searching() {
		this.dialogueService.show()
		const controls = this.posForm.controls
		const categoryFiltered = controls.category.value
		this.categoryChooseTitle = categoryFiltered

		controls.subTotalPOS.setValue("")
		controls.totalPOS.setValue("")
		controls.amount.setValue("")
		controls.change.setValue("")
		controls.printedFee.setValue("")
		controls.cardNo.setValue("")
		this.detailList = []
		this.descDetail = []
		this.descDetailGalon = []
		this.descDetailTicket = []
		this.columnsList = []
		this.loadingBillUnit = true

		if (categoryFiltered === "galon") this.wordingChecked = "Unit No";
		else if (categoryFiltered === "ticket") this.wordingChecked = "Ticket ID";
		else this.wordingChecked = "Billing Number";

		const queryParams = {
			filter: { unit: this.idUnit, category: categoryFiltered }, startDate: this.date.start.control.value, endDate: this.date.end.control.value
		}

		this.posService.getPaymentHistory(queryParams).subscribe(res => {
			if (res) {
				if (res.data.length === 0) {
					// Check length Column List
					const message = `No data result POS!`;
					this.layoutUtilsService.showActionNotification(message);
				}
				this.columnsList = res.data
			}
		})

		this.loadingBillUnit = false

		// clear preview
		this.pdfSrc = ""
		this.isPrinted = false
		this.preview.status = false

		this.dialogueService.hide()

	}


	_startLoading(msg = '') {
		this.loading.status = true;
		this.loading.msg = msg;

		this.dialogueService.show();
	}

	_stopLoading() {
		this.loading.status = false;
		this.dialogueService.hide();

		this.cd.markForCheck();
	}

	showPreview(url) {
		const source = this.sanitizer.bypassSecurityTrustResourceUrl(url);
		this.preview.src = source;
		if (!this.preview.status) this.preview.status = true;
	}

	// Preview PDF START
	getPreviewSource(stts) {

		if (!this.idSelectPrinted) {
			const message = `Choose your invoice!`;
			this.layoutUtilsService.showActionNotification(message);
			return
		}

		this.dialogueService.show();
		this.loading.status = true
		this.cekBeforePrint(this.idSelectPrinted, stts)
	}

	// Preview PDF END

	idSelectPrinted: string = ""

	clickToSelect(value) {
		this.dialogueService.show()
		this.idSelectPrinted = value._id

		this.pdfSrc = ""
		this.isPrinted = false
		this.preview.status = false
		this.dialogueService.hide()
	}


	onSubmit() {
		const url = `/pos/openCash`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}

	isAllSelected() {
		const numSelected = this.selection.selected.length;
		const numRows = this.columnsList.length;
		return numSelected === numRows;
	}

	consumption: any = {
		ipl: 0, water: 0, power: 0, parking: 0, rental: 0, pinalty: 0
	}
	ticketTotalAll: any = {
		cost: 0
	}

	toggleBilling(event, list) {

	}

	masterToggle() {

		this.isAllSelected()
			? this.selection.clear()
			: this.columnsList.forEach((col) => this.selection.select(col));
	}

	// Print Template
	cekBeforePrint(id, stts) {
		this.getPDFReceipt(id, stts);
	}

	getPDFReceipt(id, stts) {
		this.posService.templatePrintReceipt(id).subscribe(
			res => {
				let label = "template"
				if (this.categoryChooseTitle === "invoice") {
					const result = this.templatePDFCashierPayment.generatePDFTemplate(res);
					this.preview.status = true
					this.isPrinted = true

					if (stts === "preview") {
						// Generating the pdf
						window.scroll({ top: 0, left: 0, behavior: 'smooth' });
						const genPDF = pdfMake.createPdf(result);
						genPDF.getDataUrl((dataUrl) => {
							setTimeout(() => {
								this.loading.status = false
								this.dialogueService.hide()
								this.pdfSrc = this.sanitizer.bypassSecurityTrustResourceUrl(dataUrl)
							}, 2000);
						});

						this.cd.markForCheck()
					} else {
						// Download
						pdfMake.createPdf(result).download(res.cashierNo)
						this.loading.status = false
						this.dialogueService.hide()
					}

				} else if (this.categoryChooseTitle === "ticket") {
					const result = this.templatePDFCashierPayment.generatePDFTemplateTicket(res);

					this.preview.status = true
					this.isPrinted = true

					if (stts === "preview") {
						// Generating the pdf
						window.scroll({ top: 0, left: 0, behavior: 'smooth' });
						const genPDF = pdfMake.createPdf(result);
						genPDF.getDataUrl((dataUrl) => {
							setTimeout(() => {
								this.loading.status = false
								this.dialogueService.hide()
								this.pdfSrc = this.sanitizer.bypassSecurityTrustResourceUrl(dataUrl)
							}, 2000);
						});

						this.cd.markForCheck()
					} else {
						// Download
						pdfMake.createPdf(result).download(res.cashierNo)
						this.loading.status = false
						this.dialogueService.hide()
					}

				} else if (this.categoryChooseTitle === "parking") {
					const result = this.templatePDFCashierPayment.generatePDFTemplateParking(res);

					this.preview.status = true
					this.isPrinted = true

					if (stts === "preview") {
						// Generating the pdf
						window.scroll({ top: 0, left: 0, behavior: 'smooth' });
						const genPDF = pdfMake.createPdf(result);
						genPDF.getDataUrl((dataUrl) => {
							setTimeout(() => {
								this.loading.status = false
								this.dialogueService.hide()
								this.pdfSrc = this.sanitizer.bypassSecurityTrustResourceUrl(dataUrl)
							}, 2000);
						});

						this.cd.markForCheck()
					} else {
						// Download
						pdfMake.createPdf(result).download(res.cashierNo)
						this.loading.status = false
						this.dialogueService.hide()
					}

				} else {
					const result = this.templatePDFCashierPayment.generatePDFTemplateGalon(res);

					this.preview.status = true
					this.isPrinted = true

					if (stts === "preview") {
						// Generating the pdf
						window.scroll({ top: 0, left: 0, behavior: 'smooth' });
						const genPDF = pdfMake.createPdf(result);
						genPDF.getDataUrl((dataUrl) => {
							setTimeout(() => {
								this.loading.status = false
								this.dialogueService.hide()
								this.pdfSrc = this.sanitizer.bypassSecurityTrustResourceUrl(dataUrl)
							}, 2000);
						});

						this.cd.markForCheck()
					} else {
						// Download
						pdfMake.createPdf(result).download(res.cashierNo)
						this.loading.status = false
						this.dialogueService.hide()
					}

				}
			}
		);
	}



}


