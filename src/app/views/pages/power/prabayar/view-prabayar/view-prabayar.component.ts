// Angular
import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
// RxJS
import { BehaviorSubject, Observable, of, Subscription } from 'rxjs';
// NGRX
import { Store, select } from '@ngrx/store';
import { AppState } from '../../../../../core/reducers';
// Layout
import { SubheaderService, LayoutConfigService } from '../../../../../core/_base/layout';
import { LayoutUtilsService } from '../../../../../core/_base/crud';
import { PowerPrabayarModel } from "../../../../../core/power/prabayar/prabayar.model";
import {
	selectLastCreatedPowerPrabayarId,
	selectPowerPrabayarActionLoading,
	selectPowerPrabayarById
} from "../../../../../core/power/prabayar/prabayar.selector";
import { PowerPrabayarService } from '../../../../../core/power';

@Component({
	selector: 'kt-view-prabayar',
	templateUrl: './view-prabayar.component.html',
	styleUrls: ['./view-prabayar.component.scss']
})
export class ViewPrabayarComponent implements OnInit, OnDestroy {
	// Public properties
	powerPrabayar: PowerPrabayarModel;
	powerPrabayarId$: Observable<string>;
	oldPowerPrabayar: PowerPrabayarModel;
	selectedTab = 0;
	loading$: Observable<boolean>;
	powerPrabayarForm: FormGroup;
	hasFormErrors = false;
	loading: boolean = false
	// Private properties
	private subscriptions: Subscription[] = [];
	constructor(
		private activatedRoute: ActivatedRoute,
		private router: Router,
		private powerPrabayarFB: FormBuilder,
		private subheaderService: SubheaderService,
		private layoutUtilsService: LayoutUtilsService,
		private store: Store<AppState>,
		private layoutConfigService: LayoutConfigService,
		private service: PowerPrabayarService
	) { }
	ngOnInit() {
		this.loading$ = this.store.pipe(select(selectPowerPrabayarActionLoading));
		const routeSubscription = this.activatedRoute.params.subscribe(params => {
			const id = params.id;
			if (id) {
				this.store.pipe(select(selectPowerPrabayarById(id))).subscribe(res => {
					if (res) {
						this.powerPrabayar = res;
						this.oldPowerPrabayar = Object.assign({}, this.powerPrabayar);
						this.initPowerPrabayar();
					}
				});
			}
		});
		this.subscriptions.push(routeSubscription);
	}
	initPowerPrabayar() {
		this.createForm();
	}
	createForm() {
		if (this.powerPrabayar._id) {
			this.powerPrabayarForm = this.powerPrabayarFB.group({
				name: [{ value: this.powerPrabayar.name, disabled: false }],
				rate: [{ value: this.powerPrabayar.rate, disabled: false }],
				adminRate: [{ value: this.powerPrabayar.adminRate, disabled: false }],
				status: [{ value: this.powerPrabayar.status, disabled: false }],
			});
		}
	}

	goBackWithId() {
		const url = `/power-management/power/prabayar`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}
	refreshPowerPrabayar(isNew: boolean = false, id: string = "") {
		let url = this.router.url;
		if (!isNew) {
			this.router.navigate([url], { relativeTo: this.activatedRoute });
			return;
		}

		url = `/power-management/power/prabayar/edit/${id}`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}

	getComponentTitle() {
		let result = `View Electricity Prabayar`;
		return result;
	}
	onAlertClose($event) {
		this.hasFormErrors = false;
	}
	ngOnDestroy() {
		this.subscriptions.forEach(sb => sb.unsubscribe());
	}

}
