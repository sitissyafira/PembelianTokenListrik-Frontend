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
import { ManagementTaskComponent } from './managementTask.component';
import { ListManagementTaskComponent } from './list-managementTask/list-managementTask.component';
import { AddManagementTaskComponent } from './add-managementTask/add-managementTask.component';

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

import {managementTaskReducer} from '../../../core/managementTask/managementTask.reducer';
import {ManagementTaskEffect} from '../../../core/managementTask/managementTask.effect';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import { EditManagementTaskComponent } from './edit-managementTask/edit-managementTask.component';
import { ViewManagementTaskComponent } from './view-managementTask/view-managementTask.component';
import { NgxMaterialTimepickerModule } from 'ngx-material-timepicker';
const routes: Routes = [
	{
		path: '',
		component: ManagementTaskComponent,
		children: [
			{
				path: '',
				component: ListManagementTaskComponent
			},
			{
				path: 'add',
				component: AddManagementTaskComponent
			},
			{
				path: 'edit/:id',
				component: EditManagementTaskComponent
			},
			{
				path: 'view/:id',
				component: ViewManagementTaskComponent
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
		StoreModule.forFeature('managementTask', managementTaskReducer),
		EffectsModule.forFeature([ManagementTaskEffect]),
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
		NgbModule,
		NgxMaterialTimepickerModule
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
		ManagementTaskComponent
	],
	declarations: [
		ManagementTaskComponent,
		ListManagementTaskComponent,
		AddManagementTaskComponent,
		EditManagementTaskComponent,
		ViewManagementTaskComponent
	]
})
export class ManagementTaskModule {}
