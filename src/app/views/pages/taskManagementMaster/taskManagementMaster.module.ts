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
import { TaskManagementMasterComponent } from './taskManagementMaster.component';
import { ListTaskManagementMasterComponent } from './list-taskManagementMaster/list-taskManagementMaster.component';
import { AddTaskManagementMasterComponent } from './add-taskManagementMaster/add-taskManagementMaster.component';

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
} from '@angular/material';

import {taskManagementMasterReducer} from '../../../core/taskManagementMaster/taskManagementMaster.reducer';
import {TaskManagementMasterEffect} from '../../../core/taskManagementMaster/taskManagementMaster.effect';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import { EditTaskManagementMasterComponent } from './edit-taskManagementMaster/edit-taskManagementMaster.component';
import { ViewTaskManagementMasterComponent } from './view-taskManagementMaster/view-taskManagementMaster.component';
import { NgxMaterialTimepickerModule } from 'ngx-material-timepicker';

const routes: Routes = [
	{
		path: '',
		component: TaskManagementMasterComponent,
		children: [
			{
				path: '',
				component: ListTaskManagementMasterComponent
			},
			{
				path: 'add',
				component: AddTaskManagementMasterComponent
			},
			{
				path: 'edit/:id',
				component: EditTaskManagementMasterComponent
			},
			{
				path: 'view/:id',
				component: ViewTaskManagementMasterComponent
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
		StoreModule.forFeature('taskManagementMaster', taskManagementMasterReducer),
		EffectsModule.forFeature([TaskManagementMasterEffect]),
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
		TaskManagementMasterComponent
	],
	declarations: [
		TaskManagementMasterComponent,
		ListTaskManagementMasterComponent,
		AddTaskManagementMasterComponent,
		EditTaskManagementMasterComponent,
		ViewTaskManagementMasterComponent
	]
})
export class TaskManagementMasterModule {}
