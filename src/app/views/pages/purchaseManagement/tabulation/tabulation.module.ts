import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { TranslateModule } from '@ngx-translate/core';
import { PartialsModule } from '../../../partials/partials.module';
import { HttpUtilsService, TypesUtilsService, InterceptService, LayoutUtilsService} from '../../../../core/_base/crud';
import { ActionNotificationComponent } from '../../../partials/content/crud';
import { TabulationComponent } from './tabulation.component';
import { ListTabulationComponent } from './list-tabulation/list-tabulation.component';
import { AddTabulationComponent } from './add-tabulation/add-tabulation.component';

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

import {tabulationReducer} from '../../../../core/purchaseManagement/tabulation/tabulation.reducer';
import {TabulationEffect} from '../../../../core/purchaseManagement/tabulation/tabulation.effect';
import { ViewTabulationComponent } from './view-tabulation/view-tabulation.component';
import { PopupEditPricetabulationComponent } from './popup-edit-pricetabulation/popup-edit-pricetabulation.component';

const routes: Routes = [
	{
		path: '',
		component: TabulationComponent,
		children: [
			{
				path: '',
				component: ListTabulationComponent
			},
			{
				path: 'add',
				component: AddTabulationComponent
			},
			{
				path: 'edit/:id',
				component: AddTabulationComponent
			},
			{
				path: 'view/:id',
				component: ViewTabulationComponent
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
		StoreModule.forFeature('tabulation', tabulationReducer),
		EffectsModule.forFeature([TabulationEffect]),
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
		TabulationComponent,
		PopupEditPricetabulationComponent
	],
	declarations: [
		TabulationComponent,
		ListTabulationComponent,
		AddTabulationComponent,
		ViewTabulationComponent,
		PopupEditPricetabulationComponent,

	]
})
export class TabulationModule {}
