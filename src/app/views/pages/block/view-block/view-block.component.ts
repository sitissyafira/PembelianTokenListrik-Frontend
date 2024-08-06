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
  selector: 'kt-view-block',
  templateUrl: './view-block.component.html',
  styleUrls: ['./view-block.component.scss']
})

export class ViewBlockComponent implements OnInit, OnDestroy {
	block: BlockModel;
	blockId$: Observable<string>;
	oldBlock: BlockModel;
	selectedTab = 0;
	loading$: Observable<boolean>;
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
			cdblk : [{value:this.block.cdblk, disabled:true}],
			nmblk : [{value:this.block.nmblk, disabled:true}],
			grpnm : [{value:this.block.grpnm, disabled:true}],
			grpid : [{value:this.block.grpid._id, disabled:true}],
			rt : [{value:this.block.rt, disabled:true}],
			rw : [{value:this.block.rw, disabled:true}],
			addrblk : [{value:this.block.addrblk, disabled:true}],
			phnblk : [{value:this.block.phnblk, disabled:true}],
			space:[{value:this.block.space, disabled:true}],
			availspace:[{value:this.block.availspace, disabled:true}],
			month:[{value:this.block.month, disabled:true}],
			dtss:[{value:this.block.dtss, disabled:true}]
		});
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

	ngOnDestroy(){
		this.subscriptions.forEach(sb => sb.unsubscribe());
	}

	getComponentTitle() {
		let result = 'View Block';

		return result;
	}
	onAlertClose($event) {
		this.hasFormErrors = false;
	}
}