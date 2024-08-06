import { Component, OnInit, ElementRef, ViewChild, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SelectionModel } from '@angular/cdk/collections';
import { MatPaginator, MatSort,} from '@angular/material';
import { debounceTime, distinctUntilChanged, tap, skip, } from 'rxjs/operators';
import { fromEvent, merge,Subscription } from 'rxjs';
import { Store,} from '@ngrx/store';
import { AppState } from '../../../../../../core/reducers';
import { LayoutUtilsService, MessageType, QueryParamsModel } from '../../../../../../core/_base/crud';
import { HttpClient } from '@angular/common/http';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { SubheaderService } from '../../../../../../core/_base/layout';
import { ComWaterModel } from '../../../../../../core/commersil/master/comWater/comWater.model';
import { ComWaterPageRequested } from '../../../../../../core/commersil/master/comWater/comWater.action';
import { ComWaterDataSource } from '../../../../../../core/commersil/master/comWater/comWater.datasource';
import { ComWaterService } from '../../../../../../core/commersil/master/comWater/comWater.service';
import { QueryComWaterModel } from '../../../../../../core/commersil/master/comWater/querycomWater.model';
import { environment } from '../../../../../../../environments/environment';

@Component({
	selector: 'kt-list-comWater',
	templateUrl: './list-comWater.component.html',
	styleUrls: ['./list-comWater.component.scss']
})

export class ListComWaterComponent implements OnInit, OnDestroy {
	title = "Water Meter Commercial";
	file;
	dataSource: ComWaterDataSource;
	displayedColumns = [
	'select',
	'nmmtr',
	'unitCode',
	'rate',
	'actions'];
	@ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
	@ViewChild('sort1', { static: true }) sort: MatSort;
	@ViewChild('searchInput', { static: true }) searchInput: ElementRef;
	lastQuery: QueryParamsModel;
	selection = new SelectionModel<ComWaterModel>(true, []);
	comWaterResult: ComWaterModel[] = [];
	private subscriptions: Subscription[] = [];
	constructor(
		private activatedRoute: ActivatedRoute,
		private store: Store<AppState>,
		private router: Router,
		private service: ComWaterService,
		private layoutUtilsService: LayoutUtilsService,
		private subheaderService: SubheaderService,
		private cdr: ChangeDetectorRef,
		private http: HttpClient,
		private modalService: NgbModal
	) { }

	ngOnInit() {
		const sortSubscription = this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0));
		this.subscriptions.push(sortSubscription);
		const paginatorSubscriptions = merge(this.sort.sortChange, this.paginator.page).pipe(
			tap(() => {
				this.loadComWaterList();
			})
		)
		.subscribe();
		this.subscriptions.push(paginatorSubscriptions);
		const searchSubscription = fromEvent(this.searchInput.nativeElement, 'keyup').pipe(
			debounceTime(500), 
			distinctUntilChanged(),
			tap(() => {
				this.paginator.pageIndex = 0;
				this.loadComWaterList();
			})
		).subscribe();
		this.subscriptions.push(searchSubscription);
		this.subheaderService.setTitle(this.title);
		this.dataSource = new ComWaterDataSource(this.store);
		const entitiesSubscription = this.dataSource.entitySubject.pipe(
			skip(1),
			distinctUntilChanged()
		).subscribe(
			res => {
			this.comWaterResult = res;
			}, 
			err => {
			alert('error');		
		}
		);
		this.subscriptions.push(entitiesSubscription);
		this.loadComWaterList();
	}

	filterConfiguration(): any {
		const search: string = this.searchInput.nativeElement.value.toLowerCase();
		return search;
	}

	loadComWaterList() {
		this.selection.clear();
		const queryParams = new QueryComWaterModel(
			this.filterConfiguration(),
			this.paginator.pageIndex + 1,
			this.paginator.pageSize
		);
		this.store.dispatch(new ComWaterPageRequested({ page: queryParams }));
		this.selection.clear();
	}

	deleteComWater(_item: ComWaterModel) {
		let data = this.title
		
		const _title = data + ' ' + 'Delete';
		const _description = 'Are you sure to permanently delete this' + ' ' + data + ' ? ';
		const _waitDesciption = data + ' ' + 'is deleting...';
		const _deleteMessage = data + ' ' + 'has been deleted';

		const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				return;
			}
			const deleteFlag = this.service.deleteFlagComWater(_item).subscribe()
			this.subscriptions.push(deleteFlag);
			this.layoutUtilsService.showActionNotification(_deleteMessage, MessageType.Delete);
			this.loadComWaterList();
		});
	}

	editComWater(id) {
		this.router.navigate(['edit', id], { relativeTo: this.activatedRoute });
	}
	viewComWater(id) {
		this.router.navigate(['view', id], { relativeTo: this.activatedRoute });
	}
	ngOnDestroy() {
		this.subscriptions.forEach(sb => sb.unsubscribe());
	}
	
	export() {
		this.service.exportExcel();
	}


	
	isAllSelected(): boolean {
		const numSelected = this.selection.selected.length;
		const numRows = this.comWaterResult.length;
		return numSelected === numRows;
	}

	masterToggle() {
		if (this.selection.selected.length === this.comWaterResult.length) {
			this.selection.clear();
		} else {
			this.comWaterResult.forEach(row => this.selection.select(row));
		}
	}

	printPowerMeter() {
		const id = [];

		console.log(id);
		var mediaType = 'application/pdf';
		this.selection.selected.forEach(elem => {
			id.push(elem._id);
		});
		this.http.post(`${environment.baseAPI}/api/commersil/mwater/qrcode`, id, { responseType: 'arraybuffer' }).subscribe(
			(res) => {
				let blob = new Blob([res], { type: mediaType });
				var fileURL = URL.createObjectURL(blob);
				window.open(fileURL, "_blank")
			},
			(err) => console.log(err)
		);
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

		this.http.post<any>(`${environment.baseAPI}/api/commersil/mwater/excel/import`, formData).subscribe(
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
