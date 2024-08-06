import { ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { LayoutUtilsService, MessageType } from '../../../../core/_base/crud';

@Component({
	selector: 'kt-popup',
	templateUrl: './popup.component.html',
	styleUrls: ['./popup.component.scss']
})

export class Popup implements OnInit {

	productForm: FormGroup;
	data: string = ""
	product: any = {}
	minDate = new Date();


	constructor(
		private dialogRef: MatDialogRef<Popup>,
		private productFB: FormBuilder,
		private layoutUtilsService: LayoutUtilsService,
		@Inject(MAT_DIALOG_DATA) public dataSend: any


	) { }

	ngOnInit() {
		this.createForm()
	}

	createForm() {

		this.productForm = this.productFB.group({
			reject: [""],
		})

	}

	saveButton() {
		const controls = this.productForm.controls
		if (controls.reject.value === "") {
			const message = `Input reject reason`;
			this.layoutUtilsService.showActionNotification(message, MessageType.Create, 5000, true, true)
			return
		}


		localStorage.setItem('rejectDesc', controls.reject.value);

		this.dialogRef.close({
			reject: controls.reject.value
		});
	}

	onNoClick() {
		this.dialogRef.close();
	}

}


@Component({
	selector: 'kt-popup',
	templateUrl: './popup-reschedule.component.html',
	styleUrls: ['./popup.component.scss']
})
export class PopupReschdule implements OnInit {

	productForm: FormGroup;
	data: string = ""
	product: any = {}
	ticketForm: FormGroup;
	minDate = new Date();


	constructor(
		private dialogRef: MatDialogRef<Popup>,
		private productFB: FormBuilder,
		private layoutUtilsService: LayoutUtilsService,

		@Inject(MAT_DIALOG_DATA) public dataSend: any


	) { }

	ngOnInit() {
		this.createForm()
	}

	createForm() {
		this.productForm = this.productFB.group({
			rescheduleDateSurvey: [""],
			rescheduleDescSurvey: [""],
		})
	}

	addEvent(type: string, event) {
		const controls = this.productForm.controls;
		controls.rescheduleDateSurvey.setValue(event.value);
	}

	saveButton() {
		const controls = this.productForm.controls
		if (controls.rescheduleDateSurvey.value === "" || controls.rescheduleDescSurvey.value === "") {
			const message = `Input reschedule date survey or reason reschedule survey`;
			this.layoutUtilsService.showActionNotification(message, MessageType.Create, 5000, true, true)
			return
		}

		this.dialogRef.close({
			rescheduleDateSurvey: controls.rescheduleDateSurvey.value,
			rescheduleDescSurvey: controls.rescheduleDescSurvey.value
		});
	}

	onNoClick() {
		this.dialogRef.close();
	}

}

// Pop Up Reschedule Fixing
@Component({
	selector: 'kt-popup',
	templateUrl: './popup-reschedule-fixing.component.html',
	styleUrls: ['./popup.component.scss']
})
export class PopupReschduleFixing implements OnInit {

	productForm: FormGroup;
	data: string = ""
	product: any = {}
	ticketForm: FormGroup;
	minDate = new Date();



	constructor(
		private dialogRef: MatDialogRef<Popup>,
		private productFB: FormBuilder,
		private layoutUtilsService: LayoutUtilsService,

		@Inject(MAT_DIALOG_DATA) public dataSend: any


	) { }

	ngOnInit() {
		this.createForm()
	}

	createForm() {
		this.productForm = this.productFB.group({
			rescheduleDateFixing: [""],
			rescheduleDescFixing: [""],
		})
	}

	addEvent(type: string, event) {
		const controls = this.productForm.controls;
		controls.rescheduleDateFixing.setValue(event.value);
	}

	saveButton() {
		const controls = this.productForm.controls

		if (controls.rescheduleDateFixing.value === "" || controls.rescheduleDescFixing.value === "") {
			const message = `Input reschedule date fixing or reason reschedule fixing`;
			this.layoutUtilsService.showActionNotification(message, MessageType.Create, 5000, true, true)
			return
		}

		this.dialogRef.close({
			rescheduleDateFixing: controls.rescheduleDateFixing.value,
			rescheduleDescFixing: controls.rescheduleDescFixing.value
		});
	}

	onNoClick() {
		this.dialogRef.close();
	}

}

