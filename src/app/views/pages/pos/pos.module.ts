// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
// NGRX
// Translate
import { TranslateModule } from '@ngx-translate/core';
import { PartialsModule } from '../../partials/partials.module';
// Services
import { HttpUtilsService, TypesUtilsService, InterceptService, LayoutUtilsService } from '../../../core/_base/crud';
// Shared
import { ActionNotificationComponent } from '../../partials/content/crud';
// Components
import { LoginPosComponent } from './login-pos/login-pos.component';
import { PopupLogout, PopupPay, PopupPayDetail } from './popup/popup.component';
import { PosComponent } from './pos.component';

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

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { OpenCashPosComponent } from './openCash-pos/openCash-pos.component';
import { WelcomePosComponent } from './welcome-pos/welcome-pos.component';
import { PayhistoryPosComponent } from './payhistory-pos/payhistory-pos.component';
import { PdfViewerModule } from 'ng2-pdf-viewer';

const routes: Routes = [
	{
		path: '',
		component: LoginPosComponent,
	},
	{
		path: 'openCash',
		component: OpenCashPosComponent,
	},
	{
		path: 'cashier',
		component: WelcomePosComponent,
	},
	{
		path: 'payhistory',
		component: PayhistoryPosComponent,
	},
];

@NgModule({
	imports: [
		CommonModule,
		HttpClientModule,
		PartialsModule,
		RouterModule.forChild(routes),
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
		NgbModule,
		PdfViewerModule
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
		PopupLogout,
		PopupPay,
		PopupPayDetail
	],
	declarations: [
		LoginPosComponent,
		OpenCashPosComponent,
		WelcomePosComponent,
		PayhistoryPosComponent,
		PopupLogout,
		PopupPay,
		PopupPayDetail,
		PosComponent
	]
})
export class PosModule { }
