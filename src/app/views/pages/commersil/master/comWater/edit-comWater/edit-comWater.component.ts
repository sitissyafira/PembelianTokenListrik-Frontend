import {ChangeDetectorRef, Component, OnDestroy, OnInit} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Observable, Subscription } from 'rxjs';
import { Store, select } from '@ngrx/store';
import { AppState } from '../../../../../../core/reducers';
import { SubheaderService, LayoutConfigService } from '../../../../../../core/_base/layout';
import { LayoutUtilsService, MessageType } from '../../../../../../core/_base/crud';
import {ComWaterModel} from "../../../../../../core/commersil/master/comWater/comWater.model";
import {
	selectComWaterActionLoading,
	selectComWaterById,
} from "../../../../../../core/commersil/master/comWater/comWater.selector";
import {ComWaterService} from '../../../../../../core/commersil/master/comWater/comWater.service';
import { SelectionModel } from '@angular/cdk/collections';
import { ComUnitService } from '../../../../../../core/commersil/master/comUnit/comUnit.service';
import { QueryComUnitModel } from '../../../../../../core/commersil/master/comUnit/querycomUnit.model';
import { WaterRateService } from '../../../../../../core/water/rate/rate.service';
import { QueryWaterRateModel } from '../../../../../../core/water/rate/queryrate.model';


@Component({
  selector: 'kt-edit-comWater',
  templateUrl: './edit-comWater.component.html',
  styleUrls: ['./edit-comWater.component.scss']
})
export class EditComWaterComponent implements OnInit, OnDestroy {
	datauser = localStorage.getItem("user");
	comWater: ComWaterModel;
	comWaterId$: Observable<string>;
	selection = new SelectionModel<ComWaterModel>(true, []);
	oldcomWater: ComWaterModel;
	selectedTab = 0;
	loading$: Observable<boolean>;
	comWaterForm: FormGroup;
	hasFormErrors = false;
	loading : boolean = false;
	unitResult: any[] = [];
	waterRateResult: any[] = [];
	date1 = new FormControl(new Date());

	UnitResultFiltered = [];
	viewUnitResult = new FormControl();


	private subscriptions: Subscription[] = [];
  	constructor(
		private activatedRoute: ActivatedRoute,
		private router: Router,
		private comWaterFB: FormBuilder,
		private subheaderService: SubheaderService,
		private layoutUtilsService: LayoutUtilsService,
		private store: Store<AppState>,
		private service: ComWaterService,
		private unitService : ComUnitService,
		private waterRateService : WaterRateService,
		private cd: ChangeDetectorRef,
		private layoutConfigService: LayoutConfigService
	) { }

  	ngOnInit() {
		this.loading$ = this.store.pipe(select(selectComWaterActionLoading));
		const routeSubscription =  this.activatedRoute.params.subscribe(params => {
			const id = params.id;
			if (id) {
				this.store.pipe(select(selectComWaterById(id))).subscribe(res => {
					if (res) {
						this.comWater = res;
						this.oldcomWater = Object.assign({}, this.comWater);
						this.initcomWater();

						this.viewUnitResult.setValue(`${res.unitCommersil.cdunt}`);
						this._filterList(`${res.unitCommersil.cdunt}`);
					}
				});
			}
		});
		this.subscriptions.push(routeSubscription);
  	}

	initcomWater() {
		this.createForm();
		this.loadUnitList();
		this.loadRateList();
	}

	createForm() {
			this.comWaterForm = this.comWaterFB.group({
				nmmtr : [{value:this.comWater.nmmtr, disabled:false}],
				unitCommersil : [this.comWater.unitCommersil],
				unitCode : [this.comWater.unitCode],
				rte : [{value:this.comWater.rte._id, disabled:false}],
				remark : [{value:this.comWater.remark, disabled:false}],

				created_date : [this.comWater.created_date],
				created_by: [this.comWater.created_by],
			});
	}



/**
	 * @param value
	 */
 _setUnitValue(value) {
	this.comWaterForm.patchValue({ unitCommersil: value._id });
	this.getUnit(value._id);
}

_onKeyup(e: any) {
	this.comWaterForm.patchValue({ unitCommersil: undefined });
	this._filterList(e.target.value);
}

_filterList(text: string) {
	this.UnitResultFiltered = this.unitResult.filter(i => {
		const filterText = `${i.cdunt.toLocaleLowerCase()}`;
		if(filterText.includes(text.toLocaleLowerCase())) return i;
	});
}

loadUnitList() {
	this.selection.clear();
	const queryParams = new QueryComUnitModel(
		null,
		1,
		100000
	);
	this.unitService.getListUnitForPower(queryParams).subscribe(
		res => {
			this.unitResult = res.data;
			this.UnitResultFiltered = this.unitResult.slice();
			this.cd.markForCheck();
			this.viewUnitResult.disable();
		}
	);
}

getUnit(id){
	const controls = this.comWaterForm.controls;
	this.unitService.findComUnitById(id).subscribe(data => {
		controls.unitCode.setValue(data.data.cdunt)
	});
}

loadRateList(){
	this.selection.clear();
	const queryParams = new QueryWaterRateModel(
		null,
		"asc",
		null,
		1,
		100000
	);
	this.waterRateService.getListWaterRate(queryParams).subscribe(
		res => {
			this.waterRateResult = res.data;
		}
	);
}

	goBackWithId() {
		const url = `/comWater`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}
	refreshcomWater(isNew: boolean = false, id:string = "") {
		let url = this.router.url;
		if (!isNew) {
			this.router.navigate([url], { relativeTo: this.activatedRoute });
			return;
		}
		url = `/comWater/edit/${id}`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}
	onSubmit(withBack: boolean = false) {
		this.hasFormErrors = false;
		const controls = this.comWaterForm.controls;
		if (this.comWaterForm.invalid) {
			Object.keys(controls).forEach(controlName =>
				controls[controlName].markAsTouched()
			);

			this.hasFormErrors = true;
			this.selectedTab = 0;
			return;
		}

		this.loading = true;
		const editedcomWater = this.preparecomWater();
		this.updatecomWater(editedcomWater, withBack);
	}

	preparecomWater(): ComWaterModel {
		const controls = this.comWaterForm.controls;
		const _comWater = new ComWaterModel();
		_comWater.clear();
		_comWater._id = this.comWater._id;
		_comWater.nmmtr = controls.nmmtr.value;
		_comWater.unitCommersil = controls.unitCommersil.value;
		_comWater.unitCode = controls.unitCode.value.toLowerCase();
		_comWater.rte = controls.rte.value;
		_comWater.remark = controls.remark.value;
		_comWater.created_date = controls.created_date.value;
		_comWater.created_by = controls.created_by.value;
		return _comWater;
	}

	updatecomWater(_comWater: ComWaterModel, withBack: boolean = false) {
		const addSubscription = this.service.updateComWater(_comWater).subscribe(
			res => {
				const message = `Product successfully has been saved.`;
				this.layoutUtilsService.showActionNotification(message, MessageType.Update, 5000, true, true);
				const url = `/comWater`;
				this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
			},
			err => {
				console.error(err);
				const message = 'Error while adding Product | ' + err.statusText;
				this.layoutUtilsService.showActionNotification(message, MessageType.Update, 5000, true, false);
			}
		);
		this.subscriptions.push(addSubscription);
	}

	getComponentTitle() {
		let result = `Edit Commercial Type`;
		return result;
	}

	onAlertClose($event) {
		this.hasFormErrors = false;
	}

  	ngOnDestroy() {
		this.subscriptions.forEach(sb => sb.unsubscribe());
	}
}
