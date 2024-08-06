// RxJS
import { of } from 'rxjs';
import { catchError, finalize, tap, debounceTime, delay, distinctUntilChanged } from 'rxjs/operators';
// NGRX
import { Store, select } from '@ngrx/store';
// CRUD
import { BaseDataSource, QueryResultsModel } from '../_base/crud';
// State
import { AppState } from '../reducers';
import { selectAbsensiInStore, selectAbsensiPageLoading, selectAbsensiShowInitWaitingMessage } from './absensi.selector';


export class AbsensiDataSource extends BaseDataSource {
	constructor(private store: Store<AppState>) {
		super();

		this.loading$ = this.store.pipe(
			select(selectAbsensiPageLoading)
		);

		this.isPreloadTextViewed$ = this.store.pipe(
			select(selectAbsensiShowInitWaitingMessage)
		);

		this.store.pipe(
			select(selectAbsensiInStore)
		).subscribe((response: QueryResultsModel) => {
			this.paginatorTotalSubject.next(response.totalCount);
			this.entitySubject.next(response.items);
		});
	}
}
