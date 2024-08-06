import { Component, OnInit, ElementRef, ViewChild, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SelectionModel } from '@angular/cdk/collections';
import { MatPaginator, MatSort,} from '@angular/material';
import { debounceTime, distinctUntilChanged, tap, skip, } from 'rxjs/operators';
import { fromEvent, merge,Subscription } from 'rxjs';
import { Store,} from '@ngrx/store';
import { AppState } from '../../../../../core/reducers';
import { LayoutUtilsService, MessageType, QueryParamsModel } from '../../../../../core/_base/crud';
import { HttpClient } from '@angular/common/http';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { SubheaderService } from '../../../../../core/_base/layout';
import { PaymentPoModel } from '../../../../../core/purchaseManagement/paymentPo/paymentPo.model';
import { PaymentPoPageRequested } from '../../../../../core/purchaseManagement/paymentPo/paymentPo.action';
import { PaymentPoDataSource } from '../../../../../core/purchaseManagement/paymentPo/paymentPo.datasource';
import { PaymentPoService } from '../../../../../core/purchaseManagement/paymentPo/paymentPo.service';
import { QueryPaymentPoModel } from '../../../../../core/purchaseManagement/paymentPo/querypaymentPo.model';
import { environment } from '../../../../../../environments/environment';
// import { TemplatePDFPO } from '../../../../../core/templatePDF/paymentPo.service';
import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import { TemplatePDFAccountPayable } from '../../../../../core/templatePDF/ap.service';
import { FormControl } from '@angular/forms';

@Component({
	selector: 'kt-list-paymentPo',
	templateUrl: './list-paymentPo.component.html',
	styleUrls: ['./list-paymentPo.component.scss']
})

export class ListPaymentPoComponent implements OnInit, OnDestroy {
	file;
	dataSource: PaymentPoDataSource;
	displayedColumns = [
	"prnt",
	'no_po_payment',
	'no_reference',
	'no_vendor',
	'vendor_name',
	'crt_date',
	'inv_date',
	'due_date',
	'status',
	'actions'
	];
	loadingPrint: boolean = false

	queryFilterSearch: any;
	queryFilterStatus: any;
	queryFilterDateStart: any;
	queryFilterDateEnd: any;
	formFilterSearch = new FormControl();
	formFilterStatus = new FormControl();
	formFilterDateStart = new FormControl();
	formFilterDateEnd = new FormControl();
	statusPOList = [
		{
			label: "Paid",
			value: "paid",
		},
		{
			label: "Unpaid",
			value: "unpaid",
		},
	]

	@ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
	@ViewChild('sort1', { static: true }) sort: MatSort;
	@ViewChild('searchInput', { static: true }) searchInput: ElementRef;
	lastQuery: QueryParamsModel;
	selection = new SelectionModel<PaymentPoModel>(true, []);
	paymentPoResult: PaymentPoModel[] = [];
	private subscriptions: Subscription[] = [];
	constructor(
		private activatedRoute: ActivatedRoute,
		private templatePDFAP: TemplatePDFAccountPayable,
		private store: Store<AppState>,
		private router: Router,
		private service: PaymentPoService,
		private layoutUtilsService: LayoutUtilsService,
		private subheaderService: SubheaderService,
		private cdr: ChangeDetectorRef,
		private http: HttpClient,
		private modalService: NgbModal
	) { }

