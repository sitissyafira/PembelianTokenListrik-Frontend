import {Component, OnDestroy, OnInit} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
// RxJS
import {  Observable, Subscription } from 'rxjs';
// NGRX
import { Store, select } from '@ngrx/store';
import { AppState } from '../../../../core/reducers';
// Layout
import { SubheaderService, LayoutConfigService } from '../../../../core/_base/layout';
import { LayoutUtilsService,} from '../../../../core/_base/crud';
import {VehicleTypeModel} from "../../../../core/vehicletype/vehicletype.model";
import {
	selectVehicleTypeActionLoading,
	selectVehicleTypeById
} from "../../../../core/vehicletype/vehicletype.selector";

import {VehicleTypeService} from '../../../../core/vehicletype/vehicletype.service';

@Component({
  selector: 'kt-view-vehicletype',
  templateUrl: './view-vehicletype.component.html',
  styleUrls: ['./view-vehicletype.component.scss']
})
export class ViewVehicletypeComponent implements OnInit, OnDestroy {
	// Public properties
	vehicleType: VehicleTypeModel;
	customerId$: Observable<string>;
	oldVehicleType: VehicleTypeModel;
	selectedTab = 0;
	loading$: Observable<boolean>;
	vehicleTypeForm: FormGroup;
	hasFormErrors = false;
	loading  : boolean = false;
	// Private properties
	private subscriptions: Subscription[] = [];

	constructor(
		private activatedRoute: ActivatedRoute,
		private router: Router,
		private vehicleTypeFB: FormBuilder,
		private subheaderService: SubheaderService,
		private layoutUtilsService: LayoutUtilsService,
		private store: Store<AppState>,
		private layoutConfigService: LayoutConfigService,
		private service: VehicleTypeService
	) { }
	ngOnInit() {
		this.loading$ = this.store.pipe(select(selectVehicleTypeActionLoading));
		const routeSubscription =  this.activatedRoute.params.subscribe(params => {
			const id = params.id;
			if (id) {
				this.store.pipe(select(selectVehicleTypeById(id))).subscribe(res => {
					if (res) {
						this.vehicleType = res;
						this.oldVehicleType = Object.assign({}, this.vehicleType);
						this.initVehicleType();
					}
				});
			}
		});
		this.subscriptions.push(routeSubscription);
	}
	initVehicleType(){
		this.createForm();
	}

	createForm() {
		this.vehicleTypeForm = this.vehicleTypeFB.group({
			nmvhtp: [{value:this.vehicleType.nmvhtp, disabled:true}],
			vhttype :[{value:this.vehicleType.vhttype, disabled:true}],
			vhtprate: [{value:this.vehicleType.vhtprate, disabled:true}],
		});
	}
	goBackWithId() {
		const url = `/vehicletype`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}
	refreshVehicleType(isNew: boolean = false, id:string = "") {
		let url = this.router.url;
		if (!isNew) {
			this.router.navigate([url], { relativeTo: this.activatedRoute });
			return;
		}

		url = `/vehicletype/edit/${id}`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}
	
	getComponentTitle() {
		let result = `View Vehicle`;
		return result;
	}
	onAlertClose($event) {
		this.hasFormErrors = false;
	}
	ngOnDestroy() {
		this.subscriptions.forEach(sb => sb.unsubscribe());
	}

}
