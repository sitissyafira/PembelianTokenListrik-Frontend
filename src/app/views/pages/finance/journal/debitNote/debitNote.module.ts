// AnguldebitNote
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
import { DebitNoteComponent } from './debitNote.component';
import { ListDebitNoteComponent } from './list-debitNote/list-debitNote.component';
import { AddDebitNoteComponent } from './add-debitNote/add-debitNote.component';
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

import { debitNoteReducer } from '../../../../../core/finance/journal/debitNote/debitNote.reducer';
import { DebitNoteEffect } from '../../../../../core/finance/journal/debitNote/debitNote.effect';
import { ViewDebitNoteComponent } from './view-debitNote/view-debitNote.component';
import { EditDebitNoteComponent } from './edit-debitNote/edit-debitNote.component';

const routes: Routes = [
	{
		path: '',
		component: DebitNoteComponent,
		children: [
			{
				path: '',
				component: ListDebitNoteComponent
			},
			{
				path: 'add',
				component: AddDebitNoteComponent
			},
			{
				path: 'edit/:id',
				component: EditDebitNoteComponent
			},
			{
				path: 'view/:id',
				component: ViewDebitNoteComponent
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
		StoreModule.forFeature('debitNote', debitNoteReducer),
		EffectsModule.forFeature([DebitNoteEffect]),
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
		DebitNoteComponent,
	],
	declarations: [
		DebitNoteComponent,
		ListDebitNoteComponent,
		AddDebitNoteComponent,
		EditDebitNoteComponent,
		ViewDebitNoteComponent,
	]
})
export class DebitNoteModule { }
