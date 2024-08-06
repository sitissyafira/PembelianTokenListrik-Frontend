import { Component, OnInit, ElementRef, ViewChild, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SelectionModel } from '@angular/cdk/collections';
import { MatPaginator, MatSort,} from '@angular/material';
import { debounceTime, distinctUntilChanged, tap, skip, } from 'rxjs/operators';
import { fromEvent, merge,Subscription } from 'rxjs';
import { Store,} from '@ngrx/store';
import { AppState } from '../../../../../core/reducers';
import { LayoutUtilsService, MessageType, QueryParamsModel } from '../../../../../core/_base/crud';
import { HttpClient } from '@angular/common/http';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { SubheaderService } from '../../../../../core/_base/layout';
import { CheckpointModel } from '../../../../../core/masterData/checkpoint/checkpoint.model';
import { CheckpointPageRequested } from '../../../../../core/masterData/checkpoint/checkpoint.action';
import { CheckpointDataSource } from '../../../../../core/masterData/checkpoint/checkpoint.datasource';
import { CheckpointService } from '../../../../../core/masterData/checkpoint/checkpoint.service';
import { QueryCheckpointModel } from '../../../../../core/masterData/checkpoint/querycheckpoint.model';
import { environment } from '../../../../../../environments/environment';


@Component({
	selector: 'kt-list-checkpoint',
	templateUrl: './list-checkpoint.component.html',
	styleUrls: ['./list-checkpoint.component.scss']
})

export class ListCheckpointComponent implements OnInit, OnDestroy {
	data = localStorage.getItem("currentUser");
	dataUser = JSON.parse(this.data)
	dataID = this.dataUser.roleId
	file;
	dataSource: CheckpointDataSource;
	displayedColumns = [
	'select',
	'code',
	'name',
	'tower',
	'floor',
	'lastActivity',
	'actions'];
	@ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
	@ViewChild('sort1', { static: true }) sort: MatSort;
	@ViewChild('searchInput', { static: true }) searchInput: ElementRef;
	lastQuery: QueryParamsModel;
	selection = new SelectionModel<CheckpointModel>(true, []);
	checkpointResult: CheckpointModel[] = [];
	private subscriptions: Subscription[] = [];
	constructor(
		private activatedRoute: ActivatedRoute,
		private store: Store<AppState>,
		private router: Router,
		private service: CheckpointService,
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
				this.loadCheckpointList();
			})
		)
		.subscribe();
		this.subscriptions.push(paginatorSubscriptions);
		const searchSubscription = fromEvent(this.searchInput.nativeElement, 'keyup').pipe(
			debounceTime(500), 
			distinctUntilChanged(),
			tap(() => {
				this.paginator.pageIndex = 0;
				this.loadCheckpointList();
			})
		).subscribe();
		this.subscriptions.push(searchSubscription);
		this.subheaderService.setTitle('Checkpoint');
		this.dataSource = new CheckpointDataSource(this.store);
		const entitiesSubscription = this.dataSource.entitySubject.pipe(
			skip(1),
			distinctUntilChanged()
		).subscribe(
			res => {
			this.checkpointResult = res;
			}, 
			err => {
			alert('error');		
		}
		);
		this.subscriptions.push(entitiesSubscription);
		this.loadCheckpointList();
	}

	filterConfiguration(): any {
		const search: string = this.searchInput.nativeElement.value.toLowerCase();
		return search;
	}

	loadCheckpointList() {
		this.selection.clear();
		const queryParams = new QueryCheckpointModel(
			this.filterConfiguration(),
			this.paginator.pageIndex + 1,
			this.paginator.pageSize
		);
		this.store.dispatch(new CheckpointPageRequested({ page: queryParams }));
		this.selection.clear();
		this.cdr.markForCheck();
	}

	deleteCheckpoint(_item: CheckpointModel) {
		const _title = 'Checkpoint Delete';
		const _description = 'Are you sure to permanently delete this checkpoint?';
		const _waitDesciption = 'Checkpoint is deleting...';
		const _deleteMessage = `Checkpoint has been deleted`;
		const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				return;
			}
			const deleteFlag = this.service.deleteFlagCheckpoint(_item).subscribe()
			this.subscriptions.push(deleteFlag);
			this.layoutUtilsService.showActionNotification(_deleteMessage, MessageType.Delete);
			this.loadCheckpointList();
		});
	}

	editCheckpoint(id) {
		this.router.navigate(['edit', id], { relativeTo: this.activatedRoute });
	}
	ngOnDestroy() {
		this.subscriptions.forEach(sb => sb.unsubscribe());
	}
	export() {
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
		formData.append('created_by', this.dataID)
		
		this.http.post<any>(`${environment.baseAPI}/api/checkpoint/upload/xlsx`, formData).subscribe(
			res =>{
				const message = res.msg;
	 			this.layoutUtilsService.showActionNotification(message, MessageType.Create, 2000, true, true);
				this.file = undefined;
				if (message){
					this.ngOnInit();
				}
			},
			err => {
				console.error(err);
				const message = 'Error while importing File | ' + err.error.message;
				this.layoutUtilsService.showActionNotification(message, MessageType.Create, 2000, true, false);
				}
		)
	}
	masterToggle() {
		if (this.selection.selected.length === this.checkpointResult.length) {
			this.selection.clear();
		} else {
			this.checkpointResult.forEach(row => this.selection.select(row));
		}
	}
	isAllSelected(): boolean {
		const numSelected = this.selection.selected.length;
		const numRows = this.checkpointResult.length;
		return numSelected === numRows;
	}

	printCheckpointQR() {
		const id = [];
		var mediaType = 'application/pdf';
		this.selection.selected.forEach(elem => {
			id.push(elem._id);
		});
		this.http.post(`${environment.baseAPI}/api/checkpoint/qrcode`, id, { responseType: 'arraybuffer' }).subscribe(
			(res) => {
				let blob = new Blob([res], { type: mediaType });
				var fileURL = URL.createObjectURL(blob);
				window.open(fileURL, "_blank")
			},
			(err) => console.log(err)
		);
	}

}
