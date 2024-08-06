// RxJS
import { of } from 'rxjs';
import { catchError, finalize, tap, debounceTime, delay, distinctUntilChanged } from 'rxjs/operators';
// NGRX
import { Store, select } from '@ngrx/store';
// CRUD
import { BaseDataSource, QueryResultsModel } from '../_base/crud';
// State
import { AppState } from '../reducers';
import { selectPosInStore, selectPosPageLoading, selectPosShowInitWaitingMessage } from './pos.selector';


export class PosDataSource extends BaseDataSource {
	constructor(private store: Store<AppState>) {
		super();

		this.loading$ = this.store.pipe(
			select(selectPosPageLoading)
		);

		this.isPreloadTextViewed$ = this.store.pipe(
			select(selectPosShowInitWaitingMessage)
		);

		this.store.pipe(
			select(selectPosInStore)
		).subscribe((response: QueryResultsModel) => {
			this.paginatorTotalSubject.next(response.totalCount);
			this.entitySubject.next(response.items);
		});
	}
}
