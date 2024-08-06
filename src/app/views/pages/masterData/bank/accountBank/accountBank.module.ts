// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
// NGRX
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
// Translate
import { TranslateModule } from '@ngx-translate/core';
import { PartialsModule } from '../../../../partials/partials.module';
// Services
import { HttpUtilsService, TypesUtilsService, InterceptService, LayoutUtilsService} from '../../../../../core/_base/crud';
// Shared
import { ActionNotificationComponent } from '../../../../partials/content/crud';
// Components
import { AccountBankComponent } from './accountBank.component';
import { ListAccountBankComponent } from './list-accountBank/list-accountBank.component';
import { AddAccountBankComponent } from './add-accountBank/add-accountBank.component';

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

import {accountBankReducer} from '../../../../../core/masterData/bank/accountBank/accountBank.reducer';
import {AccountBankEffect} from '../../../../../core/masterData/bank/accountBank/accountBank.effect';
import { ViewAccountBankComponent } from './view-accountBank/view-accountBank.component';

const routes: Routes = [
	{
		path: '',
		component: AccountBankComponent,
		children: [
			{
				path: '',
				component: ListAccountBankComponent
			},
			{
				path: 'add',
				component: AddAccountBankComponent
			},
			{
				path: 'edit/:id',
				component: AddAccountBankComponent
			},
			{
				path: 'view/:id',
				component: ViewAccountBankComponent
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
		StoreModule.forFeature('accountBank', accountBankReducer),
		EffectsModule.forFeature([AccountBankEffect]),
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
		AccountBankComponent
	],
	declarations: [
		AccountBankComponent,
		ListAccountBankComponent,
		AddAccountBankComponent,
		ViewAccountBankComponent
	]
})
export class AccountBankModule {}
