// RxJS
import { of } from 'rxjs';
import { catchError, finalize, tap, debounceTime, delay, distinctUntilChanged } from 'rxjs/operators';
// NGRX
import { Store, select } from '@ngrx/store';
// CRUD
import { BaseDataSource, QueryResultsModel } from '../_base/crud';
// State
import { AppState } from '../../core/reducers';
import { selectPinaltyInStore, selectPinaltyPageLoading, selectPinaltyShowInitWaitingMessage } from './pinalty.selector';


export class PinaltyDataSource extends BaseDataSource {
	constructor(private store: Store<AppState>) {
		super();

		this.loading$ = this.store.pipe(
			select(selectPinaltyPageLoading)
		);

		this.isPreloadTextViewed$ = this.store.pipe(
			select(selectPinaltyShowInitWaitingMessage)
		);

		this.store.pipe(
			select(selectPinaltyInStore)
		).subscribe((response: QueryResultsModel) => {
			this.paginatorTotalSubject.next(response.totalCount);
			this.entitySubject.next(response.items);
		});
	}
}
