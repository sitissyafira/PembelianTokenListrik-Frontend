import { Store, select } from '@ngrx/store';
import { BaseDataSource, QueryResultsModel } from '../../_base/crud';
import { AppState } from '../../../core/reducers';
import { selectStockOutInStore, selectStockOutPageLoading, selectStockOutShowInitWaitingMessage } from './stockOut.selector';


export class StockOutDataSource extends BaseDataSource {
	constructor(private store: Store<AppState>) {
		super();

		this.loading$ = this.store.pipe(
			select(selectStockOutPageLoading)
		);

		this.isPreloadTextViewed$ = this.store.pipe(
			select(selectStockOutShowInitWaitingMessage)
		);

		this.store.pipe(
			select(selectStockOutInStore)
		).subscribe((response: QueryResultsModel) => {
			this.paginatorTotalSubject.next(response.totalCount);
			this.entitySubject.next(response.items);
		});
	}
}
