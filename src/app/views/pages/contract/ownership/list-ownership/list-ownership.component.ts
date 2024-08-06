import { Component, OnInit, ElementRef, ViewChild, ChangeDetectionStrategy, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SelectionModel } from '@angular/cdk/collections';
import { MatPaginator, MatSort } from '@angular/material';
import { debounceTime, distinctUntilChanged, tap, skip, take, delay } from 'rxjs/operators';
import { fromEvent, merge, Observable, of, Subscription } from 'rxjs';
import { Store, select } from '@ngrx/store';
import { AppState } from '../../../../../core/reducers';
import { LayoutUtilsService, MessageType, QueryParamsModel } from '../../../../../core/_base/crud';
import { OwnershipContractModel } from '../../../../../core/contract/ownership/ownership.model';
import { OwnershipContractDataSource } from '../../../../../core/contract/ownership/ownership.datasource';
import { OwnershipContractDeleted, OwnershipContractPageRequested } from '../../../../../core/contract/ownership/ownership.action';
import { SubheaderService } from '../../../../../core/_base/layout';
import { OwnershipContractService } from '../../../../../core/contract/ownership/ownership.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { HttpClient } from '@angular/common/http';
import { QueryOwnerTransactionModel } from '../../../../../core/contract/ownership/queryowner.model';
import { environment } from '../../../../../../environments/environment';
import moment from 'moment';
import { TemplateOwnerContract } from '../../../../../core/templatePDF/owner-contract.service';


import * as pdfMake from "pdfmake/build/pdfmake";
import * as pdfFonts from "pdfmake/build/vfs_fonts";

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
	selector: 'kt-list-ownership',
	templateUrl: './list-ownership.component.html',
	styleUrls: ['./list-ownership.component.scss']
})
export class ListOwnershipComponent implements OnInit, OnDestroy {
	file;
	dataSource: OwnershipContractDataSource;
	displayedColumns = ['print', 'contract_number', 'customername', 'unit', 'contract_date', 'expiry_date', 'actions'];
	@ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
	@ViewChild('sort1', { static: true }) sort: MatSort;
	@ViewChild('searchInput', { static: true }) searchInput: ElementRef;
	lastQuery: QueryOwnerTransactionModel;
	selection = new SelectionModel<OwnershipContractModel>(true, []);
	ownershipResult: OwnershipContractModel[] = [];
	data = localStorage.getItem("currentUser");
	dataUser = JSON.parse(this.data)
	role = this.dataUser.role


	private subscriptions: Subscription[] = [];

	/**
	 *
	 * @param activatedRoute
	 * @param store
	 * @param router
	 * @param layoutUtilsService
	 * @param subheaderService
	 */
	constructor(
		private activatedRoute: ActivatedRoute,
		private templateOwnerContract: TemplateOwnerContract,
		private store: Store<AppState>,
		private router: Router,
		private service: OwnershipContractService,
		private layoutUtilsService: LayoutUtilsService,
		private subheaderService: SubheaderService,
		private cdr: ChangeDetectorRef,
		private modalService: NgbModal,
		private http: HttpClient,

	) { }

