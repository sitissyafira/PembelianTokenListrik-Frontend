import { Component, OnDestroy, OnInit } from '@angular/core';
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
import { AccountHistoryModel } from "../../../../core/accountHistory/accountHistory.model";
import {
	selectLastCreatedAccountHistoryId,
	selectAccountHistoryActionLoading,
	selectAccountHistoryById
} from "../../../../core/accountHistory/accountHistory.selector";
import { AccountHistoryService } from '../../../../core/accountHistory/accountHistory.service';
import { CustomerService } from '../../../../core/customer/customer.service';
import { SelectionModel } from '@angular/cdk/collections';
import { QueryUnitModel } from '../../../../core/unit/queryunit.model';
import { UnitService } from '../../../../core/unit/unit.service';
import { VehicleTypeModel } from '../../../../core/vehicletype/vehicletype.model';
import { VehicleTypeService } from '../../../../core/vehicletype/vehicletype.service';
import { BlockService } from '../../../../core/block/block.service';
import { OwnershipContractService } from '../../../../core/contract/ownership/ownership.service';
import { LeaseContractService } from '../../../../core/contract/lease/lease.service';
import { QueryleaseModel } from '../../../../core/contract/lease/querylease.model';
import { QueryOwnerTransactionModel } from '../../../../core/contract/ownership/queryowner.model';

@Component({
	selector: 'kt-view-accountHistory',
	templateUrl: './view-accountHistory.component.html',
	styleUrls: ['./view-accountHistory.component.scss']
})
export class ViewAccountHistoryComponent implements OnInit, OnDestroy {
	// Public properties
	accountHistory: AccountHistoryModel;
	AccountHistoryId$: Observable<string>;
	oldAccountHistory: AccountHistoryModel;
	selectedTab = 0;
	loading$: Observable<boolean>;
	selection = new SelectionModel<AccountHistoryModel>(true, []);
	accountHistoryForm: FormGroup;
	hasFormErrors = false;
	unitResult: any[] = [];
	customerResult: any[] = [];
	vehicleResult: any[] = [];
	blockResult: any[] = [];

	loading: boolean = false;
	loadingForm: boolean;

	// Private properties
	private subscriptions: Subscription[] = [];
	constructor(
		private activatedRoute: ActivatedRoute,
		private router: Router,
		private accountHistoryFB: FormBuilder,
		private subheaderService: SubheaderService,
		private layoutUtilsService: LayoutUtilsService,
		private store: Store<AppState>,
		private service: AccountHistoryService,
		private cservice: CustomerService,
		private uservice: UnitService,
		private ownerService: OwnershipContractService,
		private leaseService: LeaseContractService,
		private vservice: VehicleTypeService,
		private bservice: BlockService,
		private layoutConfigService: LayoutConfigService
	) { }

	ngOnInit() {
		this.loading$ = this.store.pipe(select(selectAccountHistoryActionLoading));
		this.activatedRoute.params.subscribe(params => {
      const id = params.id;
      if (id) {
        // Check store first before get data
        this.store.pipe(
          select(selectAccountHistoryById(id))
        ).subscribe(result => {
          // Load from service if not found from storage
          if (!result) {
            this.loadItemFromService(id);
            return;
          }

          this.loadItem(result);
        })
      }
    });
		
	}

	loadItem(_item) {
    // if (!_item) this.goBackWithId();

    this.accountHistory = _item;
  }

  loadItemFromService(id: string) {
    this.service.findAccountHistoryById(id).subscribe(
      res => {
        this.loadItem(res.data);
      },
      err => {
        
      }
    );
  }

  optionalChecking(value) {
    return value ? value : '-';
  }

	isNumberNegatif(value) {
    if(value < 0){
      let result = value.toString().split('');
      result.shift();
      let number = result.join('');
      return `(${this.idrFormat(Number(number))})`;
    } else {
      return this.idrFormat(value);
    }
  }

	idrFormat(val) {
    // Using ES6
    return new Intl.NumberFormat('id-ID',
      { style: 'currency', currency: 'IDR', minimumFractionDigits: 2 }
    ).format(val);
  }

	goBackWithId() {
		const url = `/accountHistory`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}


	getComponentTitle() {
		let result = `View Account History`;
		return result;
	}

	onAlertClose($event) {
		this.hasFormErrors = false;
	}

	ngOnDestroy() {
		this.subscriptions.forEach(sb => sb.unsubscribe());
	}

}
