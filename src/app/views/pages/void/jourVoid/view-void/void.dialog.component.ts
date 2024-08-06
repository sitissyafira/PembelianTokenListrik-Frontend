// Angular
import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy, Inject, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

// Material
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

// RXJS
import { Subscription, Observable, BehaviorSubject } from 'rxjs';
import { environment } from '../../../../../../environments/environment';
import { LayoutUtilsService, MessageType } from '../../../../../core/_base/crud';
@Component({
  selector: 'void-dialog',
  templateUrl: './void.dialog.component.html',
  styleUrls: ['./void.dialog.component.scss']
})
export class VoidBillingView implements OnInit {
  billdelForm: FormGroup;

  urlServer: string = `${environment.baseAPI}/voidBill/`

  // Upload Image (new) START
  images: any[] = []
  myFiles: any[] = []
  @ViewChild('fileInput', { static: false }) fileInputEl: ElementRef;
  // Upload Image (new) END

  isGenerateBilling: string = "" /* To determine the condition of the generating billing process in progress */
  msgErrorGenerate: string = "" /* To display message error proccessing generate */

  // Information List
  informationList: any[] = []


  private subs: Subscription[] = [];

  constructor(
    public dialogRef: MatDialogRef<VoidBillingView>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private delBillFB: FormBuilder,
    private cdr: ChangeDetectorRef,
    private layoutUtilsService: LayoutUtilsService,
    private dialog: MatDialog,
  ) { }

  ngOnInit() {
    this.initItem();
  }

  toggleDataLoading(status = false) {
    this.cdr.markForCheck();
  }

  initItem() {
    this.viewDataInp()
    this.createForm()
    this.cdr.markForCheck();
  }

  viewDataInp() {
    this.informationList = [
      {
        name: "Reason Delete",
        value: this.changeNameStatus(this.data.dataVoid.reasonDel)
      },
      {
        name: "Unit",
        value: this.data.dataVoid.unit ? this.data.dataVoid.unit : "-"
      },
      {
        name: "Journal Date",
        value: this.data.dataVoid.journal_date
      },
      {
        name: "Delete Date",
        value: this.data.dataVoid.delete_date
      },
      {
        name: "Update By",
        value: this.data.dataVoid.updateBy_name
      },
    ]
  }

  closePopUp() {
    this.dialogRef.close()
  }

  /**
   * @param value 
   */
  changeNameStatus(value) {
    // 1. Correction of payment data
    // 2. Improved meter data input
    // 3. Set the transaction date
    if (value === "copd") return "Correction of payment data"
    else if (value === "imdi") return "Improved meter data input"
    else if (value === "sttd") return "Set the transaction date"
  }

  createForm() {
    this.billdelForm = this.delBillFB.group({
      reasonDel: [{ value: "", disabled: false }, Validators.required],
      descriptionDelete: [{ value: "", disabled: false }, Validators.required],
    });
  }

  // Upload Image (new) START
  selectFileUpload(e) {
    const files = (e.target as HTMLInputElement).files;

    if (files.length > 1 || this.myFiles.length >= 1 || this.images.length >= 1) {
      this.fileInputEl.nativeElement.value = "";
      const message = `Only 1 images are allowed to select`;
      this.layoutUtilsService.showActionNotification(message, MessageType.Create, 5000, true, true);

      return
    }

    for (let i = 0; i < files.length; i++) {
      // Skip uploading if file is already selected
      const alreadyIn = this.myFiles.filter(tFile => tFile.name === files[i].name).length > 0;
      if (alreadyIn) continue;

      this.myFiles.push(files[i]);

      const reader = new FileReader();
      reader.onload = () => {
        this.images.push({ name: files[i].name, url: reader.result });
        this.cdr.markForCheck();
      }
      reader.readAsDataURL(files[i]);
    }
  }

  clearSelection() {
    this.myFiles = [];
    this.images = [];
    this.fileInputEl.nativeElement.value = "";
    this.cdr.markForCheck();
  }

  removeSelectedFile(item) {
    this.myFiles = this.myFiles.filter(i => i.name !== item.name);
    this.images = this.images.filter(i => i.url !== item.url);
    this.fileInputEl.nativeElement.value = "";

    this.cdr.markForCheck();
  }
  // Upload Image (new) END

  closed() {
    this.dialogRef.close()
  }
  closedNoSure() {
    this.dialog.closeAll()
  }

  /** Pop Up validateDelete
   * This is a popup for the progress of generating billing
   */
  validateDelete(content) {
    this.dialog.open(content, {
      data: {
        input: ""
      },
      maxWidth: "300px",
      minHeight: "150px",
      disableClose: false
    });
  }

  /**  Deleted
   */
  clickDeleted() {
    if (true) {
      const message = `Charge cleared successfully, check your bill`;
      this.layoutUtilsService.showActionNotification(message, MessageType.Create, 5000, true, true);

      this.dialog.closeAll()
    }
  }


}
