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
import { PurchaseOrderComponent } from './purchaseOrder.component';
import { ListPurchaseOrderComponent } from './list-purchaseOrder/list-purchaseOrder.component';
import { AddpurchaseOrderComponent } from './add-purchaseOrder/add-purchaseOrder.component';
import { PdfViewerModule } from 'ng2-pdf-viewer';

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

import {purchaseOrderReducer} from '../../../../core/purchaseManagement/purchaseOrder/purchaseOrder.reducer';
import {PurchaseOrderEffect} from '../../../../core/purchaseManagement/purchaseOrder/purchaseOrder.effect';
import { PopupViewPurchaseOrder } from './popup-view-purchaseOrder/popup-view-purchaseOrder.component';
import { PopupEditPurchaseOrder } from './popup-edit-purchaseOrder/popup-edit-purchaseOrder.component';
import { ViewpurchaseOrderComponent } from './view-purchaseOrder/view-purchaseOrder.component';
import { EditpurchaseOrderComponent } from './edit-purchaseOrder/edit-purchaseOrder.component';

const routes: Routes = [
	{
		path: '',
		component: PurchaseOrderComponent,
		children: [
			{
				path: '',
				component: ListPurchaseOrderComponent
			},
			{
				path: 'add',
				component: AddpurchaseOrderComponent
			},
			{
				path: 'edit/:id',
				component: EditpurchaseOrderComponent
			},
			{
				path: 'view/:id',
				component: ViewpurchaseOrderComponent
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
		StoreModule.forFeature('purchaseOrder', purchaseOrderReducer),
		EffectsModule.forFeature([PurchaseOrderEffect]),
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
		PdfViewerModule,
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
		PopupViewPurchaseOrder,
		PopupEditPurchaseOrder,
		PurchaseOrderComponent
	],
	declarations: [
		PurchaseOrderComponent,
		ListPurchaseOrderComponent,
		AddpurchaseOrderComponent,
		EditpurchaseOrderComponent,
		ViewpurchaseOrderComponent,
		PopupViewPurchaseOrder,
		PopupEditPurchaseOrder,
	]
})
export class purchaseOrderModule {}
