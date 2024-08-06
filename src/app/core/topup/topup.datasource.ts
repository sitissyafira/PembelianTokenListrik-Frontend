// NGRX
import { Store, select } from '@ngrx/store';
// CRUD
import { BaseDataSource, QueryResultsModel } from '../_base/crud';
// State
import { AppState } from '../reducers';
import { selectTopUpInStore, selectTopUpPageLoading, selectTopUpShowInitWaitingMessage } from './topup.selector';

export class TopUpDatasource extends BaseDataSource {
	constructor(private store: Store<AppState>) {
		super();

		this.loading$ = this.store.pipe(
			select(selectTopUpPageLoading)
		);

		this.isPreloadTextViewed$ = this.store.pipe(
			select(selectTopUpShowInitWaitingMessage)
		);

		this.store.pipe(
			select(selectTopUpInStore)
		).subscribe((response: QueryResultsModel) => {
			this.paginatorTotalSubject.next(response.totalCount);
			this.entitySubject.next(response.items);
		});
	}
}
