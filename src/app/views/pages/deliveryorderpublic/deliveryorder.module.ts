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
import { HttpUtilsService, TypesUtilsService, InterceptService, LayoutUtilsService } from '../../../core/_base/crud';
// Shared
import { ActionNotificationComponent } from '../../partials/content/crud';
// Components
import { DeliveryorderComponent } from './deliveryorder.component';
import { ListDoComponent } from './list-deliveryorder/list-deliveryorder.component';
import { AddDoComponent } from './add-deliveryorder/add-deliveryorder.component';
import { ViewDoComponent } from './view-deliveryorder/view-deliveryorder.component';


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

import { publicDeliveryorderReducer } from '../../../core/deliveryorderpublic/publicdeliveryorder.reducer';
import { PublicDeliveryorderEffect } from '../../../core/deliveryorderpublic/publicdeliveryorder.effect';
import { ListDoVisitComponent } from './list-deliveryordervisit/list-deliveryorder.component';
import { ListDoFixedComponent } from './list-deliveryorderfixed/list-deliveryorder.component';
import { ListDoVisitFixingComponent } from './list-deliveryordervisitfixing/list-deliveryorder.component';

const routes: Routes = [
	{
		path: '',
		component: DeliveryorderComponent,
		children: [
			{
				path: '',
				component: ListDoComponent
			},
			{
				path: 'visit',
				component: ListDoVisitComponent
			},
			{
				path: 'visitFixing',
				component: ListDoVisitFixingComponent
			},
			{
				path: 'fixed',
				component: ListDoFixedComponent
			},
			{
				path: 'add',
				component: AddDoComponent
			},
			{
				path: 'edit/:id',
				component: AddDoComponent
			},
			{
				path: 'view/:id',
				component: ViewDoComponent
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
		StoreModule.forFeature('publicDeliveryorder', publicDeliveryorderReducer),
		EffectsModule.forFeature([PublicDeliveryorderEffect]),
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
		DeliveryorderComponent
	],
	declarations: [
		DeliveryorderComponent,
		ListDoComponent,
		ListDoVisitComponent,
		ListDoVisitFixingComponent,
		ListDoFixedComponent,
		AddDoComponent,
		ViewDoComponent
	]
})
export class DeliveryorderModule { }
