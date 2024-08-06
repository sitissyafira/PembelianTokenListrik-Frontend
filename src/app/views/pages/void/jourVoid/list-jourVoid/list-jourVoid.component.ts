import { Component, OnInit, ElementRef, ViewChild, ChangeDetectionStrategy, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { SelectionModel } from '@angular/cdk/collections';
import { MatPaginator, MatSort, MatSnackBar, MatDialog } from '@angular/material';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { debounceTime, distinctUntilChanged, tap, skip, take, delay } from 'rxjs/operators';
import { fromEvent, merge, Observable, of, Subscription } from 'rxjs';
import { Store, select } from '@ngrx/store';
import { AppState } from '../../../../../core/reducers';
import { LayoutUtilsService, MessageType, QueryParamsModel } from '../../../../../core/_base/crud';
import { JourVoidDeleted, JourVoidPageRequested } from '../../../../../core/void/jourVoid/jourVoid.action';
import { selectJourVoidById, } from '../../../../../core/void/jourVoid/jourVoid.selector';
import { SubheaderService } from '../../../../../core/_base/layout';

import { QueryJourVoidModel } from '../../../../../core/void/jourVoid/queryjourVoid.model';
import { JourVoidModel } from '../../../../../core/void/jourVoid/jourVoid.model';
import { JourVoidService } from '../../../../../core/void/jourVoid/jourVoid.service';
import { JourVoidDataSource } from '../../../../../core/void/jourVoid/jourVoid.datasource';
import * as _moment from "moment";
import { default as _rollupMoment, Moment } from "moment";
import { environment } from '../../../../../../environments/environment';
import { FormControl } from '@angular/forms';
import { QueryUnitModel } from '../../../../../core/unit/queryunit.model';
import { SavingDialog } from '../../../../partials/module/saving-confirm/confirmation.dialog.component';
import { VoidBillingView } from '../view-void/void.dialog.component';
const moment = _rollupMoment || _moment;


@Component({
	selector: 'kt-list-jourVoid',
	templateUrl: './list-jourVoid.component.html',
	styleUrls: ['./list-jourVoid.component.scss']
})
export class ListAllJourVoidComponent implements OnInit, OnDestroy {
	file;
	dataSource: JourVoidDataSource;
	download_name: string;

	// Column Table
	displayedColumns = ["billNo", "unit", "statusFeature", "billing_date", "delete_date", "updateBy", "reasonDel", "actions"];

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

	statusValue: string = ""
	statusValueFeature: string = ""
	filterStatusValue: string = ""

	filterByStatus: any[] = [
		{
			name: "Correction of payment data",
			value: "copd",
		},
		{
			name: "Improved meter data input",
			value: "imdi",
		},
		{
			name: " Set the transaction datei",
			value: "sttd",
		},
	]
	filterByStatusFeature: any[] = [
		{
			name: "Account Receive",
			value: "ar",
		},
		{
			name: "Account Payable",
			value: "ap",
		},
		{
			name: "Journal Memorial",
			value: "memo",
		},
		{
			name: "Journal Amortization",
			value: "amor",
		},
		{
			name: "Journal Set Off",
			value: "so",
		},
		{
			name: "Journal Write Off",
			value: "wo",
		},
		{
			name: "Journal Debit Note",
			value: "dn",
		},
	]

	// Import AR Card
	messageStatus: any = { success: '', failed: '' }
	loadCondition: boolean = false

	// Generate
	isGenerateARCard: boolean = false


	@ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
	@ViewChild('sort1', { static: true }) sort: MatSort;
	@ViewChild('searchInput', { static: true }) searchInput: ElementRef;
	@ViewChild("pdfViewer", { static: true }) pdfViewer: ElementRef;
	lastQuery: QueryJourVoidModel;
	selection = new SelectionModel<JourVoidModel>(true, []);
	jourVoidResult: JourVoidModel[] = [];
	jourVoid: JourVoidModel
	data = localStorage.getItem("currentUser");
	dataUser = JSON.parse(this.data)
	role = this.dataUser.role
	private subscriptions: Subscription[] = [];
	constructor(
		private activatedRoute: ActivatedRoute,
		private store: Store<AppState>,
		private router: Router,
		private service: JourVoidService,
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
				this.loadJourVoidList();
				this.loadDataNum(null)
			})
		)
			.subscribe();
		this.subscriptions.push(paginatorSubscriptions);

		// Set title to page breadCrumbs
		this.subheaderService.setTitle('Void Journal');

		// Init DataSource
		this.dataSource = new JourVoidDataSource(this.store);
		const entitiesSubscription = this.dataSource.entitySubject.pipe(
			skip(1),
			distinctUntilChanged()
		).subscribe(
			res => {
				this.jourVoidResult = res;
			},
			err => {
				alert('error');
			}
		);
		this.subscriptions.push(entitiesSubscription);

		// First Load
		this.loadJourVoidList();
		this.loadDataNum(null)
	}

	loadJourVoidList() {
		this.selection.clear();
		const queryParams = new QueryJourVoidModel(
			this.filterConfiguration(),
			this.paginator.pageIndex + 1,
			this.paginator.pageSize,
			this.sortOrder,
			this.sortField
		);
		this.store.dispatch(new JourVoidPageRequested({ page: queryParams }));
		this.selection.clear();
	}

	filterConfiguration(): any {
		const filter: any = {};

		filter.unit = this.selectedNoUnit.length ? this.selectedNoUnit : [];
		filter.startDate = this.date.start.val;
		filter.endDate = this.date.end.val;
		filter.statusValue = this.statusValue ? this.statusValue : "";
		filter.statusValueFeature = this.statusValueFeature ? this.statusValueFeature : "";

		return filter;
	}

	ngOnDestroy() {
		this.subscriptions.forEach(sb => sb.unsubscribe());
	}

	/**
	 * Load Data Unit
	 * @param text 
	 */
	async loadDataNum(text: string) {
		this.selection.clear();
		const queryParams = new QueryUnitModel(
			text,
			"asc",
			null,
			1,
			1000
		);

		this.service.getAllNum(queryParams).subscribe(
			res => {
				this.unitResult = res.data;
				this.cdr.markForCheck();
			}
		);
	}

	valueFilterStatus(e) {
		this.statusValue = e
		this.loadJourVoidList()
	}

	valueFilterStatusFeature(e) {
		this.statusValueFeature = e
		this.loadJourVoidList()
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
		this.loadDataNum(text)
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
			this.loadJourVoidList()
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
		const filter = this.filterConfiguration()
		this.service.exportExample(filter);
	}

	/**
	 * Submit Import AR Card
	 */
	onSubmit() {
		const formData = new FormData();
		const idUser = this.dataUser.id
		formData.append('file', this.file);
		this.loadCondition = false

		this.http.post<any>(`${environment.baseAPI}/api/jourVoid/import?idUser=${idUser}`, formData).subscribe(
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
		this.loadJourVoidList()
	}

	/**
	 * Refresh
	 */
	refresh() {
		this.loadJourVoidList()
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
		let validate = this.selectedUnit.find(data => data.voucherno === e.voucherno)
		if (validate) return
		this.selectedUnit.push(e)
		this.selectedNoUnit.push(e.voucherno)
		this.cdr.markForCheck()
	}

	/**
	 * delete matchip unit
	 * @param id 
	 */
	deleteList(id) {
		this.selectedUnit = this.selectedUnit.filter((i) => {
			if (i.voucherno != id) return i;
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

	/**
	* @param value 
	*/
	changeNameStatus(value) {
		// 1. Correction of payment data
		// 2. Improved meter data input
		// 3. Set the transaction date
		if (value === "copd") return "Correction of payment data"
		else if (value === "imdi") return "Improved meter data input"
		else if (value === "sttd") return "Set the transaction date"
	}

	/**
	* @param value 
	*/
	changeNameStatusFeature(value) {
		if (value === "ar") return "Account Receive"
		else if (value === "ap") return "Account Payable"
		else if (value === "so") return "Set Off"
		else if (value === "wo") return "Write Off"
		else if (value === "dn") return "Debit Note"
		else if (value === "amor") return "Amortization"
		else if (value === "memo") return "Memorial"
		else value
	}

	/**
	* @param value 
	*/
	classStatusValue(value) {
		// 1. Correction of payment data
		// 2. Improved meter data input
		// 3. Set the transaction date
		if (value === "copd") return "chip chip--success"
		else if (value === "imdi") return "chip chip--warning"
		else if (value === "sttd") return "chip chip--danger"
	}

	/** Void View Billing
* This is a popup for the progress of generating billing
*/
	JourVoidingViewPopUp(dataVoid) {
		this.dialog.open(VoidBillingView, {
			data: {
				dataVoid
			},
			maxWidth: "865px",
			minHeight: "625px",
			disableClose: true
		});
	}
}
