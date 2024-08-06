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
import { PurchaseRequestModel } from '../../../../../core/purchaseManagement/purchaseRequest/purchaseRequest.model';
import { PurchaseRequestPageRequested } from '../../../../../core/purchaseManagement/purchaseRequest/purchaseRequest.action';
import { PurchaseRequestDataSource } from '../../../../../core/purchaseManagement/purchaseRequest/purchaseRequest.datasource';
import { PurchaseRequestService } from '../../../../../core/purchaseManagement/purchaseRequest/purchaseRequest.service';
import { QueryPurchaseRequestModel } from '../../../../../core/purchaseManagement/purchaseRequest/querypurchaseRequest.model';
import { environment } from '../../../../../../environments/environment';
import { TemplatePDFPurchaseRequest } from '../../../../../core/templatePDF/purchaseRequest.service';
import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
@Component({
	selector: 'kt-list-purchaseRequest',
	templateUrl: './list-purchaseRequest.component.html',
	styleUrls: ['./list-purchaseRequest.component.scss']
})

export class ListPurchaseRequestComponent implements OnInit, OnDestroy {
	file;
	dataSource: PurchaseRequestDataSource;
	displayedColumns = [
	"prnt",
	'purchase_request_no',
	'type_pr',
	'request_date',
	'grand_total',
	'status',
	'actions'
	];

	loadingPrint: boolean = false

	@ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
	@ViewChild('sort1', { static: true }) sort: MatSort;
	@ViewChild('searchInput', { static: true }) searchInput: ElementRef;
	lastQuery: QueryParamsModel;
	selection = new SelectionModel<PurchaseRequestModel>(true, []);
	purchaseRequestResult: PurchaseRequestModel[] = [];
	private subscriptions: Subscription[] = [];
	constructor(
		private activatedRoute: ActivatedRoute,
		private store: Store<AppState>,
		private router: Router,
		private service: PurchaseRequestService,
		private layoutUtilsService: LayoutUtilsService,
		private subheaderService: SubheaderService,
		private cdr: ChangeDetectorRef,
		private http: HttpClient,
		private modalService: NgbModal,
		private templatePDFPurchaseRequest: TemplatePDFPurchaseRequest,
	) { }

	ngOnInit() {
		const sortSubscription = this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0));
		this.subscriptions.push(sortSubscription);
		const paginatorSubscriptions = merge(this.sort.sortChange, this.paginator.page).pipe(
			tap(() => {
				this.loadpurchaseRequestList();
			})
		)
		.subscribe();
		this.subscriptions.push(paginatorSubscriptions);
		const searchSubscription = fromEvent(this.searchInput.nativeElement, 'keyup').pipe(
			debounceTime(500), 
			distinctUntilChanged(),
			tap(() => {
				this.paginator.pageIndex = 0;
				this.loadpurchaseRequestList();
			})
		).subscribe();
		this.subscriptions.push(searchSubscription);
		this.subheaderService.setTitle('Purchase Request');
		this.dataSource = new PurchaseRequestDataSource(this.store);
		const entitiesSubscription = this.dataSource.entitySubject.pipe(
			skip(1),
			distinctUntilChanged()
		).subscribe(
			res => {
			this.purchaseRequestResult = res;
			}, 
			err => {
			alert('error');		
		}
		);
		this.subscriptions.push(entitiesSubscription);
		this.loadpurchaseRequestList();
	}

	filterConfiguration(): any {
		const search: string = this.searchInput.nativeElement.value.toLowerCase();
		return search;
	}

	loadpurchaseRequestList() {
		this.selection.clear();
		const queryParams = new QueryPurchaseRequestModel(
			this.filterConfiguration(),
			this.paginator.pageIndex + 1,
			this.paginator.pageSize
		);
		this.store.dispatch(new PurchaseRequestPageRequested({ page: queryParams }));
		this.selection.clear();
	}

	deletepurchaseRequest(_item: PurchaseRequestModel) {
		const _title = 'Purchase Request Delete';
		const _description = 'Are you sure to permanently delete this Purchase Request?';
		const _waitDesciption = 'Purchase Request is deleting...';
		const _deleteMessage = `Purchase Request has been deleted`;
		const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				return;
			}
			const deleteFlag = this.service.deleteFlagPurchaseRequest(_item).subscribe()
			this.subscriptions.push(deleteFlag);
			this.layoutUtilsService.showActionNotification(_deleteMessage, MessageType.Delete);
			this.loadpurchaseRequestList();
		});
	}

	editpurchaseRequest(id) {
		this.router.navigate(['edit', id], { relativeTo: this.activatedRoute });
	}
	viewpurchaseRequest(id) {
		this.router.navigate(['view', id], { relativeTo: this.activatedRoute });
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


	printPDF(id) {
		this.loadingPrint = true
		const API_PDF_URL = `${environment.baseAPI}/api/purchase/request`;
		
		var mediaType = "application/pdf";
		this.http
			.get<any>(`${API_PDF_URL}/export/pdf/${id}`)
			.subscribe(
				(resp) => {
					const label = `${resp.data.purchase_request_no}`

					let template = this.templatePDFPurchaseRequest.generatePDF(resp.data)
					pdfMake.createPdf(template).download(label)

					this.loadingPrint = false
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
