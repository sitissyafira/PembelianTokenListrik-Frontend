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
import { LsebillingComponent } from './lsebilling.component';
import { ListLeaseBillingComponent } from './list-lsebilling/list-lsebilling.component';
import { AddLeaseBillingComponent  } from './add-lsebilling/add-lsebilling.component';
import { ViewLeaseBillingComponent  } from './view-lsebilling/view-lsebilling.component';
import { EditLeaseBillingComponent  } from './edit-lsebilling/edit-lsebilling.component';

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

import {lsebillingReducer} from '../../../core/lsebilling/lsebilling.reducer';
import {LsebillingEffect} from '../../../core/lsebilling/lsebilling.effect';

const routes: Routes = [
	{
		path: '',
		component: LsebillingComponent,
		children: [
			{
				path: '',
				component: ListLeaseBillingComponent
			},
			{
				path: 'add',
				component: AddLeaseBillingComponent
			},
			{
				path: 'edit/:id',
				component: EditLeaseBillingComponent
			},
			{
				path: 'view/:id',
				component: ViewLeaseBillingComponent
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
		StoreModule.forFeature('lsebilling', lsebillingReducer),
		EffectsModule.forFeature([LsebillingEffect]),
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
		LsebillingComponent
	],
	declarations: [
		LsebillingComponent,
		ListLeaseBillingComponent,
		AddLeaseBillingComponent,
		ViewLeaseBillingComponent,
		EditLeaseBillingComponent
	]
})
export class LsebillingModule {}
