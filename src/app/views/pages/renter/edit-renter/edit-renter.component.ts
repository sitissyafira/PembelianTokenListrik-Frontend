import { Component, OnDestroy, OnInit } from '@angular/core';
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
	selectRenterById
} from "../../../../core/renter/renter.selector";
import { StateService } from '../../../../core/state/state.service';
import { RenterService } from '../../../../core/renter/renter.service';

@Component({
	selector: 'kt-add-renter',
	templateUrl: './edit-renter.component.html',
	styleUrls: ['./edit-renter.component.scss']
})
export class EditRenterComponent implements OnInit, OnDestroy {
	// Public properties
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
	loading: boolean = false
	// Private properties
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
			const id = params.id;
			if (id) {
				this.store.pipe(select(selectRenterById(id))).subscribe(res => {
					if (res) {
						this.renter = res;
						this.oldRenter = Object.assign({}, this.renter);
						this.initRenter();
					}
				});
			}
		});
		this.subscriptions.push(routeSubscription);
	}
	initRenter() {
		this.createForm();
		this.loadProvince();
	}
	createForm() {
		if (this.renter.idvllg === null || this.renter.idvllg === undefined) {
			this.renterForm = this.renterFB.group({
				cstrmrpid: [this.renter.cstrmrpid, Validators.required],
				npwp: [this.renter.npwp, Validators.required],
				cstrmrnm: [this.renter.cstrmrnm, Validators.required],
				addrcstmr: [this.renter.addrcstmr, Validators.required],
				gndcstmr: [this.renter.gndcstmr, Validators.required],
				phncstmr: [this.renter.phncstmr, Validators.required],
				emailcstmr: [this.renter.emailcstmr, Validators.required],
				idvllg: [""],
				district: [{ "value": "", "disabled": true }],
				regency: [{ "value": "", "disabled": true }],
				province: [{ "value": "" }],
				postcode: [{ "value": "", "disabled": true }],
				// type: [this.renter.type],
				bankname: [this.renter.bankname],
				bankaccnt: [this.renter.bankaccnt],
			});
		} else {
			this.loadRegency(this.renter.idvllg.district.regency.province.code)
			this.loadDistrict(this.renter.idvllg.district.regency.code)
			this.loadVillage(this.renter.idvllg.district.code)
			this.loadPostalcode(this.renter.idvllg.district.name)
			this.renterForm = this.renterFB.group({
				cstrmrpid: [this.renter.cstrmrpid, Validators.required],
				npwp: [this.renter.npwp, Validators.required],
				cstrmrnm: [this.renter.cstrmrnm, Validators.required],
				addrcstmr: [this.renter.addrcstmr, Validators.required],
				gndcstmr: [this.renter.gndcstmr, Validators.required],
				phncstmr: [this.renter.phncstmr, Validators.required],
				emailcstmr: [this.renter.emailcstmr, Validators.required],
				idvllg: [this.renter.idvllg._id],
				district: [this.renter.idvllg.district.code],
				regency: [this.renter.idvllg.district.regency.code],
				province: [this.renter.idvllg.district.regency.province.code],
				postcode: [this.renter.postcode],
				// type: [this.renter.type],
				bankname: [this.renter.bankname],
				bankaccnt: [this.renter.bankaccnt],
			});
		}
	}

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

	loadVillage(districtCode: string) {
		const queryParams = new QueryParamsModel(null,
			"asc",
			"grpnm",
			1,
			10);
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
		this.updateRenter(editedRenter, withBack);

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

	updateRenter(_renter: RenterModel, withBack: boolean = false) {
		const editSubscription = this.renterService.updateRenter(_renter).subscribe(
			res => {
				const message = `Renter successfully has been saved.`;
				this.layoutUtilsService.showActionNotification(message, MessageType.Update, 5000, true, true);
				if (withBack) {
					this.goBackWithId();
				} else {
					this.refreshRenter(false);
					const url = `/guest-cust`;
					this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
				}
			},
			err => {
				console.error(err);
				const message = 'Error while editing renter | ' + err.statusText;
				this.layoutUtilsService.showActionNotification(message, MessageType.Update, 5000, true, false);
			}
		);
		this.subscriptions.push(editSubscription);
	}
	getComponentTitle() {
		let result = `Edit Guest Profile`;
		return result;
	}
	onAlertClose($event) {
		this.hasFormErrors = false;
	}

	ngOnDestroy() {
		this.subscriptions.forEach(sb => sb.unsubscribe());
	}
}
