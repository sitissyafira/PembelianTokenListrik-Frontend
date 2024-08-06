import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { TranslateModule } from '@ngx-translate/core';
import { CalendarHelpdeskRoutingModule } from './calendar-helpdesk-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// Calendar Module
import { FullCalendarModule } from '@fullcalendar/angular';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';

// Services
import { HttpUtilsService, TypesUtilsService, InterceptService, LayoutUtilsService} from '../../../core/_base/crud';
// Components
import { PartialsModule } from '../../partials/partials.module';
import {
  MatButtonModule,
  MatCardModule,
  MatDatepickerModule,
  MatIconModule,
  MatInputModule,
  MatMenuModule,
  MatProgressSpinnerModule,
  MatSnackBarModule,
  MAT_DIALOG_DEFAULT_OPTIONS,
  MatDialogModule,
  MatExpansionModule,
  MatTabsModule,
  MatTooltipModule,
  MatPaginatorModule,
  MatSortModule,
  MatCheckboxModule,
  MatNativeDateModule,
  MatProgressBarModule,
  MatTableModule,
  MatAutocompleteModule,
  MatRadioModule,
  MatSelectModule,
} from '@angular/material';

import { CalendarHelpdeskComponent } from './calendar-helpdesk.component';
import { ActionNotificationComponent } from '../../partials/content/crud';
import { CalendarBaseComponent } from './baseComponent/baseComponent.component';
import { ViewTicketComponent } from './view-ticket/view-ticket.component';

FullCalendarModule.registerPlugins([
  dayGridPlugin,
  interactionPlugin
]);

@NgModule({
  declarations: [
    CalendarHelpdeskComponent,
    CalendarBaseComponent,
    ViewTicketComponent,
  ],
  imports: [
    CommonModule,
    CalendarHelpdeskRoutingModule,
    FullCalendarModule,
    HttpClientModule,
    MatButtonModule,
    MatCardModule,
    MatDatepickerModule,
    MatIconModule,
    MatInputModule,
    MatMenuModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    PartialsModule,
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
    ActionNotificationComponent
  ]
})
export class CalendarHelpdeskModule { }
