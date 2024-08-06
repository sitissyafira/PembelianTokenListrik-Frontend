import { Component, OnInit, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BuildingModel } from '../../../../core/building/building.model';
import { ActivatedRoute, Router } from '@angular/router';
import { LayoutConfigService, SubheaderService } from '../../../../core/_base/layout';
import { BodyModel, LayoutUtilsService, MessageType, QueryParamsModel } from '../../../../core/_base/crud';
import { select, Store } from '@ngrx/store';
import { AppState } from '../../../../core/reducers';
import {
	selectUnitActionLoading,
	selectUnitById,
	selectLastCreatedUnitId
} from '../../../../core/unit/unit.selector';
import { Update } from '@ngrx/entity';
import { SelectionModel } from '@angular/cdk/collections';
import { QueryBlockModel } from '../../../../core/block/queryblock.model';
import { BlockService } from '../../../../core/block/block.service';
import { FloorModel } from '../../../../core/floor/floor.model';
import { BlockGroupService } from '../../../../core/blockgroup/blockgroup.service';
import { BuildingService } from '../../../../core/building/building.service';
import { FloorService } from '../../../../core/floor/floor.service';
import { QueryBuildingModel } from '../../../../core/building/querybuilding.model';
import { UnitUpdated } from '../../../../core/unit/unit.action';
import { UnitModel } from '../../../../core/unit/unit.model';
import { UnitService } from '../../../../core/unit/unit.service';
import { selectFloorActionLoading, selectFloorById } from '../../../../core/floor/floor.selector';
import { QueryFloorModel } from '../../../../core/floor/queryfloor.model';
import { FloorUpdated } from '../../../../core/floor/floor.action';
import { UnitTypeService } from '../../../../core/unittype/unittype.service';
import { UnitRateService } from '../../../../core/unitrate/unitrate.service';

@Component({
	selector: 'kt-view-unit',
	templateUrl: './view-unit.component.html',
	styleUrls: ['./view-unit.component.scss']
})
export class ViewUnitComponent implements OnInit, OnDestroy {
	unit: UnitModel;
	unitId$: Observable<string>;
	oldUnit: UnitModel;
	selectedTab = 0;
	loading$: Observable<boolean>;
	unitForm: FormGroup;
	selection = new SelectionModel<UnitModel>(true, []);
	hasFormErrors = false;
	unitRateResult: any[] = [];
	blockGroupResult: any[] = [];
	blockResult: any[] = [];
	buildingResult: any[] = [];
	floorResult: any[] = [];
	unitTypeResult: any[] = [];
	flrCode: String = undefined;
	blkCode: String = undefined;
	loadingForm: boolean
	// Private properties
	private subscriptions: Subscription[] = [];
	constructor(
		private activatedRoute: ActivatedRoute,
		private router: Router,
		private unitFB: FormBuilder,
		private subheaderService: SubheaderService,
		private layoutUtilsService: LayoutUtilsService,
		private store: Store<AppState>,
		private service: UnitService,
		private serviceUntRate: UnitRateService,
		private serviceFlr: FloorService,
		private serviceBlk: BlockService,
		private serviceBlkGrp: BlockGroupService,
		private serviceBld: BuildingService,
		private serviceUnttp: UnitTypeService,
		private layoutConfigService: LayoutConfigService
	) { }
	ngOnInit() {
		this.loadingForm = true
		this.loading$ = this.store.pipe(select(selectFloorActionLoading));
		const routeSubscription = this.activatedRoute.params.subscribe(params => {
			const id = params.id;
			if (id) {
				this.store.pipe(select(selectUnitById(id))).subscribe(res => {
					if (res) {
						this.unit = res;
						this.oldUnit = Object.assign({}, this.unit);
						this.initUnit();
					}
				});
			}
		});
		this.subscriptions.push(routeSubscription);
	}

	initUnit() {
		this.loadBlockGroupList();
		this.createForm();
		this.formChange();
	}


