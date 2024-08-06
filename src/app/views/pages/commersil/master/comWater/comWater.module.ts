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
import { ComWaterComponent } from './comWater.component';
import { ListComWaterComponent } from './list-comWater/list-comWater.component';
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

import {comWaterReducer} from '../../../../../core/commersil/master/comWater/comWater.reducer';
import {ComWaterEffect} from '../../../../../core/commersil/master/comWater/comWater.effect';
import { AddComWaterComponent } from './add-comWater/add-comWater.component';
import { EditComWaterComponent } from './edit-comWater/edit-comWater.component';
import { ViewComWaterComponent } from './view-comWater/view-comWater.component';

const routes: Routes = [
	{
		path: '',
		component: ComWaterComponent,
		children: [
			{
				path: '',
				component: ListComWaterComponent
			},
			{
				path: 'add',
				component: AddComWaterComponent
			},
			{
				path: 'edit/:id',
				component: EditComWaterComponent
			},
			{
				path: 'view/:id',
				component: ViewComWaterComponent
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
		StoreModule.forFeature('comWater', comWaterReducer),
		EffectsModule.forFeature([ComWaterEffect]),
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
		ComWaterComponent
	],
	declarations: [
		ComWaterComponent,
		ListComWaterComponent,
		AddComWaterComponent,
		EditComWaterComponent,
		ViewComWaterComponent,
	]
})
export class ComWaterModule {}
