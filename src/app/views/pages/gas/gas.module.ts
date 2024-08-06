// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
// NGRX
import {ActionReducerMap, StoreModule} from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
// Translate
import { TranslateModule } from '@ngx-translate/core';
import { PartialsModule } from '../../partials/partials.module';
// Services
import { HttpUtilsService, TypesUtilsService, InterceptService, LayoutUtilsService} from '../../../core/_base/crud';
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
	MatTooltipModule
} from '@angular/material';
import {ListMeterComponent} from './meter/list-meter/list-meter.component';
import {AddMeterComponent} from './meter/add-meter/add-meter.component';
import {MeterComponent} from './meter/meter.component';
import {GasMeterEffect} from '../../../core/gas/meter/meter.effect';
import {gasmeterReducer} from '../../../core/gas/meter/meter.reducer';


import {GasComponent} from './gas.component';

import {ListRateComponent} from './rate/list-rate/list-rate.component';
import {AddRateComponent} from './rate/add-rate/add-rate.component';
import {gasrateReducer} from '../../../core/gas/rate/rate.reducer';
import {GasRateEffect} from '../../../core/gas/rate/rate.effect';
import {RateComponent} from './rate/rate.component';

import { TransactionComponent } from './transaction/transaction.component';
import { AddTransactionComponent } from './transaction/add-transaction/add-transaction.component';
import { ListTransactionComponent } from './transaction/list-transaction/list-transaction.component';
import {gastransactionReducer} from '../../../core/gas/transaction/transaction.reducer';
import {GasTransactionEffect} from '../../../core/gas/transaction/transaction.effect';
import { EditTransactionComponent } from './transaction/edit-transaction/edit-transaction.component';

import { ListNew } from './transaction/list-new/list-new.component';

const routes: Routes = [
	{
		path: '',
		component: GasComponent,
		children: [
			{
				path: 'gas/rate',
				component: ListRateComponent
			},
			{
				path: 'gas/rate/add',
				component: AddRateComponent
			},
			{
				path: 'gas/rate/edit/:id',
				component: AddRateComponent
			},
			{
				path: 'gas/meter',
				component: ListMeterComponent

			},
			{
				path: 'gas/meter/add',
				component: AddMeterComponent
			},
			{
				path: 'gas/meter/edit/:id',
				component: AddMeterComponent
			},
			{
				path: 'gas/transaction',
				component: ListTransactionComponent

			},
			{
				path: 'gas/transaction/new',
				component: ListNew

			},
			{
				path: 'gas/transaction/add',
				component: AddTransactionComponent
			},
			{
				path: 'gas/transaction/edit/:id',
				component: EditTransactionComponent
			},
		]
	}
];
export const reducers: ActionReducerMap<any> = {
	gasRate: gasrateReducer,
	gasMeter: gasmeterReducer
};
@NgModule({
	imports: [
		CommonModule,
		HttpClientModule,
		PartialsModule,
		RouterModule.forChild(routes),
		StoreModule.forFeature('gasRate', gasrateReducer),
		StoreModule.forFeature('gasMeter', gasmeterReducer),
		StoreModule.forFeature('gasTransaction', gastransactionReducer),
		EffectsModule.forFeature([GasRateEffect, GasMeterEffect, GasTransactionEffect]),
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
		GasComponent
	],
	declarations: [
		GasComponent,
		ListRateComponent,
		AddRateComponent,
		RateComponent,
		MeterComponent,
		AddMeterComponent,
		ListMeterComponent,
		TransactionComponent,
		AddTransactionComponent,
		EditTransactionComponent,
		ListTransactionComponent,
		ListNew
	]
})
export class GasModule {}
