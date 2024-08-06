// RxJS
import { of } from 'rxjs';
import { catchError, finalize, tap, debounceTime, delay, distinctUntilChanged } from 'rxjs/operators';
// NGRX
import { Store, select } from '@ngrx/store';
// CRUD
import { BaseDataSource, QueryResultsModel } from '../_base/crud';
// State
import { AppState } from '../reducers';
import { selectAccountHistoryInStore, selectAccountHistoryPageLoading, selectAccountHistoryShowInitWaitingMessage } from './accountHistory.selector';


export class AccountHistoryDataSource extends BaseDataSource {
	constructor(private store: Store<AppState>) {
		super();

		this.loading$ = this.store.pipe(
			select(selectAccountHistoryPageLoading)
		);

		this.isPreloadTextViewed$ = this.store.pipe(
			select(selectAccountHistoryShowInitWaitingMessage)
		);

		this.store.pipe(
			select(selectAccountHistoryInStore)
		).subscribe((response: QueryResultsModel) => {
			this.paginatorTotalSubject.next(response.totalCount);
			this.entitySubject.next(response.items);
		});
	}
}
