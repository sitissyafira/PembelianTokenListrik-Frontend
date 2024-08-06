import { HttpClient, HttpHeaders } from "@angular/common/http";
import {
	Component,
	OnInit,
	ElementRef,
	ViewChild,
	OnDestroy,
	ChangeDetectorRef,
} from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { SelectionModel } from "@angular/cdk/collections";
import { MatDialog, MatPaginator, MatSort } from "@angular/material";
import { NgbModal, ModalDismissReasons } from "@ng-bootstrap/ng-bootstrap";
import { debounceTime, distinctUntilChanged, tap, skip } from "rxjs/operators";
import { fromEvent, merge, Subscription } from "rxjs";
import { Store, select } from "@ngrx/store";
import { AppState } from "../../../../core/reducers";
import {
	LayoutUtilsService,
	MessageType,
} from "../../../../core/_base/crud";
import { BillingModel } from "../../../../core/billingUpd/billing.model";
import { BillingDatasource } from "../../../../core/billingUpd/billing.datasource";
import {
	BillingDeleted,
	BillingPageRequestedLog,
} from "../../../../core/billingUpd/billing.action";
import { SubheaderService } from "../../../../core/_base/layout";
// import { BillingService } from "../../../../core/billing/billing.service";
import { BillingService } from "../../../../core/billingUpd/billing.service";
import { SavingDialog } from "../../../partials/module/saving-confirm/confirmation.dialog.component";

import { MomentDateAdapter } from "@angular/material-moment-adapter";
import {
	DateAdapter,
	MAT_DATE_FORMATS,
	MAT_DATE_LOCALE,
} from "@angular/material";
import * as _moment from "moment";
import { default as _rollupMoment, Moment } from "moment";
import { selectBillingById } from "../../../../core/billingUpd/billing.selector";
import { environment } from "../../../../../environments/environment";
import { QueryBillingModel, QueryBillingModelUpd } from "../../../../core/billingUpd/querybilling.model";
import { FormControl } from "@angular/forms";
import { TemplatePDFBilling } from "../../../../core/templatePDF/billing.service";
import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';

const appHost = `${location.protocol}//${location.host}`;

import { MatDatepicker } from '@angular/material/datepicker';
import { ServiceFormat } from "../../../../core/serviceFormat/format.service";


(<any>pdfMake).vfs = pdfFonts.pdfMake.vfs;
(<any>pdfMake).fonts = {
	Poppins: {
		normal: `${appHost}/assets/fonts/poppins/regular.ttf`,
		bold: `${appHost}/assets/fonts/poppins/bold.ttf`,
		italics: `${appHost}/assets/fonts/poppins/italics.ttf`,
		bolditalics: `${appHost}/assets/fonts/poppins/bolditalics.ttf`
	}
}

const moment = _rollupMoment || _moment;

const MY_FORMATS = {
	parse: {
		dateInput: "MM-YYYY",
	},
	display: {
		dateInput: "MM-YYYY",
		monthYearLabel: "YYYY",
		dateA11yLabel: "LL",
		monthYearA11yLabel: "YYYY",
	},
};

interface ElectricityBillingModel {
	usage: {
		start: number;
		end: number;
		used: number;
	};
	price: {
		used: string;
		amount: string;
		// serviceCharge: string;
		PJU: string;
		loss: string;
		total: string;
	};
	// serviceCharge: number;
	PJU: number;
	loss: number;
}

interface WaterBillingModel {
	dirty: number;
	usage: {
		start: number;
		end: number;
		used: number;
	};
	price: {
		used: string;
		amount: string;
		// admin: string;
		maintenance: string;
		dirty: string;
		total: string;
	};

}

interface IPLBillingModel {
	period: string;
	usage: number;
	price: {
		used: {
			serviceCharge: string;
			sinkingFund: string;
		}
		ipl: string;
		total: string;
	}
}

interface UtilityAdmin {
	utility: string;
	admin: string;
	total: string;
}

interface IPLresponse {
	sCharAmount: string,
	sFundAmount: string
}

interface PaymentBank {
	acctNo: string;
	acctName: string;
}

interface FeeAmount {
	acctNo: string;
	acctName: string;
}
interface account_list {
	account_ipl: [Coa],
	account_power: [Coa],
	account_water: [Coa]
}
interface Coa {
	acctName: string;
	acctNo: string;
	amount: number;
	amount_format: string;
	isDebit: boolean;
}
interface account_list_total {
	account_ipl: total,
	account_power: total,
	account_water: total,
}
interface total {
	amount: string,
	terbilang: string,
}

interface IncFrmCollect {
	acctNo: string;
	acctName: string;
}
interface DataUnitObj {
	block: string;
	nmunit: string;
	floor: string;
}
interface Printed {
	//variable for print detail
	printed_by: string;
	printed_date: string;
	count: number;
}


