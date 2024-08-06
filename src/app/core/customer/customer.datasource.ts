// RxJS
import { of } from 'rxjs';
import { catchError, finalize, tap, debounceTime, delay, distinctUntilChanged } from 'rxjs/operators';
// NGRX
import { Store, select } from '@ngrx/store';
// CRUD
import { BaseDataSource, QueryResultsModel } from '../_base/crud';
// State
import { AppState } from '../../core/reducers';
import { selectCustomerInStore, selectCustomerPageLoading, selectCustomerShowInitWaitingMessage } from './customer.selector';


export class CustomerDataSource extends BaseDataSource {
	constructor(private store: Store<AppState>) {
		super();

		this.loading$ = this.store.pipe(
			select(selectCustomerPageLoading)
		);

		this.isPreloadTextViewed$ = this.store.pipe(
			select(selectCustomerShowInitWaitingMessage)
		);

		this.store.pipe(
			select(selectCustomerInStore)
		).subscribe((response: QueryResultsModel) => {
			this.paginatorTotalSubject.next(response.totalCount);
			this.entitySubject.next(response.items);
		});
	}
}
