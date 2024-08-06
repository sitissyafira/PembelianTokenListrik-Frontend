// RxJS
import { of } from 'rxjs';
import { catchError, finalize, tap, debounceTime, delay, distinctUntilChanged } from 'rxjs/operators';
// NGRX
import { Store, select } from '@ngrx/store';
// CRUD
import { BaseDataSource, QueryResultsModel } from '../_base/crud';
// State
import { AppState } from '../reducers';
import { selectTransactionsInStore, selectTransactionsPageLoading, selectTransactionsShowInitWaitingMessage } from './transactions.selector';


export class TransactionsDataSource extends BaseDataSource {
	constructor(private store: Store<AppState>) {
		super();

		this.loading$ = this.store.pipe(
			select(selectTransactionsPageLoading)
		);

		this.isPreloadTextViewed$ = this.store.pipe(
			select(selectTransactionsShowInitWaitingMessage)
		);

		this.store.pipe(
			select(selectTransactionsInStore)
		).subscribe((response: QueryResultsModel) => {
			this.paginatorTotalSubject.next(response.totalCount);
			this.entitySubject.next(response.items);
		});
	}
}
