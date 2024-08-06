import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { TranslateModule } from '@ngx-translate/core';
import { PartialsModule } from '../../../partials/partials.module';
import { HttpUtilsService, TypesUtilsService, InterceptService, LayoutUtilsService } from '../../../../core/_base/crud';
import { ActionNotificationComponent } from '../../../partials/content/crud';
import { ApComponent } from './ap.component';
import { ListApComponent } from './list-ap/list-ap.component';
import { AddApComponent } from './add-ap/add-ap.component';
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

import { apReducer } from '../../../../core/finance/ap/ap.reducer';
import { ApEffect } from '../../../../core/finance/ap/ap.effect';
import { ViewApComponent } from './view-ap/view-ap.component';
import { EditApComponent } from './edit-ap/edit-ap.component';
// import { EditApComponent } from './edit-ap/edit-ap.component';

const routes: Routes = [
	{
		path: '',
		component: ApComponent,
		children: [
			{
				path: '',
				component: ListApComponent
			},
			{
				path: 'add',
				component: AddApComponent
			},
			{
				path: 'edit/:id',
				component: EditApComponent
			},
			{
				path: 'view/:id',
				component: ViewApComponent
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
		StoreModule.forFeature('ap', apReducer),
		EffectsModule.forFeature([ApEffect]),
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
		ApComponent,
	],
	declarations: [
		ApComponent,
		ListApComponent,
		AddApComponent,
		EditApComponent,
		ViewApComponent,
		// EditApComponent
	]
})
export class ApModule { }
