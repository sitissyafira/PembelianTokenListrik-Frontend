// Angular
import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy, Inject, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { SelectionModel } from "@angular/cdk/collections";
// Material
import { MatDialogRef, MAT_DIALOG_DATA, MatPaginator, MatSort, MatDialog, MatSnackBar } from '@angular/material';
// RXJS
import { debounceTime, distinctUntilChanged, tap, skip } from "rxjs/operators";
import { fromEvent, merge, Subscription, BehaviorSubject } from "rxjs";
// NGRX
import { Store, select } from '@ngrx/store';
import { AppState } from '../../../../../core/reducers';
// CRUD
import { LayoutUtilsService, MessageType, QueryParamsModel } from '../../../../../core/_base/crud';
import { SubheaderService } from '../../../../../core/_base/layout';
import { ActivatedRoute, Router } from '@angular/router';
// Services and Models
import {
  selectAccountGroupActionLoading,
  selectAccountGroupById,
} from '../../../../../../app/core/accountGroup/accountGroup.selector';
import { AccountGroupModel } from '../../../../../../app/core/accountGroup/accountGroup.model';
import { AccountGroupService } from '../../../../../../app/core/accountGroup/accountGroup.service';
import { AccountGroupDataSource } from '../../../../../../app/core/accountGroup/accountGroup.datasource';
@Component({
  selector: 'add-account-list-dialog',
  templateUrl: './add-account-list.dialog.component.html',
  styleUrls: ['./add-account-list.dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class AddAccountListDialogComponent implements OnInit {
  // Table fields
	dataSource: AccountGroupDataSource;
	accountGroup: AccountGroupModel;
	displayedColumns = [
		'check', 'acctNo', 'acctName', 'accType', 'balance'
	];
	@ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
	@ViewChild("sort1", { static: true }) sort: MatSort;
	// Filter fields
	@ViewChild("searchInput", { static: true }) searchInput: ElementRef;
	// Selection
	selection = new SelectionModel<AccountGroupModel>(true, []);
	AccountGroupResult: AccountGroupModel[] = [];
	// Subscriptions
	private subs: Subscription[] = [];
	viewLoading = false;
	dataLoading = false;
	isButtonActive: boolean = true;

  hasFormErrors = false;
  errorMessage: any;
	accountList = [];
	accountDataFilter = [];
	accountCategory: any;

  // Subject
  loadingSubject = new BehaviorSubject<boolean>(true);
  formLoadingSubject = new BehaviorSubject<boolean>(false);
  notFoundSubject = new BehaviorSubject<boolean>(false);

  /**
   * Componet constructor
   *
   * @param dialog
   * @param snackBar
   * @param layoutUtilsService
   * @param subheaderService
   * @param store
   */

  constructor(
    public dialogRef: MatDialogRef<AddAccountListDialogComponent>,
    public dialog: MatDialog,
		public snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private cdr: ChangeDetectorRef,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private store: Store<AppState>,
    private fb: FormBuilder,
    private subheaderService: SubheaderService,
    private accountGroupService: AccountGroupService,
    private layoutUtilsService: LayoutUtilsService,
  ) { }

  ngOnInit() {
    this.store.pipe(select(selectAccountGroupActionLoading)).subscribe(res => this.viewLoading = res);

    // First load
    this.loadAccountGroupList(this.data);
  }

	loadAccountGroupList(data) {
	if(data.accountCategory) {
			this.dataLoading = true;
			this.accountList = data.accountCategory.filter(item => {
				if(!data.selectedAccount.includes(item)) return true;
			});
			this.accountDataFilter = this.accountList;
			this.dataLoading = false;
		}
	}

  filterConfiguration(): any {
		const searchNo: number = this.searchInput.nativeElement.value;
		return searchNo;
	}

	toggleDataLoading(status = false) {
    this.dataLoading = status;
    this.cdr.markForCheck();
  }

  isAllSelected() {
		const numSelected = this.selection.selected.length;
		const numRows = this.accountList.length;
		return numSelected === numRows;
	}

	masterToggle() {
		this.isAllSelected()
			? this.selection.clear()
			: this.accountList.forEach((col) => this.selection.select(col));
	}

  onSubmit() {
		// Disable actions
		this.dialogRef.disableClose = true;

		const _formValue = this.selection.selected;
		this.addAccountList(_formValue);
	}

	_onKeyup(e) {
		this._filterCategory(e.target.value);
	}

	_filterCategory(text: string) {
		this.accountList = this.accountDataFilter.filter((i) => {
			const filterText = `${i.acctName.toUpperCase()}`;
			const filterNumber = `${i.acctName.toUpperCase()}`;
			if ((filterText && filterText.includes(text.toUpperCase())) || (filterText && filterText.includes(text.toUpperCase()))) return true;
		});
	}

	addAccountList(formValue: any) {
		this.dialogRef.close({ formValue });
	}

	handleError() {
		this.hasFormErrors = true;
	}

  optionalChecking(value) {
    return value ? value : "-";
  }

  /** Alert close event */
  onAlertClose($event) {
    this.hasFormErrors = false;
  }
}
