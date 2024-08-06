import { Store, select } from '@ngrx/store';
import { BaseDataSource, QueryResultsModel } from '../../_base/crud';
import { AppState } from '../../reducers';
import { selectPoReceiptInStore, selectPoReceiptPageLoading, selectPoReceiptShowInitWaitingMessage } from './poReceipt.selector';


export class PoReceiptDataSource extends BaseDataSource {
	constructor(private store: Store<AppState>) {
		super();

		this.loading$ = this.store.pipe(
			select(selectPoReceiptPageLoading)
		);

		this.isPreloadTextViewed$ = this.store.pipe(
			select(selectPoReceiptShowInitWaitingMessage)
		);

		this.store.pipe(
			select(selectPoReceiptInStore)
		).subscribe((response: QueryResultsModel) => {
			this.paginatorTotalSubject.next(response.totalCount);
			this.entitySubject.next(response.items);
		});
	}
}
