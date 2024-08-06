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
import { PartialsModule } from '../../partials/partials.module';
// Services
import { HttpUtilsService, TypesUtilsService, InterceptService, LayoutUtilsService } from '../../../core/_base/crud';
// Shared
import { ActionNotificationComponent } from '../../partials/content/crud';
// Components
import { AccountCategoryComponent } from './accountCategory.component';
import { ListAccountCategoryComponent } from './list-accountCategory/list-accountCategory.component';
import { ListAccountCategoryPLComponent } from './list-pl-accountCategory/list-pl-accountCategory.component';
import { AddAccountCategoryComponent } from './add-accountCategory/add-accountCategory.component';
import { AddAccountListDialogComponent } from './add-accountCategory/add-account-list/add-account-list.dialog.component';
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
	MatChipsModule,
	MatTable
} from '@angular/material';

import { accountCategoryReducer } from '../../../core/accountCategory/accountCategory.reducer';
import { AccountCategoryEffect } from '../../../core/accountCategory/accountCategory.effect';
import { accountGroupReducer } from '../../../core/accountGroup/accountGroup.reducer';
import { AccountGroupEffect } from '../../../core/accountGroup/accountGroup.effect';

const routes: Routes = [
	{
		path: '',
		component: AccountCategoryComponent,
		children: [
			{
				path: '',
				component: ListAccountCategoryComponent
			},
			{
				path: 'pl',
				component: ListAccountCategoryPLComponent
			},
			{
				path: 'add',
				component: AddAccountCategoryComponent
			},
			{
				path: 'edit/:id',
				component: AddAccountCategoryComponent,
				data: {
					name: "bs",
				},
			},
			{
				path: 'pl/edit/:id',
				component: AddAccountCategoryComponent,
				data: {
					name: "pl",
				},
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
		StoreModule.forFeature('accountCategory', accountCategoryReducer),
		EffectsModule.forFeature([AccountCategoryEffect]),
		StoreModule.forFeature('accountGroup', accountGroupReducer),
		EffectsModule.forFeature([AccountGroupEffect]),
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
		MatChipsModule,
		MatTableModule
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
		AccountCategoryComponent,
		AddAccountListDialogComponent
	],
	declarations: [
		AccountCategoryComponent,
		ListAccountCategoryComponent,
		ListAccountCategoryPLComponent,
		AddAccountCategoryComponent,
		AddAccountListDialogComponent
	]
})
export class AccountCategoryModule { }
