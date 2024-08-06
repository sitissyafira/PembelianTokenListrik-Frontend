import { ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Observable, Subscription } from 'rxjs';
import { Store, select } from '@ngrx/store';
import { AppState } from '../../../../core/reducers';
import { SubheaderService, LayoutConfigService } from '../../../../core/_base/layout';
import { LayoutUtilsService, MessageType, QueryParamsModel } from '../../../../core/_base/crud';
import {
	selectArActionLoading,
	selectArById
} from "../../../../core/finance/ar/ar.selector";
import { ArService } from '../../../../core/finance/ar/ar.service';
import { SelectionModel } from '@angular/cdk/collections';
import { TopUpService } from '../../../../core/topup/topup.service';
import { QueryTopUpModel } from '../../../../core/topup/querytopup.model';
import { TopUpModel } from '../../../../core/topup/topup.model';
import moment from 'moment';

@Component({
	selector: 'kt-edit-ar',
	templateUrl: './edit-ar.component.html',
	styleUrls: ['./edit-ar.component.scss']
})
export class EditArComponent implements OnInit, OnDestroy {
	topup: TopUpModel;
	ArId$: Observable<string>;
	oldAr: TopUpModel;
	selectedTab = 0;
	loading$: Observable<boolean>;
	selection = new SelectionModel<TopUpModel>(true, []);
	arResult: any[] = [];
	glResult: any[] = [];

	checkNoTokenAndEngineer: boolean = false
	checkDetailMtdPembayaran: boolean = false

	// upload image start
	images: any[] = []
	myFiles: any[] = []
	@ViewChild('fileInput', { static: false }) fileInputEl: ElementRef;
	// upload image end

	arForm: FormGroup;
	date1 = new FormControl(new Date());
	hasFormErrors = false;
	isStatus: boolean = false;
	private subscriptions: Subscription[] = [];
	loading = {
		deposit: false,
		submit: false,
		glaccount: false
	}

	arListResultFiltered = [];
	viewArResult = new FormControl();
	gLListResultFiltered = [];
	viewGlResult = new FormControl();

	constructor(
		private activatedRoute: ActivatedRoute,
		private router: Router,
		private arFB: FormBuilder,
		private layoutUtilsService: LayoutUtilsService,
		private store: Store<AppState>,
		private serviceTopUp: TopUpService,
		// upload image
		private cdr: ChangeDetectorRef,

	) { }

	ngOnInit() {
		this.loading$ = this.store.pipe(select(selectArActionLoading));
		const routeSubscription = this.activatedRoute.params.subscribe(params => {
			const id = params.id;
			if (id) {
				this.serviceTopUp.getDetailTransaksi(id).subscribe(res => {
					if (res) {
						console.log(res);
						const rate = res.data.idRate
						const unit = res.data.idUnit.cdunt
						const companyBank = res.compBank

						// format rupiah
						const numbTotalBiaya = res.data.totalBiaya;
						const formatTotalBiaya = numbTotalBiaya.toString().split('').reverse().join('');
						const convertTotalBiaya = formatTotalBiaya.match(/\d{1,3}/g);
						const totalBiaya = 'Rp ' + convertTotalBiaya.join('.').split('').reverse().join('')

						// format rupiah
						const numbHarga = res.data.idRate.rate;
						const formatHarga = numbHarga.toString().split('').reverse().join('');
						const convertHarga = formatHarga.match(/\d{1,3}/g);
						const harga = 'Rp ' + convertHarga.join('.').split('').reverse().join('')

						// format rupiah
						const numbAdminRate = res.data.idRate.adminRate;
						const formatAdminRate = numbAdminRate.toString().split('').reverse().join('');
						const convertAdminRate = formatAdminRate.match(/\d{1,3}/g);
						const adminRate = 'Rp ' + convertAdminRate.join('.').split('').reverse().join('')

						const tglTransaksi = moment(res.data.tglTransaksi).format('LL');

						const datas = {
							...res.data, tglTransaksi, namePrabayar: rate.name, rate: harga,
							adminRate, nameUnit: unit, companyBank: companyBank[0].bank.bank,
							nameCompany: companyBank[0].acctName, accountNumberCompany: companyBank[0].acctNum, totalBiaya
						}

						this.topup = datas

						if (res.data.mtdPembayaran === "manual") {
							this.checkDetailMtdPembayaran = true
						}

					}
				});
			}
		});
		this.subscriptions.push(routeSubscription);
	}

	initAr() {
		this.createForm();
	}

