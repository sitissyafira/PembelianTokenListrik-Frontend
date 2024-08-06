import {ChangeDetectorRef, Component, OnDestroy, OnInit} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Observable, Subscription } from 'rxjs';
import { Store, select } from '@ngrx/store';
import { AppState } from '../../../../../../core/reducers';
import { SubheaderService, LayoutConfigService } from '../../../../../../core/_base/layout';
import { LayoutUtilsService, MessageType } from '../../../../../../core/_base/crud';
import { ComUnitModel} from "../../../../../../core/commersil/master/comUnit/comUnit.model";

import {
	selectComUnitActionLoading,
	selectComUnitById,
} from "../../../../../../core/commersil/master/comUnit/comUnit.selector";

import { ComUnitService } from '../../../../../../core/commersil/master/comUnit/comUnit.service';
import { SelectionModel } from '@angular/cdk/collections';
import { ComCustomerService } from '../../../../../../core/commersil/master/comCustomer/comCustomer.service';
import { ComTypeService } from '../../../../../../core/commersil/master/comType/comType.service';
import { QueryComTypeModel } from '../../../../../../core/commersil/master/comType/querycomType.model';
import { QueryComCustomerModel } from '../../../../../../core/commersil/master/comCustomer/querycomCustomer.model';


@Component({
  selector: 'kt-edit-comUnit',
  templateUrl: './edit-comUnit.component.html',
  styleUrls: ['./edit-comunit.component.scss']
})
export class EditcomUnitComponent implements OnInit, OnDestroy {
	datauser = localStorage.getItem("user");
	comUnit: ComUnitModel;
	comUnitId$: Observable<string>;
    selection = new SelectionModel<ComUnitModel>(true, []);
	oldcomUnit: ComUnitModel;
	selectedTab = 0;
	loading$: Observable<boolean>;
	comUnitForm: FormGroup;
	hasFormErrors = false;
	loading : boolean = false;
	typeResult: any[] = [];
	customerResult: any[] = [];
	date1 = new FormControl(new Date());

	// Autocomplete Filter and Options
	typeResultFiltered = [];
	viewTypeResult = new FormControl();

	customerResultFiltered = [];
	viewCustomerResult = new FormControl();

	private loadingData = {
		productCategory: false,
		productBrand : false,
		UOM : false
	}

	private subscriptions: Subscription[] = [];
  	constructor(
		private activatedRoute: ActivatedRoute,
		private router: Router,
		private comUnitFB: FormBuilder,
		private subheaderService: SubheaderService,
		private layoutUtilsService: LayoutUtilsService,
		private store: Store<AppState>,
		private typeService : ComTypeService,
		private customerService : ComCustomerService,
		private service: ComUnitService,
		private cd: ChangeDetectorRef,
		private layoutConfigService: LayoutConfigService
	) { }

  	ngOnInit() {
		this.loading$ = this.store.pipe(select(selectComUnitActionLoading));
		const routeSubscription =  this.activatedRoute.params.subscribe(params => {
			const id = params.id;
			if (id) {
				this.store.pipe(select(selectComUnitById(id))).subscribe(res => {
					if (res) {
						this.comUnit = res;
						console.log(res);
						this.oldcomUnit = Object.assign({}, this.comUnit);
						this.initcomUnit();


						this.viewTypeResult.setValue(`${res.unitType.unitTypeMaster} - ${res.unitType.unitType}`);
						this._filterCstmrList(`${res.unitType.unitTypeMaster} - ${res.unitType.unitType}`);


						this.viewCustomerResult.setValue(`${res.customer.namaToko}`);
						this._filterList(`${res.customer.namaToko}`);
					}
				});
			}
		});
		this.subscriptions.push(routeSubscription);
  	}

	initcomUnit() {
		this.createForm();
		this.loadCustomerList();
		this.loadTypeList();
	}

	createForm() {
			this.comUnitForm = this.comUnitFB.group({
				cdunt : [{value:this.comUnit.cdunt, disabled:false}, Validators.required],
				nmunt : [{value:this.comUnit.nmunt, disabled:false}],
				type :[this.comUnit.type],
				unitType : [this.comUnit.unitType],
				customer : [this.comUnit.customer],
				untsqr: [{value:this.comUnit.untsqr, disabled:false}],
				price :[{value:this.comUnit.unitType.unitPrice, disabled:true}],

				description : [{value:this.comUnit.description, disabled:false}],
				created_date : [this.comUnit.created_date],
				created_by: [this.comUnit.created_by],
			});
	}


