
import { Component, OnInit, ElementRef, ViewChild, ChangeDetectionStrategy, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { SelectionModel } from '@angular/cdk/collections';
import { MatPaginator, MatSort, MatSnackBar } from '@angular/material';
import {NgbModal, ModalDismissReasons} from '@ng-bootstrap/ng-bootstrap';

import { debounceTime, distinctUntilChanged, tap, skip, take, delay } from 'rxjs/operators';
import { fromEvent, merge, Observable, of, Subscription } from 'rxjs';

import { Store, select } from '@ngrx/store';
import { AppState } from '../../../../core/reducers';
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
import { environment } from '../../../../../environments/environment';
const moment = _rollupMoment || _moment;


@Component({
  selector: 'kt-list-deposit',
  templateUrl: './list-deposit.component.html',
  styleUrls: ['./list-deposit.component.scss']
})
export class ListAllDepositComponent implements OnInit, OnDestroy {
	deposit : DepositModel
	file;
	dataSource: DepositDataSource;
	download_name: string;
	displayedColumns = ['prnt', 'depositno', 'unit','custname', 'pymnttype','depositInDate','dpstin', 'actions'];
	@ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
	@ViewChild('sort1', {static: true}) sort: MatSort;
	@ViewChild('searchInput', {static: true}) searchInput: ElementRef;
	@ViewChild("pdfViewer", { static: true }) pdfViewer: ElementRef;
	lastQuery: QueryDepositModel;
	selection = new SelectionModel<DepositModel>(true, []);
	depositResult: DepositModel[] = [];
	data = localStorage.getItem("currentUser");
	dataUser = JSON.parse(this.data)
	role = this.dataUser.role
	private subscriptions: Subscription[] = [];
	constructor(
		private activatedRoute: ActivatedRoute,
		private store: Store<AppState>,
		private router: Router,
		private service: DepositService,
		private layoutUtilsService: LayoutUtilsService,
		private subheaderService: SubheaderService,
		private http: HttpClient,
		private modalService: NgbModal
	) { }
	ngOnInit() {
		const sortSubscription = this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0));
		this.subscriptions.push(sortSubscription);
		const paginatorSubscriptions = merge(this.sort.sortChange, this.paginator.page).pipe(
			tap(() => {
				this.loadDepositList();
			})
		)
			.subscribe();
		this.subscriptions.push(paginatorSubscriptions);
		const searchSubscription = fromEvent(this.searchInput.nativeElement, 'keyup').pipe(

			debounceTime(150),
			distinctUntilChanged(),
			tap(() => {
				this.paginator.pageIndex = 0;
				this.loadDepositList();
			})
		).subscribe();
		this.subscriptions.push(searchSubscription);
		this.subheaderService.setTitle('Deposit');

		this.dataSource = new DepositDataSource(this.store);
		const entitiesSubscription = this.dataSource.entitySubject.pipe(
			skip(1),
			distinctUntilChanged()
		).subscribe(res => {
			this.depositResult = res;
		});
		this.subscriptions.push(entitiesSubscription);
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
	filterConfiguration(): any {
		const filter: any = {};
		const searchText: string = this.searchInput.nativeElement.value.toLowerCase();

		filter.unit2 = `${searchText}`;
		return filter;
	}

	deleteDeposit(_item: DepositModel) {
		const _title = 'Deposit Delete';
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
	viewDeposit(id) {
		this.router.navigate(['/deposit/view', id], { relativeTo: this.activatedRoute });
	}
	ngOnDestroy() {
		this.subscriptions.forEach(sb => sb.unsubscribe());
	}
	export(){
		this.service.exportExcel();

	}

	fetchFloor() {

	}

	printDeposit(id) {
		const API_DEPOSIT_URL = `${environment.baseAPI}/api/deposit`;
		if (id) {
			this.store.pipe(select(selectDepositById(id))).subscribe(res => {
				if (res) {
					this.deposit = res;
				}
			});
		}

		if (this.deposit.isactive == true){
				if (this.deposit.type == "Security Deposit"){
					var mediaType = "application/pdf";
					this.http
						.get(`${API_DEPOSIT_URL}/export/${id}`, {
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
				}else{
					var mediaType = "application/pdf";
					this.http
						.get(`${API_DEPOSIT_URL}/export/${id}`, {
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

						this.http
					.get(`${API_DEPOSIT_URL}/export2/${id}`, {
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
		}else{
				var mediaType = "application/pdf";
				this.http
					.get(`${API_DEPOSIT_URL}/exportout/${id}`, {
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

}
