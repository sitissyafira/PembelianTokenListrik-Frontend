import {Component, OnDestroy, OnInit} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
// RxJS
import { BehaviorSubject, Observable, of, Subscription } from 'rxjs';
// NGRX
import { Store, select } from '@ngrx/store';
import { Update } from '@ngrx/entity';
import { AppState } from '../../../../../../core/reducers';
// Layout
import { SubheaderService, LayoutConfigService } from '../../../../../../core/_base/layout';
import { LayoutUtilsService, MessageType } from '../../../../../../core/_base/crud';
import {UomModel} from "../../../../../../core/masterData/asset/uom/uom.model";
import {
	selectLastCreatedUomId,
	selectUomActionLoading,
	selectUomById
} from "../../../../../../core/masterData/asset/uom/uom.selector";
import {UomService} from '../../../../../../core/masterData/asset/uom/uom.service';

@Component({
  selector: 'kt-view-uom',
  templateUrl: './view-uom.component.html',
  styleUrls: ['./view-uom.component.scss']
})
export class ViewUomComponent implements OnInit, OnDestroy {
	// Public properties
	uom: UomModel;
	UomId$: Observable<string>;
	oldUom: UomModel;
	selectedTab = 0;
	loading$: Observable<boolean>;
	uomForm: FormGroup;
	hasFormErrors = false;
	loading : boolean = false;
	// Private properties
	private subscriptions: Subscription[] = [];
  	constructor(
		private activatedRoute: ActivatedRoute,
		private router: Router,
		private uomFB: FormBuilder,
		private subheaderService: SubheaderService,
		private layoutUtilsService: LayoutUtilsService,
		private store: Store<AppState>,
		private service: UomService,
		private layoutConfigService: LayoutConfigService
	) { }

  	ngOnInit() {
		this.loading$ = this.store.pipe(select(selectUomActionLoading));
		const routeSubscription =  this.activatedRoute.params.subscribe(params => {
			const id = params.id;
			if (id) {
				this.store.pipe(select(selectUomById(id))).subscribe(res => {
					if (res) {
						this.uom = res;
						this.oldUom = Object.assign({}, this.uom);
						this.initUom();
					}
				});
			} else {
				this.uom = new UomModel();
				this.uom.clear();
				this.initUom();
			}
		});
		this.subscriptions.push(routeSubscription);
  	}

	initUom() {
		this.createForm();
	}

	createForm() {
		this.uomForm = this.uomFB.group({
			uom: [{value:this.uom.uom.toLocaleUpperCase(), disabled:true}],
			remarks: [{value:this.uom.remarks, disabled:true}],
		});
	}

	goBackWithId() {
		const url = `/uom`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}

	refreshUom(isNew: boolean = false, id:string = "") {
		let url = this.router.url;
		if (!isNew) {
			this.router.navigate([url], { relativeTo: this.activatedRoute });
			return;
		}

		url = `/uom/edit/${id}`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}

	
	getComponentTitle() {
		let result = `View UOM`;
		return result;
	}

	onAlertClose($event) {
		this.hasFormErrors = false;
	}

  	ngOnDestroy() {
		this.subscriptions.forEach(sb => sb.unsubscribe());
	}
	
}
