// RxJS
import { of } from 'rxjs';
import { catchError, finalize, tap, debounceTime, delay, distinctUntilChanged } from 'rxjs/operators';
// NGRX
import { Store, select } from '@ngrx/store';
// CRUD
import { BaseDataSource, QueryResultsModel } from '../../_base/crud';
// State
import { AppState } from '../../../core/reducers';
import { selectGalonRateInStore, selectGalonRatePageLoading, selectGalonRateShowInitWaitingMessage } from './rate.selector';


export class GalonRateDataSource extends BaseDataSource {
	constructor(private store: Store<AppState>) {
		super();

		this.loading$ = this.store.pipe(
			select(selectGalonRatePageLoading)
		);

		this.isPreloadTextViewed$ = this.store.pipe(
			select(selectGalonRateShowInitWaitingMessage)
		);

		this.store.pipe(
			select(selectGalonRateInStore)
		).subscribe((response: QueryResultsModel) => {
			this.paginatorTotalSubject.next(response.totalCount);
			this.entitySubject.next(response.items);
		});
	}
}
