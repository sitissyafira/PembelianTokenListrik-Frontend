// RxJS
import { of } from 'rxjs';
import { catchError, finalize, tap, debounceTime, delay, distinctUntilChanged } from 'rxjs/operators';
// NGRX
import { Store, select } from '@ngrx/store';
// CRUD
import { BaseDataSource, QueryResultsModel } from '../_base/crud';
// State
import { AppState } from '../reducers';
import { selectPublicTicketInStore, selectPublicTicketPageLoading, selectPublicTicketShowInitWaitingMessage } from './publicticket.selector';


export class PublicTicketDataSource extends BaseDataSource {
	constructor(private store: Store<AppState>) {
		super();

		this.loading$ = this.store.pipe(
			select(selectPublicTicketPageLoading)
		);

		this.isPreloadTextViewed$ = this.store.pipe(
			select(selectPublicTicketShowInitWaitingMessage)
		);

		this.store.pipe(
			select(selectPublicTicketInStore)
		).subscribe((response: QueryResultsModel) => {
			this.paginatorTotalSubject.next(response.totalCount);
			this.entitySubject.next(response.items);
		});
	}
}
