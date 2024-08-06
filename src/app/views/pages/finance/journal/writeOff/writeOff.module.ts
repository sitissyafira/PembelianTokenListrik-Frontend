// AngulwriteOff
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
// NGRX
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { TranslateModule } from '@ngx-translate/core';
import { PartialsModule } from '../../../../partials/partials.module';
import { HttpUtilsService, TypesUtilsService, InterceptService, LayoutUtilsService } from '../../../../../core/_base/crud';
import { ActionNotificationComponent } from '../../../../partials/content/crud';
import { WriteOffComponent } from './writeOff.component';
import { ListWriteOffComponent } from './list-writeOff/list-writeOff.component';
import { AddWriteOffComponent } from './add-writeOff/add-writeOff.component';
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

import { writeOffReducer } from '../../../../../core/finance/journal/writeOff/writeOff.reducer';
import { WriteOffEffect } from '../../../../../core/finance/journal/writeOff/writeOff.effect';
import { ViewWriteOffComponent } from './view-writeOff/view-writeOff.component';
import { EditWriteOffComponent } from './edit-writeOff/edit-writeOff.component';

const routes: Routes = [
	{
		path: '',
		component: WriteOffComponent,
		children: [
			{
				path: '',
				component: ListWriteOffComponent
			},
			{
				path: 'add',
				component: AddWriteOffComponent
			},
			{
				path: 'edit/:id',
				component: EditWriteOffComponent
			},
			{
				path: 'view/:id',
				component: ViewWriteOffComponent
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
		StoreModule.forFeature('writeOff', writeOffReducer),
		EffectsModule.forFeature([WriteOffEffect]),
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
		WriteOffComponent,
	],
	declarations: [
		WriteOffComponent,
		ListWriteOffComponent,
		AddWriteOffComponent,
		EditWriteOffComponent,
		ViewWriteOffComponent,
	]
})
export class WriteOffModule { }
