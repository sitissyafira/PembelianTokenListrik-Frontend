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
	DateAdapter,
	MAT_DATE_LOCALE,
	MAT_DATE_FORMATS
} from '@angular/material';

import { WaterComponent } from './water.component';
import { ListRateComponent } from './rate/list-rate/list-rate.component';
import { AddRateComponent } from './rate/add-rate/add-rate.component';
import { ListMeterComponent } from './meter/list-meter/list-meter.component';
import { AddMeterComponent } from './meter/add-meter/add-meter.component';
import { MeterComponent } from './meter/meter.component';
import { waterrateReducer } from '../../../core/water/rate/rate.reducer';
import { watermeterReducer } from '../../../core/water/meter/meter.reducer';
import { WaterRateEffect } from '../../../core/water/rate/rate.effect';
import { WaterMeterEffect } from '../../../core/water/meter/meter.effect';
import { TransactionComponent } from './transaction/transaction.component';
import { AddTransactionComponent } from './transaction/add-transaction/add-transaction.component';
import { ListTransactionComponent } from './transaction/list-transaction/list-transaction.component';
import { watertransactionReducer } from '../../../core/water/transaction/transaction.reducer';
import { WaterTransactionEffect } from '../../../core/water/transaction/transaction.effect';
import { RateComponent } from './rate/rate.component';
import { EditTransactionComponent } from './transaction/edit-transaction/edit-transaction.component';
import { ListNew } from './transaction/list-new/list-new.component';
import { ViewRateComponent } from '../water/rate/view-rate/view-rate.component';
import { EditMeterComponent } from '../water/meter/edit-meter/edit-meter.component';
import { ViewMeterComponent } from '../water/meter/view-meter/view-meter.component';
import { ViewTransactionComponent } from './transaction/view-transaction/view-transaction.component';
import { MomentDateAdapter, MAT_MOMENT_DATE_ADAPTER_OPTIONS } from '@angular/material-moment-adapter';


export const MY_FORMATS = {
	parse: {
		dateInput: 'MM/YYYY',
	},
	display: {
		dateInput: 'MMMM YYYY',
		monthYearLabel: 'MMM YYYY',
		dateA11yLabel: 'LL',
		monthYearA11yLabel: 'MMMM YYYY',
	},
};
const routes: Routes = [
	{
		path: '',
		component: WaterComponent,
		children: [
			{
				path: 'water/rate',
				component: ListRateComponent
			},
			{
				path: 'water/rate/add',
				component: AddRateComponent
			},
			{
				path: 'water/rate/edit/:id',
				component: AddRateComponent
			},
			{
				path: 'water/rate/view/:id',
				component: ViewRateComponent
			},
			{
				path: 'water/meter',
				component: ListMeterComponent

			},
			{
				path: 'water/meter/add',
				component: AddMeterComponent
			},
			{
				path: 'water/meter/edit/:id',
				component: EditMeterComponent
			},
			{
				path: 'water/meter/view/:id',
				component: ViewMeterComponent
			},
			{
				path: 'water/transaction',
				component: ListTransactionComponent

			},
			{
				path: 'water/transaction/new',
				component: ListNew

			},
			{
				path: 'water/transaction/add',
				component: AddTransactionComponent
			},
			{
				path: 'water/transaction/edit/:id',
				component: EditTransactionComponent
			},
			{
				path: 'water/transaction/view/:id',
				component: ViewTransactionComponent
			},
		]
	}
];
export const reducers: ActionReducerMap<any> = {
	powerRate: waterrateReducer,
	powerMeter: watermeterReducer
};
@NgModule({
	imports: [
		CommonModule,
		HttpClientModule,
		PartialsModule,
		RouterModule.forChild(routes),
		StoreModule.forFeature('waterRate', waterrateReducer),
		StoreModule.forFeature('waterMeter', watermeterReducer),
		StoreModule.forFeature('waterTransaction', watertransactionReducer),
		EffectsModule.forFeature([WaterRateEffect, WaterMeterEffect, WaterTransactionEffect]),
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
		{
			provide: DateAdapter,
			useClass: MomentDateAdapter,
			deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS],
		},
		{ provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
		HttpUtilsService,
		TypesUtilsService,
		LayoutUtilsService
	],
	entryComponents: [
		ActionNotificationComponent,
		WaterComponent
	],
	declarations: [
		WaterComponent,
		ListRateComponent,
		AddRateComponent,
		RateComponent,
		MeterComponent,
		AddMeterComponent,
		EditMeterComponent,
		ViewMeterComponent,
		ListMeterComponent,
		TransactionComponent,
		AddTransactionComponent,
		EditTransactionComponent,
		ListTransactionComponent,
		ListNew,
		ViewRateComponent,
		ViewTransactionComponent,

	]
})
export class WaterModule { }
