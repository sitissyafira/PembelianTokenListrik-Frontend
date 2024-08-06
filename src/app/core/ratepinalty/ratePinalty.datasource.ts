// RxJS
import { of } from 'rxjs';
import { catchError, finalize, tap, debounceTime, delay, distinctUntilChanged } from 'rxjs/operators';
// NGRX
import { Store, select } from '@ngrx/store';
// CRUD
import { BaseDataSource, QueryResultsModel } from '../_base/crud';
// State
import { AppState } from '../../core/reducers';
import { selectRatePinaltyInStore, selectRatePinaltyPageLoading, selectRatePinaltyShowInitWaitingMessage } from './ratePinalty.selector';


export class RatePinaltyDataSource extends BaseDataSource {
	constructor(private store: Store<AppState>) {
		super();

		this.loading$ = this.store.pipe(
			select(selectRatePinaltyPageLoading)
		);

		this.isPreloadTextViewed$ = this.store.pipe(
			select(selectRatePinaltyShowInitWaitingMessage)
		);

		this.store.pipe(
			select(selectRatePinaltyInStore)
		).subscribe((response: QueryResultsModel) => {
			this.paginatorTotalSubject.next(response.totalCount);
			this.entitySubject.next(response.items);
		});
	}
}
