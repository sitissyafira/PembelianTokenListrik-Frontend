// RxJS
import { of } from 'rxjs';
import { catchError, finalize, tap, debounceTime, delay, distinctUntilChanged } from 'rxjs/operators';
// NGRX
import { Store, select } from '@ngrx/store';
// CRUD
import { BaseDataSource, QueryResultsModel } from '../../_base/crud';
// State
import { AppState } from '../../../core/reducers';
import { selectAdInStore, selectAdPageLoading, selectAdShowInitWaitingMessage } from './ad.selector';


export class AdDataSource extends BaseDataSource {
	constructor(private store: Store<AppState>) {
		super();

		this.loading$ = this.store.pipe(
			select(selectAdPageLoading)
		);

		this.isPreloadTextViewed$ = this.store.pipe(
			select(selectAdShowInitWaitingMessage)
		);

		this.store.pipe(
			select(selectAdInStore)
		).subscribe((response: QueryResultsModel) => {
			this.paginatorTotalSubject.next(response.totalCount);
			this.entitySubject.next(response.items);
		});
	}
}
