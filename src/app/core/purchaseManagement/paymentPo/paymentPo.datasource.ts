import { Store, select } from '@ngrx/store';
import { BaseDataSource, QueryResultsModel } from '../../_base/crud';
import { AppState } from '../../reducers';
import { selectPaymentPoInStore, selectPaymentPoPageLoading, selectPaymentPoShowInitWaitingMessage } from './paymentPo.selector';


export class PaymentPoDataSource extends BaseDataSource {
	constructor(private store: Store<AppState>) {
		super();

		this.loading$ = this.store.pipe(
			select(selectPaymentPoPageLoading)
		);

		this.isPreloadTextViewed$ = this.store.pipe(
			select(selectPaymentPoShowInitWaitingMessage)
		);

		this.store.pipe(
			select(selectPaymentPoInStore)
		).subscribe((response: QueryResultsModel) => {
			this.paginatorTotalSubject.next(response.totalCount);
			this.entitySubject.next(response.items);
		});
	}
}
