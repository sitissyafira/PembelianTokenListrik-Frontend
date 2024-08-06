import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Observable, Subscription } from 'rxjs';
import { Store, select } from '@ngrx/store';
import { AppState } from '../../../../../../core/reducers';
import { SubheaderService, LayoutConfigService } from '../../../../../../core/_base/layout';
import { LayoutUtilsService, MessageType } from '../../../../../../core/_base/crud';
import { ComTWaterModel } from "../../../../../../core/commersil/master/comTWater/comTWater.model";
import {
	selectComTWaterActionLoading,
	selectComTWaterById,
} from "../../../../../../core/commersil/master/comTWater/comTWater.selector";
import { ComTWaterService } from '../../../../../../core/commersil/master/comTWater/comTWater.service';
import { SelectionModel } from '@angular/cdk/collections';
import { QueryComWaterModel } from '../../../../../../core/commersil/master/comWater/querycomWater.model';
import { ComWaterService } from '../../../../../../core/commersil/master/comWater/comWater.service';




@Component({
	selector: 'kt-edit-comTWater',
	templateUrl: './edit-comTWater.component.html',
	styleUrls: ['./edit-comTWater.component.scss']
})
export class EditComTWaterComponent implements OnInit, OnDestroy {
	datauser = localStorage.getItem("user");
	comTWater: ComTWaterModel;
	ComTWaterId$: Observable<string>;
	selection = new SelectionModel<ComTWaterModel>(true, []);
	oldComTWater: ComTWaterModel;
	selectedTab = 0;
	loading$: Observable<boolean>;
	comTWaterForm: FormGroup;
	hasFormErrors = false;
	loading: boolean = false;
	waterMeter: any[] = [];
	date1 = new FormControl(new Date());
	waterListResultFiltered = [];
	viewWaterMeterResult = new FormControl();
	private loadingData = {
		Meter: false,
	}


	private subscriptions: Subscription[] = [];
	constructor(
		private activatedRoute: ActivatedRoute,
		private router: Router,
		private comTWaterFB: FormBuilder,
		private subheaderService: SubheaderService,
		private layoutUtilsService: LayoutUtilsService,
		private store: Store<AppState>,
		private service: ComTWaterService,
		private serviceMWater: ComWaterService,
		private cd: ChangeDetectorRef,
		private layoutConfigService: LayoutConfigService
	) { }

	ngOnInit() {
		this.loading$ = this.store.pipe(select(selectComTWaterActionLoading));
		const routeSubscription = this.activatedRoute.params.subscribe(params => {
			const id = params.id;
			if (id) {
				this.store.pipe(select(selectComTWaterById(id))).subscribe(res => {
					if (res) {
						this.comTWater = res;
						this.oldComTWater = Object.assign({}, this.comTWater);
						this.initComTWater();
						console.log(res)


						this.viewWaterMeterResult.setValue(`${res.wat.nmmtr} - ${res.wat.unitCode}`);
						this._filterPowerList(`${res.wat.nmmtr} - ${res.wat.unitCode}`);
						this.viewWaterMeterResult.disable();

					}
				});
			}
		});
		this.subscriptions.push(routeSubscription);
	}

	initComTWater() {
		this.createForm();
		this.loadMeterList();
	}

	createForm() {
		this.comTWaterForm = this.comTWaterFB.group({
			date: [this.comTWater.date],
			wat: [this.comTWater.wat],
			rate: [{ value: this.comTWater.wat.rte.nmrtewtr, disabled: true }],
			watname: [{ value: this.comTWater.watname, disabled: true }],
			unit: [{ value: this.comTWater.unit, disabled: true }],
			strtpos: [{ value: this.comTWater.strtpos, disabled: false }],
			endpos: [{ value: this.comTWater.endpos, disabled: false }],
			waterManagement: [{ value: this.comTWater.waterManagement, disabled: true }],
			strtpos2: [{ value: this.comTWater.strtpos2, disabled: true }],
			endpos2: [{ value: this.comTWater.endpos2, disabled: true }],
			isPosting: [this.comTWater.isPosting],
			created_date: [this.comTWater.created_date],
			created_by: [this.comTWater.created_by],
		});
	}

