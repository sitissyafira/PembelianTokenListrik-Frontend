import { Store, select } from '@ngrx/store';
import { BaseDataSource, QueryResultsModel } from '../../_base/crud';
import { AppState } from '../../../core/reducers';
import { selectPurchaseRequestInStore, selectPurchaseRequestPageLoading, selectPurchaseRequestShowInitWaitingMessage } from './purchaseRequest.selector';


export class PurchaseRequestDataSource extends BaseDataSource {
	constructor(private store: Store<AppState>) {
		super();

		this.loading$ = this.store.pipe(
			select(selectPurchaseRequestPageLoading)
		);

		this.isPreloadTextViewed$ = this.store.pipe(
			select(selectPurchaseRequestShowInitWaitingMessage)
		);

		this.store.pipe(
			select(selectPurchaseRequestInStore)
		).subscribe((response: QueryResultsModel) => {
			this.paginatorTotalSubject.next(response.totalCount);
			this.entitySubject.next(response.items);
		});
	}
}
