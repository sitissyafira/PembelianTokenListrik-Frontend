// RxJS
import { of } from 'rxjs';
import { catchError, finalize, tap, debounceTime, delay, distinctUntilChanged } from 'rxjs/operators';
// NGRX
import { Store, select } from '@ngrx/store';
// CRUD
import { BaseDataSource, QueryResultsModel } from '../_base/crud';
// State
import { AppState } from '../../core/reducers';
import { selectRenterInStore, selectRenterPageLoading, selectRenterShowInitWaitingMessage } from './renter.selector';


export class RenterDataSource extends BaseDataSource {
	constructor(private store: Store<AppState>) {
		super();

		this.loading$ = this.store.pipe(
			select(selectRenterPageLoading)
		);

		this.isPreloadTextViewed$ = this.store.pipe(
			select(selectRenterShowInitWaitingMessage)
		);

		this.store.pipe(
			select(selectRenterInStore)
		).subscribe((response: QueryResultsModel) => {
			this.paginatorTotalSubject.next(response.totalCount);
			this.entitySubject.next(response.items);
		});
	}
}
