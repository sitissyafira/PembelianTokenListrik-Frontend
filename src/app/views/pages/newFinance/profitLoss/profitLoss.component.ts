import { ChangeDetectorRef, Component, OnInit, OnDestroy } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Subscription } from 'rxjs';
import { saveAs } from 'file-saver';
import { SelectionModel } from "@angular/cdk/collections";
import { FormControl } from '@angular/forms';

// Services
import { ProfitLossService } from '../../../../core/newFinance/profitLoss/profitLoss.service';
import { SubheaderService, KtDialogService } from '../../../../core/_base/layout';
import { LayoutUtilsService, MessageType } from '../../../../core/_base/crud';

import * as _moment from 'moment';
// tslint:disable-next-line:no-duplicate-imports
import { default as _rollupMoment, Moment } from 'moment';
import { MatDatepicker } from '@angular/material/datepicker';
import { SavingDialog } from "../../../partials/module/saving-confirm/confirmation.dialog.component";
import { MatDialog } from "@angular/material";
import * as FileSave from 'file-saver';


const moment = _rollupMoment || _moment;

import * as pdfMake from "pdfmake/build/pdfmake";
import * as pdfFonts from "pdfmake/build/vfs_fonts";
import { TemplatePDFProfitLoss } from '../../../../core/templatePDF/profitLoss.service';

const appHost = `${location.protocol}//${location.host}`;

(<any>pdfMake).vfs = pdfFonts.pdfMake.vfs;
(<any>pdfMake).fonts = {
  Poppins: {
    normal: `${appHost}/assets/fonts/poppins/regular.ttf`,
    bold: `${appHost}/assets/fonts/poppins/bold.ttf`,
    italics: `${appHost}/assets/fonts/poppins/italics.ttf`,
    bolditalics: `${appHost}/assets/fonts/poppins/bolditalics.ttf`,
  },
};

@Component({
  selector: 'kt-profitLoss',
  templateUrl: './profitLoss.component.html',
  styleUrls: ['./profitLoss.component.scss']
})
export class ProfitLossComponent implements OnInit, OnDestroy {

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
  logDate = {
    start: undefined,
    end: undefined
  };
  // Activator for button
  valid: boolean = false;

  // Private param
  _subs: Subscription[] = [];

  // custom column
  columnsList = [
    "Account No.",
    "Account Type",
    "Description",
    "Last Balance",
    "Current Period",
    "Balance Actual"
  ];
  selectedColumns = [];
  selection = new SelectionModel<any>(true, []);
  monthDate = new FormControl(moment());
  selectedAccount: any[] = [];

  pdfSrc: any = ""


  constructor(
    private cdr: ChangeDetectorRef,
    private dialogueService: KtDialogService,
    private templatePDFProfitLoss: TemplatePDFProfitLoss,
    private profitLossService: ProfitLossService,
    private layoutUtilService: LayoutUtilsService,
    private subHeaderService: SubheaderService,
    private sanitizer: DomSanitizer,
    private dialog: MatDialog
  ) { }

  private initComponent() {
    // Set breadcrumb title
    this.subHeaderService.setTitle('Profit Loss');
  }

  // Disable the input when value is undefined
  dateCheck() {
    if (this.date.start && this.date.end) {
      this.valid = true;
    }
    else this.valid = false;
  }

  addDate(name, e) {
    if (e.target.value === null) this.date[name] = undefined;
    else this.date[name] = moment(e.target.value).format('YYYY-MM-DD');

    this.dateCheck();
  }

  ngOnInit() {
    this.initComponent();
  }

  showPreview(url) {
    const source = this.sanitizer.bypassSecurityTrustResourceUrl(url);
    this.preview.src = source;
    if (!this.preview.status) this.preview.status = true;
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
    if (type === "pdf") {
      this._startLoading('Prepare to downloading document');

      try {
        saveAs(this.preview.blobURL, 'Report Profit Loss.pdf');
        this.layoutUtilService.showActionNotification(
          `Downloading document successfull`,
          MessageType.Create,
          5000,
          true,
          false
        );
      } catch (err) {
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
    this.processSaving()
    const subPreview = this.profitLossService
      .generatePDF({ ...this.date, column: this.selection.selected, account: this.selectedAccount })
      .subscribe(
        (resp) => {
          if (this.pdfSrc !== "" && this.date.start === this.logDate.start) {
            this.layoutUtilService.showActionNotification(
              `Successfull render PDF...`,
              MessageType.Create,
              5000,
              true,
              false
            );
            this.dialog.closeAll()

            return
          }

          const result = this.templatePDFProfitLoss.generatePDFTemplateProfitLoss(resp);

          pdfMake.createPdf(result).getBlob((blob) => {
            const url = URL.createObjectURL(blob);

            this.pdfSrc = this.sanitizer.bypassSecurityTrustResourceUrl(url);

            this.logDate.start = this.date.start
            this.logDate.end = this.date.end

            this.cdr.markForCheck()
            this.dialog.closeAll()

            this.layoutUtilService.showActionNotification(
              `Successfull render PDF...`,
              MessageType.Create,
              5000,
              true,
              false
            );
          });
        },
        (error) => {
          // Show error notification
          this.layoutUtilService.showActionNotification(
            // `Preview document failed | ERROR: ${error.statusText}`,
            `Preview document failed : No data available`,
            MessageType.Create,
            5000,
            true,
            false
          );
          this.dialog.closeAll()
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

  setMonthAndYear(normalizedMonthAndYear: Moment, datepicker: MatDatepicker<Moment>) {
    const ctrlValue = this.monthDate.value!;
    ctrlValue.month(normalizedMonthAndYear.month());
    ctrlValue.year(normalizedMonthAndYear.year());
    this.date.start = moment(ctrlValue).clone().startOf('month').format('YYYY-MM-DD hh:mm');
    this.date.end = moment(ctrlValue).clone().endOf('month').format('YYYY-MM-DD hh:mm');
    this.monthDate.setValue(ctrlValue);

    this.dateCheck();
    datepicker.close();
  }

  export() {
    this.processSaving()
    const subPre = this.profitLossService
      .generateExcel({ ...this.date, column: this.selection.selected, account: this.selectedAccount })
      .subscribe(
        (resp) => {
          const blob = new Blob([resp], { type: "application/pdf" });
          const url = URL.createObjectURL(blob);

          // Save blob url
          this.preview.blobURL = url;

          // save excel
          FileSave.saveAs(`${url}`, "export-PL.xlsx");
          this.dialog.closeAll()
        },
        (error) => {
          // Show error notification
          this.layoutUtilService.showActionNotification(
            // `Preview document failed | ERROR: ${error.statusText}`,
            `Preview document failed : No data available`,
            MessageType.Create,
            5000,
            true,
            false
          );
          this.dialog.closeAll()
          this._stopLoading();
        },
        () => {
          this._stopLoading();
        }
      );
    this._subs.push(subPre);
  }

  ngOnDestroy() {
    this._subs.map(item => {
      item.unsubscribe();
    });
  }

  /**
* Load ProfitLoss Process Saving.
*/
  processSaving() {
    const dialogRef = this.dialog.open(
      SavingDialog,
      {
        data: {
          isGenerateBilling: "",
          msgErrorGenerate: ""
        },
        maxWidth: "565px",
        minHeight: "375px",
        disableClose: true
      }
    );
  }

}
