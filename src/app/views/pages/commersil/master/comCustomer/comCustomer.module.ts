import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { TranslateModule } from '@ngx-translate/core';
import { PartialsModule } from '../../../../partials/partials.module';
import { HttpUtilsService, TypesUtilsService, InterceptService, LayoutUtilsService } from '../../../../../core/_base/crud';
import { ActionNotificationComponent } from '../../../../partials/content/crud';
import { ComCustomerComponent } from './comCustomer.component';
import { ListComCustomerComponent } from './list-comCustomer/list-comCustomer.component';
import { AddComCustomerComponent } from './add-comCustomer/add-comCustomer.component';

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

import { comCustomerReducer } from '../../../../../core/commersil/master/comCustomer/comCustomer.reducer';
import { ComCustomerEffect } from '../../../../../core/commersil/master/comCustomer/comCustomer.effect';
import { EditComCustomerComponent } from './edit-comCustomer/edit-comCustomer.component';
import { PopupPurchaseRequest } from './popup-purchaseRequest/popup-purchaseRequest.component';
// import { EditComCustomerComponent } from './edit-comCustomer/edit-comCustomer.component';

const routes: Routes = [
	{
		path: '',
		component: ComCustomerComponent,
		children: [
			{
				path: '',
				component: ListComCustomerComponent
			},
			{
				path: 'add',
				component: AddComCustomerComponent
			},
			{
				path: 'edit/:id',
				component: EditComCustomerComponent
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
		StoreModule.forFeature('comCustomer', comCustomerReducer),
		EffectsModule.forFeature([ComCustomerEffect]),
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
		ComCustomerComponent,
		PopupPurchaseRequest
	],
	declarations: [
		ComCustomerComponent,
		ListComCustomerComponent,
		AddComCustomerComponent,
		EditComCustomerComponent,
		PopupPurchaseRequest
	]
})
export class ComCustomerModule { }
