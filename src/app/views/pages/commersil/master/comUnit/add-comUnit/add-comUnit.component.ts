import { ChangeDetectorRef, Component, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import {
	FormBuilder,
	FormControl,
	FormGroup,
	Validators,
} from "@angular/forms";
import { Observable, Subscription } from "rxjs";
import { Store, select } from "@ngrx/store";
import { AppState } from "../../../../../../core/reducers";
import {
	SubheaderService,
	LayoutConfigService,
} from "../../../../../../core/_base/layout";
import {
	LayoutUtilsService,
	MessageType,
} from "../../../../../../core/_base/crud";
import { ComUnitModel } from "../../../../../../core/commersil/master/comUnit/comUnit.model";
import { selectComUnitActionLoading } from "../../../../../../core/commersil/master/comUnit/comUnit.selector";
import { ComUnitService } from "../../../../../../core/commersil/master/comUnit/comUnit.service";
import { SelectionModel } from "@angular/cdk/collections";
import { ComTypeService } from "../../../../../../core/commersil/master/comType/comType.service";
import { QueryComTypeModel } from "../../../../../../core/commersil/master/comType/querycomType.model";
import { ComCustomerService } from "../../../../../../core/commersil/master/comCustomer/comCustomer.service";
import { QueryComCustomerModel } from "../../../../../../core/commersil/master/comCustomer/querycomCustomer.model";

@Component({
	selector: "kt-add-comUnit",
	templateUrl: "./add-comUnit.component.html",
	styleUrls: ["./add-comUnit.component.scss"],
})
export class AddComUnitComponent implements OnInit, OnDestroy {
	datauser = localStorage.getItem("user");
	comUnit: ComUnitModel;
	ComUnitId$: Observable<string>;
	selection = new SelectionModel<ComUnitModel>(true, []);
	oldComUnit: ComUnitModel;
	selectedTab = 0;
	loading$: Observable<boolean>;
	comUnitForm: FormGroup;
	hasFormErrors = false;
	loading: boolean = false;
	typeResult: any[] = [];
	customerResult: any[] = [];
	date1 = new FormControl(new Date());

	// Autocomplete Filter and Options
	typeResultFiltered = [];
	viewTypeResult = new FormControl();

	customerResultFiltered = [];
	viewCustomerResult = new FormControl();

	private subscriptions: Subscription[] = [];
	constructor(
		private activatedRoute: ActivatedRoute,
		private router: Router,
		private comUnitFB: FormBuilder,
		private subheaderService: SubheaderService,
		private layoutUtilsService: LayoutUtilsService,
		private store: Store<AppState>,
		private service: ComUnitService,
		private typeService: ComTypeService,
		private customerService: ComCustomerService,
		private cd: ChangeDetectorRef,
		private layoutConfigService: LayoutConfigService
	) {}

	ngOnInit() {
		this.loading$ = this.store.pipe(select(selectComUnitActionLoading));
		const routeSubscription = this.activatedRoute.params.subscribe(
			(params) => {
				this.comUnit = new ComUnitModel();
				this.comUnit.clear();
				this.initComUnit();
			}
		);
		this.subscriptions.push(routeSubscription);
	}

	initComUnit() {
		this.createForm();
		this.loadCustomerList();
		this.loadTypeList();
	}

	createForm() {
		this.comUnitForm = this.comUnitFB.group({
			cdunt: ["", Validators.required],
			nmunt: [""],
			type: [""],
			unitType: [undefined],
			customer: [undefined],
			untsqr: [""],
			price: [{ value: "", disabled: true }],

			description: [""],
			created_date: [this.date1.value],
			created_by: [{ value: this.datauser, disabled: true }],
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
		this.typeResultFiltered = this.typeResult.filter((i) => {
			const filterText = `${i.unitTypeMaster.toLocaleLowerCase()}`;
			if (filterText.includes(text.toLocaleLowerCase())) return i;
		});
	}

	loadTypeList() {
		this.selection.clear();
		const queryParams = new QueryComTypeModel(null, 1, 100000);
		this.typeService.getListComType(queryParams).subscribe((res) => {
			this.typeResult = res.data;
			this.typeResultFiltered = this.typeResult.slice();
			this.cd.markForCheck();
			this.viewTypeResult.enable();
		});
	}

	getUnitType(id) {
		const controls = this.comUnitForm.controls;
		this.typeService.findComTypeById(id).subscribe((data) => {
			let masterType = data.data.unitTypeMaster;
			let typefrom = data.data.unitType;
			let alltype = masterType + " - " + typefrom;
			controls.type.setValue(alltype);
			controls.price.setValue(data.data.unitPrice);
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
		this.customerResultFiltered = this.customerResult.filter((i) => {
			const filterText = `${i.namaToko.toLocaleLowerCase()}`;
			if (filterText.includes(text.toLocaleLowerCase())) return i;
		});
	}

	loadCustomerList() {
		this.selection.clear();
		const queryParams = new QueryComCustomerModel(null, 1, 100000);
		this.customerService
			.getListComCustomer(queryParams)
			.subscribe((res) => {
				this.customerResult = res.data;
				this.customerResultFiltered = this.customerResult.slice();
				this.cd.markForCheck();
				this.viewCustomerResult.enable();
			});
	}

	goBackWithId() {
		const url = `/comUnit`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}
	refreshComUnit(isNew: boolean = false, id: string = "") {
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
			Object.keys(controls).forEach((controlName) =>
				controls[controlName].markAsTouched()
			);

			this.hasFormErrors = true;
			this.selectedTab = 0;
			return;
		}

		this.loading = true;
		const editedComUnit = this.prepareComUnit();
		this.addComUnit(editedComUnit, withBack);
	}

	prepareComUnit(): ComUnitModel {
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

	addComUnit(_comUnit: ComUnitModel, withBack: boolean = false) {
		const addSubscription = this.service.createComUnit(_comUnit).subscribe(
			(res) => {
				const message = `New commersil unit successfully has been added.`;
				this.layoutUtilsService.showActionNotification(
					message,
					MessageType.Create,
					5000,
					true,
					true
				);
				const url = `/comUnit`;
				this.router.navigateByUrl(url, {
					relativeTo: this.activatedRoute,
				});
			},
			(err) => {
				console.error(err);
				const message =
					"Error while adding commersil unit | " + err.statusText;
				this.layoutUtilsService.showActionNotification(
					message,
					MessageType.Create,
					5000,
					true,
					false
				);
			}
		);
		this.subscriptions.push(addSubscription);
	}

	getComponentTitle() {
		let result = "Create Commercial Unit";
		return result;
	}

	onAlertClose($event) {
		this.hasFormErrors = false;
	}

	ngOnDestroy() {
		this.subscriptions.forEach((sb) => sb.unsubscribe());
	}

	inputKeydownHandler(event) {
		return event.keyCode === 8 || event.keyCode === 46
			? true
			: !isNaN(Number(event.key));
	}

	inputKeydownSize(event) {
		return event.keyCode === 8 || event.keyCode === 46
			? true
			: !isNaN(Number(event.key)) || event.key === ".";
	}
}
