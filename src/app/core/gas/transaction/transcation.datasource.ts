// RxJS
import { of } from 'rxjs';
import { catchError, finalize, tap, debounceTime, delay, distinctUntilChanged } from 'rxjs/operators';
// NGRX
import { Store, select } from '@ngrx/store';
// CRUD
import { BaseDataSource, QueryResultsModel } from '../../_base/crud';
// State
import { AppState } from '../../../core/reducers';
import { selectGasTransactionInStore, selectGasTransactionPageLoading, selectGasTransactionShowInitWaitingMessage } from './transaction.selector';


export class GasTransactionDataSource extends BaseDataSource {
	constructor(private store: Store<AppState>) {
		super();

		this.loading$ = this.store.pipe(
			select(selectGasTransactionPageLoading)
		);

		this.isPreloadTextViewed$ = this.store.pipe(
			select(selectGasTransactionShowInitWaitingMessage)
		);

		this.store.pipe(
			select(selectGasTransactionInStore)
		).subscribe((response: QueryResultsModel) => {
			this.paginatorTotalSubject.next(response.totalCount);
			this.entitySubject.next(response.items);
		});
	}
}