	ngOnInit() {
		const sortSubscription = this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0));
		this.subscriptions.push(sortSubscription);
		const paginatorSubscriptions = merge(this.sort.sortChange, this.paginator.page).pipe(
			tap(() => {
				this.loadOwnershipList();
			})
		).subscribe();
		this.subscriptions.push(paginatorSubscriptions);

		const searchSubscription = fromEvent(this.searchInput.nativeElement, 'keyup').pipe(
			debounceTime(150),
			distinctUntilChanged(),
			tap(() => {
				this.paginator.pageIndex = 0;
				this.loadOwnershipList();
			})
		).subscribe();
		this.subscriptions.push(searchSubscription);
		this.subheaderService.setTitle('Ownership Contract');
		this.dataSource = new OwnershipContractDataSource(this.store);
		const entitiesSubscription = this.dataSource.entitySubject.pipe(
			skip(1),
			distinctUntilChanged()
		).subscribe(res => {
			this.ownershipResult = res;
		});
		this.subscriptions.push(entitiesSubscription);
		of(undefined).pipe(take(1), delay(1000)).subscribe(() => {
			this.loadOwnershipList();
		});
		this.loadOwnershipList();
	}

	ngOnDestroy() {
		this.subscriptions.forEach(sb => sb.unsubscribe());
	}

	loadOwnershipList() {
		this.selection.clear();
		const queryParams = new QueryOwnerTransactionModel(
			this.filterConfiguration(),
			this.sort.direction,
			this.sort.active,
			this.paginator.pageIndex + 1,
			this.paginator.pageSize
		);
		this.store.dispatch(new OwnershipContractPageRequested({ page: queryParams }));
		this.selection.clear();
	}

	filterConfiguration(): any {
		const filter: any = {};
		const searchText: number = this.searchInput.nativeElement.value.toLowerCase();

		filter.unit2 = `${searchText}`;
		return filter;
	}

	deleteOwnership(_item: OwnershipContractModel) {
		const _title = 'Ownership Contract Delete';
		const _description = 'Are you sure to permanently delete this ownership contract?';
		const _waitDesciption = 'Ownership contract is deleting...';
		const _deleteMessage = `Ownership contract has been deleted`;

		const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				return;
			}

			this.store.dispatch(new OwnershipContractDeleted({ id: _item._id }));
			this.ngOnInit()
			this.layoutUtilsService.showActionNotification(_deleteMessage, MessageType.Delete);
		});
	}

	fetchOwnership() {
		const messages = [];
		this.selection.selected.forEach(elem => {
			messages.push({
				text: `${elem.contract_number} , ${elem.contract_date}`,
				id: elem._id.toString(),
				status: elem.contract_number
			});
		});
		this.layoutUtilsService.fetchElements(messages);
	}

	isAllSelected(): boolean {
		const numSelected = this.selection.selected.length;
		const numRows = this.ownershipResult.length;
		return numSelected === numRows;
	}

	masterToggle() {
		if (this.selection.selected.length === this.ownershipResult.length) {
			this.selection.clear();
		} else {
			this.ownershipResult.forEach(row => this.selection.select(row));
		}
	}

	editOwnership(id) {
		this.router.navigate(['edit', id], { relativeTo: this.activatedRoute });
	}

	viewOwnership(id) {
		this.router.navigate(['view', id], { relativeTo: this.activatedRoute });
	}

	openLarge(content) {
		this.modalService.open(content, {
			size: 'lg'
		});
	}

	selectFile(event) {
		if (event.target.files.length > 0) {
			const file = event.target.files[0];
			this.file = file;
		}
	}

	exportExample() {
		this.service.exportExample();
	}

	onSubmit() {
		const formData = new FormData();
		formData.append('file', this.file);

		this.http.post<any>(`${environment.baseAPI}/api/excel/contract/import`, formData).subscribe(
			res => {
				const message = `file successfully has been import.`;
				this.layoutUtilsService.showActionNotification(message, MessageType.Create, 2000, true, true);
				this.ngOnInit();
			},
			err => {
				console.error(err);
				const message = 'Error while importing File | ' + err.statusText;
				this.layoutUtilsService.showActionNotification(message, MessageType.Create, 2000, true, false);
			}
		)
	}



	export() {
		this.service.exportExcel();
	}

	// Function to generate pdf template by calling generatePDF API
	printOwn(id) {
		const API_TEMPLATE_CONTRACT = `${environment.baseAPI}/api/contract/ownership`
		this.http.get(`${API_TEMPLATE_CONTRACT}/generatePDF/${id}`).subscribe(
			(resp: any) => {
				if (resp.data.contract.contract_date) { // Checks if there is a contract date, it will run the pdf download
					const label = `BAST-${resp.data.unit.unitName}`; // ex : BAST-unitcode
					const result = this.templateOwnerContract.generatePDFTemplate(resp.data) // Call variabel template in cores templatePDF
					pdfMake.createPdf(result).download(`${label}.pdf`);

				} else { // If there is no contract raises an alert
					const message = `BAST does not have a contract date!`;
					this.layoutUtilsService.showActionNotification(message, MessageType.Create, 2000, true, true);
				}
			},
			(err) => {
				// Push failed file name
				console.error(err); // Log error
			}
		);
	}
}
