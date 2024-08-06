import {ChangeDetectorRef, Component, OnDestroy, OnInit} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Observable, Subscription } from 'rxjs';
import { Store, select } from '@ngrx/store';
import { AppState } from '../../../../../../core/reducers';
import { SubheaderService, LayoutConfigService } from '../../../../../../core/_base/layout';
import { LayoutUtilsService, MessageType } from '../../../../../../core/_base/crud';
import {ComTypeModel} from "../../../../../../core/commersil/master/comType/comType.model";
import {
	selectComTypeActionLoading,
} from "../../../../../../core/commersil/master/comType/comType.selector";
import {ComTypeService} from '../../../../../../core/commersil/master/comType/comType.service';
import { SelectionModel } from '@angular/cdk/collections';

@Component({
  selector: 'kt-add-comType',
  templateUrl: './add-comType.component.html',
  styleUrls: ['./add-comType.component.scss']
})
export class AddComTypeComponent implements OnInit, OnDestroy {
	datauser = localStorage.getItem("user");
	comType: ComTypeModel;
	ComTypeId$: Observable<string>;
	selection = new SelectionModel<ComTypeModel>(true, []);
	oldComType: ComTypeModel;
	selectedTab = 0;
	loading$: Observable<boolean>;
	comTypeForm: FormGroup;
	hasFormErrors = false;
	loading : boolean = false;
	productCategoryResult: any[] = [];
	productBrandResult: any[] = [];
	UOMResult: any[] = [];
	date1 = new FormControl(new Date());

	private loadingData = {
		productCategory: false,
		productBrand : false,
		UOM : false
	}

	private subscriptions: Subscription[] = [];
  	constructor(
		private activatedRoute: ActivatedRoute,
		private router: Router,
		private comTypeFB: FormBuilder,
		private subheaderService: SubheaderService,
		private layoutUtilsService: LayoutUtilsService,
		private store: Store<AppState>,
		private service: ComTypeService,
		private cd: ChangeDetectorRef,
		private layoutConfigService: LayoutConfigService
	) { }

  	ngOnInit() {
		this.loading$ = this.store.pipe(select(selectComTypeActionLoading));
		const routeSubscription =  this.activatedRoute.params.subscribe(params => {
				this.comType = new ComTypeModel();
				this.comType.clear();
				this.initComType();
			}
		)
		this.subscriptions.push(routeSubscription);
  	}

	initComType() {
		this.createForm();
	}

	createForm() {
			this.comTypeForm = this.comTypeFB.group({
				unitTypeMaster : [""],
				unitType: [""],
				unitPrice: [""],
				service_rate: [""],
				sinking_fund: [""],
				description : [""],
				created_date : [this.date1.value],
				created_by: [{value:this.datauser, disabled:true}],
			});
	}

	goBackWithId() {
		const url = `/comType`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}
	refreshComType(isNew: boolean = false, id:string = "") {
		let url = this.router.url;
		if (!isNew) {
			this.router.navigate([url], { relativeTo: this.activatedRoute });
			return;
		}
		url = `/comType/edit/${id}`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}
	onSubmit(withBack: boolean = false) {
		this.hasFormErrors = false;
		const controls = this.comTypeForm.controls;
		if (this.comTypeForm.invalid) {
			Object.keys(controls).forEach(controlName =>
				controls[controlName].markAsTouched()
			);

			this.hasFormErrors = true;
			this.selectedTab = 0;
			return;
		}

		this.loading = true;
		const editedComType = this.prepareComType();
		this.addComType(editedComType, withBack);
	}

	prepareComType(): ComTypeModel {
		const controls = this.comTypeForm.controls;
		const _comType = new ComTypeModel();
		_comType.clear();
		_comType._id = this.comType._id;
		_comType.unitTypeMaster = controls.unitTypeMaster.value.toLowerCase();
		_comType.unitType = controls.unitType.value.toLowerCase();
		_comType.service_rate = controls.service_rate.value;
		_comType.sinking_fund = controls.sinking_fund.value;
		_comType.unitPrice = controls.unitPrice.value;
		_comType.description = controls.description.value;
		_comType.created_date = controls.created_date.value;
		
		_comType.created_by = controls.created_by.value;
		return _comType;

	}

	addComType( _comType: ComTypeModel, withBack: boolean = false) {
		const addSubscription = this.service.createComType(_comType).subscribe(
			res => {
				const message = `New commersil type successfully has been added.`;
				this.layoutUtilsService.showActionNotification(message, MessageType.Create, 5000, true, true);
				const url = `/comType`;
				this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
			},
			err => {
				console.error(err);
				const message = 'Error while adding commersil type | ' + err.statusText;
				this.layoutUtilsService.showActionNotification(message, MessageType.Create, 5000, true, false);
			}
		);
		this.subscriptions.push(addSubscription);
	}


	getComponentTitle() {
		let result = 'Create Commercial Type';
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
