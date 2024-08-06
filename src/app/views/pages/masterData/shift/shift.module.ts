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
import { PartialsModule } from '../../../partials/partials.module';
// Services
import { HttpUtilsService, TypesUtilsService, InterceptService, LayoutUtilsService} from '../../../../core/_base/crud';
// Shared
import { ActionNotificationComponent } from '../../../partials/content/crud';
// Components
import { ShiftComponent } from './shift.component';
import { ListShiftComponent } from './list-shift/list-shift.component';
import { AddShiftComponent } from './add-shift/add-shift.component';
import { NgxMaterialTimepickerModule } from 'ngx-material-timepicker';

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

import {shiftReducer} from '../../../../core/masterData/shift/shift.reducer';
import {ShiftEffect} from '../../../../core/masterData/shift/shift.effect';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import { EditShiftComponent } from './edit-shift/edit-shift.component';
import { ViewShiftComponent } from './view-shift/view-shift.component';

const routes: Routes = [
	{
		path: '',
		component: ShiftComponent,
		children: [
			{
				path: '',
				component: ListShiftComponent
			},
			{
				path: 'add',
				component: AddShiftComponent
			},
			{
				path: 'edit/:id',
				component: EditShiftComponent
			},
			{
				path: 'view/:id',
				component: ViewShiftComponent
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
		StoreModule.forFeature('shift', shiftReducer),
		EffectsModule.forFeature([ShiftEffect]),
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
		ShiftComponent
	],
	declarations: [
		ShiftComponent,
		ListShiftComponent,
		AddShiftComponent,
		EditShiftComponent,
		ViewShiftComponent
	]
})
export class ShiftModule {}
