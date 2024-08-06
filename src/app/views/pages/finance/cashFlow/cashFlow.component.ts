import { ChangeDetectorRef, Component, OnInit, OnDestroy } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Subscription } from 'rxjs';
import { saveAs } from 'file-saver';
import { SelectionModel } from "@angular/cdk/collections";

// Services
import { CashFlowService } from '../../../../core/finance/cashFlow/cashFlow.service';
import { SubheaderService, KtDialogService } from '../../../../core/_base/layout';
import { LayoutUtilsService, MessageType } from '../../../../core/_base/crud';
import moment from 'moment';

@Component({
  selector: 'kt-cashFlow',
  templateUrl: './cashFlow.component.html',
  styleUrls: ['./cashFlow.component.scss']
})
export class CashFlowComponent implements OnInit, OnDestroy {

  loading = {
    msg: '',
    status: false
  };
  preview = {
    src: undefined,
    blobURL: '',
    status: false
  };
  date = {
    start: undefined,
    end: undefined
  };
  // Activator for button
  valid: boolean = false;
  
  // Private param
  _subs: Subscription[] = [];
  // custom column
	columnsList = [
		"Date",
		"Description",
		"Transaction Account",
		"Account No.",
		"Dr",
		"Cr",
		"Balance",
	];
	selectedColumns = [];
	selection = new SelectionModel<any>(true, []);
  constructor(
    private cdr: ChangeDetectorRef,
    private dialogueService: KtDialogService,
    private cashFlowService: CashFlowService,
    private layoutUtilService: LayoutUtilsService,
    private subHeaderService: SubheaderService,
    private sanitizer: DomSanitizer
  ) { }

  private initComponent() {
    // Set breadcrumb title
    this.subHeaderService.setTitle('Cash Flow');
  }

  // Disable the input when value is undefined
  dateCheck() {
    if(this.date.start && this.date.end) {
      this.valid = true;
    }
    else this.valid = false;
  }
  
  addDate(name, e) {
    if(e.target.value === null) this.date[name] = undefined;
    else this.date[name] = moment(e.target.value).format('YYYY-MM-DD');
    
    this.dateCheck();
  }

  ngOnInit() {
    this.initComponent();
  }

  showPreview(url) {
    const source = this.sanitizer.bypassSecurityTrustResourceUrl(url);
    this.preview.src = source;
    if(!this.preview.status) this.preview.status = true;
  }
  
  _startLoading(msg = '') {
    this.loading.status = true;
    this.loading.msg = msg;

    this.dialogueService.show();
  }

  _stopLoading() {
    this.loading.status = false;
    this.dialogueService.hide();

    this.cdr.markForCheck();
  }

  // Accept string param pdf or spreadsheet only
  downloadFile(type: "pdf" | "spreadsheet") {
    if(type === "pdf") {
      this._startLoading('Prepare to downloading document');
      
      try {
        saveAs(this.preview.blobURL, 'Report Cash Flow.pdf');
        this.layoutUtilService.showActionNotification(
          `Downloading document successfull`,
          MessageType.Create,
          5000,
          true,
          false
        );
      } catch(err) {
        // Show error notification
        this.layoutUtilService.showActionNotification(
          `Downloading document failed | ERROR: ${err.statusText}`,
          MessageType.Create,
          5000,
          true,
          false
        );
        this._stopLoading();
      } finally {
        this._stopLoading();
      }
    }
  }
  
  getPreviewSource() {
    this._startLoading("Prepare to preview the document");

    const subPreview = this.cashFlowService.generatePDF({ ...this.date, column: this.selection.selected }).subscribe(
      resp => {
        const blob = new Blob([resp], { type: "application/pdf" });
        const url = URL.createObjectURL(blob);
        
        // Save blob url
        this.preview.blobURL = url;

        // Make the preview PDF fit to frame
        this.showPreview(`${url}#view=FitH`);
      },
      error => {
        // Show error notification
        this.layoutUtilService.showActionNotification(
          `Preview document failed | ERROR: ${error.statusText}`,
          MessageType.Create,
          5000,
          true,
          false
        );

        this._stopLoading();
      },
      () => {
        this._stopLoading();
      }
    );

    this._subs.push(subPreview);
  }

  isAllSelected() {
		const numSelected = this.selection.selected.length;
		const numRows = this.columnsList.length;
		return numSelected === numRows;
	}

	masterToggle() {
		this.isAllSelected()
			? this.selection.clear()
			: this.columnsList.forEach((col) => this.selection.select(col));
	}

  ngOnDestroy() {
    this._subs.map(item => {
      item.unsubscribe();
    });
  }
}
