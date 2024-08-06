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
import { HttpUtilsService, TypesUtilsService, InterceptService, LayoutUtilsService} from '../../../core/_base/crud';
// Shared
import { ActionNotificationComponent } from '../../partials/content/crud';
// Components
import { InvoiceComponent } from './invoice.component';

import { AddInvoiceComponent } from './add-invoice/add-invoice.component';

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
	MatTooltipModule
} from '@angular/material';

import {invoiceReducer} from '../../../core/invoice/invoice.reducer';
import {InvoiceEffect} from '../../../core/invoice/invoice.effect';

import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import { ListAllInvoiceComponent } from './list-allinvoice/list-invoice.component';
import { ViewInvoiceComponent } from './view-invoice/view-invoice.component';
import { EditInvoiceComponent } from './edit-invoice/edit-invoice.component';

const routes: Routes = [
	{
		path: '',
		component: InvoiceComponent,
		children: [
			{
				path: 'add',
				component: AddInvoiceComponent
			},
			{
				path: '',
				component: ListAllInvoiceComponent
			},
			{
				path: 'edit/:id',
				component: EditInvoiceComponent
			},
			{
				path: 'view/:id',
				component: ViewInvoiceComponent
			},
			
		]
	}
];

@NgModule({
	imports: [
		CommonModule,
		HttpClientModule,
		PartialsModule,
		RouterModule.forChild(routes),
		StoreModule.forFeature('invoice', invoiceReducer),
		EffectsModule.forFeature([InvoiceEffect]),
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
		NgbModule
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
		InvoiceComponent
	],
	declarations: [
		InvoiceComponent,
		AddInvoiceComponent,
		ListAllInvoiceComponent,
		ViewInvoiceComponent,
		EditInvoiceComponent
	]
})
export class InvoiceModule {}
