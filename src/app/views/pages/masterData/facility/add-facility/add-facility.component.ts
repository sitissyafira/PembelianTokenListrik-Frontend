import {Component, OnDestroy, OnInit} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
// RxJS
import { BehaviorSubject, Observable, of, Subscription } from 'rxjs';
// NGRX
import { Store, select } from '@ngrx/store';
import { Update } from '@ngrx/entity';
import { AppState } from '../../../../../core/reducers';
// Layout
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
  selector: 'kt-add-facility',
  templateUrl: './add-facility.component.html',
  styleUrls: ['./add-facility.component.scss']
})
export class AddFacilityComponent implements OnInit, OnDestroy {
	// Public properties
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
						this.oldFacility = Object.assign({}, this.facility);
						this.initFacility();
					}
				});
			} else {
				this.facility = new FacilityModel();
				this.facility.clear();
				this.initFacility();
			}
		});
		this.subscriptions.push(routeSubscription);
  	}

	initFacility() {
		this.createForm();
		this.loadBlock();
	}

	createForm() {
		this.facilityForm = this.facilityFB.group({
			// project_name : [""],
			blockCode : [""],
			floorName: [{value:"", disabled:true}],
			facilityCode : [""],
			facilityNo : [""],
			facilityName: [""],
			remarks: [""],
			createdBy: [this.datauser],
			createdDate: [{value:this.date1.value, disabled:true}],
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

		url = `/facility/edit/${id}`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}


	onSubmit(withBack: boolean = false) {
		this.hasFormErrors = false;
		const controls = this.facilityForm.controls;

		if (this.facilityForm.invalid) {
			Object.keys(controls).forEach(controlName =>
				controls[controlName].markAsTouched()
			);

			this.hasFormErrors = true;
			this.selectedTab = 0;
			return;
		}
		this.loading = true;
		const editedFacility = this.prepareFacility();
		this.addFacility(editedFacility, withBack);
	}
	prepareFacility(): FacilityModel {
		const controls = this.facilityForm.controls;
		const _facility = new FacilityModel();
		_facility.clear();
		_facility._id = this.facility._id;
		_facility.blockCode = controls.blockCode.value;
		_facility.floorName = controls.floorName.value;
		_facility.facilityName = controls.facilityName.value.toLowerCase();
		_facility.facilityNo = controls.facilityNo.value;
		_facility.facilityCode = controls.facilityCode.value;
		_facility.remarks = controls.remarks.value;
		_facility.createdBy = controls.createdBy.value;
		_facility.createdDate = controls.createdDate.value;
		_facility.remarks = controls.remarks.value;
		return _facility;
	}

	addFacility( _facility: FacilityModel, withBack: boolean = false) {
		const addSubscription = this.service.createFacility(_facility).subscribe(
			res => {
				const message = `New facility successfully has been added.`;
				this.layoutUtilsService.showActionNotification(message, MessageType.Create, 5000, true, true);
				const url = `/facility`;
				this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
			},
			err => {
				console.error(err);
				const message = 'Error while adding facility | ' + err.statusText;
				this.layoutUtilsService.showActionNotification(message, MessageType.Create, 5000, true, false);
			}
		);
		this.subscriptions.push(addSubscription);
	}

	getComponentTitle() {
		let result = 'Create Facility';
		return result;
	}

	onAlertClose($event) {
		this.hasFormErrors = false;
	}

  	ngOnDestroy() {
		this.subscriptions.forEach(sb => sb.unsubscribe());
	}
	
}
