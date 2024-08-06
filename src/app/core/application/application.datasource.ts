// RxJS
import { of } from 'rxjs';
import { catchError, finalize, tap, debounceTime, delay, distinctUntilChanged } from 'rxjs/operators';
// NGRX
import { Store, select } from '@ngrx/store';
// CRUD
import { BaseDataSource, QueryResultsModel } from '../_base/crud';
// State
import { AppState } from '../../core/reducers';
import { selectApplicationInStore, selectApplicationPageLoading, selectApplicationShowInitWaitingMessage } from './application.selector';


export class ApplicationDataSource extends BaseDataSource {
	constructor(private store: Store<AppState>) {
		super();

		this.loading$ = this.store.pipe(
			select(selectApplicationPageLoading)
		);

		this.isPreloadTextViewed$ = this.store.pipe(
			select(selectApplicationShowInitWaitingMessage)
		);

		this.store.pipe(
			select(selectApplicationInStore)
		).subscribe((response: QueryResultsModel) => {
			this.paginatorTotalSubject.next(response.totalCount);
			this.entitySubject.next(response.items);
		});
	}
}
