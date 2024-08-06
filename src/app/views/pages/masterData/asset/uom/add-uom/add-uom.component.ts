import {Component, OnDestroy, OnInit} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
// RxJS
import { BehaviorSubject, Observable, of, Subscription } from 'rxjs';
// NGRX
import { Store, select } from '@ngrx/store';
import { Update } from '@ngrx/entity';
import { AppState } from '../../../../../../core/reducers';
// Layout
import { SubheaderService, LayoutConfigService } from '../../../../../../core/_base/layout';
import { LayoutUtilsService, MessageType } from '../../../../../../core/_base/crud';
import {UomModel} from "../../../../../../core/masterData/asset/uom/uom.model";
import {
	selectLastCreatedUomId,
	selectUomActionLoading,
	selectUomById
} from "../../../../../../core/masterData/asset/uom/uom.selector";
import {UomService} from '../../../../../../core/masterData/asset/uom/uom.service';

@Component({
  selector: 'kt-add-uom',
  templateUrl: './add-uom.component.html',
  styleUrls: ['./add-uom.component.scss']
})
export class AddUomComponent implements OnInit, OnDestroy {
	// Public properties
	uom: UomModel;
	UomId$: Observable<string>;
	oldUom: UomModel;
	selectedTab = 0;
	loading$: Observable<boolean>;
	uomForm: FormGroup;
	hasFormErrors = false;
	loading : boolean = false;
	// Private properties
	private subscriptions: Subscription[] = [];
  	constructor(
		private activatedRoute: ActivatedRoute,
		private router: Router,
		private uomFB: FormBuilder,
		private subheaderService: SubheaderService,
		private layoutUtilsService: LayoutUtilsService,
		private store: Store<AppState>,
		private service: UomService,
		private layoutConfigService: LayoutConfigService
	) { }

  	ngOnInit() {
		this.loading$ = this.store.pipe(select(selectUomActionLoading));
		const routeSubscription =  this.activatedRoute.params.subscribe(params => {
			const id = params.id;
			if (id) {
				this.store.pipe(select(selectUomById(id))).subscribe(res => {
					if (res) {
						this.uom = res;
						this.oldUom = Object.assign({}, this.uom);
						this.initUom();
					}
				});
			} else {
				this.uom = new UomModel();
				this.uom.clear();
				this.initUom();
			}
		});
		this.subscriptions.push(routeSubscription);
  	}

	initUom() {
		this.createForm();
	}

	createForm() {
		this.uomForm = this.uomFB.group({
			uom: [this.uom.uom.toLocaleUpperCase(), Validators.required],
			remarks: [this.uom.remarks],
		});
	}

	goBackWithId() {
		const url = `/uom`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}

	refreshUom(isNew: boolean = false, id:string = "") {
		let url = this.router.url;
		if (!isNew) {
			this.router.navigate([url], { relativeTo: this.activatedRoute });
			return;
		}

		url = `/uom/edit/${id}`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}

	onSubmit(withBack: boolean = false) {
		this.hasFormErrors = false;
		const controls = this.uomForm.controls;
		/** check form */
		if (this.uomForm.invalid) {
			Object.keys(controls).forEach(controlName =>
				controls[controlName].markAsTouched()
			);

			this.hasFormErrors = true;
			this.selectedTab = 0;
			return;
		}

		this.loading = true;
		const editedUom = this.prepareUom();

		if (editedUom._id) {
			this.updateUom(editedUom, withBack);
			return;
		}

		this.addUom(editedUom, withBack);
	}
	prepareUom(): UomModel {
		const controls = this.uomForm.controls;
		const _uom = new UomModel();
		_uom.clear();
		_uom._id = this.uom._id;
		_uom.uom = controls.uom.value.toLowerCase();
		_uom.remarks = controls.remarks.value;
		return _uom;
	}

	addUom( _uom: UomModel, withBack: boolean = false) {
		const addSubscription = this.service.createUom(_uom).subscribe(
			res => {
				const message = `New UOM successfully has been added.`;
				this.layoutUtilsService.showActionNotification(message, MessageType.Create, 5000, true, true);
				const url = `/uom`;
				this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
			},
			err => {
				console.error(err);
				const message = 'Error while adding UOM | ' + err.statusText;
				this.layoutUtilsService.showActionNotification(message, MessageType.Create, 5000, true, false);
			}
		);
		this.subscriptions.push(addSubscription);
	}

	updateUom(_uom: UomModel, withBack: boolean = false) {
		// Update User
		// tslint:disable-next-line:prefer-const
		const addSubscription = this.service.updateUom(_uom).subscribe(
			res => {
				const message = `UOM successfully has been saved.`;
				this.layoutUtilsService.showActionNotification(message, MessageType.Update, 5000, true, true);
				const url = `/uom`;
				this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
			},
			err => {
				console.error(err);
				const message = 'Error while adding UOM | ' + err.statusText;
				this.layoutUtilsService.showActionNotification(message, MessageType.Update, 5000, true, false);
			}
		);
		this.subscriptions.push(addSubscription);
	}

	getComponentTitle() {
		let result = 'Create UOM';
		if (!this.uom || !this.uom._id) {
			return result;
		}

		result = `Edit UOM`;
		return result;
	}

	onAlertClose($event) {
		this.hasFormErrors = false;
	}

  	ngOnDestroy() {
		this.subscriptions.forEach(sb => sb.unsubscribe());
	}
	
}
