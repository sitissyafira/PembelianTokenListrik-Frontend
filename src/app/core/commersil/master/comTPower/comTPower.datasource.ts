import { Store, select } from '@ngrx/store';
import { BaseDataSource, QueryResultsModel } from '../../../_base/crud';
import { AppState } from '../../../../core/reducers';
import { selectComTPowerInStore, selectComTPowerPageLoading, selectComTPowerShowInitWaitingMessage } from './comTPower.selector';


export class ComTPowerDataSource extends BaseDataSource {
	constructor(private store: Store<AppState>) {
		super();

		this.loading$ = this.store.pipe(
			select(selectComTPowerPageLoading)
		);

		this.isPreloadTextViewed$ = this.store.pipe(
			select(selectComTPowerShowInitWaitingMessage)
		);

		this.store.pipe(
			select(selectComTPowerInStore)
		).subscribe((response: QueryResultsModel) => {
			this.paginatorTotalSubject.next(response.totalCount);
			this.entitySubject.next(response.items);
		});
	}
}
