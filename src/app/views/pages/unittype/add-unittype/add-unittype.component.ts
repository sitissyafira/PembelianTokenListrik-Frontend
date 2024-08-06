import {Component, OnDestroy, OnInit} from '@angular/core';
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
import { LayoutUtilsService, MessageType } from '../../../../core/_base/crud';
import {UnitTypeModel} from "../../../../core/unittype/unittype.model";
import {
	selectLastCreatedUnitTypeId,
	selectUnitTypeActionLoading,
	selectUnitTypeById
} from "../../../../core/unittype/unittype.selector";
import {UnitTypeService} from '../../../../core/unittype/unittype.service';

@Component({
  selector: 'kt-add-unittype',
  templateUrl: './add-unittype.component.html',
  styleUrls: ['./add-unittype.component.scss']
})
export class AddUnittypeComponent implements OnInit, OnDestroy {
	// Public properties
	unitType: UnitTypeModel;
	UnitTypeId$: Observable<string>;
	oldUnitType: UnitTypeModel;
	selectedTab = 0;
	loading$: Observable<boolean>;
	unitTypeForm: FormGroup;
	loading : boolean = false;
	hasFormErrors = false;
	// Private properties
	private subscriptions: Subscription[] = [];
  	constructor(
		private activatedRoute: ActivatedRoute,
		private router: Router,
		private unitTypeFB: FormBuilder,
		private subheaderService: SubheaderService,
		private layoutUtilsService: LayoutUtilsService,
		private store: Store<AppState>,
		private service: UnitTypeService,
		private layoutConfigService: LayoutConfigService
	) { }

  	ngOnInit() {
		this.loading$ = this.store.pipe(select(selectUnitTypeActionLoading));
		const routeSubscription =  this.activatedRoute.params.subscribe(params => {
			const id = params.id;
			if (id) {
				this.store.pipe(select(selectUnitTypeById(id))).subscribe(res => {
					if (res) {
						this.unitType = res;
						this.oldUnitType = Object.assign({}, this.unitType);
						this.initUnitType();
					}
				});
			} else {
				this.unitType = new UnitTypeModel();
				this.unitType.clear();
				this.initUnitType();
			}
		});
		this.subscriptions.push(routeSubscription);
  	}

	initUnitType() {
		this.createForm();
	}

	createForm() {
		if (this.unitType._id){
		this.unitTypeForm = this.unitTypeFB.group({
			unttp: [this.unitType.unttp, Validators.required],
			untsqr: [this.unitType.untsqr, Validators.required],
		});
		}else{
			this.unitTypeForm = this.unitTypeFB.group({
				unttp: ["", Validators.required],
				untsqr: ["", Validators.required],
			});

		}
	}

	goBackWithId() {
		const url = `/typeunit`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}

	refreshUnitType(isNew: boolean = false, id:string = "") {
		let url = this.router.url;
		if (!isNew) {
			this.router.navigate([url], { relativeTo: this.activatedRoute });
			return;
		}

		url = `/typeunit/edit/${id}`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}


	onSubmit(withBack: boolean = false) {
		this.hasFormErrors = false;
		const controls = this.unitTypeForm.controls;
		/** check form */
		if (this.unitTypeForm.invalid) {
			Object.keys(controls).forEach(controlName =>
				controls[controlName].markAsTouched()
			);

			this.hasFormErrors = true;
			this.selectedTab = 0;
			return;
		}

		this.loading = true
		const editedUnitType = this.prepareUnitType();
		if (editedUnitType._id) {
			this.updateUnitType(editedUnitType, withBack);
			return;
		}
		this.addUnitType(editedUnitType, withBack);
	}
	prepareUnitType(): UnitTypeModel {
		const controls = this.unitTypeForm.controls;
		const _unitType = new UnitTypeModel();
		_unitType.clear();
		_unitType._id = this.unitType._id;
		_unitType.unttp = controls.unttp.value.toLowerCase();
		_unitType.untsqr = controls.untsqr.value;
		return _unitType;
	}

	addUnitType( _unitType: UnitTypeModel, withBack: boolean = false) {
		const addSubscription = this.service.createUnitType(_unitType).subscribe(
			res => {
				const message = `New unit type successfully has been added.`;
				this.layoutUtilsService.showActionNotification(message, MessageType.Create, 5000, true, true);
				const url = `/typeunit`;
				this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
			},
			err => {
				console.error(err);
				const message = 'Error while adding unit type | ' + err.statusText;
				this.layoutUtilsService.showActionNotification(message, MessageType.Create, 5000, true, false);
			}
		);
		this.subscriptions.push(addSubscription);
	}

	updateUnitType(_unitType: UnitTypeModel, withBack: boolean = false) {
		// Update User
		// tslint:disable-next-line:prefer-const
		const addSubscription = this.service.updateUnitType(_unitType).subscribe(
			res => {
				const message = `Unit type successfully has been saved.`;
				this.layoutUtilsService.showActionNotification(message, MessageType.Update, 5000, true, true);
				const url = `/typeunit`;
				this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
			},
			err => {
				console.error(err);
				const message = 'Error while adding unit type | ' + err.statusText;
				this.layoutUtilsService.showActionNotification(message, MessageType.Update, 5000, true, false);
			}
		);
		this.subscriptions.push(addSubscription);
	}

	getComponentTitle() {
		let result = 'Create Unit Type';
		if (!this.unitType || !this.unitType._id) {
			return result;
		}

		result = `Edit Unit Type`;
		return result;
	}

	onAlertClose($event) {
		this.hasFormErrors = false;
	}

  	ngOnDestroy() {
		this.subscriptions.forEach(sb => sb.unsubscribe());
	}

	// onkeydown handler input
	inputKeydownHandler(event) {
		return event.keyCode === 8 || event.keyCode === 46 ? true : !isNaN(Number(event.key)) || event.key === '.';
	}
	
}
