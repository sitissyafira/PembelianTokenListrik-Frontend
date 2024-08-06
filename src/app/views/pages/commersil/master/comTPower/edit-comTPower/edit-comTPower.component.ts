import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Observable, Subscription } from 'rxjs';
import { Store, select } from '@ngrx/store';
import { AppState } from '../../../../../../core/reducers';
import { SubheaderService, LayoutConfigService } from '../../../../../../core/_base/layout';
import { LayoutUtilsService, MessageType } from '../../../../../../core/_base/crud';
import { ComTPowerModel } from "../../../../../../core/commersil/master/comTPower/comTPower.model";
import {
	selectComTPowerActionLoading,
	selectComTPowerById,
} from "../../../../../../core/commersil/master/comTPower/comTPower.selector";
import { ComTPowerService } from '../../../../../../core/commersil/master/comTPower/comTPower.service';
import { SelectionModel } from '@angular/cdk/collections';
import { QueryComPowerModel } from '../../../../../../core/commersil/master/comPower/querycomPower.model';
import { ComPowerService } from '../../../../../../core/commersil/master/comPower/comPower.service';




@Component({
	selector: 'kt-edit-comTPower',
	templateUrl: './edit-comTPower.component.html',
	styleUrls: ['./edit-comTPower.component.scss']
})
export class EditComTPowerComponent implements OnInit, OnDestroy {
	datauser = localStorage.getItem("user");
	comTPower: ComTPowerModel;
	ComTPowerId$: Observable<string>;
	selection = new SelectionModel<ComTPowerModel>(true, []);
	oldComTPower: ComTPowerModel;
	selectedTab = 0;
	loading$: Observable<boolean>;
	comTPowerForm: FormGroup;
	hasFormErrors = false;
	loading: boolean = false;
	powerMeter: any[] = [];
	date1 = new FormControl(new Date());

	powerListResultFiltered = [];
	viewPowerMeterResult = new FormControl();
	private loadingData = {
		Meter: false,
	}

	private subscriptions: Subscription[] = [];
	constructor(
		private activatedRoute: ActivatedRoute,
		private router: Router,
		private comTPowerFB: FormBuilder,
		private subheaderService: SubheaderService,
		private layoutUtilsService: LayoutUtilsService,
		private store: Store<AppState>,
		private service: ComTPowerService,
		private serviceMPower: ComPowerService,
		private cd: ChangeDetectorRef,
		private layoutConfigService: LayoutConfigService
	) { }

	ngOnInit() {
		this.loading$ = this.store.pipe(select(selectComTPowerActionLoading));
		const routeSubscription = this.activatedRoute.params.subscribe(params => {
			const id = params.id;
			if (id) {
				this.store.pipe(select(selectComTPowerById(id))).subscribe(res => {
					if (res) {
						this.comTPower = res;
						this.oldComTPower = Object.assign({}, this.comTPower);
						this.initComTPower();
						console.log(res)


						this.viewPowerMeterResult.setValue(`${res.pow.nmmtr} - ${res.pow.unitCode}`);
						this._filterPowerList(`${res.pow.nmmtr} - ${res.pow.unitCode}`);
						this.viewPowerMeterResult.disable();

					}
				});
			}
		});
		this.subscriptions.push(routeSubscription);
	}

	initComTPower() {
		this.createForm();
		this.loadMeterList();
	}

	createForm() {
		this.comTPowerForm = this.comTPowerFB.group({
			date: [this.date1.value],
			pow: [this.comTPower.pow],
			rate: [{ value: this.comTPower.pow.rte.nmrtepow, disabled: true }],
			powname: [{ value: this.comTPower.powname, disabled: true }],
			unit: [{ value: this.comTPower.unit, disabled: true }],
			strtpos: [{ value: this.comTPower.strtpos, disabled: false }],
			endpos: [{ value: this.comTPower.endpos, disabled: false }],
			loss: [{ value: this.comTPower.loss, disabled: true }],
			strtpos2: [{ value: this.comTPower.strtpos2, disabled: true }],
			endpos2: [{ value: this.comTPower.endpos2, disabled: true }],
			isPosting: [this.comTPower.isPosting],
			created_date: [this.comTPower.created_date],
			created_by: [this.comTPower.created_by],
		});
	}

