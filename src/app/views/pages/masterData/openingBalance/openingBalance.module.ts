import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { TranslateModule } from '@ngx-translate/core';
import { PartialsModule } from '../../../partials/partials.module';
import { HttpUtilsService, TypesUtilsService, InterceptService, LayoutUtilsService} from '../../../../core/_base/crud';
import { ActionNotificationComponent } from '../../../partials/content/crud';
import { OpeningBalanceComponent } from './openingBalance.component';
import { ListOpeningBalanceComponent } from './list-openingBalance/list-openingBalance.component';
import { AddOpeningBalanceComponent } from './add-openingBalance/add-openingBalance.component';
import { ViewOpeningBalanceComponent } from './view-openingBalance/view-openingBalance.component';



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

import {openingBalanceReducer} from '../../../../core/masterData/openingBalance/openingBalance.reducer';
import {OpeningBalanceEffect} from '../../../../core/masterData/openingBalance/openingBalance.effect';

const routes: Routes = [
	{
		path: '',
		component: OpeningBalanceComponent,
		children: [
			{
				path: '',
				component: ListOpeningBalanceComponent
			},
			{
				path: 'add',
				component: AddOpeningBalanceComponent
			},
			{
				path: 'edit/:id',
				component: AddOpeningBalanceComponent
			}
			,
			{
				path: 'view/:id',
				component: ViewOpeningBalanceComponent
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
		StoreModule.forFeature('openingBalance', openingBalanceReducer),
		EffectsModule.forFeature([OpeningBalanceEffect]),
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
		OpeningBalanceComponent
	],
	declarations: [
		OpeningBalanceComponent,
		ListOpeningBalanceComponent,
		AddOpeningBalanceComponent,
		ViewOpeningBalanceComponent
	]
})
export class OpeningBalanceModule {}
