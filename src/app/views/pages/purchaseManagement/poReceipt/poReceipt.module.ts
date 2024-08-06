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
import { PoReceiptComponent } from './poReceipt.component';
import { ListPoReceiptComponent } from './list-poReceipt/list-poReceipt.component';
import { AddpoReceiptComponent } from './add-poReceipt/add-poReceipt.component';
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

import {poReceiptReducer} from '../../../../core/purchaseManagement/poReceipt/poReceipt.reducer';
import {PoReceiptEffect} from '../../../../core/purchaseManagement/poReceipt/poReceipt.effect';
import { ViewpoReceiptComponent } from './view-poReceipt/view-poReceipt.component';
import { EditpoReceiptComponent } from './edit-poReceipt/edit-poReceipt.component';

const routes: Routes = [
	{
		path: '',
		component: PoReceiptComponent,
		children: [
			{
				path: '',
				component: ListPoReceiptComponent
			},
			{
				path: 'add',
				component: AddpoReceiptComponent
			},
			{
				path: 'edit/:id',
				component: EditpoReceiptComponent
			},
			{
				path: 'view/:id',
				component: ViewpoReceiptComponent
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
		StoreModule.forFeature('poReceipt', poReceiptReducer),
		EffectsModule.forFeature([PoReceiptEffect]),
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
		PoReceiptComponent
	],
	declarations: [
		PoReceiptComponent,
		ListPoReceiptComponent,
		AddpoReceiptComponent,
		EditpoReceiptComponent,
		ViewpoReceiptComponent,

	]
})
export class poReceiptModule {}
