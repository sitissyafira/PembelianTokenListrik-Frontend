import { Component, OnInit, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
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
	selector: 'kt-edit-unit',
	templateUrl: './edit-unit.component.html',
	styleUrls: ['./edit-unit.component.scss']
})
export class EditUnitComponent implements OnInit, OnDestroy {
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
	loading: boolean = false

	periodeBillingForm = new FormControl()

	periodeBill: any[] = [
		{
			name: "Monthly",
			value: 'monthly'
		},
		{
			name: "Daily",
			value: 'daily'
		}
	]
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
						this.periodeBillingForm.setValue(res.periodeBill)
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
			pwrmtr: [this.unit.pwrmtr ? this.unit.pwrmtr : undefined],
			wtrmtr: [this.unit.wtrmtr ? this.unit.wtrmtr : undefined],
			type: [this.unit.type ? this.unit.type : undefined],
			rentalPrice: [this.unit.rentalPrice ? this.unit.rentalPrice : undefined],
			blk: [{ value: this.unit.flr && this.unit.flr.blk ? this.unit.flr.blk._id : undefined, disabled: false }, Validators.required],
			flr: [{ value: this.unit.flr ? this.unit.flr._id : undefined, disabled: false }, Validators.required],
			isChild: [this.unit.isChild ? this.unit.isChild : undefined],
			isSewa: [this.unit.isSewa ? this.unit.isSewa : undefined],
		});
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

	clickPeriodeBill(val) {
		this.periodeBillingForm.setValue(val.value)
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
				window.scrollTo(0, 10);
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

	toggleChild(event) {
		if (event.checked) {
			this.unitForm.controls.isChild.setValue(true);
		} else {
			this.unitForm.controls.isChild.setValue(false);
		}
	}
	toggleSewa(event) {
		if (event.checked) {
			this.unitForm.controls.isSewa.setValue(true);
		} else {
			this.unitForm.controls.isSewa.setValue(false);
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


	onSubmit(withBack: boolean = false) {
		this.hasFormErrors = false;
		const controls = this.unitForm.controls;
		/** check form */
		if (this.unitForm.invalid) {
			Object.keys(controls).forEach(controlName =>
				controls[controlName].markAsTouched()
			);

			this.hasFormErrors = true;
			this.selectedTab = 0;
			return;
		}

		this.loading = true
		const preparedUnit = this.prepareUnit();
		this.updateUnit(preparedUnit, withBack);
	}
	prepareUnit(): UnitModel {
		const controls = this.unitForm.controls;
		const _unit = new UnitModel();
		_unit.clear();
		_unit._id = this.unit._id;
		_unit.cdunt = controls.cdunt.value.toUpperCase();
		_unit.nmunt = controls.nmunt.value.toLowerCase();
		_unit.untnum = controls.untnum.value;
		_unit.unttp = controls.unttp.value.toLowerCase();
		_unit.untrt = controls.untrt.value.toLowerCase();
		_unit.untnum = controls.untnum.value;
		_unit.untsqr = controls.untsqr.value;
		_unit.type = controls.type.value;
		_unit.sinkingfund = controls.sinkingfund.value;
		_unit.srvcrate = controls.srvcrate.value;
		_unit.ovstyrate = controls.ovstyrate.value;
		_unit.flr = controls.flr.value;
		_unit.price = controls.price.value;
		_unit.rentalPrice = controls.rentalPrice.value;
		_unit.isChild = controls.isChild.value;
		_unit.isSewa = controls.isSewa.value;
		_unit.periodeBill = this.periodeBillingForm.value
		return _unit;
	}
	updateUnit(_unit: UnitModel, withBack: boolean = false) {
		// tslint:disable-next-line:prefer-const
		const editSubscription = this.service.updateUnit(_unit).subscribe(
			res => {
				const message = `Unit successfully has been saved.`;
				this.layoutUtilsService.showActionNotification(message, MessageType.Update, 5000, true, true);
				const url = `/unit`;
				this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
			},
			err => {
				console.error(err);
				const message = 'Error while saving unit | ' + err.statusText;
				this.layoutUtilsService.showActionNotification(message, MessageType.Create, 5000, true, false);
			}
		);
		this.subscriptions.push(editSubscription);
	}
	getComponentTitle() {
		let result = 'Edit Unit';

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
						this.blkCode = value.data.cdblk;
					});
				}
			}
			if ('flr' in data) {
				if (data.flr != "") {
					//console.log(data.flr);
					this.serviceFlr.findFloorByIdPlain(data.flr).subscribe(value => {
						let str = value.data.cdflr;
						// str = str.slice(0, -1);
						this.flrCode = str;
					});
				}
			}
		});
	}

	// setCodeBlock(value) {
	// 	return this.blkCode = value;
	// }
	// setCodeFloor(value) {
	// 	let str = value
	// 	str = str.slice(0, -1);


	// 	return this.flrCode = str;
	// }
	// getCodeFlr() {
	// 	return this.flrCode;
	// }
	// getCodeBlk() {
	// 	return this.blkCode;
	// }

	getCode(blkid: string, flrid: string) {
		return new Promise(async (resolve, reject) => {
			await this.serviceBlk.findBlockByIdPlain(blkid).subscribe(value => {
				this.blkCode = value.data.cdblk;
			});
			await this.serviceFlr.findFloorByIdPlain(flrid).subscribe(value => {
				let str = value.data.cdflr;
				// str = str.slice(0, -1);
				this.flrCode = str;
			});
			return resolve;
		});
	}

	generateCode() {
		const unitNumber = this.unitForm.controls.untnum.value;
		if (unitNumber != "") {
			// const unitCode = `${this.blkCode.toUpperCase()}${this.flrCode}${unitNumber}`
			const nameProject = 'PBM', tower = this.blkCode, floor = this.flrCode, numberCode = unitNumber

			const unitCode = `${tower}-${floor}-${numberCode}`

			// this.unitForm.controls.cdunt.setValue(`${this.getCodeFlr().toUpperCase()}/${unitNumber} ${this.getCodeBlk().toUpperCase()}`);
			this.unitForm.controls.cdunt.setValue(`${unitCode.toUpperCase()}`);
		}
	}

	// generateCode() {
	// 	if (this.unitForm.controls.untnum.value !== "" && this.unitForm.controls.flr.value !== "" && this.unitForm.controls.blk.value !== "") {
	// 		this.unitForm.controls.cdunt.setValue(`${this.getCodeFlr()}/${this.unitForm.controls.untnum.value} ${this.getCodeBlk()}`);
	// 	} else {
	// 		this.layoutUtilsService.showActionNotification("Please fill unit number, floor, block value", MessageType.Create, 2000, true, false);
	// 	}

	// }

	inputKeydownHandler(event) {
		return event.keyCode === 8 || event.keyCode === 46 ? true : !isNaN(Number(event.key)) || event.key === '.';
	}
}
