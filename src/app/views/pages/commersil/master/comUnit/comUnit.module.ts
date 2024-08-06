import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { TranslateModule } from '@ngx-translate/core';
import { PartialsModule } from '../../../../partials/partials.module';
import { HttpUtilsService, TypesUtilsService, InterceptService, LayoutUtilsService} from '../../../../../core/_base/crud';
import { ActionNotificationComponent } from '../../../../partials/content/crud';
import { ComUnitComponent } from './comUnit.component';
import { ListComUnitComponent } from './list-comUnit/list-comUnit.component';
import { AddComUnitComponent } from './add-comUnit/add-comUnit.component';

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

import {comUnitReducer} from '../../../../../core/commersil/master/comUnit/comUnit.reducer';
import {ComUnitEffect} from '../../../../../core/commersil/master/comUnit/comUnit.effect';
import { EditcomUnitComponent } from './edit-comUnit/edit-comUnit.component';
import { ViewcomUnitComponent } from './view-comUnit/view-comUnit.component';

const routes: Routes = [
	{
		path: '',
		component: ComUnitComponent,
		children: [
			{
				path: '',
				component: ListComUnitComponent
			},
			{
				path: 'add',
				component: AddComUnitComponent
			},
			{
				path: 'edit/:id',
				component: EditcomUnitComponent
			}
			,
			{
				path: 'view/:id',
				component: ViewcomUnitComponent
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
		StoreModule.forFeature('comUnit', comUnitReducer),
		EffectsModule.forFeature([ComUnitEffect]),
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
		ComUnitComponent
	],
	declarations: [
		ComUnitComponent,
		ListComUnitComponent,
		AddComUnitComponent,
		EditcomUnitComponent,
		ViewcomUnitComponent,
	]
})
export class ComUnitModule {}
