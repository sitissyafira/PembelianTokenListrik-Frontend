// RxJS
import { of } from 'rxjs';
import { catchError, finalize, tap, debounceTime, delay, distinctUntilChanged } from 'rxjs/operators';
// NGRX
import { Store, select } from '@ngrx/store';
// CRUD
import { BaseDataSource, QueryResultsModel } from '../../_base/crud';
// State
import { AppState } from '../../../core/reducers';
import { selectVisitorInStore, selectVisitorPageLoading, selectVisitorShowInitWaitingMessage } from './visitor.selector';


export class VisitorDataSource extends BaseDataSource {
	constructor(private store: Store<AppState>) {
		super();

		this.loading$ = this.store.pipe(
			select(selectVisitorPageLoading)
		);

		this.isPreloadTextViewed$ = this.store.pipe(
			select(selectVisitorShowInitWaitingMessage)
		);

		this.store.pipe(
			select(selectVisitorInStore)
		).subscribe((response: QueryResultsModel) => {
			this.paginatorTotalSubject.next(response.totalCount);
			this.entitySubject.next(response.items);
		});
	}
}