	createForm() {
		this.arForm = this.arFB.group({
			depositTo: [{ value: "" }]
		});
	}

	changeStatus() {
		const controls = this.arForm.controls;
		if (this.isStatus == true) {
			controls.status.setValue(true)

		} else {
			controls.status.setValue(false)
		}
		console.log(controls.status.value)
	}


	/**
	* @param value
	*/
	_setArValue(value) {
		this.arForm.patchValue({ depositTo: value._id });
	}

	_onKeyup(e: any) {
		this.arForm.patchValue({ depositTo: undefined });
		this._filterCashbankList(e.target.value);
	}

	_filterCashbankList(text: string) {
		this.arListResultFiltered = this.arResult.filter(i => {
			const filterText = `${i.acctName.toLocaleLowerCase()}`;
			if (filterText.includes(text.toLocaleLowerCase())) return i;
		});
	}




	/**
	* @param value
	*/
	_setGlValue(value) {
		this.arForm.patchValue({ glaccount: value._id });
	}

	_onKeyupGL(e: any) {
		this.arForm.patchValue({ glaccount: undefined });
		this._filterGLList(e.target.value);
	}

	_filterGLList(text: string) {
		this.arListResultFiltered = this.arResult.filter(i => {
			const filterText = `${i.acctName.toLocaleLowerCase()}`;
			if (filterText.includes(text.toLocaleLowerCase())) return i;
		});
	}


	onSubmit(withBack: boolean = false) {
		this.loading.submit = true;
		this.hasFormErrors = false;
		const controls = this.arForm.controls;
		if (this.arForm.invalid) {
			Object.keys(controls).forEach(controlName =>
				controls[controlName].markAsTouched()
			);
			this.loading.submit = false;
			this.hasFormErrors = true;
			this.selectedTab = 0;
			return;
		}

		const editedAr = this.prepareAr();
		this.updateAr(editedAr, withBack);
	}

	prepareAr(): TopUpModel {
		const controls = this.arForm.controls;
		const _ar = new TopUpModel();
		_ar.clear();
		return
	}

	updateAr(topup, withBack: boolean = false) {
		// const addSubscription = this.serviceTopUp.getAllUnit(topup).subscribe(
		// 	res => {
		// 		this.loading.submit = false;
		// 		const message = `Account Receive successfully has been saved.`;
		// 		this.layoutUtilsService.showActionNotification(message, MessageType.Update, 5000, true, true);
		// 		const url = `/ar`;
		// 		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
		// 	},
		// 	err => {
		// 		console.error(err);
		// 		this.loading.submit = false;
		// 		const message = 'Error while adding account receive | ' + err.statusText;
		// 		this.layoutUtilsService.showActionNotification(message, MessageType.Update, 5000, true, false);
		// 	}
		// );
		// this.subscriptions.push(addSubscription);
	}

	getComponentTitle() {
		let result = `Detail Top Up Listrik`;
		return result;
	}

	onAlertClose($event) {
		this.hasFormErrors = false;
	}

	ngOnDestroy() {
		this.subscriptions.forEach(sb => sb.unsubscribe());
	}


	inputKeydownHandler(event) {
		return event.keyCode === 8 || event.keyCode === 46 ? true : !isNaN(Number(event.key))
	}

	// get checked Start
	getCheckedSwitch(e: any) {
		if (e.target.checked === true) {
			this.checkNoTokenAndEngineer = true
		} else {
			this.checkNoTokenAndEngineer = false
		}
	}
	// get checked End

	// upload Image
	selectFile(e) {
		const files = (e.target as HTMLInputElement).files;
		for (let i = 0; i < files.length; i++) {
			// Skip uploading if file is already selected
			const alreadyIn = this.myFiles.filter(tFile => tFile.name === files[i].name).length > 0;
			if (alreadyIn) continue;

			this.myFiles.push(files[i]);

			const reader = new FileReader();
			reader.onload = () => {
				this.images.push({ name: files[i].name, url: reader.result });
				this.cdr.markForCheck();
			}
			reader.readAsDataURL(files[i]);
		}
		console.log(files);

	}
	removeSelectedFile(item) {
		this.myFiles = this.myFiles.filter(i => i.name !== item.name);
		this.images = this.images.filter(i => i.url !== item.url);
		this.fileInputEl.nativeElement.value = "";

		this.cdr.markForCheck();
	}

	clearSelection() {
		this.myFiles = [];
		this.images = [];
		this.fileInputEl.nativeElement.value = "";

		this.cdr.markForCheck();
	}

}
