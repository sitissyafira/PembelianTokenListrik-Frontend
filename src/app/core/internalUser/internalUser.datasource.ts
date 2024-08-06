// RxJS
import { of } from 'rxjs';
import { catchError, finalize, tap, debounceTime, delay, distinctUntilChanged } from 'rxjs/operators';
// NGRX
import { Store, select } from '@ngrx/store';
// CRUD
import { BaseDataSource, QueryResultsModel } from '../_base/crud';
// State
import { AppState } from '../reducers';
import { selectInternalUserInStore, selectInternalUserPageLoading, selectInternalUserShowInitWaitingMessage } from './internalUser.selector';


export class InternalUserDataSource extends BaseDataSource {
	constructor(private store: Store<AppState>) {
		super();

		this.loading$ = this.store.pipe(
			select(selectInternalUserPageLoading)
		);

		this.isPreloadTextViewed$ = this.store.pipe(
			select(selectInternalUserShowInitWaitingMessage)
		);

		this.store.pipe(
			select(selectInternalUserInStore)
		).subscribe((response: QueryResultsModel) => {
			this.paginatorTotalSubject.next(response.totalCount);
			this.entitySubject.next(response.items);
		});
	}
}
