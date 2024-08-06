// RxJS
import { of } from 'rxjs';
import { catchError, finalize, tap, debounceTime, delay, distinctUntilChanged } from 'rxjs/operators';
// NGRX
import { Store, select } from '@ngrx/store';
// CRUD
import { BaseDataSource, QueryResultsModel } from '../../_base/crud';
// State
import { AppState } from '../../../core/reducers';
import { selectOpeningBalanceInStore, selectOpeningBalancePageLoading, selectOpeningBalanceShowInitWaitingMessage } from './openingBalance.selector';


export class OpeningBalanceDataSource extends BaseDataSource {
	constructor(private store: Store<AppState>) {
		super();

		this.loading$ = this.store.pipe(
			select(selectOpeningBalancePageLoading)
		);

		this.isPreloadTextViewed$ = this.store.pipe(
			select(selectOpeningBalanceShowInitWaitingMessage)
		);

		this.store.pipe(
			select(selectOpeningBalanceInStore)
		).subscribe((response: QueryResultsModel) => {
			this.paginatorTotalSubject.next(response.totalCount);
			this.entitySubject.next(response.items);
		});
	}
}
