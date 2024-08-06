import {Component, OnInit, OnDestroy, ViewChild, ElementRef, ChangeDetectorRef} from '@angular/core';
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
import { Store, select } from '@ngrx/store';
import { AppState } from '../../../../../core/reducers';

// Services
import { LayoutUtilsService, MessageType, QueryParamsModel } from '../../../../../core/_base/crud';
import {WaterMeterDataSource} from "../../../../../core/water/meter/meter.datasource";
import {QueryWaterMeterModel} from "../../../../../core/water/meter/querymeter.model";
import {WaterMeterModel} from "../../../../../core/water/meter/meter.model";
import {SubheaderService} from "../../../../../core/_base/layout";
import {WaterMeterService} from "../../../../../core/water/meter/meter.service";
import {WaterMeterDeleted, WaterMeterPageRequested} from "../../../../../core/water/meter/meter.action";
import {HttpClient} from '@angular/common/http';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { environment } from '../../../../../../environments/environment';

@Component({
  selector: 'kt-list-meter',
  templateUrl: './list-meter.component.html',
  styleUrls: ['./list-meter.component.scss']
})
export class ListMeterComponent implements OnInit, OnDestroy {
	file
	dataSource: WaterMeterDataSource;
	displayedColumns = ['select', 'nmmtr','unt','rte', 'rteprice', 'actions'];
	@ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
	@ViewChild('sort1', {static: true}) sort: MatSort;
	// Filter fields
	@ViewChild('searchInput', {static: true}) searchInput: ElementRef;
	lastQuery: QueryWaterMeterModel;
	// Selection
	data = localStorage.getItem("currentUser");
	dataUser = JSON.parse(this.data)
	role = this.dataUser.role
	selection = new SelectionModel<WaterMeterModel>(true, []);
	waterMeterResult: WaterMeterModel[] = [];
	// Subscriptions
	private subscriptions: Subscription[] = [];
	constructor(
		private activatedRoute: ActivatedRoute,
		private store: Store<AppState>,
		private router: Router,
		private service: WaterMeterService,
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
				this.loadWaterMeterList();
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
				this.loadWaterMeterList();
			})
		).subscribe();
		this.subscriptions.push(searchSubscription);

		// Set title to page breadCrumbs
		this.subheaderService.setTitle('Water Meter');

		// Init DataSource
		this.dataSource = new WaterMeterDataSource(this.store);
		const entitiesSubscription = this.dataSource.entitySubject.pipe(
			skip(1),
			distinctUntilChanged()
		).subscribe(res => {
			this.waterMeterResult = res;
		});
		this.subscriptions.push(entitiesSubscription);

		// First Load
		of(undefined).pipe(take(1), delay(1000)).subscribe(() => { // Remove this line, just loading imitation
			this.loadWaterMeterList();
		});
		this.loadWaterMeterList();
	}
	filterConfiguration(): any {
		const filter: any = {};
		const searchText: string = this.searchInput.nativeElement.value.toLowerCase();

		filter.unit =  `${searchText}`;
		return filter;
	}
	loadWaterMeterList() {
		this.selection.clear();
		const queryParams = new QueryWaterMeterModel(
			this.filterConfiguration(),
			this.sort.direction,
			this.sort.active,
			this.paginator.pageIndex+1,
			this.paginator.pageSize
		);
		this.store.dispatch(new WaterMeterPageRequested({ page: queryParams }));
		this.selection.clear();
	}
	deleteWaterMeter(_item: WaterMeterModel) {
		// tslint:disable-next-line:variable-name
		const _title = 'Water Meter Delete';
		// tslint:disable-next-line:variable-name
		const _description = 'Are you sure to permanently delete this water meter?';
		const _waitDesciption = 'Water Meter is deleting...';
		const _deleteMessage = `Water Meter has been deleted`;

		const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				return;
			}

			this.store.dispatch(new WaterMeterDeleted({ id: _item._id }));
			this.layoutUtilsService.showActionNotification(_deleteMessage, MessageType.Delete);
			if (res){
				setTimeout(() => {
					this.loadWaterMeterList();
				}, 1000);
			}
		});
	}
	fetchWaterMeter() {
		const messages = [];
		this.selection.selected.forEach(elem => {
			messages.push({
				text: `${elem.nmmtr} , Rate: Rp. ${elem.rte.rte}, Unit: ${elem.unt.nmunt}`,
				id: elem._id.toString(),
				status: elem.nmmtr
			});
		});
		this.layoutUtilsService.fetchElements(messages);
	}
	isAllSelected(): boolean {
		const numSelected = this.selection.selected.length;
		const numRows = this.waterMeterResult.length;
		return numSelected === numRows;
	}

	masterToggle() {
		if (this.selection.selected.length === this.waterMeterResult.length) {
			this.selection.clear();
		} else {
			this.waterMeterResult.forEach(row => this.selection.select(row));
		}
	}
	editWaterMeter(id) {
		this.router.navigate(['edit', id], { relativeTo: this.activatedRoute });
	}

	viewWaterMeter(id) {
		this.router.navigate(['view', id], { relativeTo: this.activatedRoute });
	}

	printWaterMeter() {
		const id = [];
		var mediaType = 'application/pdf';
		this.selection.selected.forEach(elem => {
			id.push(elem._id);
		});
		this.http.post(`${environment.baseAPI}/api/water/master/qrcode`, id, { responseType: 'arraybuffer' }).subscribe(
			(res) => {
				let blob = new Blob([res], { type: mediaType });
				var fileURL = URL.createObjectURL(blob);
				window.open(fileURL, "_blank")
			},
			(err) => console.log(err)
		);
	}
	
	ngOnDestroy() { }


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

	
	onSubmit(){
		const formData = new FormData();
		formData.append('file', this.file);

		this.http.post<any>(`${environment.baseAPI}/api/excel/watermas/import`, formData).subscribe(
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