	createForm() {
		this.loadUnitType();
		if (this.unit.flr && this.unit.flr.blk && this.unit.flr.blk.grpid) {
			this.loadBlockList(this.unit.flr.blk.grpid._id);
		}
		if (this.unit.flr && this.unit.flr.blk) {
			this.loadFloorList(this.unit.flr.blk._id);
		}
		this.loadUnitRate();

		this.unitForm = this.unitFB.group({
			cdunt: [this.unit.cdunt ? this.unit.cdunt : undefined, Validators.required],
			nmunt: [this.unit.nmunt ? this.unit.nmunt : undefined, Validators.required],
			untnum: [this.unit.untnum ? this.unit.untnum : undefined, Validators.required],
			unttp: [this.unit.unttp ? this.unit.unttp._id : undefined, Validators.required],
			untsqr: [this.unit.untsqr ? this.unit.untsqr : undefined, Validators.required],
			untrt: [this.unit.untrt ? this.unit.untrt._id : undefined, Validators.required],
			sinkingfund: [this.unit.sinkingfund ? this.unit.sinkingfund : undefined],
			srvcrate: [this.unit.srvcrate ? this.unit.srvcrate : undefined, Validators.required],
			ovstyrate: [this.unit.ovstyrate ? this.unit.ovstyrate : undefined, Validators.required],
			grpblk: [this.unit.flr && this.unit.flr.blk && this.unit.flr.blk.grpid ? this.unit.flr.blk.grpid._id : undefined, Validators.required],
			price: [this.unit.price ? this.unit.price : undefined],
			rentalPrice: [this.unit.rentalPrice ? this.unit.rentalPrice : undefined],
			blk: [{ value: this.unit.flr && this.unit.flr.blk ? this.unit.flr.blk._id : undefined, disabled: false }, Validators.required],
			flr: [{ value: this.unit.flr ? this.unit.flr._id : undefined, disabled: false }, Validators.required],
			isChild: [this.unit.isChild ? this.unit.isChild : undefined],
			isSewa: [this.unit.isSewa ? this.unit.isSewa : undefined],
			periodeBill: [{ value: this.unit.periodeBill, disabled: true }]
		});

		this.unitForm.disable();
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


			}

		);
	}

	loadBlockList(grpid) {
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

			}
		);
	}
	loadBuildingList(blkid) {
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
			}
		);
	}
	loadFloorList(bldid) {
		this.selection.clear();
		const queryParams = new QueryFloorModel(
			null,
			"asc",
			null,
			1,
			1000
		);
		this.serviceFlr.findFloorByParent(bldid).subscribe(
			res => {
				this.floorResult = res.data;
			}
		);
	}

	loadUnitType() {
		this.selection.clear();
		const queryParams = new QueryParamsModel(
			null,
			"asc",
			null,
			1,
			1000
		);
		this.serviceUnttp.getListUnitType(queryParams).subscribe(
			res => {
				this.unitTypeResult = res.data;
				this.loadingForm = false

				document.body.style.height = ""
				document.body.style.height = "101%"
				window.scrollTo(0, 5);
			}
		);
	}

	loadUnitRate() {
		this.selection.clear();
		const queryParams = new QueryParamsModel(
			null,
			"asc",
			null,
			1,
			1000
		);
		this.serviceUntRate.getListUnitRate(queryParams).subscribe(
			res => {
				this.unitRateResult = res.data;
				this.loadingForm = false

				document.body.style.height = ""
				document.body.style.height = "101%"
				window.scrollTo(0, 5);
			}
		);
	}


	blockgroupChange(item) {
		if (item) {
			this.loadBlockList(item);
			this.unitForm.controls.blk.enable();
		}
	};
	blkChange(item) {
		if (item) {
			this.loadFloorList(item);
			this.unitForm.controls.flr.enable();
		}
	}
	bldChange(item) {
		if (item) {
			this.loadFloorList(item);
			this.unitForm.controls.flr.enable();
		}
	}


	getUnitType(id) {
		if (id) {
			this.serviceUnttp.findUnitTypeById(id).subscribe(
				res => {
					var data = res.data;
					this.unitForm.controls.untsqr.setValue(data.untsqr);
					// this.unitForm.controls.untlen.setValue(data.untlen);
					// this.unitForm.controls.untwid.setValue(data.untwid);
				}
			);
		}
	}

	getUnitRate(id) {
		if (id) {
			this.serviceUntRate.findUnitRateById(id).subscribe(
				res => {
					var data = res.data;
					this.unitForm.controls.sinkingfund.setValue(data.sinking_fund);
					this.unitForm.controls.srvcrate.setValue(data.service_rate);
					this.unitForm.controls.ovstyrate.setValue(data.overstay_rate);
					this.unitForm.controls.price.setValue(data.rentPrice);
					this.changeRental()
				}
			);
		}
	}

	changeRental() {
		const size = this.unitForm.controls.untsqr.value;
		const price = this.unitForm.controls.price.value;
		if (size !== 0 && price !== 0) {
			this.unitForm.controls.rentalPrice.setValue(
				(size * price)
			);
		}
	}
	goBackWithId() {
		const url = `/unit`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}
	refreshUnit(isNew: boolean = false, id: string = "") {
		let url = this.router.url;
		if (!isNew) {
			this.router.navigate([url], { relativeTo: this.activatedRoute });
			return;
		}

		url = `/unit/edit/${id}`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}

	getComponentTitle() {
		let result = 'View Unit';

		return result;
	}
	onAlertClose($event) {
		this.hasFormErrors = false;
	}
	ngOnDestroy() {
		this.subscriptions.forEach(sb => sb.unsubscribe());
	}

	formChange() {
		this.unitForm.valueChanges.subscribe(data => {
			if ('blk' in data) {
				if (data.blk != "") {
					//console.log(data.blk);
					this.serviceBlk.findBlockByIdPlain(data.blk).subscribe(value => {
						this.setCodeBlock(value.data.cdblk);
					});
				}
			}
			if ('flr' in data) {
				if (data.flr != "") {
					//console.log(data.flr);
					this.serviceFlr.findFloorByIdPlain(data.flr).subscribe(value => {
						this.setCodeFloor(value.data.cdflr);
					});
				}
			}
		});
	}

	setCodeBlock(value) {
		return this.blkCode = value;
	}
	setCodeFloor(value) {
		return this.flrCode = value;
	}
	getCodeFlr() {
		return this.flrCode;
	}
	getCodeBlk() {
		return this.blkCode;
	}

	getCode(blkid: string, flrid: string) {
		return new Promise(async (resolve, reject) => {
			await this.serviceBlk.findBlockByIdPlain(blkid).subscribe(value => {
				this.setCodeBlock(value.data.cdblk);
			});
			await this.serviceFlr.findFloorByIdPlain(flrid).subscribe(value => {
				this.setCodeFloor(value.data.cdflr);
			});
			return resolve;
		});

	}

	generateCode() {
		const unitNumber = this.unitForm.controls.untnum.value;
		if (unitNumber != "") {
			// this.unitForm.controls.cdunt.setValue(unitNumber);
			this.unitForm.controls.cdunt.setValue(`${this.getCodeFlr()}/${unitNumber} ${this.getCodeBlk()}`);
		}
	}

	// generateCode() {
	// 	if (this.unitForm.controls.untnum.value !== "" && this.unitForm.controls.flr.value !== "" && this.unitForm.controls.blk.value !== "") {
	// 		this.unitForm.controls.cdunt.setValue(`${this.getCodeFlr()}/${this.unitForm.controls.untnum.value} ${this.getCodeBlk()}`);
	// 	} else {
	// 		this.layoutUtilsService.showActionNotification("Please fill unit number, floor, block value", MessageType.Create, 2000, true, false);
	// 	}

	// }

}
