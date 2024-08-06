import {Component, OnDestroy, OnInit} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
// RxJS
import { BehaviorSubject, Observable, of, Subscription } from 'rxjs';
// NGRX
import { Store, select } from '@ngrx/store';
import { AppState } from '../../../../../../core/reducers';
// Layout
import { SubheaderService, LayoutConfigService } from '../../../../../../core/_base/layout';
import { LayoutUtilsService, MessageType } from '../../../../../../core/_base/crud';

import {
	selectLastCreatedFiscalId,
	selectFiscalActionLoading,
	selectFiscalById
} from "../../../../../../core/masterData/asset/fiscal/fiscal.selector";
import {FiscalService} from '../../../../../../core/masterData/asset/fiscal/fiscal.service';
import { FiscalModel } from '../../../../../../core/masterData/asset/fiscal/fiscal.model';

@Component({
  selector: 'kt-view-fiscal',
  templateUrl: './view-fiscal.component.html',
  styleUrls: ['./view-fiscal.component.scss']
})

export class ViewFiscalComponent implements OnInit, OnDestroy {
	// Public properties
	fiscal: FiscalModel;
	FiscalId$: Observable<string>;
	oldFiscal: FiscalModel;
	selectedTab = 0;
	loading$: Observable<boolean>;
	fiscalForm: FormGroup;
	hasFormErrors = false;
	// Private properties
	private subscriptions: Subscription[] = [];
  	constructor(
		private activatedRoute: ActivatedRoute,
		private router: Router,
		private fiscalFB: FormBuilder,
		private subheaderService: SubheaderService,
		private layoutUtilsService: LayoutUtilsService,
		private store: Store<AppState>,
		private service: FiscalService,
		private layoutConfigService: LayoutConfigService
	) { }

  	ngOnInit() {
		this.loading$ = this.store.pipe(select(selectFiscalActionLoading));
		const routeSubscription =  this.activatedRoute.params.subscribe(params => {
			const id = params.id;
			if (id) {
				this.store.pipe(select(selectFiscalById(id))).subscribe(res => {
					if (res) {
						this.fiscal = res;
						this.oldFiscal = Object.assign({}, this.fiscal);
						this.initFiscal();
					}
				});
			}
		});
		this.subscriptions.push(routeSubscription);
  	}

	initFiscal() {
		this.createForm();
	}

	createForm() {
		this.fiscalForm = this.fiscalFB.group({
			fiscalName : [{value:this.fiscal.fiscalName, disabled:true}],
   			description : [{value:this.fiscal.description, disabled:true}],
		});
	}

	goBackWithId() {
		const url = `/fiscal`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}

	refreshFiscal(isNew: boolean = false, id:string = "") {
		let url = this.router.url;
		if (!isNew) {
			this.router.navigate([url], { relativeTo: this.activatedRoute });
			return;
		}

		url = `/fiscal/edit/${id}`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}

	getComponentTitle() {
		let view = `View Fiscal Asset`;
		return view;
	}

	onAlertClose($event) {
		this.hasFormErrors = false;
	}

  	ngOnDestroy() {
		this.subscriptions.forEach(sb => sb.unsubscribe());
	}
	
}
