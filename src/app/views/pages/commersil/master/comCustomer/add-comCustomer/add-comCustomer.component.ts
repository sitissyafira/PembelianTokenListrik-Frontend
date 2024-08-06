import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable, Subscription } from 'rxjs';
import { Store, select } from '@ngrx/store';
import { AppState } from '../../../../../../core/reducers';
import { SubheaderService, LayoutConfigService } from '../../../../../../core/_base/layout';
import { LayoutUtilsService, MessageType } from '../../../../../../core/_base/crud';
import { ComCustomerModel } from "../../../../../../core/commersil/master/comCustomer/comCustomer.model";
import {
	selectComCustomerActionLoading,
} from "../../../../../../core/commersil/master/comCustomer/comCustomer.selector";
import { ComCustomerService } from '../../../../../../core/commersil/master/comCustomer/comCustomer.service';
import { SelectionModel } from '@angular/cdk/collections';
import { PopupPurchaseRequest } from '../popup-purchaseRequest/popup-purchaseRequest.component';
import { MatDialog } from '@angular/material';

@Component({
	selector: 'kt-add-comCustomer',
	templateUrl: './add-comCustomer.component.html',
	styleUrls: ['./add-comCustomer.component.scss']
})
export class AddComCustomerComponent implements OnInit, OnDestroy {
	datauser = localStorage.getItem("user");
	comCustomer: ComCustomerModel;
	ComCustomerId$: Observable<string>;
	selection = new SelectionModel<ComCustomerModel>(true, []);
	oldComCustomer: ComCustomerModel;
	selectedTab = 0;
	loading$: Observable<boolean>;
	comCustomerForm: FormGroup;
	hasFormErrors = false;
	loading: boolean = false;
	productCategoryResult: any[] = [];
	productBrandResult: any[] = [];
	UOMResult: any[] = [];


	// 
	valueVAId: string = ""
	valueIPL: string = ""
	valueWater: string = ""
	valuePower: string = ""
	valueUtility: string = ""
	valueGas: string = ""
	valueParking: string = ""
	cekInputVaIPL: boolean = false
	cekInputVaWater: boolean = false
	cekInputVaPower: boolean = false
	cekInputVaUtility: boolean = false
	cekInputVaGas: boolean = false
	cekInputVaParking: boolean = false

	// cstmrId: string = ""
	customerId: string = ""

	private loadingData = {
		productCategory: false,
		productBrand: false,
		UOM: false
	}

	private subscriptions: Subscription[] = [];
	constructor(
		private activatedRoute: ActivatedRoute,
		private router: Router,
		private comCustomerFB: FormBuilder,
		private subheaderService: SubheaderService,
		private layoutUtilsService: LayoutUtilsService,
		private store: Store<AppState>,
		private service: ComCustomerService,
		private cd: ChangeDetectorRef,
		private layoutConfigService: LayoutConfigService,
		private dialog: MatDialog,

	) { }

	ngOnInit() {
		this.loading$ = this.store.pipe(select(selectComCustomerActionLoading));
		const routeSubscription = this.activatedRoute.params.subscribe(params => {
			this.comCustomer = new ComCustomerModel();
			this.comCustomer.clear();
			this.initComCustomer();
		}
		)
		this.subscriptions.push(routeSubscription);
	}

	initComCustomer() {
		this.createForm();
	}

	createForm() {
		this.comCustomerForm = this.comCustomerFB.group({
			nameDagang: ["", Validators.required],
			namaToko: [""],
			name: [""],
			npwp: [""],
			address: [""],
			phone: [""],
			email: [""],
			bankname: [""],
			bankaccnt: [""],
			created_date: [""],
			description: [""],
			created_by: [{ value: this.datauser, disabled: true }],
			va_ipl: [{ value: "", disabled: false }],
			va_water: [{ value: "", disabled: false }],
			va_power: [{ value: "", disabled: false }],
			va_utility: [{ value: "", disabled: false }],
			va_gas: [{ value: "", disabled: false }],
			va_parking: [{ value: "", disabled: false }],
		});
	}

	// Start checked
	contentEditable: boolean = false
	valueChoose: boolean = false
	// End checked


	goBackWithId() {
		const url = `/comCustomer`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}
	refreshComCustomer(isNew: boolean = false, id: string = "") {
		let url = this.router.url;
		if (!isNew) {
			this.router.navigate([url], { relativeTo: this.activatedRoute });
			return;
		}
		url = `/comCustomer/edit/${id}`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}
	onSubmit(withBack: boolean = false) {
		this.hasFormErrors = false;
		const controls = this.comCustomerForm.controls;
		if (this.comCustomerForm.invalid) {
			Object.keys(controls).forEach(controlName =>
				controls[controlName].markAsTouched()
			);

			this.hasFormErrors = true;
			this.selectedTab = 0;
			return;
		}

		this.loading = true;
		const editedComCustomer = this.prepareComCustomer();
		this.addComCustomer(editedComCustomer, withBack);
	}

