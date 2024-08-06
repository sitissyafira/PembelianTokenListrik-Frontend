import {Component, OnDestroy, OnInit} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
// RxJS
import { BehaviorSubject, Observable, of, Subscription } from 'rxjs';
// NGRX
import { Store, select } from '@ngrx/store';
import { Update } from '@ngrx/entity';
import { AppState } from '../../../../core/reducers';
// Layout
import { SubheaderService, LayoutConfigService } from '../../../../core/_base/layout';
import { LayoutUtilsService, MessageType } from '../../../../core/_base/crud';
import {ApplicationModel} from "../../../../core/application/application.model";
import {
	selectLastCreatedApplicationId,
	selectApplicationActionLoading,
	selectApplicationById
} from "../../../../core/application/application.selector";
import {ApplicationService} from '../../../../core/application/application.service';

@Component({
  selector: 'kt-add-application',
  templateUrl: './add-application.component.html',
  styleUrls: ['./add-application.component.scss']
})
export class AddUnittypeComponent implements OnInit, OnDestroy {
	// Public properties
	application: ApplicationModel;
	ApplicationId$: Observable<string>;
	oldApplication: ApplicationModel;
	selectedTab = 0;
	loading$: Observable<boolean>;
	applicationForm: FormGroup;
	date1 = new FormControl(new Date());
	hasFormErrors = false;
	// Private properties
	private subscriptions: Subscription[] = [];
  	constructor(
		private activatedRoute: ActivatedRoute,
		private router: Router,
		private applicationFB: FormBuilder,
		private subheaderService: SubheaderService,
		private layoutUtilsService: LayoutUtilsService,
		private store: Store<AppState>,
		private service: ApplicationService,
		private layoutConfigService: LayoutConfigService
	) { }

  	ngOnInit() {
		this.loading$ = this.store.pipe(select(selectApplicationActionLoading));
		const routeSubscription =  this.activatedRoute.params.subscribe(params => {
			const id = params.id;
			if (id) {
				this.store.pipe(select(selectApplicationById(id))).subscribe(res => {
					if (res) {
						this.application = res;
						this.oldApplication = Object.assign({}, this.application);
						this.initApplication();
					}
				});
			} else {
				this.application = new ApplicationModel();
				this.application.clear();
				this.initApplication();
			}
		});
		this.subscriptions.push(routeSubscription);
  	}

	initApplication() {
		this.createForm();
	}

	createForm() {
		this.applicationForm = this.applicationFB.group({
			
			startEffDate: [this.application.startEffDate, Validators.required],
			endEffDate: [this.application.endEffDate, Validators.required],
			active: [this.application.active, Validators.required],
			
		});
	}

	goBackWithId() {
		const url = `/application`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}

	refreshApplication(isNew: boolean = false, id:string = "") {
		let url = this.router.url;
		if (!isNew) {
			this.router.navigate([url], { relativeTo: this.activatedRoute });
			return;
		}

		url = `/application/edit/${id}`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}

	reset() {
		this.application = Object.assign({}, this.oldApplication);
		this.createForm();
		this.hasFormErrors = false;
		this.applicationForm.markAsPristine();
		this.applicationForm.markAsUntouched();
		this.applicationForm.updateValueAndValidity();
	}

	onSubmit(withBack: boolean = false) {
		this.hasFormErrors = false;
		const controls = this.applicationForm.controls;
		/** check form */
		if (this.applicationForm.invalid) {
			Object.keys(controls).forEach(controlName =>
				controls[controlName].markAsTouched()
			);

			this.hasFormErrors = true;
			this.selectedTab = 0;
			return;
		}

		const editedApplication = this.prepareApplication();

		if (editedApplication._id) {
			this.updateApplication(editedApplication, withBack);
			return;
		}

		this.addApplication(editedApplication, withBack);
	}
	prepareApplication(): ApplicationModel {
		const controls = this.applicationForm.controls;
		const _application = new ApplicationModel();
		_application.clear();
		_application._id = this.application._id;
		_application.startEffDate = controls.startEffDate.value;
		_application.endEffDate = controls.endEffDate.value;
		_application.active = controls.active.value;
		return _application;
	}

	addApplication( _application: ApplicationModel, withBack: boolean = false) {
		const addSubscription = this.service.createApplication(_application).subscribe(
			res => {
				const message = `New Application successfully has been added.`;
				this.layoutUtilsService.showActionNotification(message, MessageType.Create, 5000, true, true);
				const url = `/application`;
				this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
			},
			err => {
				console.error(err);
				const message = 'Error while adding application | ' + err.statusText;
				this.layoutUtilsService.showActionNotification(message, MessageType.Create, 5000, true, false);
			}
		);
		this.subscriptions.push(addSubscription);
	}

	updateApplication(_application: ApplicationModel, withBack: boolean = false) {
		// Update User
		// tslint:disable-next-line:prefer-const
		const addSubscription = this.service.updateApplication(_application).subscribe(
			res => {
				const message = `Application successfully has been saved.`;
				this.layoutUtilsService.showActionNotification(message, MessageType.Update, 5000, true, true);
				const url = `/application`;
				this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
			},
			err => {
				console.error(err);
				const message = 'Error while adding application | ' + err.statusText;
				this.layoutUtilsService.showActionNotification(message, MessageType.Update, 5000, true, false);
			}
		);
		this.subscriptions.push(addSubscription);
	}

	getComponentTitle() {
		let result = 'Create Application';
		if (!this.application || !this.application._id) {
			return result;
		}

		result = `Edit Application`;
		return result;
	}

	onAlertClose($event) {
		this.hasFormErrors = false;
	}

  	ngOnDestroy() {
		this.subscriptions.forEach(sb => sb.unsubscribe());
	}
	
}
