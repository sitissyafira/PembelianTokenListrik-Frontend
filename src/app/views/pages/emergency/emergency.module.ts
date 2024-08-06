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
import { EmergencyComponent } from './emergency.component';
import { ListEmergencyComponent } from './list-emergency/list-emergency.component';
import { AddEmergencyComponent } from './add-emergency/add-emergency.component';

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

import {emergencyReducer} from '../../../core/emergency/emergency.reducer';
import {EmergencyEffect} from '../../../core/emergency/emergency.effect';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import { EditEmergencyComponent } from './edit-emergency/edit-emergency.component';
import { ViewEmergencyComponent } from './view-emergency/view-emergency.component';

const routes: Routes = [
	{
		path: '',
		component: EmergencyComponent,
		children: [
			{
				path: '',
				component: ListEmergencyComponent
			},
			{
				path: 'add',
				component: AddEmergencyComponent
			},
			{
				path: 'edit/:id',
				component: EditEmergencyComponent
			},
			{
				path: 'view/:id',
				component: ViewEmergencyComponent
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
		StoreModule.forFeature('emergency', emergencyReducer),
		EffectsModule.forFeature([EmergencyEffect]),
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
		EmergencyComponent
	],
	declarations: [
		EmergencyComponent,
		ListEmergencyComponent,
		AddEmergencyComponent,
		EditEmergencyComponent,
		ViewEmergencyComponent
	]
})
export class EmergencyModule {}
