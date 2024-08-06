// RxJS
import { of } from 'rxjs';
import { catchError, finalize, tap, debounceTime, delay, distinctUntilChanged } from 'rxjs/operators';
// NGRX
import { Store, select } from '@ngrx/store';
// CRUD
import { BaseDataSource, QueryResultsModel } from '../_base/crud';
// State
import { AppState } from '../reducers';
import { selectInspeksiInStore, selectInspeksiPageLoading, selectInspeksiShowInitWaitingMessage } from './inspeksi.selector';


export class InspeksiDataSource extends BaseDataSource {
	constructor(private store: Store<AppState>) {
		super();

		this.loading$ = this.store.pipe(
			select(selectInspeksiPageLoading)
		);

		this.isPreloadTextViewed$ = this.store.pipe(
			select(selectInspeksiShowInitWaitingMessage)
		);

		this.store.pipe(
			select(selectInspeksiInStore)
		).subscribe((response: QueryResultsModel) => {
			this.paginatorTotalSubject.next(response.totalCount);
			this.entitySubject.next(response.items);
		});
	}
}
