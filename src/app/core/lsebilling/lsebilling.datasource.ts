// RxJS
import { of } from 'rxjs';
import { catchError, finalize, tap, debounceTime, delay, distinctUntilChanged } from 'rxjs/operators';
// NGRX
import { Store, select } from '@ngrx/store';
// CRUD
import { BaseDataSource, QueryResultsModel } from '../_base/crud';
// State
import { AppState } from '../../core/reducers';
import { selectLsebillingInStore, selectLsebillingPageLoading, selectLsebillingShowInitWaitingMessage } from './lsebilling.selector';


export class LsebillingDataSource extends BaseDataSource {
	constructor(private store: Store<AppState>) {
		super();

		this.loading$ = this.store.pipe(
			select(selectLsebillingPageLoading)
		);

		this.isPreloadTextViewed$ = this.store.pipe(
			select(selectLsebillingShowInitWaitingMessage)
		);

		this.store.pipe(
			select(selectLsebillingInStore)
		).subscribe((response: QueryResultsModel) => {
			this.paginatorTotalSubject.next(response.totalCount);
			this.entitySubject.next(response.items);
		});
	}
}
