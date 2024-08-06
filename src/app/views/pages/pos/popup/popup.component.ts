import { ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { ActivatedRoute, Router } from '@angular/router';
import moment from 'moment';
import { PosService } from '../../../../core/pos/pos.service';
import { LayoutUtilsService, MessageType } from '../../../../core/_base/crud';

import * as pdfMake from "pdfmake/build/pdfmake";
import * as pdfFonts from "pdfmake/build/vfs_fonts";
import { ServiceFormat } from '../../../../core/serviceFormat/format.service';
import { TemplatePDFCashierPayment } from '../../../../core/templatePDF/pos.service';
// import { selectArById } from 'src/app/core/finance/ar/ar.selector';
// import moment from "moment";

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
	selector: 'kt-popup',
	templateUrl: './popup-logout.component.html',
	styleUrls: ['./popup.component.scss']
})

export class PopupLogout implements OnInit {
	profileCashier = {
		name: JSON.parse(localStorage.getItem('loginPOS')),
		loginDate: moment(JSON.parse(localStorage.getItem('loginDate'))).format('L'),
		loginDateTime: moment(JSON.parse(localStorage.getItem('loginDate'))).format('LT')
	}
	productForm: FormGroup;
	data: string = ""
	product: any = {}
	minDate = new Date();
	dataDebit: any

	resultDebit: any
	resultCredit: any
	resultEmoney: any


	constructor(
		private dialogRef: MatDialogRef<PopupLogout>,
		private serviceFormat: ServiceFormat,
		private templatePDFCashierPayment: TemplatePDFCashierPayment,
		private activatedRoute: ActivatedRoute,
		private productFB: FormBuilder,
		private router: Router,
		private posService: PosService,

		private layoutUtilsService: LayoutUtilsService,
		@Inject(MAT_DIALOG_DATA) public dataSend: any


	) { }

	ngOnInit() {
		this.loadDetailTransaction()
		this.createForm()
	}

	createForm() {

		this.productForm = this.productFB.group({
			logout: [""],
		})

	}

	loadDetailTransaction() {
		const getKeyDebit = Object.keys(this.dataSend.detailTransaction.detailDebit), getValueDebit = Object.values(this.dataSend.detailTransaction.detailDebit), loopDebit = []
		const getKeyCredit = Object.keys(this.dataSend.detailTransaction.detailCC), getValueCredit = Object.values(this.dataSend.detailTransaction.detailCC), loopCredit = []
		const getKeyEmoney = Object.keys(this.dataSend.detailTransaction.detailEMoney), getValueEmoney = Object.values(this.dataSend.detailTransaction.detailEMoney), loopEmoney = []
		for (let i = 0; i < getKeyDebit.length; i++) {
			loopDebit.push({ name: getKeyDebit[i], value: getValueDebit[i] })
		}
		for (let i = 0; i < getKeyCredit.length; i++) {
			loopCredit.push({ name: getKeyCredit[i], value: getValueCredit[i] })
		}
		for (let i = 0; i < getKeyEmoney.length; i++) {
			loopEmoney.push({ name: getKeyEmoney[i], value: getValueEmoney[i] })
		}
		this.resultDebit = loopDebit.filter(data => data.value !== 0)
		this.resultCredit = loopCredit.filter(data => data.value !== 0)
		this.resultEmoney = loopEmoney.filter(data => data.value !== 0)
	}

	logoutButton() {
		const isClosing = {
			detailTransactionClosing: this.dataSend.detailTransaction,
			isClosing: true,
			totalTransactionClosing: this.dataSend.totalTransaction
		}
		const _id = JSON.parse(localStorage.getItem('cashierRecordID'))

		this.posService.updatePosCashierRecord(_id, isClosing).subscribe(res => {
			if (res) {
				localStorage.removeItem('loginPOS')
				localStorage.removeItem('cashierRecordID')
				localStorage.removeItem('loginDate')
				localStorage.removeItem('isCashierRecord')
				const url = `/`;
				this.dialogRef.close();
				this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
			}
		})
	}

