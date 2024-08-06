// NGRX
import { Store, select } from '@ngrx/store';
// CRUD
import { BaseDataSourceUpd, QueryResultsModelUpd } from '../_base/crud-upd';
// State
import { AppState } from '../reducers';
import { selectBillingInStore, selectBillingPageLoading, selectBillingShowInitWaitingMessage } from './billing.selector';

export class BillingDatasource extends BaseDataSourceUpd {
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
		).subscribe((response: QueryResultsModelUpd) => {
			this.paginatorTotalSubject.next(response.totalCount);
			this.entitySubject.next(response.items);
		});
	}
}
