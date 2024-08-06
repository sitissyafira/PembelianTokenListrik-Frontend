// Angular
import {ChangeDetectionStrategy, Component, OnInit} from '@angular/core';
import {Store} from '@ngrx/store';
import {AppState} from '../../../core/reducers';
import {Router} from '@angular/router';


@Component({
  	selector: 'kt-blockgroup',
  	templateUrl: './blockgroup.component.html',
	changeDetection : ChangeDetectionStrategy.OnPush
})
export class BlockgroupComponent implements OnInit {

  constructor(private store: Store<AppState>, private router: Router) { }

  ngOnInit() {
  }

}
