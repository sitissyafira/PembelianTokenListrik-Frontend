import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { TranslateModule } from '@ngx-translate/core';
import { PartialsModule } from '../../partials/partials.module';
import { HttpUtilsService, TypesUtilsService, InterceptService, LayoutUtilsService} from '../../../core/_base/crud';
import { ActionNotificationComponent } from '../../partials/content/crud';
import { RequestInvoiceComponent } from './requestInvoice.component';
import { ListRequestInvoiceComponent } from './list-requestInvoice/list-requestInvoice.component';
import { AddRequestInvoiceComponent } from './add-requestInvoice/add-requestInvoice.component';

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

import {requestInvoiceReducer} from '../../../core/requestInvoice/requestInvoice.reducer';
import {RequestInvoiceEffect} from '../../../core/requestInvoice/requestInvoice.effect';
import { ViewRequestInvoiceComponent } from './view-requestInvoice/view-requestInvoice.component';
import { EditRequestInvoiceComponent } from './edit-requestInvoice/edit-requestInvoice.component';
// import { EditRequestInvoiceComponent } from './edit-requestInvoice/edit-requestInvoice.component';

const routes: Routes = [
	{
		path: '',
		component: RequestInvoiceComponent,
		children: [
			{
				path: '',
				component: ListRequestInvoiceComponent
			},
			{
				path: 'add',
				component: AddRequestInvoiceComponent
			}
			,
			{
				path: 'view/:id',
				component: ViewRequestInvoiceComponent
			}
			,
			{
				path: 'edit/:id',
				component: EditRequestInvoiceComponent
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
		StoreModule.forFeature('requestInvoice', requestInvoiceReducer),
		EffectsModule.forFeature([RequestInvoiceEffect]),
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
		RequestInvoiceComponent
	],
	declarations: [
		RequestInvoiceComponent,
		ListRequestInvoiceComponent,
		AddRequestInvoiceComponent,
		ViewRequestInvoiceComponent,
		EditRequestInvoiceComponent
	]
})
export class RequestInvoiceModule {}
