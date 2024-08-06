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
import { DepartmentModel } from '../../../../../core/masterData/department/department.model';
import { DepartmentPageRequested } from '../../../../../core/masterData/department/department.action';
import { DepartmentDataSource } from '../../../../../core/masterData/department/department.datasource';
import { DepartmentService } from '../../../../../core/masterData/department/department.service';
import { QueryDepartmentModel } from '../../../../../core/masterData/department/querydepartment.model';
import { environment } from '../../../../../../environments/environment';


@Component({
	selector: 'kt-list-department',
	templateUrl: './list-department.component.html',
	styleUrls: ['./list-department.component.scss']
})

export class ListDepartmentComponent implements OnInit, OnDestroy {
	data = localStorage.getItem("currentUser");
	dataUser = JSON.parse(this.data)
	dataID = this.dataUser.roleId
	file;
	dataSource: DepartmentDataSource;
	displayedColumns = [
	'department_id',
	'department_name',
	'actions'];
	@ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
	@ViewChild('sort1', { static: true }) sort: MatSort;
	@ViewChild('searchInput', { static: true }) searchInput: ElementRef;
	lastQuery: QueryParamsModel;
	selection = new SelectionModel<DepartmentModel>(true, []);
	departmentResult: DepartmentModel[] = [];
	private subscriptions: Subscription[] = [];
	constructor(
		private activatedRoute: ActivatedRoute,
		private store: Store<AppState>,
		private router: Router,
		private service: DepartmentService,
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
				this.loadDepartmentList();
			})
		)
		.subscribe();
		this.subscriptions.push(paginatorSubscriptions);
		const searchSubscription = fromEvent(this.searchInput.nativeElement, 'keyup').pipe(
			debounceTime(500), 
			distinctUntilChanged(),
			tap(() => {
				this.paginator.pageIndex = 0;
				this.loadDepartmentList();
			})
		).subscribe();
		this.subscriptions.push(searchSubscription);
		this.subheaderService.setTitle('Department');
		this.dataSource = new DepartmentDataSource(this.store);
		const entitiesSubscription = this.dataSource.entitySubject.pipe(
			skip(1),
			distinctUntilChanged()
		).subscribe(
			res => {
			this.departmentResult = res;
			}, 
			err => {
			alert('error');		
		}
		);
		this.subscriptions.push(entitiesSubscription);
		this.loadDepartmentList();
	}

	filterConfiguration(): any {
		const search: string = this.searchInput.nativeElement.value.toLowerCase();
		return search;
	}

	loadDepartmentList() {
		this.selection.clear();
		const queryParams = new QueryDepartmentModel(
			this.filterConfiguration(),
			this.paginator.pageIndex + 1,
			this.paginator.pageSize
		);
		this.store.dispatch(new DepartmentPageRequested({ page: queryParams }));
		this.selection.clear();
		this.cdr.markForCheck();
	}

	deleteDepartment(_item: DepartmentModel) {
		const _title = 'Department Delete';
		const _description = 'Are you sure to permanently delete this department?';
		const _waitDesciption = 'Department is deleting...';
		const _deleteMessage = `Department has been deleted`;
		const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				return;
			}
			const deleteFlag = this.service.deleteFlagDepartment(_item).subscribe()
			this.subscriptions.push(deleteFlag);
			this.layoutUtilsService.showActionNotification(_deleteMessage, MessageType.Delete);
			this.loadDepartmentList();
		});
	}

	editDepartment(id) {
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
		
		this.http.post<any>(`${environment.baseAPI}/api/department/upload/xlsx`, formData).subscribe(
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


}
