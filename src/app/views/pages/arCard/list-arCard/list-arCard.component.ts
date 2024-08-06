import { Component, OnInit, ElementRef, ViewChild, ChangeDetectionStrategy, OnDestroy, ChangeDetectorRef, Directive } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { SelectionModel } from '@angular/cdk/collections';
import { MatPaginator, MatSort, MatSnackBar, MatDialog, MAT_DATE_FORMATS } from '@angular/material';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { debounceTime, distinctUntilChanged, tap, skip, take, delay } from 'rxjs/operators';
import { fromEvent, merge, Observable, of, Subscription } from 'rxjs';
import { Store, select } from '@ngrx/store';
import { AppState } from '../../../../core/reducers';
import { LayoutUtilsService, MessageType, QueryParamsModel } from '../../../../core/_base/crud';
import { ArCardDeleted, ArCardPageRequested } from '../../../../core/arCard/arCard.action';
import { selectArCardById, } from '../../../../core/arCard/arCard.selector';
import { SubheaderService } from '../../../../core/_base/layout';

import { QueryArCardModel } from '../../../../core/arCard/queryarCard.model';
import { ArCardModel } from '../../../../core/arCard/arCard.model';
import { ArCardService } from '../../../../core/arCard/arCard.service';
import { ArCardDataSource } from '../../../../core/arCard/arCard.datasource';
import * as _moment from "moment";
import { default as _rollupMoment, Moment } from "moment";
import { environment } from '../../../../../environments/environment';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { QueryUnitModel } from '../../../../core/unit/queryunit.model';
import { SavingDialog } from '../../../partials/module/saving-confirm/confirmation.dialog.component';
const moment = _rollupMoment || _moment;
import * as FileSave from 'file-saver';


const PERIOD = {
	parse: {
		dateInput: "YYYY",
	},
	display: {
		dateInput: "YYYY",
		monthYearLabel: "YYYY",
		dateA11yLabel: "LL",
		monthYearA11yLabel: "YYYY",
	},
};


@Component({
	selector: 'kt-list-arCard',
	templateUrl: './list-arCard.component.html',
	styleUrls: ['./list-arCard.component.scss']
})
export class ListAllArCardComponent implements OnInit, OnDestroy {
	file;
	dataSource: ArCardDataSource;
	download_name: string;

	// Column Table
	displayedColumns = ["unit", "strt", "end", "bIssued", "bPaid", "blnce", "actions"];

	// Filterd
	sortField: string = "billing_number"
	sortOrder: string = "desc"

	// Variable Mat Chip Unit
	selectedUnit = [];
	selectedNoUnit = [];
	loadingData = {
		unit: false
	}
	unitResult: any[] = []

	// Filter Date
	startQuery: any = ""
	endQuery: any = ""

	date = {
		valid: false,
		filter: {
			control: new FormControl(),
			val: undefined,
		},
		start: {
			control: new FormControl(),
			val: undefined,
		},
		end: {
			control: new FormControl(),
			val: undefined,
		},
	};
	filterStatusValue: string = ""

	// Import AR Card
	messageStatus: any = { success: '', failed: '' }
	loadCondition: boolean = false

	// Generate
	isGenerateARCard: boolean = false

	queryYear: any
	selectedYear: any
	arCardDate: FormGroup;

	preview = {
		src: undefined,
		blobURL: "",
		status: false
	};


	@ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
	@ViewChild('sort1', { static: true }) sort: MatSort;
	@ViewChild('searchInput', { static: true }) searchInput: ElementRef;
	@ViewChild("pdfViewer", { static: true }) pdfViewer: ElementRef;
	lastQuery: QueryArCardModel;
	selection = new SelectionModel<ArCardModel>(true, []);
	arCardResult: ArCardModel[] = [];
	arCard: ArCardModel
	data = localStorage.getItem("currentUser");
	dataUser = JSON.parse(this.data)
	role = this.dataUser.role

	// Private param
	_subs: Subscription[] = [];

	private subscriptions: Subscription[] = [];
	constructor(
		private activatedRoute: ActivatedRoute,
		private store: Store<AppState>,
		private router: Router,
		private arCardDateFB: FormBuilder,
		private service: ArCardService,
		private layoutUtilsService: LayoutUtilsService,
		private subheaderService: SubheaderService,
		private http: HttpClient,
		private modalService: NgbModal,
		private cdr: ChangeDetectorRef,
		private dialog: MatDialog,
	) { }


