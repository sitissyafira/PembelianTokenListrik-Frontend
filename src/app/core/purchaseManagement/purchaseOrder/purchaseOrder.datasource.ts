import { Store, select } from '@ngrx/store';
import { BaseDataSource, QueryResultsModel } from '../../_base/crud';
import { AppState } from '../../../core/reducers';
import { selectPurchaseOrderInStore, selectPurchaseOrderPageLoading, selectPurchaseOrderShowInitWaitingMessage } from './purchaseOrder.selector';


export class PurchaseOrderDataSource extends BaseDataSource {
	constructor(private store: Store<AppState>) {
		super();

		this.loading$ = this.store.pipe(
			select(selectPurchaseOrderPageLoading)
		);

		this.isPreloadTextViewed$ = this.store.pipe(
			select(selectPurchaseOrderShowInitWaitingMessage)
		);

		this.store.pipe(
			select(selectPurchaseOrderInStore)
		).subscribe((response: QueryResultsModel) => {
			this.paginatorTotalSubject.next(response.totalCount);
			this.entitySubject.next(response.items);
		});
	}
}
