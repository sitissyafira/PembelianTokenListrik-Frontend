import { Store, select } from '@ngrx/store';
import { BaseDataSource, QueryResultsModel } from '../../_base/crud';
import { AppState } from '../../../core/reducers';
import { selectApInStore, selectApPageLoading, selectApShowInitWaitingMessage } from './ap.selector';


export class ApDataSource extends BaseDataSource {
	constructor(private store: Store<AppState>) {
		super();

		this.loading$ = this.store.pipe(
			select(selectApPageLoading)
		);

		this.isPreloadTextViewed$ = this.store.pipe(
			select(selectApShowInitWaitingMessage)
		);

		this.store.pipe(
			select(selectApInStore)
		).subscribe((response: QueryResultsModel) => {
			this.paginatorTotalSubject.next(response.totalCount);
			this.entitySubject.next(response.items);
		});
	}
}
