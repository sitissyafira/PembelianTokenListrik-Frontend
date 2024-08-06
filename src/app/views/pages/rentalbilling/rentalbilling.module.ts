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
import { RentalbillingComponent } from './rentalbilling.component';
import { ListUnittypeComponent } from './list-rentalbilling/list-rentalbilling.component';
import { AddRentalBillingComponent } from './add-rentalbilling/add-rentalbilling.component';
import { ViewRentalBillingComponent } from './view-rentalbilling/view-rentalbilling.component';
import { EditRentalBillingComponent } from './edit-rentalbilling/edit-rentalbilling.component';

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

import {rentalbillingReducer} from '../../../core/rentalbilling/rentalbilling.reducer';
import {RentalbillingEffect} from '../../../core/rentalbilling/rentalbilling.effect';

const routes: Routes = [
	{
		path: '',
		component: RentalbillingComponent,
		children: [
			{
				path: '',
				component: ListUnittypeComponent
			},
			{
				path: 'add',
				component: AddRentalBillingComponent
			},
			{
				path: 'edit/:id',
				component: EditRentalBillingComponent
			},
			{
				path: 'view/:id',
				component: ViewRentalBillingComponent
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
		StoreModule.forFeature('rentalbilling', rentalbillingReducer),
		EffectsModule.forFeature([RentalbillingEffect]),
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
		RentalbillingComponent
	],
	declarations: [
		RentalbillingComponent,
		ListUnittypeComponent,
		AddRentalBillingComponent,
		ViewRentalBillingComponent,
		EditRentalBillingComponent
	]
})
export class RentalbillingModule {}
