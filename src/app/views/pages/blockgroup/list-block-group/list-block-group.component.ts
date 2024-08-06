import { AfterViewInit, AfterViewChecked } from '@angular/core';
// Angular
import { Component, OnInit, ElementRef, ViewChild, ChangeDetectionStrategy, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
// Material
import { SelectionModel } from '@angular/cdk/collections';
import { MatPaginator, MatSort, MatSnackBar } from '@angular/material';
// RXJS
import { debounceTime, distinctUntilChanged, tap, skip, take, delay } from 'rxjs/operators';
import { fromEvent, merge, Observable, of, Subscription } from 'rxjs';
// LODASH
import { each, find } from 'lodash';
// NGRX
import { Store, select } from '@ngrx/store';
import { AppState } from '../../../../core/reducers';

// Services
import {LayoutUtilsService, MessageType, QueryParamsModel, QueryResultsModel} from '../../../../core/_base/crud';

import { BlockgroupModel} from '../../../../core/blockgroup/blockgroup.model';
import { BlockGroupDataSource} from '../../../../core/blockgroup/blockgroup.datasource';
import { BlockGroupDeleted, BlockGroupPageRequested} from '../../../../core/blockgroup/blockgroup.action';
import { selectBlockGroupById, } from '../../../../core/blockgroup/blockgroup.selector';
import { SubheaderService } from '../../../../core/_base/layout';
import {selectUserById} from '../../../../core/auth';
import {BlockGroupService} from '../../../../core/blockgroup/blockgroup.service';
import {NgbModal, ModalDismissReasons} from '@ng-bootstrap/ng-bootstrap';
import {MatTableDataSource} from '@angular/material';
import { environment } from '../../../../../environments/environment';


@Component({
  selector: 'kt-list-block-group',
  templateUrl: './list-block-group.component.html',
  styleUrls: ['./list-block-group.component.scss']
})
export class ListBlockGroupComponent implements OnInit, OnDestroy {
	file;
	// Table fields
	dataSource: BlockGroupDataSource;
	// dataSource: MatTableDataSource<BlockGroupDataSource>;
	displayedColumns = [ 'grpnm'];
	@ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
	@ViewChild('sort1', {static: true}) sort: MatSort;
	// Filter fields
	@ViewChild('searchInput', {static: true}) searchInput: ElementRef;
	lastQuery: QueryParamsModel;
	// Selection
	selection = new SelectionModel<BlockgroupModel>(true, []);
	blockGroupResult: BlockgroupModel[] = [];
	blkGrpRes: BlockgroupModel;
	prntNm: {prnt: string} = {prnt: ""};

	// Subscriptions
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
		private layoutUtilsService: LayoutUtilsService,
		private subheaderService: SubheaderService,
		private serviceBlkGrp: BlockGroupService,
		private modalService: NgbModal,
		private http: HttpClient,
		private cdr: ChangeDetectorRef) {}

	/**
	 * @ Lifecycle sequences => https://angular.io/guide/lifecycle-hooks
	 */

	/**
	 * On init
	 */

	ngOnInit() {
		// If the user changes the sort order, reset back to the first page.
		const sortSubscription = this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0));
		this.subscriptions.push(sortSubscription);

		/* Data load will be triggered in two cases:
		- when a pagination event occurs => this.paginator.page
		- when a sort event occurs => this.sort.sortChange
		**/
		const paginatorSubscriptions = merge(this.sort.sortChange, this.paginator.page).pipe(
			tap(() => {
				this.loadBlockGroupList();
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
				this.loadBlockGroupList();
			})
		).subscribe();
		this.subscriptions.push(searchSubscription);

		// Set title to page breadCrumbs
		this.subheaderService.setTitle('Project');

		// Init DataSource
		this.dataSource = new BlockGroupDataSource(this.store);
		const entitiesSubscription = this.dataSource.entitySubject.pipe(
			skip(1),
			distinctUntilChanged()
		).subscribe(res => {
			this.blockGroupResult = res;
		});
		this.subscriptions.push(entitiesSubscription);

		// First Load
		of(undefined).pipe(take(1), delay(1000)).subscribe(() => { // Remove this line, just loading imitation
			this.loadBlockGroupList();
		});
		this.loadBlockGroupList();
	}
	ngOnDestroy(){

	}

	loadBlockGroupList() {
		console.log(this.paginator.pageSize);
		this.selection.clear();
		const queryParams = new QueryParamsModel(
			this.filterConfiguration(),
			this.sort.direction,
			this.sort.active,
			this.paginator.pageIndex+1,
			this.paginator.pageSize
		);
		this.store.dispatch(new BlockGroupPageRequested({ page: queryParams }));
		this.selection.clear();
	}

	getParentBlockGroup(id: string){
		this.store.pipe(select(selectBlockGroupById(id))).subscribe(res => {
			if (res) {
				this.prntNm.prnt = res.grpnm;
			}else{
				return "none"
			}
		});
	}

	prntBlkGrp(id: string){
		this.prntNm.prnt = "";
		this.getParentBlockGroup(id);
		return this.prntNm.prnt;
	}

	/** FILTRATION */
	filterConfiguration(): any {
		const filter: any = {};
		const searchText: string = this.searchInput.nativeElement.value;

		filter.grpnm = searchText;

		return filter;
	}

	deleteBlockGroup(_item: BlockgroupModel) {
		// tslint:disable-next-line:variable-name
		const _title = 'Project Delete';
		// tslint:disable-next-line:variable-name
		const _description = 'Are you sure to permanently delete this project?';
		const _waitDesciption = 'Project is deleting...';
		const _deleteMessage = `Project has been deleted`;

		const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				return;
			}

			this.store.dispatch(new BlockGroupDeleted({ id: _item._id }));
			this.layoutUtilsService.showActionNotification(_deleteMessage, MessageType.Delete);
		});
	}

	fetchBlockGroup() {
		const messages = [];
		this.selection.selected.forEach(elem => {
			messages.push({
				text: `${elem.grpnm} , ${elem.crtdate}`,
				id: elem._id.toString(),
				status: elem.grpnm
			});
		});
		this.layoutUtilsService.fetchElements(messages);
	}

	isAllSelected(): boolean {
		const numSelected = this.selection.selected.length;
		const numRows = this.blockGroupResult.length;
		return numSelected === numRows;
	}

	masterToggle() {
		if (this.selection.selected.length === this.blockGroupResult.length) {
			this.selection.clear();
		} else {
			this.blockGroupResult.forEach(row => this.selection.select(row));
		}
	}

	editBlockGroup(id) {
		this.router.navigate(['edit', id], { relativeTo: this.activatedRoute });
	}

	export(){
		this.serviceBlkGrp.exportExcel();
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

		this.http.post<any>(`${environment.baseAPI}/api/excel/project/import`, formData).subscribe(
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
