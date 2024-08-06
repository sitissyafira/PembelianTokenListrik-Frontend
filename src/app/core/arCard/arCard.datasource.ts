// NGRX
import { Store, select } from '@ngrx/store';
// CRUD
import { BaseDataSource, QueryResultsModel } from '../_base/crud';
// State
import { AppState } from '../reducers';
import { selectArCardInStore, selectArCardPageLoading, selectArCardShowInitWaitingMessage } from './arCard.selector';


export class ArCardDataSource extends BaseDataSource {
	constructor(private store: Store<AppState>) {
		super();

		this.loading$ = this.store.pipe(
			select(selectArCardPageLoading)
		);

		this.isPreloadTextViewed$ = this.store.pipe(
			select(selectArCardShowInitWaitingMessage)
		);

		this.store.pipe(
			select(selectArCardInStore)
		).subscribe((response: QueryResultsModel) => {
			this.paginatorTotalSubject.next(response.totalCount);
			this.entitySubject.next(response.items);
		});
	}
}
