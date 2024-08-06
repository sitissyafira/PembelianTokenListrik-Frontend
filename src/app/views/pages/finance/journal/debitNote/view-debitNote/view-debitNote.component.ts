import { ChangeDetectorRef,ElementRef, Component, OnDestroy, OnInit, ViewChild } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import {
	FormBuilder,
	FormControl,
	FormGroup,
} from "@angular/forms";
import { Observable, Subscription } from "rxjs";
import { Store, select } from "@ngrx/store";
import { AppState } from "../../../../../../core/reducers";
import { DebitNoteModel } from "../../../../../../core/finance/journal/debitNote/debitNote.model";
import { selectDebitNoteActionLoading } from "../../../../../../core/finance/journal/debitNote/debitNote.selector";
import { DebitNoteService } from "../../../../../../core/finance/journal/debitNote/debitNote.service";
import { SelectionModel } from "@angular/cdk/collections";
import { environment } from "../../../../../../../environments/environment";
import { MatTable } from "@angular/material";
import moment from "moment";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { ServiceFormat } from "../../../../../../core/serviceFormat/format.service";

@Component({
	selector: "kt-view-debitNote",
	templateUrl: "./view-debitNote.component.html",
	styleUrls: ["./view-debitNote.component.scss"],
})
export class ViewDebitNoteComponent implements OnInit, OnDestroy {
	debitNote: DebitNoteModel;
	DebitNoteId$: Observable<string>;
	oldDebitNote: DebitNoteModel;
	selectedTab = 0;
	loading$: Observable<boolean>;
	selection = new SelectionModel<DebitNoteModel>(true, []);
	debitNoteResult: any[] = [];
	glResult: any[] = [];
	debitNoteForm: FormGroup;
	date1 = new FormControl(new Date());
	hasFormErrors = false;
	isStatus: boolean = false;
	private subscriptions: Subscription[] = [];

	//untuk menampilkan glaccount di topup
	isToken = false;

	totalField: number = 0

	isDebit: boolean;
	ccList = [];
	titleHeader: any
	title: string;
	dataTable = []

	loading = {
		deposit: false,
		submit: false,
		glaccount: false,
	};
	debitNoteListResultFiltered = [];
	viewDebitNoteResult = new FormControl();
	gLListResultFiltered = [];

	@ViewChild('myTable', { static: false }) table: MatTable<any>;
	displayedColumns = ['no', 'gl', 'amount', 'desc', 'isdebit'];
	@ViewChild("modaldebitnote", { static: true }) modaldebitnote: ElementRef;
	constructor(
		private activatedRoute: ActivatedRoute,
		private router: Router,
		private store: Store<AppState>,
		private service: DebitNoteService,
		private cd: ChangeDetectorRef,
		private modalService: NgbModal,
		private serviceFormat: ServiceFormat,
	) { }

	ngOnInit() {
		this.loading$ = this.store.pipe(select(selectDebitNoteActionLoading));
		const routeSubscription = this.activatedRoute.params.subscribe(
			(params) => {
				const id = params.id;
				if (id) {
					this.openLarge() /** display modal loading */
					this.cd.markForCheck()
					this.service.findDebitNoteById(id).subscribe(resdebitnote => {
						this.dataTable = resdebitnote.data.dataTable
						this.titleHeader = resdebitnote.data.JP
						this.getComponentTitle(resdebitnote.data.JP)

						this.close()// close loading modal
						
						this.cd.markForCheck();
					})

				}
			}
		);
		this.subscriptions.push(routeSubscription);
	}

	goBackWithId() {
		const url = `/debitNote`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}

	refreshDebitNote(isNew: boolean = false, id: string = "") {
		let url = this.router.url;
		if (!isNew) {
			this.router.navigate([url], { relativeTo: this.activatedRoute });
			return;
		}

		url = `/debitNote/edit/${id}`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}

	getComponentTitle(data) {

		let result = `<br> View Journal Debit Note : ${data.voucherno}
			<br><br> Date : ${moment(data.date).format('LL')} <br> <p></p>`;

		this.title = result;
	}

	onAlertClose($event) {
		this.hasFormErrors = false;
	}

	ngOnDestroy() {
		this.subscriptions.forEach((sb) => sb.unsubscribe());
	}
	openLarge() {
		this.modalService.open(this.modaldebitnote, {
			centered: true,
			size: 'sm',
			backdrop: "static",
		});
	}

	close() {
		this.modalService.dismissAll()
	}
}
