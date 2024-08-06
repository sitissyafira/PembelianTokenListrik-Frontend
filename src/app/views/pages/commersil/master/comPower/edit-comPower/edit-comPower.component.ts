import {ChangeDetectorRef, Component, OnDestroy, OnInit} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Observable, Subscription } from 'rxjs';
import { Store, select } from '@ngrx/store';
import { AppState } from '../../../../../../core/reducers';
import { SubheaderService, LayoutConfigService } from '../../../../../../core/_base/layout';
import { LayoutUtilsService, MessageType } from '../../../../../../core/_base/crud';
import {ComPowerModel} from "../../../../../../core/commersil/master/comPower/comPower.model";
import {
	selectComPowerActionLoading,
	selectComPowerById,
} from "../../../../../../core/commersil/master/comPower/comPower.selector";
import {ComPowerService} from '../../../../../../core/commersil/master/comPower/comPower.service';
import { SelectionModel } from '@angular/cdk/collections';
import { PowerRateService } from '../../../../../../core/power';
import { ComUnitService } from '../../../../../../core/commersil/master/comUnit/comUnit.service';
import { QueryComUnitModel } from '../../../../../../core/commersil/master/comUnit/querycomUnit.model';
import { QueryPowerRateModel } from '../../../../../../core/power/rate/queryrate.model';


@Component({
  selector: 'kt-edit-comPower',
  templateUrl: './edit-comPower.component.html',
  styleUrls: ['./edit-comPower.component.scss']
})
export class EditComPowerComponent implements OnInit, OnDestroy {
	datauser = localStorage.getItem("user");
	comPower: ComPowerModel;
	ComPowerId$: Observable<string>;
	selection = new SelectionModel<ComPowerModel>(true, []);
	oldComPower: ComPowerModel;
	selectedTab = 0;
	loading$: Observable<boolean>;
	comPowerForm: FormGroup;
	hasFormErrors = false;
	loading : boolean = false;
	unitResult: any[] = [];
	powerRateResult: any[] = [];
	date1 = new FormControl(new Date());

	UnitResultFiltered = [];
	viewUnitResult = new FormControl();


	private subscriptions: Subscription[] = [];
  	constructor(
		private activatedRoute: ActivatedRoute,
		private router: Router,
		private comPowerFB: FormBuilder,
		private subheaderService: SubheaderService,
		private layoutUtilsService: LayoutUtilsService,
		private store: Store<AppState>,
		private service: ComPowerService,
		private unitService : ComUnitService,
		private powerRateService : PowerRateService,
		private cd: ChangeDetectorRef,
		private layoutConfigService: LayoutConfigService
	) { }

  	ngOnInit() {
		this.loading$ = this.store.pipe(select(selectComPowerActionLoading));
		const routeSubscription =  this.activatedRoute.params.subscribe(params => {
			const id = params.id;
			if (id) {
				this.store.pipe(select(selectComPowerById(id))).subscribe(res => {
					if (res) {
						this.comPower = res;
						this.oldComPower = Object.assign({}, this.comPower);
						this.initComPower();

						this.viewUnitResult.setValue(`${res.unitCommersil.cdunt}`);
						this._filterList(`${res.unitCommersil.cdunt}`);
					}
				});
			}
		});
		this.subscriptions.push(routeSubscription);
  	}

	initComPower() {
		this.createForm();
		this.loadUnitList();
		this.loadRateList();
	}

	createForm() {
			this.comPowerForm = this.comPowerFB.group({
				nmmtr : [{value:this.comPower.nmmtr, disabled:false}],
				unitCommersil : [this.comPower.unitCommersil],
				unitCode : [this.comPower.unitCode],
				rte : [{value:this.comPower.rte._id, disabled:false}],
				remark : [{value:this.comPower.remark, disabled:false}],

				created_date : [this.comPower.created_date],
				created_by: [this.comPower.created_by],
			});
	}



/**
	 * @param value
	 */
 _setUnitValue(value) {
	this.comPowerForm.patchValue({ unitCommersil: value._id });
	this.getUnit(value._id);
}

_onKeyup(e: any) {
	this.comPowerForm.patchValue({ unitCommersil: undefined });
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
	const controls = this.comPowerForm.controls;
	this.unitService.findComUnitById(id).subscribe(data => {
		controls.unitCode.setValue(data.data.cdunt)
	});
}

loadRateList(){
	this.selection.clear();
	const queryParams = new QueryPowerRateModel(
		null,
		"asc",
		null,
		1,
		100000
	);
	this.powerRateService.getListPowerRate(queryParams).subscribe(
		res => {
			this.powerRateResult = res.data;
		}
	);
}

	goBackWithId() {
		const url = `/comPower`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}
	refreshComPower(isNew: boolean = false, id:string = "") {
		let url = this.router.url;
		if (!isNew) {
			this.router.navigate([url], { relativeTo: this.activatedRoute });
			return;
		}
		url = `/comPower/edit/${id}`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}
	onSubmit(withBack: boolean = false) {
		this.hasFormErrors = false;
		const controls = this.comPowerForm.controls;
		if (this.comPowerForm.invalid) {
			Object.keys(controls).forEach(controlName =>
				controls[controlName].markAsTouched()
			);

			this.hasFormErrors = true;
			this.selectedTab = 0;
			return;
		}

		this.loading = true;
		const editedComPower = this.prepareComPower();
		this.updateComPower(editedComPower, withBack);
	}

	prepareComPower(): ComPowerModel {
		const controls = this.comPowerForm.controls;
		const _comPower = new ComPowerModel();
		_comPower.clear();
		_comPower._id = this.comPower._id;
		_comPower.nmmtr = controls.nmmtr.value;
		_comPower.unitCommersil = controls.unitCommersil.value;
		_comPower.unitCode = controls.unitCode.value.toLowerCase();
		_comPower.rte = controls.rte.value;
		_comPower.remark = controls.remark.value;
		_comPower.created_date = controls.created_date.value;
		_comPower.created_by = controls.created_by.value;
		return _comPower;
	}

	updateComPower(_comPower: ComPowerModel, withBack: boolean = false) {
		const addSubscription = this.service.updateComPower(_comPower).subscribe(
			res => {
				const message = `Product successfully has been saved.`;
				this.layoutUtilsService.showActionNotification(message, MessageType.Update, 5000, true, true);
				const url = `/comPower`;
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
