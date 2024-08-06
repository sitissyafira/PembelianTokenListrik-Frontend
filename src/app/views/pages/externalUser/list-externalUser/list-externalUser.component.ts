import {Component, OnDestroy, OnInit, ViewChild, ElementRef, ChangeDetectorRef} from '@angular/core';
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
import {Store, select, createFeatureSelector} from '@ngrx/store';
import { AppState } from '../../../../core/reducers';

// Services
import { LayoutUtilsService, MessageType } from '../../../../core/_base/crud';
import {ExternalUserDataSource} from '../../../../core/externalUser/externalUser.datasource';
import {ExternalUserModel} from '../../../../core/externalUser/externalUser.model';
import {SubheaderService} from '../../../../core/_base/layout';
import {ExternalUserService} from '../../../../core/externalUser/externalUser.service';
import {ExternalUserDeleted, ExternalUserPageRequested} from "../../../../core/externalUser/externalUser.action";
import { environment } from '../../../../../environments/environment';
import { QueryExternalUserModel } from '../../../../core/externalUser/queryexternalUser.model';

@Component({
  selector: 'kt-list-externalUser',
  templateUrl: './list-externalUser.component.html',
  styleUrls: ['./list-externalUser.component.scss']
})
export class ListExternalUserComponent implements OnInit, OnDestroy {
	file;
	dataSource: ExternalUserDataSource;
	displayedColumns = [
		// 'cstrmrcd', 
	
	'pict', 'name', 'department', 'division', 'location', 'shift', 'phone', 'email', 'actions'];
	@ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
	@ViewChild('sort1', {static: true}) sort: MatSort;
	// Filter fields
	@ViewChild('searchInput', {static: true}) searchInput: ElementRef;
	lastQuery: QueryExternalUserModel;
	// Selection
	selection = new SelectionModel<ExternalUserModel>(true, []);
	externalUserResult: ExternalUserModel[] = [];
	data = localStorage.getItem("currentUser");
	dataUser = JSON.parse(this.data)
	role = this.dataUser.role

	loading : boolean = false
	// Subscriptions
	private subscriptions: Subscription[] = [];
	constructor(
		private activatedRoute: ActivatedRoute,
		private store: Store<AppState>,
		private router: Router,
		private service: ExternalUserService,
		private layoutUtilsService: LayoutUtilsService,
		private subheaderService: SubheaderService,
		private cdr: ChangeDetectorRef,
		private http: HttpClient,
		private modalService: NgbModal,
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
				this.loadExternalUserList();
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
				this.loadExternalUserList();
			})
		).subscribe();
		this.subscriptions.push(searchSubscription);

		// Set title to page breadCrumbs
		this.subheaderService.setTitle('External User');

		// Init DataSource
		this.dataSource = new ExternalUserDataSource(this.store);
		const entitiesSubscription = this.dataSource.entitySubject.pipe(
			skip(1),
			distinctUntilChanged()
		).subscribe(res => {
			this.externalUserResult = res;
		});
		this.subscriptions.push(entitiesSubscription);

		// First Load
		of(undefined).pipe(take(1), delay(1000)).subscribe(() => { // Remove this line, just loading imitation
			this.loadExternalUserList();
		});
		this.loadExternalUserList();
	}
	refresh() {
		this.loadExternalUserList();
	}
	filterConfiguration(): any {
		const filter: any = {};
		const searchText: string = this.searchInput.nativeElement.value;
		filter.name = `${searchText}`;
		return filter;
	}
	
	loadExternalUserList() {
		this.selection.clear();
		const queryParams = new QueryExternalUserModel(
			this.filterConfiguration(),
			this.sort.direction,
			this.sort.active,
			this.paginator.pageIndex+1,
			this.paginator.pageSize
		);
		this.store.dispatch(new ExternalUserPageRequested({ page: queryParams }));
		this.selection.clear();
	}
	deleteExternalUser(_item: ExternalUserModel) {
		// tslint:disable-next-line:variable-name
		const _title = 'ExternalUser Delete';
		// tslint:disable-next-line:variable-name
		const _description = 'Are you sure to permanently delete this externalUser?';
		const _waitDesciption = 'ExternalUser is deleting...';
		const _deleteMessage = `ExternalUser has been deleted`;

		const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				return;
			}

			this.store.dispatch(new ExternalUserDeleted({ id: _item._id }));
			this.ngOnInit();
			this.layoutUtilsService.showActionNotification(_deleteMessage, MessageType.Delete);
		});
	}
	
	isAllSelected(): boolean {
		const numSelected = this.selection.selected.length;
		const numRows = this.externalUserResult.length;
		return numSelected === numRows;
	}

	masterToggle() {
		if (this.selection.selected.length === this.externalUserResult.length) {
			this.selection.clear();
		} else {
			this.externalUserResult.forEach(row => this.selection.select(row));
		}
	}

	editExternalUsera(id) {
		this.router.navigate(['edit', id], { relativeTo: this.activatedRoute });
	}

	viewExternalUsera(id) {
		this.router.navigate(['view', id], { relativeTo: this.activatedRoute });
	}
	ngOnDestroy() {
		this.subscriptions.forEach(sb => sb.unsubscribe());
	}
	export(){
		this.loading = true
		this.service.exportExcel();
		this.loading = false
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

	onSubmit(){
		const formData = new FormData();
		formData.append('file', this.file);
		this.http.post<any>(`${environment.baseAPI}/api/excel/externalUser/import`, formData).subscribe(
			res =>{
				const message = `file successfully has been import.`;
	 			this.layoutUtilsService.showActionNotification(message, MessageType.Create, 5000, true, true);
				this.ngOnInit();
			},
			err => {
				console.error(err);
				const message = 'Error while importing File | ' + err.statusText;
				this.layoutUtilsService.showActionNotification(message, MessageType.Create, 5000, true, false);
				}
		)
	}
}
