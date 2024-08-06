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
import { HttpUtilsService, TypesUtilsService, InterceptService, LayoutUtilsService} from '../../../core/_base/crud';
// Shared
import { ActionNotificationComponent } from '../../partials/content/crud';
// Components
import { DepositComponent } from './deposit.component';
import { ListDepositComponent } from './list-deposit/list-deposit.component';
// import { EditDepositComponent } from './edit-deposit/edit-deposit.component';
//import { AddDepositComponent } from './add-deposit/add-deposit.component';
import { AddDepositComponent } from './add-deposit/add-deposit.component';

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

import {depositReducer} from '../../../core/deposit/deposit.reducer';
import {DepositEffect} from '../../../core/deposit/deposit.effect';

import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import { EditDepositComponent } from './edit-deposit/edit-deposit.component';
import { ListDepositOutComponent } from './list-depositout/list-deposit.component';
import { ListAllDepositComponent } from './list-alldeposit/list-deposit.component';
import { ViewDepositComponent } from './view-deposit/view-deposit.component';

const routes: Routes = [
	{
		path: '',
		component: DepositComponent,
		children: [
			{
				path: 'in',
				component: ListDepositComponent
			},
			{
				path: 'add',
				component: AddDepositComponent
			},
			{
				path: 'edit/:id',
				component: EditDepositComponent
			},
			{
				path: 'out',
				component: ListDepositOutComponent
			},
			{
				path: '',
				component: ListAllDepositComponent
			},
			{
				path: 'view/:id',
				component: ViewDepositComponent
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
		StoreModule.forFeature('deposit', depositReducer),
		EffectsModule.forFeature([DepositEffect]),
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
		NgbModule
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
		DepositComponent
	],
	declarations: [
		DepositComponent,
		ListDepositComponent,
		EditDepositComponent,
		AddDepositComponent,
		ListDepositOutComponent,
		ListAllDepositComponent,
		ViewDepositComponent,
	]
})
export class DepositModule {}