	/**
	 * @param value
	 */
	 _setBlockValue(value) {
		this.comUnitForm.patchValue({ unitType: value._id });
		this.getUnitType(value._id);
	}

	_onKeyup(e: any) {
		this.comUnitForm.patchValue({ unitType: undefined });
		this._filterCstmrList(e.target.value);
	}
	
	_filterCstmrList(text: string) {
		this.typeResultFiltered = this.typeResult.filter(i => {
			const filterText = `${i.unitTypeMaster.toLocaleLowerCase()}`;
			if(filterText.includes(text.toLocaleLowerCase())) return i;
		});
	}

	loadTypeList() {
		this.selection.clear();
		const queryParams = new QueryComTypeModel(
			null,
			1,
			100000
		);
		this.typeService.getListComType(queryParams).subscribe(
			res => {
				this.typeResult = res.data;
				this.typeResultFiltered = this.typeResult.slice();
				this.cd.markForCheck();
				this.viewTypeResult.enable();
			}
		);
	}

	getUnitType(id){
		const controls = this.comUnitForm.controls;
		this.typeService.findComTypeById(id).subscribe(data => {
			let masterType  = data.data.unitTypeMaster
			let typefrom = data.data.unitType
			let alltype = masterType + " - " + typefrom
			controls.type.setValue(alltype)
			controls.price.setValue(data.data.unitPrice)
		});
	}


	////////////////////////////////////////////////////////////////////////////////////////////////////////////


	/**
	 * @param value
	 */
		 _setCustomerValue(value) {
			this.comUnitForm.patchValue({ customer: value._id });
		}
	
		_onKeyup2(e: any) {
			this.comUnitForm.patchValue({ customer: undefined });
			this._filterList(e.target.value);
		}
		
		_filterList(text: string) {
			this.customerResultFiltered = this.customerResult.filter(i => {
				const filterText = `${i.namaToko.toLocaleLowerCase()}`;
				if(filterText.includes(text.toLocaleLowerCase())) return i;
			});
		}
	
		loadCustomerList() {
			this.selection.clear();
			const queryParams = new QueryComCustomerModel(
				null,
				1,
				100000
			);
			this.customerService.getListComCustomer(queryParams).subscribe(
				res => {
					this.customerResult = res.data;
					this.customerResultFiltered = this.customerResult.slice();
					this.cd.markForCheck();
					this.viewCustomerResult.enable();
				}
			);
		}











	goBackWithId() {
		const url = `/comUnit`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}
	refreshcomUnit(isNew: boolean = false, id:string = "") {
		let url = this.router.url;
		if (!isNew) {
			this.router.navigate([url], { relativeTo: this.activatedRoute });
			return;
		}
		url = `/comUnit/edit/${id}`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}
	onSubmit(withBack: boolean = false) {
		this.hasFormErrors = false;
		const controls = this.comUnitForm.controls;
		if (this.comUnitForm.invalid) {
			Object.keys(controls).forEach(controlName =>
				controls[controlName].markAsTouched()
			);

			this.hasFormErrors = true;
			this.selectedTab = 0;
			return;
		}

		this.loading = true;
		const editedcomUnit = this.preparecomUnit();
		this.updatecomUnit(editedcomUnit, withBack);
	}

	preparecomUnit(): ComUnitModel {
		const controls = this.comUnitForm.controls;
		const _comUnit = new ComUnitModel();
		_comUnit.clear();
		_comUnit._id = this.comUnit._id;
		_comUnit.cdunt = controls.cdunt.value.toLowerCase();
		_comUnit.nmunt = controls.nmunt.value;
		_comUnit.type = controls.type.value;
		_comUnit.unitType = controls.unitType.value;
		_comUnit.customer = controls.customer.value;
		_comUnit.untsqr = controls.untsqr.value;
		_comUnit.description = controls.description.value;
		_comUnit.created_date = controls.created_date.value;
		_comUnit.created_by = controls.created_by.value;
		return _comUnit;
	}

	updatecomUnit(_comUnit: ComUnitModel, withBack: boolean = false) {
		const addSubscription = this.service.updateComUnit(_comUnit).subscribe(
			res => {
				const message = `Product successfully has been saved.`;
				this.layoutUtilsService.showActionNotification(message, MessageType.Update, 5000, true, true);
				const url = `/comUnit`;
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
		let result = `Edit Commercial Customer`;
		return result;
	}

	onAlertClose($event) {
		this.hasFormErrors = false;
	}

  	ngOnDestroy() {
		this.subscriptions.forEach(sb => sb.unsubscribe());
	}
}
