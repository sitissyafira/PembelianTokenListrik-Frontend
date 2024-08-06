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

import { galonrateReducer } from '../../../core/galon/rate/rate.reducer';

import { GalonRateEffect } from '../../../core/galon/rate/rate.effect';

import { GalonComponent } from './galon.component';
import { ListRateComponent } from './rate/list-rate/list-rate.component';
import { AddRateComponent } from './rate/add-rate/add-rate.component';

import { RateComponent } from './rate/rate.component';

import { ViewRateComponent } from './rate/view-rate/view-rate.component';


const routes: Routes = [
	{
		path: '',
		component: GalonComponent,
		children: [
			{
				path: 'galon/rate',
				component: ListRateComponent
			},
			{
				path: 'galon/rate/add',
				component: AddRateComponent
			},
			{
				path: 'galon/rate/edit/:id',
				component: AddRateComponent
			},
			{
				path: 'galon/rate/view/:id',
				component: ViewRateComponent
			},


		]
	}
];
export const reducers: ActionReducerMap<any> = {
	galonRate: galonrateReducer,

};
@NgModule({
	imports: [
		CommonModule,
		HttpClientModule,
		PartialsModule,
		RouterModule.forChild(routes),
		StoreModule.forFeature('galonRate', galonrateReducer),
		EffectsModule.forFeature([GalonRateEffect]),
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
		MatDialogModule
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
		GalonComponent
	],
	declarations: [
		GalonComponent,
		ListRateComponent,
		AddRateComponent,
		RateComponent,
		ViewRateComponent,
	]
})
export class GalonModule { }
