import { Component, OnDestroy, OnInit, AfterViewChecked } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
// RxJS
import { BehaviorSubject, Observable, of, Subscription } from 'rxjs';
// NGRX
import { Store, select } from '@ngrx/store';
import { Update } from '@ngrx/entity';
import { AppState } from '../../../../core/reducers';
// Layout
import { SubheaderService, LayoutConfigService } from '../../../../core/_base/layout';
import { LayoutUtilsService, MessageType, QueryParamsModel } from '../../../../core/_base/crud';
import { RenterModel } from "../../../../core/renter/renter.model";
import {
	selectLastCreatedRenterId,
	selectRenterActionLoading,
	selectRenterById
} from "../../../../core/renter/renter.selector";
import { RenterOnServerCreated, RenterUpdated } from "../../../../core/renter/renter.action";
import { ProvinceModel } from '../../../../core/state/province.model';
import { RegencyModel } from '../../../../core/state/regency.model';
import { DistrictModel } from '../../../../core/state/district.model';
import { VillageModel } from '../../../../core/state/village.model';
import { StateService } from '../../../../core/state/state.service';
import { RenterService } from '../../../../core/renter/renter.service';

@Component({
	selector: 'kt-view-renter',
	templateUrl: './view-renter.component.html',
	styleUrls: ['./view-renter.component.scss']
})
export class ViewRenterComponent implements OnInit, OnDestroy {
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
		if (this.renter.idvllg !== null) {
			this.loadRegency(this.renter.idvllg.district.regency.province.code)
			this.loadDistrict(this.renter.idvllg.district.regency.code)
			this.loadVillage(this.renter.idvllg.district.code)
			this.loadPostalcode(this.renter.idvllg.district.name)
			this.renterForm = this.renterFB.group({
				// cstrmrcd: [{"value":this.renter.cstrmrcd, "disabled":true}],
				cstrmrpid: [{ value: this.renter.cstrmrpid, disabled: true }],
				npwp: [{ value: this.renter.npwp, disabled: true }],
				cstrmrnm: [{ value: this.renter.cstrmrnm, disabled: true }],
				addrcstmr: [{ value: this.renter.addrcstmr, disabled: true }],
				gndcstmr: [{ value: this.renter.gndcstmr, disabled: true }],
				phncstmr: [{ value: this.renter.phncstmr, disabled: true }],
				emailcstmr: [{ value: this.renter.emailcstmr, disabled: true }],
				idvllg: [{ value: this.renter.idvllg._id, disabled: true }],
				district: [{ value: this.renter.idvllg.district.code, disabled: true }],
				regency: [{ value: this.renter.idvllg.district.regency.code, disabled: true }],
				province: [{ value: this.renter.idvllg.district.regency.province.code, disabled: true }],
				postcode: [{ value: this.renter.postcode, disabled: true }],
				// type: [this.renter.type],
				bankname: [{ value: this.renter.bankname, disabled: true }],
				bankaccnt: [{ value: this.renter.bankaccnt, disabled: true }],
			});
		}
		this.renterForm = this.renterFB.group({
			// cstrmrcd: [{"value":this.renter.cstrmrcd, "disabled":true}],
			cstrmrpid: [{ value: this.renter.cstrmrpid, disabled: true }],
			npwp: [{ value: this.renter.npwp, disabled: true }],
			cstrmrnm: [{ value: this.renter.cstrmrnm, disabled: true }],
			addrcstmr: [{ value: this.renter.addrcstmr, disabled: true }],
			gndcstmr: [{ value: this.renter.gndcstmr, disabled: true }],
			phncstmr: [{ value: this.renter.phncstmr, disabled: true }],
			emailcstmr: [{ value: this.renter.emailcstmr, disabled: true }],
			idvllg: [{ value: [], disabled: true }],
			district: [{ value: [], disabled: true }],
			regency: [{ value: [], disabled: true }],
			province: [{ value: [], disabled: true }],
			postcode: [{ value: this.renter.postcode, disabled: true }],
			// type: [this.renter.type],
			bankname: [{ value: this.renter.bankname, disabled: true }],
			bankaccnt: [{ value: this.renter.bankaccnt, disabled: true }],
		});
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
		const url = `/renter`;
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
	getComponentTitle() {
		let result = `View Guest Profile`;
		return result;
	}
	onAlertClose($event) {
		this.hasFormErrors = false;
	}
	ngOnDestroy() {
		this.subscriptions.forEach(sb => sb.unsubscribe());
	}

}
