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
import { InternalUserComponent } from './internalUser.component';
import { ListInternalUserComponent } from './list-internalUser/list-internalUser.component';
import { AddInternalUserComponent } from './add-internalUser/add-internalUser.component';

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

import {internalUserReducer} from '../../../core/internalUser/internalUser.reducer';
import {InternalUserEffect} from '../../../core/internalUser/internalUser.effect';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import { EditInternalUserComponent } from './edit-internalUser/edit-internalUser.component';
import { ViewInternalUserComponent } from './view-internalUser/view-internalUser.component';

const routes: Routes = [
	{
		path: '',
		component: InternalUserComponent,
		children: [
			{
				path: '',
				component: ListInternalUserComponent
			},
			{
				path: 'add',
				component: AddInternalUserComponent
			},
			{
				path: 'edit/:id',
				component: EditInternalUserComponent
			},
			{
				path: 'view/:id',
				component: ViewInternalUserComponent
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
		StoreModule.forFeature('internalUser', internalUserReducer),
		EffectsModule.forFeature([InternalUserEffect]),
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
		InternalUserComponent
	],
	declarations: [
		InternalUserComponent,
		ListInternalUserComponent,
		AddInternalUserComponent,
		EditInternalUserComponent,
		ViewInternalUserComponent
	]
})
export class InternalUserModule {}
