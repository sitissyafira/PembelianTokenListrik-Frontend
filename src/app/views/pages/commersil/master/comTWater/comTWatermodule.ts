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
import { ComTWaterComponent } from './comTWater.component';
import { ListComTWaterComponent } from './list-comTWater/list-comTWater.component';
// import { AddComTWaterComponent } from './add-comTWater/add-comTWater.component';

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

import {comTWaterReducer} from '../../../../../core/commersil/master/comTWater/comTWater.reducer';
import {ComTWaterEffect} from '../../../../../core/commersil/master/comTWater/comTWater.effect';
import { AddComTWaterComponent } from './add-comTWater/add-comTWater.component';
import { EditComTWaterComponent } from './edit-comTWater/edit-comTWater.component';
// import { EditComTWaterComponent } from './edit-comTWater/edit-comTWater.component';
// import { EditComTWaterComponent } from './edit-comTWater/edit-comTWater.component';

const routes: Routes = [
	{
		path: '',
		component: ComTWaterComponent,
		children: [
			{
				path: '',
				component: ListComTWaterComponent
			},
			{
				path: 'add',
				component: AddComTWaterComponent
			},
			{
				path: 'edit/:id',
				component: EditComTWaterComponent
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
		StoreModule.forFeature('comTWater', comTWaterReducer),
		EffectsModule.forFeature([ComTWaterEffect]),
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
		ComTWaterComponent
	],
	declarations: [
		ComTWaterComponent,
		ListComTWaterComponent,
		AddComTWaterComponent,
		EditComTWaterComponent
	]
})
export class ComTWaterModule {}
