// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
// NGRX
import { ActionReducerMap, StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
// Translate
import { TranslateModule } from '@ngx-translate/core';
import { PartialsModule } from '../../partials/partials.module';
// Services
import { HttpUtilsService, TypesUtilsService, InterceptService, LayoutUtilsService } from '../../../core/_base/crud';
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
} from '@angular/material';

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { TrGalonComponent } from './trGalon.component';
import { ListTrGalonComponent } from './list-trGalon/list-trGalon.component';
import { AddTrGalonComponent } from './add-trGalon/add-trGalon.component';
import { trGalonReducer } from '../../../core/trGalon/trGalon.reducer';
import { TrGalonEffect } from '../../../core/trGalon/trGalon.effect';
import { EditTrGalonComponent } from './edit-trGalon/edit-trGalon.component';
import { ViewTrGalonComponent } from './view-trGalon/view-trGalon.component';

const routes: Routes = [
	{
		path: '',
		component: TrGalonComponent,
		children: [
			{
				path: '',
				component: ListTrGalonComponent
			},
			{
				path: 'add',
				component: AddTrGalonComponent
			},
			{
				path: 'edit/:id',
				component: EditTrGalonComponent
			},
			{
				path: 'view/:id',
				component: ViewTrGalonComponent
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
		StoreModule.forFeature('trGalon', trGalonReducer),
		EffectsModule.forFeature([TrGalonEffect]),
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
		TrGalonComponent
	],
	declarations: [
		TrGalonComponent,
		ListTrGalonComponent,
		AddTrGalonComponent,
		EditTrGalonComponent,
		ViewTrGalonComponent,
	]
})
export class TrGalonModule { }
