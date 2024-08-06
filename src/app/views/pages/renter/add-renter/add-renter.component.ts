import { Component, OnDestroy, OnInit, } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable, Subscription } from 'rxjs';
import { Store, select } from '@ngrx/store';
import { AppState } from '../../../../core/reducers';
import { SubheaderService, LayoutConfigService } from '../../../../core/_base/layout';
import { LayoutUtilsService, MessageType, QueryParamsModel } from '../../../../core/_base/crud';
import { RenterModel } from "../../../../core/renter/renter.model";
import {
	selectRenterActionLoading,
} from "../../../../core/renter/renter.selector";
import { StateService } from '../../../../core/state/state.service';
import { RenterService } from '../../../../core/renter/renter.service';

@Component({
	selector: 'kt-add-renter',
	templateUrl: './add-renter.component.html',
	styleUrls: ['./add-renter.component.scss']
})
export class AddRenterComponent implements OnInit, OnDestroy {
	renter: RenterModel;
	renterId$: Observable<string>;
	oldRenter: RenterModel;
	selectedTab = 0;
	loading$: Observable<boolean>;
	renterForm: FormGroup;
	hasFormErrors = false;
	codenum: any = null;
	provinceResult: any[] = [];
	regencyResult: any[] = [];
	districtResult: any[] = [];
	villageResult: any[] = [];
	postalcodeResult: any[] = [];
	propinsi: string;
	loading: Boolean = false
	private subscriptions: Subscription[] = [];
	constructor(
		private activatedRoute: ActivatedRoute,
		private router: Router,
		private renterFB: FormBuilder,
		private subheaderService: SubheaderService,
		private layoutUtilsService: LayoutUtilsService,
		private stateService: StateService,
		private renterService: RenterService,
		private store: Store<AppState>,
		private layoutConfigService: LayoutConfigService
	) {

	}
	ngOnInit() {
		this.loading$ = this.store.pipe(select(selectRenterActionLoading));
		const routeSubscription = this.activatedRoute.params.subscribe(params => {
			this.renter = new RenterModel();
			this.renter.clear();
			this.initRenter();
		});
		this.subscriptions.push(routeSubscription);

	}
	initRenter() {
		this.createForm();
		this.loadProvince();
	}
	createForm() {
		this.renterForm = this.renterFB.group({
			// cstrmrcd: [{"value":this.codenum, "disabled":true}, Validators.required],
			cstrmrpid: [""],
			npwp: [""],
			cstrmrnm: ["", Validators.required],
			addrcstmr: ["", Validators.required],
			gndcstmr: ["", Validators.required],
			phncstmr: ["", Validators.required],
			emailcstmr: ["", Validators.required],
			idvllg: [],
			district: [{ "value": "", "disabled": true }],
			regency: [{ "value": "", "disabled": true }],
			province: [{ "value": "" }],
			postcode: [{ "value": "", "disabled": true }],
			type: [{ value: "", disabled: true }],
			bankname: [""],
			bankaccnt: [""],
		});
	}
	// getNumber() {
	// 	this.renterService.generateRenterCode().subscribe(
	// 		res => {
	// 			this.codenum = res.data
	// 		}
	// 	)
	// }

	loadProvince() {
		const queryParams = new QueryParamsModel(null,
			"asc",
			"grpnm",
			1,
			10);
		this.stateService.getListProvince(queryParams).subscribe(
			res => {
				this.provinceResult = res.data;
			}
		);
	}
	loadRegency(provCode) {
		const queryParams = new QueryParamsModel(null,
			"asc",
			"grpnm",
			1,
			10);
		this.stateService.getListRegencyByParent(queryParams, provCode).subscribe(
			res => {
				this.regencyResult = res.data;
			}
		);
	}
	loadDistrict(regencyCode: string) {
		const queryParams = new QueryParamsModel(null,
			"asc",
			"grpnm",
			1,
			10);
		this.stateService.getListDistrictByParent(queryParams, regencyCode).subscribe(
			res => {
				this.districtResult = res.data;
			}
		);
	}
	loadVillage(districtCode: string) {
		const queryParams = new QueryParamsModel(null,
			"asc",
			"grpnm",
			1,
			1000);
		this.stateService.getListVillageByParent(queryParams, districtCode).subscribe(
			res => {
				this.villageResult = res.data;
			}
		);
	}
	loadPostalcode(regencyName: string) {
		const queryParams = new QueryParamsModel(null,
			"asc",
			"grpnm",
			1,
			10);
		this.stateService.getListPostalcode(queryParams, regencyName).subscribe(
			res => {
				this.postalcodeResult = res.data;
				console.log(res.data)
			}
		);
	}
	provinceOnChange(item) {
		if (item) {
			this.renterForm.controls.regency.enable();
			this.loadRegency(item);
		}
	}
	regencyOnChange(item) {
		if (item) {
			this.renterForm.controls.district.enable();
			this.loadDistrict(item);
		}
	}


