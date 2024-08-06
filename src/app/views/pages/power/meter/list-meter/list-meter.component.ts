import {Component, OnInit, OnDestroy, ViewChild, ElementRef, ChangeDetectorRef} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SelectionModel } from '@angular/cdk/collections';
import { MatPaginator, MatSort, MatSnackBar } from '@angular/material';
import { debounceTime, distinctUntilChanged, tap, skip, take, delay } from 'rxjs/operators';
import { fromEvent, merge, Observable, of, Subscription } from 'rxjs';
import { Store, select } from '@ngrx/store';
import { AppState } from '../../../../../core/reducers';
import { LayoutUtilsService, MessageType, QueryParamsModel } from '../../../../../core/_base/crud';
import {PowerMeterDataSource} from "../../../../../core/power/meter/meter.datasource";
import {QueryPowerMeterModel} from "../../../../../core/power/meter/querymeter.model";
import {PowerMeterModel} from "../../../../../core/power/meter/meter.model";
import {SubheaderService} from "../../../../../core/_base/layout";
import {PowerMeterService} from "../../../../../core/power/meter/meter.service";
import {PowerMeterDeleted, PowerMeterPageRequested} from "../../../../../core/power/meter/meter.action";
import {HttpClient} from '@angular/common/http';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { environment } from '../../../../../../environments/environment';

@Component({
  selector: 'kt-list-meter',
  templateUrl: './list-meter.component.html',
  styleUrls: ['./list-meter.component.scss']
})
export class ListMeterComponent implements OnInit, OnDestroy {
	file;
	data = localStorage.getItem("currentUser");
	dataUser = JSON.parse(this.data)
	role = this.dataUser.role
	dataSource: PowerMeterDataSource;
	displayedColumns = ['select','nmmtr', 'unit', 'rate', 'ratePrice', 'actions'];
	@ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
	@ViewChild('sort1', {static: true}) sort: MatSort;
	// Filter fields
	@ViewChild('searchInput', {static: true}) searchInput: ElementRef;
	lastQuery: QueryPowerMeterModel;
	// Selection
	selection = new SelectionModel<PowerMeterModel>(true, []);
	powerMeterResult: PowerMeterModel[] = [];
	// Subscriptions
	private subscriptions: Subscription[] = [];
	constructor(
		private activatedRoute: ActivatedRoute,
		private store: Store<AppState>,
		private router: Router,
		private service: PowerMeterService,
		private layoutUtilsService: LayoutUtilsService,
		private subheaderService: SubheaderService,
		private cdr: ChangeDetectorRef,
		private http: HttpClient,
		private modalService: NgbModal,
	) { }
	ngOnInit() {
		const sortSubscription = this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0));
		this.subscriptions.push(sortSubscription);
		const paginatorSubscriptions = merge(this.sort.sortChange, this.paginator.page).pipe(
			tap(() => {
				this.loadPowerMeterList();
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
				this.loadPowerMeterList();
			})
		).subscribe();
		this.subscriptions.push(searchSubscription);

		// Set title to page breadCrumbs
		this.subheaderService.setTitle('Electricity Meter');

		// Init DataSource
		this.dataSource = new PowerMeterDataSource(this.store);
		const entitiesSubscription = this.dataSource.entitySubject.pipe(
			skip(1),
			distinctUntilChanged()
		).subscribe(res => {
			this.powerMeterResult = res;
		});
		this.subscriptions.push(entitiesSubscription);
		this.loadPowerMeterList();
	
	}
	filterConfiguration(): any {
		const filter: any = {};
		const searchText: string = this.searchInput.nativeElement.value.toLowerCase();
		filter.unit = `${searchText}`;
		return filter;
	}
	loadPowerMeterList() {
		this.selection.clear();
		const queryParams = new QueryPowerMeterModel(
			this.filterConfiguration(),
			this.sort.direction,
			this.sort.active,
			this.paginator.pageIndex+1,
			this.paginator.pageSize
		);
		this.store.dispatch(new PowerMeterPageRequested({ page: queryParams }));
		this.selection.clear();
	}

	deletePowerMeter(_item: PowerMeterModel) {
		// tslint:disable-next-line:variable-name
		const _title = 'Electricity Meter Delete';
		// tslint:disable-next-line:variable-name
		const _description = 'Are you sure to permanently delete this electricity meter?';
		const _waitDesciption = 'Electricity Meter is deleting...';
		const _deleteMessage = `Electricity Meter has been deleted`;

		const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				return;
			}

			this.store.dispatch(new PowerMeterDeleted({ id: _item._id }));
			this.layoutUtilsService.showActionNotification(_deleteMessage, MessageType.Delete);
			if (res){
				setTimeout(() => {
					this.loadPowerMeterList();
				}, 1000);
			}
		});
	}

	
	printPowerMeter() {
		const id = [];
		var mediaType = 'application/pdf';
		this.selection.selected.forEach(elem => {
			id.push(elem._id);
		});
		this.http.post(`${environment.baseAPI}/api/power/master/qrcode`, id, { responseType: 'arraybuffer' }).subscribe(
			(res) => {
				let blob = new Blob([res], { type: mediaType });
				var fileURL = URL.createObjectURL(blob);
				window.open(fileURL, "_blank")
			},
			(err) => console.log(err)
		);
	}

	
	isAllSelected(): boolean {
		const numSelected = this.selection.selected.length;
		const numRows = this.powerMeterResult.length;
		return numSelected === numRows;
	}

	masterToggle() {
		if (this.selection.selected.length === this.powerMeterResult.length) {
			this.selection.clear();
		} else {
			this.powerMeterResult.forEach(row => this.selection.select(row));
		}
	}
	editPowerMeter(id) {
		this.router.navigate(['edit', id], { relativeTo: this.activatedRoute });
	}

	viewPowerMeter(id) {
		this.router.navigate(['view', id], { relativeTo: this.activatedRoute });
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

	
	onSubmit(){
		const formData = new FormData();
		formData.append('file', this.file);

		this.http.post<any>(`${environment.baseAPI}/api/excel/powermas/import`, formData).subscribe(
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
