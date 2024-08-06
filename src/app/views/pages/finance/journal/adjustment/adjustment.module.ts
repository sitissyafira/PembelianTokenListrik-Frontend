// Anguladjustment
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
import { AdjustmentComponent } from './adjustment.component';
import { ListAdjustmentComponent } from './list-adjustment/list-adjustment.component';
import { AddAdjustmentComponent } from './add-adjustment/add-adjustment.component';

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

import { adjustmentReducer } from '../../../../../core/finance/journal/adjustment/adjustment.reducer';
import { AdjustmentEffect } from '../../../../../core/finance/journal/adjustment/adjustment.effect';
import { ViewAdjustmentComponent } from './view-adjustment/view-adjustment.component';
import { EditAdjustmentComponent } from './edit-adjustment/edit-adjustment.component';

const routes: Routes = [
	{
		path: '',
		component: AdjustmentComponent,
		children: [
			{
				path: '',
				component: ListAdjustmentComponent
			},
			{
				path: 'add',
				component: AddAdjustmentComponent
			},
			{
				path: 'edit/:id',
				component: EditAdjustmentComponent
			},
			{
				path: 'view/:id',
				component: ViewAdjustmentComponent
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
		StoreModule.forFeature('adjustment', adjustmentReducer),
		EffectsModule.forFeature([AdjustmentEffect]),
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
		AdjustmentComponent,
	],
	declarations: [
		AdjustmentComponent,
		ListAdjustmentComponent,
		AddAdjustmentComponent,
		EditAdjustmentComponent,
		ViewAdjustmentComponent,
	]
})
export class AdjustmentModule { }
