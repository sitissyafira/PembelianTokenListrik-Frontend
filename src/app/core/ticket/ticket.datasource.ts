// RxJS
import { of } from 'rxjs';
import { catchError, finalize, tap, debounceTime, delay, distinctUntilChanged } from 'rxjs/operators';
// NGRX
import { Store, select } from '@ngrx/store';
// CRUD
import { BaseDataSource, QueryResultsModel } from '../_base/crud';
// State
import { AppState } from '../../core/reducers';
import { selectTicketInStore, selectTicketPageLoading, selectTicketShowInitWaitingMessage } from './ticket.selector';


export class TicketDataSource extends BaseDataSource {
	constructor(private store: Store<AppState>) {
		super();

		this.loading$ = this.store.pipe(
			select(selectTicketPageLoading)
		);

		this.isPreloadTextViewed$ = this.store.pipe(
			select(selectTicketShowInitWaitingMessage)
		);

		this.store.pipe(
			select(selectTicketInStore)
		).subscribe((response: QueryResultsModel) => {
			this.paginatorTotalSubject.next(response.totalCount);
			this.entitySubject.next(response.items);
		});
	}
}
