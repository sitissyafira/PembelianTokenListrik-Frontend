// RxJS
import { of } from 'rxjs';
import { catchError, finalize, tap, debounceTime, delay, distinctUntilChanged } from 'rxjs/operators';
// NGRX
import { Store, select } from '@ngrx/store';
// CRUD
import { BaseDataSource, QueryResultsModel } from '../../../_base/crud';
// State
import { AppState } from '../../../reducers';
import { selectWriteOffInStore, selectWriteOffPageLoading, selectWriteOffShowInitWaitingMessage } from './writeOff.selector';


export class WriteOffDataSource extends BaseDataSource {
	constructor(private store: Store<AppState>) {
		super();

		this.loading$ = this.store.pipe(
			select(selectWriteOffPageLoading)
		);

		this.isPreloadTextViewed$ = this.store.pipe(
			select(selectWriteOffShowInitWaitingMessage)
		);

		this.store.pipe(
			select(selectWriteOffInStore)
		).subscribe((response: QueryResultsModel) => {
			this.paginatorTotalSubject.next(response.totalCount);
			this.entitySubject.next(response.items);
		});
	}
}
