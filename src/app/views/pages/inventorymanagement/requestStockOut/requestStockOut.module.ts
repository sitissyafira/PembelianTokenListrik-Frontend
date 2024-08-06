import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { TranslateModule } from '@ngx-translate/core';
import { PartialsModule } from '../../../partials/partials.module';
import { HttpUtilsService, TypesUtilsService, InterceptService, LayoutUtilsService} from '../../../../core/_base/crud';
import { ActionNotificationComponent } from '../../../partials/content/crud';
import { RequestStockOutComponent } from './requestStockOut.component';
import { ListRequestStockOutComponent } from './list-requestStockOut/list-requestStockOut.component';
import { AddRequestStockOutComponent } from './add-requestStockOut/add-requestStockOut.component';

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

import {requestStockOutReducer} from '../../../../core/inventorymanagement/requestStockOut/requestStockOut.reducer';
import {RequestStockOutEffect} from '../../../../core/inventorymanagement/requestStockOut/requestStockOut.effect';
import { EditRequestStockOutComponent } from './edit-stockProduct/edit-requestStockOut.component';
// import { EditRequestStockOutComponent } from './edit-requestStockOut/edit-requestStockOut.component';

const routes: Routes = [
	{
		path: '',
		component: RequestStockOutComponent,
		children: [
			{
				path: '',
				component: ListRequestStockOutComponent
			},
			{
				path: 'add',
				component: AddRequestStockOutComponent
			}
			,
			{
				path: 'edit/:id',
				component: EditRequestStockOutComponent
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
		StoreModule.forFeature('requestStockOut', requestStockOutReducer),
		EffectsModule.forFeature([RequestStockOutEffect]),
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
		RequestStockOutComponent
	],
	declarations: [
		RequestStockOutComponent,
		ListRequestStockOutComponent,
		AddRequestStockOutComponent,
		EditRequestStockOutComponent
	]
})
export class RequestStockOutModule {}
