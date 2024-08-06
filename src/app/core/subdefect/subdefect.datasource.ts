// RxJS
import { of } from 'rxjs';
import { catchError, finalize, tap, debounceTime, delay, distinctUntilChanged } from 'rxjs/operators';
// NGRX
import { Store, select } from '@ngrx/store';
// CRUD
import { BaseDataSource, QueryResultsModel } from '../_base/crud';
// State
import { AppState } from '../../core/reducers';
import { selectSubdefectInStore, selectSubdefectPageLoading, selectSubdefectShowInitWaitingMessage } from './subdefect.selector';


export class SubdefectDataSource extends BaseDataSource {
	constructor(private store: Store<AppState>) {
		super();

		this.loading$ = this.store.pipe(
			select(selectSubdefectPageLoading)
		);

		this.isPreloadTextViewed$ = this.store.pipe(
			select(selectSubdefectShowInitWaitingMessage)
		);

		this.store.pipe(
			select(selectSubdefectInStore)
		).subscribe((response: QueryResultsModel) => {
			this.paginatorTotalSubject.next(response.totalCount);
			this.entitySubject.next(response.items);
		});
	}
}
