import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { CalendarOptions } from '@fullcalendar/angular';
import { KtDialogService } from '../../../core/_base/layout';
import { Router } from '@angular/router';
import moment from 'moment';

import { environment } from '../../../../environments/environment';

@Component({
  selector: 'kt-calendar-helpdesk',
  templateUrl: './calendar-helpdesk.component.html',
  styleUrls: ['./calendar-helpdesk.component.scss']
})
export class CalendarHelpdeskComponent implements OnInit, OnDestroy {

  loading: boolean = false;
  eventData = [];
  subs = [];
  
  calendarOptions: CalendarOptions = {
    initialView: 'dayGridMonth',
    eventClick: this._handleEventClick.bind(this),
    dayMaxEventRows: 99,
    displayEventTime: false
  }

  constructor(
    private http: HttpClient,
    private ktDIalogueService: KtDialogService,
    private ref: ChangeDetectorRef,
    private router: Router
  ) { }
  
  _handleEventClick(e) {
    this.router.navigate(['/publiccalendar/view', e.event.id]);
  }

  _setDataEvent(items: any) {
    this.eventData = items.filter(i => i.visitDateSurv || i.visitDateFixing );
    this._buildEventView();
  }

  _buildEventView() {
    const temp = [];

    this.eventData.map(i => {
      if(i.visitDateSurv && i.engSurvey){
        temp.push({
          title: `Survey unit ${i.unit} - ${i.engSurvey.name}`,
          date: new Date(i.visitDateSurv),
          color: this.checkPriority(i.ticket.priority),
          id: i.ticket._id
        });
      }
      if(i.visitDateFixing && i.engFixing){
        temp.push({
          title: `Fixing unit ${i.unit} - ${i.engFixing.name}`,
          date: new Date(i.visitDateFixing),
          color: this.checkPriority(i.ticket.priority),
          id: i.ticket._id
        });
      }
    });

    this.calendarOptions = {
      ...this.calendarOptions,
      events: temp
    }
    this.ref.markForCheck();
  }

  loadData() {
    const date = {
      from: moment().subtract(1, 'months').format("YYYY-MM-DD"),
      to: moment().add(1, 'months').format("YYYY-MM-DD")
    }
    const url = `${environment.baseAPI}/api/doPublic/filter/bydaterange`;

    this.loading = true;
    
    // Save the subs
    this.subs.push(
      this.http.get<any>(url).subscribe(
        (resp) => {
          this._setDataEvent(resp.data);
          this.stopLoading();
        },
        (error) => {
          console.error(error, "WOOWH");
        }
      )
    )
  }

  checkPriority(priority: string) {
    let item
    if(priority){
      item = priority.toLocaleLowerCase();
    }
    
    switch(item) {
      case 'high':
        return "#fd397a";
      case 'medium':
        return "gold";
      case 'low':
      default:
        return "#00b93a";
    }
  }

  stopLoading() {
    this.loading = false;
    this.ref.markForCheck();
    this.ktDIalogueService.hide();
  }

  ngOnInit() {
    this.loadData();
  }

  ngOnDestroy() {
    this.subs.map(i => {
      i.unsubscribe()
    })
  }
}
