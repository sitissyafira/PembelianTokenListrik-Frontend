// RxJS
import { of } from 'rxjs';
import { catchError, finalize, tap, debounceTime, delay, distinctUntilChanged } from 'rxjs/operators';
// NGRX
import { Store, select } from '@ngrx/store';
// CRUD
import { BaseDataSource, QueryResultsModel } from '../_base/crud';
// State
import { AppState } from '../../core/reducers';
import { selectLogactionInStore, selectLogactionPageLoading, selectLogactionShowInitWaitingMessage } from './logaction.selector';


export class LogactionDataSource extends BaseDataSource {
	constructor(private store: Store<AppState>) {
		super();

		this.loading$ = this.store.pipe(
			select(selectLogactionPageLoading)
		);

		this.isPreloadTextViewed$ = this.store.pipe(
			select(selectLogactionShowInitWaitingMessage)
		);

		this.store.pipe(
			select(selectLogactionInStore)
		).subscribe((response: QueryResultsModel) => {
			this.paginatorTotalSubject.next(response.totalCount);
			this.entitySubject.next(response.items);
		});
	}
}
