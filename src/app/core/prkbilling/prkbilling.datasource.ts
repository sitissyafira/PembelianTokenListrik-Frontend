// RxJS
import { of } from 'rxjs';
import { catchError, finalize, tap, debounceTime, delay, distinctUntilChanged } from 'rxjs/operators';
// NGRX
import { Store, select } from '@ngrx/store';
// CRUD
import { BaseDataSource, QueryResultsModel } from '../_base/crud';
// State
import { AppState } from '../../core/reducers';
import { selectPrkbillingInStore, selectPrkbillingPageLoading, selectPrkbillingShowInitWaitingMessage } from './prkbilling.selector';


export class PrkbillingDataSource extends BaseDataSource {
	constructor(private store: Store<AppState>) {
		super();

		this.loading$ = this.store.pipe(
			select(selectPrkbillingPageLoading)
		);

		this.isPreloadTextViewed$ = this.store.pipe(
			select(selectPrkbillingShowInitWaitingMessage)
		);

		this.store.pipe(
			select(selectPrkbillingInStore)
		).subscribe((response: QueryResultsModel) => {
			this.paginatorTotalSubject.next(response.totalCount);
			this.entitySubject.next(response.items);
		});
	}
}
