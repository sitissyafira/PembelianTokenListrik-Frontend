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
import { QuotationModel } from '../../../../../core/purchaseManagement/quotation/quotation.model';
import { QuotationPageRequested } from '../../../../../core/purchaseManagement/quotation/quotation.action';
import { QuotationDataSource } from '../../../../../core/purchaseManagement/quotation/quotation.datasource';
import { QuotationService } from '../../../../../core/purchaseManagement/quotation/quotation.service';
import { QueryQuotationModel } from '../../../../../core/purchaseManagement/quotation/queryquotation.model';
import { environment } from '../../../../../../environments/environment';

@Component({
	selector: 'kt-list-quotation',
	templateUrl: './list-quotation.component.html',
	styleUrls: ['./list-quotation.component.scss']
})

export class ListQuotationComponent implements OnInit, OnDestroy {
	file;
	dataSource: QuotationDataSource;
	displayedColumns = [
	'quotation_no',
	'date',
	'select_pr_no',
	'product',
	'uom',
	'qty',
	'actions'];
	@ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
	@ViewChild('sort1', { static: true }) sort: MatSort;
	@ViewChild('searchInput', { static: true }) searchInput: ElementRef;
	lastQuery: QueryParamsModel;
	selection = new SelectionModel<QuotationModel>(true, []);
	quotationResult: QuotationModel[] = [];
	loadingPrint: boolean = false

	private subscriptions: Subscription[] = [];
	constructor(
		private activatedRoute: ActivatedRoute,
		private store: Store<AppState>,
		private router: Router,
		private service: QuotationService,
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
				this.loadQuotationList();
			})
		)
		.subscribe();
		this.subscriptions.push(paginatorSubscriptions);
		const searchSubscription = fromEvent(this.searchInput.nativeElement, 'keyup').pipe(
			debounceTime(500),
			distinctUntilChanged(),
			tap(() => {
				this.paginator.pageIndex = 0;
				this.loadQuotationList();
			})
		).subscribe();
		this.subscriptions.push(searchSubscription);
		this.subheaderService.setTitle('Quotation');
		this.dataSource = new QuotationDataSource(this.store);
		console.log(this.dataSource, 'this data source')
		const entitiesSubscription = this.dataSource.entitySubject.pipe(
			skip(1),
			distinctUntilChanged()
		).subscribe(
			res => {
			this.quotationResult = res;
			},
			err => {
			alert('error');
		}
		);
		this.subscriptions.push(entitiesSubscription);
		this.loadQuotationList();
	}

	filterConfiguration(): any {
		const search: string = this.searchInput.nativeElement.value.toLowerCase();
		return search;
	}

	loadQuotationList() {
		this.selection.clear();
		const queryParams = new QueryQuotationModel(
			this.filterConfiguration(),
			this.paginator.pageIndex + 1,
			this.paginator.pageSize
		);
		this.store.dispatch(new QuotationPageRequested({ page: queryParams }));
		this.selection.clear();
	}

	deleteQuotation(_item: QuotationModel) {
		const _title = 'Quotation Delete';
		const _description = 'Are you sure to permanently delete this Quotation?';
		const _waitDesciption = 'Quotation is deleting...';
		const _deleteMessage = `Quotation has been deleted`;
		const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				return;
			}
			const deleteFlag = this.service.deleteFlagQuotation(_item).subscribe()
			this.subscriptions.push(deleteFlag);
			this.layoutUtilsService.showActionNotification(_deleteMessage, MessageType.Delete);
			this.loadQuotationList();
		});
	}
	viewQuotation(id) {
		this.router.navigate(['view', id], { relativeTo: this.activatedRoute });
	}

	editQuotation(id) {
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
	// export() {
	// 	this.service.exportExcel();
	// }
	printPDF(id) {
		this.loadingPrint == true
		const API_PDF_URL = `${environment.baseAPI}/api/purchase/quotation`;

		var mediaType = "application/pdf";
		this.http
			.get(`${API_PDF_URL}/export/pdf/${id}`, {
				responseType: "arraybuffer",
			})
			.subscribe(
				(response) => {
					let blob = new Blob([response], { type: mediaType });
					var fileURL = URL.createObjectURL(blob);
					var anchor = document.createElement("a");
					anchor.download =  "quotation.pdf";
					anchor.href = fileURL;
					anchor.click();

					// window.open(fileURL, "_blank")
					// const src = fileURL;
					// this.pdfViewer.nativeElement.data = fileURL;

					if (fileURL){
						this.loadingPrint = false
						this.cdr.markForCheck();
					}
				},
				(e) => {
					console.error(e);
					this.loadingPrint = false
					this.cdr.markForCheck();
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
