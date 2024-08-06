import { Store, select } from '@ngrx/store';
import { BaseDataSource, QueryResultsModel } from '../../_base/crud';
import { AppState } from '../../../core/reducers';
import { selectRequestStockOutInStore, selectRequestStockOutPageLoading, selectRequestStockOutShowInitWaitingMessage } from './requestStockOut.selector';


export class RequestStockOutDataSource extends BaseDataSource {
	constructor(private store: Store<AppState>) {
		super();

		this.loading$ = this.store.pipe(
			select(selectRequestStockOutPageLoading)
		);

		this.isPreloadTextViewed$ = this.store.pipe(
			select(selectRequestStockOutShowInitWaitingMessage)
		);

		this.store.pipe(
			select(selectRequestStockOutInStore)
		).subscribe((response: QueryResultsModel) => {
			this.paginatorTotalSubject.next(response.totalCount);
			this.entitySubject.next(response.items);
		});
	}
}
