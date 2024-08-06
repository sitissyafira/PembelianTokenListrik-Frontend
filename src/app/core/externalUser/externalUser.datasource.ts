// RxJS
import { of } from 'rxjs';
import { catchError, finalize, tap, debounceTime, delay, distinctUntilChanged } from 'rxjs/operators';
// NGRX
import { Store, select } from '@ngrx/store';
// CRUD
import { BaseDataSource, QueryResultsModel } from '../_base/crud';
// State
import { AppState } from '../reducers';
import { selectExternalUserInStore, selectExternalUserPageLoading, selectExternalUserShowInitWaitingMessage } from './externalUser.selector';


export class ExternalUserDataSource extends BaseDataSource {
	constructor(private store: Store<AppState>) {
		super();

		this.loading$ = this.store.pipe(
			select(selectExternalUserPageLoading)
		);

		this.isPreloadTextViewed$ = this.store.pipe(
			select(selectExternalUserShowInitWaitingMessage)
		);

		this.store.pipe(
			select(selectExternalUserInStore)
		).subscribe((response: QueryResultsModel) => {
			this.paginatorTotalSubject.next(response.totalCount);
			this.entitySubject.next(response.items);
		});
	}
}
