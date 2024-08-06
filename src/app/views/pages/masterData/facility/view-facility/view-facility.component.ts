import {Component, OnDestroy, OnInit} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { BehaviorSubject, Observable, of, Subscription } from 'rxjs';
import { Store, select } from '@ngrx/store';
import { Update } from '@ngrx/entity';
import { AppState } from '../../../../../core/reducers';
import { SubheaderService, LayoutConfigService } from '../../../../../core/_base/layout';
import { LayoutUtilsService, MessageType } from '../../../../../core/_base/crud';
import { SelectionModel } from '@angular/cdk/collections';
import { FacilityModel } from '../../../../../core/masterData/facility/facility.model';
import { FacilityService } from '../../../../../core/masterData/facility/facility.service';
import { selectFacilityActionLoading, selectFacilityById } from '../../../../../core/masterData/facility/facility.selector';
import { QueryBlockModel } from '../../../../../core/block/queryblock.model';
import { BlockService } from '../../../../../core/block/block.service';
import { QueryFloorModel } from '../../../../../core/floor/queryfloor.model';
import { FloorService } from '../../../../../core/floor/floor.service';


@Component({
  selector: 'kt-view-facility',
  templateUrl: './view-facility.component.html',
  styleUrls: ['./view-facility.component.scss']
})
export class ViewFacilityComponent implements OnInit, OnDestroy {
	facility: FacilityModel;
	FacilityId$: Observable<string>;
	oldFacility: FacilityModel;
	selectedTab = 0;
	loading$: Observable<boolean>;
	facilityForm: FormGroup;
	hasFormErrors = false;
	loading : boolean = false;
	datauser = localStorage.getItem("user");
	date1 = new FormControl(new Date());
	selection = new SelectionModel<FacilityModel>(true, []);
	blockResult: any[] = [];
	floorResult: any[] = [];

	private subscriptions: Subscription[] = [];
  	constructor(
		private activatedRoute: ActivatedRoute,
		private router: Router,
		private facilityFB: FormBuilder,
		private subheaderService: SubheaderService,
		private layoutUtilsService: LayoutUtilsService,
		private store: Store<AppState>,
		private service: FacilityService,
		private blockService: BlockService,
		private floorService : FloorService,
		private layoutConfigService: LayoutConfigService
	) { }

  	ngOnInit() {
		this.loading$ = this.store.pipe(select(selectFacilityActionLoading));
		const routeSubscription =  this.activatedRoute.params.subscribe(params => {
			const id = params.id;
			if (id) {
				this.store.pipe(select(selectFacilityById(id))).subscribe(res => {
					if (res) {
						this.facility = res;
						console.log(res);
						this.oldFacility = Object.assign({}, this.facility);
						this.initFacility();
					}
				});
			}
		});
		this.subscriptions.push(routeSubscription);
  	}

	initFacility() {
		this.createForm();
		this.loadBlock();
		this.loadFloorList(this.facility.blockCode._id);
	}

	createForm() {
		this.facilityForm = this.facilityFB.group({
			blockCode : [{value:this.facility.blockCode._id, disabled:true}],
			floorName: [{value:this.facility.floorName._id, disabled:true}],
			facilityCode : [{value:this.facility.facilityCode, disabled:true}],
			facilityNo : [{value:this.facility.facilityNo, disabled:true}],
			facilityName: [{value:this.facility.facilityName, disabled:true}],
			remarks: [{value:this.facility.remarks, disabled:true}],
			createdBy: [this.facility.createdBy],
			createdDate: [this.facility.createdDate],
			updateBy : [this.datauser],
		});
	}

	loadBlock(){
		this.selection.clear();
		const queryParams = new QueryBlockModel(
			null,
			"",
			"",
			1,
			10
		);
		this.blockService.getListBlock(queryParams).subscribe(
			res => {
				this.blockResult = res.data;
			}
		);
	}

	blockCodeChange(item){
		if(item){
			this.loadFloorList(item);
			this.facilityForm.controls.floorName.enable();
		}
	}

	loadFloorList(blkid){
		this.selection.clear();
		const queryParams = new QueryFloorModel(
			null,
			"asc",
			null,
			1,
			10
		);
		this.floorService.findFloorByParent(blkid).subscribe(
			res => {
				this.floorResult = res.data;
			}
		);
	}

	goBackWithId() {
		const url = `/facility`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}

	refreshFacility(isNew: boolean = false, id:string = "") {
		let url = this.router.url;
		if (!isNew) {
			this.router.navigate([url], { relativeTo: this.activatedRoute });
			return;
		}

		url = `/facility/view/${id}`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}

	getComponentTitle() {
		let result = `View Facility`;
		return result;
	}

	onAlertClose($event) {
		this.hasFormErrors = false;
	}

  	ngOnDestroy() {
		this.subscriptions.forEach(sb => sb.unsubscribe());
	}
	
}