interface BillingPDFContent {
	logo: string,
	startMonth: string,
	endMonth: string,

	name: string;
	unit: string;
	block: string;
	address: string;
	invoiceNo: string;
	invoiceDate: string;
	invoiceDue: string;
	period: string;

	va_ipl: string;
	va_water: string;
	va_power: string;
	va_gas: string;
	va_parking: string;
	va_utility: string;

	valuePrintedCount: number;
	valuePinalty: string;
	checkPinalty: boolean;

	totalAllGrandTotal: string;
	isReceipt: string;
	allIplInWord: string;
	allWaterInWord: string;

	totalIpl: string;

	dateReceipt: string;

	paidDateBilling: string;

	dataUnitObj: DataUnitObj;

	paymentBankObj: PaymentBank;
	feeAmountObj: FeeAmount;
	incFrmCollectObj: IncFrmCollect;

	feeAmountPriceWTR: string;
	electricity: ElectricityBillingModel;
	water: WaterBillingModel;
	IPL: IPLBillingModel;
	utilityAdminRes: UtilityAdmin;
	iplRes: IPLresponse

	kwhInstalled: string

	cekPPN: string;
	nominalPPN: string;
	subTotal: string
	grandTotal: string;
	totalInWord: string;

	isPaid: boolean;
	paymentStatus: string;
	account_list: account_list;
	account_list_total: account_list_total

	//update billing template for journal
	paymentType: string;

	powerPaid: boolean;
	waterPaid: boolean;
	iplPaid: boolean;

	powerBillLeft: number;
	waterBillLeft: number;
	iplBillLeft: number;

	totalBillLeft: string;
	paymentSelection: string;
	payCond: string;
	totalNominal: any;
	totalNominalInWord: string;

	prevMonth: any;
	isPinalty: boolean;
	pinalty: any;
	printed: Printed
}



