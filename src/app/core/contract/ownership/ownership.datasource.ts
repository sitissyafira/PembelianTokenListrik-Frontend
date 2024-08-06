// RxJS
import { of } from 'rxjs';
import { catchError, finalize, tap, debounceTime, delay, distinctUntilChanged } from 'rxjs/operators';
// NGRX
import { Store, select } from '@ngrx/store';
// CRUD
import { BaseDataSource, QueryResultsModel } from '../../_base/crud';
// State
import { AppState } from '../../../core/reducers';
import { selectOwnershipContractInStore, selectOwnershipContractPageLoading, selectOwnershipContractShowInitWaitingMessage } from './ownership.selector';

export class OwnershipContractDataSource extends BaseDataSource {
	constructor(private store: Store<AppState>) {
		super();

		this.loading$ = this.store.pipe(
			select(selectOwnershipContractPageLoading)
		);

		this.isPreloadTextViewed$ = this.store.pipe(
			select(selectOwnershipContractShowInitWaitingMessage)
		);

		this.store.pipe(
			select(selectOwnershipContractInStore)
		).subscribe((response: QueryResultsModel) => {
			this.paginatorTotalSubject.next(response.totalCount);
			this.entitySubject.next(response.items);
		});
	}
}
