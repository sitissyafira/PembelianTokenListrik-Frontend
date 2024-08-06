// RxJS
import { of } from 'rxjs';
import { catchError, finalize, tap, debounceTime, delay, distinctUntilChanged } from 'rxjs/operators';
// NGRX
import { Store, select } from '@ngrx/store';
// CRUD
import { BaseDataSource, QueryResultsModel } from '../../_base/crud';
// State
import { AppState } from '../../../core/reducers';
import { selectGasRateInStore, selectGasRatePageLoading, selectGasRateShowInitWaitingMessage } from './rate.selector';


export class GasRateDataSource extends BaseDataSource {
	constructor(private store: Store<AppState>) {
		super();

		this.loading$ = this.store.pipe(
			select(selectGasRatePageLoading)
		);

		this.isPreloadTextViewed$ = this.store.pipe(
			select(selectGasRateShowInitWaitingMessage)
		);

		this.store.pipe(
			select(selectGasRateInStore)
		).subscribe((response: QueryResultsModel) => {
			this.paginatorTotalSubject.next(response.totalCount);
			this.entitySubject.next(response.items);
		});
	}
}
