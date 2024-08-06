import { ChangeDetectorRef, Component, OnInit, OnDestroy } from "@angular/core";
import { DomSanitizer } from "@angular/platform-browser";
import { SelectionModel } from "@angular/cdk/collections";
import { Subscription } from "rxjs";
import { saveAs } from "file-saver";

// Services
import { GlService } from "../../../../core/finance/gl/gl.service";
import { SubheaderService, KtDialogService } from "../../../../core/_base/layout";
import { LayoutUtilsService, MessageType } from "../../../../core/_base/crud";
import * as _moment from "moment";
import { default as _rollupMoment, Moment } from "moment";
import { MatDatepicker } from "@angular/material/datepicker";
import { FormControl } from "@angular/forms";
import { SavingDialog } from "../../../partials/module/saving-confirm/confirmation.dialog.component";
import { MatDialog } from "@angular/material";
import * as FileSave from "file-saver";

const moment = _rollupMoment || _moment;
@Component({
	selector: "kt-gl",
	templateUrl: "./gl.component.html",
	styleUrls: ["./gl.component.scss"],
})
export class GlComponent implements OnInit, OnDestroy {
	loading = {
		msg: "",
		status: false,
	};
	preview = {
		src: undefined,
		blobURL: "",
		status: false,
	};
	date = {
		start: undefined,
		end: undefined,
	};
	columnsList = ["Account No.", "Account Name", "Beginning Balance", "Change Debit", "Change Credit", "Net Change", "Ending Balance"];
	selectedColumns = [];
	selection = new SelectionModel<any>(true, []);
	monthDate = new FormControl(moment());
	selectedAccount: any[] = [];
	// Activator for button
	valid: boolean = false;

	// Private param
	_subs: Subscription[] = [];

	constructor(private cdr: ChangeDetectorRef, private dialogueService: KtDialogService, private glService: GlService, private layoutUtilService: LayoutUtilsService, private subHeaderService: SubheaderService, private sanitizer: DomSanitizer, private dialog: MatDialog) { }

	private initComponent() {
		// Set breadcrumb title
		this.subHeaderService.setTitle("Trial Balance");
	}

	// Disable the input when value is undefined
	dateCheck() {
		if (this.date.start && this.date.end) {
			this.valid = true;
		} else this.valid = false;
	}

	addDate(name, e) {
		if (e.target.value === null) this.date[name] = undefined;
		else this.date[name] = moment(e.target.value).format("YYYY-MM-DD");

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

	_startLoading(msg = "") {
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
			this._startLoading("Prepare to downloading document");

			try {
				saveAs(this.preview.blobURL, "Report Trial Balance.pdf");
				this.layoutUtilService.showActionNotification(`Downloading document successfull`, MessageType.Create, 5000, true, false);
			} catch (err) {
				// Show error notification
				this.layoutUtilService.showActionNotification(`Downloading document failed | ERROR: ${err.statusText}`, MessageType.Create, 5000, true, false);
				this._stopLoading();
			} finally {
				this._stopLoading();
			}
		}
	}

	getPreviewSource() {
		this._startLoading("Prepare to preview the document");
		this.processSaving();
		const subPreview = this.glService.generatePDF({ ...this.date, column: this.selection.selected }).subscribe(
			(resp) => {
				const blob = new Blob([resp], { type: "application/pdf" });
				const url = URL.createObjectURL(blob);

				// Save blob url
				this.preview.blobURL = url;

				// Make the preview PDF fit to frame
				this.showPreview(`${url}#view=FitH`);
				this.dialog.closeAll();
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
				this.dialog.closeAll();

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
		this.isAllSelected() ? this.selection.clear() : this.columnsList.forEach((col) => this.selection.select(col));
	}

	setMonthAndYear(normalizedMonthAndYear: Moment, datepicker: MatDatepicker<Moment>) {
		const ctrlValue = this.monthDate.value!;
		ctrlValue.month(normalizedMonthAndYear.month());
		ctrlValue.year(normalizedMonthAndYear.year());
		this.date.start = moment(ctrlValue).clone().startOf("month").format("YYYY-MM-DD hh:mm");
		this.date.end = moment(ctrlValue).clone().endOf("month").format("YYYY-MM-DD hh:mm");
		this.monthDate.setValue(ctrlValue);

		this.dateCheck();
		datepicker.close();
	}

	export() {
		this.processSaving();
		const subPre = this.glService.generateExcel({ ...this.date, column: this.selection.selected, account: this.selectedAccount }).subscribe(
			(resp) => {
				const blob = new Blob([resp], { type: "application/pdf" });
				const url = URL.createObjectURL(blob);

				// Save blob url
				this.preview.blobURL = url;

				// save excel
				FileSave.saveAs(`${url}`, "export-trial_balance.xlsx");
				this.dialog.closeAll();
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
				this.dialog.closeAll();
				this._stopLoading();
			},
			() => {
				this._stopLoading();
			}
		);
		this._subs.push(subPre);
	}

	ngOnDestroy() {
		this._subs.map((item) => {
			item.unsubscribe();
		});
	}
	/**
	 * Load GL Process Saving.
	 */
	processSaving() {
		const dialogRef = this.dialog.open(SavingDialog, {
			data: {
				isGenerateBilling: "",
				msgErrorGenerate: "",
			},
			maxWidth: "565px",
			minHeight: "375px",
			disableClose: true,
		});
	}
}
