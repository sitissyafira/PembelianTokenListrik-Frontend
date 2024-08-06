// NGRX
import { Store, select } from '@ngrx/store';
// CRUD
import { BaseDataSource, QueryResultsModel } from '../_base/crud';
// State
import { AppState } from '../../core/reducers';
import { selectTrGalonInStore, selectTrGalonPageLoading, selectTrGalonShowInitWaitingMessage } from './trGalon.selector';

export class TrGalonDatasource extends BaseDataSource {
	constructor(private store: Store<AppState>) {
		super();

		this.loading$ = this.store.pipe(
			select(selectTrGalonPageLoading)
		);

		this.isPreloadTextViewed$ = this.store.pipe(
			select(selectTrGalonShowInitWaitingMessage)
		);

		this.store.pipe(
			select(selectTrGalonInStore)
		).subscribe((response: QueryResultsModel) => {
			this.paginatorTotalSubject.next(response.totalCount);
			this.entitySubject.next(response.items);
		});
	}
}
