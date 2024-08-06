import { HttpClient } from "@angular/common/http";
import {
	Component,
	OnInit,
	ElementRef,
	ViewChild,
	OnDestroy,
	ChangeDetectorRef,
} from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { SelectionModel } from "@angular/cdk/collections";
import { MatPaginator, MatSort } from "@angular/material";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import {
	debounceTime,
	distinctUntilChanged,
	tap,
	skip,
} from "rxjs/operators";
import { fromEvent, merge, Subscription } from "rxjs";
import { Store, select } from "@ngrx/store";
import { AppState } from "../../../../../../core/reducers";
import {
	LayoutUtilsService,
	MessageType,
	QueryParamsModel,
} from "../../../../../../core/_base/crud";
import { BillLogModel } from "../../../../../../core/log/invoice/billLog/billLog.model";
import { BillLogDataSource } from "../../../../../../core/log/invoice/billLog/billLog.datasource";
import {
	BillLogDeleted,
	BillLogPageRequested,
} from "../../../../../../core/log/invoice/billLog/billLog.action";
import { SubheaderService } from "../../../../../../core/_base/layout";
import { BillLogService } from "../../../../../../core/log/invoice/billLog/billLog.service";
import {
	MomentDateAdapter,
} from "@angular/material-moment-adapter";
import {
	DateAdapter,
	MAT_DATE_FORMATS,
	MAT_DATE_LOCALE,
} from "@angular/material";
import * as _moment from "moment";
import { default as _rollupMoment, } from "moment";
import { selectBillLogById } from "../../../../../../core/log/invoice/billLog/billLog.selector";
import { environment } from "../../../../../../../environments/environment";
import { QueryBillLogModel } from "../../../../../../core/log/invoice/billLog/querybillLog.model";
const moment = _rollupMoment || _moment;

const MY_FORMATS = {
	parse: {
		dateInput: "LL",
	},
	display: {
		dateInput: "YYYY-MM-DD",
		monthYearLabel: "YYYY",
		dateA11yLabel: "LL",
		monthYearA11yLabel: "YYYY",
	},
};

