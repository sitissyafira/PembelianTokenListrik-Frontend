import { Store, select } from '@ngrx/store';
import { BaseDataSource, QueryResultsModel } from '../../_base/crud';
import { AppState } from '../../../core/reducers';
import { selectStockInInStore, selectStockInPageLoading, selectStockInShowInitWaitingMessage } from './stockIn.selector';


export class StockInDataSource extends BaseDataSource {
	constructor(private store: Store<AppState>) {
		super();

		this.loading$ = this.store.pipe(
			select(selectStockInPageLoading)
		);

		this.isPreloadTextViewed$ = this.store.pipe(
			select(selectStockInShowInitWaitingMessage)
		);

		this.store.pipe(
			select(selectStockInInStore)
		).subscribe((response: QueryResultsModel) => {
			this.paginatorTotalSubject.next(response.totalCount);
			this.entitySubject.next(response.items);
		});
	}
}