	ngOnInit() {
		const sortSubscription = this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0));
		this.subscriptions.push(sortSubscription);
		const paginatorSubscriptions = merge(this.sort.sortChange, this.paginator.page).pipe(
			tap(() => {
				this.loadpaymentPoList();
			})
		)
		.subscribe();
		this.subscriptions.push(paginatorSubscriptions);
		const searchSubscription = fromEvent(this.searchInput.nativeElement, 'keyup').pipe(
			debounceTime(500),
			distinctUntilChanged(),
			tap(() => {
				this.paginator.pageIndex = 0;
				this.loadpaymentPoList();
			})
		).subscribe();
		this.subscriptions.push(searchSubscription);
		this.subheaderService.setTitle('PO Payment');
		this.dataSource = new PaymentPoDataSource(this.store);
		const entitiesSubscription = this.dataSource.entitySubject.pipe(
			skip(1),
			distinctUntilChanged()
		).subscribe(
			res => {
			this.paymentPoResult = res;
			},
			err => {
			alert('error');
		}
		);
		this.subscriptions.push(entitiesSubscription);
		this.loadpaymentPoList();
	}

	refresh() {
		this.loadpaymentPoList() // Load or refresh list Billing
	}

	filterConfiguration(): any {
		const search: string = this.searchInput.nativeElement.value.toLowerCase();
		this.queryFilterSearch = search

		return JSON.stringify({
			purchase_invoice_no: this.queryFilterSearch,
			status: this.queryFilterStatus,
			startDate: this.queryFilterDateStart,
			endDate: this.queryFilterDateEnd,
		})
	}

	queryFilterChange(value, prop){
		console.log(value, 'value')
		if(prop === "status"){
			this.queryFilterStatus = value
		}
		else if(prop === "startDate"){
			this.queryFilterDateStart = value
		}
		else if(prop === "endDate"){
			this.queryFilterDateEnd = value
		}

		this.loadpaymentPoList()
	}

	clearAllFilter(){
		this.searchInput.nativeElement.value = ""
		this.queryFilterStatus = ""
		this.queryFilterDateStart = undefined
		this.queryFilterDateEnd = undefined

		this.formFilterDateEnd.setValue("")
		this.formFilterDateStart.setValue("")
		this.formFilterSearch.setValue("")
		this.formFilterStatus.setValue("")

		this.loadpaymentPoList()
	}

	loadpaymentPoList() {
		this.selection.clear();
		const queryParams = new QueryPaymentPoModel(
			this.filterConfiguration(),
			this.paginator.pageIndex + 1,
			this.paginator.pageSize
		);
		this.store.dispatch(new PaymentPoPageRequested({ page: queryParams }));
		this.selection.clear();
	}

	deletepaymentPo(_item: PaymentPoModel) {
		const _title = 'PO Payment Delete';
		const _description = 'Are you sure to permanently delete this PO Payment?';
		const _waitDesciption = 'PO Payment is deleting...';
		const _deleteMessage = `PO Payment has been deleted`;
		const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				return;
			}
			const deleteFlag = this.service.deleteFlagPaymentPo(_item).subscribe()
			this.subscriptions.push(deleteFlag);
			this.layoutUtilsService.showActionNotification(_deleteMessage, MessageType.Delete);
			this.loadpaymentPoList();
		});
		this.cdr.markForCheck()
	}

	viewpaymentPo(id) {
		this.router.navigate(['view', id], { relativeTo: this.activatedRoute });
	}

	editpaymentPo(id) {
		this.router.navigate(['edit', id], { relativeTo: this.activatedRoute });
	}

	ngOnDestroy() {
		this.subscriptions.forEach(sb => sb.unsubscribe());
	}
	exportExcel() {
		this.service.exportExcel();
	}

	_getStatusClass(status: boolean) {

		return {
			'chip': true,
			'chip--success': status,
			'chip--danger': !status,
		}
	}

	// printPDF(id) {
	// 	this.loadingPrint == true
	// 	const API_PDF_URL = `${environment.baseAPI}/api/purchase/order`;

	// 	var mediaType = "application/pdf";
	// 	this.http
	// 		.get(`${API_PDF_URL}/export/pdf/${id}`, {
	// 			responseType: "arraybuffer",
	// 		})
	// 		.subscribe(
	// 			(response) => {
	// 				let blob = new Blob([response], { type: mediaType });
	// 				var fileURL = URL.createObjectURL(blob);
	// 				var anchor = document.createElement("a");
	// 				anchor.download =  "purchase-order.pdf";
	// 				anchor.href = fileURL;
	// 				anchor.click();

	// 				// window.open(fileURL, "_blank")
	// 				// const src = fileURL;
	// 				// this.pdfViewer.nativeElement.data = fileURL;

	// 				if (fileURL){
	// 					this.loadingPrint = false
	// 					this.cdr.markForCheck();
	// 				}
	// 			},
	// 			(e) => {
	// 				console.error(e);
	// 				this.loadingPrint = false
	// 				this.cdr.markForCheck();
	// 			}
	// 		);


	// 	// this.service.exportPDF(id).subscribe(
	// 	// 	res => {
	// 	// 		console.log(res.data);
	// 	// 		this.loadingPrint = false
	// 	// 	}
	// 	// )
	// }
	printPDF(id) {
		this.loadingPrint == true
		const API_AR = `${environment.baseAPI}/api/accpurchase`;

		this.http.get(`${API_AR}/print/detail?id=${id}`).subscribe(
			(resp: any) => {
				const result = this.templatePDFAP.generatePDFTemplateAP(resp, resp.data);

				pdfMake.createPdf(result).download(`${resp.voucherNo}`);
				// nted

				this.loadingPrint = false;
			}
			// (err) => {
			// 	this.downloadInProcess -= 1;

			// 	// Push failed file name
			// 	console.error(err);
			// 	this.failedQueue.push(bill.unit2);

			// 	this.setPDFProcessNotification();
			// }
		);

		// this.service.exportPDF(id).subscribe(
		// 	res => {
		// 		console.log(res.data);
		// 		this.loadingPrint = false
		// 	}
		// )
	}

	checkIsDue(date, status){
		const currentDate = new Date()
		const dueDate = new Date(date)

		if(currentDate > dueDate && !status) return true
		else return false
	}

	_getStatusPaid(status){
		if(status) return "chip chip--paid"
		else return "chip chip--unpaid"
	}
}
