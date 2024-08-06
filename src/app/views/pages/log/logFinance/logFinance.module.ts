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
import { LogFinanceComponent } from './logFinance.component';
import { ListLogFinanceComponent } from './list-logFinance/list-logFinance.component';

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

import {logFinanceReducer} from '../../../../core/log/logFinance/logFinance.reducer';
import {LogFinanceEffect} from '../../../../core/log/logFinance/logFinance.effect';
import { ListLogFinanceComponentAP } from './list-logFinanceAP/list-logFinanceAP.component';
import { ListLogFinanceComponentPR } from './list-logFinancePR/list-logFinancePR.component';
import { ListLogFinanceComponentPO } from './list-logFinancePO/list-logFinancePO.component';
import { ListLogFinanceComponentQU } from './list-logFinanceQU/list-logFinanceQU.component';
import { ListLogFinanceComponentPD } from './list-logFinancePD/list-logFinancePD.component';
import { ListLogFinanceComponentSI } from './list-logFinanceSI/list-logFinanceSI.component';


const routes: Routes = [
	{
		path: '',
		component: LogFinanceComponent,
		children: [
			{
				path: 'AR',
				component: ListLogFinanceComponent
			},
			{
				path: 'AP',
				component: ListLogFinanceComponentAP
			},
			{
				path: 'PR',
				component: ListLogFinanceComponentPR
			},
			{
				path: 'PO',
				component: ListLogFinanceComponentPO
			},
			{
				path: 'QU',
				component: ListLogFinanceComponentQU
			},
			{
				path: 'PD',
				component: ListLogFinanceComponentPD
			},
			{
				path: 'SI',
				component: ListLogFinanceComponentSI
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
		StoreModule.forFeature('logFinance', logFinanceReducer),
		EffectsModule.forFeature([LogFinanceEffect]),
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
		LogFinanceComponent
	],
	declarations: [
		LogFinanceComponent,
		ListLogFinanceComponent,
		ListLogFinanceComponentAP,
		ListLogFinanceComponentPR,
		ListLogFinanceComponentPO,
		ListLogFinanceComponentQU,
		ListLogFinanceComponentPD,
		ListLogFinanceComponentSI
	]
})
export class LogFinanceModule {}