	onNoClick() {
		this.dialogRef.close();

	}

}
@Component({
	selector: 'kt-popup',
	templateUrl: './popup-pay.component.html',
	styleUrls: ['./popup.component.scss']
})

export class PopupPay implements OnInit {

	productForm: FormGroup;
	data: string = ""
	product: any = {}
	minDate = new Date();


	constructor(
		private dialogRef: MatDialogRef<PopupLogout>,
		private serviceFormat: ServiceFormat,
		private templatePDFCashierPayment: TemplatePDFCashierPayment,
		private activatedRoute: ActivatedRoute,
		private productFB: FormBuilder,
		private router: Router,
		private posService: PosService,
		private dialog: MatDialog,
		private layoutUtilsService: LayoutUtilsService,
		@Inject(MAT_DIALOG_DATA) public dataSend: any


	) { }

	ngOnInit() {
		this.createForm()
		console.log(this.dataSend, "data Send nich")
	}

	createForm() {

		this.productForm = this.productFB.group({
			logout: [""],
		})

	}

	paySave() {
		this.posService.addPosCashierPayment(this.dataSend.formSend).subscribe(res => {
			if (res) {
				this.onNoClick(true)

				const dialogRef = this.dialog.open(PopupPayDetail, {
					data: { totalPOS: this.dataSend.formSend.totalPOS, idPaySuccess: res.data._id, category: this.dataSend.category },
					maxWidth: "500px",
					minHeight: "200px",
				});

				// tes modal
				dialogRef.afterClosed().subscribe((result) => {
					window.scroll({
						top: 0,
						left: 0,
						behavior: 'smooth'
					});
				});
			}
		})
	}

	onNoClick(status) {
		// success payment
		if (status) this.dialogRef.close({ validate: true });
		else this.dialogRef.close({ validate: false });
	}

}


@Component({
	selector: 'kt-popup',
	templateUrl: './popup-detail.component.html',
	styleUrls: ['./popup.component.scss']
})

export class PopupPayDetail implements OnInit {

	productForm: FormGroup;
	data: string = ""
	product: any = {}
	minDate = new Date();


	constructor(
		private dialogRef: MatDialogRef<PopupLogout>,
		private serviceFormat: ServiceFormat,
		private templatePDFCashierPayment: TemplatePDFCashierPayment,
		private activatedRoute: ActivatedRoute,
		private productFB: FormBuilder,
		private router: Router,
		private posService: PosService,

		private layoutUtilsService: LayoutUtilsService,
		@Inject(MAT_DIALOG_DATA) public dataSend: any


	) { }

	ngOnInit() {
		this.createForm()
	}

	createForm() {

		this.productForm = this.productFB.group({
			logout: [""],
		})

	}

	btnPrintReceive() {
		const id = this.dataSend.idPaySuccess
		this.posService.templatePrintReceipt(id).subscribe(res => {
			if (res) {
				this.posService.templatePrintReceipt(id).subscribe(
					res => {
						let label = "template"
						let stts = ""
						if (this.dataSend.category === "invoice") {
							const result = this.templatePDFCashierPayment.generatePDFTemplate(res);
							pdfMake.createPdf(result).download(res.cashierNo)
						} else if (this.dataSend.category === "ticket") {
							const result = this.templatePDFCashierPayment.generatePDFTemplateTicket(res);
							pdfMake.createPdf(result).download(res.cashierNo)
						} else if (this.dataSend.category === "parking") {
							const result = this.templatePDFCashierPayment.generatePDFTemplateParking(res);
							pdfMake.createPdf(result).download(res.cashierNo)
						} else {
							const result = this.templatePDFCashierPayment.generatePDFTemplateGalon(res);
							pdfMake.createPdf(result).download(res.cashierNo)
						}
					}
				);
			}
		})
	}

	back() {
		this.dialogRef.close();
		const message = `Pembayaran berhasil dilakukan!`;
		this.layoutUtilsService.showActionNotification(message, MessageType.Create, 5000, true, true)
		window.scroll({
			top: 0,
			left: 0,
			behavior: 'smooth'
		});
	}


	onNoClick() {
		this.dialogRef.close();
	}

}

