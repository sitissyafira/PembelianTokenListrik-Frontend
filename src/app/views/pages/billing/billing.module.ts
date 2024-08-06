// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
// NGRX
import {ActionReducerMap, StoreModule} from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
// Translate
import { TranslateModule } from '@ngx-translate/core';
import { PartialsModule } from '../../partials/partials.module';
// Services
import { HttpUtilsService, TypesUtilsService, InterceptService, LayoutUtilsService} from '../../../core/_base/crud';
// Shared
import { ActionNotificationComponent } from '../../partials/content/crud';
// Components

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
	MatChipsModule,
	MatBadgeModule,
	MatFormFieldModule
} from '@angular/material';

import {NgbModule} from '@ng-bootstrap/ng-bootstrap';

import {BillingComponent} from './billing.component';
import {ListBillingComponent} from './list-billing/list-billing.component';
import {AddBillingComponent} from './add-billing/add-billing.component';
import {billingReducer} from '../../../core/billing/billing.reducer';
import {BillingEffect} from '../../../core/billing/billing.effect';
import { EditBillingComponent } from './edit-billing/edit-billing.component';
import { ViewBillingComponent } from './view-billing/view-billing.component';
import { ViewVoidBillingComponent } from './view-voidbilling/view-voidbilling.component';

const routes: Routes = [
	{
		path: '',
		component: BillingComponent,
		children: [
			{
				path: '',
				component: ListBillingComponent
			},
			{
				path: 'add',
				component: AddBillingComponent
			},
			{
				path: 'edit/:id',
				component: EditBillingComponent
			},
			{
				path: 'view/:id',
				component: ViewBillingComponent
			},
			{
				path: 'voidbillview/:id',
				component: ViewVoidBillingComponent
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
		StoreModule.forFeature('billing', billingReducer),
		EffectsModule.forFeature([BillingEffect]),
		FormsModule,
		ReactiveFormsModule,
		TranslateModule.forChild(),
		MatButtonModule,
		MatMenuModule,
		MatSelectModule,
		MatInputModule,
		MatFormFieldModule,
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
		NgbModule,
		MatChipsModule,
		MatBadgeModule
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
		BillingComponent
	],
	declarations: [
		BillingComponent,
		ListBillingComponent,
		AddBillingComponent,
		EditBillingComponent,
		ViewBillingComponent,
		ViewVoidBillingComponent,
	]
})
export class BillingModule { }
