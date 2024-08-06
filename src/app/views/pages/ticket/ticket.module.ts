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
import { TicketComponent } from './ticket.component';
import { ListTicketComponent } from './list-ticket/list-ticket.component';
import { AddTicketComponent } from './add-ticket/add-ticket.component';

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

import { ticketReducer } from '../../../core/ticket/ticket.reducer';
import { TicketEffect } from '../../../core/ticket/ticket.effect';

import { ViewTicketComponent } from './view-ticket/view-ticket.component';
import { EditTicketComponent } from './edit-ticket/edit-ticket.component';
import { RejectTicketComponent } from './reject-ticket/reject-ticket.component';
import { EditResTicketComponent } from './res-ticket/edit-ticket.component';

import { ListTicketWfsComponent } from './list-ticketwfs/list-ticket.component';
import { ListTicketOpenComponent } from './list-ticketopen/list-ticket.component';
import { ListTicketWfcComponent } from './list-ticketwfc/list-ticket.component';
import { ListTicketScheduledComponent } from './list-ticketscheduled/list-ticket.component';
import { ListTicketResecheduledComponent } from './list-ticketrescheduled/list-ticket.component';
import { ListTicketDoneComponent } from './list-ticketdone/list-ticket.component';
import { ListTicketWaitSurveyComponent } from './list-ticketwaitsurvey/list-ticket.component';
import { ListTicketSchSurveyComponent } from './list-ticketschsurvey/list-ticket.component';
import { ListTicketSurveyDoneComponent } from './list-ticketsurveydone/list-ticket.component';
import { ListTicketRejectComponent } from './list-ticketreject/list-ticket.component';
import { Popup, PopupReschdule, PopupReschduleFixing } from './popup/popup.component';


const routes: Routes = [
	{
		path: '',
		component: TicketComponent,
		children: [
			{
				path: '',
				component: ListTicketComponent
			},
			{
				path: 'wfs',
				component: ListTicketWfsComponent
			},
			{
				path: 'wfc',
				component: ListTicketWfcComponent
			},
			{
				path: 'sch',
				component: ListTicketScheduledComponent
			},
			{
				path: 'rsh',
				component: ListTicketResecheduledComponent
			},
			{
				path: 'open',
				component: ListTicketOpenComponent
			},
			{
				path: 'done',
				component: ListTicketDoneComponent
			},
			// add 4 category route
			// 1. Wait Survey
			{
				path: 'wfsurvey',
				component: ListTicketWaitSurveyComponent
			},
			// 2. Schedule Survey
			{
				path: 'schSurvey',
				component: ListTicketSchSurveyComponent
			},
			// 3. Survey Done
			{
				path: 'svyDone',
				component: ListTicketSurveyDoneComponent
			},
			// 4. Reject
			{
				path: 'reject',
				component: ListTicketRejectComponent
			},
			// END. 
			{
				path: 'add',
				component: AddTicketComponent
			},
			{
				path: 'edit/:id',
				component: EditTicketComponent
			},
			{
				path: 'reject/:id',
				component: RejectTicketComponent
			},
			{
				path: 'view/:id',
				component: ViewTicketComponent
			},
			{
				path: 're/:id',
				component: EditResTicketComponent
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
		StoreModule.forFeature('ticket', ticketReducer),
		EffectsModule.forFeature([TicketEffect]),
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
		TicketComponent,
		Popup,
		PopupReschdule,
		PopupReschduleFixing
	],
	declarations: [
		TicketComponent,

		AddTicketComponent,
		EditTicketComponent,
		RejectTicketComponent,
		ViewTicketComponent,
		EditResTicketComponent,

		ListTicketComponent,
		ListTicketWfsComponent,
		ListTicketWfcComponent,
		ListTicketOpenComponent,
		ListTicketScheduledComponent,
		ListTicketResecheduledComponent,
		ListTicketDoneComponent,
		ListTicketWaitSurveyComponent,
		ListTicketSchSurveyComponent,
		ListTicketRejectComponent,
		ListTicketSurveyDoneComponent,
		Popup,
		PopupReschdule,
		PopupReschduleFixing
	]
})
export class TicketModule { }
