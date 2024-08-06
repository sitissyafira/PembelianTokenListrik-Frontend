import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

// Modules
import { GldetailRoutingModule } from './gldetail-routing.module';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import {MatChipsModule} from '@angular/material/chips';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {MatSelectModule} from '@angular/material/select';

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
  MAT_DIALOG_DEFAULT_OPTIONS,
	DateAdapter,
	MAT_DATE_LOCALE,
	MAT_DATE_FORMATS
} from '@angular/material';
import { GldetailComponent } from './gldetail.component';
import { MomentDateAdapter, MAT_MOMENT_DATE_ADAPTER_OPTIONS } from '@angular/material-moment-adapter';

import { ActionNotificationComponent } from "../../../partials/content/crud";

export const MY_FORMATS = {
	parse: {
	  dateInput: 'MM/YYYY',
	},
	display: {
	  dateInput: 'MMMM YYYY',
	  monthYearLabel: 'MMM YYYY',
	  dateA11yLabel: 'LL',
	  monthYearA11yLabel: 'MMMM YYYY',
	},
  };

@NgModule({
  declarations: [GldetailComponent],
  imports: [
    CommonModule,
    GldetailRoutingModule,
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
    PartialsModule,
		MatAutocompleteModule,
		MatChipsModule,
		FormsModule,
		ReactiveFormsModule,
		MatSelectModule
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
    {
			provide: DateAdapter, 
			useClass: MomentDateAdapter,
			deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS],
		  },
		  { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
		HttpUtilsService,
		TypesUtilsService,
		LayoutUtilsService
  ],
  entryComponents: [
    ActionNotificationComponent,
    GldetailComponent
  ]
})
export class GldetailModule { }
