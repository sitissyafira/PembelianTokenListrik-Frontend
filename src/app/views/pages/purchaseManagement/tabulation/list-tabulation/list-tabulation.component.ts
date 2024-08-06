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
import { TabulationModel } from '../../../../../core/purchaseManagement/tabulation/tabulation.model';
import { TabulationPageRequested } from '../../../../../core/purchaseManagement/tabulation/tabulation.action';
import { TabulationDataSource } from '../../../../../core/purchaseManagement/tabulation/tabulation.datasource';
import { TabulationService } from '../../../../../core/purchaseManagement/tabulation/tabulation.service';
import { QueryTabulationModel } from '../../../../../core/purchaseManagement/tabulation/querytabulation.model';
import { environment } from '../../../../../../environments/environment';

@Component({
	selector: 'kt-list-tabulation',
	templateUrl: './list-tabulation.component.html',
	styleUrls: ['./list-tabulation.component.scss']
})

export class ListTabulationComponent implements OnInit, OnDestroy {
	file;
	dataSource: TabulationDataSource;
	displayedColumns = [
	'quotation_no',
	'quotation_date',
	'select_pr_no',
	'tabulation_no',
	'tabulation_date',
	'status',
	'vendor',
	'actions',	
	];
	@ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
	@ViewChild('sort1', { static: true }) sort: MatSort;
	@ViewChild('searchInput', { static: true }) searchInput: ElementRef;
	lastQuery: QueryParamsModel;
	selection = new SelectionModel<TabulationModel>(true, []);
	tabulationResult: TabulationModel[] = [];
	loadingPrint: boolean = false

	private subscriptions: Subscription[] = [];
	constructor(
		private activatedRoute: ActivatedRoute,
		private store: Store<AppState>,
		private router: Router,
		private service: TabulationService,
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
				this.loadTabulationList();
			})
		)
		.subscribe();
		this.subscriptions.push(paginatorSubscriptions);
		const searchSubscription = fromEvent(this.searchInput.nativeElement, 'keyup').pipe(
			debounceTime(500),
			distinctUntilChanged(),
			tap(() => {
				this.paginator.pageIndex = 0;
				this.loadTabulationList();
			})
		).subscribe();
		this.subscriptions.push(searchSubscription);
		this.subheaderService.setTitle('Tabulation');
		this.dataSource = new TabulationDataSource(this.store);
		const entitiesSubscription = this.dataSource.entitySubject.pipe(
			skip(1),
			distinctUntilChanged()
		).subscribe(
			res => {
			this.tabulationResult = res;
			},
			err => {
			alert('error');
		}
		);
		this.subscriptions.push(entitiesSubscription);
		this.loadTabulationList();
	}

	filterConfiguration(): any {
		const search: string = this.searchInput.nativeElement.value.toLowerCase();
		return search;
	}

	loadTabulationList() {
		this.selection.clear();
		const queryParams = new QueryTabulationModel(
			this.filterConfiguration(),
			this.paginator.pageIndex + 1,
			this.paginator.pageSize
		);
		this.store.dispatch(new TabulationPageRequested({ page: queryParams }));
		this.selection.clear();
	}

	deleteTabulation(_item: TabulationModel) {
		const _title = 'Tabulation Delete';
		const _description = 'Are you sure to permanently delete this Tabulation?';
		const _waitDesciption = 'Tabulation is deleting...';
		const _deleteMessage = `Tabulation has been deleted`;
		const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				return;
			}
			const deleteFlag = this.service.deleteFlagTabulation(_item).subscribe()
			this.subscriptions.push(deleteFlag);
			this.layoutUtilsService.showActionNotification(_deleteMessage, MessageType.Delete);
			this.loadTabulationList();
		});
	}
	viewTabulation(id) {
		this.router.navigate(['view', id], { relativeTo: this.activatedRoute });
	}

	editTabulation(id) {
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
		const API_PDF_URL = `${environment.baseAPI}/api/purchase/tabulation`;

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
					anchor.download =  "tabulation.pdf";
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
