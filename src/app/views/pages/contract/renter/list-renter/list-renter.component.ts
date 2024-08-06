import { AfterViewInit, AfterViewChecked } from '@angular/core';
// Angular
import { Component, OnInit, ElementRef, ViewChild, ChangeDetectionStrategy, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SelectionModel } from '@angular/cdk/collections';
import { MatPaginator, MatSort, MatSnackBar } from '@angular/material';
import { debounceTime, distinctUntilChanged, tap, skip, take, delay } from 'rxjs/operators';
import { fromEvent, merge, Observable, of, Subscription } from 'rxjs';
import { Store } from '@ngrx/store';
import { AppState } from '../../../../../core/reducers';
import { LayoutUtilsService, MessageType } from '../../../../../core/_base/crud';
import { RenterContractModel } from '../../../../../core/contract/renter/renter.model';
import { RenterContractDataSource } from '../../../../../core/contract/renter/renter.datasource';
import { RenterContractDeleted, RenterContractPageRequested } from '../../../../../core/contract/renter/renter.action';
import { SubheaderService } from '../../../../../core/_base/layout';
import { QueryrenterModel } from '../../../../../core/contract/renter/queryrenter.model';
import { CustomerModel } from '../../../../../core/customer/customer.model';
import { RenterContractService } from '../../../../../core/contract/renter/renter.service';
import { HttpClient } from '@angular/common/http';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { environment } from '../../../../../../environments/environment';


@Component({
	selector: 'kt-list-renter',
	templateUrl: './list-renter.component.html',
	styleUrls: ['./list-renter.component.scss']
})
export class ListRenterComponent implements OnInit, OnDestroy {
	name: string= ""
	title: string = ""
	file;
	dataSource: RenterContractDataSource;
	displayedColumns = ['print', 'contract_number', 'customername', 'unit', 'contract_date', 'expiry_date', 'actions'];
	@ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
	@ViewChild('sort1', { static: true }) sort: MatSort;
	@ViewChild('searchInput', { static: true }) searchInput: ElementRef;
	lastQuery: QueryrenterModel;
	selection = new SelectionModel<RenterContractModel>(true, []);
	renterResult: RenterContractModel[] = [];
	data = localStorage.getItem("currentUser");
	dataUser = JSON.parse(this.data)
	role = this.dataUser.role
	private subscriptions: Subscription[] = [];
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
		private store: Store<AppState>,
		private router: Router,
		private service: RenterContractService,
		private layoutUtilsService: LayoutUtilsService,
		private subheaderService: SubheaderService,
		private cdr: ChangeDetectorRef,
		private http: HttpClient,
		private modalService: NgbModal,
	) { }

	ngOnInit() {
		const sortSubscription = this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0));
		this.subscriptions.push(sortSubscription);
		this.activatedRoute.data.subscribe( data => {
			this.name = data.name
			this.title = data.title
		})
		const paginatorSubscriptions = merge(this.sort.sortChange, this.paginator.page).pipe(
			tap(() => {
				this.loadList()
			})
		).subscribe();
		this.subscriptions.push(paginatorSubscriptions);

			console.log(this.searchInput.nativeElement)
		const searchSubscription = fromEvent(this.searchInput.nativeElement, 'keyup').pipe(

			debounceTime(150),
			distinctUntilChanged(),
			tap(() => {
				this.paginator.pageIndex = 0;
				this.loadList()
			})
		).subscribe();
		this.subscriptions.push(searchSubscription);
		this.subheaderService.setTitle(this.title);
		this.dataSource = new RenterContractDataSource(this.store);
		const entitiesSubscription = this.dataSource.entitySubject.pipe(
			skip(1),
			distinctUntilChanged()
		).subscribe(res => {
			this.renterResult = res;
		});
		this.subscriptions.push(entitiesSubscription);
		this.loadList()
	}

	ngOnDestroy() {
		this.subscriptions.forEach(sb => sb.unsubscribe());
	}
	loadList() {
		this.selection.clear();
		const queryParams = new QueryrenterModel(
			this.filterConfiguration(),
			this.sort.direction,
			this.sort.active,
			this.paginator.pageIndex + 1,
			this.paginator.pageSize
		);
		this.store.dispatch(new RenterContractPageRequested({ page: queryParams }));
		this.selection.clear();
	}

	/** FILTRATION */
	filterConfiguration(): any {
		const filter: any = {};
		const searchText: string = this.searchInput.nativeElement.value.toLowerCase();

		filter.unit2 = `${searchText}`;
		return filter;
	}

	deleteRenter(_item: RenterContractModel) {
		const _title = 'Check In Check Out Delete';
		const _description = 'Are you sure to permanently delete this tenant contract?';
		const _waitDesciption = 'Tenant contract is deleting...';
		const _deleteMessage = `Tenant contract has been deleted`;

		const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				return;
			}

			this.store.dispatch(new RenterContractDeleted({ id: _item._id }));
			this.layoutUtilsService.showActionNotification(_deleteMessage, MessageType.Delete);
		});
	}


	masterToggle() {
		if (this.selection.selected.length === this.renterResult.length) {
			this.selection.clear();
		} else {
			this.renterResult.forEach(row => this.selection.select(row));
		}
	}

	editRenter(id) {
		this.router.navigate(['edit', id], { relativeTo: this.activatedRoute });
	}
	viewRenter(id) {
		this.router.navigate(['view', id], { relativeTo: this.activatedRoute });
	}

	export() {
		this.service.exportExcel({name:this.name});
	}

	printOwn(id) {
		const API_DEPOSIT_URL = `${environment.baseAPI}/api/contract/renter`;

		var mediaType = "application/pdf";
		this.http
			.get(`${API_DEPOSIT_URL}/getlease/${id}`, {
				responseType: "arraybuffer",
			})
			.subscribe(
				(response) => {
					let blob = new Blob([response], { type: mediaType });
					var fileURL = URL.createObjectURL(blob);
					window.open(fileURL, '_blank');
				},
				(e) => {
					console.error(e);
				}
			);
	}
}
