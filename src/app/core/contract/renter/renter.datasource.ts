// RxJS
import { of } from 'rxjs';
import { catchError, finalize, tap, debounceTime, delay, distinctUntilChanged } from 'rxjs/operators';
// NGRX
import { Store, select } from '@ngrx/store';
// CRUD
import { BaseDataSource, QueryResultsModel } from '../../_base/crud';
// State
import { AppState } from '../../../core/reducers';
import { selectRenterContractInStore, selectRenterContractPageLoading, selectRenterContractShowInitWaitingMessage } from './renter.selector';


export class RenterContractDataSource extends BaseDataSource {
	constructor(private store: Store<AppState>) {
		super();

		this.loading$ = this.store.pipe(
			select(selectRenterContractPageLoading)
		);

		this.isPreloadTextViewed$ = this.store.pipe(
			select(selectRenterContractShowInitWaitingMessage)
		);

		this.store.pipe(
			select(selectRenterContractInStore)
		).subscribe((response: QueryResultsModel) => {
			this.paginatorTotalSubject.next(response.totalCount);
			this.entitySubject.next(response.items);
		});
	}
}
