// Angular
import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy, Inject } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

// Material
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

// RXJS
import { Subscription, Observable, BehaviorSubject } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
// Services and Models
import { TransactionsModel } from '../../../../../core/transactions/transactions.model';
import { TransactionsService } from '../../../../../core/transactions/transactions.service';
@Component({
  selector: 'generate-transactions',
  templateUrl: './generate-transactions.dialog.component.html',
  styleUrls: ['./generate-transactions.dialog.component.scss']
})
export class TransactionsGenerateDialogComponent implements OnInit {
  transactions: TransactionsModel;
  type: any;
  transactionsForm: FormGroup;
  hasFormErrors = false;
  loading$: Observable<boolean>;
  formLoading$: Observable<boolean>;
  notFound$: Observable<boolean>;
  viewLoading = false;
  dataLoading = false;
  loadingMessage: string = '';
  isGenerateSuccess: boolean = false;
  errorMessage = undefined;

  // Subject
  loadingSubject = new BehaviorSubject<boolean>(true);
  formLoadingSubject = new BehaviorSubject<boolean>(false);
  notFoundSubject = new BehaviorSubject<boolean>(false);

  private subs: Subscription[] = [];

  constructor(
    public dialogRef: MatDialogRef<TransactionsGenerateDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private cdr: ChangeDetectorRef,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private transactionsService: TransactionsService,
  ) { }

  ngOnInit() {
    this.transactions = this.data.event;

    this.initItem();
  }

  toggleDataLoading(status = false) {
    this.dataLoading = status;
    this.cdr.markForCheck();
  }

  initItem() {
    this.onSubmit();
    this.cdr.markForCheck();
  }

  generateItem() {
    this.generateAccount();
  }

  // Generate List
  generateAccount() {
    this.dialogRef.disableClose = true;
    this.viewLoading = true;
    this.loadingMessage = 'Generating...';
    this.isGenerateSuccess = false;

    this.transactionsService.generateTransactions()
      .subscribe(
        (resp: any) => {
          this.isGenerateSuccess = true;
          this.dialogRef.disableClose = false;
          this.viewLoading = false;
          this.cdr.markForCheck();
        },
        (err) => {
          this.isGenerateSuccess = false;
          this.dialogRef.disableClose = false;
          this.viewLoading = false;
          this.errorMessage = "Error while generate accout history | " + err.statusText;
          this.cdr.markForCheck();
        },
      )
  }

  /**
 * 
 * @returns page title
 */
  getTitle(): string {
    return this.errorMessage ? 'Generate Failed' : 'Generate Account History';
  }

  onSubmit() {
    // Disable actions
    this.dialogRef.disableClose = true;
    this.viewLoading = true;

    this.generateItem();
    this.cdr.markForCheck();
  }


  handleError() {
    this.hasFormErrors = true;
    this.viewLoading = false;
  }

  /** Alert close event */
  onAlertClose($event) {
    this.hasFormErrors = false;
  }
}
