import { Store, select } from '@ngrx/store';
import { BaseDataSource, QueryResultsModel } from '../../_base/crud';
import { AppState } from '../../reducers';
import { selectTabulationInStore, selectTabulationPageLoading, selectTabulationShowInitWaitingMessage } from './tabulation.selector';


export class TabulationDataSource extends BaseDataSource {
	constructor(private store: Store<AppState>) {
		super();

		this.loading$ = this.store.pipe(
			select(selectTabulationPageLoading)
		);

		this.isPreloadTextViewed$ = this.store.pipe(
			select(selectTabulationShowInitWaitingMessage)
		);

		this.store.pipe(
			select(selectTabulationInStore)
		).subscribe((response: QueryResultsModel) => {
			this.paginatorTotalSubject.next(response.totalCount);
			this.entitySubject.next(response.items);
		});
	}
}
