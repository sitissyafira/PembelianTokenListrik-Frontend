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
} from '../../../../core/blockgroup/blockgroup.selector'
import {BlockGroupOnServerCreated, BlockGroupRequested} from '../../../../core/blockgroup/blockgroup.action';
import {SelectionModel} from '@angular/cdk/collections';
import {BlockGroupDataSource} from '../../../../core/blockgroup/blockgroup.datasource';
import { BlockGroupService} from '../../../../core/blockgroup/blockgroup.service';
import {distinctUntilChanged, skip} from 'rxjs/operators';

@Component({
  selector: 'kt-add-block-group',
  templateUrl: './add-block-group.component.html',
})
export class AddBlockGroupComponent implements OnInit, OnDestroy {
	dataSource: BlockGroupDataSource;
	blockgroup: BlockgroupModel;
	blockgroupId$: Observable<string>;
	oldUser: BlockgroupModel;
	selectedTab = 0;
	loading$: Observable<boolean>;
	blockGroupForm: FormGroup;
	hasFormErrors = false;
	selection = new SelectionModel<BlockgroupModel>(true, []);
	blockGroupResult: any[] = [];
	// Private properties
	private subscriptions: Subscription[] = [];

	constructor(private activatedRoute: ActivatedRoute,
				private router: Router,
				private blockGroupFB: FormBuilder,
				private subheaderService: SubheaderService,
				private service: BlockGroupService,
				private layoutUtilsService: LayoutUtilsService,
				private store: Store<AppState>,
				private layoutConfigService: LayoutConfigService) { }

	ngOnInit() {
		this.loading$ = this.store.pipe(select(selectBlockGroupActionLoading));
		const routeSubscription =  this.activatedRoute.params.subscribe(params => {
			this.blockgroup = new BlockgroupModel();
			this.blockgroup.clear();
			this.initBlockGroup();
		});
		this.subscriptions.push(routeSubscription);
	}
	initBlockGroup() {
		this.createForm();
		this.loadBlockGroupList();
		
	}
	ngOnDestroy(){
		this.subscriptions.forEach(sb => sb.unsubscribe());
	}
	createForm() {
		this.blockGroupForm = this.blockGroupFB.group({
			grpnm : ["", Validators.required],
			crtdate : [""],
			upddate : [""],
			prntid: [""]
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
		this.blockgroup = Object.assign({}, this.oldUser);
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
		this.addBlockGroup(preparedBlockGroup, withBack);
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
	prepareBlockGroup(): BlockgroupModel {
		const controls = this.blockGroupForm.controls;
		const _blockgroup = new BlockgroupModel();
		_blockgroup.clear();
		_blockgroup._id = this.blockgroup._id;
		_blockgroup.grpnm = controls.grpnm.value;
		_blockgroup.crtdate = controls.crtdate.value;
		_blockgroup.upddate = controls.upddate.value;
		// _blockgroup.prntid = controls.prntid.value;
		return _blockgroup;
	}
	addBlockGroup(_blockgroup: BlockgroupModel, withBack: boolean = false) {
		// this.store.dispatch(new BlockGroupOnServerCreated({ blockgroup: _blockgroup }));
		const addSubscription = this.service.createBlockGroup(_blockgroup).subscribe(
			res => {
				const message = `New block group successfully has been added.`;
				this.layoutUtilsService.showActionNotification(message, MessageType.Create, 5000, true, true);
				const url = `/bgroup`;
				this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
			},
			err => {
				console.error(err);
				const message = 'Error while adding block group | ' + err.statusText;
				this.layoutUtilsService.showActionNotification(message, MessageType.Create, 5000, true, false);
			}
		);
		this.subscriptions.push(addSubscription);
	}
	getComponentTitle() {
		let result = 'Create Project';

		return result;
	}
	onAlertClose($event) {
		this.hasFormErrors = false;
	}
}
