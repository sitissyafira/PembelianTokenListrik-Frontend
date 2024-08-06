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
import { ExternalUserComponent } from './externalUser.component';
import { ListExternalUserComponent } from './list-externalUser/list-externalUser.component';
import { AddExternalUserComponent } from './add-externalUser/add-externalUser.component';

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

import {externalUserReducer} from '../../../core/externalUser/externalUser.reducer';
import {ExternalUserEffect} from '../../../core/externalUser/externalUser.effect';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import { EditExternalUserComponent } from './edit-externalUser/edit-externalUser.component';
import { ViewExternalUserComponent } from './view-externalUser/view-externalUser.component';

const routes: Routes = [
	{
		path: '',
		component: ExternalUserComponent,
		children: [
			{
				path: '',
				component: ListExternalUserComponent
			},
			{
				path: 'add',
				component: AddExternalUserComponent
			},
			{
				path: 'edit/:id',
				component: EditExternalUserComponent
			},
			{
				path: 'view/:id',
				component: ViewExternalUserComponent
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
		StoreModule.forFeature('externalUser', externalUserReducer),
		EffectsModule.forFeature([ExternalUserEffect]),
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
		ExternalUserComponent
	],
	declarations: [
		ExternalUserComponent,
		ListExternalUserComponent,
		AddExternalUserComponent,
		EditExternalUserComponent,
		ViewExternalUserComponent
	]
})
export class ExternalUserModule {}
