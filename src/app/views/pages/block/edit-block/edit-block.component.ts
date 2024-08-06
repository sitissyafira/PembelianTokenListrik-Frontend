import { Component, OnInit, OnDestroy } from '@angular/core';
import {BehaviorSubject, Observable, Subscription} from 'rxjs';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {BlockModel} from '../../../../core/block/block.model';
import {ActivatedRoute, Router} from '@angular/router';
import {LayoutConfigService, SubheaderService} from '../../../../core/_base/layout';
import {LayoutUtilsService, MessageType, QueryParamsModel} from '../../../../core/_base/crud';
import {select, Store} from '@ngrx/store';
import {AppState} from '../../../../core/reducers';
import {
	selectBlockActionLoading,
	selectBlockById,
	selectLastCreatedBlockId
} from '../../../../core/block/block.selector'
import {BlockOnServerCreated, BlockUpdated} from '../../../../core/block/block.action';
import {Update} from '@ngrx/entity';
import {SelectionModel} from '@angular/cdk/collections';
import { BlockGroupService } from '../../../../core/blockgroup/blockgroup.service';
import {BlockService} from '../../../../core/block/block.service';

@Component({
  selector: 'kt-edit-block',
  templateUrl: './edit-block.component.html',
  styleUrls: ['./edit-block.component.scss']
})
export class EditBlockComponent implements OnInit, OnDestroy {
	block: BlockModel;
	blockId$: Observable<string>;
	oldBlock: BlockModel;
	selectedTab = 0;
	loading$: Observable<boolean>;
	loading : boolean = false;
	blockForm: FormGroup;
	selection = new SelectionModel<BlockModel>(true, []);
	hasFormErrors = false;
	blockGroupResult: any[] = [];

	// Test properties
	loadingForm: boolean;
	
	// Private properties
	private subscriptions: Subscription[] = [];
	constructor(private activatedRoute: ActivatedRoute,
				private router: Router,
				private blockFB: FormBuilder,
				private subheaderService: SubheaderService,
				private layoutUtilsService: LayoutUtilsService,
				private store: Store<AppState>,
				private service: BlockGroupService,
				private blksrv: BlockService,
				private layoutConfigService: LayoutConfigService) { }

	ngOnInit() {
		this.loadingForm = true;
		this.loading$ = this.store.pipe(select(selectBlockActionLoading));
		const routeSubscription =  this.activatedRoute.params.subscribe(params => {
			const id = params.id;
			if(id){
				const fetchSubscription = this.store.pipe(select(selectBlockById(id))).subscribe(res => {
					if (res) {
						this.block = res;
						this.oldBlock = Object.assign({}, this.block);
						this.initBlock();
					}
				});

				this.subscriptions.push(fetchSubscription);
			}
		});
		
		this.subscriptions.push(routeSubscription);
	}
	initBlock() {
		this.createForm();
	}

	
	createForm() {
		this.loadBlockGroupList();
		this.blockForm = this.blockFB.group({
			cdblk : [this.block.cdblk, Validators.required],
			nmblk : [this.block.nmblk, Validators.required],
			grpnm : [this.block.grpnm],
			grpid : [this.block.grpid._id, Validators.required],
			rt : [this.block.rt, Validators.required],
			rw : [this.block.rw, Validators.required],
			addrblk : [this.block.addrblk, Validators.required],
			phnblk : [this.block.phnblk, Validators.required],
			space:[this.block.space],
			availspace:[this.block.availspace],
			month:[this.block.month, Validators.required],
			dtss:[{value:this.block.dtss, disabled:true}]
		});
	}

	changeDays() {
		const month = this.blockForm.controls.month.value;
		if (month !== 0 ) {
				this.blockForm.controls.dtss.setValue(month * 30);
		}
	}
		
	async loadBlockGroupList() {
		this.selection.clear();
		const queryParams = new QueryParamsModel(
			null,
			"asc",
			null,
			1,
			10
		);

		this.service.getListBlockGroup(queryParams).subscribe(resp => {
			this.blockGroupResult = resp.data;
			this.loadingForm = false;
			
			document.body.style.height = ""
			document.body.style.height = "101%"
			window.scrollTo(0, 5);	
		})
		
	}
	
	goBackWithId() {
		const url = `/block`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}
	refreshBlock(isNew: boolean = false, id:string = "") {
		let url = this.router.url;
		if (!isNew) {
			this.router.navigate([url], { relativeTo: this.activatedRoute });
			return;
		}

		url = `/block/edit/${id}`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}
	
	
	onSubmit(withBack: boolean = false) {
		this.hasFormErrors = false;
		const controls = this.blockForm.controls;
		/** check form */
		if (this.blockForm.invalid) {
			Object.keys(controls).forEach(controlName =>
				controls[controlName].markAsTouched()
			);

			this.hasFormErrors = true;
			this.selectedTab = 0;
			return;
		}
		this.loading = true;
		const preparedBlock = this.prepareBlockGroup();
		this.updateBlock(preparedBlock, withBack);
	}
	prepareBlockGroup(): BlockModel {
		const controls = this.blockForm.controls;
		const _block = new BlockModel();
		_block.clear();
		_block._id = this.block._id;
		_block.cdblk = controls.cdblk.value.toLowerCase();
		_block.nmblk = controls.nmblk.value.toLowerCase();
		_block.grpid = controls.grpid.value;
		_block.grpnm = controls.grpnm.value.toLowerCase();
		_block.rt = controls.rt.value;
		_block.rw = controls.rw.value;
		_block.month = controls.month.value;
		_block.space = controls.space.value;
		_block.availspace = controls.availspace.value;
		_block.dtss = controls.dtss.value;
		_block.addrblk = controls.addrblk.value.toLowerCase();
		_block.phnblk = controls.phnblk.value;
		return _block;
	}
	updateBlock(_block: BlockModel, withBack: boolean = false) {
		const editSubscription = this.blksrv.updateBlock(_block).subscribe(
			res => {
				const message = `Block successfully has been saved.`;
				this.layoutUtilsService.showActionNotification(message, MessageType.Update, 5000, true, true);
				if (withBack) {
					this.goBackWithId();
				} else {
					this.refreshBlock(false);
					const url = `/block`;
					this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
				}
			},
			err => {
				console.error(err);
				const message = 'Error while editing block | ' + err.statusText;
				this.layoutUtilsService.showActionNotification(message, MessageType.Update, 5000, true, false);
			}
		);
		this.subscriptions.push(editSubscription);
	}

	getSingleProject(id){
		const controls = this.blockForm.controls;
		this.service.getBlockGroupByIdBlock(id).subscribe(data => {
			controls.grpnm.setValue(data.data.grpnm)
		});
	}

	ngOnDestroy(){
		this.subscriptions.forEach(sb => sb.unsubscribe());
	}

	getComponentTitle() {
		let result = 'Edit Block';

		return result;
	}
	onAlertClose($event) {
		this.hasFormErrors = false;
	}
}