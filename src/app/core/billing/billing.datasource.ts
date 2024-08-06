// NGRX
import { Store, select } from '@ngrx/store';
// CRUD
import { BaseDataSource, QueryResultsModel } from '../_base/crud';
// State
import { AppState } from '../../core/reducers';
import { selectBillingInStore, selectBillingPageLoading, selectBillingShowInitWaitingMessage } from './billing.selector';

export class BillingDatasource extends BaseDataSource {
	constructor(private store: Store<AppState>) {
		super();

		this.loading$ = this.store.pipe(
			select(selectBillingPageLoading)
		);

		this.isPreloadTextViewed$ = this.store.pipe(
			select(selectBillingShowInitWaitingMessage)
		);

		this.store.pipe(
			select(selectBillingInStore)
		).subscribe((response: QueryResultsModel) => {
			this.paginatorTotalSubject.next(response.totalCount);
			this.entitySubject.next(response.items);
		});
	}
}
