// Angular
import { Component, OnInit, ElementRef, ViewChild, ChangeDetectionStrategy, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SelectionModel } from '@angular/cdk/collections';
import { MatPaginator, MatSort } from '@angular/material';
import { debounceTime, distinctUntilChanged, tap, skip } from 'rxjs/operators';
import { fromEvent, merge, Subscription } from 'rxjs';
import { Store } from '@ngrx/store';
import { AppState } from '../../../../core/reducers';
import { LayoutUtilsService, MessageType, QueryParamsModel } from '../../../../core/_base/crud';

import { billingNotifModel } from '../../../../core/billingNotif/billingNotif.model';
import { billingNotifDeleted, billingNotifPageRequested } from '../../../../core/billingNotif/billingNotif.action';
import { billingNotifDataSource } from '../../../../core/billingNotif/billingNotif.datasource';
import { SubheaderService } from '../../../../core/_base/layout';
import { billingNotifService } from '../../../../core/billingNotif/billingNotif.service';
import { HttpClient } from '@angular/common/http';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { QuerybillingNotifModel } from '../../../../core/billingNotif/queryag.model';
import { FormControl } from '@angular/forms';
import { UnitService } from '../../../../core/unit/unit.service';
import { QueryUnitModel} from '../../../../core/unit/queryunit.model'
// import { ConfirmationDialog } from "../../../../partials/module/saving-confirm/confirmation.dialog.component";
import { MatDialog } from '@angular/material';
import { ConfirmationDialog } from "../../../partials/module/confirmation-popup/confirmation.dialog.component";
import { environment } from '../../../../../environments/environment';

@Component({
	selector: 'kt-list-billingNotif',
	templateUrl: './list-billingNotif.component.html',
	styleUrls: ['./list-billingNotif.component.scss']
})
export class ListbillingNotifComponent implements OnInit, OnDestroy {
	file;
	dataSource: billingNotifDataSource;
	// displayedColumns = ['noId',"type_notif",'title','created_date','number_of_unit','number_of_sent',,'status', 'actions'];
	displayedColumns = ['noId',"type_notif",'title','created_date','number_of_unit','number_of_sent','status', 'actions'];

	@ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
	@ViewChild('sort1', { static: true }) sort: MatSort;
	@ViewChild("searchInput", { static: true }) searchInput: ElementRef;
	lastQuery: QueryParamsModel;
	// Selection
	selection = new SelectionModel<billingNotifModel>(true, []);
	billingNotifResult: billingNotifModel[] = [];
	selectedType
	typeNotifOptions = [
		{viewValue:undefined,value:undefined},
		{viewValue:"Denda",value:"denda"},
		{viewValue:"Tagihan", value:"tagihan"},
		{viewValue:"Khusus", value:"khusus"}

	]
	viewUnit = new FormControl()
	unit:string = ""
	viewIsActive = new FormControl()
	unitListResultFiltered: any = []
	sortField: string = "noId";
	sortOrder: string = "desc";
	data = localStorage.getItem("currentUser");
	dataUser = JSON.parse(this.data);
	role = this.dataUser.role;

	// Subscriptions
	private subscriptions: Subscription[] = [];
	constructor(
		private activatedRoute: ActivatedRoute,
		private store: Store<AppState>,
		private router: Router,
		private service: billingNotifService,
		private layoutUtilsService: LayoutUtilsService,
		private subheaderService: SubheaderService,
		private cdr: ChangeDetectorRef,
		private http: HttpClient,
		private modalService: NgbModal,
		private unitService: UnitService,
		private dialog: MatDialog,
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
				this.loadbillingNotifList();
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
					this.loadbillingNotifList()
				})
			)
			.subscribe();
		this.subscriptions.push(searchSubscription);

		// this.loadUnitList("")

		// Set title to page breadCrumbs
		this.subheaderService.setTitle('Billing Notification');

		// Init DataSource
		this.dataSource = new billingNotifDataSource(this.store);
		const entitiesSubscription = this.dataSource.entitySubject.pipe(
			skip(1),
			distinctUntilChanged()
		).subscribe(
			res => {
				this.billingNotifResult = res;
			},
			err => {
				alert('yah err')
			}
		);
		this.subscriptions.push(entitiesSubscription);

		// First Load
		this.loadbillingNotifList();
	}

	loadbillingNotifList() {
		
		this.selection.clear();
		let queryParams = new QuerybillingNotifModel(
			null,
			this.sortOrder,
			this.sortField,
			this.paginator.pageIndex + 1,
			this.paginator.pageSize
		);
		if(this.selectedType != ''){
			queryParams.type_notif = this.selectedType
		}
		const searchText: string = this.searchInput.nativeElement.value.toLowerCase();
		if(searchText.length > 0){
			queryParams.noId = searchText
		}

		
		this.store.dispatch(new billingNotifPageRequested({ page: queryParams }));
		this.selection.clear();
	}

	editbillingNotif(id) {
		this.router.navigate(['edit', id], { relativeTo: this.activatedRoute });
	}
	viewbillingNotif(id) {
		this.router.navigate(['view', id], { relativeTo: this.activatedRoute });
	}
	deletebillingNotif(id){
		const dialogRef = this.dialog.open(
			ConfirmationDialog,
			{
				data: {
					event: 'confirmation',
					title: "Delete",
					subTitle: "Are you sure to permanently delete this billing notification?"
				},
				width: '300px',
				disableClose: true
			}
		);
		dialogRef.afterClosed().subscribe((result) => {
			if (result == true) {
				let _deleteMessage = "Billing Notification has been Deleted"
				this.store.dispatch(new billingNotifDeleted({ id: id }))
				this.layoutUtilsService.showActionNotification(
					_deleteMessage,
					MessageType.Delete
			);
			} else {
				return;
			}
		});
		
		
	}
	ngOnDestroy() {
		this.subscriptions.forEach(sb => sb.unsubscribe());
	}


	export(){
		this.service.exportExcel();
	}

	refresh(){
		this.loadbillingNotifList()
		this.cdr.markForCheck()
	}
	_getStatus(status: string) {

		if (status == "terkirim"){
			return "chip chip--success"
		}
		if (status == "gagal") {
			return "chip chip--failed"
		}
	}
	onChangeStatus(){
		this.loadbillingNotifList()
	}
	_onKeyup(event){
		if(event.target.value.length > 0){
			this.loadUnitList(event.target.value)
		}else{
			this.unit = ""
			this.loadbillingNotifList()
		}
		
	}

	loadUnitList(text) {
		this.selection.clear();
		let filter = {
			cdunt:text
		}
		const queryParams = new QueryUnitModel(
			filter,
			null,
			null,
			1,
			10
		);
		this.unitService.getListUnit(queryParams).subscribe(
			res => {
				this.unitListResultFiltered = res.data
				this.cdr.markForCheck();
			});
		
		this.selection.clear();
	}
	_setUnitValue(item){
		this.unit = item._id
		this.loadbillingNotifList()
	}
	announceSortChange(sortState) {
		this.sortField = sortState.active
		this.sortOrder = sortState.direction
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
	onSubmit() {
		const formData = new FormData();
		formData.append('file', this.file);

		this.http.post<any>(`${environment.baseAPI}/api/excel/billingNotif/import`, formData).subscribe(
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
}
