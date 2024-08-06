// Angular
import { Component, OnInit, ElementRef, ViewChild, ChangeDetectionStrategy, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
// Material
import { SelectionModel } from '@angular/cdk/collections';
import { MatPaginator, MatSort, MatSnackBar } from '@angular/material';
import {NgbModal, ModalDismissReasons} from '@ng-bootstrap/ng-bootstrap';
// RXJS
import { debounceTime, distinctUntilChanged, tap, skip, take, delay } from 'rxjs/operators';
import { fromEvent, merge, Observable, of, Subscription } from 'rxjs';
// LODASH
import { each, find } from 'lodash';
// NGRX
import { Store, select } from '@ngrx/store';
import { AppState } from '../../../../core/reducers';

// Services
import { LayoutUtilsService, MessageType, QueryParamsModel } from '../../../../core/_base/crud';
import { DepositDeleted, DepositPageRequested} from '../../../../core/deposit/deposit.action';
import { selectDepositById, } from '../../../../core/deposit/deposit.selector';
import { SubheaderService } from '../../../../core/_base/layout';

import {QueryDepositModel} from '../../../../core/deposit/querydeposit.model';
import {DepositModel} from '../../../../core/deposit/deposit.model';
import {DepositService} from '../../../../core/deposit/deposit.service';
import { DepositDataSource } from '../../../../core/deposit/deposit.datasource';
import * as _moment from "moment";
import { default as _rollupMoment, Moment } from "moment";
const moment = _rollupMoment || _moment;
import {MatDialog, MAT_DIALOG_DATA} from '@angular/material';
import { TranslateService } from '@ngx-translate/core';
import { environment } from '../../../../../environments/environment';



@Component({
  selector: 'kt-list-deposit',
  templateUrl: './list-deposit.component.html',
  styleUrls: ['./list-deposit.component.scss']
})
export class ListDepositComponent implements OnInit, OnDestroy {
	file;
	closeResult: string;
	dataSource: DepositDataSource;
	download_name: string;
	@ViewChild("pdfViewer", { static: true }) pdfViewer: ElementRef;
	displayedColumns = ['select','prnt', 'receiveno', 'custname', 'pymnttype','invoicedte','dpstin','actions'];
	@ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
	@ViewChild('sort1', {static: true}) sort: MatSort;
	// Filter fields
	@ViewChild('searchInput', {static: true}) searchInput: ElementRef;
	
	lastQuery: QueryDepositModel;
	// Selection
	selection = new SelectionModel<DepositModel>(true, []);
	depositResult: DepositModel[] = [];

	// Subscriptions
	private subscriptions: Subscription[] = [];
	constructor(
		private activatedRoute: ActivatedRoute,
		private store: Store<AppState>,
		private router: Router,
		private service: DepositService,
		private layoutUtilsService: LayoutUtilsService,
		private subheaderService: SubheaderService,
		private http: HttpClient,
		private modalService: NgbModal,
		private dialog: MatDialog,
		private translate: TranslateService,
	) { }
	ngOnInit() {
		const sortSubscription = this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0));
		this.subscriptions.push(sortSubscription);

		/* Data load will be triggered in two cases:
		- when a pagination event occurs => this.paginator.page
		- when a sort event occurs => this.sort.sortChange
		**/
		const paginatorSubscriptions = merge(this.sort.sortChange, this.paginator.page).pipe(
			tap(() => {
				this.loadDepositList();
			})
		)
			.subscribe();
		this.subscriptions.push(paginatorSubscriptions);


		// Filtration, bind to searchInput
		const searchSubscription = fromEvent(this.searchInput.nativeElement, 'keyup').pipe(
			// tslint:disable-next-line:max-line-length
			debounceTime(150), // The user can type quite quickly in the input box, and that could trigger a lot of server requests. With this operator, we are limiting the amount of server requests emitted to a maximum of one every 150ms
			distinctUntilChanged(), // This operator will eliminate duplicate values
			tap(() => {
				this.paginator.pageIndex = 0;
				this.loadDepositList();
			})
		).subscribe();
		this.subscriptions.push(searchSubscription);

		// Set title to page breadCrumbs
		this.subheaderService.setTitle('Deposit');

		// Init DataSource
		this.dataSource = new DepositDataSource(this.store);
		const entitiesSubscription = this.dataSource.entitySubject.pipe(
			skip(1),
			distinctUntilChanged()
		).subscribe(res => {
			this.depositResult = res;
		});
		this.subscriptions.push(entitiesSubscription);

		// First Load
		// of(undefined).pipe(take(1), delay(1000)).subscribe(() => { // Remove this line, just loading imitation
		// 	this.loadDepositList();
		// });
		this.loadDepositList();
	}
	loadDepositList() {
		this.selection.clear();
		const queryParams = new QueryDepositModel(
			this.filterConfiguration(),
			this.sort.direction,
			this.sort.active,
			this.paginator.pageIndex+1,
			this.paginator.pageSize
		);
		this.store.dispatch(new DepositPageRequested({ page: queryParams }));
		this.selection.clear();
	}

	/** FILTRATION */
	filterConfiguration(): any {
		const filter: any = {};
		const searchText: string = this.searchInput.nativeElement.value;

		filter.receiveno = `${searchText}`;

		return filter;
	}
	fetchFloor() {
		const messages = [];
		this.selection.selected.forEach(elem => {
			messages.push({
				// text: `${elem.nmflr} , Part of ${elem.blk.nmblk}`,
				// id: elem._id.toString(),
				// status: elem.nmflr
			});
		});
		this.layoutUtilsService.fetchElements(messages);
	}


	isAllSelected(): boolean {
		const numSelected = this.selection.selected.length;
		const numRows = this.depositResult.length;
		return numSelected === numRows;
	}

	masterToggle() {
		if (this.selection.selected.length === this.depositResult.length) {
			this.selection.clear();
		} else {
			this.depositResult.forEach(row => this.selection.select(row));
		}
	}

	deleteDeposit(_item: DepositModel) {
		// tslint:disable-next-line:variable-name
		const _title = 'Deposit Delete';
		// tslint:disable-next-line:variable-name
		const _description = 'Are you sure to permanently delete this deposit?';
		const _waitDesciption = 'Deposit is deleting...';
		const _deleteMessage = `Deposit has been deleted`;

		const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				return;
			}

			this.store.dispatch(new DepositDeleted({ id: _item._id }));
			this.layoutUtilsService.showActionNotification(_deleteMessage, MessageType.Delete);
		});
	}


	editDeposit(id) {
		this.router.navigate(['/deposit/edit', id], { relativeTo: this.activatedRoute });
	}
	ngOnDestroy() {
		this.subscriptions.forEach(sb => sb.unsubscribe());
	}

	export(){
		this.service.exportExcel();
		
	}

	openLarge(content) {
		this.modalService.open(content, {
			size: 'lg'
		});
	}

	selectFile(event) {
		if(event.target.files.length > 0) {
			const file = event.target.files[0];
			this.file = file;
		}
	}

	printDeposit(id) {
		console.log(this.pdfViewer)
		const API_DEPOSIT_URL = `${environment.baseAPI}/api/deposit`;
		var data_url = this.http.get(`${API_DEPOSIT_URL}/${id}`).subscribe((res) => {
				const dt: any = res;
				// var crtddt = moment(dt.data.receiveno);
				// 	.utc(false)
				// 	.format("MMYY");
				var crtddt = (dt.data.receiveno);
				this.download_name =
					crtddt 
			});
			
		var mediaType = "application/pdf";
		this.http.get(`${API_DEPOSIT_URL}/export/${id}`, {responseType: "arraybuffer",})
			.subscribe(
				(response) => {
					let blob = new Blob([response], { type: mediaType });
					var fileURL = URL.createObjectURL(blob);
					window.open(fileURL, '_blank');
					// var anchor = document.createElement("a");
					// anchor.download = this.download_name + ".pdf";
					// anchor.href = fileURL;
					// anchor.click();
					// window.open(fileURL, "_blank")
					// const src = fileURL;
					// this.pdfViewer.nativeElement.data = fileURL;
				},
				(e) => {
					console.error(e);
				}
			);
	}

	onSubmit(){
		const formData = new FormData();
		formData.append('file', this.file);

		this.http.post<any>(`${environment.baseAPI}/api/excel/deposit/import`, formData).subscribe(
			(res) => console.log(res),
			(err) => console.log(err)
		)
	}

	// basic modal

	open(content, id) {
		console.log(this.pdfViewer);
		this.modalService.open(content, {
			size: 'lg'
		});
		const API_DEPOSIT_URL = `${environment.baseAPI}/api/deposit`;
		var data_url = this.http
			.get(`${API_DEPOSIT_URL}/${id}`)
			.subscribe((res) => {
				const dt: any = res;
				// var crtddt = moment(dt.data.receiveno);
				// 	.utc(false)
				// 	.format("MMYY");
				var crtddt = (dt.data.receiveno);
				this.download_name =
					crtddt 
				console.log(dt.data);
			});
		var mediaType = "application/pdf";
		this.http.get(`${API_DEPOSIT_URL}/export/${id}`, {responseType: "arraybuffer",})
			.subscribe(
				(response) => {
					let blob = new Blob([response], { type: mediaType });
					console.log(blob);
					console.log(id);
					//console.log(response)
					var fileURL = URL.createObjectURL(blob) + ".pdf";
					//var anchor = document.createElement("a");
					//anchor.download = this.download_name + ".pdf";
					// anchor.href = fileURL;
					// anchor.click();''
					// const src = fileURL;
					this.pdfViewer.nativeElement.data = fileURL;
					console.log(this.pdfViewer.nativeElement)
					
				},
				(e) => {
					console.error(e);
				}
		);

    }
}
