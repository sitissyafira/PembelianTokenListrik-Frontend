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
import { PoReceiptModel } from '../../../../../core/purchaseManagement/poReceipt/poReceipt.model';
import { PoReceiptPageRequested } from '../../../../../core/purchaseManagement/poReceipt/poReceipt.action';
import { PoReceiptDataSource } from '../../../../../core/purchaseManagement/poReceipt/poReceipt.datasource';
import { PoReceiptService } from '../../../../../core/purchaseManagement/poReceipt/poReceipt.service';
import { QueryPoReceiptModel } from '../../../../../core/purchaseManagement/poReceipt/querypoReceipt.model';
import { environment } from '../../../../../../environments/environment';
// import { TemplatePDFPO } from '../../../../../core/templatePDF/purchaseOrder.service';
import { TemplatePDFPOReceipt } from '../../../../../core/templatePDF/poReceipt.service';
import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import { FormControl } from '@angular/forms';

@Component({
	selector: 'kt-list-poReceipt',
	templateUrl: './list-poReceipt.component.html',
	styleUrls: ['./list-poReceipt.component.scss']
})

export class ListPoReceiptComponent implements OnInit, OnDestroy {
	file;
	dataSource: PoReceiptDataSource;
	displayedColumns = [
	"prnt",
	"receipt_number",
	'po_no',
	'vendor_code',
	'vendor_name',
	'date',
	'qty',
	"in_qty",
	'type_receipt',
	'actions'
	];
	loadingPrint: boolean = false

	@ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
	@ViewChild('sort1', { static: true }) sort: MatSort;
	@ViewChild('searchInput', { static: true }) searchInput: ElementRef;
	lastQuery: QueryParamsModel;
	selection = new SelectionModel<PoReceiptModel>(true, []);
	poReceipt: PoReceiptModel[] = [];
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
			label: "Partial",
			value: "2",
		},
		{
			label: "Full",
			value: "1",
		},
		{
			label: "Return",
			value: "3",
		},
	]
	private subscriptions: Subscription[] = [];
	constructor(
		private activatedRoute: ActivatedRoute,
		private templatePDFPOReceipt: TemplatePDFPOReceipt,
		private store: Store<AppState>,
		private router: Router,
		private service: PoReceiptService,
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
				this.loadpoReceiptList();
			})
		)
		.subscribe();
		this.subscriptions.push(paginatorSubscriptions);
		const searchSubscription = fromEvent(this.searchInput.nativeElement, 'keyup').pipe(
			debounceTime(500),
			distinctUntilChanged(),
			tap(() => {
				this.paginator.pageIndex = 0;
				this.loadpoReceiptList();
			})
		).subscribe();
		this.subscriptions.push(searchSubscription);
		this.subheaderService.setTitle('PO Receipt');
		this.dataSource = new PoReceiptDataSource(this.store);
		const entitiesSubscription = this.dataSource.entitySubject.pipe(
			skip(1),
			distinctUntilChanged()
		).subscribe(
			res => {
			this.poReceipt = res;
			},
			err => {
			alert('error');
		}
		);
		this.subscriptions.push(entitiesSubscription);
		this.loadpoReceiptList();
	}

	refresh() {
		this.loadpoReceiptList() // Load or refresh list Billing
	}

	filterConfiguration(): any {
		const search: string = this.searchInput.nativeElement.value.toLowerCase();
		this.queryFilterSearch = search

		return JSON.stringify({
			receipt_number: this.queryFilterSearch,
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

		this.loadpoReceiptList()
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

		this.loadpoReceiptList()
	}

	loadpoReceiptList() {
		this.selection.clear();
		const queryParams = new QueryPoReceiptModel(
			this.filterConfiguration(),
			this.paginator.pageIndex + 1,
			this.paginator.pageSize
		);
		this.store.dispatch(new PoReceiptPageRequested({ page: queryParams }));
		this.selection.clear();
	}

	deletepoReceipt(_item: PoReceiptModel) {
		const _title = 'Purchase Order Delete';
		const _description = 'Are you sure to permanently delete this Purchase Order?';
		const _waitDesciption = 'Purchase Order is deleting...';
		const _deleteMessage = `Purchase Order has been deleted`;
		const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				return;
			}
			const deleteFlag = this.service.deleteFlagPoReceipt(_item).subscribe()
			this.subscriptions.push(deleteFlag);
			this.layoutUtilsService.showActionNotification(_deleteMessage, MessageType.Delete);
			this.loadpoReceiptList();
		});
		this.cdr.markForCheck()
	}

	viewpoReceipt(id) {
		this.router.navigate(['view', id], { relativeTo: this.activatedRoute });
	}

	editpoReceipt(id) {
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
		const API_PDF_URL = `${environment.baseAPI}/api/purchase/receipt`;

		var mediaType = "application/pdf";
		this.http
			.get<any>(`${API_PDF_URL}/print/pdf/${id}`)
			.subscribe(
				(resp) => {
					const label = `${resp.data.receipt_number}`
					console.log(resp.data, 'resp data')

					let template = this.templatePDFPOReceipt.generatePDF(resp.data)
					pdfMake.createPdf(template).download(label)
					
				}
			);


		// this.service.exportPDF(id).subscribe(
		// 	res => {
		// 		console.log(res.data);
		// 		this.loadingPrint = false
		// 	}
		// )
	}
}
