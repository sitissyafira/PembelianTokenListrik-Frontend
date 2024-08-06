// RxJS
import { of } from 'rxjs';
import { catchError, finalize, tap, debounceTime, delay, distinctUntilChanged } from 'rxjs/operators';
// NGRX
import { Store, select } from '@ngrx/store';
// CRUD
import { BaseDataSource, QueryResultsModel } from '../_base/crud';
// State
import { AppState } from '../../core/reducers';
import { selectRevenueInStore, selectRevenuePageLoading, selectRevenueShowInitWaitingMessage } from './revenue.selector';


export class RevenueDataSource extends BaseDataSource {
	constructor(private store: Store<AppState>) {
		super();

		this.loading$ = this.store.pipe(
			select(selectRevenuePageLoading)
		);

		this.isPreloadTextViewed$ = this.store.pipe(
			select(selectRevenueShowInitWaitingMessage)
		);

		this.store.pipe(
			select(selectRevenueInStore)
		).subscribe((response: QueryResultsModel) => {
			this.paginatorTotalSubject.next(response.totalCount);
			this.entitySubject.next(response.items);
		});
	}
}
