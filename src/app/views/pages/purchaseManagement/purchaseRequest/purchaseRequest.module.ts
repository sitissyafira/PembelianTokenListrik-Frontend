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
import { PurchaseRequestComponent } from './purchaseRequest.component';
import { ListPurchaseRequestComponent } from './list-purchaseRequest/list-purchaseRequest.component';
import { AddpurchaseRequestComponent } from './add-purchaseRequest/add-purchaseRequest.component';

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

import {purchaseRequestReducer} from '../../../../core/purchaseManagement/purchaseRequest/purchaseRequest.reducer';
import {PurchaseRequestEffect} from '../../../../core/purchaseManagement/purchaseRequest/purchaseRequest.effect';
import { PopupPurchaseRequest } from './popup-purchaseRequest/popup-purchaseRequest.component';
import { ViewPurchaseRequestComponent } from './view-purchaseRequest/view-purchaseRequest.component';

const routes: Routes = [
	{
		path: '',
		component: PurchaseRequestComponent,
		children: [
			{
				path: '',
				component: ListPurchaseRequestComponent
			},
			{
				path: 'add',
				component: AddpurchaseRequestComponent
			},
			{
				path: 'edit/:id',
				component: AddpurchaseRequestComponent
			},
			{
				path: 'view/:id',
				component: ViewPurchaseRequestComponent
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
		StoreModule.forFeature('purchaseRequest', purchaseRequestReducer),
		EffectsModule.forFeature([PurchaseRequestEffect]),
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
		PopupPurchaseRequest,
		PurchaseRequestComponent
	],
	declarations: [
		PurchaseRequestComponent,
		ListPurchaseRequestComponent,
		ViewPurchaseRequestComponent,
		AddpurchaseRequestComponent,
		PopupPurchaseRequest
	]
})
export class purchaseRequestModule {}
