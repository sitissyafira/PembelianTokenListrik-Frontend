import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { TranslateModule } from '@ngx-translate/core';
import { PartialsModule } from '../../../partials/partials.module';
import { HttpUtilsService, TypesUtilsService, InterceptService, LayoutUtilsService} from '../../../../core/_base/crud';
import { ActionNotificationComponent } from '../../../partials/content/crud';
import { PaymentPoComponent } from './paymentPo.component';
import { ListPaymentPoComponent } from './list-paymentPo/list-paymentPo.component';
import { AddpaymentPoComponent } from './add-paymentPo/add-paymentPo.component';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import {MatDividerModule} from '@angular/material/divider';
import { ClipboardModule } from 'ngx-clipboard';

import {
	MatInputModule,
	MatPaginatorModule,
	MatProgressSpinnerModule,
	MatSortModule,
	MatTableModule,
	MatSelectModule,
	MatMenuModule,
	MatProgressBarModule,
	MatButtonModule,
	MatCheckboxModule,
	MatDialogModule,
	MatTabsModule,
	MatNativeDateModule,
	MatCardModule,
	MatRadioModule,
	MatIconModule,
	MatDatepickerModule,
	MatExpansionModule,
	MatAutocompleteModule,
	MAT_DIALOG_DEFAULT_OPTIONS,
	MatSnackBarModule,
	MatTooltipModule,
	MatChipsModule
} from '@angular/material';

import {paymentPoReducer} from '../../../../core/purchaseManagement/paymentPo/paymentPo.reducer';
import {PaymentPoEffect} from '../../../../core/purchaseManagement/paymentPo/paymentPo.effect';
// import { PopupViewPaymentPo } from './popup-view-paymentPo/popup-view-paymentPo.component';
// import { PopupEditPaymentPo } from './popup-edit-paymentPo/popup-edit-paymentPo.component';
import { ViewpaymentPoComponent } from './view-paymentPo/view-paymentPo.component';
import { EditpaymentPoComponent } from './edit-paymentPo/edit-paymentPo.component';

const routes: Routes = [
	{
		path: '',
		component: PaymentPoComponent,
		children: [
			{
				path: '',
				component: ListPaymentPoComponent
			},
			{
				path: 'add',
				component: AddpaymentPoComponent
			},
			{
				path: 'edit/:id',
				component: EditpaymentPoComponent
			},
			{
				path: 'view/:id',
				component: ViewpaymentPoComponent
			}
		]
	}
];

@NgModule({
	imports: [
		CommonModule,
		HttpClientModule,
		PartialsModule,
		RouterModule.forChild(routes),
		StoreModule.forFeature('paymentPo', paymentPoReducer),
		EffectsModule.forFeature([PaymentPoEffect]),
		FormsModule,
		ReactiveFormsModule,
		TranslateModule.forChild(),
		MatButtonModule,
		MatMenuModule,
		MatSelectModule,
		MatInputModule,
		MatTableModule,
		MatAutocompleteModule,
		MatRadioModule,
		MatIconModule,
		MatNativeDateModule,
		MatProgressBarModule,
		MatDatepickerModule,
		MatCardModule,
		MatPaginatorModule,
		MatSortModule,
		MatCheckboxModule,
		MatProgressSpinnerModule,
		MatSnackBarModule,
		MatExpansionModule,
		MatTabsModule,
		MatTooltipModule,
		MatDialogModule,
		PdfViewerModule,
		MatDividerModule,
		ClipboardModule,
		MatChipsModule,
	],
	providers: [
		InterceptService,
		{
			provide: HTTP_INTERCEPTORS,
			useClass: InterceptService,
			multi: true
		},
		{
			provide: MAT_DIALOG_DEFAULT_OPTIONS,
			useValue: {
				hasBackdrop: true,
				panelClass: 'kt-mat-dialog-container__wrapper',
				height: 'auto',
				width: '900px'
			}
		},
		HttpUtilsService,
		TypesUtilsService,
		LayoutUtilsService
	],
	entryComponents: [
		ActionNotificationComponent,
		// PopupViewPaymentPo,
		// PopupEditPaymentPo,
		PaymentPoComponent
	],
	declarations: [
		PaymentPoComponent,
		ListPaymentPoComponent,
		AddpaymentPoComponent,
		EditpaymentPoComponent,
		ViewpaymentPoComponent,
		// PopupViewPaymentPo,
		// PopupEditPaymentPo,
	]
})
export class paymentPoModule {}
