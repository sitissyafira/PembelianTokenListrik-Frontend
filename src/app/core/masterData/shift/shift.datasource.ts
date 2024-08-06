// RxJS
import { of } from 'rxjs';
import { catchError, finalize, tap, debounceTime, delay, distinctUntilChanged } from 'rxjs/operators';
// NGRX
import { Store, select } from '@ngrx/store';
// CRUD
import { BaseDataSource, QueryResultsModel } from '../../_base/crud';
// State
import { AppState } from '../../reducers';
import { selectShiftInStore, selectShiftPageLoading, selectShiftShowInitWaitingMessage } from './shift.selector';


export class ShiftDataSource extends BaseDataSource {
	constructor(private store: Store<AppState>) {
		super();

		this.loading$ = this.store.pipe(
			select(selectShiftPageLoading)
		);

		this.isPreloadTextViewed$ = this.store.pipe(
			select(selectShiftShowInitWaitingMessage)
		);

		this.store.pipe(
			select(selectShiftInStore)
		).subscribe((response: QueryResultsModel) => {
			this.paginatorTotalSubject.next(response.totalCount);
			this.entitySubject.next(response.items);
		});
	}
}
