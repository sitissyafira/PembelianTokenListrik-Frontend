import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

// Modules
import { CashFlowRoutingModule } from './cashFlow-routing.module';

// Services
import { HttpUtilsService, TypesUtilsService, InterceptService, LayoutUtilsService} from '../../../../core/_base/crud';

// Components
import { PartialsModule } from '../../../partials/partials.module';
import {
  MatButtonModule,
  MatCardModule,
  MatDatepickerModule,
  MatIconModule,
  MatInputModule,
  MatMenuModule,
  MatProgressSpinnerModule,
  MatSnackBarModule,
  MatCheckboxModule,
  MAT_DIALOG_DEFAULT_OPTIONS
} from '@angular/material';
import { CashFlowComponent } from './cashFlow.component';
import { ActionNotificationComponent } from '../../../partials/content/crud';


@NgModule({
  declarations: [CashFlowComponent],
  imports: [
    CommonModule,
    CashFlowRoutingModule,
    HttpClientModule,
    MatButtonModule,
    MatCardModule,
    MatDatepickerModule,
    MatIconModule,
    MatInputModule,
    MatMenuModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatCheckboxModule,
    PartialsModule
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
    CashFlowComponent
  ]
})
export class CashFlowModule { }
