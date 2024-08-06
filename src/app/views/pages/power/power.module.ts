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

import { powerrateReducer } from '../../../core/power/rate/rate.reducer';
import { powerprabayarReducer } from '../../../core/power/prabayar/prabayar.reducer';
import { PowerRateEffect } from '../../../core/power/rate/rate.effect';
import { PowerPrabayarEffect } from '../../../core/power/prabayar/prabayar.effect';
import { PowerComponent } from './power.component';
import { ListRateComponent } from './rate/list-rate/list-rate.component';
import { AddRateComponent } from './rate/add-rate/add-rate.component';
import { powermeterReducer } from '../../../core/power/meter/meter.reducer';
import { PowerMeterEffect } from '../../../core/power/meter/meter.effect';
import { ListMeterComponent } from './meter/list-meter/list-meter.component';
import { AddMeterComponent } from './meter/add-meter/add-meter.component';
import { MeterComponent } from './meter/meter.component';
import { TransactionComponent } from './transaction/transaction.component';
import { ListTransactionComponent } from './transaction/list-transaction/list-transaction.component';
import { AddTransactionComponent } from './transaction/add-transaction/add-transaction.component';
import { powertransactionReducer } from '../../../core/power/transaction/transaction.reducer';
import { PowerTransactionEffect } from '../../../core/power/transaction/transaction.effect';
import { RateComponent } from './rate/rate.component';
import { ListNew } from './transaction/list-new/list-new.component';
import { ViewRateComponent } from './rate/view-rate/view-rate.component';
import { ViewMeterComponent } from './meter/view-meter/view-meter.component';
import { EditMeterComponent } from './meter/edit-meter/edit-meter.component';
import { ViewTransactionComponent } from './transaction/view-transaction/view-transaction.component';
import { EditTransactionComponent } from '../power/transaction/edit-transaction/edit-transaction.component';
import { ListPrabayarComponent } from './prabayar/list-prabayar/list-prabayar.component';
import { AddPrabayarComponent } from './prabayar/add-prabayar/add-prabayar.component';
import { ViewPrabayarComponent } from './prabayar/view-prabayar/view-prabayar.component';
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
		component: PowerComponent,
		children: [
			{
				path: 'power/rate',
				component: ListRateComponent
			},
			{
				path: 'power/rate/add',
				component: AddRateComponent
			},
			{
				path: 'power/rate/edit/:id',
				component: AddRateComponent
			},
			{
				path: 'power/rate/view/:id',
				component: ViewRateComponent
			},
			{
				path: 'power/meter',
				component: ListMeterComponent

			},
			{
				path: 'power/meter/add',
				component: AddMeterComponent
			},
			{
				path: 'power/meter/edit/:id',
				component: EditMeterComponent
			},
			{
				path: 'power/meter/view/:id',
				component: ViewMeterComponent
			},
			{
				path: 'power/transaction',
				component: ListTransactionComponent

			},
			{
				path: 'power/transaction/new',
				component: ListNew

			},
			{
				path: 'power/transaction/add',
				component: AddTransactionComponent
			},
			{
				path: 'power/transaction/edit/:id',
				component: EditTransactionComponent
			},
			{
				path: 'power/transaction/view/:id',
				component: ViewTransactionComponent
			},
			{
				path: 'power/rt-prabayar',
				component: ListPrabayarComponent
			},
			{
				path: 'power/rt-prabayar/add',
				component: AddPrabayarComponent
			},
			{
				path: 'power/rt-prabayar/edit/:id',
				component: AddPrabayarComponent
			},
			{
				path: 'power/rt-prabayar/view/:id',
				component: ViewPrabayarComponent
			},
		]
	}
];
export const reducers: ActionReducerMap<any> = {
	powerRate: powerrateReducer,
	powerPrabayar: powerprabayarReducer,
	powerMeter: powermeterReducer
};
@NgModule({
	imports: [
		CommonModule,
		HttpClientModule,
		PartialsModule,
		RouterModule.forChild(routes),
		StoreModule.forFeature('powerRate', powerrateReducer),
		StoreModule.forFeature('powerPrabayar', powerprabayarReducer),
		StoreModule.forFeature('powerMeter', powermeterReducer),
		StoreModule.forFeature('powerTransaction', powertransactionReducer),
		EffectsModule.forFeature([PowerRateEffect, PowerMeterEffect, PowerTransactionEffect, PowerPrabayarEffect]),
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
		}, {
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
		PowerComponent
	],
	declarations: [
		PowerComponent,
		ListRateComponent,
		AddRateComponent,
		RateComponent,
		MeterComponent,
		AddMeterComponent,
		ListMeterComponent,
		TransactionComponent,
		ListTransactionComponent,
		AddTransactionComponent,
		ListNew,
		ViewRateComponent,
		ViewMeterComponent,
		EditMeterComponent,
		ViewTransactionComponent,
		EditTransactionComponent,
		ListPrabayarComponent,
		AddPrabayarComponent,
		ViewPrabayarComponent
	]
})
export class PowerModule { }

