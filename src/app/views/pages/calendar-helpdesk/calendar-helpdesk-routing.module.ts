import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CalendarHelpdeskComponent } from './calendar-helpdesk.component'
import { ViewTicketComponent } from './view-ticket/view-ticket.component';
import { CalendarBaseComponent } from './baseComponent/baseComponent.component';

const routes: Routes = [
  { 
    path: "", 
    component: CalendarBaseComponent,
    children: [
      {
        path: "", 
        component: CalendarHelpdeskComponent,
      },
      {
        path: "view/:id",
        component: ViewTicketComponent
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CalendarHelpdeskRoutingModule { }