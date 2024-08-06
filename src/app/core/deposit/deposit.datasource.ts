// NGRX
import { Store, select } from '@ngrx/store';
// CRUD
import { BaseDataSource, QueryResultsModel } from '../_base/crud';
// State
import { AppState } from '../reducers';
import { selectDepositInStore, selectDepositPageLoading, selectDepositShowInitWaitingMessage } from './deposit.selector';


export class DepositDataSource extends BaseDataSource {
	constructor(private store: Store<AppState>) {
		super();

		this.loading$ = this.store.pipe(
			select(selectDepositPageLoading)
		);

		this.isPreloadTextViewed$ = this.store.pipe(
			select(selectDepositShowInitWaitingMessage)
		);

		this.store.pipe(
			select(selectDepositInStore)
		).subscribe((response: QueryResultsModel) => {
			this.paginatorTotalSubject.next(response.totalCount);
			this.entitySubject.next(response.items);
		});
	}
}