	goBackWithId() {
		const url = `/comTWater`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}
	refreshComTWater(isNew: boolean = false, id: string = "") {
		let url = this.router.url;
		if (!isNew) {
			this.router.navigate([url], { relativeTo: this.activatedRoute });
			return;
		}
		url = `/comTWater/edit/${id}`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}
	onSubmit(withBack: boolean = false) {
		this.hasFormErrors = false;
		const controls = this.comTWaterForm.controls;
		if (this.comTWaterForm.invalid) {
			Object.keys(controls).forEach(controlName =>
				controls[controlName].markAsTouched()
			);

			this.hasFormErrors = true;
			this.selectedTab = 0;
			return;
		}

		this.loading = true;
		const editedComTWater = this.prepareComTWater();
		this.updateComTWater(editedComTWater, withBack);
	}

	prepareComTWater(): ComTWaterModel {
		const controls = this.comTWaterForm.controls;
		const _comTWater = new ComTWaterModel();
		_comTWater.clear();
		_comTWater._id = this.comTWater._id;
		_comTWater.date = controls.date.value;
		_comTWater.wat = controls.wat.value;
		_comTWater.watname = controls.watname.value;
		_comTWater.unit = controls.unit.value;
		_comTWater.strtpos = controls.strtpos.value;
		_comTWater.endpos = controls.endpos.value;
		_comTWater.strtpos2 = controls.strtpos2.value;
		_comTWater.endpos2 = controls.endpos2.value;
		_comTWater.waterManagement = controls.waterManagement.value;
		_comTWater.isPosting = controls.isPosting.value;
		_comTWater.created_date = controls.created_date.value;
		_comTWater.created_by = controls.created_by.value;
		return _comTWater;
	}

	updateComTWater(_comTWater: ComTWaterModel, withBack: boolean = false) {
		const addSubscription = this.service.updateComTWater(_comTWater).subscribe(
			res => {
				const message = `Product successfully has been saved.`;
				this.layoutUtilsService.showActionNotification(message, MessageType.Update, 5000, true, true);
				const url = `/comTWater`;
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

	changeMeterPost() {
		const strtpos = this.comTWaterForm.controls.strtpos.value / 1000;
		if (strtpos !== 0) {
			this.comTWaterForm.controls.strtpos2.setValue(
				strtpos);
		} else {
			this.comTWaterForm.controls.strtpos2.setValue(
				0);

		}
		const endpos = this.comTWaterForm.controls.endpos.value / 1000;
		if (endpos !== 0) {
			this.comTWaterForm.controls.endpos2.setValue(
				endpos);
		} else {
			this.comTWaterForm.controls.endpos2.setValue(
				0);

		}
	}



	/**
* @param value
*/
	_setPowerValue(value) {
		this.comTWaterForm.patchValue({ pow: value._id });
		// this.changePowerMeter(value._id);
	}

	_onKeyup(e: any) {
		this.comTWaterForm.patchValue({ pow: undefined });
		this._filterPowerList(e.target.value);
	}

	_filterPowerList(text: string) {
		this.waterListResultFiltered = this.waterMeter.filter(i => {
			const filterText = `${i.nmmtr} - ${i.unitCode.toLocaleLowerCase()}`;
			if (filterText.includes(text.toLocaleLowerCase())) return i;

		});
	}

	loadMeterList() {
		// this.loadingData.Meter = true
		this.selection.clear();
		const queryParams = new QueryComWaterModel(
			null,
			1,
			10000
		);
		this.serviceMWater.getListComWaterForTransaction(queryParams).subscribe((res) => {
			this.waterMeter = res.data;
			this.waterListResultFiltered = this.waterMeter.slice();
			this.cd.markForCheck();
			this.viewWaterMeterResult.disable();
			// this.loadingData.Meter = false
		});
	}

}