	ngOnInit() {
		const sortSubscription = this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0));
		this.subscriptions.push(sortSubscription);
		const paginatorSubscriptions = merge(this.sort.sortChange, this.paginator.page).pipe(
			tap(() => {
				this.loadArCardList();
				this.loadDataUnit(null)
			})
		)
			.subscribe();
		this.subscriptions.push(paginatorSubscriptions);

		// Set title to page breadCrumbs
		this.subheaderService.setTitle('AR Card');

		// Init DataSource
		this.dataSource = new ArCardDataSource(this.store);
		const entitiesSubscription = this.dataSource.entitySubject.pipe(
			skip(1),
			distinctUntilChanged()
		).subscribe(
			res => {
				this.arCardResult = res;
			},
			err => {
				alert('error');
			}
		);
		this.subscriptions.push(entitiesSubscription);

		// First Load
		this.createForm()
		this.loadArCardList();
		this.loadDataUnit(null)
	}

	loadArCardList() {
		this.selection.clear();
		const queryParams = new QueryArCardModel(
			this.filterConfiguration(),
			this.paginator.pageIndex + 1,
			this.paginator.pageSize,
			this.sortOrder,
			this.sortField
		);
		this.store.dispatch(new ArCardPageRequested({ page: queryParams }));
		this.selection.clear();
	}

	filterConfiguration(): any {
		const filter: any = {};

		filter.unit = this.selectedNoUnit.length ? this.selectedNoUnit : [];
		filter.startDate = this.date.start.val;
		filter.endDate = this.date.end.val;

		return filter;
	}

	ngOnDestroy() {
		this.subscriptions.forEach(sb => sb.unsubscribe());
	}

	/**
	 * Load Data Unit
	 * @param text 
	 */
	async loadDataUnit(text: string) {
		this.selection.clear();
		const queryParams = new QueryUnitModel(
			text,
			"asc",
			null,
			1,
			1000
		);

		this.service.getAllUnit(queryParams).subscribe(
			res => {
				this.unitResult = res.data;
				this.cdr.markForCheck();
			}
		);
	}

	/**
	 * @param e 
	 */
	_onKeyupUnit(e: any) {
		this._filterUnitDataList(e.target.value);
	}

	/**
	 * @param text 
	 */
	_filterUnitDataList(text: string) {
		this.loadDataUnit(text)
	}

	/**
	 * Add Date
	 * @param type 
	 * @param e 
	 */
	addDate(type, e) {
		this.date[type].val = e.target.value;
		this.checkDateValidation();

		// Fetch list if date is filled
		if (this.date.valid) {
			this.startQuery = Date.parse(this.date.start.val)
			this.endQuery = Date.parse(this.date.end.val)
			this.loadArCardList()
		}
	}

	/**
	 * Check Date Validate
	 */
	checkDateValidation() {
		let dtStart = new Date(this.date.start.val), dtEnd = new Date(this.date.end.val)

		if (dtStart > dtEnd) {
			alert("start date cannot exceed end date")
			this.clearAllFilter()
			return
		}

		if (this.filterStatusValue !== "") this.date.valid = true;
		if (this.date.start.val && this.date.end.val) this.date.valid = true;
		else {
			this.date.valid = false;
		}
	}

	/**
	 * Pop Up Import
	 * @param content 
	 */
	openLarge(content) {
		this.modalService.open(content, {
			size: 'lg'
		});
	}

	/**
	 * Pop Up Export
	 * @param content 
	 */
	openLargeExport(content) {
		this.modalService.open(content, {
			size: 'lg'
		});
	}

	/**
	 * Select File Import
	 * @param event 
	 */
	selectFile(event) {
		if (event.target.files.length > 0) {
			const file = event.target.files[0];
			this.file = file;
		}
	}

	/**
	 * Export Sample Import
	 */
	exportExample() {
		this.service.exportExample();
	}
	/**
	 * Export Sample Import
	 */
	exportArCard() {
		this.processSavingExport()

		const subPre = this.service
			.exportArCard(this.queryYear)
			.subscribe(
				(resp) => {
					const blob = new Blob([resp], { type: "application/pdf" });
					const url = URL.createObjectURL(blob);

					// Save blob url
					this.preview.blobURL = url;

					// save excel
					FileSave.saveAs(`${url}`, "export-arcard-" + this.queryYear + ".xlsx");
					this.dialog.closeAll()
				},
				(error) => {
					// Show error notification
					this.layoutUtilsService.showActionNotification(
						`Preview document failed`,
						MessageType.Create,
						5000,
						true,
						false
					);
					this.dialog.closeAll()
				},
				() => {
					this.dialog.closeAll()
				}
			);
		this._subs.push(subPre);
	}

	/**
	 * Submit Import AR Card
	 */
	onSubmit() {
		const formData = new FormData();
		const idUser = this.dataUser.id
		formData.append('file', this.file);
		this.loadCondition = false

		this.http.post<any>(`${environment.baseAPI}/api/arCard/import?idUser=${idUser}`, formData).subscribe(
			res => {
				this.loadCondition = true
				const message = `file successfully has been import.`;
				this.messageStatus = {
					success: `Successful import: ${res.success} unit`,
					failed: `Failed import :  ${res.failed} unit`
				}
				this.layoutUtilsService.showActionNotification(message, MessageType.Create, 2000, true, true);
				this.ngOnInit();
			},
			err => {
				console.error(err);
				this.loadCondition = true
				const message = 'Error while importing File | ' + err.statusText;
				this.layoutUtilsService.showActionNotification(message, MessageType.Create, 2000, true, false);
			}
		)
	}

	/**
	 * Clear Filtering
	 */
	clearAllFilter() {
		this.date.valid = false;
		this.date.start.val = undefined;
		this.date.start.control.setValue(undefined);
		this.date.end.val = undefined;
		this.date.end.control.setValue(undefined);
		this.date.filter.control.setValue(undefined);
		this.filterStatusValue = ""
		this.loadArCardList()
	}

	/**
	 * Refresh
	 */
	refresh() {
		this.loadArCardList()
		this.date.start.control.setValue(undefined)
		this.date.end.control.setValue(undefined)
		this.searchInput.nativeElement.value = "";
	}


	/**
	 * onKeyupunit Unit
	 * @param e 
	 */
	_onKeyupunit(e: any) {
		this._filterUnitList(e.target.value);
	}

	/**
	 * filterUnitList filter unit
	 * @param text 
	 */
	_filterUnitList(text: string) {
		this.loadUnit(text)
		this.cdr.markForCheck()
	}

	/**
	 * onSelect Data Unit
	 * @param e 
	 * @returns 
	 */
	onSelect(e) {
		let validate = this.selectedUnit.find(data => data._id === e._id)
		if (validate) return
		this.selectedUnit.push(e)
		this.selectedNoUnit.push(e._id)
		this.cdr.markForCheck()
	}

	/**
	 * delete matchip unit
	 * @param id 
	 */
	deleteList(id) {
		this.selectedUnit = this.selectedUnit.filter((i) => {
			if (i._id != id) return i;
		});
		this.selectedNoUnit = this.selectedNoUnit.filter((i) => i != id)
	}

	/**
	 * Load Unit Filter handle Back-end
	 * @param text 
	 */
	loadUnit(text) {
		this.selection.clear();
	}

	/**
* Load  Process Saving.
*/
	processSaving(content) {
		const dialogRef = this.dialog.open(
			content,
			{
				data: {
					isGenerateBilling: "",
					msgErrorGenerate: ""
				},
				maxWidth: "565px",
				minHeight: "375px",
				disableClose: true
			}
		);
	}
	/**
* Load  Process Saving.
*/
	processSavingGenerate() {
		const dialogRef = this.dialog.open(
			SavingDialog,
			{
				data: {
					isGenerateBilling: "",
					msgErrorGenerate: ""
				},
				maxWidth: "565px",
				minHeight: "375px",
				disableClose: true
			}
		);
	}

	/**
	 * Close The Pop Up
	 */
	closePopUp() {
		this.dialog.closeAll()
	}

	createForm() {
		this.arCardDate = this.arCardDateFB.group({
			periodYear: [{ value: "", disabled: false }],

		});
	}


	/**
	 *chosenYearHandler
	 * @param normlizedMonth 
	 * @param datepicker 
	 */
	chosenYearHandler(normlizedMonth, datepicker) {
		const controls = this.arCardDate.controls
		var tempDate = JSON.stringify(normlizedMonth).replace("\"", '').split("-")
		var month = parseInt(tempDate[1])
		var year = month == 12 ? parseInt(tempDate[0]) + 1 : parseInt(tempDate[0])
		var year = month == 12 ? parseInt(tempDate[0]) + 1 : parseInt(tempDate[0])

		month = month == 12 ? 1 : month + 1;
		this.queryYear = year
		this.selectedYear = new Date(year + "-" + month)
		controls.periodYear.setValue(this.selectedYear)
		datepicker.close();
	}

	/**
 * Load AR Process Saving.
 */
	processSavingExport() {
		const dialogRef = this.dialog.open(
			SavingDialog,
			{
				data: {
					isGenerateBilling: "",
					msgErrorGenerate: ""
				},
				maxWidth: "565px",
				minHeight: "375px",
				disableClose: true
			}
		);
	}

	/**
	 * Generate ARCard
	 */
	generateARCard() {
		this.processSavingGenerate()
		this.service.generateARCard().subscribe(
			res => {
				this.dialog.closeAll()
				const message = `generate successfully, check data.`;
				this.layoutUtilsService.showActionNotification(message, MessageType.Create, 2000, true, true);
			},
			err => {
				this.dialog.closeAll()
				console.error(err);
				const message = 'Error while importing File | ' + err.statusText;
				this.layoutUtilsService.showActionNotification(message, MessageType.Create, 2000, true, false);
			}
		)
	}
}

@Directive({
	selector: '[periodYear]',
	providers: [
		{ provide: MAT_DATE_FORMATS, useValue: PERIOD },
	],
})
export class CustomDateFormat1 { }