@Component({
	selector: "kt-list-billLog",
	templateUrl: "./list-billLog.component.html",
	styleUrls: ["./list-billLog.component.scss"],
	providers: [
		{
			provide: DateAdapter,
			useClass: MomentDateAdapter,
			deps: [MAT_DATE_LOCALE],
		},
		{ provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
	],
})
export class ListBillLogComponent implements OnInit, OnDestroy {
	file;
	periode_date = new Date;
	download_name: string;
	@ViewChild("pdfViewer", { static: true }) pdfViewer: ElementRef;
	dataSource: BillLogDataSource;
	displayedColumns = [
		"prnt",
		"billLog_number",
		"billedTo",
		"Unit",
		"billLog_date",
		"due_date",
		"totalBillLog",
		// "paymentStatus",
		"isPaid",
		"actions",
	];

	data = localStorage.getItem("currentUser");
	dataUser = JSON.parse(this.data)
	role = this.dataUser.role
	@ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
	@ViewChild("sort1", { static: true }) sort: MatSort;
	@ViewChild("searchInput", { static: true }) searchInput: ElementRef;
	lastQuery: QueryParamsModel;
	selection = new SelectionModel<BillLogModel>(true, []);
	billLogResult: BillLogModel[] = [];
	closeResult: string;
	billLog : BillLogModel;
	hari = new Date();
	year
	unit
	loadingbillLog : boolean = false
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
		private service: BillLogService,
		private layoutUtilsService: LayoutUtilsService,
		private subheaderService: SubheaderService,
		private http: HttpClient,
		private modalService: NgbModal,
		private cdr: ChangeDetectorRef
	) {}
	ngOnInit() {
		const sortSubscription = this.sort.sortChange.subscribe(
			() => (this.paginator.pageIndex = 0)
		);
		this.subscriptions.push(sortSubscription);

		const paginatorSubscriptions = merge(
			this.sort.sortChange,
			this.paginator.page
		)
			.pipe(
				tap(() => {
					this.loadBillLogList();
				})
			)
			.subscribe();
		this.subscriptions.push(paginatorSubscriptions);
		const searchSubscription = fromEvent(
			this.searchInput.nativeElement,
			"keyup"
		)
			.pipe(
				debounceTime(150),
				distinctUntilChanged(),
				tap(() => {
					this.paginator.pageIndex = 0;
					this.loadBillLogList();
				})
			)
			.subscribe();
		this.subscriptions.push(searchSubscription);
		this.subheaderService.setTitle("IPL BillLog");
		this.dataSource = new BillLogDataSource(this.store);
		const entitiesSubscription = this.dataSource.entitySubject
			.pipe(skip(1), distinctUntilChanged())
			.subscribe((res) => {
				this.billLogResult = res;
			});
		this.subscriptions.push(entitiesSubscription);
		this.loadBillLogList();
	}

	ngOnDestroy() {
		this.subscriptions.forEach((sb) => sb.unsubscribe());
	}
	
	loadBillLogList() {
		this.selection.clear();
		const queryParams = new QueryBillLogModel(
			this.filterConfiguration(),
			this.paginator.pageIndex + 1,
			this.paginator.pageSize
		);
		this.store.dispatch(new BillLogPageRequested({ page: queryParams }));
		this.selection.clear();
	}

	filterConfiguration(): any {
		const search: string = this.searchInput.nativeElement.value.toLowerCase();
		return search;
	}


	deleteBillLog(_item: BillLogModel) {
		const _title = "BillLog Delete";
		const _description = "Are you sure to permanently delete this billLog?";
		const _waitDesciption = "BillLog is deleting...";
		const _deleteMessage = `BillLog has been deleted`;

		const dialogRef = this.layoutUtilsService.deleteElement(
			_title,
			_description,
			_waitDesciption
		);
		dialogRef.afterClosed().subscribe((res) => {
			if (!res) {
				return;
			}

			this.store.dispatch(new BillLogDeleted({ id: _item._id }));
			this.layoutUtilsService.showActionNotification(
				_deleteMessage,
				MessageType.Delete
			);
		});
	}

	masterToggle() {
		if (this.selection.selected.length === this.billLogResult.length) {
			this.selection.clear();
		} else {
			this.billLogResult.forEach((row) => this.selection.select(row));
		}
	}

	editBillLog(id) {
		this.router.navigate(["edit", id], { relativeTo: this.activatedRoute });
	}

	viewBillLog(id) {
		this.router.navigate(["view", id], { relativeTo: this.activatedRoute });
	}

	printBillLog(id) {
		this.loadingbillLog = true
		const API_BILLING_URL = `${environment.baseAPI}/api/billLog`;
		if (id) {
			this.store.pipe(select(selectBillLogById(id))).subscribe(res => {
				if (res) {
					this.billLog = res;
					console.log(res)
					this.hari = new Date(this.billLog.created_date)
					this.year  = this.hari.getFullYear();
					this.unit = this.billLog.unit2
					console.log(typeof this.unit)
				}
			});
		}
		
		if (this.billLog.pinalty <= 0){
		var mediaType = "application/pdf";
		this.http
			.get(`${API_BILLING_URL}/create/${id}`, {
				responseType: "arraybuffer",
			})
			.subscribe(
				(response) => {
					let blob = new Blob([response], { type: mediaType });
					var fileURL = URL.createObjectURL(blob);
					var anchor = document.createElement("a");
					anchor.download =  this.unit + "_" + this.year + "_" + this.billLog.billing_number  + ".pdf";
					anchor.href = fileURL;
					anchor.click();

					// window.open(fileURL, "_blank")
					// const src = fileURL;
					// this.pdfViewer.nativeElement.data = fileURL;

					if (fileURL){
						this.loadingbillLog = false
						this.cdr.markForCheck();
					}
				},
				(e) => {
					console.error(e);
					this.loadingbillLog = false
					this.cdr.markForCheck();
				}
			);
		}else
		{
		var mediaType = "application/pdf";
		this.http
			.get(`${API_BILLING_URL}/create/pinalty/${id}`, {
				responseType: "arraybuffer",
			})
			.subscribe(
				(response) => {
					let blob = new Blob([response], { type: mediaType });
					var fileURL = URL.createObjectURL(blob);
					var anchor = document.createElement("a");
					anchor.download =  this.unit + "_" + this.year + "_" + this.billLog.billing_number  + ".pdf";
					anchor.href = fileURL;
					anchor.click();

					this.pdfViewer.nativeElement.data = fileURL;
					if (fileURL){
						this.loadingbillLog = false
						this.cdr.markForCheck();
					}
				},
				(e) => {
					console.error(e);
					this.loadingbillLog = false
					this.cdr.markForCheck();
				}
			);
		}
	}

	changePeriode(event) {
		this.periode_date = event.value;
		console.log(event.value);
	}

	selectFile(event) {
		if (event.target.files.length > 0) {
			const file = event.target.files[0];
			this.file = file;
		}
	}

	
	// export(){
	// 	this.service.exportExcel();
	// }
	
	// Class list for list by status
	_getStatusClass(status: boolean, date: string) {
		
		const diff = this.calculateDay(new Date(date));
		
		return {
			'chip': true,
			'chip--success': status,
			'chip--danger': !status && (diff <= -7),
			'chip--warning': !status && (diff <= 0 && diff > -7 )
		}
	}

	calculateDay(date: Date): number {
		const now = new Date().getTime();
		const due = date.getTime();

		const diffInTime = due - now;
		const diffInDay = diffInTime / (1000 * 3600 * 24);
		
		return parseInt(diffInDay.toFixed());
	}
}
