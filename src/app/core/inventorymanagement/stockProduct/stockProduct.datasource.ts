import { Store, select } from '@ngrx/store';
import { BaseDataSource, QueryResultsModel } from '../../_base/crud';
import { AppState } from '../../../core/reducers';
import { selectStockProductInStore, selectStockProductPageLoading, selectStockProductShowInitWaitingMessage } from './stockProduct.selector';


export class StockProductDataSource extends BaseDataSource {
	constructor(private store: Store<AppState>) {
		super();

		this.loading$ = this.store.pipe(
			select(selectStockProductPageLoading)
		);

		this.isPreloadTextViewed$ = this.store.pipe(
			select(selectStockProductShowInitWaitingMessage)
		);

		this.store.pipe(
			select(selectStockProductInStore)
		).subscribe((response: QueryResultsModel) => {
			this.paginatorTotalSubject.next(response.totalCount);
			this.entitySubject.next(response.items);
		});
	}
}
