import { Component, OnDestroy, OnInit, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { LayoutUtilsService, MessageType } from '../../../../core/_base/crud';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PosService } from '../../../../core/pos/pos.service';
import { PosModel } from '../../../../core/pos/pos.model';
import { ServiceFormat } from '../../../../core/serviceFormat/format.service';

@Component({
	selector: 'kt-openCash-pos',
	templateUrl: './openCash-pos.component.html',
	styleUrls: ['./openCash-pos.component.scss']
})
export class OpenCashPosComponent implements OnInit {
	posForm: FormGroup;

	isCash: boolean = true
	isCoin: boolean = true

	constructor(
		private activatedRoute: ActivatedRoute,
		private serviceFormat: ServiceFormat,
		private router: Router,
		private layoutUtilsService: LayoutUtilsService,
		private posService: PosService,
		private posFB: FormBuilder,
	) { }

	ngOnInit() {
		const checkLoginPOS = localStorage.getItem('loginPOS')
		const url = `/`;
		if (!checkLoginPOS) return this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
		this.createForm()
	}
	createForm() {
		this.posForm = this.posFB.group({
			cashAmount: [{ value: "", disabled: false }],
			fiduMoney: this.posFB.group({
				"100rb": [{ value: "", disabled: false }],
				"75rb": [{ value: "", disabled: false }],
				"50rb": [{ value: "", disabled: false }],
				"20rb": [{ value: "", disabled: false }],
				"10rb": [{ value: "", disabled: false }],
				"5rb": [{ value: "", disabled: false }],
				"2rb": [{ value: "", disabled: false }],
				"1rb": [{ value: "", disabled: false }],
			}),
			coinMoney: this.posFB.group({
				"1rb": [{ value: "", disabled: false }],
				"5rts": [{ value: "", disabled: false }],
				"2rts": [{ value: "", disabled: false }],
				"1rts": [{ value: "", disabled: false }],
			}),
			noteOpening: [{ value: "", disabled: false }],
			isOpening: [{ value: true, disabled: false }]
		});
	}
	// currency format
	changeAmount(event, id) {
		this.toCurrency(event, id);
	}

	toCurrency(event: any, id) {
		// Differenciate function calls (from event or another function)
		let controls = this.posForm.controls;
		let value = event.target.value
		// controls.multiGLAccount.get(`amount${id}`).setValue(formattedNumber);

		var number_string = value.replace(/[^,\d]/g, "").toString(),
			split = number_string.split(","),
			sisa = split[0].length % 3,
			rupiah = split[0].substr(0, sisa),
			ribuan = split[0].substr(sisa).match(/\d{3}/gi);

		// tambahkan titik jika yang di input sudah menjadi value ribuan
		let separator
		if (ribuan) {
			separator = sisa ? "." : "";
			rupiah += separator + ribuan.join(".");
		}

		rupiah = split[1] != undefined ? split[1][1] != undefined ? rupiah + ","
			+ split[1][0] + split[1][1] : split[1] != '' ? rupiah + "," + split[1][0] : rupiah + "," + split[1] : rupiah;

		controls.cashAmount.setValue(rupiah)
		return rupiah
	}

	validateInput(event, stts, role) {
		console.log(event, "event");
		console.log(stts, "stts");
		console.log(role, "role");

		if (event.target.value > 0) {
			if (role === "fiduMoney") this.posForm.controls.fiduMoney.get(stts).setValue(event.target.value);
			else this.posForm.controls.coinMoney.get(stts).setValue(event.target.value)
		}
	}


	toggleOpenCash(e, stts) {
		const controls = this.posForm.controls
		if (e.checked && stts === "fm") this.isCash = false
		else if (!e.checked && stts === "fm") {
			this.isCash = true
			controls.fiduMoney.get('100rb').setValue("")
			controls.fiduMoney.get('75rb').setValue("")
			controls.fiduMoney.get('50rb').setValue("")
			controls.fiduMoney.get('20rb').setValue("")
			controls.fiduMoney.get('10rb').setValue("")
			controls.fiduMoney.get('5rb').setValue("")
			controls.fiduMoney.get('2rb').setValue("")
			controls.fiduMoney.get('1rb').setValue("")
		}
		else if (e.checked && stts === "cn") this.isCoin = false
		else if (!e.checked && stts === "cn") {
			this.isCoin = true
			controls.coinMoney.get('1rb').setValue("")
			controls.coinMoney.get('5rts').setValue("")
			controls.coinMoney.get('2rts').setValue("")
			controls.coinMoney.get('1rts').setValue("")
		}
	}

	onSubmit() {
		const controls = this.posForm.controls
		const _pos = new PosModel()

		const cashAmount = controls.cashAmount.value
		const arrFiduMoney = Object.values(controls.fiduMoney.value)
		const filterFiduMoney = arrFiduMoney.filter(data => data !== "")
		const arrCoinMoney = Object.values(controls.coinMoney.value)
		const filterCoinMoney = arrCoinMoney.filter(data => data !== "")

		const sFM = JSON.stringify(controls.fiduMoney.value)
		const valueFiduMoney = JSON.parse(sFM, (key, value) => value === "" ? 0 : value)
		const sCN = JSON.stringify(controls.coinMoney.value)
		const valueCoinMoney = JSON.parse(sCN, (key, value) => value === "" ? 0 : value)

		if (!cashAmount) {
			const message = `Input Cash Amount`;
			this.layoutUtilsService.showActionNotification(message, MessageType.Create, 5000, true, true)
			return
		}

		if (!this.isCash && filterFiduMoney.length === 0) {
			const message = `Input fidumoney minimal 1`;
			this.layoutUtilsService.showActionNotification(message, MessageType.Create, 5000, true, true)
			return
		} else if (!this.isCoin && filterCoinMoney.length === 0) {
			const message = `Input coin minimal 1`;
			this.layoutUtilsService.showActionNotification(message, MessageType.Create, 5000, true, true)
			return
		}

		_pos.admName = JSON.parse(localStorage.getItem('loginPOS'))
		_pos.fiduMoney = !this.isCash ? valueFiduMoney : null
		_pos.coinMoney = !this.isCoin ? valueCoinMoney : null
		_pos.cashAmount = this.serviceFormat.formatFloat(controls.cashAmount.value)
		_pos.noteOpening = controls.noteOpening.value
		_pos.isOpening = controls.isOpening.value
		_pos.isCash = !this.isCash // variabel for hidden HTML => for original value can change value with (!)
		_pos.isCoin = !this.isCoin // variabel for hidden HTML => for original value can change value with (!)
		_pos.loginDate = JSON.parse(localStorage.getItem('loginDate'))


		this.posService.addPosCashierRecord(_pos).subscribe(res => {
			if (res) {
				localStorage.setItem('isCashierRecord', JSON.stringify(true))
				localStorage.setItem('cashierRecordID', JSON.stringify(res.data._id))
				const url = `/pos/cashier`;
				this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });

				const message = `Success add opening cash!`;
				this.layoutUtilsService.showActionNotification(message,
					MessageType.Create,
					5000,
					true,
					true);
			}
		})


	}




}
