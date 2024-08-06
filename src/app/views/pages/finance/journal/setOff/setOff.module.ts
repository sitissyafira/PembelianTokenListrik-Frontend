// AngulsetOff
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
// NGRX
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { TranslateModule } from '@ngx-translate/core';
import { PartialsModule } from '../../../../partials/partials.module';
import { HttpUtilsService, TypesUtilsService, InterceptService, LayoutUtilsService } from '../../../../../core/_base/crud';
import { ActionNotificationComponent } from '../../../../partials/content/crud';
import { SetOffComponent } from './setOff.component';
import { ListSetOffComponent } from './list-setOff/list-setOff.component';
import { AddSetOffComponent } from './add-setOff/add-setOff.component';
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

import { setOffReducer } from '../../../../../core/finance/journal/setOff/setOff.reducer';
import { SetOffEffect } from '../../../../../core/finance/journal/setOff/setOff.effect';
import { ViewSetOffComponent } from './view-setOff/view-setOff.component';
import { EditSetOffComponent } from './edit-setOff/edit-setOff.component';

const routes: Routes = [
	{
		path: '',
		component: SetOffComponent,
		children: [
			{
				path: '',
				component: ListSetOffComponent
			},
			{
				path: 'add',
				component: AddSetOffComponent
			},
			{
				path: 'edit/:id',
				component: EditSetOffComponent
			},
			{
				path: 'view/:id',
				component: ViewSetOffComponent
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
		StoreModule.forFeature('setOff', setOffReducer),
		EffectsModule.forFeature([SetOffEffect]),
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
		SetOffComponent,
	],
	declarations: [
		SetOffComponent,
		ListSetOffComponent,
		AddSetOffComponent,
		EditSetOffComponent,
		ViewSetOffComponent,
	]
})
export class SetOffModule { }
