import { ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
@Component({
	selector: 'kt-popup-purchaseRequest',
	templateUrl: './popup-purchaseRequest.component.html',
	styleUrls: ['./popup-purchaseRequest.component.scss']
})

export class PopupPurchaseRequest implements OnInit {

	productForm: FormGroup;
	data: string = ""
	product: any = {}

	vaTesIpl = ""

	constructor(
		private dialogRef: MatDialogRef<PopupPurchaseRequest>,
		private productFB: FormBuilder,
		@Inject(MAT_DIALOG_DATA) public dataSend: any


	) { }

	ngOnInit() {
		this.createForm()
	}

	createForm() {
		this.productForm = this.productFB.group({
			va_ipl: [""],
			va_water: [""],
			va_power: [""],
			va_utility: [""],
			va_gas: [""],
			va_parking: [""]
		})

	}

	saveButton() {
		const controls = this.productForm.controls
		console.log(controls.va_ipl.value);


		this.dialogRef.close({
			va_ipl: controls.va_ipl.value,
			va_water: controls.va_water.value,
			va_power: controls.va_power.value,
			va_utility: controls.va_utility.value,
			va_gas: controls.va_gas.value,
			va_parking: controls.va_parking.value
		});
	}

	onNoClick() {
		this.dialogRef.close();
	}

}
