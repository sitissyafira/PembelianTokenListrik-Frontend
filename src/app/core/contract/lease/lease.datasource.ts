// RxJS
import { of } from 'rxjs';
import { catchError, finalize, tap, debounceTime, delay, distinctUntilChanged } from 'rxjs/operators';
// NGRX
import { Store, select } from '@ngrx/store';
// CRUD
import { BaseDataSource, QueryResultsModel } from '../../_base/crud';
// State
import { AppState } from '../../../core/reducers';
import { selectLeaseContractInStore, selectLeaseContractPageLoading, selectLeaseContractShowInitWaitingMessage } from './lease.selector';


export class LeaseContractDataSource extends BaseDataSource {
	constructor(private store: Store<AppState>) {
		super();

		this.loading$ = this.store.pipe(
			select(selectLeaseContractPageLoading)
		);

		this.isPreloadTextViewed$ = this.store.pipe(
			select(selectLeaseContractShowInitWaitingMessage)
		);

		this.store.pipe(
			select(selectLeaseContractInStore)
		).subscribe((response: QueryResultsModel) => {
			this.paginatorTotalSubject.next(response.totalCount);
			this.entitySubject.next(response.items);
		});
	}
}