	districtOnChange(item) {
		if (item) {
			console.log(name);
			this.renterForm.controls.idvllg.enable();
			this.renterForm.controls.postcode.enable();
			this.loadVillage(item);
			this.districtResult.forEach((postalitem) => {
				console.log(item);
				if (postalitem.code == item) {
					this.loadPostalcode(postalitem.name);
					console.log(postalitem.name)
				}
			});
		}
	}
	goBackWithId() {
		const url = `/guest-cust`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}
	refreshRenter(isNew: boolean = false, id: string = "") {
		let url = this.router.url;
		if (!isNew) {
			this.router.navigate([url], { relativeTo: this.activatedRoute });
			return;
		}

		url = `/renter/edit/${id}`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}


	onSubmit(withBack: boolean = false) {
		const _title = 'Renter'
		const _description = 'Are you sure to create this renter?';
		const _waitDesciption = 'Renter is creating...';
		const _deleteMessage = `Renter Has been create`;

		const dialogRef = this.layoutUtilsService.jobElement(_title, _description, _waitDesciption);
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				return;
			}
			this.hasFormErrors = false;
			const controls = this.renterForm.controls;
			/** check form */
			if (this.renterForm.invalid) {
				Object.keys(controls).forEach(controlName =>
					controls[controlName].markAsTouched()
				);

				this.hasFormErrors = true;
				this.selectedTab = 0;
				return;
			}
			this.loading = true;
			const editedRenter = this.prepareRenter();
			this.addRenter(editedRenter, withBack);
		});
	}
	prepareRenter(): RenterModel {
		const controls = this.renterForm.controls;
		const _renter = new RenterModel();
		_renter.clear();
		_renter._id = this.renter._id;
		// _renter.cstrmrcd = controls.cstrmrcd.value;
		_renter.cstrmrpid = controls.cstrmrpid.value;
		_renter.npwp = controls.npwp.value;
		_renter.cstrmrnm = controls.cstrmrnm.value.toLowerCase();
		_renter.gndcstmr = controls.gndcstmr.value.toLowerCase();
		_renter.phncstmr = controls.phncstmr.value;
		_renter.addrcstmr = controls.addrcstmr.value.toLowerCase();
		_renter.emailcstmr = controls.emailcstmr.value;
		_renter.idvllg = controls.idvllg.value;
		_renter.postcode = controls.postcode.value;
		_renter.bankname = controls.bankname.value.toLowerCase();
		_renter.bankaccnt = controls.bankaccnt.value;
		return _renter;
	}
	addRenter(_renter: RenterModel, withBack: boolean = false) {
		const addSubscription = this.renterService.createRenter(_renter).subscribe(
			res => {
				const message = `New renter successfully has been added.`;
				this.layoutUtilsService.showActionNotification(message, MessageType.Create, 5000, true, true);
				const url = `/guest-cust`;
				this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
			},
			err => {
				console.error(err);
				const message = 'Error while adding renter | ' + err.statusText;
				this.layoutUtilsService.showActionNotification(message, MessageType.Create, 5000, true, false);
			}
		);
		this.subscriptions.push(addSubscription);
	}
	getComponentTitle() {
		let result = 'Create Guest Profile';
		return result;
	}
	onAlertClose($event) {
		this.hasFormErrors = false;
	}
	ngOnDestroy() {
		this.subscriptions.forEach(sb => sb.unsubscribe());
	}
}
