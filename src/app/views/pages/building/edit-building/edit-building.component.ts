import { Component, OnInit, OnDestroy } from '@angular/core';
import {BehaviorSubject, Observable, Subscription} from 'rxjs';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {BuildingModel} from '../../../../core/building/building.model';
import {ActivatedRoute, Router} from '@angular/router';
import {LayoutConfigService, SubheaderService} from '../../../../core/_base/layout';
import {BodyModel, LayoutUtilsService, MessageType, QueryParamsModel} from '../../../../core/_base/crud';
import {select, Store} from '@ngrx/store';
import {AppState} from '../../../../core/reducers';
import {
	selectBuildingActionLoading,
	selectBuildingById,
	selectLastCreatedBuildingId
} from '../../../../core/building/building.selector'
import {BuildingOnServerCreated, BuildingUpdated} from '../../../../core/building/building.action';
import {Update} from '@ngrx/entity';
import {SelectionModel} from '@angular/cdk/collections';
import {QueryBlockModel} from '../../../../core/block/queryblock.model';
import {BlockService} from '../../../../core/block/block.service';

@Component({
  selector: 'kt-edit-building',
  templateUrl: './edit-building.component.html',
  styleUrls: ['./edit-building.component.scss']
})
export class EditBuildingComponent implements OnInit, OnDestroy {
	building: BuildingModel;
	blockId$: Observable<string>;
	oldBuilding: BuildingModel;
	selectedTab = 0;
	loading$: Observable<boolean>;
	buildingForm: FormGroup;
	selection = new SelectionModel<BuildingModel>(true, []);
	hasFormErrors = false;
	blockResult: any[] = [];
	// Private properties
	private subscriptions: Subscription[] = [];
	constructor(
		private activatedRoute: ActivatedRoute,
		private router: Router,
		private buildingFB: FormBuilder,
		private subheaderService: SubheaderService,
		private layoutUtilsService: LayoutUtilsService,
		private store: Store<AppState>,
		private service: BlockService,
		private layoutConfigService: LayoutConfigService
	) { }
	ngOnInit() {
		this.loading$ = this.store.pipe(select(selectBuildingActionLoading));
		const routeSubscription =  this.activatedRoute.params.subscribe(params => {
			const id = params.id;
			if(id){
				this.store.pipe(select(selectBuildingById(id))).subscribe(res => {
					if (res) {
						this.building = res;
						this.oldBuilding = Object.assign({}, this.building);
						this.initBuilding();
					}
				});

			}
		});
		this.loadBlockList();
		this.subscriptions.push(routeSubscription);
	}
	initBuilding() {
		this.createForm();
		this.subheaderService.setTitle('Edit building');
		this.subheaderService.setBreadcrumbs([
			{ title: 'Building', page: `building` },
			{ title: 'Edit Building',  page: `building/edit`, queryParams: { id: this.building._id }}
		]);
	}
	createForm() {
		this.buildingForm = this.buildingFB.group({
			nmbld : [this.building.nmbld, Validators.required],
			addrbld : [this.building.addrbld, Validators.required],
			blk : [this.building.blk, Validators.required]
		});
	}
	goBackWithId() {
		const url = `/building`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}
	refreshBuilding(isNew: boolean = false, id:string = "") {
		let url = this.router.url;
		if (!isNew) {
			this.router.navigate([url], { relativeTo: this.activatedRoute });
			return;
		}

		url = `/building/edit/${id}`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}
	reset() {
		this.building = Object.assign({}, this.oldBuilding);
		this.createForm();
		this.hasFormErrors = false;
		this.buildingForm.markAsPristine();
		this.buildingForm.markAsUntouched();
		this.buildingForm.updateValueAndValidity();
	}
	onSubmit(withBack: boolean = false) {
		this.hasFormErrors = false;
		const controls = this.buildingForm.controls;
		/** check form */
		if (this.buildingForm.invalid) {
			Object.keys(controls).forEach(controlName =>
				controls[controlName].markAsTouched()
			);

			this.hasFormErrors = true;
			this.selectedTab = 0;
			return;
		}
		const preparedBlock = this.prepareBuilding();
		this.updateBuilding(preparedBlock, withBack);
	}
	prepareBuilding(): BuildingModel {
		const controls = this.buildingForm.controls;
		const _building = new BuildingModel();
		_building.clear();
		_building._id = this.building._id;
		_building.nmbld = controls.nmbld.value;
		_building.addrbld = controls.addrbld.value;
		_building.blk = controls.blk.value;
		return _building;
	}
	updateBuilding(_building: BuildingModel, withBack: boolean = false) {

		// tslint:disable-next-line:prefer-const
		const updatedBuilding: Update<BuildingModel> = {
			id: _building._id,
			changes: _building
		};
		this.store.dispatch(new BuildingUpdated( { partialBuilding: updatedBuilding, building: _building }));
		const message = `Block successfully has been saved.`;
		this.layoutUtilsService.showActionNotification(message, MessageType.Update, 5000, true, true);
		if (withBack) {
			this.goBackWithId();
		} else {
			this.refreshBuilding(false);
		}
	}
	loadBlockList() {
		this.selection.clear();
		const queryParams = new QueryBlockModel(
			null,
			"asc",
			"nmblk",
			1,
			10
		);
		const queryBody = new BodyModel(
			"null",
			1,
			10
		);
		this.service.getListBlock(queryParams).subscribe(
			res => {
				this.blockResult = res.data;
			}
		);
	}
	getComponentTitle() {
		let result = 'Edit group';

		return result;
	}
	onAlertClose($event) {
		this.hasFormErrors = false;
	}
	ngOnDestroy(){
		this.subscriptions.forEach(sb => sb.unsubscribe());
	}

}
