// RxJS
import { of } from 'rxjs';
import { catchError, finalize, tap, debounceTime, delay, distinctUntilChanged } from 'rxjs/operators';
// NGRX
import { Store, select } from '@ngrx/store';
// CRUD
import { BaseDataSource, QueryResultsModel } from '../_base/crud';
// State
import { AppState } from '../../core/reducers';
import { selectCashbInStore, selectCashbPageLoading, selectCashbShowInitWaitingMessage } from './cashb.selector';


export class CashbDataSource extends BaseDataSource {
	constructor(private store: Store<AppState>) {
		super();

		this.loading$ = this.store.pipe(
			select(selectCashbPageLoading)
		);

		this.isPreloadTextViewed$ = this.store.pipe(
			select(selectCashbShowInitWaitingMessage)
		);

		this.store.pipe(
			select(selectCashbInStore)
		).subscribe((response: QueryResultsModel) => {
			this.paginatorTotalSubject.next(response.totalCount);
			this.entitySubject.next(response.items);
		});
	}
}
