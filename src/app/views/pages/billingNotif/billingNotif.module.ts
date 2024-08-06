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
import { billingNotifComponent } from './billingNotif.component';
import { ListbillingNotifComponent } from './list-billingNotif/list-billingNotif.component';
import { AddbillingNotifComponent,CustomDateFormat1 } from './add-billingNotif/add-billingNotif.component';
import { EditbillingNotifComponent } from './edit-billingNotif/edit-billingNotifcomponent'
import { ViewbillingNotifComponent } from './view-billingNotif/view-billingNotif.component';
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
	MatChipsModule
	
} from '@angular/material';

import {billingNotifReducer} from '../../../core/billingNotif/billingNotif.reducer';
import {billingNotifEffect} from '../../../core/billingNotif/billingNotif.effect';

const routes: Routes = [
	{
		path: '',
		component: billingNotifComponent,
		children: [
			{
				path: '',
				component: ListbillingNotifComponent
			},
			{
				path: 'add',
				component: AddbillingNotifComponent
			},
			// {
			// 	path: 'edit/:id',
			// 	component: EditbillingNotifComponent
			// },
			{
				path: 'view/:id',
				component: ViewbillingNotifComponent
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
		StoreModule.forFeature('billingNotif', billingNotifReducer),
		EffectsModule.forFeature([billingNotifEffect]),
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
		MatAutocompleteModule,
		MatChipsModule

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
		billingNotifComponent,
	],
	declarations: [
		billingNotifComponent,
		ListbillingNotifComponent,
		AddbillingNotifComponent,
		EditbillingNotifComponent,
		ViewbillingNotifComponent,
		CustomDateFormat1
	]
})
export class billingNotifModule {}
