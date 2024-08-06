import {Component, OnDestroy, OnInit} from '@angular/core';
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
import {UnitTypeModel} from "../../../../core/unittype/unittype.model";
import {
	selectLastCreatedUnitTypeId,
	selectUnitTypeActionLoading,
	selectUnitTypeById
} from "../../../../core/unittype/unittype.selector";
import {UnitTypeService} from '../../../../core/unittype/unittype.service';

@Component({
  selector: 'kt-view-unittype',
  templateUrl: './view-unittype.component.html',
  styleUrls: ['./view-unittype.component.scss']
})
export class ViewUnittypeComponent implements OnInit, OnDestroy {
	// Public properties
	unitType: UnitTypeModel;
	UnitTypeId$: Observable<string>;
	oldUnitType: UnitTypeModel;
	selectedTab = 0;
	loading$: Observable<boolean>;
	unitTypeForm: FormGroup;
	loading : boolean = false;
	hasFormErrors = false;
	// Private properties
	private subscriptions: Subscription[] = [];
  	constructor(
		private activatedRoute: ActivatedRoute,
		private router: Router,
		private unitTypeFB: FormBuilder,
		private subheaderService: SubheaderService,
		private layoutUtilsService: LayoutUtilsService,
		private store: Store<AppState>,
		private service: UnitTypeService,
		private layoutConfigService: LayoutConfigService
	) { }

  	ngOnInit() {
		this.loading$ = this.store.pipe(select(selectUnitTypeActionLoading));
		const routeSubscription =  this.activatedRoute.params.subscribe(params => {
			const id = params.id;
			if (id) {
				this.store.pipe(select(selectUnitTypeById(id))).subscribe(res => {
					if (res) {
						this.unitType = res;
						this.oldUnitType = Object.assign({}, this.unitType);
						this.initUnitType();
					}
				});
			} 
		});
		this.subscriptions.push(routeSubscription);
  	}


	initUnitType() {
		this.createForm();
	}

	createForm() {
		if (this.unitType._id){
		this.unitTypeForm = this.unitTypeFB.group({
			unttp: [{value:this.unitType.unttp, disabled:true}],
			untsqr: [{value:this.unitType.untsqr, disabled:true}],
			});
		}
	}

	goBackWithId() {
		const url = `/typeunit`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}

	refreshUnitType(isNew: boolean = false, id:string = "") {
		let url = this.router.url;
		if (!isNew) {
			this.router.navigate([url], { relativeTo: this.activatedRoute });
			return;
		}

		url = `/typeunit/view/${id}`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}

	getComponentTitle() {
		let result = `View Unit Type`;
		return result;
	}

	onAlertClose($event) {
		this.hasFormErrors = false;
	}

  	ngOnDestroy() {
		this.subscriptions.forEach(sb => sb.unsubscribe());
	}
	
}
