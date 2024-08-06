import {Component, OnDestroy, OnInit} from '@angular/core';
import {BehaviorSubject, Observable, Subscription} from 'rxjs';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {BlockgroupModel} from '../../../../core/blockgroup/blockgroup.model';
import {ActivatedRoute, Router} from '@angular/router';
import {LayoutConfigService, SubheaderService} from '../../../../core/_base/layout';
import {LayoutUtilsService, MessageType, QueryParamsModel} from '../../../../core/_base/crud';
import {select, Store} from '@ngrx/store';
import {AppState} from '../../../../core/reducers';
import {
	selectBlockGroupActionLoading,
	selectBlockGroupById,
	selectLastCreatedBlockGroupId
} from '../../../../core/blockgroup/blockgroup.selector';
import {BlockGroupOnServerCreated, BlockGroupUpdated} from '../../../../core/blockgroup/blockgroup.action';
import {Update} from '@ngrx/entity';
import {SelectionModel} from '@angular/cdk/collections';
import { BlockGroupService} from '../../../../core/blockgroup/blockgroup.service';

@Component({
  selector: 'kt-edit-block-group',
  templateUrl: './edit-block-group.component.html',
  styleUrls: ['./edit-block-group.component.scss']
})
export class EditBlockGroupComponent implements OnInit, OnDestroy {
	blockgroup: BlockgroupModel;
	blockgroupId$: Observable<string>;
	oldBlockGroup: BlockgroupModel;
	selectedTab = 0;
	loading$: Observable<boolean>;
	blockGroupForm: FormGroup;
	selection = new SelectionModel<BlockgroupModel>(true, []);
	hasFormErrors = false;
	blockGroupResult: any[] = [];
	// Private properties
	private subscriptions: Subscription[] = [];
	constructor(private activatedRoute: ActivatedRoute,
		private router: Router,
		private blockGroupFB: FormBuilder,
		private subheaderService: SubheaderService,
		private layoutUtilsService: LayoutUtilsService,
		private store: Store<AppState>,
		private service: BlockGroupService,
		private layoutConfigService: LayoutConfigService) { }
	ngOnInit() {
		this.loading$ = this.store.pipe(select(selectBlockGroupActionLoading));
		const routeSubscription =  this.activatedRoute.params.subscribe(params => {
			const id = params.id;
			if(id){
				this.store.pipe(select(selectBlockGroupById(id))).subscribe(res => {
					if (res) {
						this.blockgroup = res;
						this.oldBlockGroup = Object.assign({}, this.blockgroup);
						this.initBlockGroup();
					}
				});

			}
		});
		this.loadBlockGroupList();
		this.subscriptions.push(routeSubscription);
	}
	ngOnDestroy(){
		this.subscriptions.forEach(sb => sb.unsubscribe());
	}
	initBlockGroup() {

		this.createForm();
	}
	createForm() {
		this.blockGroupForm = this.blockGroupFB.group({
			grpnm : [this.blockgroup.grpnm, Validators.required],
			crtdate : [this.blockgroup.crtdate, Validators.required],
			upddate : [this.blockgroup.upddate, Validators.required]
		});
	}
	goBackWithId() {
		const url = `/bgroup`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}
	refreshBlockGroup(isNew: boolean = false, id:string = "") {
		let url = this.router.url;
		if (!isNew) {
			this.router.navigate([url], { relativeTo: this.activatedRoute });
			return;
		}

		url = `/bgroup/edit/${id}`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}
	reset() {
		this.blockgroup = Object.assign({}, this.oldBlockGroup);
		this.createForm();
		this.hasFormErrors = false;
		this.blockGroupForm.markAsPristine();
		this.blockGroupForm.markAsUntouched();
		this.blockGroupForm.updateValueAndValidity();
	}
	onSubmit(withBack: boolean = false) {
		this.hasFormErrors = false;
		const controls = this.blockGroupForm.controls;
		/** check form */
		if (this.blockGroupForm.invalid) {
			Object.keys(controls).forEach(controlName =>
				controls[controlName].markAsTouched()
			);

			this.hasFormErrors = true;
			this.selectedTab = 0;
			return;
		}
		const preparedBlockGroup = this.prepareBlockGroup();
		this.updateBlockGroup(preparedBlockGroup, withBack);
	}
	prepareBlockGroup(): BlockgroupModel {
		const controls = this.blockGroupForm.controls;
		const _blockgroup = new BlockgroupModel();
		_blockgroup.clear();
		_blockgroup._id = this.blockgroup._id;
		_blockgroup.crtdate = controls.crtdate.value;
		_blockgroup.upddate = controls.upddate.value;
		_blockgroup.grpnm = controls.grpnm.value;
		return _blockgroup;
	}
	updateBlockGroup(_blockgroup: BlockgroupModel, withBack: boolean = false) {

		// tslint:disable-next-line:prefer-const
		const editSubscription = this.service.updateBlockGroup(_blockgroup).subscribe(
			res => {
				const message = `Block group successfully has been edited.`;
				this.layoutUtilsService.showActionNotification(message, MessageType.Create, 5000, true, true);
				if (withBack) {
					this.goBackWithId();
				} else {
					this.refreshBlockGroup(false);
					const url = `/bgroup`;
					this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
				}
			},
			err => {
				console.error(err);
				const message = 'Error while editing block group | ' + err.statusText;
				this.layoutUtilsService.showActionNotification(message, MessageType.Create, 5000, true, false);
			}
		);
		this.subscriptions.push(editSubscription);
	}
	loadBlockGroupList() {
		this.selection.clear();
		const queryParams = new QueryParamsModel(
			null,
			"asc",
			"grpnm",
			1,
			10
		);
		this.service.getListBlockGroup(queryParams).subscribe(
			res => {
				this.blockGroupResult = res.data;
			}
		);
	}
	getComponentTitle() {
		let result = 'Edit Project';

		return result;
	}
	onAlertClose($event) {
		this.hasFormErrors = false;
	}
}
