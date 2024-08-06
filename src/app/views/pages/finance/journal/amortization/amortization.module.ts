// Angulamortization
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
import { AmortizationComponent } from './amortization.component';
import { ListAmortizationComponent } from './list-amortization/list-amortization.component';
import { AddAmortizationComponent } from './add-amortization/add-amortization.component';
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

import { amortizationReducer } from '../../../../../core/finance/journal/amortization/amortization.reducer';
import { AmortizationEffect } from '../../../../../core/finance/journal/amortization/amortization.effect';
import { ViewAmortizationComponent } from './view-amortization/view-amortization.component';
import { EditAmortizationComponent } from './edit-amortization/edit-amortization.component';

const routes: Routes = [
	{
		path: '',
		component: AmortizationComponent,
		children: [
			{
				path: '',
				component: ListAmortizationComponent
			},
			{
				path: 'add',
				component: AddAmortizationComponent
			},
			{
				path: 'edit/:id',
				component: EditAmortizationComponent
			},
			{
				path: 'view/:id',
				component: ViewAmortizationComponent
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
		StoreModule.forFeature('amortization', amortizationReducer),
		EffectsModule.forFeature([AmortizationEffect]),
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
		AmortizationComponent,
	],
	declarations: [
		AmortizationComponent,
		ListAmortizationComponent,
		AddAmortizationComponent,
		EditAmortizationComponent,
		ViewAmortizationComponent,
	]
})
export class AmortizationModule { }
