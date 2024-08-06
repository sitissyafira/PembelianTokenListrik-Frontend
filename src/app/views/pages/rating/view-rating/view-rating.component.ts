import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
// RxJS
import { BehaviorSubject, Observable, of, Subscription } from 'rxjs';
// NGRX
import { Store, select } from '@ngrx/store';
import { Update } from '@ngrx/entity';
import { AppState } from '../../../../core/reducers';
// Layout
import { SubheaderService, LayoutConfigService } from '../../../../core/_base/layout';
import { LayoutUtilsService, MessageType } from '../../../../core/_base/crud';
import { TicketModel } from "../../../../core/ticket/ticket.model";
import {
	selectLastCreatedTicketId,
	selectTicketActionLoading,
	selectTicketById
} from "../../../../core/ticket/ticket.selector";
import { TicketService } from '../../../../core/ticket/ticket.service';
import { SelectionModel } from '@angular/cdk/collections';
import { OwnershipContractService } from '../../../../core/contract/ownership/ownership.service';
import { QueryOwnerTransactionModel } from '../../../../core/contract/ownership/queryowner.model';
import { CategoryService } from '../../../../core/category/category.service';
import { QueryCategoryModel } from '../../../../core/category/querycategory.model';
import { QueryDefectModel } from '../../../../core/defect/querydefect.model';
import { DefectService } from '../../../../core/defect/defect.service';
import { SubdefectService } from '../../../../core/subdefect/subdefect.service';
import { QuerySubdefectModel } from '../../../../core/subdefect/querysubdefect.model';
import { DomSanitizer } from '@angular/platform-browser';
import { HttpClient } from '@angular/common/http';
import { LeaseContractService } from '../../../../core/contract/lease/lease.service';
import { QueryEngineerModel } from '../../../../core/engineer/queryengineer.model';
import { EngineerService } from '../../../../core/engineer/engineer.service';
import { environment } from '../../../../../environments/environment';

@Component({
	selector: 'kt-view-rating',
	templateUrl: './view-rating.component.html',
	styleUrls: ['./view-rating.component.scss']
})
export class ViewRatingComponent implements OnInit, OnDestroy {
	// Public properties
	rating: TicketModel;
	TicketId$: Observable<string>;
	oldTicket: TicketModel;
	selectedTab = 0;
	loading$: Observable<boolean>;
	ticketForm: FormGroup;
	selection = new SelectionModel<TicketModel>(true, []);
	hasFormErrors = false;
	unitResult: any[] = [];
	enResult: any[] = [];
	myFiles: any[] = []
	images: any;
	cResult: any[] = [];
	dResult: any[] = [];
	sResult: any[] = [];
	codenum: any;
	selectedFile: File;
	retrievedImage: any;
	base64Data: any;
	message: string;

	imageStarTrue: string = `${environment.baseAPI}/starTrue.png`
	imageStarFalse: string = `${environment.baseAPI}/starFalse.png`

	imgStarTrue: any = []
	imgStarFalse: any = []

	imageName: any;
	//button hidden
	isHidden: boolean = true;
	buttonReshedule: boolean = true;
	buttonView: boolean = true
	// Private properties
	private subscriptions: Subscription[] = [];
	constructor(
		private activatedRoute: ActivatedRoute,
		private router: Router,
		private ticketFB: FormBuilder,
		private subheaderService: SubheaderService,
		private layoutUtilsService: LayoutUtilsService,
		private store: Store<AppState>,
		private service: TicketService,
		private ownService: OwnershipContractService,
		private leaseService: LeaseContractService,
		private cService: CategoryService,
		private dService: DefectService,
		private sService: SubdefectService,
		private enService: EngineerService,
		private layoutConfigService: LayoutConfigService,
		private http: HttpClient,
		private sanitizer: DomSanitizer,
	) { }

	ngOnInit() {
		this.loading$ = this.store.pipe(select(selectTicketActionLoading));
		const routeSubscription = this.activatedRoute.params.subscribe(params => {
			const id = params.id;
			if (id) {
				this.store.pipe(select(selectTicketById(id))).subscribe(res => {
					if (res) {
						this.rating = res;
						for (let i = 1; i <= parseInt(res.rating); i++) {
							this.imgStarTrue.push({ no: i })
						}
						for (let i = 1; i <= (5 - parseInt(res.rating)); i++) {
							this.imgStarFalse.push({ no: i })
						}

						this.oldTicket = Object.assign({}, this.rating);
						this.initTicket();
					}
				});
			} else {
				this.rating = new TicketModel();
				this.rating.clear();
				this.initTicket();
			}
		});
		this.subscriptions.push(routeSubscription);
	}

	initTicket() {
		console.log("in");
	}

	showHidden() {
		this.isHidden = true;
	}

	goBackWithId() {
		const url = `/rating`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}

	getComponentTitle() {
		let result = `View Rating`;
		return result;
	}

	onAlertClose($event) {
		this.hasFormErrors = false;
	}

	ngOnDestroy() {
		this.subscriptions.forEach(sb => sb.unsubscribe());
	}

}
