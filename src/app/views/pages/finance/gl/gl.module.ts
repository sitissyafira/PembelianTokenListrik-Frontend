import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { HttpClientModule, HTTP_INTERCEPTORS } from "@angular/common/http";

// Modules
import { GlRoutingModule } from "./gl-routing.module";

// Services
import { HttpUtilsService, TypesUtilsService, InterceptService, LayoutUtilsService} from "../../../../core/_base/crud";

// Components
import { PartialsModule } from "../../../partials/partials.module";
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
	MAT_DATE_FORMATS,
	MAT_DATE_LOCALE
} from "@angular/material";
import { GlComponent } from "./gl.component";
import { ActionNotificationComponent } from "../../../partials/content/crud";
import { MomentDateAdapter, MAT_MOMENT_DATE_ADAPTER_OPTIONS } from '@angular/material-moment-adapter';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

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
  declarations: [GlComponent],
  imports: [
    CommonModule,
    GlRoutingModule,
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
		FormsModule,
		ReactiveFormsModule
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
				panelClass: "kt-mat-dialog-container__wrapper",
				height: "auto",
				width: "900px"
			}
		},
    {
			provide: DateAdapter, 
			useClass: MomentDateAdapter,
			deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS],
		  },
		  { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
		// MatDatepickerModul,
		HttpUtilsService,
		TypesUtilsService,
		LayoutUtilsService
  ],
  entryComponents: [
    ActionNotificationComponent,
    GlComponent
  ]
})
export class GlModule { }
