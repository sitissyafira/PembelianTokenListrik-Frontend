import { Component, OnDestroy, OnInit, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

// Material
import { SelectionModel } from '@angular/cdk/collections';
import { MatPaginator, MatSort, MatSnackBar } from '@angular/material';
// RXJS
import { debounceTime, distinctUntilChanged, tap, skip, take, delay } from 'rxjs/operators';
import { fromEvent, merge, Observable, of, Subscription } from 'rxjs';
// LODASH
import { each, find } from 'lodash';
// NGRX
import { Store, select, createFeatureSelector } from '@ngrx/store';
import { AppState } from '../../../../core/reducers';

// Services
import { LayoutUtilsService, MessageType } from '../../../../core/_base/crud';
import { QueryEngineerModel } from '../../../../core/engineer/queryengineer.model';
import { EngineerDataSource } from '../../../../core/engineer/engineer.datasource.js';
import { EngineerModel } from '../../../../core/engineer/engineer.model';
import { SubheaderService } from '../../../../core/_base/layout';
import { EngineerService } from '../../../../core/engineer/engineer.service';
import { EngineerDeleted, EngineerPageRequested } from "../../../../core/engineer/engineer.action";

@Component({
	selector: 'kt-list-engineer',
	templateUrl: './list-engineer.component.html',
	styleUrls: ['./list-engineer.component.scss']
})
export class ListEngineerComponent implements OnInit, OnDestroy {
	dataSource: EngineerDataSource;
	data = localStorage.getItem("currentUser");
	dataUser = JSON.parse(this.data)
	role = this.dataUser.role
	displayedColumns = ['pict', 'engnrid', 'name', 'engineerstatus', 'phone', 'email', 'actions'];
	@ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
	@ViewChild('sort1', { static: true }) sort: MatSort;
	// Filter fields
	@ViewChild('searchInput', { static: true }) searchInput: ElementRef;
	lastQuery: QueryEngineerModel;
	// Selection
	selection = new SelectionModel<EngineerModel>(true, []);
	engineerResult: EngineerModel[] = [];
	// Subscriptions
	private subscriptions: Subscription[] = [];
	constructor(
		private activatedRoute: ActivatedRoute,
		private store: Store<AppState>,
		private router: Router,
		private service: EngineerService,
		private layoutUtilsService: LayoutUtilsService,
		private subheaderService: SubheaderService,
		private cdr: ChangeDetectorRef
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
				this.loadEngineerList();
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
				this.loadEngineerList();
			})
		).subscribe();
		this.subscriptions.push(searchSubscription);

		// Set title to page breadCrumbs
		this.subheaderService.setTitle('Engineer');

		// Init DataSource
		this.dataSource = new EngineerDataSource(this.store);
		const entitiesSubscription = this.dataSource.entitySubject.pipe(
			skip(1),
			distinctUntilChanged()
		).subscribe(res => {
			this.engineerResult = res;
			console.log(res);

		});
		this.subscriptions.push(entitiesSubscription);

		// First Load
		of(undefined).pipe(take(1), delay(1000)).subscribe(() => { // Remove this line, just loading imitation
			this.loadEngineerList();
		});
		this.loadEngineerList();
	}
	filterConfiguration(): any {
		const filter: any = {};
		const searchText: string = this.searchInput.nativeElement.value.toLowerCase();

		filter.name = `${searchText}`;

		return filter;
	}
	loadEngineerList() {
		this.selection.clear();
		const queryParams = new QueryEngineerModel(
			this.filterConfiguration(),
			this.sort.direction,
			this.sort.active,
			this.paginator.pageIndex + 1,
			this.paginator.pageSize
		);
		this.store.dispatch(new EngineerPageRequested({ page: queryParams }));
		this.selection.clear();
	}
	deleteEngineer(_item: EngineerModel) {
		// tslint:disable-next-line:variable-name
		const _title = 'Engineer Delete';
		// tslint:disable-next-line:variable-name
		const _description = 'Are you sure to permanently delete this engineer ?';
		const _waitDesciption = 'Engineer is deleting...';
		const _deleteMessage = `Engineer  has been deleted`;
		const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				return;
			}

			this.store.dispatch(new EngineerDeleted({ id: _item._id }));
			this.layoutUtilsService.showActionNotification(_deleteMessage, MessageType.Delete);
		});
	}


	export() {
		this.service.exportExcel();
	}

	editEngineer(id) {
		this.router.navigate(['edit', id], { relativeTo: this.activatedRoute });
	}

	viewEngineer(id) {
		this.router.navigate(['view', id], { relativeTo: this.activatedRoute });
	}

	ngOnDestroy() {
		this.subscriptions.forEach(sb => sb.unsubscribe());
	}

}
