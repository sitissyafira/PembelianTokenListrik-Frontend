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
import { SurveyTemplateModel } from '../../../../../core/masterData/surveyTemplate/surveyTemplate.model';
import { SurveyTemplatePageRequested } from '../../../../../core/masterData/surveyTemplate/surveyTemplate.action';
import { SurveyTemplateDataSource } from '../../../../../core/masterData/surveyTemplate/surveyTemplate.datasource';
import { SurveyTemplateService } from '../../../../../core/masterData/surveyTemplate/surveyTemplate.service';
import { QuerySurveyTemplateModel } from '../../../../../core/masterData/surveyTemplate/querysurveyTemplate.model';
import { environment } from '../../../../../../environments/environment';


@Component({
	selector: 'kt-list-surveyTemplate',
	templateUrl: './list-surveyTemplate.component.html',
	styleUrls: ['./list-surveyTemplate.component.scss']
})

export class ListSurveyTemplateComponent implements OnInit, OnDestroy {
	data = localStorage.getItem("currentUser");
	dataUser = JSON.parse(this.data)
	dataID = this.dataUser.roleId
	file;
	dataSource: SurveyTemplateDataSource;
	displayedColumns = [
	'name',
	'checkpoint',
	'actions'];
	@ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
	@ViewChild('sort1', { static: true }) sort: MatSort;
	@ViewChild('searchInput', { static: true }) searchInput: ElementRef;
	lastQuery: QueryParamsModel;
	selection = new SelectionModel<SurveyTemplateModel>(true, []);
	surveyTemplateResult: SurveyTemplateModel[] = [];
	private subscriptions: Subscription[] = [];
	constructor(
		private activatedRoute: ActivatedRoute,
		private store: Store<AppState>,
		private router: Router,
		private service: SurveyTemplateService,
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
				this.loadSurveyTemplateList();
			})
		)
		.subscribe();
		this.subscriptions.push(paginatorSubscriptions);
		const searchSubscription = fromEvent(this.searchInput.nativeElement, 'keyup').pipe(
			debounceTime(500), 
			distinctUntilChanged(),
			tap(() => {
				this.paginator.pageIndex = 0;
				this.loadSurveyTemplateList();
			})
		).subscribe();
		this.subscriptions.push(searchSubscription);
		this.subheaderService.setTitle('SurveyTemplate');
		this.dataSource = new SurveyTemplateDataSource(this.store);
		const entitiesSubscription = this.dataSource.entitySubject.pipe(
			skip(1),
			distinctUntilChanged()
		).subscribe(
			res => {
			this.surveyTemplateResult = res;
			}, 
			err => {
			alert('error');		
		}
		);
		this.subscriptions.push(entitiesSubscription);
		this.loadSurveyTemplateList();
	}

	filterConfiguration(): any {
		const search: string = this.searchInput.nativeElement.value.toLowerCase();
		return search;
	}

	loadSurveyTemplateList() {
		this.selection.clear();
		const queryParams = new QuerySurveyTemplateModel(
			this.filterConfiguration(),
			this.paginator.pageIndex + 1,
			this.paginator.pageSize
		);
		this.store.dispatch(new SurveyTemplatePageRequested({ page: queryParams }));
		this.selection.clear();
		this.cdr.markForCheck();
	}

	deleteSurveyTemplate(_item: SurveyTemplateModel) {
		const _title = 'SurveyTemplate Delete';
		const _description = 'Are you sure to permanently delete this surveyTemplate?';
		const _waitDesciption = 'SurveyTemplate is deleting...';
		const _deleteMessage = `SurveyTemplate has been deleted`;
		const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				return;
			}
			const deleteFlag = this.service.deleteFlagSurveyTemplate(_item).subscribe()
			this.subscriptions.push(deleteFlag);
			this.layoutUtilsService.showActionNotification(_deleteMessage, MessageType.Delete);
			this.loadSurveyTemplateList();
		});
	}

	editSurveyTemplate(id) {
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
		
		this.http.post<any>(`${environment.baseAPI}/api/surveyTemplate/upload/xlsx`, formData).subscribe(
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
		if (this.selection.selected.length === this.surveyTemplateResult.length) {
			this.selection.clear();
		} else {
			this.surveyTemplateResult.forEach(row => this.selection.select(row));
		}
	}
	isAllSelected(): boolean {
		const numSelected = this.selection.selected.length;
		const numRows = this.surveyTemplateResult.length;
		return numSelected === numRows;
	}

	printSurveyTemplateQR() {
		const id = [];
		var mediaType = 'application/pdf';
		this.selection.selected.forEach(elem => {
			id.push(elem._id);
		});
		this.http.post(`${environment.baseAPI}/api/surveyTemplate/qrcode`, id, { responseType: 'arraybuffer' }).subscribe(
			(res) => {
				let blob = new Blob([res], { type: mediaType });
				var fileURL = URL.createObjectURL(blob);
				window.open(fileURL, "_blank")
			},
			(err) => console.log(err)
		);
	}

}
