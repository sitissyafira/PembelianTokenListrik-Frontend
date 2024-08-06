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
import { InspeksiComponent } from './inspeksi.component';
import { ListInspeksiComponent } from './list-inspeksi/list-inspeksi.component';
import { AddInspeksiComponent } from './add-inspeksi/add-inspeksi.component';

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

import {inspeksiReducer} from '../../../core/inspeksi/inspeksi.reducer';
import {InspeksiEffect} from '../../../core/inspeksi/inspeksi.effect';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import { EditInspeksiComponent } from './edit-inspeksi/edit-inspeksi.component';
import { ViewInspeksiComponent } from './view-inspeksi/view-inspeksi.component';

const routes: Routes = [
	{
		path: '',
		component: InspeksiComponent,
		children: [
			{
				path: '',
				component: ListInspeksiComponent
			},
			{
				path: 'add',
				component: AddInspeksiComponent
			},
			{
				path: 'edit/:id',
				component: EditInspeksiComponent
			},
			{
				path: 'view/:id',
				component: ViewInspeksiComponent
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
		StoreModule.forFeature('inspeksi', inspeksiReducer),
		EffectsModule.forFeature([InspeksiEffect]),
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
		InspeksiComponent
	],
	declarations: [
		InspeksiComponent,
		ListInspeksiComponent,
		AddInspeksiComponent,
		EditInspeksiComponent,
		ViewInspeksiComponent
	]
})
export class InspeksiModule {}