@Component({
	selector: "kt-list-billing",
	templateUrl: "./list-billing.component.html",
	styleUrls: ["./list-billing.component.scss"],
	providers: [
		{
			provide: DateAdapter,
			useClass: MomentDateAdapter,
			deps: [MAT_DATE_LOCALE],
		},
		{ provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
	],
})
export class ListBillingLogComponent implements OnInit, OnDestroy {
	file;
	periode_date = new Date();
	closeResult: string;
	download_name: string;
	@ViewChild("pdfViewer", { static: true }) pdfViewer: ElementRef;
	dataSource: BillingDatasource;
	displayedColumns = [
		"select",
		"print_invoice",
		"print_receipt",
		"billing_number",
		// "billedTo",
		"Unit",
		"billing_date",
		"due_date",
		"totalBilling",
		"paymentStatus",
		"isPaid",
		"isPost",
		"payCond",
		"actions",
	];

	data = localStorage.getItem("currentUser");
	dataUser = JSON.parse(this.data);
	role = this.dataUser.role;
	@ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
	@ViewChild("sort1", { static: true }) sort: MatSort;
	@ViewChild("searchInput", { static: true }) searchInput: ElementRef;
	//   @ViewChild("progressFilter", { static: true }) progressFilter: ElementRef;
	//   @ViewChild("verFilter", { static: true }) verFilter: ElementRef;
	lastQuery: QueryBillingModel;
	selection = new SelectionModel<BillingModel>(true, []);
	billingResult: BillingModel[] = [];

	billing: BillingModel;
	hari = new Date();
	year;
	unit;
	loadingbilling: boolean = false;
	loadinggenerate: boolean = false;
	private subscriptions: Subscription[] = [];
	isButtonVisible: boolean = true;

	//   receiptBilling: string = "";

	isGenerateBillings: string = "" /* To determine the condition of the generating billing process in progress */
	msgErrorGenerates: string = "" /* To display message error proccessing generate */


	checkClearDate: boolean
	checkClearPayCond: boolean
	checkClear: boolean

	// isToken: boolean = false;

	valueTotalCount: any = 0
	valueTotalAmount: any = 0
	// Processing downloads
	downloadInProcess: number = 0;
	failedQueue: string[] = [];
	receiptBilling: string = "";
	isToken: boolean = false;
	defaultFilter: boolean = true;

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
	paymentProgressFilterOption = [
		{
			text: "Unpaid",
			value: false,
		}, {
			text: "Paid",
			value: true
		}
	]

	// paymentVerFilterOption = [
	// 	{ 
	// 		text:"On ver.",
	// 		value: false,
	// 	},{
	// 	  	text:"Close",
	// 	  	value:true
	//   	}
	// ]

	filterPaymentProgress = undefined
	filterVerStatus = undefined
	reset: boolean = false;

	form = {
		progress: {
			control: new FormControl(),
			val: undefined,
		},
		ver: {
			control: new FormControl(),
			val: undefined,
		},
	};
	sortField: string = "billing_number"
	sortOrder: string = "desc"

	dateMonth = new FormControl(moment());


	filterByStatus: any = [
		{
			payment: "All Status",
			value: "",
		},
		// {
		// 	payment: "Unpaid - On Ver",
		// 	value: "unpaid-onver",
		// },
		{
			payment: "Paid - On Ver",
			value: "paid-onver",
		},
		// {
		// 	payment: "Paid - Closed",
		// 	value: "paid-closed",
		// },
		{
			payment: "Full Payment",
			value: "full-payment",
		},
		{
			payment: "Outstanding",
			value: "outstanding",
		},
		{
			payment: "Bayar Lebih",
			value: "bayar-lebih",
		},
		{
			payment: "Bayar Kurang",
			value: "bayar-kurang",
		},
	]

	valPayCond: any
	valPayDate: string

	//action privilege by role
	actionPrivilege: boolean = false;
	// selected start
	powerMeterResult: BillingModel[] = [];
	/**
	 *
	 * @param activatedRoute: ActivatedRoute
	 * @param store: Store<AppState>
	 * @param router: Router
	 * @param layoutUtilsService: LayoutUtilsService
	 * @param subheaderService: SubheaderService
	 */
	constructor(
		private activatedRoute: ActivatedRoute,
		private serviceFormat: ServiceFormat,
		private templatePDFBilling: TemplatePDFBilling,
		private store: Store<AppState>,
		private router: Router,
		private service: BillingService,
		private layoutUtilsService: LayoutUtilsService,
		private subheaderService: SubheaderService,
		private http: HttpClient,
		private modalService: NgbModal,
		private cdr: ChangeDetectorRef,
		private dialog: MatDialog,

	) { }
	ngOnInit() {
		const sortSubscription = this.sort.sortChange.subscribe(
			() => (this.paginator.pageIndex = 0)
		);
		this.subscriptions.push(sortSubscription);
		const paginatorSubscriptions = merge(
			this.sort.sortChange,
			this.paginator.page
		)
			.pipe(
				tap(() => {
					this.loadBillingList();
					//   this.actionHandlerPrivilege()
				})
			)
			.subscribe();
		this.subscriptions.push(paginatorSubscriptions);
		const searchSubscription = fromEvent(
			this.searchInput.nativeElement,
			"keyup"
		)
			.pipe(
				debounceTime(150),
				distinctUntilChanged(),
				tap(() => {
					this.paginator.pageIndex = 0;
					//   this.actionHandlerPrivilege()
					this.loadBillingList();
					this.loadBillingListTotal()
					//   this.actionHandlerPrivilege()
					this.totalAmount()
					this.totalCount()
				})
			)
			.subscribe();
		this.subscriptions.push(searchSubscription);
		this.subheaderService.setTitle("IPL Billing");
		this.dataSource = new BillingDatasource(this.store);
		const entitiesSubscription = this.dataSource.entitySubject
			.pipe(skip(1), distinctUntilChanged())
			.subscribe((res) => {
				this.billingResult = res;
				this.totalCount()
				this.totalAmount()
			});
		this.subscriptions.push(entitiesSubscription);
		this.loadBillingList();
		this.loadBillingListTotal()

		// this.filtering = this.fb.group({
		// 	controls: [null]
		//   });
	}

	onSelectFilter(type) {

	}

	ngOnDestroy() {
		this.subscriptions.forEach((sb) => sb.unsubscribe());
	}

	loadBillingList() {
		this.selection.clear();
		const queryParams = new QueryBillingModelUpd(
			this.filterConfiguration(),
			//   this.sort.direction,
			//   this.sort.active === 'billing_date' ? 'created_date' : this.sort.active,
			//   this.paginator.pageIndex + 1,
			//   this.paginator.pageSize,
			// this.sort.direction,
			this.sortOrder,
			// this.sort.active === "id" ? "" : "",
			this.sortField,
			this.paginator.pageIndex + 1,
			this.paginator.pageSize,
			this.valPayCond,
			this.valPayDate,
			this.filterVerStatus,
			this.filterPaymentProgress,

		);


		this.store.dispatch(new BillingPageRequestedLog({ page: queryParams }));
		this.selection.clear();
	}

	loadBillingListTotal() {
		const queryParams = new QueryBillingModelUpd(
			this.filterConfiguration(),
			// this.sort.direction,
			this.sortOrder,
			// this.sort.active === "id" ? "" : "",
			this.sortField,
			this.paginator.pageIndex + 1,
			this.paginator.pageSize,
			this.valPayCond,
			this.valPayDate,
			this.filterVerStatus,
			this.filterPaymentProgress,

		);

		this.service.getListBillingLog(queryParams).subscribe((res) => {
			this.valueTotalCount = res.totalCount
			this.valueTotalAmount = res.allBillingAmount
			this.totalCount()
			this.totalAmount()
			this.cdr.markForCheck()
		})
		this.cdr.markForCheck()
	}

	onClick(type, e) {
		this.defaultFilter = false;
		this.reset = true;
		if (e == true) {
			this.filterPaymentProgress = "true";
			this.loadBillingList()

		} else {
			this.filterPaymentProgress = "false";
			this.loadBillingList()
		}
	}
	onClick2(type, e) {
		this.defaultFilter = false;
		this.reset = true;
		if (e == true) {
			this.filterVerStatus = "true";
			this.loadBillingList()
		} else {
			this.filterVerStatus = "false";
			this.loadBillingList()
		}
	}
	resetFilter() {
		this.defaultFilter = true;
		this.filterVerStatus = 'false';
		this.filterPaymentProgress = 'false';
		this.form.progress.control.setValue(undefined);
		this.form.ver.control.setValue(undefined);

		this.reset = false;

		this.loadBillingList()
		this.cdr.markForCheck()
	}

	filterConfiguration(): any {
		const filter: any = {};
		const searchText: string = this.searchInput.nativeElement.value.toLowerCase();
		// const isPaid: string =this.progressFilter.nativeElement.value.toLowerCase();
		// const paymentStatus: string =this.verFilter.nativeElement.value.toLowerCase();
		filter.unit2 = `${searchText}`;
		// if(this.defaultFilter == false){
		// 	filter.isPaid = this.filterVerStatus;
		// 	filter.paymentStatus = this.filterPaymentProgress;
		// }
		// filter.isPaid = `${isPaid}`;
		// filter.paymentStatus = `${paymentStatus}`;

		return filter;
	}
	//   valueFilterStatus(){
	// 	  console.log("asd")
	// if(e == "true"){
	// 	this.filterPaymentProgress = "true"
	// 	this.loadBillingList()

	//   }else{
	// 	this.filterPaymentProgress = "false"
	// 	this.loadBillingList()
	//   }

	//   }
	//   checkPaymentProgressValidation() {
	// 	  if(this.filterPaymentProgress !== ""){


	// 	  }{

	// 	  }
	// 	// if (this.filterStatusValue !== "") this.date.valid = true;
	// 	// if (this.date.start.val && this.date.end.val) this.date.valid = true;
	// 	// else {
	// 	// 	this.date.valid = false;
	// 	// }
	// }



	deleteBilling(_item: BillingModel) {
		const _title = "Billing Delete";
		const _description = "Are you sure to permanently delete this billing?";
		const _waitDesciption = "Billing is deleting...";
		const _deleteMessage = `Billing has been deleted`;

		const dialogRef = this.layoutUtilsService.deleteElement(
			_title,
			_description,
			_waitDesciption
		);
		dialogRef.afterClosed().subscribe((res) => {
			if (!res) {
				return;
			}
			this.processSaving()
			this.service.deleteBilling(_item._id).subscribe(
				res => {
					this.dialog.closeAll()
					this.loadBillingList()
					this.loadBillingListTotal()
					this.layoutUtilsService.showActionNotification(
						_deleteMessage,
						MessageType.Delete
					);
				}, err => {
					this.dialog.closeAll()
					console.log(err);
					this.layoutUtilsService.showActionNotification(
						"Error delete billing !",
						MessageType.Delete
					);

				}
			)
		});
	}

	selectedBilling() {
		const arrayid = [];
		// var mediaType = 'application/pdf';
		this.selection.selected.forEach((elem) => {
			arrayid.push(elem._id);
		});

		const parseData = { arrayid: arrayid };
		const httpHeaders = new HttpHeaders();
		httpHeaders.set("Content-Type", "application/json");
		this.service.postToMobile(parseData).subscribe(
			(res) => {
				console.log(res);
				this.loadBillingList();
				this.cdr.markForCheck();
			},
			(err) => console.log(err)
		);

	}
	isAllSelected(): boolean {
		const numSelected = this.selection.selected.length;
		const numRows = this.powerMeterResult.length;
		return numSelected === numRows;
	}
	// selected end

	masterToggle() {
		if (this.selection.selected.length === this.billingResult.length) {
			this.selection.clear();
		} else {
			this.billingResult.forEach((row) => this.selection.select(row));
		}
	}

	editBilling(id) {
		this.router.navigate(["edit", id], { relativeTo: this.activatedRoute });
	}

	viewBilling(id) {
		this.router.navigate(["view", id], { relativeTo: this.activatedRoute });
	}

	printBilling(id) {
		this.loadingbilling = true;
		const API_BILLING_URL = `${environment.baseAPI}/api/billing`;
		if (id) {
			this.store.pipe(select(selectBillingById(id))).subscribe((res) => {
				if (res) {
					this.billing = res;
					//console.log(res);
					this.hari = new Date(this.billing.created_date);
					this.year = this.hari.getFullYear();
					this.unit = this.billing.unit2;
					//console.log(typeof this.unit);
				}
			});
		}

		if (this.billing.pinalty <= 0) {
			var mediaType = "application/pdf";
			this.http
				.get(`${API_BILLING_URL}/create/${id}`, {
					responseType: "arraybuffer",
				})
				.subscribe(
					(response) => {
						let blob = new Blob([response], { type: mediaType });
						var fileURL = URL.createObjectURL(blob);
						var anchor = document.createElement("a");
						anchor.download =
							this.unit +
							"_" +
							this.year +
							"_" +
							this.billing.billing_number +
							".pdf";
						anchor.href = fileURL;
						anchor.click();

						// window.open(fileURL, "_blank")
						// const src = fileURL;
						// this.pdfViewer.nativeElement.data = fileURL;

						if (fileURL) {
							this.loadingbilling = false;
							this.cdr.markForCheck();
						}
					},
					(e) => {
						console.error(e);
						this.loadingbilling = false;
						this.cdr.markForCheck();
					}
				);
		} else {
			var mediaType = "application/pdf";
			this.http
				.get(`${API_BILLING_URL}/create/pinalty/${id}`, {
					responseType: "arraybuffer",
				})
				.subscribe(
					(response) => {
						let blob = new Blob([response], { type: mediaType });
						var fileURL = URL.createObjectURL(blob);
						var anchor = document.createElement("a");
						anchor.download =
							this.unit +
							"_" +
							this.year +
							"_" +
							this.billing.billing_number +
							".pdf";
						anchor.href = fileURL;
						anchor.click();

						this.pdfViewer.nativeElement.data = fileURL;
						if (fileURL) {
							this.loadingbilling = false;
							this.cdr.markForCheck();
						}
					},
					(e) => {
						console.error(e);
						this.loadingbilling = false;
						this.cdr.markForCheck();
					}
				);
		}
	}

	/**
   * function for checking unit type and generate pdf based on unit type
   * @param id --> billing id
   * @param print_action --> type template. ex: invoice or receipt
   * template invoice for outstanding & bayar-kurang billing
   * and receipt for full-payment & bayar-lebih
   */
	cekBeforePrint(id, print_action) {
		const httpHeaders = new HttpHeaders();
		httpHeaders.set("Content-Type", "application/json");
		const API_BILLING_URL = `${environment.baseAPI}/api/billing`;

		this.http
			.get<any>(`${API_BILLING_URL}/${id}`, { headers: httpHeaders })
			.subscribe((res) => {
				// if (res.data.isPaid === true && res.data.paymentStatus) {
				if (print_action == "receipt") {
					this.receiptBilling = "RECEIPT";
					this.getPDFisTokenReceipt(id, print_action);
				} else {
					this.receiptBilling = "INVOICE";
					this.getPDF(id, print_action);
				}
			});
		// this.store.pipe(select(selectBillingById(id))).subscribe((res) => {
		//   if (res) {
		//     console.log(res);

		//     if (res.power.powerMeter === "") {
		//       console.log("is token");
		//       this.getPDFisToken(id)
		//       return false
		//     } else {
		//       console.log("no token");
		//       this.getPDF(id)

		//     }
		//     console.log(res.power.powerMeter);
		//     console.log(res);

		//   }
		// });
	}

	valueFilterStatus(e) {
		// this.filterStatusValue = e
		// this.checkDateValidation()
		// this.loadTotalAR()
		// this.loadArList()
		// if(e == "unpaid-onver"){
		// 	this.defaultFilter= false;
		// 	this.filterPaymentProgress = 'false'
		// 	this.filterVerStatus = 'false';
		// 	// this.valPayCond = ''
		// }else 
		if (e == "paid-onver") {
			this.defaultFilter = false;
			this.filterPaymentProgress = 'true';
			this.filterVerStatus = 'false'
			this.valPayCond = ''
		}
		// else if( e == "paid-closed"){
		// 	this.defaultFilter = false;
		// 	this.filterPaymentProgress = 'true';
		// 	this.filterVerStatus = 'true'
		// 	this.valPayCond = ''
		// }
		else {
			this.defaultFilter = true;
			this.filterPaymentProgress = undefined;
			this.filterVerStatus = undefined
			this.valPayCond = e
		}
		this.checkClearPayCond = true
		if (this.checkClearPayCond) this.checkClear = true
		// this.loadBillingList(e, this.valPayDate)
		this.loadBillingList()
		this.loadBillingListTotal()
	}

	clearAllFilter() {
		this.defaultFilter = true;
		this.filterPaymentProgress = undefined;
		this.filterVerStatus = undefined
		this.date.valid = false;
		this.searchInput.nativeElement.value = "";
		this.date.start.val = undefined;
		this.date.start.control.setValue(undefined);
		this.date.end.val = undefined;
		this.date.end.control.setValue(undefined);
		this.date.filter.control.setValue(undefined);

		this.valPayDate = undefined
		this.valPayCond = undefined

		this.dateMonth.setValue(moment())
		this.date.filter.control.setValue(undefined)

		this.checkClear = false

		// this.loadBillingList(this.valPayCond, this.valPayDate)
		this.loadBillingList();
		this.loadBillingListTotal()

		// this.filterStatusValue = ""
		// this.loadTotalAR()
		// this.loadArList();
	}
	// Generate PDF billing with front-end
	getPDF(id, print_action) {
		let bill: undefined | BillingModel;

		this.store.pipe(select(selectBillingById(id))).subscribe((res) => {
			if (res) {
				bill = res;
			}
		});
		const API_BILLING = `${environment.baseAPI}/api/billing`;

		// Buat pinalty jika ada,
		// Sebaliknya buat invoice jika tidak
		// if (bill.pinalty > 0) {
		// 	var mediaType = "application/pdf";
		// 	this.http
		// 		.get(`${API_BILLING}/create/pinalty/${id}`, {
		// 			responseType: "arraybuffer",
		// 		})
		// 		.subscribe(
		// 			(response) => {
		// 				let blob = new Blob([response], { type: mediaType });
		// 				var fileURL = URL.createObjectURL(blob);
		// 				var anchor = document.createElement("a");
		// 				anchor.download =
		// 					this.unit +
		// 					"_" +
		// 					this.year +
		// 					"_" +
		// 					this.billing.billing_number +
		// 					".pdf";
		// 				anchor.href = fileURL;
		// 				anchor.click();

		// 				this.pdfViewer.nativeElement.data = fileURL;
		// 				if (fileURL) {
		// 					this.loadingbilling = false;
		// 					this.cdr.markForCheck();
		// 				}
		// 			},
		// 			(e) => {
		// 				console.error(e);
		// 				this.loadingbilling = false;
		// 				this.cdr.markForCheck();
		// 			}
		// 		);
		// }
		//  else {
		// Increse download process
		this.downloadInProcess += 1;
		this.layoutUtilsService.showActionNotification(
			`Processing download for ${this.downloadInProcess} ${this.downloadInProcess > 1 ? 'item' : 'items'}.`,
			MessageType.Create,
			15000,
			true,
			false
		);

		this.http.get(`${API_BILLING}/send-billing/${id}?type=${print_action}`)
			.subscribe(
				(resp: { status: string; data }) => {
					const label = `${resp.data.unit}-${moment(new Date()).format('YYYY')}-${resp.data.invoiceNo}`;

					// this.generatePDFTemplate(label, {
					// 	...resp.data,
					// 	isReceipt: this.receiptBilling,
					// });
					let template = this.templatePDFBilling.generatePDFTemplate(resp.data);
					pdfMake.createPdf(template).download(label)
					this.setPDFProcessNotification();
					this.loadBillingList()
					this.loadBillingListTotal()
				},
				(err) => {
					this.downloadInProcess -= 1;

					// Push failed file name
					console.error(err);
					this.failedQueue.push(bill.unit2);

					this.setPDFProcessNotification();
				}
			);
		// }
	}

	getPDFisTokenReceipt(id, print_action) {
		let bill: undefined | BillingModel;

		this.store.pipe(select(selectBillingById(id))).subscribe((res) => {
			if (res) {
				bill = res;
			}
		});

		const API_BILLING = `${environment.baseAPI}/api/billing`;

		// Buat pinalty jika ada,
		// Sebaliknya buat invoice jika tidak
		// if (bill.pinalty > 0) {
		// 	var mediaType = "application/pdf";
		// 	this.http
		// 		.get(`${API_BILLING}/create/pinalty/${id}`, {
		// 			responseType: "arraybuffer",
		// 		})
		// 		.subscribe(
		// 			(response) => {
		// 				let blob = new Blob([response], { type: mediaType });
		// 				var fileURL = URL.createObjectURL(blob);
		// 				var anchor = document.createElement("a");
		// 				anchor.download =
		// 					this.unit +
		// 					"_" +
		// 					this.year +
		// 					"_" +
		// 					this.billing.billing_number +
		// 					".pdf";
		// 				anchor.href = fileURL;
		// 				anchor.click();

		// 				this.pdfViewer.nativeElement.data = fileURL;
		// 				if (fileURL) {
		// 					this.loadingbilling = false;
		// 					this.cdr.markForCheck();
		// 				}
		// 			},
		// 			(e) => {
		// 				console.error(e);
		// 				this.loadingbilling = false;
		// 				this.cdr.markForCheck();
		// 			}
		// 		);
		// } 
		// else {
		// Increse download process
		this.downloadInProcess += 1;
		this.layoutUtilsService.showActionNotification(
			`Processing download for ${this.downloadInProcess} ${this.downloadInProcess > 1 ? 'item' : 'items'}.`,
			MessageType.Create,
			15000,
			true,
			false
		);

		this.http.get(`${API_BILLING}/send-billing/${id}?type=${print_action}`)
			.subscribe(
				(resp: { status: string, data }) => {
					const label = `${resp.data.unit}-${moment(new Date()).format('YYYY')}-${resp.data.invoiceNo}`;

					// Template from service (PDF Template Is Token Receipt)
					let template = this.templatePDFBilling.generatePDFTemplateIsTokenReceipt({
						...resp.data,
						isReceipt: this.receiptBilling,
					})
					pdfMake.createPdf(template).download(label)
					this.setPDFProcessNotification();
					this.loadBillingList()
					this.loadBillingListTotal()
				},
				(err) => {
					this.downloadInProcess -= 1;

					// Push failed file name
					console.error(err);
					this.failedQueue.push(bill.unit2);

					this.setPDFProcessNotification();
				}
			);
		// }
	}

	// Show download in process
	setPDFProcessNotification() {
		this.downloadInProcess -= 1;
		if (this.downloadInProcess <= 0) {
			// Reset in process value
			this.downloadInProcess = 0;
			this.layoutUtilsService.showActionNotification(
				'All queue process has been finished.',
				MessageType.Create,
				3500,
				true,
				false
			);

			// Show alert when encountered error in process
			if (this.failedQueue.length > 0) {
				let msg = 'Invoice unit yang gagal di unduh:';
				this.failedQueue.forEach((item, index) => {
					msg += `\n${index + 1}. ${item}`;
				});

				// Show and clear the listed failed unit invoices
				alert(msg);
				this.failedQueue = [];
			}
		} else {
			this.layoutUtilsService.showActionNotification(
				`Processing download for ${this.downloadInProcess} ${this.downloadInProcess > 1 ? 'items' : 'item'}.`,
				MessageType.Create,
				15000,
				true,
				false
			);
		}
	}

	open(content) {
		this.modalService.open(content).result.then(
			(result) => {
				this.closeResult = `Closed with: ${result}`;
			},
			(reason) => {
				this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
			}
		);
	}

	private getDismissReason(reason: any): string {
		if (reason === ModalDismissReasons.ESC) {
			return "by pressing ESC";
		} else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
			return "by clicking on a backdrop";
		} else {
			return `with: ${reason}`;
		}
	}

	openLarge(content) {
		this.modalService.open(content, {
			size: "lg",
			backdrop: "static"
		});
	}

	auto(cb: Function) {
		this.loadinggenerate = true
		const API_BILLING_URL = `${environment.baseAPI}/api/billing/autocreate`;
		var data_url = this.http
			.post(`${API_BILLING_URL}`, {
				date: this.periode_date,
			})
			.subscribe(
				(res) => {
					if (res) {
						const message = `Auto Generate successfully has been added.`;
						this.layoutUtilsService.showActionNotification(
							message,
							MessageType.Create,
							1000,
							true,
							true
						);
						setTimeout(() => {
							this.loadinggenerate = true
							cb('Close click')
						}, 2000);
						setTimeout(() => {
							this.loadBillingList();
						}, 5000);
					}
				},
				(err) => {
					console.error(err);
					const message =
						"Error while adding billing | " + err.statusText;
					this.layoutUtilsService.showActionNotification(
						message,
						MessageType.Create,
						1000,
						true,
						false
					);
				}
			);
	}

	changePeriode(event) {
		this.periode_date = event.value;
		//console.log(event.value);
	}

	selectFile(event) {
		if (event.target.files.length > 0) {
			const file = event.target.files[0];
			this.file = file;
		}
	}

	totalCount() {
		return this.valueTotalCount
	}
	totalAmount() {
		let value = parseFloat(this.valueTotalAmount)
		if (value) return `RP. ${this.serviceFormat.rupiahFormatImprovement(value)}`;
		else return " - "
	}
	announceSortChange(sortState) {
		this.sortField = sortState.active
		this.sortOrder = sortState.direction

		// this.loadBillingList(this.valPayCond, this.valPayDate);
		this.loadBillingList()
	}
	exportHistory() {
		this.service.exportExcelHistory();
	}
	exportToken() {
		// this.service.exportExcelToken();
	}

	_getPaymentClass(status: boolean) {
		return {
			chip: true,
			"chip--success": status,
			"chip--danger": !status,
		};
	}

	/**
	 * Refresh or Load Billing, and Total nominal Billing
	 */
	refresh() {
		this.loadBillingList() // Load or refresh list Billing
		this.loadBillingListTotal() // Load or refresh list Total Billing
	}

	// Class list for list by status
	_getStatusClass(status: boolean, date: string) {
		const diff = this.calculateDay(new Date(date));

		return {
			chip: true,
			"chip--success": status,
			"chip--danger": !status && diff <= -7,
			"chip--warning": !status && diff <= 0 && diff > -7,
		};
	}

	_getStatusIsPost(status: boolean) {
		return {
			chip: true,
			"chip--primary": status,
			"chip--danger": !status,
		};
	}
	_getStatusPayCond(status: string, bill) {

		if (bill.isPaid && bill.paymentStatus && bill.payCond === undefined) return "chip chip--full-payment";
		if (bill.isPaid && bill.paymentStatus && bill.payCond ===
			'outstanding') return "chip chip--full-payment";

		if (bill.payCond == "full-payment" && bill.paymentSelection == "bayar-lebih") return "chip chip--parsial-lebih";

		if (status == 'full-payment' && bill.paymentSelection == 'bayar-lebih') return "chip chip--parsial-lebih"; //request BE handle db 


		if (status == 'full-payment' || status == 'Paid') return "chip chip--full-payment";
		else if (status == 'parsial-lebih' || status == 'bayar-lebih') return "chip chip--parsial-lebih";
		else if (status == 'parsial-kurang' || status == 'bayar-kurang') return "chip chip--parsial-kurang";
		else if (status == 'paid') return "chip chip--paid";
		else return "chip chip--outstanding";
	}

	calculateDay(date: Date): number {
		const now = new Date().getTime();
		const due = date.getTime();

		const diffInTime = due - now;
		const diffInDay = diffInTime / (1000 * 3600 * 24);

		return parseInt(diffInDay.toFixed());
	}
	setMonthAndYear(normalizedMonthAndYear, datepicker: MatDatepicker<Moment>) {
		let ctrlValue = this.dateMonth.value;
		console.log(normalizedMonthAndYear, "normalizedMonthAndYear");

		ctrlValue.month(normalizedMonthAndYear.month());
		ctrlValue.year(normalizedMonthAndYear.year());

		this.dateMonth.setValue(ctrlValue);

		datepicker.close();
		let datVal = moment(this.dateMonth.value).format('L').split("/")
		let result = `${datVal[0]}/${datVal[2]}`
		this.valPayDate = result

		this.checkClearDate = true
		if (this.checkClearDate) this.checkClear = true

		// this.loadBillingList(this.valPayCond, result)
		this.loadBillingList();
		this.loadBillingListTotal();
	}

	actionHandlerPrivilege(billing) {
		if (billing.isPaid === true) return true;

		if (this.role == "administrator") return false;
		else if (this.role == "spv-finance") return false;
		else if (this.role == "manager") return false;
		else if (this.role == "cashier") return false;
		else if (this.role == "collection") return true;
	}

	/**
	 * function for print button mat-icon
	 * @param billing --> params for billing data
	 * @param type --> 'number' & 'display'
	 * 'number' for displaying count of printed pdf 
	 *  and 'display' for hide or show mat-badge in mat-icon
	 * @param print_type --> pdf template type : 'invoice' & 'receipt'
	 * usage ex: 
	 * 
	 * <mat-icon  
	 *  [matBadge]="printedNumber(billing,'number','invoice')" 
	 *  [matBadgeHidden]="printedNumber(billing,'display','invoice')">print</mat-icon>
	 * @returns 
	 */
	printedNumber(billing, type, print_type) {
		if (print_type == 'receipt') {
			if (billing.printedReceipt) {
				if (type == "number") {
					return billing.printedReceipt.length
				} else {
					if (billing.printedReceipt.length == 0) {
						return true
					} else {
						return false
					}
				}
			}
		}
		else {
			if (billing.printedInvoice) {
				if (type == "number") {
					return billing.printedInvoice.length
				} else {
					if (billing.printedInvoice.length == 0) {
						return true
					} else {
						return false
					}
				}
			}
		}
	}
	//end printed number

	/**
* Load AR Process Saving.
*/
	processSaving() {
		const dialogRef = this.dialog.open(
			SavingDialog,
			{
				data: {
					isGenerateBilling: this.isGenerateBillings,
					msgErrorGenerate: this.msgErrorGenerates
				},
				maxWidth: "500px",
				minHeight: "300px",
				disableClose: true
			}
		);
	}

}
