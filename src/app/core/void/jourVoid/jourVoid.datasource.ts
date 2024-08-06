// NGRX
import { Store, select } from '@ngrx/store';
// CRUD
import { BaseDataSource, QueryResultsModel } from '../../_base/crud';
// State
import { AppState } from '../../reducers';
import { selectJourVoidInStore, selectJourVoidPageLoading, selectJourVoidShowInitWaitingMessage } from './jourVoid.selector';


export class JourVoidDataSource extends BaseDataSource {
	constructor(private store: Store<AppState>) {
		super();

		this.loading$ = this.store.pipe(
			select(selectJourVoidPageLoading)
		);

		this.isPreloadTextViewed$ = this.store.pipe(
			select(selectJourVoidShowInitWaitingMessage)
		);

		this.store.pipe(
			select(selectJourVoidInStore)
		).subscribe((response: QueryResultsModel) => {
			this.paginatorTotalSubject.next(response.totalCount);
			this.entitySubject.next(response.items);
		});
	}
}
