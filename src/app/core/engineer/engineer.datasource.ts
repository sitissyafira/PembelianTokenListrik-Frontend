// RxJS
import { of } from 'rxjs';
import { catchError, finalize, tap, debounceTime, delay, distinctUntilChanged } from 'rxjs/operators';
// NGRX
import { Store, select } from '@ngrx/store';
// CRUD
import { BaseDataSource, QueryResultsModel } from '../_base/crud';
// State
import { AppState } from '../reducers';
import { selectEngineerInStore, selectEngineerPageLoading, selectEngineerShowInitWaitingMessage } from './engineer.selector';


export class EngineerDataSource extends BaseDataSource {
	constructor(private store: Store<AppState>) {
		super();

		this.loading$ = this.store.pipe(
			select(selectEngineerPageLoading)
		);

		this.isPreloadTextViewed$ = this.store.pipe(
			select(selectEngineerShowInitWaitingMessage)
		);

		this.store.pipe(
			select(selectEngineerInStore)
		).subscribe((response: QueryResultsModel) => {
			this.paginatorTotalSubject.next(response.totalCount);
			this.entitySubject.next(response.items);
		});
	}
}
