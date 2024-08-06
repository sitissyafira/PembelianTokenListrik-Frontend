import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Observable, Subscription } from 'rxjs';
import { Store, select } from '@ngrx/store';
import { AppState } from '../../../../../core/reducers';
import { SubheaderService, LayoutConfigService } from '../../../../../core/_base/layout';
import { LayoutUtilsService, MessageType, QueryParamsModel } from '../../../../../core/_base/crud';
import { PettyCastModel } from "../../../../../core/purchaseManagement/pettyCast/pettyCast.model";
import { selectPettyCastActionLoading } from "../../../../../core/purchaseManagement/pettyCast/pettyCast.selector";
import { PettyCastService } from '../../../../../core/purchaseManagement/pettyCast/pettyCast.service';
import { SelectionModel } from '@angular/cdk/collections';
import { AccountGroupService } from '../../../../../core/accountGroup/accountGroup.service';

@Component({
	selector: 'kt-add-pettyCast',
	templateUrl: './add-pettyCast.component.html',
	styleUrls: ['./add-pettyCast.component.scss']
})
export class AddPettyCastComponent implements OnInit, OnDestroy {

	data = localStorage.getItem("currentUser");
	dataUser = JSON.parse(this.data)
	role = this.dataUser.role

	datauser = localStorage.getItem("user");
	pettyCast: PettyCastModel;
	PettyCastId$: Observable<string>;
	selection = new SelectionModel<PettyCastModel>(true, []);
	oldPettyCast: PettyCastModel;
	selectedTab = 0;
	loading$: Observable<boolean>;
	pettyCastForm: FormGroup;
	hasFormErrors = false;
	codenum


	date1 = new FormControl(new Date());
	productResult: any[] = [];
	productBrandResult: any[] = [];
	UOMResult: any[] = [];

	apResult: any[] = [];
	glResult: any[] = [];


	private loading = {
		deposit: false,
		glaccount: false,
		bank: false
	}

	private subscriptions: Subscription[] = [];
	constructor(
		private activatedRoute: ActivatedRoute,
		private router: Router,
		private pettyCastFB: FormBuilder,
		private subheaderService: SubheaderService,
		private layoutUtilsService: LayoutUtilsService,
		private COAService: AccountGroupService,
		private store: Store<AppState>,
		private service: PettyCastService,
		private cd: ChangeDetectorRef,
		private layoutConfigService: LayoutConfigService
	) { }

	ngOnInit() {
		this.loading$ = this.store.pipe(select(selectPettyCastActionLoading));
		const routeSubscription = this.activatedRoute.params.subscribe(params => {
			this.pettyCast = new PettyCastModel();
			this.pettyCast.clear();
			this.initPettyCast();
		}
		)

		this.subscriptions.push(routeSubscription);
	}

	initPettyCast() {
		this.createForm();
		this.loadCOACashBank();
		this.loadGLAccount();
		this.getNumber();
	}

	createForm() {
		this.pettyCastForm = this.pettyCastFB.group({
			created_date: [{ value: this.date1.value, disabled: true }],
			pettyCashNo: [{ value: "", disabled: false }],
			paidFrom: [{ value: "", disabled: false }],
			glaccount: [{ value: this.date1.value, disabled: false }],
			memo: [{ value: "", disabled: false }],
			amount: [{ value: "", disabled: false }],
			created_by: [{ value: this.datauser, disabled: true }],
		});
	}


	getNumber() {
		this.service.generateCodePettyCash().subscribe(
			res => {
				this.codenum = res.data
				const controls = this.pettyCastForm.controls;
				controls.pettyCashNo.setValue(this.codenum);

			}
		)
	}


	loadCOACashBank() {
		this.loading.deposit = true;
		this.selection.clear();
		const queryParams = new QueryParamsModel(
			null,
			"asc",
			null,
			1,
			1000
		);
		this.COAService.getListCashBank(queryParams).subscribe(
			res => {
				this.apResult = res.data;
				this.loading.deposit = false;
				this.cd.markForCheck();
			}
		);
	}

	loadGLAccount() {
		// Init Loader
		this.loading.glaccount = true;
		this.selection.clear();
		const queryParams = new QueryParamsModel(
			null,
			"asc",
			null,
			1,
			1000
		);
		this.COAService.getListGLAccountAP(queryParams).subscribe(
			res => {
				const data = [];

				res.data.map(item => {
					item.map(item2 => {
						console.log(item2);
						data.push(item2);
					})
				});

				this.glResult = data;
				console.log(this.glResult, 'hasil resutl');
				this.loading.glaccount = false;
				this.cd.markForCheck();
			}
		);
	}


	goBackWithId() {
		const url = `/pettyCast`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}
	refreshPettyCast(isNew: boolean = false, id: string = "") {
		let url = this.router.url;
		if (!isNew) {
			this.router.navigate([url], { relativeTo: this.activatedRoute });
			return;
		}
		url = `/pettyCast/edit/${id}`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}
	onSubmit(withBack: boolean = false) {
		this.hasFormErrors = false;
		const controls = this.pettyCastForm.controls;
		if (this.pettyCastForm.invalid) {
			Object.keys(controls).forEach(controlName =>
				controls[controlName].markAsTouched()
			);

			this.hasFormErrors = true;
			this.selectedTab = 0;
			return;
		}

		// this.loading = true;
		const editedPettyCast = this.preparePettyCast();
		this.addPettyCast(editedPettyCast, withBack);
	}

	preparePettyCast(): PettyCastModel {
		const controls = this.pettyCastForm.controls;
		const _pettyCast = new PettyCastModel();
		_pettyCast.clear();
		_pettyCast._id = this.pettyCast._id;
		_pettyCast.pettyCashNo = controls.pettyCashNo.value.toLowerCase();
		_pettyCast.glaccount = controls.glaccount.value;
		_pettyCast.memo = controls.memo.value;
		_pettyCast.paidFrom = controls.paidFrom.value;
		_pettyCast.amount = controls.amount.value;
		_pettyCast.created_date = controls.created_date.value;
		_pettyCast.created_by = controls.created_by.value;
		return _pettyCast;

	}
	addPettyCast(_pettyCast: PettyCastModel, withBack: boolean = false) {
		const addSubscription = this.service.createPettyCast(_pettyCast).subscribe(
			res => {
				const message = `New stock in successfully has been added.`;
				this.layoutUtilsService.showActionNotification(message, MessageType.Create, 5000, true, true);
				const url = `/pettyCast`;
				this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
			},
			err => {
				console.error(err);
				const message = 'Error while adding stock in | ' + err.statusText;
				this.layoutUtilsService.showActionNotification(message, MessageType.Create, 5000, true, false);
			}
		);
		this.subscriptions.push(addSubscription);
	}
	getComponentTitle() {
		let result = 'Create Petty Cast';
		return result;
	}
	onAlertClose($event) {
		this.hasFormErrors = false;
	}
	ngOnDestroy() {
		this.subscriptions.forEach(sb => sb.unsubscribe());
	}
	inputKeydownHandler(event) {
		return event.keyCode === 8 || event.keyCode === 46 ? true : !isNaN(Number(event.key));
	}
}
