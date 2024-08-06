// RxJS
import { of } from 'rxjs';
import { catchError, finalize, tap, debounceTime, delay, distinctUntilChanged } from 'rxjs/operators';
// NGRX
import { Store, select } from '@ngrx/store';
// CRUD
import { BaseDataSource, QueryResultsModel } from '../_base/crud';
// State
import { AppState } from '../../core/reducers';
import { selectRentalbillingInStore, selectRentalbillingPageLoading, selectRentalbillingShowInitWaitingMessage } from './rentalbilling.selector';


export class RentalbillingDataSource extends BaseDataSource {
	constructor(private store: Store<AppState>) {
		super();

		this.loading$ = this.store.pipe(
			select(selectRentalbillingPageLoading)
		);

		this.isPreloadTextViewed$ = this.store.pipe(
			select(selectRentalbillingShowInitWaitingMessage)
		);

		this.store.pipe(
			select(selectRentalbillingInStore)
		).subscribe((response: QueryResultsModel) => {
			this.paginatorTotalSubject.next(response.totalCount);
			this.entitySubject.next(response.items);
		});
	}
}
