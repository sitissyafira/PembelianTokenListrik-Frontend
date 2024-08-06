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
import { AbsensiComponent } from './absensi.component';
import { ListAbsensiComponent } from './list-absensi/list-absensi.component';
import { AddAbsensiComponent } from './add-absensi/add-absensi.component';

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

import {absensiReducer} from '../../../core/absensi/absensi.reducer';
import {AbsensiEffect} from '../../../core/absensi/absensi.effect';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import { EditAbsensiComponent } from './edit-absensi/edit-absensi.component';
import { ViewAbsensiComponent } from './view-absensi/view-absensi.component';

const routes: Routes = [
	{
		path: '',
		component: AbsensiComponent,
		children: [
			{
				path: '',
				component: ListAbsensiComponent
			},
			{
				path: 'add',
				component: AddAbsensiComponent
			},
			{
				path: 'edit/:id',
				component: EditAbsensiComponent
			},
			{
				path: 'view/:id',
				component: ViewAbsensiComponent
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
		StoreModule.forFeature('absensi', absensiReducer),
		EffectsModule.forFeature([AbsensiEffect]),
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
		AbsensiComponent
	],
	declarations: [
		AbsensiComponent,
		ListAbsensiComponent,
		AddAbsensiComponent,
		EditAbsensiComponent,
		ViewAbsensiComponent
	]
})
export class AbsensiModule {}
