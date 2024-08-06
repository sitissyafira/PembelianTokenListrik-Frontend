// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
// NGRX
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
// Translate
import { TranslateModule } from '@ngx-translate/core';
import { PartialsModule } from '../../partials/partials.module';
// Services
import { HttpUtilsService, TypesUtilsService, InterceptService, LayoutUtilsService } from '../../../core/_base/crud';
// Shared
import { ActionNotificationComponent } from '../../partials/content/crud';
// Components
import { ImportpaymentComponent } from './importpayment.component';
import { ListImportpaymentComponent } from './list-importpayment/list-importpayment.component';
// import { AddRentalBillingComponent } from './add-importpayment/add-rentalbilling.component';
import { ViewBillingComponent } from './view-importpayment/view-importpayment.component';
// import { EditRentalBillingComponent } from './edit-importpayment/edit-rentalbilling.component';

// Material
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
	DateAdapter,
	MAT_DATE_LOCALE,
	MAT_DATE_FORMATS,
	MatChipsModule,


} from '@angular/material';
import { MomentDateAdapter, MAT_MOMENT_DATE_ADAPTER_OPTIONS } from '@angular/material-moment-adapter';
import { importpaymentReducer } from '../../../core/importpayment/importpayment.reducer';
import { RentalbillingEffect } from '../../../core/rentalbilling/rentalbilling.effect';
import { ImportpaymentEffect } from '../../../core/importpayment/importpayment.effect';

const routes: Routes = [
	{
		path: '',
		component: ImportpaymentComponent,
		children: [
			{
				path: '',
				component: ListImportpaymentComponent
			},
			// {
			// 	path: 'add',
			// 	component: AddRentalBillingComponent
			// },
			// {
			// 	path: 'edit/:id',
			// 	component: EditRentalBillingComponent
			// },
			{
				path: 'view/:id',
				component: ViewBillingComponent
			}
		]
	}
];

export const MY_FORMATS = {
	parse: {
		dateInput: 'MM/YYYY',
	},
	display: {
		dateInput: 'MMMM YYYY',
		monthYearLabel: 'MMM YYYY',
		dateA11yLabel: 'LL',
		monthYearA11yLabel: 'MMMM YYYY',
	},
};

@NgModule({
	imports: [
		CommonModule,
		HttpClientModule,
		PartialsModule,
		RouterModule.forChild(routes),
		StoreModule.forFeature('importpayment', importpaymentReducer),
		EffectsModule.forFeature([ImportpaymentEffect]),
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
		{
			provide: DateAdapter,
			useClass: MomentDateAdapter,
			deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS],
		},
		{ provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },

		HttpUtilsService,
		TypesUtilsService,
		LayoutUtilsService
	],
	entryComponents: [
		ActionNotificationComponent,
		ImportpaymentComponent
	],
	declarations: [
		ImportpaymentComponent,
		ListImportpaymentComponent,
		// AddRentalBillingComponent,
		ViewBillingComponent,
		// EditRentalBillingComponent
	]
})
export class ImportpaymentModule { }