	goBackWithId() {
		const url = `/comTPower`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}
	refreshComTPower(isNew: boolean = false, id: string = "") {
		let url = this.router.url;
		if (!isNew) {
			this.router.navigate([url], { relativeTo: this.activatedRoute });
			return;
		}
		url = `/comTPower/edit/${id}`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}
	onSubmit(withBack: boolean = false) {
		this.hasFormErrors = false;
		const controls = this.comTPowerForm.controls;
		if (this.comTPowerForm.invalid) {
			Object.keys(controls).forEach(controlName =>
				controls[controlName].markAsTouched()
			);

			this.hasFormErrors = true;
			this.selectedTab = 0;
			return;
		}

		this.loading = true;
		const editedComTPower = this.prepareComTPower();
		this.updateComTPower(editedComTPower, withBack);
	}

	prepareComTPower(): ComTPowerModel {
		const controls = this.comTPowerForm.controls;
		const _comTPower = new ComTPowerModel();
		_comTPower.clear();
		_comTPower._id = this.comTPower._id;
		_comTPower.date = controls.date.value;
		_comTPower.pow = controls.pow.value;
		_comTPower.powname = controls.powname.value;
		_comTPower.unit = controls.unit.value;
		_comTPower.strtpos = controls.strtpos.value;
		_comTPower.endpos = controls.endpos.value;
		_comTPower.strtpos2 = controls.strtpos2.value;
		_comTPower.endpos2 = controls.endpos2.value;
		_comTPower.isPosting = controls.isPosting.value;
		_comTPower.created_date = controls.created_date.value;
		_comTPower.created_by = controls.created_by.value;
		return _comTPower;
	}

	updateComTPower(_comTPower: ComTPowerModel, withBack: boolean = false) {
		const addSubscription = this.service.updateComTPower(_comTPower).subscribe(
			res => {
				const message = `Product successfully has been saved.`;
				this.layoutUtilsService.showActionNotification(message, MessageType.Update, 5000, true, true);
				const url = `/comTPower`;
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

	changeMeterPost() {
		const strtpos = this.comTPowerForm.controls.strtpos.value / 10;
		if (strtpos !== 0) {
			this.comTPowerForm.controls.strtpos2.setValue(
				strtpos);
		} else {
			this.comTPowerForm.controls.strtpos2.setValue(
				0);

		}
		const endpos = this.comTPowerForm.controls.endpos.value / 10;
		if (endpos !== 0) {
			this.comTPowerForm.controls.endpos2.setValue(
				endpos);
		} else {
			this.comTPowerForm.controls.endpos2.setValue(
				0);

		}
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



	/**
* @param value
*/
	_setPowerValue(value) {
		this.comTPowerForm.patchValue({ pow: value._id });
		// this.changePowerMeter(value._id);
	}

	_onKeyup(e: any) {
		this.comTPowerForm.patchValue({ pow: undefined });
		this._filterPowerList(e.target.value);
	}

	_filterPowerList(text: string) {
		this.powerListResultFiltered = this.powerMeter.filter(i => {
			const filterText = `${i.nmmtr} - ${i.unitCode.toLocaleLowerCase()}`;
			if (filterText.includes(text.toLocaleLowerCase())) return i;

		});
	}

	loadMeterList() {
		// this.loadingData.Meter = true
		this.selection.clear();
		const queryParams = new QueryComPowerModel(
			null,
			1,
			10000
		);
		this.serviceMPower.getListComPowerForTransaction(queryParams).subscribe((res) => {
			this.powerMeter = res.data;
			this.powerListResultFiltered = this.powerMeter.slice();
			this.cd.markForCheck();
			this.viewPowerMeterResult.disable();
			// this.loadingData.Meter = false
		});
	}

}