	prepareComCustomer(): ComCustomerModel {
		const controls = this.comCustomerForm.controls;
		const _comCustomer = new ComCustomerModel();
		_comCustomer.clear();
		_comCustomer._id = this.comCustomer._id;
		_comCustomer.nameDagang = controls.nameDagang.value.toLowerCase();
		_comCustomer.namaToko = controls.namaToko.value.toLowerCase();
		_comCustomer.name = controls.name.value;
		_comCustomer.npwp = controls.npwp.value;
		_comCustomer.address = controls.address.value;
		_comCustomer.phone = controls.phone.value;
		_comCustomer.email = controls.email.value;
		_comCustomer.bankname = controls.bankname.value;
		_comCustomer.bankaccnt = controls.bankaccnt.value;
		_comCustomer.created_date = controls.created_date.value;
		_comCustomer.description = controls.description.value;
		_comCustomer.created_by = controls.created_by.value;

		// virtual account start
		_comCustomer.va_ipl = parseInt(this.valueIPL)
		_comCustomer.va_water = parseInt(this.valueWater)
		_comCustomer.va_power = parseInt(this.valuePower)
		_comCustomer.va_utility = parseInt(this.valueUtility)
		_comCustomer.va_gas = parseInt(this.valueGas)
		_comCustomer.va_parking = parseInt(this.valueParking)
		// _comCustomer.cstmrId = this.comCustomer._id
		// _comCustomer.cstmr = this.comCustomer._id
		// console.log(this.comCustomer._id);

		_comCustomer.isToken = this.contentEditable
		_comCustomer.isTenant = false

		// virtual account end
		return _comCustomer;


	}

	addComCustomer(_comCustomer: ComCustomerModel, withBack: boolean = false) {

		const addSubscription = this.service.createComCustomer(_comCustomer).subscribe(
			res => {
				console.log(res.data._id);

				this.service.createVirtualAccount(_comCustomer, res.data._id).subscribe(
					res => {
						console.log(res);
					}

				)
				const message = `New commersil customer successfully has been added.`;
				this.layoutUtilsService.showActionNotification(message, MessageType.Create, 5000, true, true);
				const url = `/comCustomer`;
				this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
			},
			err => {
				console.error(err);
				const message = 'Error while adding commersil customer | ' + err.statusText;
				this.layoutUtilsService.showActionNotification(message, MessageType.Create, 5000, true, false);
			}
		);



		this.subscriptions.push(addSubscription);
	}

	processMenuHandler() {
		const controls = this.comCustomerForm.controls;
		const dialogRef = this.dialog.open(PopupPurchaseRequest, {
			data: { va_ipl: this.valueIPL, va_water: this.valueWater, va_power: this.valuePower, va_utility: this.valueUtility, va_gas: this.valueGas, va_parking: this.valueParking },
			maxWidth: '500px',
			minHeight: '300px'
		});

		// tes modal
		dialogRef.afterClosed().subscribe(result => {
			console.log(result);
			if (result.va_ipl !== '') {
				if (result.va_ipl === null) {
					controls.va_ipl.setValue("");
					this.cekInputVaIPL = false
					this.valueIPL = undefined
				} else {
					controls.va_ipl.setValue("* VA IPL : " + result.va_ipl);
					this.valueIPL = result.va_ipl
					this.cekInputVaIPL = true
				}
			}
			if (result.va_water !== '') {
				if (result.va_water === null) {
					controls.va_water.setValue("");
					this.cekInputVaWater = false
					this.valueWater = undefined
				} else {
					controls.va_water.setValue("* VA Water : " + result.va_water);
					this.valueWater = result.va_water
					this.cekInputVaWater = true
				}
			}
			if (result.va_power !== '') {
				if (result.va_power === null) {
					controls.va_power.setValue("");
					this.valuePower = undefined
					this.cekInputVaPower = false
				} else {
					controls.va_power.setValue("* VA Power : " + result.va_power);
					this.valuePower = result.va_power
					this.cekInputVaPower = true
				}
			}
			if (result.va_utility !== '') {
				if (result.va_utility === null) {
					controls.va_utility.setValue("");
					this.cekInputVaUtility = false
					this.valueUtility = undefined
				} else {
					controls.va_utility.setValue("* VA Utility : " + result.va_utility);
					this.valueUtility = result.va_utility
					this.cekInputVaUtility = true
				}
			}
			if (result.va_gas !== '') {
				if (result.va_gas === null) {
					controls.va_gas.setValue("");
					this.cekInputVaGas = false
					this.valueGas = undefined
				} else {
					controls.va_gas.setValue("* VA Gas : " + result.va_gas);
					this.valueGas = result.va_gas
					this.cekInputVaGas = true
				}
			}
			if (result.va_parking !== '') {
				if (result.va_parking === null) {
					controls.va_parking.setValue("");
					this.valueParking = undefined
					this.cekInputVaParking = false
				} else {
					controls.va_parking.setValue("* VA Parking : " + result.va_parking);
					this.valueParking = result.va_parking
					this.cekInputVaParking = true
				}
			}

			this.cd.markForCheck()
		})

	}

	// start checked
	hideInputChecked() {
		if (this.contentEditable === true) {
			return 'd-none col-lg-6 kt-margin-bottom-20-mobile'
		} else if (this.contentEditable === false) {
			return 'col-lg-6 kt-margin-bottom-20-mobile'
		}
	}
	toggleEditable(event) {
		if (event.target.checked === true) {
			this.valueChoose = true
			this.contentEditable = true;
			console.log(this.contentEditable);

			this.hideInputChecked
		} else this.contentEditable = false
	}
	toggleEditableAbonemen(event) {
		this.valueChoose = false
		if (event.target.checked === true) {
			this.contentEditable = false;
			console.log(this.contentEditable);

			this.hideInputChecked
		} else this.contentEditable = false
	}
	// end checked


	getComponentTitle() {
		let result = 'Create Commercial Customer';
		return result;
	}

	onAlertClose($event) {
		this.hasFormErrors = false;
	}

	ngOnDestroy() {
		this.subscriptions.forEach(sb => sb.unsubscribe());
	}

	inputKeydownHandler(event) {
		return event.keyCode === 8 || event.keyCode === 46 ? true : !isNaN(Number(event.key));
	}
}
