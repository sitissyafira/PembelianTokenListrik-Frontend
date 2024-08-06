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
	selectFloorActionLoading,
	selectFloorById,
	selectLastCreatedFloorId
} from '../../../../core/floor/floor.selector'
import {BuildingOnServerCreated, BuildingUpdated} from '../../../../core/building/building.action';
import {Update} from '@ngrx/entity';
import {SelectionModel} from '@angular/cdk/collections';
import {QueryBlockModel} from '../../../../core/block/queryblock.model';
import {BlockService} from '../../../../core/block/block.service';
import {FloorModel} from '../../../../core/floor/floor.model';
import {BlockGroupService} from '../../../../core/blockgroup/blockgroup.service';
import {BuildingService} from '../../../../core/building/building.service';
import {FloorService} from '../../../../core/floor/floor.service';
import {QueryBuildingModel} from '../../../../core/building/querybuilding.model';
import {FloorUpdated} from '../../../../core/floor/floor.action';

@Component({
  selector: 'kt-view-floor',
  templateUrl: './view-floor.component.html',
  styleUrls: ['./view-floor.component.scss']
})
export class ViewFloorComponent implements OnInit,OnDestroy {
	floor: FloorModel;
	floorId$: Observable<string>;
	oldFloor: FloorModel;
	selectedTab = 0;
	loading$: Observable<boolean>;
	floorForm: FormGroup;
	selection = new SelectionModel<FloorModel>(true, []);
	hasFormErrors = false;
	blockGroupResult: any[] = [];
	blockResult: any[] = [];
	buildingResult: any[] =[];
	loadingForm: boolean;
	loading : boolean = false;
	// Private properties
	private subscriptions: Subscription[] = [];
	constructor(
		private activatedRoute: ActivatedRoute,
		private router: Router,
		private floorFB: FormBuilder,
		private subheaderService: SubheaderService,
		private layoutUtilsService: LayoutUtilsService,
		private store: Store<AppState>,
		private service: FloorService,
		private serviceBlk: BlockService,
		private serviceBlkGrp: BlockGroupService,
		private serviceBld: BuildingService,
		private layoutConfigService: LayoutConfigService
	) { }
	ngOnInit() {
		this.loadingForm = true;
		this.loading$ = this.store.pipe(select(selectFloorActionLoading));
		const routeSubscription =  this.activatedRoute.params.subscribe(params => {
			const id = params.id;
			if(id){
				this.store.pipe(select(selectFloorById(id))).subscribe(res => {
					if (res) {
						this.floor = res;
						this.oldFloor = Object.assign({}, this.floor);
						this.initFloor();
					}
				});

			}
		});
		this.subscriptions.push(routeSubscription);
	}
	
	initFloor(){
		this.createForm();
		this.loadBlockGroupList();
		this.loadBuildingList(this.floor.blk._id);
		this.loadBlockList(this.floor.blk.grpid._id);
		
	}
	createForm() {
		this.floorForm = this.floorFB.group({
			cdflr : [{value:this.floor.cdflr, disabled:true}],
			nmflr : [{value:this.floor.nmflr, disabled:true}],
			grpblk: [{value:this.floor.blk.grpid._id, disabled:true}],
			blk: [{value:this.floor.blk._id, disabled : true}],
		});
	}
	
	loadBlockGroupList() {
		this.selection.clear();
		const queryParams = new QueryParamsModel(
			null,
			"asc",
			null,
			1,
			1000
		);
		this.serviceBlkGrp.getListBlockGroup(queryParams).subscribe(
			res => {
				this.blockGroupResult = res.data;
				document.body.style.height = ""
				document.body.style.height = "101%"
				window.scrollTo(0, 10);
			}
		);
	}

	async loadBlockList(grpid) {
		this.selection.clear();
		const queryParams = new QueryBlockModel(
			null,
			"asc",
			null,
			1,
			1000
		);
		this.serviceBlk.findBlockByParent(grpid).subscribe(
			res => {
				this.blockResult = res.data;
				this.loadingForm = false;

				document.body.style.height = ""
				document.body.style.height = "101%"
				window.scrollTo(0, 5);
				
			}
		);
	}

	loadBuildingList(blkid){
		this.selection.clear();
		const queryParams = new QueryBuildingModel(
			null,
			"asc",
			null,
			1,
			1000
		);
		this.serviceBld.findBuildingByParent(blkid).subscribe(
			res => {
				this.buildingResult = res.data;

				document.body.style.height = ""
				document.body.style.height = "101%"
				window.scrollTo(0, 5);
			}
		);
	}
	goBackWithId() {
		const url = `/building`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}
	refreshFloor(isNew: boolean = false, id:string = "") {
		let url = this.router.url;
		if (!isNew) {
			this.router.navigate([url], { relativeTo: this.activatedRoute });
			return;
		}

		url = `/floor/edit/${id}`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}
	reset() {
		this.floor = Object.assign({}, this.oldFloor);
		this.createForm();
		this.hasFormErrors = false;
		this.floorForm.markAsPristine();
		this.floorForm.markAsUntouched();
		this.floorForm.updateValueAndValidity();
	}
	
	getComponentTitle() {
		let result = 'View Floor';
		return result;
	}

	blkChange(item){
		if(item){
			this.loadBuildingList(item);
			this.floorForm.controls.bld.enable();
		}
	}
	onAlertClose($event) {
		this.hasFormErrors = false;
	}
	ngOnDestroy(){
		this.subscriptions.forEach(sb => sb.unsubscribe());
	}

}
