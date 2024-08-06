// RxJS
import { of } from 'rxjs';
import { catchError, finalize, tap, debounceTime, delay, distinctUntilChanged } from 'rxjs/operators';
// NGRX
import { Store, select } from '@ngrx/store';
// CRUD
import { BaseDataSource, QueryResultsModel } from '../_base/crud';
// State
import { AppState } from '../../core/reducers';
import { selectbillingNotifInStore, selectbillingNotifPageLoading, selectbillingNotifShowInitWaitingMessage } from './billingNotif.selector';


export class billingNotifDataSource extends BaseDataSource {
	constructor(private store: Store<AppState>) {
		super();

		this.loading$ = this.store.pipe(
			select(selectbillingNotifPageLoading)
		);

		this.isPreloadTextViewed$ = this.store.pipe(
			select(selectbillingNotifShowInitWaitingMessage)
		);

		this.store.pipe(
			select(selectbillingNotifInStore)
		).subscribe((response: QueryResultsModel) => {
			this.paginatorTotalSubject.next(response.totalCount);
			this.entitySubject.next(response.items);
		});
	}
}
